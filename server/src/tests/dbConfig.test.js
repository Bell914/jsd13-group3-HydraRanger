import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMongoOptions } from '../config/db.js';

test('MongoDB uses a small idle-friendly pool by default', () => {
  const options = buildMongoOptions({});

  assert.equal(options.maxPoolSize, 3);
  assert.equal(options.minPoolSize, 0);
  assert.equal(options.maxIdleTimeMS, 60000);
  assert.equal(options.waitQueueTimeoutMS, 5000);
});

test('MongoDB pool settings are configurable and min never exceeds max', () => {
  const options = buildMongoOptions({
    MONGODB_MAX_POOL_SIZE: '4',
    MONGODB_MIN_POOL_SIZE: '8',
    MONGODB_MAX_IDLE_TIME_MS: '120000',
  });

  assert.equal(options.maxPoolSize, 4);
  assert.equal(options.minPoolSize, 4);
  assert.equal(options.maxIdleTimeMS, 120000);
});
