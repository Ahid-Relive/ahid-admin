// components/UploadResults.tsx
'use client';

import { CheckCircle2, XCircle, SkipForward, Download } from 'lucide-react';
import { downloadErrorReport } from './utils/csv';
import type { BulkUploadResult } from './types/brand.types';

interface UploadResultsProps {
  result: BulkUploadResult;
  onClose: () => void;
  onUploadAnother: () => void;
}

export function UploadResults({ result, onClose, onUploadAnother }: UploadResultsProps) {
  const { createdCount, skippedCount, failedCount, errors } = result;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3">
        <ResultCard icon={CheckCircle2} label="Created" value={createdCount} tone="success" />
        <ResultCard icon={SkipForward} label="Skipped" value={skippedCount} tone="neutral" />
        <ResultCard icon={XCircle} label="Failed" value={failedCount} tone="danger" />
      </div>

      {errors.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-900">Errors</h4>
            <button
              onClick={() => downloadErrorReport(errors)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <Download className="h-3.5 w-3.5" />
              Download Error Report
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500">Row</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500">Brand</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-500">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {errors.map((e, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-gray-400">{e.row}</td>
                    <td className="px-3 py-2 text-gray-800">{e.brandName}</td>
                    <td className="px-3 py-2 text-red-600">{e.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Fix the issues above and re-upload just those rows to complete the import.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          onClick={onUploadAnother}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Upload Another File
        </button>
        <button
          onClick={onClose}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: 'success' | 'neutral' | 'danger';
}) {
  const toneClasses = {
    success: 'bg-green-50 text-green-700',
    neutral: 'bg-gray-50 text-gray-700',
    danger: 'bg-red-50 text-red-700',
  }[tone];
  return (
    <div className={`rounded-xl p-4 text-center ${toneClasses}`}>
      <Icon className="mx-auto mb-1 h-5 w-5" />
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}
