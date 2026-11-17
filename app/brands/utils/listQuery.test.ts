// Run with: npm test   (Node's built-in test runner; no extra dependencies)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_LIST_PARAMS,
  buildApiQueryString,
  buildPageQueryString,
  displayBrandName,
  formatCreatedAtUtc,
  getListViewState,
  isRangeInverted,
  isYmd,
  parseListParams,
  recoverPage,
  summaryRange,
  updateListParams,
  type BrandListParams,
  type ListResponseLike,
} from './listQuery.ts';

const sp = (s: string) => new URLSearchParams(s);
const params = (p: Partial<BrandListParams> = {}): BrandListParams => ({ ...DEFAULT_LIST_PARAMS, ...p });
const resp = (r: Partial<ListResponseLike> = {}): ListResponseLike => ({
  page: 1, limit: 20, count: 0, total: 0, totalPages: 0, data: [], ...r,
});

// ---------- query-string building ----------

test('default view sends page 1, limit 20, newest first and no dates', () => {
  assert.equal(buildApiQueryString(DEFAULT_LIST_PARAMS), 'page=1&limit=20&sort=newest');
});

test('sort and dates go to the API exactly as chosen', () => {
  const qs = buildApiQueryString(params({ sort: 'za', from: '2026-03-01', to: '2026-03-31', page: 2, limit: 50 }));
  assert.equal(qs, 'page=2&limit=50&sort=za&from=2026-03-01&to=2026-03-31');
  assert.equal(new URLSearchParams(buildApiQueryString(params({ sort: 'az' }))).get('sort'), 'az');
});

test('dates are not shifted regardless of the process timezone', () => {
  const original = process.env.TZ;
  for (const tz of ['Pacific/Kiritimati', 'Pacific/Pago_Pago', 'UTC']) {
    process.env.TZ = tz;
    const q = new URLSearchParams(buildApiQueryString(params({ from: '2026-01-01', to: '2026-12-31' })));
    assert.equal(q.get('from'), '2026-01-01');
    assert.equal(q.get('to'), '2026-12-31');
  }
  process.env.TZ = original;
});

test('page URL omits defaults and keeps unrelated params like q', () => {
  assert.equal(buildPageQueryString(DEFAULT_LIST_PARAMS), '');
  assert.equal(
    buildPageQueryString(params({ sort: 'az', from: '2026-03-01', to: '2026-03-31', page: 2 }), sp('q=shoe&page=9')),
    'q=shoe&sort=az&from=2026-03-01&to=2026-03-31&page=2'
  );
});

test('URL round-trips through parse and build', () => {
  const p = params({ sort: 'az', from: '2026-03-01', to: '2026-03-31', page: 2, limit: 50 });
  assert.deepEqual(parseListParams(sp(buildPageQueryString(p))), p);
});

test('invalid URL values fall back to defaults', () => {
  assert.deepEqual(
    parseListParams(sp('page=0&limit=500&sort=oldest&from=2026-02-30&to=03/01/2026')),
    DEFAULT_LIST_PARAMS
  );
  assert.equal(parseListParams(sp('page=abc')).page, 1);
  assert.equal(parseListParams(sp('limit=100')).limit, 100);
});

test('isYmd accepts real dates only', () => {
  assert.ok(isYmd('2024-02-29'));
  assert.ok(!isYmd('2026-02-29'));
  assert.ok(!isYmd('2026-3-1'));
  assert.ok(!isYmd('2026-03-01T00:00:00Z'));
});

// ---------- resetting the page ----------

test('changing sort, either date or page size resets to page 1', () => {
  const p = params({ page: 4 });
  assert.equal(updateListParams(p, { sort: 'az' }).page, 1);
  assert.equal(updateListParams(p, { from: '2026-03-01' }).page, 1);
  assert.equal(updateListParams(p, { to: '2026-03-31' }).page, 1);
  assert.equal(updateListParams(p, { limit: 50 }).page, 1);
});

test('changing only the page keeps the other options', () => {
  const p = params({ sort: 'za', from: '2026-03-01', page: 2 });
  assert.deepEqual(updateListParams(p, { page: 3 }), { ...p, page: 3 });
});

test('setting a value to what it already is does not reset the page', () => {
  assert.equal(updateListParams(params({ page: 3 }), { sort: 'newest' }).page, 3);
});

test('From after To is flagged', () => {
  assert.ok(isRangeInverted('2026-04-01', '2026-03-31'));
  assert.ok(!isRangeInverted('2026-03-31', '2026-03-31'));
  assert.ok(!isRangeInverted('2026-03-01', ''));
});

// ---------- summary ----------

test('summary uses total, not count, as the grand total', () => {
  assert.deepEqual(summaryRange(2, 20, 20, 142), { start: 21, end: 40, total: 142 });
  assert.deepEqual(summaryRange(8, 20, 2, 142), { start: 141, end: 142, total: 142 });
  assert.deepEqual(summaryRange(1, 20, 0, 0), { start: 0, end: 0, total: 0 });
});

// ---------- empty / out-of-range / error states ----------

test('out-of-range page recovers to the new last page', () => {
  assert.equal(recoverPage(8, 0, 140, 7), 7);
  assert.equal(recoverPage(3, 0, 0, 0), 1);
  assert.equal(recoverPage(1, 0, 0, 0), null);
  assert.equal(recoverPage(2, 5, 25, 2), null);
});

test('view state: recovering when the page is past the end', () => {
  const s = getListViewState({
    params: params({ page: 8 }),
    response: resp({ page: 8, total: 140, totalPages: 7 }),
    isFetching: false,
    error: undefined,
  });
  assert.deepEqual(s, { kind: 'recovering', page: 7 });
});

test('view state: zero matches with a date filter is the filtered empty state', () => {
  const s = getListViewState({ params: params({ from: '2026-03-01' }), response: resp(), isFetching: false, error: undefined });
  assert.deepEqual(s, { kind: 'empty-filtered' });
});

test('view state: zero brands and no filter is the plain empty state', () => {
  assert.deepEqual(getListViewState({ params: params(), response: resp(), isFetching: false, error: undefined }), { kind: 'empty' });
});

test('view state: 400 shows the server message', () => {
  const s = getListViewState({
    params: params(),
    response: undefined,
    isFetching: false,
    error: { status: 400, data: { success: false, message: 'from must not be after to' } },
  });
  assert.deepEqual(s, { kind: 'bad-request', message: 'from must not be after to' });
});

test('view state: other errors are not treated as a 400', () => {
  const s = getListViewState({ params: params(), response: undefined, isFetching: false, error: { status: 500, data: {} } });
  assert.deepEqual(s, { kind: 'error' });
});

test('view state: loading hides rows while a request is in flight', () => {
  const s = getListViewState({
    params: params(),
    response: resp({ count: 20, total: 40, totalPages: 2, data: new Array(20).fill({}) }),
    isFetching: true,
    error: undefined,
  });
  assert.deepEqual(s, { kind: 'loading' });
});

test('view state: an inverted range is not requested', () => {
  const s = getListViewState({ params: params({ from: '2026-04-01', to: '2026-03-01' }), response: undefined, isFetching: false, error: undefined });
  assert.deepEqual(s, { kind: 'invalid-range' });
});

test('view state: rows when there is data', () => {
  const s = getListViewState({
    params: params(),
    response: resp({ count: 1, total: 1, totalPages: 1, data: [{}] }),
    isFetching: false,
    error: undefined,
  });
  assert.deepEqual(s, { kind: 'rows' });
});

// ---------- display ----------

test('createdAt is shown in UTC', () => {
  assert.equal(formatCreatedAtUtc('2026-03-15T23:30:00.000Z'), '15 Mar 2026, 23:30 UTC');
  assert.equal(formatCreatedAtUtc(undefined), '—');
  assert.equal(formatCreatedAtUtc('not a date'), '—');
});

test('empty names get a placeholder', () => {
  assert.equal(displayBrandName(''), 'Unnamed brand');
  assert.equal(displayBrandName('   '), 'Unnamed brand');
  assert.equal(displayBrandName(undefined), 'Unnamed brand');
  assert.equal(displayBrandName('Ahid'), 'Ahid');
});
