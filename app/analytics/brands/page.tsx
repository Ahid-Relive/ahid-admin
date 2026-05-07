'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useGetBrandStatsQuery } from '@/lib/features/stats/statsApi';
import { Building2, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#22D3BE', '#34D399', '#FBBF24', '#F87171', '#60A5FA', '#A78BFA', '#EC4899', '#FB923C'];

function BrandAnalyticsContent() {
  const { data, isLoading, error } = useGetBrandStatsQuery();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data || !data.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Failed to load brand statistics. Please try again.</p>
      </div>
    );
  }

  const stats = data.data;

  // Format trend data for charts with safety checks
  const trendData = (stats?.registrationTrend || []).map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    registrations: item.count,
  }));

  // Format category distribution for bar chart (top 10)
  const categoryData = (stats?.categoryDistribution || [])
    .slice(0, 10)
    .map((item) => ({
      category: item?._id?.length > 20 ? item._id.substring(0, 20) + '...' : item._id,
      count: item.count,
    }));

  const topBrands = stats?.topBrands || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
          Brand Statistics
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Comprehensive analytics and insights about platform brands
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Brands"
          value={stats.overview.totalBrands}
          icon={Building2}
          color="primary"
        />
        <StatsCard
          title="Verified Brands"
          value={stats.overview.verifiedBrands}
          icon={CheckCircle}
          color="green"
          subtitle={`${stats.overview.verificationRate}% verified`}
        />
        <StatsCard
          title="Pending Verification"
          value={stats.overview.pendingVerification}
          icon={Clock}
          color="orange"
          subtitle="Awaiting approval"
        />
        <StatsCard
          title="Verification Rate"
          value={`${stats.overview.verificationRate}%`}
          icon={TrendingUp}
          color="teal"
          subtitle="Overall approval rate"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* Registration Trend Chart */}
        <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Registration Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22D3BE" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22D3BE" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="registrations" 
                stroke="#22D3BE" 
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRegistrations)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Chart */}
        <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Top Categories (Top 10)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fill: '#6B7280' }} />
              <YAxis type="category" dataKey="category" width={120} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Brands Table */}
      <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 mt-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Top Brands by Follower Count
        </h2>
        {topBrands?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Followers
                  </th>
                </tr>
              </thead>
              <tbody>
                {topBrands.map((brand, index) => (
                  <tr 
                    key={brand.id}
                    className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text-primary)]">
                            {brand.name}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {brand.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">
                      {brand.category}
                    </td>
                    <td className="py-3 px-4">
                      {brand.verified === 'true' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                        {brand.followerCount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] text-center py-8">
            No brand data available
          </p>
        )}
      </div>
    </div>
  );
}

export default function BrandAnalyticsPage() {
  return (
    <ProtectedRoute requiredPermission="canViewAnalytics">
      <DashboardLayout>
        <BrandAnalyticsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
