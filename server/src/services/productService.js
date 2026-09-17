import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

function getCategoryName(slug) {
  if (slug === 'tops') return 'Tops';
  if (slug === 'bottoms') return 'Bottoms';
  return slug;
}

async function findCategoryId(productData) {
  const categoryId = productData.category_id;

  if (mongoose.Types.ObjectId.isValid(categoryId)) {
    return categoryId;
  }

  const categorySlug = productData.category?.slug || productData.category;
  if (!categorySlug) return null;

  const category = await Category.findOneAndUpdate(
    { slug: categorySlug },
    { $setOnInsert: { name: getCategoryName(categorySlug), slug: categorySlug } },
    { upsert: true, new: true, runValidators: true }
  );

  return category._id;
}

function prepareImages(productData) {
  if (Array.isArray(productData.images) && productData.images.length > 0) {
    return productData.images;
  }

  const imageUrls = [];
  if (productData.imageUrl) imageUrls.push(productData.imageUrl);

  for (const variant of productData.variants || []) {
    if (variant.imageUrl) imageUrls.push(variant.imageUrl);
    if (Array.isArray(variant.detailImages)) {
      imageUrls.push(...variant.detailImages);
    }
  }

  return [...new Set(imageUrls.filter(Boolean))].map((imageUrl, index) => ({
    image_url: imageUrl,
    display_order: index
  }));
}

function prepareVariants(variants = []) {
  return variants.map((variant) => ({
    sku: variant.sku,
    size_or_color: variant.size_or_color || variant.size || variant.color,
    price: variant.price,
    stock_quantity: variant.stock_quantity ?? variant.stockQuantity ?? 0
  }));
}

async function prepareProductData(productData) {
  return {
    category_id: await findCategoryId(productData),
    title: productData.title || productData.name,
    description: productData.description || '',
    tags: Array.isArray(productData.tags) ? productData.tags : [],
    is_active: productData.is_active ?? productData.isActive ?? true,
    images: prepareImages(productData),
    variants: prepareVariants(productData.variants),
    size_chart: productData.size_chart || []
  };
}

export async function getProducts({ includeInactive = false, category, search } = {}) {
  const filter = includeInactive ? {} : { is_active: { $ne: false } };

  if (category && category !== 'all') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category_id = category;
    } else {
      const categoryDocument = await Category.findOne({ slug: category });
      if (categoryDocument) {
        filter.category_id = categoryDocument._id;
      }
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
  const data = await prepareProductData(productData);
  data.productId = productData.productId || `product-${Date.now()}`;
  const product = await Product.create(data);
  return Product.findById(product._id).populate('category_id');
}

export async function updateProduct(id, productData) {
  const data = await prepareProductData(productData);

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
