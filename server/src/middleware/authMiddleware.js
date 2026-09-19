import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { HTTP_STATUS } from '../config/constants.js';
import { User } from '../models/User.js';

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
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, ENV.JWT_SECRET);

      // Synthetic in-memory / env-bootstrap users never exist in DB
      if (isSyntheticUser(decoded.id)) {
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
        // DB offline → fall back to in-memory / session users
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

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Not authorized, no token provided'
    });
  }
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
