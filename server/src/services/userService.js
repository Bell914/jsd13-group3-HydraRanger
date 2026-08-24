import { User } from '../models/User.js';

export const getAllUsers = async () => {
  try {
    return await User.find().select('-password');
  } catch {
    return [
      {
        id: 'mock-1',
        username: 'HydraLeader',
        email: 'leader@hydraranger.dev',
        role: 'admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'mock-2',
        username: 'HydraDev',
        email: 'developer@hydraranger.dev',
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
      username: 'HydraMember',
      email: 'member@hydraranger.dev',
      role: 'user'
    };
  }
};
