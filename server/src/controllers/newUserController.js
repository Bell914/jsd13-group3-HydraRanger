import userModel from "../models/newmodel/userModel.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// สร้าง JWT Token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your_jwt_secret_key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
};

// 🟢 Route for User Register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. ตรวจสอบว่าใส่ข้อมูลครบถ้วนหรือไม่
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // 2. ตรวจสอบว่ามี user นี้ในระบบหรือยัง
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // 3. ตรวจสอบรูปแบบ Email และความยาว Password
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Please enter a strong password (at least 8 characters)",
      });
    }

    // 4. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const user = await newUser.save();
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔵 Route for User Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. ค้นหา User จาก Email
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }

    // 2. เปรียบเทียบ Password ดิบกับ Hashed Password ใน DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // 3. สร้าง Token และส่งกลับไปให้ Client
    const token = createToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔴 Route for User Logout
const logOutUser = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, logOutUser };
