import Trip from '../models/Trip.js';
import Template from '../models/Template.js';
import { asyncHandler, HttpError, pick } from '../utils/http.js';
import { addDays, buildDays } from '../utils/days.js';

const EDITABLE = [
  'title', 'description', 'startDate', 'endDate', 'travelers', 'budget', 'status', 'coverImage',
  'destinations', 'days', 'transport', 'stays', 'checklist',
];

async function findOwnTrip(req) {
  const trip = await Trip.findOne({ _id: req.params.id, owner: req.user._id });
  if (!trip) throw new HttpError(404, 'Trip not found');
  return trip;
}

function totalCost(trip) {
  const sum = (items) => items.reduce((acc, i) => acc + (i.cost || 0), 0);
  return sum(trip.transport) + sum(trip.stays);
}

export const listTrips = asyncHandler(async (req, res) => {
  const filter = { owner: req.user._id };
  if (req.query.status) filter.status = req.query.status;
  const trips = await Trip.find(filter)
    .sort({ startDate: 1 })
    .select('title description startDate endDate status coverImage destinations.name budget travelers');
  res.json(trips);
});

export const getTrip = asyncHandler(async (req, res) => {
  const trip = await findOwnTrip(req);
  await trip.populate('destinations.location', 'name city country imageUrl');
  res.json({ ...trip.toObject(), spent: totalCost(trip) });
});

export const createTrip = asyncHandler(async (req, res) => {
  const data = pick(req.body, EDITABLE);
  if (!data.title || !data.startDate || !data.endDate) {
    throw new HttpError(400, 'Title, start date and end date are required');
  }
  try {
    data.days = buildDays(data.startDate, data.endDate, data.days || []);
  } catch (e) {
    throw new HttpError(400, e.message);
  }
  const trip = await Trip.create({ ...data, owner: req.user._id });
  res.status(201).json(trip);
});

export const updateTrip = asyncHandler(async (req, res) => {
  const trip = await findOwnTrip(req);
  const data = pick(req.body, EDITABLE);
  trip.set(data);

  // Keep the day-by-day schedule in sync with the trip's date range.
  if (data.startDate || data.endDate || data.days) {
    try {
      trip.days = buildDays(trip.startDate, trip.endDate, trip.days);
    } catch (e) {
      throw new HttpError(400, e.message);
    }
  }
  await trip.save();
  await trip.populate('destinations.location', 'name city country imageUrl');
  res.json({ ...trip.toObject(), spent: totalCost(trip) });
});

export const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await findOwnTrip(req);
  await trip.deleteOne();
  res.json({ message: 'Trip deleted' });
});

// Clone a public template into a new personal trip starting on the chosen date.
export const createFromTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne({ _id: req.params.templateId, isPublished: true }).populate('location');
  if (!template) throw new HttpError(404, 'Template not found');

  const { startDate, title } = req.body;
  if (!startDate) throw new HttpError(400, 'Start date is required');

  const endDate = addDays(startDate, template.durationDays - 1);
  const templateDays = new Map(template.days.map((d) => [d.dayNumber, d]));
  const days = buildDays(startDate, endDate).map((day, i) => {
    const src = templateDays.get(i + 1);
    if (!src) return day;
    const activities = src.activities.map(({ time, title: t, place, category, notes }) => ({
      time, title: t, place, category, notes,
    }));
    return { ...day, title: src.title, activities };
  });

  const loc = template.location;
  const trip = await Trip.create({
    owner: req.user._id,
    title: title || template.title,
    description: template.summary,
    startDate,
    endDate,
    coverImage: loc?.imageUrl,
    fromTemplate: template._id,
    destinations: loc
      ? [{ location: loc._id, name: [loc.name, loc.country].filter(Boolean).join(', '), arrivalDate: startDate, departureDate: endDate }]
      : [],
    days,
  });

  template.timesUsed += 1;
  await template.save();
  res.status(201).json(trip);
});
