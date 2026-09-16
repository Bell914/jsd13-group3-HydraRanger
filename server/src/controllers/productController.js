import { HTTP_STATUS } from '../config/constants.js';
import * as productService from '../services/productService.js';

function sendProductError(error, res, next) {
  if (error.message === 'Product not found') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: error.message });
  }
  return next(error);
}

export async function getProducts(req, res, next) {
  try {
    const products = await productService.getProducts();
    res.status(HTTP_STATUS.OK).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function getAdminProducts(req, res, next) {
  try {
    const products = await productService.getProducts();
    res.status(HTTP_STATUS.OK).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, data: product });
  } catch (error) {
    sendProductError(error, res, next);
  }
}

export async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    sendProductError(error, res, next);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    res.status(HTTP_STATUS.OK).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    sendProductError(error, res, next);
  }
}
