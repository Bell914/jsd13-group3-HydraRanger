import test from 'node:test';
import assert from 'node:assert/strict';
import { getRuntimeMetrics, recordRequest, resetRuntimeMetrics } from '../services/monitoringService.js';

test('runtime metrics report request errors and p95 latency without user data', () => {
  resetRuntimeMetrics();
  recordRequest({ statusCode: 200, durationMs: 20 });
  recordRequest({ statusCode: 503, durationMs: 80 });
  const metrics = getRuntimeMetrics();

  assert.equal(metrics.requests, 2);
  assert.equal(metrics.serverErrors, 1);
  assert.equal(metrics.errorRate, 0.5);
  assert.equal(metrics.responseTimeMs.p95, 80);
  assert.deepEqual(Object.keys(metrics).includes('token'), false);
});
