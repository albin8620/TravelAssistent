import mongoose from 'mongoose';
import { activitySchema } from './shared.js';

const destinationSchema = new mongoose.Schema({
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' }, // optional link to curated location
  name: { type: String, required: true, trim: true },
  arrivalDate: Date,
  departureDate: Date,
  notes: { type: String, trim: true },
});

const daySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  title: { type: String, trim: true },
  activities: [activitySchema],
});

const transportSchema = new mongoose.Schema({
  mode: { type: String, enum: ['flight', 'train', 'bus', 'car', 'ferry', 'other'], default: 'flight' },
  from: { type: String, trim: true },
  to: { type: String, trim: true },
  departAt: Date,
  arriveAt: Date,
  bookingRef: { type: String, trim: true },
  cost: { type: Number, min: 0, default: 0 },
});

const staySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  checkIn: Date,
  checkOut: Date,
  bookingRef: { type: String, trim: true },
  cost: { type: Number, min: 0, default: 0 },
});

const checklistItemSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  done: { type: Boolean, default: false },
});

const tripSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    travelers: { type: Number, min: 1, default: 1 },
    budget: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ['planning', 'booked', 'completed'], default: 'planning' },
    coverImage: { type: String, trim: true },
    fromTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
    destinations: [destinationSchema],
    days: [daySchema],
    transport: [transportSchema],
    stays: [staySchema],
    checklist: [checklistItemSchema],
  },
  { timestamps: true }
);

tripSchema.path('endDate').validate(function endAfterStart(value) {
  return !this.startDate || value >= this.startDate;
}, 'End date must be on or after the start date');

export default mongoose.model('Trip', tripSchema);
