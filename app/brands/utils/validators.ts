// utils/validators.ts
import { z } from 'zod';
import type { BulkUploadRow } from '../types/brand.types';

/**
 * Mirrors the backend's required fields exactly:
 * brandEmail, brandName, mainAddress.{country, address, location.coordinates}
 */
export const createBrandSchema = z.object({
  brandName: z
    .string()
    .min(2, 'Brand name must be at least 2 characters')
    .max(120, 'Brand name is too long'),
  brandEmail: z.string().email('Enter a valid email address'),
  mainAddress: z.object({
    country: z.string().min(2, 'Country is required'),
    address: z.string().min(5, 'Address is required'),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z
        .tuple([z.number(), z.number()])
        .refine(
          ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
          'Coordinates are out of range'
        ),
    }),
  }),
  // Optional fields not required by backend but useful in the UI/CSV
  category: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateBrandFormValues = z.infer<typeof createBrandSchema>;

/** Looser schema used to validate a single parsed CSV/XLSX row before coordinates are resolved */
export const bulkRowSchema = z.object({
  brandName: z.string().trim().min(2, 'Missing or invalid brand name'),
  brandEmail: z.string().trim().email('Invalid email'),
  country: z.string().trim().min(2, 'Missing country'),
  address: z.string().trim().min(5, 'Missing address'),
  longitude: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= -180 && Number(v) <= 180), {
      message: 'Invalid longitude',
    }),
  latitude: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= -90 && Number(v) <= 90), {
      message: 'Invalid latitude',
    }),
});

/**
 * Validates a raw parsed row (from CSV/XLSX/JSON) and returns a fully-typed BulkUploadRow
 * with validation state attached. Never throws — all errors are captured in validationErrors.
 */
export function validateBulkRow(
  raw: Record<string, any>,
  rowIndex: number
): BulkUploadRow {
  const normalized = {
    brandName: String(raw.brandName ?? raw.brand_name ?? raw.name ?? '').trim(),
    brandEmail: String(raw.brandEmail ?? raw.brand_email ?? raw.email ?? '').trim(),
    country: String(raw.country ?? '').trim(),
    address: String(raw.address ?? '').trim(),
    longitude: raw.longitude !== undefined ? String(raw.longitude).trim() : undefined,
    latitude: raw.latitude !== undefined ? String(raw.latitude).trim() : undefined,
    category: raw.category ? String(raw.category).trim() : undefined,
    phone: raw.phone ? String(raw.phone).trim() : undefined,
  };

  const result = bulkRowSchema.safeParse(normalized);
  const validationErrors: string[] = [];

  if (!result.success) {
    for (const issue of result.error.issues) {
      validationErrors.push(issue.message);
    }
  }

  // Coordinates are not required at parse-time (can be filled in via geocoding later),
  // but if both are present they must be valid numbers — already checked above.

  return {
    rowIndex,
    ...normalized,
    isValid: validationErrors.length === 0,
    validationErrors,
  };
}

/** Builds the exact CreateBrandPayload[] the backend expects from validated, geocoded rows */
export function rowsToPayload(rows: BulkUploadRow[]) {
  return rows.map((row) => ({
    brandEmail: row.brandEmail,
    brandName: row.brandName,
    mainAddress: {
      country: row.country,
      address: row.address,
      location: {
        type: 'Point' as const,
        coordinates: [Number(row.longitude), Number(row.latitude)] as [number, number],
      },
    },
  }));
}
