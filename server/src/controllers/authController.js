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
    if (error.message === 'Invalid email or password') {
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

export const getMe = async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: req.user
  });
};
