// components/BrandFilters.tsx
'use client';

import { Search, Download, Plus, Upload, X, AlertCircle } from 'lucide-react';
import {
  SORT_OPTIONS,
  isRangeInverted,
  hasActiveFilters,
  type BrandListParams,
  type BrandSort,
} from '../utils/listQuery';

export interface BrandFilterState {
  search: string;
  country: string;
  claimStatus: 'all' | 'claimed' | 'pending';
}

interface BrandFiltersProps {
  filters: BrandFilterState;
  onChange: (filters: BrandFilterState) => void;
  countries: string[];
  onExport: () => void;
  onAddBrand: () => void;
  onBulkUpload: () => void;
  /** Server-side list options (sort + registration date range) */
  listParams: BrandListParams;
  onListChange: (patch: Partial<BrandListParams>) => void;
  onClearList: () => void;
  /** Message from a 400 response, shown next to the controls */
  serverError?: string | null;
}

const controlClass =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]';

export function BrandFilters({
  filters,
  onChange,
  countries,
  onExport,
  onAddBrand,
  onBulkUpload,
  listParams,
  onListChange,
  onClearList,
  serverError,
}: BrandFiltersProps) {
  const rangeInverted = isRangeInverted(listParams.from, listParams.to);
  const canClear =
    hasActiveFilters(listParams) || listParams.sort !== 'newest' || Boolean(filters.search || filters.country || filters.claimStatus !== 'all');

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-[var(--bg-card)] p-4 shadow-sm">
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
        Sort
        <select
          value={listParams.sort}
          onChange={(e) => onListChange({ sort: e.target.value as BrandSort })}
          className={controlClass}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-xs font-medium text-gray-500">Registered (UTC)</legend>
        <div className="flex flex-wrap items-center gap-2">
          {/* Native date inputs give the picked calendar day as YYYY-MM-DD; it is sent as-is (no toISOString). */}
          <input
            type="date"
            aria-label="Registered from (UTC)"
            value={listParams.from}
            max={listParams.to || undefined}
            onChange={(e) => onListChange({ from: e.target.value })}
            aria-invalid={rangeInverted}
            className={`${controlClass} ${rangeInverted ? 'border-red-500' : ''}`}
          />
          <span className="text-sm text-gray-400">to</span>
          <input
            type="date"
            aria-label="Registered to (UTC)"
            value={listParams.to}
            min={listParams.from || undefined}
            onChange={(e) => onListChange({ to: e.target.value })}
            aria-invalid={rangeInverted}
            className={`${controlClass} ${rangeInverted ? 'border-red-500' : ''}`}
          />
        </div>
      </fieldset>

      <button
        type="button"
        onClick={onClearList}
        disabled={!canClear}
        className="inline-flex items-center gap-1.5 self-start rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 md:self-auto"
      >
        <X className="h-4 w-4" />
        Clear filters
      </button>
    </div>

    {(rangeInverted || serverError) && (
      <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {rangeInverted ? '"From" must be on or before "To".' : serverError}
      </p>
    )}

    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>

        <select
          value={filters.country}
          onChange={(e) => onChange({ ...filters, country: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.claimStatus}
          onChange={(e) => onChange({ ...filters, claimStatus: e.target.value as BrandFilterState['claimStatus'] })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        >
          <option value="all">All Statuses</option>
          <option value="claimed">Claimed</option>
          <option value="pending">Pending Claim</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
        <button
          onClick={onBulkUpload}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Upload className="h-4 w-4" />
          Bulk Upload
        </button>
        <button
          onClick={onAddBrand}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)] px-3 py-2 text-sm font-medium text-[var(--on-primary)] hover:bg-[var(--primary-dark)]"
        >
          <Plus className="h-4 w-4" />
          Add Brand
        </button>
      </div>
    </div>
    <p className="text-xs text-gray-400">Search, country and status narrow the brands on the current page only.</p>
    </div>
  );
}

/** Pure helper so the parent page can filter the brand list using BrandFilterState */
export function applyBrandFilters<T extends { name: string; brand_email: string; main_address?: { country?: string }; isClaimed: boolean }>(
  brands: T[],
  filters: BrandFilterState
): T[] {
  return brands.filter((b) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        (b.name ?? '').toLowerCase().includes(q) || (b.brand_email ?? '').toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filters.country && b.main_address?.country !== filters.country) return false;
    if (filters.claimStatus === 'claimed' && !b.isClaimed) return false;
    if (filters.claimStatus === 'pending' && (b.isClaimed || b.isClaimed === undefined)) return false;
    return true;
  });
}
