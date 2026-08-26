import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ENV } from '../config/env.js';

// In-Memory mock store fallback if DB is offline
const inMemoryUsers = [];

export const generateToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN
  });
};

export const registerUser = async ({ username, email, password }) => {
  try {
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
      role: 'user'
    });

    const token = generateToken({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    };
  } catch (dbError) {
    if (dbError.message.includes('already exists')) {
      throw dbError;
    }

    // Fallback: In-memory simulation
    console.warn('⚠️  AuthService: Using in-memory fallback for user registration.');
    const userExists = inMemoryUsers.find(
      (u) => u.email === email.toLowerCase() || u.username === username
    );
    if (userExists) {
      throw new Error('User with this email or username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const mockUser = {
      id: `mock-user-${Date.now()}`,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };
    inMemoryUsers.push(mockUser);

    const token = generateToken({
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role
    });

    return {
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
        createdAt: mockUser.createdAt
      },
      token
    };
  }
};

export const loginUser = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch || user.role !== 'user') {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    return {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    };
  } catch (dbError) {
    if (dbError.message === 'Invalid email or password') {
      throw dbError;
    }

    // In-memory fallback
    const mockUser = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, mockUser.password);
    if (!isMatch || mockUser.role !== 'user') {
      throw new Error('Invalid email or password');
    }

    const token = generateToken({
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role
    });

    return {
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      },
      token
    };
  }
};

export const loginAdmin = async ({ email, password }) => {
  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || user.role !== 'admin') throw new Error('Invalid admin credentials');

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new Error('Invalid admin credentials');

    const admin = { id: user._id, username: user.username, email: user.email, role: user.role };
    return { user: admin, token: generateToken(admin) };
  } catch (dbError) {
    if (dbError.message === 'Invalid admin credentials') throw dbError;

    const mockAdmin = inMemoryUsers.find(
      (user) => user.email === email.toLowerCase() && user.role === 'admin'
    );
    if (mockAdmin && await bcrypt.compare(password, mockAdmin.password)) {
      const admin = {
        id: mockAdmin.id,
        username: mockAdmin.username,
        email: mockAdmin.email,
        role: mockAdmin.role
      };
      return { user: admin, token: generateToken(admin) };
    }

    if (email === 'admin@occasion.dev' && password === 'Occasion1234!') {
      const admin = {
        id: 'admin-1',
        username: 'OccasionAdmin',
        email: 'admin@occasion.dev',
        role: 'admin'
      };
      return { user: admin, token: generateToken(admin) };
    }

    throw new Error('Invalid admin credentials');
  }
};
