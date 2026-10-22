const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_TRIP_DAYS = 60;

const toUtcMidnight = (value) => {
  const d = new Date(value);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

export const addDays = (date, n) => new Date(toUtcMidnight(date) + n * DAY_MS);

export function countDays(start, end) {
  return Math.round((toUtcMidnight(end) - toUtcMidnight(start)) / DAY_MS) + 1;
}

// Builds one day entry per calendar date between start and end, keeping any
// existing day (title + activities) whose date still falls inside the range.
export function buildDays(start, end, existing = []) {
  const total = countDays(start, end);
  if (total < 1) return [];
  if (total > MAX_TRIP_DAYS) throw new Error(`Trips can be at most ${MAX_TRIP_DAYS} days long`);

  const byDate = new Map(existing.map((d) => [toUtcMidnight(d.date), d]));
  return Array.from({ length: total }, (_, i) => {
    const date = addDays(start, i);
    const prev = byDate.get(date.getTime());
    return prev
      ? { _id: prev._id, date, title: prev.title, activities: prev.activities }
      : { date, title: '', activities: [] };
  });
}
