export interface MonthPoint {
  _id: { year: number; month: number };
  count: number;
}

const key = (y: number, m: number) => y * 12 + (m - 1);

/** Count for a calendar month offset from now (0 = this month, 1 = last month). */
export function monthCount(trend: MonthPoint[] | undefined, offset: number): number {
  const now = new Date();
  const target = key(now.getFullYear(), now.getMonth() + 1) - offset;
  return (trend || []).find((t) => key(t._id.year, t._id.month) === target)?.count ?? 0;
}

/** % change of this month vs last month; null when there is no baseline. */
export function monthOverMonth(trend: MonthPoint[] | undefined): number | null {
  const prev = monthCount(trend, 1);
  const cur = monthCount(trend, 0);
  if (!trend || trend.length === 0) return null;
  if (prev === 0) return cur === 0 ? 0 : null;
  return ((cur - prev) / prev) * 100;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Last N calendar months, zero-filled, merged across several named series. */
export function mergeTrends(series: Record<string, MonthPoint[] | undefined>, months = 6) {
  const now = new Date();
  const base = key(now.getFullYear(), now.getMonth() + 1);
  const rows = [];
  for (let i = months - 1; i >= 0; i--) {
    const k = base - i;
    const row: Record<string, number | string> = { name: `${MONTHS[((k % 12) + 12) % 12]}` };
    for (const [name, trend] of Object.entries(series)) {
      row[name] = (trend || []).find((t) => key(t._id.year, t._id.month) === k)?.count ?? 0;
    }
    rows.push(row);
  }
  return rows;
}

export const pct = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
