import { apiSlice } from '../api/apiSlice';

export type ReportStatus = 'pending' | 'under_review' | 'resolved' | 'dismissed';

export interface Report {
  _id: string;
  postId?: {
    _id: string;
    description?: string;
    images?: string[];
    brandId?: string;
  } | null;
  reportedBy?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    email?: string;
    brand_email?: string;
  } | null;
  reporterType: 'user' | 'brand';
  reason: string;
  description?: string;
  status: ReportStatus;
  adminNotes?: string;
  resolvedAt?: string | null;
  createdAt: string;
}

export interface ReportsResponse {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  data: Report[];
}

export interface ReportsQuery {
  page?: number;
  limit?: number;
  status?: ReportStatus | '';
  reason?: string;
}

export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getReports: builder.query<ReportsResponse, ReportsQuery | void>({
      query: (params) => {
        const q = new URLSearchParams();
        const p = params || {};
        if (p.page) q.set('page', String(p.page));
        if (p.limit) q.set('limit', String(p.limit));
        if (p.status) q.set('status', p.status);
        if (p.reason) q.set('reason', p.reason);
        const qs = q.toString();
        return `/brands/all-reports${qs ? `?${qs}` : ''}`;
      },
      providesTags: ['Report'],
    }),
    updateReportStatus: builder.mutation<unknown, { id: string; status: ReportStatus; adminNotes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/brands/reports/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Report'],
    }),
  }),
});

export const { useGetReportsQuery, useUpdateReportStatusMutation } = reportsApi;
