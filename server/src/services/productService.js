import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

export async function getProducts({ includeInactive = false, category, search } = {}) {
  const filter = includeInactive ? {} : { isActive: true };
  if (category && category !== 'all') {
    filter.category = category;
  }
  if (search && search.trim()) {
    filter.name = { $regex: search.trim(), $options: 'i' };
  }
  return Product.find(filter).sort({ createdAt: -1 });
}

export async function getProductById(id) {
  let product = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id);
  }
  if (!product) {
    product = await Product.findOne({ productId: id });
  }
  if (!product || !product.isActive) throw new Error('Product not found');
  return product;
}

export async function createProduct(productData) {
  const productId = productData.productId || `product-${Date.now()}`;
  return Product.create({ ...productData, productId });
}

export async function updateProduct(id, productData) {
  const product = await Product.findByIdAndUpdate(id, productData, {
    new: true,
    runValidators: true
  });
  if (!product) throw new Error('Product not found');
  return product;
}

export async function deleteProduct(id) {
  const product = await Product.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!product) throw new Error('Product not found');
  return product;
}
