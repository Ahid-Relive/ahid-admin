// components/BulkUploadModal.tsx
'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Download, FileSpreadsheet, Loader2, UploadCloud, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { downloadCsvTemplate, downloadXlsxTemplate } from '../utils/csv';
import { useBrandUpload } from '../hooks/useBrandUpload';
import { UploadPreview } from '../UploadPreview';
import { DuplicateDetection } from '../DuplicateDetection';
import { UploadResults } from '../UploadResults';
import type { rowsToPayload } from '../utils/validators';

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingEmails: string[];
  bulkCreate: (payload: { brands: ReturnType<typeof rowsToPayload> }) => Promise<{
    data?: { data: { created: any[]; skipped: string[]; errors: { index: number; errors: string[] }[] } };
    error?: any;
  }>;
  onImportComplete: () => void;
}

function UploadDropzone({ onFile, isProcessing }: { onFile: (file: File) => void; isProcessing: boolean }) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
        isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <input {...getInputProps()} />
      {isProcessing ? (
        <>
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm font-medium text-gray-700">Reading file...</p>
        </>
      ) : (
        <>
          <UploadCloud className="mb-3 h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Drag & drop your file here</p>
          <p className="mt-1 text-xs text-gray-500">or click to browse · CSV, XLSX, or JSON</p>
        </>
      )}
    </div>
  );
}

export function BulkUploadModal({
  isOpen,
  onClose,
  existingEmails,
  bulkCreate,
  onImportComplete,
}: BulkUploadModalProps) {
  const upload = useBrandUpload({ existingEmails, bulkCreate });

  const handleClose = () => {
    upload.reset();
    onClose();
  };

  const handleDone = () => {
    upload.reset();
    onClose();
    onImportComplete();
  };

  const handleProceedToImport = async () => {
    const ok = await upload.runGeocoding();
    if (ok) await upload.runImport();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Upload Brands" size="lg">
      <div className="space-y-5">
        {upload.step === 'upload' && (
          <>
            <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div>
                <p className="text-sm font-medium text-gray-900">Step 1 · Download the template</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Use this format so your file maps correctly to brand records.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={downloadCsvTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  CSV
                </button>
                <button
                  onClick={downloadXlsxTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5" />
                  XLSX
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-900">Step 2 · Upload your file</p>
              <UploadDropzone onFile={upload.handleFile} isProcessing={upload.isProcessing} />
              {upload.parseErrors.length > 0 && (
                <div className="mt-2 rounded-lg bg-red-50 p-3 text-xs text-red-700">
                  {upload.parseErrors.slice(0, 5).map((e, i) => (
                    <p key={i}>{e}</p>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {upload.step === 'duplicates' && (
          <DuplicateDetection duplicateRows={upload.duplicateRows} onResolve={upload.resolveDuplicates} />
        )}

        {upload.step === 'preview' && (
          <>
            <UploadPreview rows={upload.rows} />
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <button
                onClick={upload.reset}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Start Over
              </button>
              <button
                onClick={handleProceedToImport}
                disabled={upload.validRows.length === 0}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Import {upload.validRows.length} Brand{upload.validRows.length === 1 ? '' : 's'}
              </button>
            </div>
          </>
        )}

        {upload.step === 'geocoding' && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-gray-700">Looking up coordinates...</p>
            <p className="mt-1 text-xs text-gray-500">
              {upload.geocodeProgress.done} of {upload.geocodeProgress.total} addresses resolved
            </p>
            <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{
                  width: `${
                    upload.geocodeProgress.total
                      ? (upload.geocodeProgress.done / upload.geocodeProgress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {upload.step === 'importing' && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium text-gray-700">Creating brands...</p>
            <p className="mt-1 text-xs text-gray-500">
              {upload.importProgress.done} of {upload.importProgress.total}
            </p>
            <div className="mt-4 h-2 w-64 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{
                  width: `${
                    upload.importProgress.total
                      ? (upload.importProgress.done / upload.importProgress.total) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {upload.step === 'results' && upload.result && (
          <UploadResults result={upload.result} onClose={handleDone} onUploadAnother={upload.reset} />
        )}
      </div>
    </Modal>
  );
}
