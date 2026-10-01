import mongoose from 'mongoose';
import { Lookbook } from '../models/Lookbook.js';
import { Product } from '../models/Product.js';

function populateLookbook(query) {
  return query.populate('items.product');
}

async function prepareItems(items = []) {
  const preparedItems = [];

  for (const item of items) {
    let product = null;

    if (mongoose.Types.ObjectId.isValid(item.product)) {
      product = await Product.findById(item.product);
    }
    if (!product && item.productId) {
      product = await Product.findOne({ productId: item.productId });
    }
    if (!product) {
      throw new Error('Invalid product in Lookbook');
    }

    const variantExists = product.variants.some((variant) => {
      return variant.sku === item.defaultVariantSku;
    });
    if (!variantExists) {
      throw new Error(`Variant ${item.defaultVariantSku} was not found`);
    }

    preparedItems.push({
      product: product._id,
      defaultVariantSku: item.defaultVariantSku,
    });
  }

  return preparedItems;
}

async function prepareLookbookData(data) {
  const setPrice = Number(data.setPrice);
  const regularPrice = Number(data.regularPrice);

  return {
    lookbookId: data.lookbookId.trim().toUpperCase(),
    name: data.name.trim(),
    nameTh: data.nameTh.trim(),
    concept: data.concept.trim(),
    occasion: data.occasion || [],
    styleTags: data.styleTags || [],
    imageUrl: data.imageUrl.trim(),
    items: await prepareItems(data.items),
    regularPrice,
    setPrice,
    saving: Math.max(0, regularPrice - setPrice),
    isActive: data.isActive ?? true,
  };
}

export function getPublicLookbooks() {
  return populateLookbook(
    Lookbook.find({ isActive: { $ne: false } }).sort({ createdAt: 1 })
  );
}

export async function getPublicLookbookById(id) {
  const lookbook = await populateLookbook(Lookbook.findOne({
    isActive: { $ne: false },
    $or: [
      { lookbookId: id.toUpperCase() },
      { name: { $regex: `^${id.replace(/[-_]/g, ' ')}$`, $options: 'i' } },
    ],
  }));

  if (!lookbook) throw new Error('Lookbook not found');
  return lookbook;
}

export function getAdminLookbooks() {
  return populateLookbook(Lookbook.find().sort({ createdAt: -1 }));
}

export async function createLookbook(data) {
  const preparedData = await prepareLookbookData(data);
  const lookbook = await Lookbook.create(preparedData);
  return populateLookbook(Lookbook.findById(lookbook._id));
}

export async function updateLookbook(id, data) {
  const preparedData = await prepareLookbookData(data);
  const lookbook = await populateLookbook(Lookbook.findByIdAndUpdate(id, preparedData, {
    new: true,
    runValidators: true,
  }));

  if (!lookbook) throw new Error('Lookbook not found');
  return lookbook;
}

export async function updateLookbookStatus(id, isActive) {
  const lookbook = await populateLookbook(Lookbook.findByIdAndUpdate(
    id,
    { isActive },
    { new: true, runValidators: true }
  ));

  if (!lookbook) throw new Error('Lookbook not found');
  return lookbook;
}
