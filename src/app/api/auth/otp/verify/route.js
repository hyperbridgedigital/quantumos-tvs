import { NextResponse } from 'next/server';
import { verifyOTP } from '@/lib/auth/otpStore';
import { signToken, signRefreshToken, tokenResponse } from '@/lib/auth/jwt';
import { ADMIN_CREDENTIALS, ROLE_CONFIG } from '@/lib/auth/credentials';

export async function POST(request) {
  try {
    const body = await request.json();
    const { target, otp, channel = 'sms', name, loginType = 'customer' } = body;

    if (!target || !otp) {
      return NextResponse.json({ ok: false, error: 'Target and OTP required' }, { status: 400 });
    }

    // Verify OTP
    const result = verifyOTP(target, otp, channel);
    if (!result.ok) {
      return NextResponse.json(result, { status: 401 });
    }

    // Check if this is an admin logging in via OTP
    let role = 'customer';
    let roleConfig = ROLE_CONFIG.customer;
    const adminMatch = Object.entries(ADMIN_CREDENTIALS).find(([email, cred]) => {
      if (channel === 'email' && email === target.toLowerCase()) return true;
      return false;
    });

    if (adminMatch && loginType === 'admin') {
      role = adminMatch[1].role;
      roleConfig = ROLE_CONFIG[role];
    }

    const user = {
      id: channel === 'email' ? target : 'U_' + target.replace(/\D/g, '').slice(-10),
      name: adminMatch ? adminMatch[1].name : (name || 'Customer'),
      email: channel === 'email' ? target : '',
      phone: channel !== 'email' ? target : '',
      role,
      roleLabel: roleConfig.label,
      emoji: roleConfig.emoji,
      level: roleConfig.level,
      authMethod: `otp_${channel}`,
      authChannel: channel,
      verifiedAt: result.verifiedAt,
      loginAt: new Date().toISOString(),
    };

    const accessToken = signToken(user);
    const refreshToken = signRefreshToken({ id: user.id, role: user.role });

    return tokenResponse(accessToken, refreshToken, user);
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error: ' + err.message }, { status: 500 });
  }
}
