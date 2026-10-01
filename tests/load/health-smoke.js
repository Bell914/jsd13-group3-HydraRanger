import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    portfolio_smoke: {
      executor: 'constant-vus',
      vus: Number(__ENV.VUS || 10),
      duration: __ENV.DURATION || '20s'
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500']
  }
};

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:5001';

export default function () {
  const healthResponse = http.get(`${baseUrl}/api/health`, {
    tags: { flow: 'health-smoke' }
  });
  check(healthResponse, {
    'health returns 200': (result) => result.status === 200,
    'health reports online': (result) => result.json('status') === 'online'
  });

  const productsResponse = http.get(`${baseUrl}/api/products`, {
    tags: { flow: 'product-catalog' }
  });
  check(productsResponse, {
    'catalog returns 200': (result) => result.status === 200,
    'catalog returns products': (result) => Array.isArray(result.json('data'))
  });
  sleep(1);
}
