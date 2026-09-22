import { HTTP_STATUS } from '../config/constants.js';
import { ENV } from '../config/env.js';

const buckets = new Map();

let cleanupTimer = null;
const startCleanup = () => {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, 60 * 60 * 1000);
  cleanupTimer.unref?.();
};
startCleanup();

export const rateLimit = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests, please try again later'
} = {}) => {
  return (req, res, next) => {
    //  หากอยู่ในช่วง Development ให้สั่งข้าม (Bypass) ไม่ต้องนับจำนวนครั้ง
    if (ENV.NODE_ENV !== 'production') {
      return next();
    }

    const key = req.ip || 'unknown';
    const now = Date.now();
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

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