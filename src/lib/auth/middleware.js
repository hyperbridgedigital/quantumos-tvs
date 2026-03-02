// HyperBridge QuantumOS — Auth Middleware
import { verifyToken, extractToken } from './jwt';
import { ROLE_CONFIG } from './credentials';

export function requireAuth(request) {
  const token = extractToken(request);
  if (!token) return { ok: false, status: 401, error: 'Authentication required' };
  
  const { valid, decoded, error } = verifyToken(token);
  if (!valid) return { ok: false, status: 401, error: 'Invalid or expired token: ' + error };

  return { ok: true, user: decoded };
}

export function requireRole(request, minLevel = 0) {
  const auth = requireAuth(request);
  if (!auth.ok) return auth;

  const roleConfig = ROLE_CONFIG[auth.user.role];
  if (!roleConfig || roleConfig.level < minLevel) {
    return { ok: false, status: 403, error: 'Insufficient permissions' };
  }

  return auth;
}

export function requireAdmin(request) {
  return requireRole(request, 50); // Manager+
}

export function requireSuperAdmin(request) {
  return requireRole(request, 100);
}
