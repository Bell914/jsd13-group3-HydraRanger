import mongoose from 'mongoose';
import { ITEM_STATUS, ITEM_PRIORITY, ITEM_CATEGORIES } from '../config/constants.js';

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Item title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      enum: ITEM_CATEGORIES,
      default: 'General'
    },
    status: {
      type: String,
      enum: Object.values(ITEM_STATUS),
      default: ITEM_STATUS.TODO
    },
    priority: {
      type: String,
      enum: Object.values(ITEM_PRIORITY),
      default: ITEM_PRIORITY.MEDIUM
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    creatorName: {
      type: String,
      default: 'HydraRanger Team'
    }
  },
  {
    timestamps: true
  }
);

export const Item = mongoose.models.Item || mongoose.model('Item', itemSchema);
