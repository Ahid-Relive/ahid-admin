// hooks/useBrandUpload.ts
import { useCallback, useMemo, useRef, useState } from 'react';
import { parseUploadedFile } from '../utils/csv';
import { validateBulkRow, rowsToPayload } from '../utils/validators';
import { geocodeRows } from '../utils/geocoding';
import type { BulkUploadRow, BulkUploadResult, DuplicateStrategy } from '../types/brand.types';

export type WizardStep = 'upload' | 'preview' | 'duplicates' | 'geocoding' | 'importing' | 'results';

interface UseBrandUploadOptions {
  /** Existing brand emails already in the system, used for duplicate detection */
  existingEmails: string[];
  /** The actual mutation call — kept generic so this hook doesn't depend on a specific RTK Query setup */
  bulkCreate: (payload: { brands: ReturnType<typeof rowsToPayload> }) => Promise<{
    data?: { data: { created: any[]; skipped: string[]; errors: { index: number; errors: string[] }[] } };
    error?: any;
  }>;
}

const CHUNK_SIZE = 100; // backend max per request

export function useBrandUpload({ existingEmails, bulkCreate }: UseBrandUploadOptions) {
  const [step, setStep] = useState<WizardStep>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<BulkUploadRow[]>([]);
  // Mirror of `rows` kept in a ref so async callbacks (runImport) always read
  // the latest value even when called before React has re-rendered after setRows.
  const rowsRef = useRef<BulkUploadRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy | null>(null);
  const [geocodeProgress, setGeocodeProgress] = useState({ done: 0, total: 0 });
  const [importProgress, setImportProgress] = useState({ done: 0, total: 0 });
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validRows = useMemo(() => rows.filter((r) => r.isValid && !r.isDuplicate), [rows]);
  const invalidRows = useMemo(() => rows.filter((r) => !r.isValid), [rows]);
  const duplicateRows = useMemo(() => rows.filter((r) => r.isDuplicate), [rows]);

  const setRowsAndRef = useCallback((next: BulkUploadRow[]) => {
    rowsRef.current = next;
    setRows(next);
  }, []);

  const reset = useCallback(() => {
    setStep('upload');
    setFileName(null);
    setRowsAndRef([]);
    setParseErrors([]);
    setDuplicateStrategy(null);
    setGeocodeProgress({ done: 0, total: 0 });
    setImportProgress({ done: 0, total: 0 });
    setResult(null);
    setIsProcessing(false);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      setFileName(file.name);
      const { rows: rawRows, errors } = await parseUploadedFile(file);
      setParseErrors(errors);

      const seenInFile = new Set<string>();
      const existingSet = new Set(existingEmails.map((e) => e.toLowerCase()));

      const validated = rawRows.map((raw, i) => {
        const row = validateBulkRow(raw, i + 1);
        const emailLower = row.brandEmail.toLowerCase();
        const isDuplicate =
          (emailLower.length > 0 && seenInFile.has(emailLower)) || existingSet.has(emailLower);
        if (emailLower) seenInFile.add(emailLower);
        return { ...row, isDuplicate };
      });

      setRowsAndRef(validated);
      setIsProcessing(false);
      setStep(validated.some((r) => r.isDuplicate) ? 'duplicates' : 'preview');
    },
    [existingEmails, setRowsAndRef]
  );

  const resolveDuplicates = useCallback(
    (strategy: DuplicateStrategy) => {
      setDuplicateStrategy(strategy);
      if (strategy === 'cancel') {
        reset();
        return;
      }
      if (strategy === 'skip') {
        // duplicates simply get excluded from validRows already — nothing to mutate
      }
      // 'replace' is recorded but actual replace-vs-create logic happens server-side
      // when the backend sees an existing email; we surface intent in the summary only.
      setStep('preview');
    },
    [reset]
  );

  const runGeocoding = useCallback(async () => {
    const rowsNeedingGeo = validRows.filter((r) => !r.longitude || !r.latitude);
    if (rowsNeedingGeo.length === 0) {
      return true;
    }
    setStep('geocoding');
    setGeocodeProgress({ done: 0, total: rowsNeedingGeo.length });

    const geocoded = await geocodeRows(validRows, (done, total) => setGeocodeProgress({ done, total }));

    // Merge geocoded coordinates + capture any geocoding failures as validation errors
    const byRowIndex = new Map(geocoded.map((g) => [g.row.rowIndex, g]));
    const merged = rows.map((row) => {
      const g = byRowIndex.get(row.rowIndex);
      if (!g) return row;
      if (g.error) {
        return {
          ...row,
          isValid: false,
          validationErrors: [...row.validationErrors, g.error],
        };
      }
      return { ...row, longitude: g.row.longitude, latitude: g.row.latitude };
    });

    setRowsAndRef(merged);
    return true;
  }, [rows, validRows, setRowsAndRef]);

  const runImport = useCallback(async () => {
    setStep('importing');
    setIsProcessing(true);

    // Use the ref so we always read rows updated by runGeocoding, even when
    // called before React has re-rendered and refreshed the closure.
    const toImport = rowsRef.current.filter((r) => r.isValid && !(r.isDuplicate && duplicateStrategy === 'skip'));
    const chunks: BulkUploadRow[][] = [];
    for (let i = 0; i < toImport.length; i += CHUNK_SIZE) {
      chunks.push(toImport.slice(i, i + CHUNK_SIZE));
    }

    setImportProgress({ done: 0, total: toImport.length });

    let createdCount = 0;
    let skippedCount = 0;
    const errors: BulkUploadResult['errors'] = [];

    for (const chunk of chunks) {
      const payload = { brands: rowsToPayload(chunk) };
      try {
        const res = await bulkCreate(payload);
        if (res.error) {
          // whole chunk failed at the network/auth level
          chunk.forEach((row) =>
            errors.push({
              row: row.rowIndex,
              brandName: row.brandName,
              error: res.error?.data?.message ?? 'Request failed',
            })
          );
        } else if (res.data) {
          createdCount += res.data.data.created.length;
          skippedCount += res.data.data.skipped.length;
          res.data.data.errors.forEach((e) => {
            const row = chunk[e.index];
            errors.push({
              row: row?.rowIndex ?? e.index,
              brandName: row?.brandName ?? `Row ${e.index}`,
              error: e.errors.join(', '),
            });
          });
        }
      } catch (e: any) {
        chunk.forEach((row) =>
          errors.push({ row: row.rowIndex, brandName: row.brandName, error: e.message ?? 'Unknown error' })
        );
      }
      setImportProgress((p) => ({ ...p, done: Math.min(p.done + chunk.length, toImport.length) }));
    }

    setResult({
      createdCount,
      skippedCount,
      failedCount: errors.length,
      errors,
    });
    setIsProcessing(false);
    setStep('results');
  }, [duplicateStrategy, bulkCreate]);

  return {
    step,
    setStep,
    fileName,
    rows,
    parseErrors,
    validRows,
    invalidRows,
    duplicateRows,
    duplicateStrategy,
    geocodeProgress,
    importProgress,
    result,
    isProcessing,
    handleFile,
    resolveDuplicates,
    runGeocoding,
    runImport,
    reset,
  };
}
