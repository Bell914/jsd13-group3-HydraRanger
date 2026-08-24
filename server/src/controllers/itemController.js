import { HTTP_STATUS } from '../config/constants.js';
import * as itemService from '../services/itemService.js';

export const getItems = async (req, res, next) => {
  try {
    const { page, limit, category, status, search } = req.query;
    const result = await itemService.getItems({ page, limit, category, status, search });
    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: result.items.length,
      pagination: result.pagination,
      data: result.items
    });
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req, res, next) => {
  try {
    const item = await itemService.getItemById(req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: item
    });
  } catch (error) {
    if (error.message === 'Item not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const createItem = async (req, res, next) => {
  try {
    const newItem = await itemService.createItem(req.body, req.user);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Item created successfully',
      data: newItem
    });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const updated = await itemService.updateItem(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Item updated successfully',
      data: updated
    });
  } catch (error) {
    if (error.message === 'Item not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    await itemService.deleteItem(req.params.id);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    if (error.message === 'Item not found') {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};
