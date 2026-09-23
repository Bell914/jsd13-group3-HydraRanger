import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    image_url: { type: String, required: true, trim: true },
    display_order: { type: Number, default: 0 }
  },
  { _id: false }
);

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    size_or_color: { type: String, required: true, trim: true },
    size: { type: String, default: '', trim: true },
    color: { type: String, default: '', trim: true },
    colorCode: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    stock_quantity: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String, default: '', trim: true },
    detailImages: { type: [String], default: [] }
  },
  {
    _id: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

variantSchema.virtual('stockQuantity').get(function () {
  return this.stock_quantity;
});

const sizeChartSchema = new mongoose.Schema(
  {
    size_name: { type: String, required: true, trim: true },
    garment_chest_actual: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // Kept for compatibility with existing product URLs and the productId_1 index.
    productId: { type: String, unique: true, trim: true },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    gender: {
      type: String,
      trim: true,
      default: 'unisex'
    },
    availableDate: {
      type: Date
    },
    is_active: {
      type: Boolean,
      default: true
    },
    images: [imageSchema],
    variants: {
      type: [variantSchema],
      validate: {
        validator: (variants) => Array.isArray(variants) && variants.length > 0,
        message: 'At least one product variant is required'
      }
    },
    size_chart: [sizeChartSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
productSchema.index({ category_id: 1 });
productSchema.index({ 'variants.sku': 1 }, { unique: true, sparse: true });

// Virtuals for backwards-compatibility with existing frontend/services
productSchema.virtual('name').get(function () {
  return this.title;
});

productSchema.virtual('imageUrl').get(function () {
  if (this.images && this.images.length > 0) {
    const sorted = [...this.images].sort(
      (a, b) => (a.display_order || 0) - (b.display_order || 0)
    );
    return sorted[0].image_url;
  }
  return '';
});

productSchema.virtual('isActive').get(function () {
  return this.is_active;
});

export const Product =
  mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
