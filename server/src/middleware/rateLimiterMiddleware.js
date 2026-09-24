import { HTTP_STATUS } from '../config/constants.js';
import mongoose from 'mongoose';
import { RateLimitEntry } from '../models/RateLimitEntry.js';

export const rateLimit = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests, please try again later',
  name = 'general',
  shared = false
} = {}) => {
  // Each endpoint gets its own counter, including in development and tests.
  const buckets = new Map();
  const cleanupTimer = setInterval(() => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= Date.now()) buckets.delete(key);
    }
  }, Math.min(windowMs, 60000));
  cleanupTimer.unref?.();

  function sendResult(count, resetAt, res, next) {
    const remaining = Math.max(0, max - count);
    res.set?.('RateLimit-Limit', String(max));
    res.set?.('RateLimit-Remaining', String(remaining));
    res.set?.('RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
    if (count > max) {
      const now = Date.now();
      res.set?.('Retry-After', String(Math.ceil((resetAt - now) / 1000)));
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message,
        retryAfterMs: resetAt - now
      });
    }
    return next();
  }

  function useMemory(req, res, next) {
    const key = req.ip || 'unknown';
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    return sendResult(bucket.count, bucket.resetAt, res, next);
  }

  async function useSharedStore(req, res, next) {
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const key = `${name}:${req.ip || 'unknown'}:${windowStart}`;
    try {
      const entry = await RateLimitEntry.findByIdAndUpdate(
        key,
        {
          $inc: { count: 1 },
          $setOnInsert: { expiresAt: new Date(windowStart + windowMs) }
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      return sendResult(entry.count, windowStart + windowMs, res, next);
    } catch (error) {
      console.warn(`Shared rate limit unavailable for ${name}: ${error.message}`);
      return useMemory(req, res, next);
    }
  }

  return (req, res, next) => {
    if (shared && mongoose.connection.readyState === 1) {
      return useSharedStore(req, res, next);
    }
    return useMemory(req, res, next);
  };
};
