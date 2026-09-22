import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../config/constants.js';

// Schema สำหรับ Size Profile
const sizeProfileSchema = new mongoose.Schema(
  {
    chestCm: { type: Number, min: 60, max: 160, required: true },
    waistCm: { type: Number, min: 50, max: 160, required: true },
    hipsCm: { type: Number, min: 60, max: 180, required: true },
    preferredFit: {
      type: String,
      enum: ['fitted', 'regular', 'relaxed'],
      default: 'regular'
    },
    consentGiven: { type: Boolean, required: true },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

// Schema สำหรับ Shipping Address
const shippingAddressSchema = new mongoose.Schema({
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  addressLine: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER
    },
    avatar: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    sizeProfile: {
      type: sizeProfileSchema,
      default: undefined
    },

    // ==========================================
    // เพิ่มเติม: Shipping Addresses & Favorite Lookbooks (Sprint 1 & 2)
    // ==========================================
    addresses: [shippingAddressSchema],
    favoriteLookbooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lookbook'
      }
    ],

    // ==========================================
    // เพิ่มเติม: Forgot / Reset Password Fields
    // ==========================================
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Hash password ก่อน save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method เปรียบเทียบรหัสผ่าน
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);