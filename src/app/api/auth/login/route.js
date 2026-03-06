import { NextResponse } from 'next/server';
import { ADMIN_CREDENTIALS, ROLE_CONFIG } from '@/lib/auth/credentials';
import { signToken, signRefreshToken, tokenResponse } from '@/lib/auth/jwt';
import { auditLog } from '@/lib/auditLog';

function getClientInfo(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null;
  const userAgent = request.headers.get('user-agent') || null;
  return { ip, userAgent };
}

export async function POST(request) {
  const { ip, userAgent } = getClientInfo(request);
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      auditLog({ event: 'auth.login.failure', resource: '/api/auth/login', result: 'failure', ip, userAgent, metadata: { reason: 'missing_credentials' } });
      return NextResponse.json({ ok: false, error: 'Email and password required' }, { status: 400 });
    }

    const cred = ADMIN_CREDENTIALS[email.toLowerCase().trim()];
    if (!cred) {
      auditLog({ event: 'auth.login.failure', userId: email.toLowerCase().trim(), resource: '/api/auth/login', result: 'failure', ip, userAgent, metadata: { reason: 'account_not_found' } });
      return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 401 });
    }
    if (cred.pass !== password) {
      auditLog({ event: 'auth.login.failure', userId: email.toLowerCase().trim(), resource: '/api/auth/login', result: 'failure', ip, userAgent, metadata: { reason: 'invalid_password' } });
      return NextResponse.json({ ok: false, error: 'Incorrect password' }, { status: 401 });
    }

    const roleConfig = ROLE_CONFIG[cred.role];
    const user = {
      email: email.toLowerCase().trim(),
      name: cred.name,
      role: cred.role,
      roleLabel: roleConfig.label,
      emoji: roleConfig.emoji,
      level: roleConfig.level,
      store: cred.store,
      authMethod: 'password',
      loginAt: new Date().toISOString(),
    };

    const accessToken = signToken(user);
    const refreshToken = signRefreshToken({ email: user.email, role: user.role });

    auditLog({ event: 'auth.login.success', userId: user.email, resource: '/api/auth/login', result: 'success', ip, userAgent, metadata: { role: user.role } });

    return tokenResponse(accessToken, refreshToken, user);
  } catch (err) {
    auditLog({ event: 'auth.login.failure', resource: '/api/auth/login', result: 'failure', ip, userAgent, metadata: { reason: 'server_error' } });
    return NextResponse.json({ ok: false, error: 'Authentication failed' }, { status: 500 });
  }
}
