// utils/geocoding.ts
/// <reference types="google.maps" />

/**
 * Wraps the Google Maps JS SDK Geocoder. Requires the Google Maps script to be
 * loaded with your API key, e.g. in your root layout:
 *
 *   <script
 *     src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
 *     async
 *   />
 *
 * Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.
 */

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

let geocoderPromise: Promise<google.maps.Geocoder> | null = null;

const LOAD_TIMEOUT_MS = 8000;
const POLL_INTERVAL_MS = 100;
const THROTTLE_MS = 120;
const MAX_RETRIES_ON_RATE_LIMIT = 2;
const RATE_LIMIT_BACKOFF_MS = 500;

function isMapsLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.google?.maps?.Geocoder;
}

function isScriptTagPresent(): boolean {
  if (typeof document === 'undefined') return false;
  return !!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
}

/** Waits for the Google Maps script to finish loading (polls briefly), then caches a Geocoder instance */
function getGeocoder(): Promise<google.maps.Geocoder> {
  if (geocoderPromise) return geocoderPromise;

  geocoderPromise = new Promise<google.maps.Geocoder>((resolve, reject) => {
    if (isMapsLoaded()) {
      resolve(new window.google.maps.Geocoder());
      return;
    }

    const start = Date.now();

    const fail = (message: string) => {
      // Reset the cache so a later call can retry instead of being stuck
      // with a permanently rejected promise (e.g. after a slow first load).
      geocoderPromise = null;
      reject(new Error(message));
    };

    const check = () => {
      if (isMapsLoaded()) {
        resolve(new window.google.maps.Geocoder());
        return;
      }

      if (Date.now() - start > LOAD_TIMEOUT_MS) {
        const hint = isScriptTagPresent()
          ? 'The script tag is present but Maps did not finish loading in time — check for network errors or an invalid NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in the browser console.'
          : 'No Google Maps script tag was found on the page. Make sure it is loaded before calling geocodeAddress().';
        fail(`Google Maps script did not load in time. ${hint}`);
        return;
      }

      setTimeout(check, POLL_INTERVAL_MS);
    };

    check();
  });

  return geocoderPromise;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Geocodes a single free-text address (optionally scoped to a country) into coordinates */
export async function geocodeAddress(
  address: string,
  country?: string,
  _attempt = 0
): Promise<GeocodeResult> {
  const geocoder = await getGeocoder();
  const fullAddress = country ? `${address}, ${country}` : address;

  return new Promise((resolve, reject) => {
    geocoder.geocode(
      { address: fullAddress },
      (results, status) => {
        if (status === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location;
          resolve({
            lat: loc.lat(),
            lng: loc.lng(),
            formattedAddress: results[0].formatted_address,
          });
          return;
        }

        if (status === 'OVER_QUERY_LIMIT' && _attempt < MAX_RETRIES_ON_RATE_LIMIT) {
          // Back off and retry — this status can occur transiently even
          // within quota when requests burst too fast.
          sleep(RATE_LIMIT_BACKOFF_MS * (_attempt + 1))
            .then(() => geocodeAddress(address, country, _attempt + 1))
            .then(resolve, reject);
          return;
        }

        reject(new Error(`Could not find coordinates for "${address}" (${status})`));
      }
    );
  });
}

/**
 * Geocodes a batch of rows missing coordinates. Runs requests sequentially with a small
 * delay to stay within Google's per-second rate limits — fine for admin bulk-upload sizes
 * (hundreds of rows), not meant for huge batches.
 *
 * onProgress reports progress only over rows that actually need geocoding —
 * rows that already have coordinates are skipped and don't count toward the total.
 */
export async function geocodeRows<
  T extends { address: string; country: string; longitude?: string; latitude?: string }
>(
  rows: T[],
  onProgress?: (done: number, total: number) => void
): Promise<{ row: T; error?: string }[]> {
  const results: { row: T; error?: string }[] = [];
  const total = rows.filter((r) => !r.longitude || !r.latitude).length;
  let done = 0;

  for (const row of rows) {
    if (row.longitude && row.latitude) {
      results.push({ row });
      continue;
    }

    try {
      const geo = await geocodeAddress(row.address, row.country);
      results.push({ row: { ...row, longitude: String(geo.lng), latitude: String(geo.lat) } });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Geocoding failed';
      results.push({ row, error: message });
    }

    done += 1;
    onProgress?.(done, total);

    // Light throttle to avoid hammering the geocoding API on large files
    await sleep(THROTTLE_MS);
  }

  return results;
}