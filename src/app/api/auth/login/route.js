import { NextResponse } from 'next/server';
import { ADMIN_CREDENTIALS, ROLE_CONFIG } from '@/lib/auth/credentials';
import { signToken, signRefreshToken, tokenResponse } from '@/lib/auth/jwt';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email and password required' }, { status: 400 });
    }

    const cred = ADMIN_CREDENTIALS[email.toLowerCase().trim()];
    if (!cred) {
      return NextResponse.json({ ok: false, error: 'Account not found' }, { status: 401 });
    }
    if (cred.pass !== password) {
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

    return tokenResponse(accessToken, refreshToken, user);
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error: ' + err.message }, { status: 500 });
  }
}
