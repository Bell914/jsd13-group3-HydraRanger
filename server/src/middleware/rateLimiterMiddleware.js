import { HTTP_STATUS } from '../config/constants.js';

export const rateLimit = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests, please try again later'
} = {}) => {
  // Each endpoint gets its own counter, including in development and tests.
  const buckets = new Map();
  const cleanupTimer = setInterval(() => {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= Date.now()) buckets.delete(key);
    }
  }, Math.min(windowMs, 60000));
  cleanupTimer.unref?.();

  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    if (bucket.count > max) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message,
        retryAfterMs: bucket.resetAt - now
      });
    }

    next();
  };
};
