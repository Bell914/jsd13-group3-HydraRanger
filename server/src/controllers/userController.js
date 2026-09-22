import { HTTP_STATUS } from '../config/constants.js';
import * as userService from '../services/userService.js';
import { User } from '../models/User.js';

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

<<<<<<< HEAD
// ==========================================
// Shipping Address Management Controllers
// ==========================================

// GET /api/users/addresses - ดึงรายการที่อยู่จัดส่งทั้งหมด
export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: user.shippingAddresses || []
    });
=======
export const getMySizeProfile = async (req, res, next) => {
  try {
    const profile = await userService.getSizeProfile(req.user.id || req.user._id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: profile });
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
// POST /api/users/addresses - เพิ่มที่อยู่จัดส่งใหม่
export const addAddress = async (req, res, next) => {
  try {
    const { recipientName, phone, addressLine, district, province, postalCode, isDefault } = req.body;

    if (!recipientName || !phone || !addressLine || !postalCode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please provide recipientName, phone, addressLine, and postalCode'
      });
    }

    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    // ถ้าตั้งให้เป็นที่อยู่หลัก หรือยังไม่มีที่อยู่เลย ให้เคลียร์ที่อยู่อื่นไม่ให้เป็น default
    if (isDefault || !user.shippingAddresses || user.shippingAddresses.length === 0) {
      user.shippingAddresses.forEach((addr) => (addr.isDefault = false));
    }

    const newAddress = {
      recipientName,
      phone,
      addressLine,
      district: district || '',
      province: province || '',
      postalCode,
      isDefault: isDefault || user.shippingAddresses.length === 0
    };

    user.shippingAddresses.push(newAddress);
    await user.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Address added successfully',
      data: user.shippingAddresses
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/addresses/:addressId - ลบที่อยู่จัดส่ง
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    user.shippingAddresses = user.shippingAddresses.filter(
      (addr) => addr._id.toString() !== addressId
    );

    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.shippingAddresses
=======
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
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0
    });
  } catch (error) {
    next(error);
  }
};

<<<<<<< HEAD
// PATCH /api/users/addresses/:addressId/default - ตั้งค่าเป็นที่อยู่หลัก
export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    user.shippingAddresses.forEach((addr) => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Default address updated',
      data: user.shippingAddresses
=======
export const deleteMySizeProfile = async (req, res, next) => {
  try {
    await userService.deleteSizeProfile(req.user.id || req.user._id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Size profile deleted successfully'
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0
    });
  } catch (error) {
    next(error);
  }
<<<<<<< HEAD
};
=======
};
>>>>>>> 9abd5a0233e221df2af334ab8ff7fce6b26e14c0
