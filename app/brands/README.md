# Brand Management — Setup Notes

## File layout

```
brands/
├── page.tsx                      # Main page (route entry)
├── components/
│   ├── BrandStats.tsx
│   ├── BrandFilters.tsx
│   ├── BrandTable.tsx
│   ├── CreateBrandModal.tsx
│   ├── BulkUploadModal.tsx
│   ├── UploadPreview.tsx
│   ├── DuplicateDetection.tsx
│   └── UploadResults.tsx
├── hooks/
│   └── useBrandUpload.ts         # Bulk upload wizard state machine
├── utils/
│   ├── csv.ts                    # Parse CSV/XLSX/JSON, templates, exports
│   ├── validators.ts             # zod schemas + row validation
│   └── geocoding.ts              # Google Places geocoding wrapper
└── types/
    └── brand.types.ts            # Shared types matching the backend API exactly
```

Drop this whole `brands/` folder in as your route, e.g. `app/(dashboard)/brands/`.

## 1. Environment variable

Add to `.env.local`:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
```

Enable the **Geocoding API** and **Places API** on that key in Google Cloud Console.

## 2. Load the Google Maps script once, globally

In your root layout (`app/layout.tsx`), add:

```tsx
<script
  src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
  async
/>
```

`utils/geocoding.ts` polls for `window.google.maps.Geocoder` to become available, so it's safe even if this script is still loading when the page mounts.

## 3. Things I assumed about your API layer — please verify

Your provided code only showed `useGetAllBrandsQuery`, `useCreateBrandMutation`, `useBulkCreateBrandsMutation`, and `useDeleteBrandMutation`. The page also calls:

- **`useUpdateBrandMutation`** — used for editing a brand and for "Mark Verified." I guarded the import with a fallback (`?? [async () => {}, ...]`) so the file won't crash if this hook doesn't exist yet, but **edit and verify won't actually work until you add this endpoint** to `brandsApi`. If your backend doesn't have a `PATCH /api/admin/brands/:id` route yet, that's the one piece still needed.
- **"Resend Claim Invitation"** — there's no endpoint for this in the docs you shared, so it's currently a placeholder `alert()`. Swap in the real mutation once you have it.
- **`data?.data`** shape for `useGetAllBrandsQuery` — I assumed the list endpoint returns `{ data: Brand[] }` to match the response envelope style of your other endpoints. Adjust the `brands` line in `page.tsx` if your actual shape differs.

## 4. Bulk upload behavior notes

- Chunks uploads into batches of **100** (the backend's documented max per request) and fires them sequentially, accumulating `created` / `skipped` / `errors` across all chunks.
- Geocoding only runs for rows missing lat/lng — if your CSV/XLSX already includes coordinates, those rows skip the Google API call entirely (faster, cheaper).
- Duplicate detection checks both **within the uploaded file** and **against existing brand emails** already in the table (case-insensitive).
- "Replace Existing" is recorded as user intent but actual replace-vs-skip-on-conflict logic depends on what your `POST /brands/bulk` endpoint does server-side when it hits an existing email (per the docs, it currently always skips existing emails). If you want true "replace," that needs a backend change — happy to help design that endpoint too.

## 5. Dependencies used (you confirmed these are already installed)

```
react-hook-form
zod
@hookform/resolvers
react-dropzone
papaparse
xlsx
@tanstack/react-table
lucide-react
date-fns
```

## 6. `Modal` component assumption

`CreateBrandModal` and `BulkUploadModal` both import `Modal` from `@/components/ui/Modal` (the same one used in your original snippet). I added a `size="lg"` prop usage on the bulk upload modal — if your `Modal` component doesn't accept a `size` prop, either add one (sm/md/lg) or drop that prop; it'll just fall back to your default width.
