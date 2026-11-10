'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Users, Building2, FileText, BadgeCheck, Flag, Search, SearchX, Plus, Upload, Layers, UserCog,
  RefreshCw, ArrowRight, AlertTriangle, CheckCircle2, MinusCircle, Activity, Link2, Gauge,
} from 'lucide-react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { Card, EmptyState, ErrorState, PageHeader } from '@/components/ui/PageHeader';
import { ChartTooltip, CHART_COLORS } from '@/lib/utils/chartStyles';
import { mergeTrends, monthOverMonth, pct } from '@/lib/utils/trends';
import { useAuth } from '@/contexts/AuthContext';
import {
  useGetBrandStatsQuery, useGetDashboardStatsQuery, useGetPostStatsQuery, useGetStorageStatsQuery, useGetUserStatsQuery,
} from '@/lib/features/stats/statsApi';
import { useGetSearchMetricsQuery } from '@/lib/features/search/searchApi';
import { useGetReportsQuery } from '@/lib/features/reports/reportsApi';
import { useGetAllBrandsQuery } from '@/lib/features/brands/brandsApi';

type Health = 'good' | 'warn' | 'bad' | 'na';

const AXIS = { fill: 'var(--text-tertiary)', fontSize: 12 };
const pctText = (v: number | null | undefined, digits = 1) => (v === null || v === undefined ? '—' : `${(v * 100).toFixed(digits)}%`);

function HealthDot({ status }: { status: Health }) {
  if (status === 'good') return <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />;
  if (status === 'warn') return <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />;
  if (status === 'bad') return <AlertTriangle className="h-4 w-4 text-[var(--danger)]" />;
  return <MinusCircle className="h-4 w-4 text-[var(--text-tertiary)]" />;
}

/** Range to higher-is-better / lower-is-better thresholds */
const rateHealth = (v: number | null | undefined, goodAt: number, warnAt: number, lowerIsBetter = false): Health => {
  if (v === null || v === undefined) return 'na';
  if (lowerIsBetter) return v <= goodAt ? 'good' : v <= warnAt ? 'warn' : 'bad';
  return v >= goodAt ? 'good' : v >= warnAt ? 'warn' : 'bad';
};

function ActionTile({ href, label, value, hint, tone, icon: Icon }: {
  href: string; label: string; value: string | number; hint: string; tone: 'danger' | 'warning' | 'info' | 'neutral'; icon: React.ElementType;
}) {
  const toneCls = {
    danger: 'bg-[var(--danger-light)] text-[var(--danger)]',
    warning: 'bg-[var(--warning-light)] text-[var(--warning)]',
    info: 'bg-[var(--info-light)] text-[var(--info)]',
    neutral: 'bg-[var(--bg-secondary)] text-[var(--text-secondary)]',
  }[tone];
  return (
    <Link href={href} className="card card-hover group flex items-center gap-3 p-4 transition-shadow">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${toneCls}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-[family-name:var(--font-manrope)] text-xl font-extrabold leading-none text-[var(--text-primary)]">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="mt-1 truncate text-xs font-semibold text-[var(--text-primary)]">{label}</p>
        <p className="truncate text-xs text-[var(--text-tertiary)]">{hint}</p>
      </div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-[var(--text-tertiary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)]" />
    </Link>
  );
}

function Avatar({ label, src }: { label: string; src?: string }) {
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--primary-light)] text-xs font-bold uppercase text-[var(--primary)]">
      {src ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={src} alt="" className="h-full w-full object-cover" /> : label}
    </div>
  );
}

function DashboardContent() {
  const { admin, hasPermission } = useAuth();
  const canAnalytics = hasPermission('canViewAnalytics');
  const [days, setDays] = useState(30);

  const dash = useGetDashboardStatsQuery(undefined, { skip: !canAnalytics });
  const users = useGetUserStatsQuery(undefined, { skip: !canAnalytics });
  const brandStats = useGetBrandStatsQuery(undefined, { skip: !canAnalytics });
  const posts = useGetPostStatsQuery(undefined, { skip: !canAnalytics });
  const search = useGetSearchMetricsQuery(days, { skip: !canAnalytics });
  const storage = useGetStorageStatsQuery(undefined, { skip: !canAnalytics });
  const pending = useGetReportsQuery({ status: 'pending', limit: 1 });
  const review = useGetReportsQuery({ status: 'under_review', limit: 1 });
  const allBrands = useGetAllBrandsQuery();

  const brandList = allBrands.data?.data ?? [];
  const portfolio = useMemo(() => {
    const total = brandList.length;
    const claimed = brandList.filter((b) => b.isClaimed).length;
    const verified = brandList.filter((b) => b.isVerified).length;
    const noProfile = brandList.filter((b) => !b.profile).length;
    const countries = new Map<string, number>();
    brandList.forEach((b) => {
      const c = b.main_address?.country || 'Unknown';
      countries.set(c, (countries.get(c) || 0) + 1);
    });
    const topCountries = [...countries.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }));
    return { total, claimed, verified, unclaimed: total - claimed, noProfile, topCountries };
  }, [brandList]);

  const overview = dash.data?.data?.overview;
  const recentUsers = dash.data?.data?.recentActivity?.recentUsers ?? [];
  const recentBrands = dash.data?.data?.recentActivity?.recentBrands ?? [];
  const sm = search.data?.data;

  const growth = useMemo(
    () => mergeTrends({
      Users: users.data?.data?.registrationTrend,
      Brands: brandStats.data?.data?.registrationTrend,
      Posts: posts.data?.data?.postingTrend,
    }),
    [users.data, brandStats.data, posts.data],
  );

  const refreshAll = () => {
    dash.refetch(); storage.refetch(); users.refetch(); brandStats.refetch(); posts.refetch(); search.refetch();
    pending.refetch(); review.refetch(); allBrands.refetch();
  };
  const refreshing = [dash, users, brandStats, posts, search, pending, review, allBrands].some((q) => q.isFetching);

  if (canAnalytics && dash.isLoading) return <LoadingSkeleton cards={6} />;

  const pendingReports = pending.data?.total ?? 0;
  const reviewReports = review.data?.total ?? 0;
  const verifiedBrandRate = overview ? pct(overview.verifiedBrands, overview.totalBrands) : null;
  const verifiedUserRate = overview ? pct(overview.activeUsers, overview.totalUsers) : null;
  const postsPerBrand = overview && overview.totalBrands > 0 ? overview.totalPosts / overview.totalBrands : null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const health: Array<{ label: string; value: string; target: string; status: Health; icon: React.ElementType }> = [
    { label: 'Search success', value: sm ? pctText(sm.zeroResultRate === null ? null : 1 - sm.zeroResultRate) : '—', target: 'Target ≥ 90% of searches return results', status: rateHealth(sm?.zeroResultRate, 0.1, 0.25, true), icon: Search },
    { label: 'Search → connection', value: pctText(sm?.connectionRate), target: 'Contact, directions or follow after a search · ≥ 15%', status: rateHealth(sm?.connectionRate, 0.15, 0.05), icon: Link2 },
    { label: 'Query reformulation', value: pctText(sm?.reformulationRate), target: 'Users re-searching within 2 min · ≤ 20%', status: rateHealth(sm?.reformulationRate, 0.2, 0.35, true), icon: Activity },
    { label: 'Search speed (p95)', value: sm?.latencyMs.p95 != null ? `${Math.round(sm.latencyMs.p95)} ms` : '—', target: 'Slowest 5% of searches · ≤ 800 ms', status: sm?.latencyMs.p95 == null ? 'na' : sm.latencyMs.p95 <= 800 ? 'good' : sm.latencyMs.p95 <= 1500 ? 'warn' : 'bad', icon: Gauge },
    { label: 'Brand verification', value: verifiedBrandRate === null ? '—' : `${verifiedBrandRate.toFixed(1)}%`, target: 'Brands verified · ≥ 60%', status: verifiedBrandRate === null ? 'na' : rateHealth(verifiedBrandRate / 100, 0.6, 0.3), icon: BadgeCheck },
    { label: 'Brand claim rate', value: portfolio.total ? `${pct(portfolio.claimed, portfolio.total).toFixed(1)}%` : '—', target: 'Listings claimed by owners · ≥ 30%', status: portfolio.total ? rateHealth(portfolio.claimed / portfolio.total, 0.3, 0.1) : 'na', icon: Building2 },
    { label: 'Report backlog', value: `${pendingReports}`, target: 'Pending moderation reports · 0 is ideal', status: pending.isError ? 'na' : pendingReports === 0 ? 'good' : pendingReports <= 10 ? 'warn' : 'bad', icon: Flag },
    { label: 'Discovery fairness', value: pctText(sm?.lesserKnownEngagementShare), target: 'Engagement reaching new/thin-review brands', status: sm?.lesserKnownEngagementShare == null ? 'na' : 'good', icon: Layers },
  ];

  const categoryData = (brandStats.data?.data?.categoryDistribution ?? []).slice(0, 6).map((c) => ({
    name: c.category?.name ?? 'Unknown', count: c.count,
  }));
  const claimPie = [
    { name: 'Claimed', value: portfolio.claimed },
    { name: 'Unclaimed', value: portfolio.unclaimed },
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      <PageHeader
        title={`${greeting}${admin?.firstName ? `, ${admin.firstName}` : ''}`}
        description={`Platform pulse as of ${format(new Date(), "EEEE, d MMM yyyy 'at' HH:mm")}.`}
        actions={
          <>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border px-3 py-2 text-xs font-semibold"
              aria-label="Search metrics window"
            >
              <option value={7}>Search: last 7 days</option>
              <option value={30}>Search: last 30 days</option>
              <option value={90}>Search: last 90 days</option>
            </select>
            <button onClick={refreshAll} className="btn btn-secondary" disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </>
        }
      />

      {/* Needs attention */}
      <section aria-label="Needs attention">
        <p className="eyebrow mb-2">Needs your attention</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ActionTile href="/reports" icon={Flag} tone={pendingReports > 0 ? 'danger' : 'neutral'} value={pendingReports} label="Reports to review" hint={reviewReports ? `${reviewReports} already under review` : 'Flagged posts waiting for a decision'} />
          <ActionTile href="/brands" icon={Building2} tone={portfolio.unclaimed > 0 ? 'warning' : 'neutral'} value={portfolio.unclaimed} label="Unclaimed brand listings" hint="Invite owners to claim their page" />
          <ActionTile href="/brands" icon={BadgeCheck} tone={overview && overview.pendingVerification > 0 ? 'warning' : 'neutral'} value={overview?.pendingVerification ?? '—'} label="Brands awaiting verification" hint={`${portfolio.noProfile} listings have no profile photo`} />
          <ActionTile href="/analytics/search" icon={SearchX} tone={sm && (sm.zeroResultRate ?? 0) > 0.1 ? 'danger' : 'info'} value={pctText(sm?.zeroResultRate, 0)} label="Searches with no results" hint={`${sm?.topZeroResultQueries?.length ?? 0} unmet queries in last ${days} days`} />
        </div>
      </section>

      {/* KPIs */}
      {canAnalytics && overview && (
        <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
          <StatsCard title="Total users" value={overview.totalUsers} icon={Users} color="blue" delta={monthOverMonth(users.data?.data?.registrationTrend)} subtitle={`${verifiedUserRate?.toFixed(0)}% email verified`} />
          <StatsCard title="Total brands" value={overview.totalBrands} icon={Building2} color="green" delta={monthOverMonth(brandStats.data?.data?.registrationTrend)} subtitle={`${overview.verifiedBrands} verified`} />
          <StatsCard title="Total posts" value={overview.totalPosts} icon={FileText} color="purple" delta={monthOverMonth(posts.data?.data?.postingTrend)} subtitle={postsPerBrand !== null ? `${postsPerBrand.toFixed(1)} per brand` : undefined} />
          <StatsCard title="Searches" value={sm?.searches ?? '—'} icon={Search} color="teal" subtitle={`last ${days} days`} />
          <StatsCard title="Connection rate" value={pctText(sm?.connectionRate)} icon={Link2} color="primary" subtitle="searches that led to contact" />
          <StatsCard title="Categories" value={overview.totalCategories} icon={Layers} color="orange" subtitle={`${portfolio.topCountries.length} top countries`} />
        </section>
      )}

      {/* Growth + health */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        {canAnalytics && (
          <Card className="xl:col-span-2" title="Growth, last 6 months" subtitle="New users, brands and posts per month">
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growth} margin={{ left: -16, right: 8, top: 8 }}>
                  <defs>
                    {['Users', 'Brands', 'Posts'].map((k, i) => (
                      <linearGradient key={k} id={`g-${k}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS[i]} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={CHART_COLORS[i]} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
                  <XAxis dataKey="name" tick={AXIS} tickLine={false} axisLine={false} />
                  <YAxis tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                  {['Users', 'Brands', 'Posts'].map((k, i) => (
                    <Area key={k} type="monotone" dataKey={k} stroke={CHART_COLORS[i]} strokeWidth={2} fill={`url(#g-${k})`} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        <Card title="Product health" subtitle="Are we doing well? Live vs. targets">
          <ul className="divide-y divide-[var(--border-light)]">
            {health.map((h) => (
              <li key={h.label} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <HealthDot status={h.status} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{h.label}</p>
                  <p className="truncate text-xs text-[var(--text-tertiary)]">{h.target}</p>
                </div>
                <span className="text-sm font-bold tabular-nums text-[var(--text-primary)]">{h.value}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Portfolio */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Listing ownership" subtitle={`${portfolio.total.toLocaleString()} brands in directory`}>
          {portfolio.total > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={claimPie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} stroke="none">
                    <Cell fill="var(--chart-1)" />
                    <Cell fill="var(--chart-3)" />
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState message="No brands yet" />}
        </Card>

        <Card title="Top categories" subtitle="Brands per category">
          {categoryData.length > 0 ? (
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ left: 0, right: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                  <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={AXIS} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                  <Bar dataKey="count" name="Brands" radius={[0, 6, 6, 0]} fill="var(--chart-1)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState message="No category data" />}
        </Card>

        <Card title="Top countries" subtitle="Where brands are located">
          {portfolio.topCountries.length > 0 ? (
            <ul className="space-y-3">
              {portfolio.topCountries.map((c) => (
                <li key={c.name}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-semibold text-[var(--text-primary)]">{c.name}</span>
                    <span className="tabular-nums text-[var(--text-secondary)]">{c.count.toLocaleString()} · {pct(c.count, portfolio.total).toFixed(0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${pct(c.count, portfolio.total)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          ) : <EmptyState message="No location data" />}
        </Card>
      </div>

      {/* Media storage */}
      {canAnalytics && storage.data?.data?.supported && (() => {
        const st = storage.data!.data;
        const pctUsed = st.percentOfFreeTier ?? 0;
        const tone = pctUsed >= 100 ? 'var(--danger-solid)' : pctUsed >= 70 ? 'var(--warning)' : 'var(--primary)';
        const fmt = (b = 0) => (b >= 1024 ** 3 ? `${(b / 1024 ** 3).toFixed(2)} GB` : `${(b / 1024 ** 2).toFixed(1)} MB`);
        const folders = Object.entries(st.folders ?? {}).sort((a, b) => b[1].bytes - a[1].bytes).slice(0, 5);
        return (
          <Card title="Media storage" subtitle={`${st.provider.toUpperCase()} · ${(st.objects ?? 0).toLocaleString()} files · checked ${st.checkedAt ? formatDistanceToNow(new Date(st.checkedAt), { addSuffix: true }) : ''}`}>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="font-[family-name:var(--font-manrope)] text-2xl font-extrabold text-[var(--text-primary)]">
                {fmt(st.bytes)} <span className="text-sm font-semibold text-[var(--text-tertiary)]">of {fmt(st.freeTierBytes)} free</span>
              </p>
              <span className={`badge ${pctUsed >= 100 ? 'badge-danger' : pctUsed >= 70 ? 'badge-warning' : 'badge-success'}`}>
                {pctUsed >= 100 ? `Est. $${(st.estimatedMonthlyCostUsd ?? 0).toFixed(2)}/mo over free tier` : `${pctUsed.toFixed(1)}% used`}
              </span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]" role="progressbar" aria-valuenow={Math.min(100, pctUsed)} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full" style={{ width: `${Math.min(100, pctUsed)}%`, background: tone }} />
            </div>
            {folders.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {folders.map(([name, f]) => (
                  <span key={name} className="badge badge-neutral">{name} · {fmt(f.bytes)}</span>
                ))}
              </div>
            )}
          </Card>
        );
      })()}

      {/* Leaderboards */}
      {canAnalytics && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Top brands by followers" action={<Link href="/analytics/brands" className="text-xs font-semibold text-[var(--primary)] hover:underline">View all</Link>}>
            {(brandStats.data?.data?.topBrands ?? []).length > 0 ? (
              <ul className="divide-y divide-[var(--border-light)]">
                {brandStats.data!.data.topBrands.slice(0, 6).map((b, i) => (
                  <li key={b.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="w-5 text-center text-xs font-bold text-[var(--text-tertiary)]">{i + 1}</span>
                    <Avatar label={b.name?.[0] || 'B'} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-[var(--text-primary)]">
                        {b.name}
                        {b.verified === 'true' && <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-[var(--verified)]" />}
                      </p>
                      <p className="truncate text-xs text-[var(--text-tertiary)]">{b.category?.name || 'Uncategorised'}</p>
                    </div>
                    <span className="badge badge-info tabular-nums">{b.followerCount.toLocaleString()} followers</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState message="No brand data yet" />}
          </Card>

          <Card title="Most active brands" subtitle="By number of posts" action={<Link href="/analytics/posts" className="text-xs font-semibold text-[var(--primary)] hover:underline">View all</Link>}>
            {(posts.data?.data?.mostActiveBrands ?? []).filter((m) => m.brand).length > 0 ? (
              <ul className="divide-y divide-[var(--border-light)]">
                {posts.data!.data.mostActiveBrands.filter((m) => m.brand).slice(0, 6).map((m, i) => (
                  <li key={m.brand._id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="w-5 text-center text-xs font-bold text-[var(--text-tertiary)]">{i + 1}</span>
                    <Avatar label={m.brand.name?.[0] || 'B'} />
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-[var(--text-primary)]">{m.brand.name}</p>
                    <span className="badge badge-success tabular-nums">{m.postCount} posts</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState message="No posts yet" />}
          </Card>
        </div>
      )}

      {/* Unmet demand */}
      {sm && sm.topZeroResultQueries.length > 0 && (
        <Card title="Unmet demand" subtitle={`What people searched for but couldn't find, last ${days} days — onboard these brands or categories`} action={<Link href="/analytics/search" className="text-xs font-semibold text-[var(--primary)] hover:underline">Search insights</Link>}>
          <div className="flex flex-wrap gap-2">
            {sm.topZeroResultQueries.slice(0, 14).map((q) => (
              <span key={q.query} className="badge badge-warning gap-1.5 !text-xs">
                {q.query || '(empty)'} <span className="opacity-70">×{q.searches}</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Recent */}
      {canAnalytics && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Newest users" subtitle="Latest sign-ups">
            {recentUsers.length > 0 ? (
              <ul className="divide-y divide-[var(--border-light)]">
                {recentUsers.map((u) => (
                  <li key={u._id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Avatar label={`${u.firstName?.[0] || 'U'}${u.lastName?.[0] || ''}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{u.firstName} {u.lastName}</p>
                      <p className="truncate text-xs text-[var(--text-tertiary)]">{u.email}</p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-[var(--text-tertiary)]" title={format(new Date(u.createdAt), 'PPpp')}>
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState message="No recent users" />}
          </Card>

          <Card title="Newest brands" subtitle="Latest listings">
            {recentBrands.length > 0 ? (
              <ul className="divide-y divide-[var(--border-light)]">
                {recentBrands.map((b) => (
                  <li key={b._id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                    <Avatar label={b.name?.[0] || 'B'} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-[var(--text-primary)]">
                        {b.name}
                        {b.verified === 'true' && <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-[var(--verified)]" />}
                      </p>
                      <p className="truncate text-xs text-[var(--text-tertiary)]">{b.category?.name ? `${b.category.name} · ` : ''}{b.brand_email}</p>
                    </div>
                    <span className="whitespace-nowrap text-xs text-[var(--text-tertiary)]" title={format(new Date(b.createdAt), 'PPpp')}>
                      {formatDistanceToNow(new Date(b.createdAt), { addSuffix: true })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState message="No recent brands" />}
          </Card>
        </div>
      )}

      {/* Quick actions */}
      <Card title="Quick actions">
        <div className="flex flex-wrap gap-2">
          <Link href="/brands" className="btn btn-primary"><Plus className="h-4 w-4" /> Add brand</Link>
          <Link href="/brands" className="btn btn-secondary"><Upload className="h-4 w-4" /> Bulk import brands</Link>
          <Link href="/reports" className="btn btn-secondary"><Flag className="h-4 w-4" /> Review reports</Link>
          {hasPermission('canManageCategories') && <Link href="/categories" className="btn btn-secondary"><Layers className="h-4 w-4" /> Manage categories</Link>}
          {admin?.role === 'super_admin' && <Link href="/admins" className="btn btn-secondary"><UserCog className="h-4 w-4" /> Manage admins</Link>}
        </div>
      </Card>

      {(dash.isError || search.isError) && canAnalytics && (
        <ErrorState message="Some sections could not be loaded. Use Refresh to try again." />
      )}
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
