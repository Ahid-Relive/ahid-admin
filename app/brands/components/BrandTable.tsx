// components/BrandTable.tsx
'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Copy,
  ShieldCheck,
  Mail,
  Building2,
  Upload,
  Plus,
} from 'lucide-react';
import type { Brand } from '../types/brand.types';

interface BrandTableProps {
  brands: Brand[];
  isLoading: boolean;
  onView: (brand: Brand) => void;
  onEdit: (brand: Brand) => void;
  onDelete: (brand: Brand) => void;
  onMarkVerified: (brand: Brand) => void;
  onResendClaimInvite: (brand: Brand) => void;
  onAddBrand: () => void;
  onBulkUpload: () => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  onBulkDelete: () => void;
}

function RowActionsMenu({
  brand,
  onView,
  onEdit,
  onDelete,
  onMarkVerified,
  onResendClaimInvite,
}: Pick<BrandTableProps, 'onView' | 'onEdit' | 'onDelete' | 'onMarkVerified' | 'onResendClaimInvite'> & {
  brand: Brand;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
        aria-label="Row actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-52 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            <MenuItem icon={Eye} label="View" onClick={() => { onView(brand); setOpen(false); }} />
            <MenuItem icon={Pencil} label="Edit" onClick={() => { onEdit(brand); setOpen(false); }} />
            <MenuItem
              icon={Copy}
              label="Copy Brand ID"
              onClick={() => { navigator.clipboard.writeText(brand._id); setOpen(false); }}
            />
            {!brand.isClaimed && (
              <MenuItem
                icon={ShieldCheck}
                label="Mark Verified"
                onClick={() => { onMarkVerified(brand); setOpen(false); }}
              />
            )}
            {!brand.isClaimed && (
              <MenuItem
                icon={Mail}
                label="Resend Claim Invitation"
                onClick={() => { onResendClaimInvite(brand); setOpen(false); }}
              />
            )}
            <div className="my-1 border-t border-gray-100" />
            <MenuItem
              icon={Trash2}
              label="Delete"
              danger
              onClick={() => { onDelete(brand); setOpen(false); }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
        danger ? 'text-red-600' : 'text-gray-700'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function EmptyState({ onAddBrand, onBulkUpload }: { onAddBrand: () => void; onBulkUpload: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-blue-50 p-4">
        <Building2 className="h-8 w-8 text-blue-500" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">No Brands Yet</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-500">
        Start by creating a brand, or import brands in bulk from a CSV, XLSX, or JSON file.
      </p>
      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={onAddBrand}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Add Brand
        </button>
        <button
          onClick={onBulkUpload}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Upload className="h-4 w-4" />
          Bulk Upload
        </button>
      </div>
    </div>
  );
}

export function BrandTable({
  brands,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onMarkVerified,
  onResendClaimInvite,
  onAddBrand,
  onBulkUpload,
  selectedIds,
  onSelectionChange,
  onBulkDelete,
}: BrandTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const toggleAll = (checked: boolean) => {
    onSelectionChange(checked ? new Set(brands.map((b) => b._id)) : new Set());
  };

  const toggleOne = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    checked ? next.add(id) : next.delete(id);
    onSelectionChange(next);
  };

  const columns = useMemo<ColumnDef<Brand>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={brands.length > 0 && selectedIds.size === brands.length}
            onChange={(e) => toggleAll(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
        // TanStack Table passes a Row<Brand>, not a Brand — the actual record is row.original
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedIds.has(row.original._id)}
            onChange={(e) => toggleOne(row.original._id, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
        ),
      },
      {
        accessorKey: 'name', // matches the real schema field (was incorrectly 'brandName')
        header: 'Brand Name',
        cell: ({ row }) => {
          const brand = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                {brand.profile ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${brand.profile}`} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  brand.name?.[0]?.toUpperCase() ?? '?'
                )}
              </div>
              <span className="font-medium text-gray-900">{brand.name}</span>
            </div>
          );
        },
      },
      { accessorKey: 'brand_email', header: 'Email' }, // was incorrectly 'brandEmail'
      {
        id: 'country',
        header: 'Country',
        accessorFn: (row) => row.main_address?.country ?? '—', // was incorrectly row.mainAddress
      },
      {
        accessorKey: 'isClaimed',
        header: 'Status',
        cell: ({ row }) =>
          row.original.isClaimed ? (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Claimed
            </span>
          ) : row.original.isClaimed === false ? (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              Pending
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700">
              Owned
            </span>
          ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date Created',
        cell: ({ row }) =>
          row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString() : '—',
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <RowActionsMenu
            brand={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onMarkVerified={onMarkVerified}
            onResendClaimInvite={onResendClaimInvite}
          />
        ),
      },
    ],
    [brands, selectedIds]
  );

  const table = useReactTable({
    data: brands,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  if (isLoading) {
    return (
      <div className="space-y-2 rounded-xl border border-gray-200 bg-white p-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white">
        <EmptyState onAddBrand={onAddBrand} onBulkUpload={onBulkUpload} />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between border-b border-gray-200 bg-blue-50 px-4 py-2.5">
          <span className="text-sm font-medium text-blue-900">{selectedIds.size} selected</span>
          <button
            onClick={onBulkDelete}
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
        <span className="text-sm text-gray-500">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1} ·{' '}
          {brands.length} brands
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-gray-300 p-1.5 text-gray-600 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-gray-300 p-1.5 text-gray-600 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
