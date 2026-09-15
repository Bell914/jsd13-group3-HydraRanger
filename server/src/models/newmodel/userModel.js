import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // ✅ เอา unique: true ออกแล้ว
    cartData: { type: Object, default: {} },
  },
  { minimize: false },
);

// ป้องกันการ Re-compile model กรณีที่มีการ hot-reload ใน development
const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
