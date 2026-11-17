// utils/listQuery.ts
// Pure helpers for the server-paginated Brands list (GET /api/brands/brands-for-admin).
// No React / browser APIs here so they can be unit-tested with `node --test`.

export type BrandSort = 'newest' | 'az' | 'za';

export interface BrandListParams {
  page: number;
  limit: number;
  sort: BrandSort;
  /** Calendar date as YYYY-MM-DD (UTC on the server), or '' for none */
  from: string;
  /** Calendar date as YYYY-MM-DD (UTC on the server), or '' for none */
  to: string;
}

export const SORT_OPTIONS: { value: BrandSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'az', label: 'Name A to Z' },
  { value: 'za', label: 'Name Z to A' },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const DEFAULT_LIST_PARAMS: BrandListParams = {
  page: 1,
  limit: 20,
  sort: 'newest',
  from: '',
  to: '',
};

const YMD = /^\d{4}-\d{2}-\d{2}$/;

/** True for a real calendar date written as YYYY-MM-DD (rejects 2026-02-30). */
export function isYmd(value: string): boolean {
  if (!YMD.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function toPositiveInt(raw: string | null): number | null {
  if (raw == null || !/^\d+$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 1 ? n : null;
}

/** Read list state from the page URL. Anything invalid falls back to the default. */
export function parseListParams(sp: { get(name: string): string | null }): BrandListParams {
  const page = toPositiveInt(sp.get('page')) ?? DEFAULT_LIST_PARAMS.page;
  const limitRaw = toPositiveInt(sp.get('limit'));
  const limit = limitRaw && limitRaw <= 100 ? limitRaw : DEFAULT_LIST_PARAMS.limit;
  const sortRaw = sp.get('sort');
  const sort = SORT_OPTIONS.some((o) => o.value === sortRaw) ? (sortRaw as BrandSort) : DEFAULT_LIST_PARAMS.sort;
  const fromRaw = sp.get('from') ?? '';
  const toRaw = sp.get('to') ?? '';
  return {
    page,
    limit,
    sort,
    from: isYmd(fromRaw) ? fromRaw : '',
    to: isYmd(toRaw) ? toRaw : '',
  };
}

/**
 * Apply a change to the list state. Changing sort, a date or the page size
 * always returns to page 1; only an explicit page change keeps the page.
 */
export function updateListParams(prev: BrandListParams, patch: Partial<BrandListParams>): BrandListParams {
  const next = { ...prev, ...patch };
  const resetsPage =
    (patch.sort !== undefined && patch.sort !== prev.sort) ||
    (patch.from !== undefined && patch.from !== prev.from) ||
    (patch.to !== undefined && patch.to !== prev.to) ||
    (patch.limit !== undefined && patch.limit !== prev.limit);
  if (resetsPage && patch.page === undefined) next.page = 1;
  return next;
}

/** "From" later than "To" (both YYYY-MM-DD, so string order is date order). */
export function isRangeInverted(from: string, to: string): boolean {
  return Boolean(from && to && from > to);
}

export function hasActiveFilters(p: BrandListParams): boolean {
  return Boolean(p.from || p.to);
}

/**
 * Query string for the API. Dates are sent exactly as picked (YYYY-MM-DD);
 * they are never passed through Date/toISOString, so there is no timezone shift.
 */
export function buildApiQueryString(p: BrandListParams): string {
  const qs = new URLSearchParams();
  qs.set('page', String(p.page));
  qs.set('limit', String(p.limit));
  qs.set('sort', p.sort);
  if (p.from) qs.set('from', p.from);
  if (p.to) qs.set('to', p.to);
  return qs.toString();
}

/**
 * Query string for the page URL: defaults are left out so a clean URL means the
 * default view. Unrelated params already in the URL (e.g. `q`) are kept.
 */
export function buildPageQueryString(
  p: BrandListParams,
  existing?: { forEach(cb: (value: string, key: string) => void): void }
): string {
  const qs = new URLSearchParams();
  const own = new Set(['page', 'limit', 'sort', 'from', 'to']);
  existing?.forEach((value, key) => {
    if (!own.has(key)) qs.append(key, value);
  });
  if (p.sort !== DEFAULT_LIST_PARAMS.sort) qs.set('sort', p.sort);
  if (p.from) qs.set('from', p.from);
  if (p.to) qs.set('to', p.to);
  if (p.page !== DEFAULT_LIST_PARAMS.page) qs.set('page', String(p.page));
  if (p.limit !== DEFAULT_LIST_PARAMS.limit) qs.set('limit', String(p.limit));
  return qs.toString();
}

/** "Showing X-Y of total": uses count (rows on this page) only for Y, never as the total. */
export function summaryRange(page: number, limit: number, count: number, total: number) {
  if (total === 0 || count === 0) return { start: 0, end: 0, total };
  const start = (page - 1) * limit + 1;
  return { start, end: start + count - 1, total };
}

/**
 * When the current page is empty but it is past the end (e.g. the last brand on
 * the last page was deleted), return the page to move to. Otherwise null.
 */
export function recoverPage(page: number, count: number, total: number, totalPages: number): number | null {
  if (count > 0) return null;
  if (total === 0) return page === 1 ? null : 1;
  if (page > totalPages) return Math.max(1, totalPages);
  return null;
}

/** Server message from a 400 response, if that is what the error is. */
export function badRequestMessage(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const e = error as { status?: unknown; data?: unknown };
  if (e.status !== 400) return null;
  const msg = (e.data as { message?: unknown } | undefined)?.message;
  return typeof msg === 'string' && msg ? msg : 'The server rejected these list options.';
}

export type ListViewState =
  | { kind: 'invalid-range' }
  | { kind: 'loading' }
  | { kind: 'bad-request'; message: string }
  | { kind: 'error' }
  | { kind: 'recovering'; page: number }
  | { kind: 'empty-filtered' }
  | { kind: 'empty' }
  | { kind: 'rows' };

export interface ListResponseLike {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  data: unknown[];
}

/** Decide what the list area shows. `response` must be the result for the *current* params only. */
export function getListViewState(args: {
  params: BrandListParams;
  response: ListResponseLike | undefined;
  isFetching: boolean;
  error: unknown;
}): ListViewState {
  const { params, response, isFetching, error } = args;
  if (isRangeInverted(params.from, params.to)) return { kind: 'invalid-range' };
  if (isFetching) return { kind: 'loading' };
  if (error) {
    const message = badRequestMessage(error);
    return message ? { kind: 'bad-request', message } : { kind: 'error' };
  }
  if (!response) return { kind: 'loading' };
  const target = recoverPage(params.page, response.data.length, response.total, response.totalPages);
  if (target !== null) return { kind: 'recovering', page: target };
  if (response.total === 0) return hasActiveFilters(params) ? { kind: 'empty-filtered' } : { kind: 'empty' };
  return { kind: 'rows' };
}

/** createdAt shown in UTC, e.g. "15 Mar 2026, 12:00 UTC". */
export function formatCreatedAtUtc(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'UTC' });
  return `${date}, ${time} UTC`;
}

export const UNNAMED_BRAND = 'Unnamed brand';

export function displayBrandName(name: string | null | undefined): string {
  return name && name.trim() ? name : UNNAMED_BRAND;
}
