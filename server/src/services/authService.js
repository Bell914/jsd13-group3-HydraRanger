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

export const registerUser = async ({ username, email, password, role = 'user' }) => {
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
      role
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
      role,
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
    if (!isMatch) {
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
      // Default demo login fallback
      if (email === 'admin@hydra.com' && password === 'Hydra1234!') {
        const adminUser = {
          id: 'admin-1',
          username: 'HydraAdmin',
          email: 'admin@hydra.com',
          role: 'admin'
        };
        return {
          user: adminUser,
          token: generateToken(adminUser)
        };
      }
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, mockUser.password);
    if (!isMatch) {
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
