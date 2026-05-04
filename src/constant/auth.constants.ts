export const COOKIE = {
  ACCESS_TOKEN:   "accessToken",
  REFRESH_TOKEN:  "refreshToken",
  SSO_SESSION:    "sso_session",
  CSRF_TOKEN:     "csrf_token",
} as const;

export const TTL = {
  ACCESS_TOKEN:      15 * 60,           // 15 min (seconds)
  REFRESH_TOKEN:     7 * 24 * 60 * 60,  // 7 days
  SSO_SESSION:       8 * 60 * 60,       // 8 hours
  AUTH_CODE:         60,                // 60 seconds
  SESSION_VERSION:   60 * 60,           // 1 hour Redis cache
} as const;

export const ERROR_CODE = {
  SESSION_INVALIDATED: "SESSION_INVALIDATED",
  INVALID_TOKEN:       "INVALID_TOKEN",
  UNAUTHORIZED:        "UNAUTHORIZED",
} as const;