import mongoose from 'mongoose';

const stockAdjustmentSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    change_amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      enum: ['restock', 'damaged', 'returned', 'count_adj'],
      required: true
    }
  },
  { timestamps: true }
);

export const StockAdjustment =
  mongoose.models.StockAdjustment ||
  mongoose.model('StockAdjustment', stockAdjustmentSchema);

export default StockAdjustment;
