import { HTTP_STATUS } from '../config/constants.js';
import * as userService from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const requesterId = String(req.user?.id || req.user?._id || '');
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && requesterId !== String(req.params.id)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: 'You can only access your own customer profile'
      });
    }

    const user = await userService.getUserById(req.params.id, !isAdmin);
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

export const getMySizeProfile = async (req, res, next) => {
  try {
    const profile = await userService.getSizeProfile(req.user.id || req.user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const saveMySizeProfile = async (req, res, next) => {
  try {
    const profile = await userService.saveSizeProfile(
      req.user.id || req.user._id,
      req.body
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Size profile saved successfully',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMySizeProfile = async (req, res, next) => {
  try {
    await userService.deleteSizeProfile(req.user.id || req.user._id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Size profile deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
