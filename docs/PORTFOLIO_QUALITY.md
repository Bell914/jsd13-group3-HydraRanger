# Portfolio Quality and Verification

This document describes the evidence behind the OCCASION portfolio claims.

## Automated quality gates

- Client component and business-rule tests run with Vitest.
- Server security, validation, coupon, monitoring, and regression tests run with Node Test.
- Customer and Admin production builds must succeed.
- Playwright exercises five real browser/API journeys against Express and MongoDB: backend-derived coupons, consented size profile, authorized Admin order status updates, persisted Product CRUD, and safe error handling for authentication, IDs, and insufficient stock.
- GitHub Actions runs the complete suite for pull requests and uploads the Playwright report when a browser journey fails.

## Monitoring

Every API response includes `x-request-id`. Server logs are structured JSON containing request ID, method, path, status, and duration. The health endpoint exposes bounded in-memory request count, 5xx error rate, and p50/p95 latency samples. Tokens, passwords, body payloads, body measurements, and customer identifiers are intentionally excluded.

## Load smoke test

Install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) and run only against local or authorized staging infrastructure:

```sh
k6 run tests/load/health-smoke.js
BASE_URL=http://127.0.0.1:5001 VUS=25 DURATION=30s k6 run tests/load/health-smoke.js
```

The smoke scenario checks both health and the MongoDB-backed product catalog. The initial portfolio target is less than 1% failed requests and p95 below 500 ms. Do not run this against production Render, email, payment, or AI services without explicit authorization.

## CSRF decision

The current clients send JWTs explicitly in the `Authorization` header. Browsers do not attach that token automatically, so conventional cookie-based CSRF is not the primary risk. The project therefore prioritizes strict CORS, input validation, rate limiting, Helmet, short-lived/revocable JWTs, and XSS prevention. If authentication moves to an `HttpOnly`, `Secure` cookie, add an origin check and synchronizer/double-submit CSRF token before deployment.
