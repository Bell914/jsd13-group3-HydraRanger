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
    const user = await userService.getUserById(req.params.id);
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
