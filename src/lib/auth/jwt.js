// HyperBridge QuantumOS — JWT Auth Engine
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'qos-v11-hbg-2026-xK9mP2vL8nR4wQ7';
const EXPIRY = '24h';
const REFRESH_EXPIRY = '7d';

export function signToken(payload, expiresIn = EXPIRY) {
  return jwt.sign({ ...payload, iat: Math.floor(Date.now() / 1000) }, SECRET, { expiresIn });
}

export function signRefreshToken(payload) {
  return jwt.sign({ ...payload, type: 'refresh', iat: Math.floor(Date.now() / 1000) }, SECRET, { expiresIn: REFRESH_EXPIRY });
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

export function extractToken(request) {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);

  // Check cookie
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/qos_token=([^;]+)/);
  return match ? match[1] : null;
}

export function tokenResponse(accessToken, refreshToken, user) {
  const res = Response.json({
    ok: true,
    user,
    accessToken,
    expiresIn: 86400, // 24h
  });
  // Set httpOnly cookie
  res.headers.set('Set-Cookie', [
    `qos_token=${accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
    `qos_refresh=${refreshToken}; Path=/api/auth; HttpOnly; SameSite=Strict; Max-Age=604800`,
  ].join(', '));
  return res;
}
