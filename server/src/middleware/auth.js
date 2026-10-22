import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler, HttpError } from '../utils/http.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Not authenticated');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new HttpError(401, 'User no longer exists');
  req.user = user;
  next();
});

// Attaches req.user when a valid token is present, but never rejects the request.
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      req.user = await User.findById(payload.id);
    } catch {
      // ignore invalid tokens on public routes
    }
  }
  next();
});

export function adminOnly(req, _res, next) {
  if (req.user?.role !== 'admin') return next(new HttpError(403, 'Admin access required'));
  next();
}

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
