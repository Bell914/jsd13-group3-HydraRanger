import { HTTP_STATUS } from '../config/constants.js';
import { User } from '../models/User.js';
import * as userService from '../services/userService.js';

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.status(HTTP_STATUS.OK).json({ success: true, count: users.length, data: users });
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
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }
    return res.status(HTTP_STATUS.OK).json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

export const getAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }
    return res.status(HTTP_STATUS.OK).json({ success: true, data: user.shippingAddresses || [] });
  } catch (error) {
    return next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const { recipientName, phone, addressLine, district, province, postalCode, isDefault } = req.body;
    if (!recipientName || !phone || !addressLine || !postalCode) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please provide recipientName, phone, addressLine, and postalCode'
      });
    }

    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    const shouldBeDefault = Boolean(isDefault) || user.shippingAddresses.length === 0;
    if (shouldBeDefault) {
      user.shippingAddresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.shippingAddresses.push({
      recipientName,
      phone,
      addressLine,
      district: district || '',
      province: province || '',
      postalCode,
      isDefault: shouldBeDefault
    });
    await user.save();

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Address added successfully',
      data: user.shippingAddresses
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    const originalLength = user.shippingAddresses.length;
    user.shippingAddresses = user.shippingAddresses.filter(
      (address) => String(address._id) !== String(req.params.addressId)
    );
    if (user.shippingAddresses.length === originalLength) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Address not found' });
    }

    if (user.shippingAddresses.length > 0 && !user.shippingAddresses.some((address) => address.isDefault)) {
      user.shippingAddresses[0].isDefault = true;
    }
    await user.save();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Address deleted successfully',
      data: user.shippingAddresses
    });
  } catch (error) {
    return next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    const addressExists = user.shippingAddresses.some(
      (address) => String(address._id) === String(req.params.addressId)
    );
    if (!addressExists) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Address not found' });
    }

    user.shippingAddresses.forEach((address) => {
      address.isDefault = String(address._id) === String(req.params.addressId);
    });
    await user.save();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Default address updated',
      data: user.shippingAddresses
    });
  } catch (error) {
    return next(error);
  }
};

// ==========================================
// Size Profile Controllers
// ==========================================

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
    const profile = await userService.saveSizeProfile(req.user.id || req.user._id, req.body);
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
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Size profile deleted successfully' });
  } catch (error) {
    next(error);
  }
};