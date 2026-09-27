const normalizeOrigin = (origin) => String(origin || "").replace(/\/+$/, "");

export function buildAllowedOrigins(env) {
  const allowedOrigins = [
    normalizeOrigin(env.CLIENT_URL),
    normalizeOrigin(env.ADMIN_CLIENT_URL),
  ].filter(Boolean);

  if (env.NODE_ENV === "development") {
    allowedOrigins.push(
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5175",
      "http://localhost:5176",
      "http://127.0.0.1:5176",
    );
  }

  return [...new Set(allowedOrigins)];
}

export function isOriginAllowed(origin, allowedOrigins) {
  // Requests without an Origin header include server-to-server calls and CLI tools.
  if (!origin) return true;
  return allowedOrigins.includes(normalizeOrigin(origin));
}
