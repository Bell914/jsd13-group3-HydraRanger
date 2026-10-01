import mongoose from 'mongoose';

const lookbookItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    defaultVariantSku: { type: String, required: true }
  },
  { _id: false }
);

const lookbookSchema = new mongoose.Schema(
  {
    lookbookId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    nameTh: { type: String, required: true },
    concept: { type: String, required: true },
    occasion: [{ type: String }],
    styleTags: [{ type: String }],
    imageUrl: { type: String, required: true },
    items: { type: [lookbookItemSchema], required: true },
    regularPrice: { type: Number, required: true },
    setPrice: { type: Number, required: true },
    saving: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Lookbook = mongoose.models.Lookbook || mongoose.model('Lookbook', lookbookSchema);
