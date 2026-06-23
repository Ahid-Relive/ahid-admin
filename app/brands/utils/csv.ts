// utils/csv.ts
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { BulkUploadRow } from '../types/brand.types';

export const TEMPLATE_HEADERS = [
  'brandName',
  'brandEmail',
  'country',
  'address',
  'category',
  'phone',
  'longitude',
  'latitude',
] as const;

const TEMPLATE_ROWS = [
  {
    brandName: 'Nike',
    brandEmail: 'contact@nike-lagos.com',
    country: 'Nigeria',
    address: '12 Admiralty Way, Lekki, Lagos',
    category: 'Fashion',
    phone: '+2348011111111',
    longitude: '3.458',
    latitude: '6.431',
  },
  {
    brandName: 'KFC',
    brandEmail: 'contact@kfc-wuse.com',
    country: 'Nigeria',
    address: 'Wuse 2, Abuja',
    category: 'Restaurant',
    phone: '+2348022222222',
    longitude: '',
    latitude: '',
  },
];

/** Triggers a browser download of the CSV template admins should fill in */
export function downloadCsvTemplate() {
  const csv = Papa.unparse({
    fields: [...TEMPLATE_HEADERS],
    data: TEMPLATE_ROWS,
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, 'ahid-brand-upload-template.csv');
}

/** Triggers a browser download of an XLSX template, for admins who prefer Excel */
export function downloadXlsxTemplate() {
  const ws = XLSX.utils.json_to_sheet(TEMPLATE_ROWS, { header: [...TEMPLATE_HEADERS] });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Brands');
  XLSX.writeFile(wb, 'ahid-brand-upload-template.xlsx');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type ParsedFileResult = {
  rows: Record<string, any>[];
  errors: string[];
};

/** Parses an uploaded CSV file into raw row objects */
function parseCsvFile(file: File): Promise<ParsedFileResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h:any) => h.trim(),
      complete: (results:any) => {
        resolve({
          rows: results.data as Record<string, any>[],
          errors: results.errors.map((e:any) => `Row ${e.row ?? '?'}: ${e.message}`),
        });
      },
      error: (err:any) => {
        resolve({ rows: [], errors: [err.message] });
      },
    });
  });
}

/** Parses an uploaded XLSX/XLS file into raw row objects using the first sheet */
async function parseXlsxFile(file: File): Promise<ParsedFileResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { rows: [], errors: ['Workbook contains no sheets'] };
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  return { rows, errors: [] };
}

/** Parses an uploaded JSON file. Accepts either a top-level array, or { brands: [...] } */
async function parseJsonFile(file: File): Promise<ParsedFileResult> {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.brands) ? parsed.brands : null;
    if (!rows) {
      return { rows: [], errors: ['JSON file must be an array of brands, or an object with a "brands" array'] };
    }
    return { rows, errors: [] };
  } catch (e) {
    return { rows: [], errors: ['Could not parse JSON file. Check that it is valid JSON.'] };
  }
}

/** Detects file type by extension and routes to the right parser */
export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return parseCsvFile(file);
  if (ext === 'xlsx' || ext === 'xls') return parseXlsxFile(file);
  if (ext === 'json') return parseJsonFile(file);
  return { rows: [], errors: [`Unsupported file type: .${ext}. Please upload a CSV, XLSX, or JSON file.`] };
}

/** Builds and downloads a CSV error report for rows that failed validation or import */
export function downloadErrorReport(
  failedRows: Array<{ row: number; brandName: string; error: string }>
) {
  const csv = Papa.unparse({
    fields: ['row', 'brandName', 'error'],
    data: failedRows,
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `ahid-import-errors-${Date.now()}.csv`);
}

/** Exports the current brands table to CSV */
export function exportBrandsToCsv(
  brands: Array<{ name: string; brand_email: string; main_address: { country: string; address: string }; isClaimed: boolean }>
) {
  const data = brands.map((b) => ({
    brandName: b.name,
    brandEmail: b.brand_email,
    country: b.main_address?.country ?? '',
    address: b.main_address?.address ?? '',
    claimed: b.isClaimed ? 'Yes' : 'No',
  }));
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `ahid-brands-export-${Date.now()}.csv`);
}
