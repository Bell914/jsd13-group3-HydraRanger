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

export async function getLookbooks(req, res, next) {
  try {
    const lookbooks = await lookbookService.getPublicLookbooks();
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbooks });
  } catch (error) {
    next(error);
  }
}

export async function getLookbookById(req, res, next) {
  try {
    const lookbook = await lookbookService.getPublicLookbookById(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbook });
  } catch (error) {
    handleLookbookError(error, res, next);
  }
}

export async function getAdminLookbooks(req, res, next) {
  try {
    const lookbooks = await lookbookService.getAdminLookbooks();
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbooks });
  } catch (error) {
    next(error);
  }
}

export async function createLookbook(req, res, next) {
  try {
    const lookbook = await lookbookService.createLookbook(req.body);
    res.status(HTTP_STATUS.CREATED).json({ success: true, data: lookbook });
  } catch (error) {
    handleLookbookError(error, res, next);
  }
}

export async function updateLookbook(req, res, next) {
  try {
    const lookbook = await lookbookService.updateLookbook(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbook });
  } catch (error) {
    handleLookbookError(error, res, next);
  }
}

export async function updateLookbookStatus(req, res, next) {
  try {
    const lookbook = await lookbookService.updateLookbookStatus(req.params.id, req.body.isActive);
    res.status(HTTP_STATUS.OK).json({ success: true, data: lookbook });
  } catch (error) {
    handleLookbookError(error, res, next);
  }
}

export async function toggleFavoriteLookbook(req, res, next) {
  try {
    const userId = req.user?._id || req.user?.id;
    const requestedId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'User not found' });
    }

    const lookbook = mongoose.Types.ObjectId.isValid(requestedId)
      ? await Lookbook.findById(requestedId)
      : await Lookbook.findOne({ lookbookId: requestedId.toUpperCase() });
    if (!lookbook) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Lookbook not found' });
    }

    const existingIndex = user.favoriteLookbooks.findIndex(
      (favoriteId) => String(favoriteId) === String(lookbook._id)
    );
    const isFavorited = existingIndex === -1;

    if (isFavorited) user.favoriteLookbooks.push(lookbook._id);
    else user.favoriteLookbooks.splice(existingIndex, 1);

    await user.save();
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: isFavorited ? 'Saved to Favorite Lookbooks' : 'Removed from Favorite Lookbooks',
      data: { isFavorited, favoriteLookbooks: user.favoriteLookbooks }
    });
  } catch (error) {
    return next(error);
  }
}

