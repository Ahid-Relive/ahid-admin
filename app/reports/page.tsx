'use client';

import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { Flag, CheckCircle2, XCircle, Eye, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, EmptyState, ErrorState, PageHeader } from '@/components/ui/PageHeader';
import { StatsCard } from '@/components/ui/StatsCard';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { Modal } from '@/components/ui/Modal';
import { useGetReportsQuery, useUpdateReportStatusMutation, type Report, type ReportStatus } from '@/lib/features/reports/reportsApi';

const STATUSES: Array<{ value: ReportStatus | ''; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
  { value: '', label: 'All' },
];

const statusBadge: Record<ReportStatus, string> = {
  pending: 'badge-warning',
  under_review: 'badge-info',
  resolved: 'badge-success',
  dismissed: 'badge-neutral',
};

const reasonLabel = (r: string) => r.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());

function reporterName(r: Report) {
  const p = r.reportedBy;
  if (!p) return 'Unknown';
  return p.name || [p.firstName, p.lastName].filter(Boolean).join(' ') || p.email || p.brand_email || 'Unknown';
}

function ReportsContent() {
  const [status, setStatus] = useState<ReportStatus | ''>('pending');
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<Report | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const { data, isLoading, isError, isFetching } = useGetReportsQuery({ status, page, limit: 15 });
  const pendingCount = useGetReportsQuery({ status: 'pending', limit: 1 }).data?.total;
  const reviewCount = useGetReportsQuery({ status: 'under_review', limit: 1 }).data?.total;
  const resolvedCount = useGetReportsQuery({ status: 'resolved', limit: 1 }).data?.total;
  const dismissedCount = useGetReportsQuery({ status: 'dismissed', limit: 1 }).data?.total;
  const [updateStatus, { isLoading: saving }] = useUpdateReportStatusMutation();

  const open = (r: Report) => {
    setActive(r);
    setNotes(r.adminNotes || '');
    setError('');
  };

  const act = async (next: ReportStatus) => {
    if (!active) return;
    setError('');
    try {
      await updateStatus({ id: active._id, status: next, adminNotes: notes.trim() || undefined }).unwrap();
      setActive(null);
    } catch {
      setError('Could not update this report. Please try again.');
    }
  };

  const reports = data?.data ?? [];

  return (
    <div className="space-y-6 animate-slide-in">
      <PageHeader title="Moderation" description="Posts flagged by users and brands. Review, resolve or dismiss." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Pending" value={pendingCount ?? '—'} icon={Clock} color="orange" subtitle="need a decision" />
        <StatsCard title="Under review" value={reviewCount ?? '—'} icon={Eye} color="blue" />
        <StatsCard title="Resolved" value={resolvedCount ?? '—'} icon={CheckCircle2} color="green" />
        <StatsCard title="Dismissed" value={dismissedCount ?? '—'} icon={XCircle} color="primary" />
      </div>

      <Card className="!p-0 overflow-hidden">
        <div className="flex flex-wrap gap-1 border-b border-[var(--border-color)] p-3">
          {STATUSES.map((s) => (
            <button
              key={s.label}
              onClick={() => { setStatus(s.value); setPage(1); }}
              className={`btn ${status === s.value ? 'btn-primary' : 'btn-ghost'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <div className="p-4"><ErrorState message="Failed to load reports. The service may be unavailable." /></div>
        ) : reports.length === 0 ? (
          <EmptyState message="Nothing here — no reports match this filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th className="hidden md:table-cell">Reported post</th>
                  <th className="hidden lg:table-cell">Reporter</th>
                  <th>Status</th>
                  <th className="hidden sm:table-cell">Filed</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id} className="cursor-pointer" onClick={() => open(r)}>
                    <td className="font-semibold">{reasonLabel(r.reason)}</td>
                    <td className="hidden max-w-xs truncate text-[var(--text-secondary)] md:table-cell">
                      {r.postId?.description || (r.postId ? '(no caption)' : 'Post deleted')}
                    </td>
                    <td className="hidden text-[var(--text-secondary)] lg:table-cell">
                      {reporterName(r)} <span className="text-[var(--text-tertiary)]">· {r.reporterType}</span>
                    </td>
                    <td><span className={`badge ${statusBadge[r.status]}`}>{reasonLabel(r.status)}</span></td>
                    <td className="hidden whitespace-nowrap text-[var(--text-tertiary)] sm:table-cell">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </td>
                    <td className="text-right"><span className="text-xs font-semibold text-[var(--primary)]">Review</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-color)] px-4 py-3 text-xs text-[var(--text-secondary)]">
            <span>Page {data.page} of {data.totalPages} · {data.total} reports</span>
            <div className="flex gap-1">
              <button className="btn btn-secondary" disabled={page <= 1 || isFetching} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></button>
              <button className="btn btn-secondary" disabled={page >= data.totalPages || isFetching} onClick={() => setPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></button>
            </div>
          </div>
        )}
      </Card>

      <Modal isOpen={!!active} onClose={() => setActive(null)} title="Review report" size="md">
        {active && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge badge-danger"><Flag className="h-3 w-3" /> {reasonLabel(active.reason)}</span>
              <span className={`badge ${statusBadge[active.status]}`}>{reasonLabel(active.status)}</span>
              <span className="text-xs text-[var(--text-tertiary)]">{format(new Date(active.createdAt), 'PPp')}</span>
            </div>

            <div className="rounded-lg bg-[var(--bg-secondary)] p-3">
              <p className="eyebrow mb-1">Reported post</p>
              <p className="whitespace-pre-wrap text-sm text-[var(--text-primary)]">{active.postId?.description || (active.postId ? '(no caption)' : 'This post no longer exists.')}</p>
              {active.postId?.images && active.postId.images.length > 0 && (
                <p className="mt-1 text-xs text-[var(--text-tertiary)]">{active.postId.images.length} image(s) attached</p>
              )}
            </div>

            <div>
              <p className="eyebrow mb-1">Reporter</p>
              <p className="text-sm text-[var(--text-primary)]">{reporterName(active)} <span className="text-[var(--text-tertiary)]">({active.reporterType})</span></p>
              {active.description && <p className="mt-2 text-sm text-[var(--text-secondary)]">&ldquo;{active.description}&rdquo;</p>}
            </div>

            <div>
              <label htmlFor="notes" className="eyebrow mb-1 block">Admin notes</label>
              <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={1000}
                className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Internal notes about your decision…" />
            </div>

            {error && <ErrorState message={error} />}

            <div className="flex flex-wrap justify-end gap-2 border-t border-[var(--border-color)] pt-4">
              <button className="btn btn-secondary" disabled={saving} onClick={() => act('under_review')}><Eye className="h-4 w-4" /> Mark under review</button>
              <button className="btn btn-secondary" disabled={saving} onClick={() => act('dismissed')}><XCircle className="h-4 w-4" /> Dismiss</button>
              <button className="btn btn-primary" disabled={saving} onClick={() => act('resolved')}><CheckCircle2 className="h-4 w-4" /> Resolve</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ReportsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
