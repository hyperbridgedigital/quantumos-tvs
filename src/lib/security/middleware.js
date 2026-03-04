/**
 * Security Framework — OWASP Top 10, Rate Limiting, Input Sanitization, JWT
 */

// Rate limiter (in-memory for demo, use Redis in production)
const rateLimits = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;

export function rateLimit(key, limit = MAX_REQUESTS) {
  const now = Date.now();
  const window = Math.floor(now / WINDOW_MS);
  const k = key + ':' + window;
  const current = rateLimits.get(k) || 0;
  if (current >= limit) return { allowed: false, remaining: 0, resetAt: (window + 1) * WINDOW_MS };
  rateLimits.set(k, current + 1);
  // Cleanup old windows
  for (const [rk] of rateLimits) { if (!rk.endsWith(':' + window)) rateLimits.delete(rk); }
  return { allowed: true, remaining: limit - current - 1, resetAt: (window + 1) * WINDOW_MS };
}

// Input sanitization (XSS prevention)
export function sanitize(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;').replace(/\//g, '&#x2F;');
}

export function sanitizeObject(obj) {
  if (typeof obj === 'string') return sanitize(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === 'object') {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) clean[sanitize(k)] = sanitizeObject(v);
    return clean;
  }
  return obj;
}

// SQL injection detection
const SQL_PATTERNS = [/('|--|;|\\|\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bDROP\b|\bINSERT\b|\bDELETE\b|\bUPDATE\b)/i];
export function detectSQLInjection(input) {
  if (typeof input !== 'string') return false;
  return SQL_PATTERNS.some(p => p.test(input));
}

// CSRF token generation
export function generateCSRFToken() {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined') crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// JWT helpers
export function isTokenExpired(token) {
  try {
    const [, payload] = token.split('.');
    const { exp } = JSON.parse(atob(payload));
    return Date.now() >= exp * 1000;
  } catch { return true; }
}

// Content Security Policy headers
export const CSP_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.neon.tech",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// Security event logger
const securityLog = [];
export function logSecurityEvent(event) {
  securityLog.push({ ...event, timestamp: new Date().toISOString() });
  if (securityLog.length > 10000) securityLog.splice(0, 5000);
  return securityLog;
}
export function getSecurityEvents(limit = 50) { return securityLog.slice(-limit).reverse(); }

// Brute force detection
const loginAttempts = new Map();
export function checkBruteForce(identifier) {
  const key = 'login:' + identifier;
  const attempts = loginAttempts.get(key) || { count: 0, firstAt: Date.now() };
  const windowMs = 15 * 60 * 1000; // 15 minutes

  if (Date.now() - attempts.firstAt > windowMs) {
    loginAttempts.set(key, { count: 1, firstAt: Date.now() });
    return { blocked: false, attempts: 1 };
  }

  attempts.count++;
  loginAttempts.set(key, attempts);

  if (attempts.count > 5) {
    logSecurityEvent({ type: 'brute_force', identifier, attempts: attempts.count });
    return { blocked: true, attempts: attempts.count, lockUntil: new Date(attempts.firstAt + windowMs).toISOString() };
  }

  return { blocked: false, attempts: attempts.count };
}
