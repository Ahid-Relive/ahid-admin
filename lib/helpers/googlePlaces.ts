/**
 * Google Places API (New) helper for Next.js
 * Docs: https://developers.google.com/maps/documentation/places/web-service/op-overview
 *
 * IMPORTANT: This file must only ever run on the server. The API key
 * is read from process.env.GOOGLE_PLACES_API_KEY (no NEXT_PUBLIC_ prefix)
 * so it is never bundled into client JS.
 */

const PLACES_BASE_URL = "https://places.googleapis.com/v1";

function getApiKey(): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    throw new Error(
      "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set. Add it to your .env.local file."
    );
  }
  return key;
}

type LatLng = { latitude: number; longitude: number };

export interface PlaceSearchResult {
  id: string;
  displayName?: { text: string; languageCode?: string };
  formattedAddress?: string;
  location?: LatLng;
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  types?: string[];
  primaryType?: string;
  photos?: { name: string; widthPx: number; heightPx: number }[];
}

export interface PlaceDetails extends PlaceSearchResult {
  internationalPhoneNumber?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  googleMapsUri?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    weekdayDescriptions?: string[];
  };
  reviews?: {
    rating: number;
    text?: { text: string };
    authorAttribution?: { displayName: string };
    publishTime?: string;
  }[];
  editorialSummary?: { text: string };
}

// Default field mask for search results — keep this lean, since you're
// billed more for larger field masks (https://developers.google.com/maps/documentation/places/web-service/place-types)
const DEFAULT_SEARCH_FIELDS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.priceLevel",
  "places.types",
  "places.primaryType",
  "places.photos",
].join(",");

const DEFAULT_DETAILS_FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "priceLevel",
  "types",
  "primaryType",
  "photos",
  "internationalPhoneNumber",
  "nationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "regularOpeningHours",
  "reviews",
  "editorialSummary",
].join(",");

async function placesFetch<T>(
  path: string,
  init: RequestInit,
  fieldMask: string
): Promise<T> {
  const res = await fetch(`${PLACES_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask": fieldMask,
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Google Places API error (${res.status} ${res.statusText}): ${body}`
    );
  }

  return res.json() as Promise<T>;
}

/**
 * Text search — e.g. "coffee shops in Brooklyn" or "ramen near Shibuya"
 * https://developers.google.com/maps/documentation/places/web-service/text-search
 */
export async function searchPlacesByText(
  query: string,
  options?: {
    maxResultCount?: number;
    locationBias?: { center: LatLng; radiusMeters: number };
    fieldMask?: string;
  }
): Promise<PlaceSearchResult[]> {
  const body: Record<string, unknown> = {
    textQuery: query,
    maxResultCount: options?.maxResultCount ?? 10,
  };

  if (options?.locationBias) {
    body.locationBias = {
      circle: {
        center: options.locationBias.center,
        radius: options.locationBias.radiusMeters,
      },
    };
  }

  const data = await placesFetch<{ places?: PlaceSearchResult[] }>(
    "/places:searchText",
    { method: "POST", body: JSON.stringify(body) },
    options?.fieldMask ?? DEFAULT_SEARCH_FIELDS
  );

  return data.places ?? [];
}

/**
 * Nearby search — find places of given types around a point
 * https://developers.google.com/maps/documentation/places/web-service/nearby-search
 */
export async function searchPlacesNearby(
  center: LatLng,
  radiusMeters: number,
  options?: {
    includedTypes?: string[];
    maxResultCount?: number;
    fieldMask?: string;
  }
): Promise<PlaceSearchResult[]> {
  const body: Record<string, unknown> = {
    locationRestriction: {
      circle: { center, radius: radiusMeters },
    },
    maxResultCount: options?.maxResultCount ?? 10,
  };

  if (options?.includedTypes?.length) {
    body.includedTypes = options.includedTypes;
  }

  const data = await placesFetch<{ places?: PlaceSearchResult[] }>(
    "/places:searchNearby",
    { method: "POST", body: JSON.stringify(body) },
    options?.fieldMask ?? DEFAULT_SEARCH_FIELDS
  );

  return data.places ?? [];
}

/**
 * Get full details for a single place by its place ID
 * https://developers.google.com/maps/documentation/places/web-service/place-details
 */
export async function getPlaceDetails(
  placeId: string,
  fieldMask?: string
): Promise<PlaceDetails> {
  return placesFetch<PlaceDetails>(
    `/places/${placeId}`,
    { method: "GET" },
    fieldMask ?? DEFAULT_DETAILS_FIELDS
  );
}

/**
 * Autocomplete — for type-ahead search boxes
 * https://developers.google.com/maps/documentation/places/web-service/place-autocomplete
 */
export async function autocompletePlaces(
  input: string,
  options?: { sessionToken?: string; locationBias?: { center: LatLng; radiusMeters: number } }
): Promise<
  { placePrediction: { placeId: string; text: { text: string } } }[]
> {
  const body: Record<string, unknown> = { input };

  if (options?.sessionToken) body.sessionToken = options.sessionToken;
  if (options?.locationBias) {
    body.locationBias = {
      circle: {
        center: options.locationBias.center,
        radius: options.locationBias.radiusMeters,
      },
    };
  }

  const res = await fetch(`${PLACES_BASE_URL}/places:autocomplete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(
      `Google Places Autocomplete error (${res.status}): ${await res.text()}`
    );
  }

  const data = await res.json();
  return data.suggestions ?? [];
}

/**
 * Build a URL for a place photo. The Places API (New) returns photo
 * "name" identifiers, not direct URLs — you exchange them for media
 * via this endpoint. Safe to use directly as an <img src> since it's a GET.
 * https://developers.google.com/maps/documentation/places/web-service/place-photos
 */
export function getPlacePhotoUrl(
  photoName: string,
  options?: { maxWidthPx?: number; maxHeightPx?: number }
): string {
  const params = new URLSearchParams({
    key: getApiKey(),
    maxWidthPx: String(options?.maxWidthPx ?? 800),
  });
  if (options?.maxHeightPx) {
    params.set("maxHeightPx", String(options.maxHeightPx));
  }
  return `${PLACES_BASE_URL}/${photoName}/media?${params.toString()}`;
}