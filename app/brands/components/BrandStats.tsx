// components/BrandStats.tsx
'use client';

import { Building2, ShieldCheck, ShieldAlert, CalendarPlus, Globe2, Tags, UploadCloud } from 'lucide-react';
import type { Brand } from '../types/brand.types';

interface BrandStatsProps {
  brands: Brand[];
  importedToday?: number;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`rounded-lg p-2 ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

export function BrandStats({ brands, importedToday = 0 }: BrandStatsProps) {
  const total = brands.length;
  const claimed = brands.filter((b) => b.isClaimed).length;
  const pending = brands.filter((b) => b.isClaimed === false).length;

  const now = new Date();
  const addedThisMonth = brands.filter((b) => {
    if (!b.createdAt) return false;
    const d = new Date(b.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const countries = new Set(brands.map((b) => b.main_address?.country).filter(Boolean)).size;
  const categories = new Set(brands.map((b) => b.category).filter(Boolean)).size;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      <StatCard label="Total Brands" value={total} icon={Building2} accent="bg-blue-50 text-blue-600" />
      <StatCard label="Claimed" value={claimed} icon={ShieldCheck} accent="bg-green-50 text-green-600" />
      <StatCard label="Pending Claims" value={pending} icon={ShieldAlert} accent="bg-amber-50 text-amber-600" />
      <StatCard label="Added This Month" value={addedThisMonth} icon={CalendarPlus} accent="bg-purple-50 text-purple-600" />
      <StatCard label="Countries Covered" value={countries} icon={Globe2} accent="bg-cyan-50 text-cyan-600" />
      <StatCard label="Categories" value={categories} icon={Tags} accent="bg-pink-50 text-pink-600" />
      <StatCard label="Imported Today" value={importedToday} icon={UploadCloud} accent="bg-indigo-50 text-indigo-600" />
    </div>
  );
}
