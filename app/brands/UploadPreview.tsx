// components/UploadPreview.tsx
'use client';

import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { BulkUploadRow } from '../types/brand.types';

interface UploadPreviewProps {
  rows: BulkUploadRow[];
  maxRowsShown?: number;
}

export function UploadPreview({ rows, maxRowsShown = 50 }: UploadPreviewProps) {
  const validCount = rows.filter((r) => r.isValid && !r.isDuplicate).length;
  const invalidCount = rows.filter((r) => !r.isValid).length;
  const duplicateCount = rows.filter((r) => r.isDuplicate).length;
  const visibleRows = rows.slice(0, maxRowsShown);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <SummaryPill label="Total Records" value={rows.length} tone="neutral" />
        <SummaryPill label="Valid" value={validCount} tone="success" />
        <SummaryPill label="Issues" value={invalidCount + duplicateCount} tone="danger" />
      </div>

      <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">#</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">Brand</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">Email</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">Country</th>
              <th className="px-3 py-2 text-left font-semibold text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visibleRows.map((row) => (
              <tr key={row.rowIndex} className={row.isValid && !row.isDuplicate ? '' : 'bg-red-50/40'}>
                <td className="px-3 py-2 text-gray-400">{row.rowIndex}</td>
                <td className="px-3 py-2 text-gray-800">{row.brandName || '—'}</td>
                <td className="px-3 py-2 text-gray-600">{row.brandEmail || '—'}</td>
                <td className="px-3 py-2 text-gray-600">{row.country || '—'}</td>
                <td className="px-3 py-2">
                  {row.isDuplicate ? (
                    <StatusBadge icon={AlertTriangle} text="Duplicate" tone="warning" />
                  ) : row.isValid ? (
                    <StatusBadge icon={CheckCircle2} text="Valid" tone="success" />
                  ) : (
                    <StatusBadge
                      icon={XCircle}
                      text={row.validationErrors[0] ?? 'Invalid'}
                      tone="danger"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > maxRowsShown && (
        <p className="text-center text-xs text-gray-500">
          Showing first {maxRowsShown} of {rows.length} records
        </p>
      )}
    </div>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'neutral' | 'success' | 'danger';
}) {
  const toneClasses = {
    neutral: 'bg-gray-50 text-gray-700',
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-red-700',
  }[tone];
  return (
    <div className={`rounded-lg px-3 py-2 text-center ${toneClasses}`}>
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs">{label}</p>
    </div>
  );
}

function StatusBadge({
  icon: Icon,
  text,
  tone,
}: {
  icon: React.ElementType;
  text: string;
  tone: 'success' | 'danger' | 'warning';
}) {
  const toneClasses = {
    success: 'bg-green-50 text-green-700',
    danger: 'bg-red-50 text-red-700',
    warning: 'bg-amber-50 text-amber-700',
  }[tone];
  return (
    <span className={`inline-flex max-w-[180px] items-center gap-1 truncate rounded-full px-2 py-0.5 text-xs font-medium ${toneClasses}`}>
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate">{text}</span>
    </span>
  );
}
