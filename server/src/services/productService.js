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

export function prepareVariants(variants = []) {
  return variants.map((variant) => {
    const preparedVariant = {
      sku: variant.sku,
      size_or_color: variant.size_or_color || variant.size || variant.color || 'Standard',
      size: variant.size || (['S', 'M', 'L', 'XL'].includes(variant.size_or_color) ? variant.size_or_color : (variant.size_or_color || 'S')),
      color: variant.color || (variant.size_or_color && !['S', 'M', 'L', 'XL'].includes(variant.size_or_color) ? variant.size_or_color : 'Standard'),
      colorCode: variant.colorCode || '',
      price: variant.price,
      stock_quantity: variant.stock_quantity ?? variant.stockQuantity ?? 0,
      imageUrl: variant.imageUrl || '',
      detailImages: Array.isArray(variant.detailImages) ? variant.detailImages : []
    };

    if (mongoose.Types.ObjectId.isValid(variant._id)) {
      preparedVariant._id = variant._id;
    }

    return preparedVariant;
  });
}

async function prepareProductData(productData, { isUpdate = false } = {}) {
  const data = {
    category_id: await findCategoryId(productData),
    title: productData.title || productData.name,
    description: productData.description || '',
    gender: productData.gender || 'unisex',
    tags: Array.isArray(productData.tags)
      ? productData.tags.map((tag) => (typeof tag === 'string' ? tag.trim() : tag)).filter(Boolean)
      : [],
    availableDate: productData.availableDate ? new Date(productData.availableDate) : undefined,
    images: prepareImages(productData),
    variants: prepareVariants(productData.variants)
  };

  const activeState = productData.is_active ?? productData.isActive;
  if (!isUpdate || activeState !== undefined) {
    data.is_active = activeState ?? true;
  }

  if (!isUpdate || productData.size_chart !== undefined) {
    data.size_chart = productData.size_chart || [];
  }

  return data;
}

export async function getProducts({ includeInactive = false, category, search } = {}) {
  const filter = includeInactive ? {} : { is_active: { $ne: false } };

  if (category && category !== 'all') {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.category_id = category;
    } else {
      const escapedCategory = category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const categoryDocument = await Category.findOne({
        slug: { $regex: new RegExp(`^${escapedCategory}$`, 'i') }
      });
      if (categoryDocument) {
        filter.category_id = categoryDocument._id;
      } else {
        const categoryByName = await Category.findOne({
          name: { $regex: new RegExp(`^${escapedCategory}$`, 'i') }
        });
        if (categoryByName) {
          filter.category_id = categoryByName._id;
        } else {
          // Explicitly assign non-matching ObjectId so it won't fall back to returning all products
          filter.category_id = new mongoose.Types.ObjectId();
        }
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
    let altId = id;
    if (/^\d+$/.test(String(id || '').trim())) {
      const num = Number(id);
      altId = num <= 5 ? `top-00${num}` : `bottom-00${num - 5}`;
    }
    product = await Product.findOne({
      $or: [{ productId: id }, { productId: altId }, { 'variants.sku': id }]
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
  const data = await prepareProductData(productData, { isUpdate: true });

  // An omitted chart means keep the existing chart; [] explicitly clears it.
  if (productData.size_chart === undefined) {
    delete data.size_chart;
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
  ).populate('category_id');
  if (!product) throw new Error('Product not found');
  return product;
}
