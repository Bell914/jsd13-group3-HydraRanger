import test from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../models/User.js';
import { getAllUsers, getUserById } from '../services/userService.js';

test('customer queries exclude passwords and size profiles', async (t) => {
  let selectedFields = '';
  t.mock.method(User, 'find', () => ({
    select: async (fields) => {
      selectedFields = fields;
      return [];
    }
  }));

  await getAllUsers();
  assert.equal(selectedFields, '-password -sizeProfile');
});

test('customer list propagates database failures instead of returning mock users', async (t) => {
  const databaseError = new Error('database unavailable');
  t.mock.method(User, 'find', () => ({ select: async () => { throw databaseError; } }));
  await assert.rejects(getAllUsers(), databaseError);
});

test('single customer query propagates database failures', async (t) => {
  const databaseError = new Error('database unavailable');
  t.mock.method(User, 'findById', () => ({ select: async () => { throw databaseError; } }));
  await assert.rejects(getUserById('507f1f77bcf86cd799439011'), databaseError);
});
