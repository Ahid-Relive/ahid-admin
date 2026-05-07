'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useGetUserStatsQuery } from '@/lib/features/stats/statsApi';
import { Users, UserCheck, UserX, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#22D3BE', '#34D399', '#FBBF24', '#F87171', '#60A5FA'];

function UserAnalyticsContent() {
  const { data, isLoading, error } = useGetUserStatsQuery();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !data || !data.data) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Failed to load user statistics. Please try again.</p>
      </div>
    );
  }

  const stats = data.data;

  // Format trend data for charts with safety checks
  const trendData = (stats?.registrationTrend || []).map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    registrations: item.count,
  }));

  // Format pie chart data with safety checks
  const pieData = [
    { name: 'Verified Users', value: stats?.overview?.verifiedUsers || 0 },
    { name: 'Unverified Users', value: stats?.overview?.unverifiedUsers || 0 },
  ];

  const topUsers = stats?.topUsers || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
          User Statistics
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Comprehensive analytics and insights about platform users
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={stats.overview.totalUsers}
          icon={Users}
          color="primary"
        />
        <StatsCard
          title="Verified Users"
          value={stats.overview.verifiedUsers}
          icon={UserCheck}
          color="green"
          subtitle={`${((stats.overview.verifiedUsers / stats.overview.totalUsers) * 100).toFixed(1)}% verified`}
        />
        <StatsCard
          title="Unverified Users"
          value={stats.overview.unverifiedUsers}
          icon={UserX}
          color="orange"
          subtitle={`${((stats.overview.unverifiedUsers / stats.overview.totalUsers) * 100).toFixed(1)}% unverified`}
        />
        <StatsCard
          title="Users with Addresses"
          value={stats.overview.usersWithAddresses}
          icon={MapPin}
          color="teal"
          subtitle={`${((stats.overview.usersWithAddresses / stats.overview.totalUsers) * 100).toFixed(1)}% completed`}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Registration Trend Chart */}
        <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Registration Trend
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fill: '#6B7280' }} />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="registrations" 
                stroke="#22D3BE" 
                strokeWidth={2}
                dot={{ fill: '#208E85', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Verification Status Chart */}
        <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Verification Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent && (percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Users Table */}
      <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 mt-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Top Users by Following Count
        </h2>
        {topUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-color)]">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
                    Brands Following
                  </th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, index) => (
                  <tr 
                    key={user.id}
                    className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-semibold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-secondary)]">
                      {user.email}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                        {user.followingCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] text-center py-8">
            No user data available
          </p>
        )}
      </div>
    </div>
  );
}

export default function UserAnalyticsPage() {
  return (
    <ProtectedRoute requiredPermission="canViewAnalytics">
      <DashboardLayout>
        <UserAnalyticsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
