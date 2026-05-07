import { apiSlice } from '../api/apiSlice';

// Dashboard Stats Types
interface DashboardStats {
  success: boolean;
  data: {
    overview: {
      totalUsers: number;
      totalBrands: number;
      totalPosts: number;
      totalCategories: number;
      verifiedBrands: number;
      activeUsers: number;
      pendingVerification: number;
    };
    recentActivity: {
      recentUsers: Array<{
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        createdAt: string;
      }>;
      recentBrands: Array<{
        _id: string;
        name: string;
        brand_email: string;
        category?: {
          _id: string;
          name: string;
          slug: string;
        };
        verified: string;
        createdAt: string;
      }>
    };
  };
}

// User Stats Types
interface UserStats {
  success: boolean;
  data: {
    overview: {
      totalUsers: number;
      verifiedUsers: number;
      unverifiedUsers: number;
      usersWithAddresses: number;
    };
    registrationTrend: Array<{
      _id: { year: number; month: number };
      count: number;
    }>;
    topUsers: Array<{
      id: string;
      name: string;
      email: string;
      followingCount: number;
    }>;
  };
}

// Brand Stats Types
interface BrandStats {
  success: boolean;
  data: {
    overview: {
      totalBrands: number;
      verifiedBrands: number;
      pendingVerification: number;
      verificationRate: string;
    };
    registrationTrend: Array<{
      _id: { year: number; month: number };
      count: number;
    }>;
    categoryDistribution: Array<{
      category: {
        _id: string;
        name: string;
        slug: string;
      };
      count: number;
    }>;
    topBrands: Array<{
      id: string;
      name: string;
      email: string;
      category: {
        _id: string;
        name: string;
        slug: string;
      };
      verified: string;
      followerCount: number;
    }>;
  };
}

// Post Stats Types
interface PostStats {
  success: boolean;
  data: {
    overview: {
      totalPosts: number;
    };
    postingTrend: Array<{
      _id: { year: number; month: number };
      count: number;
    }>;
    topPosts: Array<{
      id: string;
      description: string;
      imageCount: number;
      likesCount: number;
      dislikesCount: number;
      brand: {
        _id: string;
        name: string;
        profile: string;
      };
      createdAt: string;
    }>;
    mostActiveBrands: Array<{
      brand: {
        _id: string;
        name: string;
        profile: string;
        category: string;
      };
      postCount: number;
    }>;
  };
}

export const statsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => '/stats/dashboard',
      providesTags: ['Stats'],
    }),
    getUserStats: builder.query<UserStats, void>({
      query: () => '/stats/users',
      providesTags: ['Stats'],
    }),
    getBrandStats: builder.query<BrandStats, void>({
      query: () => '/stats/brands',
      providesTags: ['Stats'],
    }),
    getPostStats: builder.query<PostStats, void>({
      query: () => '/stats/posts',
      providesTags: ['Stats'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetUserStatsQuery,
  useGetBrandStatsQuery,
  useGetPostStatsQuery,
} = statsApi;
