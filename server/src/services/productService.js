import { Product } from '../models/Product.js';

export async function getProducts({ includeInactive = false } = {}) {
  const filter = includeInactive ? {} : { isActive: true };
  return Product.find(filter).sort({ createdAt: -1 });
}

export async function getProductById(id) {
  const product = await Product.findById(id);
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
