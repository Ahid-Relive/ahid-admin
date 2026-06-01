import { apiSlice } from '../api/apiSlice';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string; // SVG string
  createdAt: string;
  updatedAt: string;
}

interface CategoriesResponse {
  success: boolean;
  count: number;
  data: Category[];
}

interface CategoryResponse {
  success: boolean;
  message: string;
  data: Category;
}

interface CreateCategoryRequest {
  name: string;
  slug: string;
  icon: string;
}

export const categoriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllCategories: builder.query<CategoriesResponse, void>({
      query: () => '/categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<CategoryResponse, CreateCategoryRequest>({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategoryIcon: builder.mutation<CategoryResponse, { id: string; icon: string }>({
      query: ({ id, icon }) => ({
        url: `/categories/${id}`,
        method: 'PATCH',
        body: { icon },
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category'],
    }),
  }),
});

export const {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryIconMutation,
  useDeleteCategoryMutation,
} = categoriesApi;
