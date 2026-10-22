import Location from '../models/Location.js';
import Template from '../models/Template.js';
import { asyncHandler, HttpError, pick } from '../utils/http.js';

const FIELDS = ['name', 'city', 'country', 'category', 'description', 'imageUrl', 'bestTimeToVisit'];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const listLocations = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.q) {
    const rx = new RegExp(escapeRegex(req.query.q), 'i');
    filter.$or = [{ name: rx }, { city: rx }, { country: rx }];
  }
  res.json(await Location.find(filter).sort({ name: 1 }));
});

export const getLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw new HttpError(404, 'Location not found');
  res.json(location);
});

export const createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create({ ...pick(req.body, FIELDS), createdBy: req.user._id });
  res.status(201).json(location);
});

export const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!location) throw new HttpError(404, 'Location not found');
  res.json(location);
});

export const deleteLocation = asyncHandler(async (req, res) => {
  const inUse = await Template.countDocuments({ location: req.params.id });
  if (inUse) throw new HttpError(409, `Location is used by ${inUse} template(s); delete those first`);
  const location = await Location.findByIdAndDelete(req.params.id);
  if (!location) throw new HttpError(404, 'Location not found');
  res.json({ message: 'Location deleted' });
});
