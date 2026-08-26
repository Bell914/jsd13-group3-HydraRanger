import { User } from '../models/User.js';

export const getAllUsers = async () => {
  try {
    return await User.find().select('-password');
  } catch {
    return [
      {
        id: 'mock-1',
        username: 'OccasionAdmin',
        email: 'admin@occasion.dev',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-2',
        username: 'OccasionDev',
        email: 'developer@occasion.dev',
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];
  }
};

export const getUserById = async (id) => {
  try {
    return await User.findById(id).select('-password');
  } catch {
    return {
      id,
      username: 'OccasionMember',
      email: 'member@occasion.dev',
      role: 'user'
    };
  }
};
