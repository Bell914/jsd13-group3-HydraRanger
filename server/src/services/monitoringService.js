const MAX_SAMPLES = 200;

const state = {
  startedAt: Date.now(),
  requests: 0,
  errors: 0,
  durations: []
};

export function recordRequest({ statusCode, durationMs }) {
  state.requests += 1;
  if (statusCode >= 500) state.errors += 1;
  state.durations.push(durationMs);
  if (state.durations.length > MAX_SAMPLES) state.durations.shift();
}

function percentile(values, percentileValue) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((percentileValue / 100) * sorted.length) - 1)];
}

export function getRuntimeMetrics() {
  return {
    uptimeSeconds: Math.floor((Date.now() - state.startedAt) / 1000),
    requests: state.requests,
    serverErrors: state.errors,
    errorRate: state.requests ? Number((state.errors / state.requests).toFixed(4)) : 0,
    responseTimeMs: {
      p50: percentile(state.durations, 50),
      p95: percentile(state.durations, 95)
    },
    sampleSize: state.durations.length
  };
}

export function resetRuntimeMetrics() {
  state.startedAt = Date.now();
  state.requests = 0;
  state.errors = 0;
  state.durations = [];
}
