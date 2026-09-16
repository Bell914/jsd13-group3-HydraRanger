import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

export async function getProducts({ includeInactive = false, category, search } = {}) {
  const filter = includeInactive ? {} : { is_active: { $ne: false } };

  if (category && category !== 'all') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category_id = category;
    } else {
      filter.$or = [
        { category: category },
        { 'category_id.slug': category }
      ];
    }
  }

  if (search && search.trim()) {
    const searchRegex = { $regex: search.trim(), $options: 'i' };
    filter.$or = [
      ...(filter.$or || []),
      { title: searchRegex },
      { name: searchRegex },
      { description: searchRegex }
    ];
  }

  return Product.find(filter)
    .populate('category_id')
    .sort({ createdAt: -1 });
}

export async function getProductById(id) {
  let product = null;
  if (mongoose.Types.ObjectId.isValid(id)) {
    product = await Product.findById(id).populate('category_id');
  }
  if (!product) {
    product = await Product.findOne({
      $or: [{ productId: id }, { 'variants.sku': id }]
    }).populate('category_id');
  }
  if (!product || product.is_active === false) {
    throw new Error('Product not found');
  }
  return product;
}

export async function createProduct(productData) {
  // Support both title/name and is_active/isActive
  const data = {
    ...productData,
    title: productData.title || productData.name,
    is_active: productData.is_active ?? productData.isActive ?? true
  };
  return Product.create(data);
}

export async function updateProduct(id, productData) {
  const data = {
    ...productData
  };
  if (productData.name && !productData.title) data.title = productData.name;
  if (productData.isActive !== undefined && productData.is_active === undefined) {
    data.is_active = productData.isActive;
  }

  const product = await Product.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  }).populate('category_id');

  if (!product) throw new Error('Product not found');
  return product;
}

export async function deleteProduct(id) {
  const product = await Product.findByIdAndUpdate(
    id,
    { is_active: false },
    { new: true }
  );
  if (!product) throw new Error('Product not found');
  return product;
}
