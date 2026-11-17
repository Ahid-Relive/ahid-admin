// page.tsx
'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  useGetAllBrandsQuery,
  useCreateBrandMutation,
  useBulkCreateBrandsMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} from '@/lib/features/brands/brandsApi';

import { BrandStats } from './components/BrandStats';
import { BrandFilters, applyBrandFilters, type BrandFilterState } from './components/BrandFilters';
import { BrandTable, type BrandEmptyKind } from './components/BrandTable';
import { CreateBrandModal } from './components/CreateBrandModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import { exportBrandsToCsv } from './utils/csv';
import type { Brand, CreateBrandPayload } from './types/brand.types';
import {
  DEFAULT_LIST_PARAMS,
  buildApiQueryString,
  buildPageQueryString,
  displayBrandName,
  getListViewState,
  isRangeInverted,
  parseListParams,
  updateListParams,
  type BrandListParams,
} from './utils/listQuery';

const DEFAULT_FILTERS: BrandFilterState = { search: '', country: '', claimStatus: 'all' };

/** First day of the current month in UTC, as YYYY-MM-DD */
function utcMonthStart(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function BrandManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sort, date range, page and page size live in the URL so refresh/sharing keep the view.
  const listParams = useMemo(() => parseListParams(searchParams), [searchParams]);
  const rangeInverted = isRangeInverted(listParams.from, listParams.to);

  const replaceListParams = useCallback(
    (next: BrandListParams, keepOtherParams = true) => {
      const qs = buildPageQueryString(next, keepOtherParams ? searchParams : undefined);
      router.replace(qs ? `/brands?${qs}` : '/brands', { scroll: false });
    },
    [router, searchParams]
  );
  const changeList = useCallback(
    (patch: Partial<BrandListParams>) => replaceListParams(updateListParams(listParams, patch)),
    [listParams, replaceListParams]
  );

  // `currentData` is only ever the response for the current params, so rows from an older
  // request are never shown under new filters, and a slow older response can't replace it.
  const {
    currentData,
    isFetching,
    error,
    refetch,
  } = useGetAllBrandsQuery(listParams, { skip: rangeInverted, refetchOnMountOrArgChange: true });

  // Headline numbers straight from the server's `total` (limit=1 keeps these requests tiny).
  const [monthStart] = useState(utcMonthStart);
  const allTotal = useGetAllBrandsQuery({ ...DEFAULT_LIST_PARAMS, limit: 1 }, { refetchOnMountOrArgChange: true });
  const monthTotal = useGetAllBrandsQuery(
    { ...DEFAULT_LIST_PARAMS, limit: 1, from: monthStart },
    { refetchOnMountOrArgChange: true }
  );

  // Mutations already invalidate the 'Brand' tag; this is an explicit refresh that is safe while skipped.
  const refreshList = () => {
    if (!rangeInverted) refetch();
  };

  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [bulkCreateBrands] = useBulkCreateBrandsMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const view = getListViewState({ params: listParams, response: currentData, isFetching, error });
  const showRows = view.kind === 'rows';
  const brands: Brand[] = useMemo(() => (showRows && currentData ? currentData.data : []), [showRows, currentData]);

  // Current page went past the end (e.g. its last brand was deleted): jump to a valid page.
  const recoverTo = view.kind === 'recovering' ? view.page : null;
  useEffect(() => {
    if (recoverTo !== null) changeList({ page: recoverTo });
  }, [recoverTo, changeList]);

  const [filters, setFilters] = useState<BrandFilterState>({ ...DEFAULT_FILTERS, search: searchParams.get('q') ?? '' });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const countries = useMemo(
    () => Array.from(new Set(brands.map((b) => b.main_address?.country).filter(Boolean))) as string[],
    [brands]
  );

  // Search / country / status only narrow the rows of the current page (the API has no such params).
  const filteredBrands = useMemo(() => applyBrandFilters(brands, filters), [brands, filters]);

  // Rows change with the list params, so drop any selection from the previous page.
  const apiKey = buildApiQueryString(listParams);
  const [selectionKey, setSelectionKey] = useState(apiKey);
  if (selectionKey !== apiKey) {
    setSelectionKey(apiKey);
    setSelectedIds(new Set());
  }

  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    replaceListParams(DEFAULT_LIST_PARAMS, false);
  };

  const emptyKind: BrandEmptyKind =
    brands.length > 0 ? 'no-page-match' : view.kind === 'empty-filtered' ? 'empty-filtered' : 'empty';

  const handleCreateBrand = async (payload: CreateBrandPayload) => {
    if (editingBrand) {
      await updateBrand({ id: editingBrand._id, ...payload });
    } else {
      await createBrand(payload);
    }
    setEditingBrand(null);
    refreshList();
  };

  const handleDeleteBrand = async (brand: Brand) => {
    if (!confirm(`Delete "${displayBrandName(brand.name)}"? This cannot be undone.`)) return;
    await deleteBrand(brand._id);
    refreshList();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected brands? This cannot be undone.`)) return;
    await Promise.all(Array.from(selectedIds).map((id) => deleteBrand(id)));
    setSelectedIds(new Set());
    refreshList();
  };

  const handleMarkVerified = async (brand: Brand) => {
    // NOTE: `isVerified` is not a field on the Brand type from your brandsApi.ts (only `isClaimed`
    // exists there). This UI action is wired but needs a real backend field/endpoint before it'll
    // do anything — update this call once that's defined.
    await updateBrand({ id: brand._id, isClaimed: true });
    refreshList();
  };

  const handleResendClaimInvite = async (brand: Brand) => {
    // Wire this up to your actual "resend claim invitation" endpoint once available.
    alert(`Claim invitation re-sent to ${brand.brand_email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)]">Brand Management</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create, import, and manage brand listings across Ahid.
          </p>
        </div>
      </div>

      <BrandStats
        brands={brands}
        totalBrands={allTotal.currentData?.total}
        addedThisMonth={monthTotal.currentData?.total}
      />

      <BrandFilters
        filters={filters}
        onChange={setFilters}
        countries={countries}
        onExport={() => exportBrandsToCsv(filteredBrands)}
        onAddBrand={() => {
          setEditingBrand(null);
          setIsCreateModalOpen(true);
        }}
        onBulkUpload={() => setIsBulkUploadOpen(true)}
        listParams={listParams}
        onListChange={changeList}
        onClearList={clearAll}
        serverError={view.kind === 'bad-request' ? view.message : null}
      />

      {view.kind === 'error' ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-[var(--bg-card)] px-6 py-12 text-center">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <p className="text-sm text-gray-700">Couldn&apos;t load brands.</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Try again
          </button>
        </div>
      ) : view.kind === 'bad-request' || view.kind === 'invalid-range' ? null : (
      <BrandTable
        brands={filteredBrands}
        isLoading={view.kind === 'loading' || view.kind === 'recovering'}
        onView={(brand) => alert(JSON.stringify(brand, null, 2))}
        onEdit={(brand) => {
          setEditingBrand(brand);
          setIsCreateModalOpen(true);
        }}
        onDelete={handleDeleteBrand}
        onMarkVerified={handleMarkVerified}
        onResendClaimInvite={handleResendClaimInvite}
        onAddBrand={() => {
          setEditingBrand(null);
          setIsCreateModalOpen(true);
        }}
        onBulkUpload={() => setIsBulkUploadOpen(true)}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onBulkDelete={handleBulkDelete}
        emptyKind={emptyKind}
        onClearFilters={clearAll}
        pagination={{
          page: listParams.page,
          limit: listParams.limit,
          count: currentData?.count ?? 0,
          total: currentData?.total ?? 0,
          totalPages: currentData?.totalPages ?? 0,
          onPageChange: (page) => changeList({ page }),
          onLimitChange: (limit) => changeList({ limit }),
        }}
      />
      )}

      <CreateBrandModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingBrand(null);
        }}
        onSubmit={handleCreateBrand}
        isSubmitting={isCreating}
        initialValues={
          editingBrand
            ? {
                brandName: editingBrand.name,
                brandEmail: editingBrand.brand_email,
                mainAddress: editingBrand.main_address,
              }
            : undefined
        }
      />

      <BulkUploadModal
        isOpen={isBulkUploadOpen}
        onClose={() => setIsBulkUploadOpen(false)}
        existingEmails={brands.map((b) => b.brand_email)}
        bulkCreate={bulkCreateBrands}
        onImportComplete={refreshList}
      />
    </div>
  );
}

export default function BrandManagementPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Suspense fallback={null}>
          <BrandManagementContent />
        </Suspense>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
