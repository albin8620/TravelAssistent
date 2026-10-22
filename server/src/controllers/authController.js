import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../utils/http.js';

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new HttpError(400, 'Name, email and password are required');
  if (password.length < 6) throw new HttpError(400, 'Password must be at least 6 characters');

  // Public sign-up always creates a regular user; admins are seeded or promoted.
  const user = await User.create({ name, email, password });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new HttpError(400, 'Email and password are required');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new HttpError(401, 'Invalid email or password');
  res.json({ token: signToken(user), user: publicUser(user) });
});

export const me = (req, res) => res.json({ user: publicUser(req.user) });
