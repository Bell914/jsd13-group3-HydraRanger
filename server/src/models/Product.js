import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    colorCode: { type: String, trim: true, default: '' },
    size: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, trim: true, default: '' },
    detailImages: [{ type: String, trim: true }]
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['unisex', 'women', 'men'], default: 'unisex' },
    tags: [{ type: String, trim: true }],
    availableDate: { type: Date, required: true },
    imageUrl: { type: String, trim: true, default: '' },
    variants: {
      type: [variantSchema],
      validate: {
        validator: (variants) => variants.length > 0,
        message: 'At least one product variant is required'
      }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

productSchema.index({ 'variants.sku': 1 }, { unique: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
