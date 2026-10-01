import { User } from '../models/User.js';

export function getCustomers() {
  return User.find({ role: 'user' })
    .select('username email avatar isActive createdAt updatedAt')
    .sort({ createdAt: -1 });
}

export async function updateCustomer(customerId, customerData) {
  const username = customerData.username?.trim();
  if (!username || username.length < 3) {
    throw new Error('Username must be at least 3 characters');
  }

  const customer = await User.findOneAndUpdate(
    { _id: customerId, role: 'user' },
    {
      username,
      avatar: customerData.avatar?.trim() || ''
    },
    { new: true, runValidators: true }
  ).select('username email avatar isActive createdAt updatedAt');

  if (!customer) throw new Error('Customer not found');
  return customer;
}

export async function updateCustomerStatus(customerId, isActive) {
  if (typeof isActive !== 'boolean') throw new Error('isActive must be true or false');

  const customer = await User.findOneAndUpdate(
    { _id: customerId, role: 'user' },
    { isActive },
    { new: true, runValidators: true }
  ).select('username email avatar isActive createdAt updatedAt');

  if (!customer) throw new Error('Customer not found');
  return customer;
}
