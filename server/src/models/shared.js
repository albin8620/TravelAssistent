import mongoose from 'mongoose';

// Activity sub-document shared by trip days and template days.
export const activitySchema = new mongoose.Schema({
  time: { type: String, trim: true }, // "09:30"
  title: { type: String, required: true, trim: true },
  place: { type: String, trim: true },
  category: {
    type: String,
    enum: ['sightseeing', 'food', 'transport', 'stay', 'activity', 'other'],
    default: 'activity',
  },
  notes: { type: String, trim: true },
  done: { type: Boolean, default: false },
});
