'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { useGetDashboardStatsQuery } from '@/lib/features/stats/statsApi';
import { Users, Building2, FileText, CheckCircle, UserCheck, Clock } from 'lucide-react';
import { format } from 'date-fns';

function DashboardContent() {
  const { data, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data || !data.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Failed to load dashboard statistics. Please try again.</p>
      </div>
    );
  }

  const stats = data.data;

  // Add safety checks for nested data
  const recentUsers = stats?.recentActivity?.recentUsers || [];
  const recentBrands = stats?.recentActivity?.recentBrands || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.overview.totalUsers}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Total Brands"
          value={stats.overview.totalBrands}
          icon={Building2}
          color="green"
        />
        <StatsCard
          title="Total Posts"
          value={stats.overview.totalPosts}
          icon={FileText}
          color="purple"
        />
        <StatsCard
          title="Verified Brands"
          value={stats.overview.verifiedBrands}
          icon={CheckCircle}
          color="teal"
          subtitle={stats.overview.totalBrands > 0 ? `${((stats.overview.verifiedBrands / stats.overview.totalBrands) * 100).toFixed(1)}% of total` : '0% of total'}
        />
        <StatsCard
          title="Active Users"
          value={stats.overview.activeUsers}
          icon={UserCheck}
          color="orange"
          subtitle={stats.overview.totalUsers > 0 ? `${((stats.overview.activeUsers / stats.overview.totalUsers) * 100).toFixed(1)}% of total` : '0% of total'}
        />
        <StatsCard
          title="Pending Verification"
          value={stats.overview.pendingVerification}
          icon={Clock}
          color="red"
          subtitle="Brands awaiting approval"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* Recent Users */}
        <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Recent Users
          </h2>
          {recentUsers.length > 0 ? (
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                      {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">
              No recent users
            </p>
          )}
        </div>

        {/* Recent Brands */}
        <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Recent Brands
          </h2>
          {recentBrands.length > 0 ? (
            <div className="space-y-2">
              {recentBrands.map((brand) => (
                <div
                  key={brand._id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white text-xs font-semibold">
                      {brand?.name?.[0] || 'B'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {brand.name}
                        </p>
                        {brand.verified === 'true' && (
                          <CheckCircle className="w-3.5 h-3.5 text-[var(--verified)]" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {brand.brand_email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {format(new Date(brand.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] text-center py-8">
              No recent brands
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
