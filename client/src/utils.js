// Trip dates are stored as UTC midnight, so format them in UTC to avoid off-by-one days.
export const fmtDate = (d, opts = {}) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric', ...opts })
    : '';

export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '';

export const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

// Local calendar date (toISOString would give the UTC date, which can be a day off).
export const todayInput = () => new Date().toLocaleDateString('en-CA');

export const tripLength = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / 86400000) + 1;

export const money = (n) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

export const CATEGORY_ICONS = {
  sightseeing: '📸',
  food: '🍽️',
  transport: '🚆',
  stay: '🏨',
  activity: '🎯',
  other: '📌',
};

export const TRANSPORT_ICONS = { flight: '✈️', train: '🚆', bus: '🚌', car: '🚗', ferry: '⛴️', other: '🧳' };

export const FALLBACK_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=60';
