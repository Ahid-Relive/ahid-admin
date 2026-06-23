// types/brand.types.ts

/** GeoJSON Point, matches backend `mainAddress.location` exactly */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface MainAddress {
  country: string;
  address: string;
  location: GeoPoint;
}

/** Payload shape required by POST /api/admin/brands */
export interface CreateBrandPayload {
  brandEmail: string;
  brandName: string;
  mainAddress: MainAddress;
  category?: string; // Category ObjectId
}

/** Payload shape required by POST /api/admin/brands/bulk (max 100 per request) */
export interface BulkCreateBrandsPayload {
  brands: CreateBrandPayload[];
}

/** A brand record as returned by the backend */
export interface Brand {
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
  main_address: MainAddress;
  branches: MainAddress[];
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

export interface BrandSocial {
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

export interface CreateBrandResponse {
  success: boolean;
  message: string;
  data: Brand;
}

export interface BulkCreateError {
  index: number;
  errors: string[];
}

export interface BulkCreateBrandsResponse {
  success: boolean;
  message: string;
  data: {
    created: Brand[];
    skipped: string[]; // emails that already existed
    errors: BulkCreateError[];
  };
}

/** Row shape used while parsing/validating an uploaded file, before it's split into API-ready chunks */
export interface BulkUploadRow {
  rowIndex: number; // 1-based row number in the source file, for error reporting
  brandName: string;
  brandEmail: string;
  country: string;
  address: string;
  longitude?: string;
  latitude?: string;
  category?: string;
  phone?: string;
  // validation results
  isValid: boolean;
  validationErrors: string[];
  isDuplicate?: boolean; // duplicate within file OR matches an existing brand email
}

export type DuplicateStrategy = 'skip' | 'replace' | 'cancel';

export interface BulkUploadResult {
  createdCount: number;
  skippedCount: number;
  failedCount: number;
  errors: Array<{ row: number; brandName: string; error: string }>;
}