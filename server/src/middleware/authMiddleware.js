import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { HTTP_STATUS } from '../config/constants.js';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, ENV.JWT_SECRET);

      try {
        const user = await User.findById(decoded.id).select('-password');
        if (user) {
          req.user = user;
        } else {
          // Fallback user object if in-memory
          req.user = {
            id: decoded.id,
            email: decoded.email,
            username: decoded.username || 'HydraUser',
            role: decoded.role || 'user'
          };
        }
      } catch {
        req.user = {
          id: decoded.id,
          email: decoded.email,
          username: decoded.username || 'HydraUser',
          role: decoded.role || 'user'
        };
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
