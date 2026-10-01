import mongoose from 'mongoose';

const rateLimitEntrySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
});

export const RateLimitEntry = mongoose.models.RateLimitEntry ||
  mongoose.model('RateLimitEntry', rateLimitEntrySchema);
