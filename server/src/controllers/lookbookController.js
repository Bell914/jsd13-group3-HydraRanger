import mongoose from 'mongoose';
import { HTTP_STATUS } from '../config/constants.js';
import { Lookbook } from '../models/Lookbook.js';
import { User } from '../models/User.js';
import * as lookbookService from '../services/lookbookService.js';

function handleLookbookError(error, res, next) {
  if (error.message === 'Lookbook not found') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: error.message });
  }
  if (error.message.startsWith('Invalid product') || error.message.startsWith('Variant ')) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
  }
  return next(error);
}

// GET /api/lookbooks - ดึงรายการ Lookbook (Public)
export async function getLookbooks(req, res, next) {
  try {
    const lookbooks = await lookbookService.getPublicLookbooks();
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbooks });
  } catch (error) {
    next(error);
  }
}

// GET /api/lookbooks/:id - ดึง Lookbook ตาม ID (Public)
export async function getLookbookById(req, res, next) {
  try {
    const lookbook = await lookbookService.getPublicLookbookById(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbook });
  } catch (error) {
    handleLookbookError(error, res, next);
  }
}

// GET /api/lookbooks/admin - ดึงรายการ Lookbook (Admin)
export async function getAdminLookbooks(req, res, next) {
  try {
    const lookbooks = await lookbookService.getAdminLookbooks();
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbooks });
  } catch (error) {
    next(error);
  }
}

// POST /api/lookbooks - สร้าง Lookbook (Admin)
export async function createLookbook(req, res, next) {
  try {
    const lookbook = await lookbookService.createLookbook(req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: lookbook });
  } catch (error) {
    handleLookbookError(error, res, next);
  }
}

// PUT /api/lookbooks/:id - แก้ไข Lookbook (Admin)
export async function updateLookbook(req, res, next) {
  try {
    const lookbook = await lookbookService.updateLookbook(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbook });
  } catch (error) {
    handleLookbookError(error, res, next);
  }
}

// PATCH /api/lookbooks/:id/status - อัปเดตสถานะ Lookbook (Admin)
export async function updateLookbookStatus(req, res, next) {
  try {
    const lookbook = await lookbookService.updateLookbookStatus(req.params.id, req.body.isActive);
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbook });
  } catch (error) {
    handleLookbookError(error, res, next);
  }
}

// POST /api/lookbooks/:id/favorite - บันทึก / ยกเลิกบันทึก Lookbook (Toggle)
export async function toggleFavoriteLookbook(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const requestedId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    if (!user.favoriteLookbooks) {
      user.favoriteLookbooks = [];
    }

    // ค้นหา Lookbook ทั้งแบบ ObjectId และ lookbookId (เช่น LOOK-001)
    const lookbook = mongoose.Types.ObjectId.isValid(requestedId)
      ? await Lookbook.findById(requestedId)
      : await Lookbook.findOne({ lookbookId: String(requestedId).toUpperCase() });

    const targetId = lookbook ? String(lookbook._id) : String(requestedId);

    const existingIndex = user.favoriteLookbooks.findIndex(
      (favId) => String(favId) === targetId
    );

    const isFavorited = existingIndex === -1;

    if (isFavorited) {
      user.favoriteLookbooks.push(targetId);
    } else {
      user.favoriteLookbooks.splice(existingIndex, 1);
    }

    await user.save();

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: isFavorited ? 'Saved to Favorite Lookbooks' : 'Removed from Favorite Lookbooks',
      isFavorited,
      favoriteLookbooks: user.favoriteLookbooks
    });
  } catch (error) {
    return next(error);
  }
}

