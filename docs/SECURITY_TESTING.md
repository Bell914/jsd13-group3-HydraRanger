# Security Enhancement

## Protection included

- JWT is required for protected API routes.
- Role checks separate customer and admin access.
- Suspended customers cannot log in or continue using protected routes.
- Login and registration endpoints use rate limits.
- Helmet adds security response headers.
- CORS uses exact website URLs instead of wildcard or partial matches.
- `JWT_SECRET` must come from an environment variable.
- Real credentials are not stored in `.env.example`.

## Required deployment variables

Set these values in the deployed server environment before starting the API:

```env
JWT_SECRET=use_a_long_random_value
CLIENT_URL=https://customer-website.example
ADMIN_CLIENT_URL=https://admin-website.example
```

Do not add a trailing path such as `/api` to the two website URLs.

## Automated security checks

Run from the `server` folder:

```bash
npm run test:security
```

The test suite verifies:

1. Configured CORS origins are accepted and lookalike domains are rejected.
2. A protected API rejects requests without a JWT.
3. A customer role cannot access an admin-only route.
4. Invalid login input is rejected by validation.
5. The rate limiter blocks requests after the configured limit.

## Latest verification

- Security tests: 5 passed, 0 failed.
- Server security files: syntax check passed.
- Customer production build: passed.
- Admin production build: passed.
