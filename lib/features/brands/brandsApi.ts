import { apiSlice } from '../api/apiSlice';

interface Location {
  type: 'Point';
  coordinates: [number, number];
}

interface Address {
  country: string;
  address: string;
  location: Location;
}

interface Brand {
  _id: string;
  brand_email: string;
  password?: string;
  googleId?: string;
  appleId?: string;
  official_business_email?: string;
  isEmailVerified: boolean;
  name: string;
  category?: string; // ObjectId ref to Category
  description?: string;
  keywords: string[];
  phone?: string;
  country_code: string;
  main_address: Address;
  branches: Address[];
  banner?: string;
  profile?: string;
  proof_of_location?: string;
  cac?: string;
  private_policy?: string;
  terms_and_condition?: string;
  return_policy?: string;
  brand_website?: string;
  brand_phone?: string;
  verified: string; // legacy string flag, default 'false' — prefer isVerified
  isVerified: boolean;
  brand_socials: BrandSocial[];
  schedule: string[]; // Schedule ObjectIds
  updates: string[]; // Update ObjectIds
  brand_follower: string[]; // Follower ObjectIds
  brand_following: string[]; // Brand ObjectIds
  saved_brands: string[]; // Brand ObjectIds
  reviews: string[]; // Review ObjectIds
  expoPushTokens: string[];
  avg_rating: number;
  visits: string[]; // Visit ObjectIds
  isDeactivated: boolean;
  deactivatedAt: string | null;
  deactivationReason: string | null;
  isClaimed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BrandSocial {
  name:
    | 'facebook'
    | 'twitter'
    | 'instagram'
    | 'linkedin'
    | 'youtube'
    | 'twitch'
    | 'x'
    | 'snapchat'
    | 'pinterest'
    | 'tiktok';
  link: string;
}

interface CreateBrandRequest {
  brandEmail: string;
  brandName: string;
  mainAddress: Address;
}

interface BulkCreateBrandRequest {
  brands: CreateBrandRequest[];
}

interface BulkCreateBrandResponse {
  success: boolean;
  message: string;
  data: {
    created: Brand[];
    skipped: string[];
    errors: Array<{ index: number; errors: string[] }>;
  };
}

interface BrandResponse {
  success: boolean;
  message: string;
  data: Brand;
}

/**
 * Partial update payload. All fields optional except the id (passed separately as the URL param).
 * ASSUMPTION: backend accepts PATCH /admin/brands/:id with a partial body (any subset of these fields).
 * If your actual update route differs (e.g. PUT, or a different path/body shape), this is the only
 * block that needs to change.
 */
interface UpdateBrandRequest {
  id: string;
  brandEmail?: string;
  brandName?: string;
  mainAddress?: Partial<Address>;
  isClaimed?: boolean;
}

interface DeleteBrandResponse {
  success: boolean;
  message: string;
  data?: { id: string };
}

export const brandsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBrand: builder.mutation<BrandResponse, CreateBrandRequest>({
      query: (brandData) => ({
        url: '/admin/brands',
        method: 'POST',
        body: brandData,
      }),
      invalidatesTags: ['Brand'],
    }),
    bulkCreateBrands: builder.mutation<BulkCreateBrandResponse, BulkCreateBrandRequest>({
      query: (brandsData) => ({
        url: '/admin/brands/bulk',
        method: 'POST',
        body: brandsData,
      }),
      invalidatesTags: ['Brand'],
    }),
    getAllBrands: builder.query<{ success: boolean; count: number; data: Brand[] }, void>({
      query: () => '/brands/brands-for-admin',
      providesTags: ['Brand'],
    }),
    updateBrand: builder.mutation<BrandResponse, UpdateBrandRequest>({
      query: ({ id, ...patch }) => ({
        url: `/admin/brands/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: ['Brand'],
    }),
    deleteBrand: builder.mutation<DeleteBrandResponse, string>({
      query: (id) => ({
        url: `/admin/brands/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Brand'],
    }),
  }),
});

export const {
  useCreateBrandMutation,
  useBulkCreateBrandsMutation,
  useGetAllBrandsQuery,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi;