import { HTTP_STATUS } from "../config/constants.js";
import * as userService from "../services/userService.js";
import { User } from "../models/User.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res
      .status(HTTP_STATUS.OK)
      .json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const requesterId = String(req.user?.id || req.user?._id || "");
    const isAdmin = req.user?.role === "admin";
    if (!isAdmin && requesterId !== String(req.params.id)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "You can only access your own customer profile",
      });
    }

    const user = await userService.getUserById(req.params.id, !isAdmin);
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "User not found" });
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
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "User not found" });
    }
    return res
      .status(HTTP_STATUS.OK)
      .json({ success: true, data: user.shippingAddresses || [] });
  } catch (error) {
    return next(error);
  }
};

function validateAddress(body) {
  const address = {
    recipientName: String(body.recipientName || "").trim(),
    phone: String(body.phone || "").trim(),
    addressDetail: String(body.addressDetail ?? body.addressLine ?? "").trim(),
    subdistrict: String(body.subdistrict || "").trim(),
    district: String(body.district || "").trim(),
    province: String(body.province || "").trim(),
    postalCode: String(body.zipCode ?? body.postalCode ?? "").trim(),
    isDefault: Boolean(body.isDefault),
  };

  if (!address.recipientName) return { error: "กรุณากรอกชื่อผู้รับ" };
  if (!/^[0-9]{9,10}$/.test(address.phone)) {
    return { error: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 9-10 หลัก" };
  }
  if (!/^[0-9]{5}$/.test(address.postalCode)) {
    return { error: "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก" };
  }
  if (!address.addressDetail || !address.district || !address.province) {
    return { error: "กรุณากรอกที่อยู่ อำเภอ/เขต และจังหวัดให้ครบถ้วน" };
  }

  return { address };
}

function sendAddressError(res, message) {
  return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message });
}

export const addAddress = async (req, res, next) => {
  try {
    const result = validateAddress(req.body);
    if (result.error) return sendAddressError(res, result.error);
    const address = result.address;

    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "User not found" });
    }

    const shouldBeDefault =
      address.isDefault || user.shippingAddresses.length === 0;
    if (shouldBeDefault) {
      user.shippingAddresses.forEach((address) => {
        address.isDefault = false;
      });
    }

    user.shippingAddresses.push({
      ...address,
      addressLine: address.addressDetail,
      isDefault: shouldBeDefault,
    });
    await user.save();

    return res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Address added successfully",
      data: user.shippingAddresses,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "User not found" });
    }

    const originalLength = user.shippingAddresses.length;
    user.shippingAddresses = user.shippingAddresses.filter(
      (address) => String(address._id) !== String(req.params.addressId),
    );
    if (user.shippingAddresses.length === originalLength) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Address not found" });
    }

    if (
      user.shippingAddresses.length > 0 &&
      !user.shippingAddresses.some((address) => address.isDefault)
    ) {
      user.shippingAddresses[0].isDefault = true;
    }
    await user.save();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Address deleted successfully",
      data: user.shippingAddresses,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const result = validateAddress(req.body);
    if (result.error) return sendAddressError(res, result.error);
    const address = result.address;
    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "User not found" });
    const target = user.shippingAddresses.id(req.params.addressId);
    if (!target)
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Address not found" });
    if (address.isDefault) {
      user.shippingAddresses.forEach((savedAddress) => {
        savedAddress.isDefault = false;
      });
    }
    Object.assign(target, {
      ...address,
      addressLine: address.addressDetail,
      ...(address.isDefault ? { isDefault: true } : {}),
    });
    await user.save();
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Address updated successfully",
      data: user.shippingAddresses,
    });
  } catch (error) {
    return next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id || req.user?._id);
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "User not found" });
    }

    const addressExists = user.shippingAddresses.some(
      (address) => String(address._id) === String(req.params.addressId),
    );
    if (!addressExists) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Address not found" });
    }

    user.shippingAddresses.forEach((address) => {
      address.isDefault = String(address._id) === String(req.params.addressId);
    });
    await user.save();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Default address updated",
      data: user.shippingAddresses,
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
    const profile = await userService.getSizeProfile(
      req.user.id || req.user._id,
    );
    res.status(HTTP_STATUS.OK).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

export const saveMySizeProfile = async (req, res, next) => {
  try {
    const profile = await userService.saveSizeProfile(
      req.user.id || req.user._id,
      req.body,
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Size profile saved successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMySizeProfile = async (req, res, next) => {
  try {
    await userService.deleteSizeProfile(req.user.id || req.user._id);
    res
      .status(HTTP_STATUS.OK)
      .json({ success: true, message: "Size profile deleted successfully" });
  } catch (error) {
    next(error);
  }
};
