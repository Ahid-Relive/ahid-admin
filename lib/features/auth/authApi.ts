import { apiSlice } from '../api/apiSlice';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'super_admin' | 'admin' | 'moderator';
    permissions: {
      canManageUsers: boolean;
      canManageBrands: boolean;
      canManageCategories: boolean;
      canManagePosts: boolean;
      canViewAnalytics: boolean;
      canManageAdmins: boolean;
    };
  };
}

interface ProfileResponse {
  success: boolean;
  data: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'super_admin' | 'admin' | 'moderator';
    permissions: {
      canManageUsers: boolean;
      canManageBrands: boolean;
      canManageCategories: boolean;
      canManagePosts: boolean;
      canViewAnalytics: boolean;
      canManageAdmins: boolean;
    };
    isActive: boolean;
    lastLogin?: string;
    createdAt?: string;
  };
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
    }),
    getProfile: builder.query<ProfileResponse, void>({
      query: () => '/profile',
      providesTags: ['Profile'],
    }),
  }),
});

export const { useLoginMutation, useLogoutMutation, useGetProfileQuery } = authApi;
