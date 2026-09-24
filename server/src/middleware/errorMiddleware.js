import { HTTP_STATUS } from '../config/constants.js';
import { ENV } from '../config/env.js';

export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(HTTP_STATUS.NOT_FOUND);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || (
    res.statusCode && res.statusCode !== HTTP_STATUS.OK
      ? res.statusCode
      : HTTP_STATUS.INTERNAL_SERVER_ERROR
  );

  console.error(`🚨 Error [${req.method} ${req.url}]:`, err.message);

  const hideInternalMessage = ENV.NODE_ENV === 'production' && statusCode >= 500;

  res.status(statusCode).json({
    success: false,
    message: hideInternalMessage ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
    errors: hideInternalMessage ? null : (err.errors || null),
    stack: ENV.NODE_ENV === 'development' ? err.stack : undefined
  });
};
