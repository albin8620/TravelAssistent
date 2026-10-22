import mongoose from 'mongoose';

// A location curated by admins (city, landmark, region) that users can add to trips.
const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, trim: true },
    country: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['city', 'beach', 'mountain', 'heritage', 'nature', 'other'],
      default: 'city',
    },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    bestTimeToVisit: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

locationSchema.index({ name: 'text', city: 'text', country: 'text' });

export default mongoose.model('Location', locationSchema);
