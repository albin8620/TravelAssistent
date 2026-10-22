import User from '../models/User.js';
import Trip from '../models/Trip.js';
import Location from '../models/Location.js';
import Template from '../models/Template.js';
import { asyncHandler, HttpError } from '../utils/http.js';

export const getStats = asyncHandler(async (_req, res) => {
  const [users, trips, locations, templates, topTemplates] = await Promise.all([
    User.countDocuments(),
    Trip.countDocuments(),
    Location.countDocuments(),
    Template.countDocuments(),
    Template.find().sort({ timesUsed: -1 }).limit(5).select('title timesUsed'),
  ]);
  res.json({ users, trips, locations, templates, topTemplates });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 }).lean();
  const counts = await Trip.aggregate([{ $group: { _id: '$owner', count: { $sum: 1 } } }]);
  const byOwner = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json(users.map((u) => ({ ...u, tripCount: byOwner.get(String(u._id)) || 0 })));
});

export const setUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) throw new HttpError(400, 'Role must be "user" or "admin"');
  if (String(req.user._id) === req.params.id) throw new HttpError(400, 'You cannot change your own role');

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw new HttpError(404, 'User not found');
  res.json(user);
});
