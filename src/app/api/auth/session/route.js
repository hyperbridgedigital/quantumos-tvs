import { NextResponse } from 'next/server';
import { extractToken, verifyToken } from '@/lib/auth/jwt';
import { ROLE_CONFIG } from '@/lib/auth/credentials';

export async function GET(request) {
  try {
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json({ ok: false, authenticated: false, error: 'No token' }, { status: 401 });
    }

    const { valid, decoded, error } = verifyToken(token);
    if (!valid) {
      // Clear invalid cookie
      const res = NextResponse.json({ ok: false, authenticated: false, error }, { status: 401 });
      res.headers.set('Set-Cookie', 'qos_token=; Path=/; HttpOnly; Max-Age=0');
      return res;
    }

    const roleConfig = ROLE_CONFIG[decoded.role] || ROLE_CONFIG.customer;

    return NextResponse.json({
      ok: true,
      authenticated: true,
      user: {
        ...decoded,
        roleLabel: roleConfig.label,
        emoji: roleConfig.emoji,
        level: roleConfig.level,
        tabs: roleConfig.tabs,
      },
      expiresAt: new Date(decoded.exp * 1000).toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error: ' + err.message }, { status: 500 });
  }
}
