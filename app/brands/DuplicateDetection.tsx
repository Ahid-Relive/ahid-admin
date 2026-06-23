// components/DuplicateDetection.tsx
'use client';

import { AlertTriangle } from 'lucide-react';
import type { BulkUploadRow, DuplicateStrategy } from './types/brand.types';

interface DuplicateDetectionProps {
  duplicateRows: BulkUploadRow[];
  onResolve: (strategy: DuplicateStrategy) => void;
}

export function DuplicateDetection({ duplicateRows, onResolve }: DuplicateDetectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            {duplicateRows.length} brand{duplicateRows.length === 1 ? '' : 's'} already exist
          </p>
          <p className="mt-0.5 text-xs text-amber-700">
            These emails match existing brands, or appear more than once in your file. Choose how to handle them.
          </p>
        </div>
      </div>

      <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">Row</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">Brand</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {duplicateRows.map((row) => (
              <tr key={row.rowIndex}>
                <td className="px-3 py-2 text-gray-400">{row.rowIndex}</td>
                <td className="px-3 py-2 text-gray-800">{row.brandName}</td>
                <td className="px-3 py-2 text-gray-600">{row.brandEmail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
        <button
          onClick={() => onResolve('cancel')}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel Import
        </button>
        <button
          onClick={() => onResolve('skip')}
          className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
        >
          Skip Duplicates
        </button>
        <button
          onClick={() => onResolve('replace')}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Continue Anyway
        </button>
      </div>
    </div>
  );
}
