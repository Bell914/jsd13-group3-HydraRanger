import { ENV } from '../config/env.js';

export const CUSTOMER_COOKIE = 'occasion_session';
export const ADMIN_COOKIE = 'occasion_admin_session';

function cookieOptions(path = '/api') {
  const production = ENV.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: production,
    sameSite: production ? 'none' : 'lax',
    path,
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

export function setAuthCookie(res, token, role = 'user') {
  const name = role === 'admin' ? ADMIN_COOKIE : CUSTOMER_COOKIE;

  // Older deployments used the site root as the cookie path. Remove that
  // cookie before issuing the current /api cookie, otherwise browsers can
  // send both values and an expired token may be selected by the server.
  const { maxAge: _maxAge, ...legacyOptions } = cookieOptions('/');
  res.clearCookie(name, legacyOptions);
  res.cookie(name, token, cookieOptions());
}

export function clearAuthCookie(res, role = 'user') {
  const name = role === 'admin' ? ADMIN_COOKIE : CUSTOMER_COOKIE;
  const { maxAge: _maxAge, ...options } = cookieOptions();
  res.clearCookie(name, options);

  // Also remove sessions issued by the legacy root-path configuration.
  const { maxAge: _legacyMaxAge, ...legacyOptions } = cookieOptions('/');
  res.clearCookie(name, legacyOptions);
}

export function parseCookies(header = '') {
  return header.split(';').reduce((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator < 0) return cookies;
    const name = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    // RFC cookie ordering puts the most-specific path first. Keep that value
    // so a stale root-path cookie cannot override the current /api session.
    if (name && cookies[name] === undefined) cookies[name] = decodeURIComponent(value);
    return cookies;
  }, {});
}

export function getRequestToken(req) {
  const authorization = req.headers?.authorization || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7);

  const cookies = req.cookies || {};
  const adminRoute = req.originalUrl?.includes('/admin/') || req.originalUrl?.includes('/uploads');
  return adminRoute ? cookies[ADMIN_COOKIE] : cookies[CUSTOMER_COOKIE];
}
