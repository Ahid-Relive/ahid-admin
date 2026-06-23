// components/BrandFilters.tsx
'use client';

import { Search, Download, Plus, Upload } from 'lucide-react';

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
}

export function BrandFilters({
  filters,
  onChange,
  countries,
  onExport,
  onAddBrand,
  onBulkUpload,
}: BrandFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search brands..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <select
          value={filters.country}
          onChange={(e) => onChange({ ...filters, country: e.target.value })}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Brand
        </button>
      </div>
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
        b.name.toLowerCase().includes(q) || b.brand_email.toLowerCase().includes(q);
      if (!matches) return false;
    }
    if (filters.country && b.main_address?.country !== filters.country) return false;
    if (filters.claimStatus === 'claimed' && !b.isClaimed) return false;
    if (filters.claimStatus === 'pending' && (b.isClaimed || b.isClaimed === undefined)) return false;
    return true;
  });
}
