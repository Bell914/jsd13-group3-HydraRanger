import { HTTP_STATUS } from '../config/constants.js';
import * as customerService from '../services/customerService.js';

function sendCustomerError(error, res, next) {
  if (error.message === 'Customer not found') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: error.message });
  }
  if (
    error.message === 'isActive must be true or false' ||
    error.message === 'Username must be at least 3 characters'
  ) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: error.message });
  }
  if (error.code === 11000) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      message: 'Username is already in use'
    });
  }
  return next(error);
}

export async function getCustomers(req, res, next) {
  try {
    const customers = await customerService.getCustomers();
    res.status(HTTP_STATUS.OK).json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    sendCustomerError(error, res, next);
  }
}

export async function updateCustomerStatus(req, res, next) {
  try {
    const customer = await customerService.updateCustomerStatus(
      req.params.id,
      req.body.isActive
    );
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Customer status updated successfully',
      data: customer
    });
  } catch (error) {
    sendCustomerError(error, res, next);
  }
}
