'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { useGetPostStatsQuery } from '@/lib/features/stats/statsApi';
import { FileText, ThumbsUp, ThumbsDown, Image as ImageIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import Image from 'next/image';
import { useState } from 'react';

const COLORS = ['#22D3BE', '#34D399', '#FBBF24', '#F87171', '#60A5FA'];

// Helper function to build proper image URLs
const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '/broken-image_13434972.png';
  
  // If already an absolute URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If starts with /, it's already a proper relative path
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Otherwise, construct the full URL
  const baseUrl = process.env.API_URL?.replace('/api/admin', '') || 'http://localhost:5000';
  // Normalize path separators to forward slashes
  const normalizedPath = imagePath.replace(/\\/g, '/');
  return `${baseUrl}/${normalizedPath}`;
};

function PostAnalyticsContent() {
  const { data, isLoading, error } = useGetPostStatsQuery();
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  const handleImageError = (imagePath: string) => {
    setFailedImages(prev => new Set(prev).add(imagePath));
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || (!isLoading && (!data || !data.data))) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Failed to load post statistics. Please try again.</p>
      </div>
    );
  }

  const stats = data.data;

  // Format trend data for charts with safety checks
  const trendData = (stats?.postingTrend || []).map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    posts: item.count,
  }));

  // Format brand activity data with safety checks
  const brandActivityData = (stats?.mostActiveBrands || []).slice(0, 10).map((item) => ({
    brand: item?.brand?.name?.length > 15 ? item.brand.name.substring(0, 15) + '...' : item?.brand?.name || 'Unknown',
    posts: item.postCount,
  }));

  const topPosts = stats?.topPosts || [];
  const mostActiveBrands = stats?.mostActiveBrands || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
          Post Statistics
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Comprehensive analytics and insights about platform posts
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Posts"
          value={stats.overview.totalPosts}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title="Top Posts"
          value={topPosts.length}
          icon={ThumbsUp}
          color="green"
          subtitle="Most engaged content"
        />
        <StatsCard
          title="Active Brands"
          value={mostActiveBrands?.length}
          icon={ImageIcon}
          color="purple"
          subtitle="Posting regularly"
        />
        <StatsCard
          title="Avg Posts/Brand"
          value={mostActiveBrands?.length > 0 ? Math.round(stats.overview.totalPosts / mostActiveBrands.length) : 0}
          icon={FileText}
          color="teal"
          subtitle="Average per brand"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Posting Trend Chart */}
        <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Posting Trend
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
                dataKey="posts" 
                stroke="#22D3BE" 
                strokeWidth={2}
                dot={{ fill: '#208E85', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Most Active Brands Chart */}
        <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
            Most Active Brands (Top 10)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={brandActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="brand" 
                tick={{ fill: '#6B7280', fontSize: 11 }} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: '#6B7280' }} />
              <Tooltip />
              <Bar dataKey="posts" radius={[4, 4, 0, 0]}>
                {brandActivityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Posts */}
      <div className="dark:bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] p-5 mt-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4">
          Top Posts by Engagement
        </h2>
        {topPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPosts.map((post) => (
              <div 
                key={post.id}
                className="dark:bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Post Description */}
                <p className="text-sm text-[var(--text-primary)] mb-3 line-clamp-2">
                  {post.description}
                </p>

                {/* Brand Info */}
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--border-color)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-semibold overflow-hidden">
                    {post?.brand?.profile && !failedImages.has(post.brand.profile) ? (
                      <Image 
                        src={getImageUrl(post.brand.profile)} 
                        alt={post?.brand?.name || 'Brand'}
                        width={32}
                        height={32}
                        className="object-cover"
                        onError={() => handleImageError(post.brand.profile)}
                      />
                    ) : (
                      post?.brand?.name?.[0] || 'B'
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {post?.brand?.name || 'Unknown Brand'}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {format(new Date(post.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {post.likesCount}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">Likes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                      <ThumbsDown className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {post.dislikesCount}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">Dislikes</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[var(--primary)] mb-1">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {post.imageCount}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">Images</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)] text-center py-8">
            No post data available
          </p>
        )}
      </div>
    </div>
  );
}

export default function PostAnalyticsPage() {
  return (
    <ProtectedRoute requiredPermission="canViewAnalytics">
      <DashboardLayout>
        <PostAnalyticsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
