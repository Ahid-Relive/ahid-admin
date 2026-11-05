'use client';

import { useState } from 'react';
import { Search, SearchX, Link2, Activity, Gauge, Layers, Phone, MapPin, UserPlus, Eye } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, EmptyState, ErrorState, PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ChartTooltip } from '@/lib/utils/chartStyles';
import { useGetSearchMetricsQuery } from '@/lib/features/search/searchApi';

const pctText = (v: number | null | undefined) => (v === null || v === undefined ? '—' : `${(v * 100).toFixed(1)}%`);
const AXIS = { fill: 'var(--text-tertiary)', fontSize: 12 };

function SearchContent() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError } = useGetSearchMetricsQuery(days);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data?.data) return <ErrorState message="Failed to load search insights." />;
  const m = data.data;

  const funnel = [
    { name: 'Profile views', value: (m.profileViewRate ?? 0) * 100 },
    { name: 'Any connection', value: (m.connectionRate ?? 0) * 100 },
    { name: 'Contact', value: (m.contactRate ?? 0) * 100 },
    { name: 'Directions', value: (m.directionsRate ?? 0) * 100 },
    { name: 'Follow', value: (m.followRate ?? 0) * 100 },
  ];
  const maxQ = Math.max(1, ...m.topZeroResultQueries.map((q) => q.searches));

  return (
    <div className="space-y-6 animate-slide-in">
      <PageHeader
        title="Search insights"
        description="How well Ahid helps people find and connect with brands."
        actions={
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="rounded-lg border px-3 py-2 text-xs font-semibold" aria-label="Time window">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        }
      />

      {m.truncated && <ErrorState message="This window has more than 50,000 searches; metrics are based on a capped sample." />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatsCard title="Searches" value={m.searches} icon={Search} color="blue" subtitle={`last ${days} days`} />
        <StatsCard title="Zero-result rate" value={pctText(m.zeroResultRate)} icon={SearchX} color={(m.zeroResultRate ?? 0) > 0.1 ? 'red' : 'green'} subtitle="lower is better" />
        <StatsCard title="Connection rate" value={pctText(m.connectionRate)} icon={Link2} color="teal" subtitle="contact · directions · follow" />
        <StatsCard title="Reformulation" value={pctText(m.reformulationRate)} icon={Activity} color="orange" subtitle="re-searched within 2 min" />
        <StatsCard title="Latency p50 / p95" value={`${m.latencyMs.p50 ?? '—'} / ${m.latencyMs.p95 ?? '—'} ms`} icon={Gauge} color="purple" />
        <StatsCard title="Fair discovery" value={pctText(m.lesserKnownEngagementShare)} icon={Layers} color="primary" subtitle="engagement on newer brands" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Search-to-action funnel" subtitle="% of searches with results that led to each action">
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnel} layout="vertical" margin={{ right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                <XAxis type="number" tick={AXIS} tickLine={false} axisLine={false} unit="%" />
                <YAxis type="category" dataKey="name" width={100} tick={AXIS} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
                <Bar dataKey="value" name="Rate (%)" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
            <span className="badge badge-neutral"><Eye className="h-3 w-3" /> {pctText(m.profileViewRate)}</span>
            <span className="badge badge-neutral"><Phone className="h-3 w-3" /> {pctText(m.contactRate)}</span>
            <span className="badge badge-neutral"><MapPin className="h-3 w-3" /> {pctText(m.directionsRate)}</span>
            <span className="badge badge-neutral"><UserPlus className="h-3 w-3" /> {pctText(m.followRate)}</span>
          </div>
        </Card>

        <Card title="Unmet demand" subtitle="Most common searches that returned nothing">
          {m.topZeroResultQueries.length === 0 ? (
            <EmptyState message="Every search returned results 🎉" />
          ) : (
            <ul className="space-y-3">
              {m.topZeroResultQueries.slice(0, 10).map((q) => (
                <li key={q.query}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="truncate font-semibold text-[var(--text-primary)]">{q.query || '(empty)'}</span>
                    <span className="tabular-nums text-[var(--text-secondary)]">{q.searches}×</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
                    <div className="h-full rounded-full bg-[var(--warning)]" style={{ width: `${(q.searches / maxQ) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {Object.keys(m.noticeCounts).length > 0 && (
        <Card title="Search notices" subtitle="How often the engine had to adjust or warn">
          <div className="flex flex-wrap gap-2">
            {Object.entries(m.noticeCounts).map(([k, v]) => (
              <span key={k} className="badge badge-info">{k.replace(/_/g, ' ')} · {v}</span>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export default function SearchInsightsPage() {
  return (
    <ProtectedRoute requiredPermission="canViewAnalytics">
      <DashboardLayout>
        <SearchContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
