import { User } from '../models/User.js';

export const getAllUsers = async () => {
  try {
    return await User.find().select('-password -sizeProfile');
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

export const getUserById = async (id, includeSizeProfile = false) => {
  try {
    const fields = includeSizeProfile ? '-password' : '-password -sizeProfile';
    return await User.findById(id).select(fields);
  } catch {
    return {
      id,
      username: 'OccasionMember',
      email: 'member@occasion.dev',
      role: 'user'
    };
  }
};

export async function getSizeProfile(userId) {
  const user = await User.findById(userId).select('sizeProfile');
  if (!user) throw new Error('User not found');
  return user.sizeProfile || null;
}

export async function saveSizeProfile(userId, profileData) {
  const sizeProfile = {
    chestCm: Number(profileData.chestCm),
    waistCm: Number(profileData.waistCm),
    hipsCm: Number(profileData.hipsCm),
    preferredFit: profileData.preferredFit,
    consentGiven: profileData.consentGiven,
    updatedAt: new Date()
  };

  const user = await User.findByIdAndUpdate(
    userId,
    { sizeProfile },
    { new: true, runValidators: true }
  ).select('sizeProfile');

  if (!user) throw new Error('User not found');
  return user.sizeProfile;
}

export async function deleteSizeProfile(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $unset: { sizeProfile: 1 } },
    { new: true }
  );

  if (!user) throw new Error('User not found');
}
