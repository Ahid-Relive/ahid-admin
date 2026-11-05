import { apiSlice } from '../api/apiSlice';

export interface SearchMetrics {
  period: { since: string; until: string };
  searches: number;
  zeroResultRate: number | null;
  reformulationRate: number | null;
  latencyMs: { p50: number | null; p95: number | null };
  profileViewRate: number | null;
  connectionRate: number | null;
  contactRate: number | null;
  directionsRate: number | null;
  followRate: number | null;
  lesserKnownEngagementShare: number | null;
  topZeroResultQueries: Array<{ query: string; searches: number }>;
  noticeCounts: Record<string, number>;
  truncated: boolean;
}

export const searchApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSearchMetrics: builder.query<{ success: boolean; data: SearchMetrics }, number | void>({
      query: (days) => `/admin/stats/search?days=${days || 30}`,
      providesTags: ['Stats'],
    }),
  }),
});

export const { useGetSearchMetricsQuery } = searchApi;
