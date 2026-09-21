import { HTTP_STATUS } from '../config/constants.js';
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
