import { HTTP_STATUS } from '../config/constants.js';
import * as authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser({ username, email, password });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    if (error.message.includes('already exists')) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    if (
      error.message === 'Invalid email or password' ||
      error.message.includes('admin portal')
    ) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginAdmin({ email, password });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Admin login successful',
      data: result
    });
  } catch (error) {
    if (error.message === 'Invalid admin credentials') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id || req.user._id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'User not found'
      });
    }
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword({
      userId: req.user.id || req.user._id,
      currentPassword,
      newPassword
    });
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    if (
      error.message === 'Current password is incorrect' ||
      error.message === 'User not found'
    ) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { username, email, avatar } = req.body;
    const user = await authService.updateProfile({
      userId: req.user.id || req.user._id,
      username,
      email,
      avatar
    });
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Email or username is already in use') {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Token is required'
      });
    }
    const result = await authService.refreshToken(token);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result
    });
  } catch (error) {
    if (
      error.message === 'Token is required' ||
      error.message === 'Invalid or expired token'
    ) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};
