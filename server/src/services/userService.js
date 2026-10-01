import { User } from '../models/User.js';

export const getAllUsers = async () => {
  return User.find().select('-password -sizeProfile');
};

export const getUserById = async (id, includeSizeProfile = false) => {
  const fields = includeSizeProfile ? '-password' : '-password -sizeProfile';
  return User.findById(id).select(fields);
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
