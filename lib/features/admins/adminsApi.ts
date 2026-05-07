import { apiSlice } from '../api/apiSlice';

interface AdminPermissions {
  canManageUsers: boolean;
  canManageBrands: boolean;
  canManageCategories: boolean;
  canManagePosts: boolean;
  canViewAnalytics: boolean;
  canManageAdmins: boolean;
}

interface Admin {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: AdminPermissions;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'super_admin' | 'admin' | 'moderator';
  permissions?: Partial<AdminPermissions>;
}

interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  role?: 'super_admin' | 'admin' | 'moderator';
  permissions?: Partial<AdminPermissions>;
  isActive?: boolean;
}

interface AdminsResponse {
  success: boolean;
  count: number;
  data: Admin[];
}

interface AdminResponse {
  success: boolean;
  message: string;
  data: Admin;
}

export const adminsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllAdmins: builder.query<AdminsResponse, void>({
      query: () => '/admins',
      providesTags: ['Admin'],
    }),
    createAdmin: builder.mutation<AdminResponse, CreateAdminRequest>({
      query: (adminData) => ({
        url: '/admins',
        method: 'POST',
        body: adminData,
      }),
      invalidatesTags: ['Admin'],
    }),
    updateAdmin: builder.mutation<AdminResponse, { id: string; updates: UpdateAdminRequest }>({
      query: ({ id, updates }) => ({
        url: `/admins/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Admin'],
    }),
    deleteAdmin: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/admins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetAllAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation,
} = adminsApi;
