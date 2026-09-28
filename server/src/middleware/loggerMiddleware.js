import crypto from 'node:crypto';
import { recordRequest } from '../services/monitoringService.js';

const sanitizePath = (path = '') => path
  .replace(/[a-f\d]{24}/gi, ':id')
  .replace(/[a-f\d]{8}-[a-f\d-]{27,}/gi, ':id');

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId = req.get?.('x-request-id') || crypto.randomUUID();
  req.requestId = requestId;
  res.set?.('x-request-id', requestId);
  res.on('finish', () => {
    const duration = Date.now() - start;
    recordRequest({ statusCode: res.statusCode, durationMs: duration });
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: res.statusCode >= 500 ? 'error' : 'info',
      requestId,
      method: req.method,
      path: sanitizePath(req.path || req.originalUrl?.split('?')[0]),
      statusCode: res.statusCode,
      durationMs: duration
    }));
  });
  next();
};
