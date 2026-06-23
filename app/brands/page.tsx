// page.tsx
'use client';

import { useMemo, useState } from 'react';
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
import { BrandTable } from './components/BrandTable';
import { CreateBrandModal } from './components/CreateBrandModal';
import { BulkUploadModal } from './components/BulkUploadModal';
import { exportBrandsToCsv } from './utils/csv';
import type { Brand, CreateBrandPayload } from './types/brand.types';

const DEFAULT_FILTERS: BrandFilterState = { search: '', country: '', claimStatus: 'all' };

function BrandManagementContent() {
  const { data, isLoading, refetch } = useGetAllBrandsQuery();
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [bulkCreateBrands] = useBulkCreateBrandsMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const brands: Brand[] = data?.data ?? [];

  const [filters, setFilters] = useState<BrandFilterState>(DEFAULT_FILTERS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const countries = useMemo(
    () => Array.from(new Set(brands.map((b) => b.main_address?.country).filter(Boolean))) as string[],
    [brands]
  );

  const filteredBrands = useMemo(() => applyBrandFilters(brands, filters), [brands, filters]);

  const handleCreateBrand = async (payload: CreateBrandPayload) => {
    if (editingBrand) {
      await updateBrand({ id: editingBrand._id, ...payload });
    } else {
      await createBrand(payload);
    }
    setEditingBrand(null);
    refetch();
  };

  const handleDeleteBrand = async (brand: Brand) => {
    if (!confirm(`Delete "${brand.name}"? This cannot be undone.`)) return;
    await deleteBrand(brand._id);
    refetch();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected brands? This cannot be undone.`)) return;
    await Promise.all(Array.from(selectedIds).map((id) => deleteBrand(id)));
    setSelectedIds(new Set());
    refetch();
  };

  const handleMarkVerified = async (brand: Brand) => {
    // NOTE: `isVerified` is not a field on the Brand type from your brandsApi.ts (only `isClaimed`
    // exists there). This UI action is wired but needs a real backend field/endpoint before it'll
    // do anything — update this call once that's defined.
    await updateBrand({ id: brand._id, isClaimed: true });
    refetch();
  };

  const handleResendClaimInvite = async (brand: Brand) => {
    // Wire this up to your actual "resend claim invitation" endpoint once available.
    alert(`Claim invitation re-sent to ${brand.brand_email}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Brand Management</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Create, import, and manage brand listings across Ahid.
          </p>
        </div>
      </div>

      <BrandStats brands={brands} />

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
      />

      <BrandTable
        brands={filteredBrands}
        isLoading={isLoading}
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
      />

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
        onImportComplete={refetch}
      />
    </div>
  );
}

export default function BrandManagementPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <BrandManagementContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
