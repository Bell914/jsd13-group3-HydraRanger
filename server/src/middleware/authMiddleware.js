import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { HTTP_STATUS } from '../config/constants.js';
import { User } from '../models/User.js';
import { getRequestToken } from '../utils/authCookies.js';

const isDbUnavailableError = (error) => {
  if (!error) return false;
  if (
    ['MongoServerSelectionError', 'MongooseServerSelectionError', 'MongoNetworkError'].includes(error.name)
  ) {
    return true;
  }
  return /buffering timed out|could not connect|server selection|topology was destroyed|before initial connection|marked failed|not established/i.test(
    error.message || ''
  );
};

const buildFallbackUser = (decoded) => ({
  id: decoded.id,
  email: decoded.email,
  username: decoded.username || 'OccasionUser',
  role: decoded.role || 'user'
});

const isSyntheticUser = (id) =>
  id === 'env-admin' || (typeof id === 'string' && id.startsWith('mock-user-'));

export const protect = async (req, res, next) => {
  const token = getRequestToken(req);

  if (token) {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET);

      // Synthetic in-memory / env-bootstrap users never exist in DB
      if (isSyntheticUser(decoded.id)) {
        if (ENV.NODE_ENV !== 'development') {
          return res.status(401).json({ success: false, message: 'Development sessions are not allowed' });
        }
        req.user = buildFallbackUser(decoded);
        return next();
      }

      try {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          if (user.isActive === false) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
              success: false,
              message: 'This customer account has been suspended'
            });
          }
          if ((decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
              success: false,
              message: 'Not authorized, token has been revoked'
            });
          }
          req.user = user;
        } else {
          // DB is up but user no longer exists (deleted/banned) → reject
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: 'Not authorized, user no longer exists'
          });
        }
      } catch (dbError) {
        if (!isDbUnavailableError(dbError)) {
          throw dbError;
        }
        if (ENV.NODE_ENV !== 'development') {
          return res.status(503).json({
            success: false,
            message: 'Unable to verify your account right now. Please try again later.'
          });
        }
        // Local development can still use the existing mock sessions.
        req.user = buildFallbackUser(decoded);
      }

      return next();
    } catch (error) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Not authorized, token verification failed'
      });
    }
  }

  return res.status(HTTP_STATUS.UNAUTHORIZED).json({
    success: false,
    message: 'Not authorized, no token provided'
  });
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: `User role '${req.user?.role || 'anonymous'}' is not authorized to access this resource`
      });
    }
    next();
  };
};
