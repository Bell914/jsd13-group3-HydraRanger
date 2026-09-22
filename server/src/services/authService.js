import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { ENV } from '../config/env.js';

// In-Memory mock store fallback if DB is offline
const inMemoryUsers = [];

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

const isMongoDuplicateKeyError = (error) =>
  Boolean(error && (error.code === 11000 || (error.name === 'MongoServerError' && error.code === 11000)));

const isMongooseValidationError = (error) => Boolean(error && error.name === 'ValidationError');

const isSyntheticId = (id) =>
  id === 'env-admin' || (typeof id === 'string' && id.startsWith('mock-user-'));

const isDbUnavailableError = (error) => {
  if (!error) return false;
  if (
    ['MongoServerSelectionError', 'MongooseServerSelectionError', 'MongoNetworkError', 'MongooseError'].includes(error.name)
  ) {
    return true;
  }
  return /buffering timed out|could not connect|server selection|topology was destroyed|before initial connection|marked failed|not established/i.test(
    error.message || ''
  );
};

export const generateToken = (payload) => {
  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN
  });
};

const buildUserSession = (user) => {
  const id = user._id?.toString() || user.id;
  const sessionUser = {
    id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    isActive: user.isActive !== false
  };
  return {
    user: sessionUser,
    token: generateToken({
      id,
      username: user.username,
      email: user.email,
      role: user.role
    })
  };
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

    return buildUserSession(user);
  } catch (dbError) {
    if (dbError.message?.includes('already exists')) {
      throw dbError;
    }
    if (isMongoDuplicateKeyError(dbError)) {
      throw new Error('User with this email or username already exists');
    }
    if (!isDbUnavailableError(dbError)) {
      throw dbError;
    }

    // Fallback: In-memory simulation (only when DB is offline)
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
      createdAt: new Date()
    };
    inMemoryUsers.push(mockUser);

    return buildUserSession(mockUser);
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
    if (user.role !== 'user') {
      throw new Error(
        'This account is not a customer account. Please sign in from the admin portal instead.'
      );
    }
    if (user.isActive === false) {
      throw new Error('This customer account has been suspended. Please contact support.');
    }

    return buildUserSession(user);
  } catch (dbError) {
    if (
      dbError.message === 'Invalid email or password' ||
      dbError.message?.includes('admin portal') ||
      dbError.message?.includes('suspended')
    ) {
      throw dbError;
    }
    if (!isDbUnavailableError(dbError)) {
      throw dbError;
    }

    // In-memory fallback (only when DB is offline)
    const mockUser = inMemoryUsers.find((u) => u.email === email.toLowerCase());
    if (!mockUser) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, mockUser.password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }
    if (mockUser.role !== 'user') {
      throw new Error(
        'This account is not a customer account. Please sign in from the admin portal instead.'
      );
    }

    return buildUserSession(mockUser);
  }
};

export const loginAdmin = async ({ email, password }) => {
  let dbUnavailable = false;

  try {
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (user && user.role === 'admin') {
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        return buildUserSession(user);
      }
    }

    throw new AuthError('Invalid admin credentials');
  } catch (error) {
    if (error instanceof AuthError) throw error;
    if (!isDbUnavailableError(error)) throw error;
    dbUnavailable = true;
  }

  // Fallback: In-memory admin (only when DB is offline)
  if (dbUnavailable) {
    const mockAdmin = inMemoryUsers.find(
      (user) => user.email === email.toLowerCase() && user.role === 'admin'
    );
    if (mockAdmin && (await bcrypt.compare(password, mockAdmin.password))) {
      return buildUserSession(mockAdmin);
    }
  }

  // The environment admin is only a convenience for local development.
  // Production admins must exist in MongoDB.
  if (
    ENV.NODE_ENV === 'development' &&
    ENV.ADMIN_EMAIL &&
    ENV.ADMIN_PASSWORD &&
    email.toLowerCase() === ENV.ADMIN_EMAIL.toLowerCase() &&
    password === ENV.ADMIN_PASSWORD
  ) {
    return buildUserSession({
      id: 'env-admin',
      username: 'OccasionAdmin',
      email: ENV.ADMIN_EMAIL,
      role: 'admin',
      createdAt: null
    });
  }

  throw new AuthError('Invalid admin credentials');
};

export const getMe = async (userId) => {
  if (!isSyntheticId(userId)) {
    try {
      const user = await User.findById(userId).select('-password');
      if (user) return user;
    } catch (error) {
      if (!isDbUnavailableError(error)) throw error;
    }
  }

  // In-memory fallback (only when DB is offline or synthetic user)
  const mockUser = inMemoryUsers.find((u) => u.id === userId);
  if (!mockUser) return null;
  const { password, ...safeUser } = mockUser;
  return safeUser;
};

export const changePassword = async ({ userId, currentPassword, newPassword }) => {
  if (!isSyntheticId(userId)) {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) throw new Error('User not found');

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) throw new Error('Current password is incorrect');

      user.password = newPassword;
      await user.save();
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      if (
        error.message === 'Current password is incorrect' ||
        error.message === 'User not found'
      ) {
        throw error;
      }
      if (!isDbUnavailableError(error)) throw error;
    }
  }

  // In-memory fallback (only when DB is offline or synthetic user)
  const mockUser = inMemoryUsers.find((u) => u.id === userId);
  if (!mockUser) throw new Error('User not found');

  const isMatch = await bcrypt.compare(currentPassword, mockUser.password);
  if (!isMatch) throw new Error('Current password is incorrect');

  mockUser.password = await bcrypt.hash(newPassword, 10);
  return { success: true, message: 'Password updated successfully' };
};

export const updateProfile = async ({ userId, username, email, avatar }) => {
  const validatedUsername = (username || '').trim();
  const validatedEmail = (email || '').trim().toLowerCase();

  if (!isSyntheticId(userId)) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const changedUsername =
        validatedUsername && validatedUsername !== user.username;
      const changedEmail = validatedEmail && validatedEmail !== user.email;

      if (changedUsername || changedEmail) {
        const existing = await User.findOne({
          _id: { $ne: user._id },
          $or: [
            ...(changedEmail ? [{ email: validatedEmail }] : []),
            ...(changedUsername ? [{ username: validatedUsername }] : [])
          ]
        });
        if (existing) throw new Error('Email or username is already in use');
      }

      if (validatedUsername) user.username = validatedUsername;
      if (validatedEmail) user.email = validatedEmail;
      if (typeof avatar === 'string') user.avatar = avatar.trim();
      await user.save();
      return user;
    } catch (error) {
      if (
        error.message === 'Email or username is already in use' ||
        error.message === 'User not found'
      ) {
        throw error;
      }
      if (isMongoDuplicateKeyError(error)) {
        throw new Error('Email or username is already in use');
      }
      if (!isDbUnavailableError(error)) throw error;
    }
  }

  // In-memory fallback (only when DB is offline or synthetic user)
  const mockUser = inMemoryUsers.find((u) => u.id === userId);
  if (!mockUser) throw new Error('User not found');

  const taken = inMemoryUsers.find(
    (u) =>
      u.id !== userId &&
      (u.email === validatedEmail || u.username === validatedUsername)
  );
  if (taken) throw new Error('Email or username is already in use');

  if (validatedUsername) mockUser.username = validatedUsername;
  if (validatedEmail) mockUser.email = validatedEmail;
  if (typeof avatar === 'string') mockUser.avatar = avatar.trim();
  const { password, ...safeUser } = mockUser;
  return safeUser;
};

export const refreshToken = (currentToken) => {
  try {
    const decoded = jwt.verify(currentToken, ENV.JWT_SECRET);
    const token = generateToken({
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
      role: decoded.role
    });
    return { token };
  } catch {
    throw new Error('Invalid or expired token');
  }
};