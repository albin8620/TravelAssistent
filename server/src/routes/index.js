import { Router } from 'express';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as trips from '../controllers/tripController.js';
import * as locations from '../controllers/locationController.js';
import * as templates from '../controllers/templateController.js';
import * as admin from '../controllers/adminController.js';

const router = Router();

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);

// Trips (user-owned)
router.get('/trips', protect, trips.listTrips);
router.post('/trips', protect, trips.createTrip);
router.post('/trips/from-template/:templateId', protect, trips.createFromTemplate);
router.get('/trips/:id', protect, trips.getTrip);
router.put('/trips/:id', protect, trips.updateTrip);
router.delete('/trips/:id', protect, trips.deleteTrip);

// Locations (public read, admin write)
router.get('/locations', locations.listLocations);
router.get('/locations/:id', locations.getLocation);
router.post('/locations', protect, adminOnly, locations.createLocation);
router.put('/locations/:id', protect, adminOnly, locations.updateLocation);
router.delete('/locations/:id', protect, adminOnly, locations.deleteLocation);

// Destination templates (public read, admin write)
router.get('/templates', optionalAuth, templates.listTemplates);
router.get('/templates/:id', optionalAuth, templates.getTemplate);
router.post('/templates', protect, adminOnly, templates.createTemplate);
router.put('/templates/:id', protect, adminOnly, templates.updateTemplate);
router.delete('/templates/:id', protect, adminOnly, templates.deleteTemplate);

// Admin
router.get('/admin/stats', protect, adminOnly, admin.getStats);
router.get('/admin/users', protect, adminOnly, admin.listUsers);
router.patch('/admin/users/:id/role', protect, adminOnly, admin.setUserRole);

export default router;
