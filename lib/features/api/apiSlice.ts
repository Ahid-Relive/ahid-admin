import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Same-origin path; next.config.ts rewrites /api/* to the server-only API_URL.
const BASE_URL = '/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Admin', 'Stats', 'Profile', 'Category', 'Brand', 'Report'],
  endpoints: () => ({}),
});
