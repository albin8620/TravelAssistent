import mongoose from 'mongoose';
import { activitySchema } from './shared.js';

// Public destination template curated by admins; users can clone it into a trip.
const templateDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  title: { type: String, trim: true },
  activities: [activitySchema],
});

const templateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
    durationDays: { type: Number, required: true, min: 1, max: 60 },
    tags: [{ type: String, trim: true }],
    days: [templateDaySchema],
    isPublished: { type: Boolean, default: true },
    timesUsed: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Template', templateSchema);
