import { NextResponse } from 'next/server';
import { createOTP, getProviderPayload } from '@/lib/auth/otpStore';

export async function POST(request) {
  try {
    const body = await request.json();
    const { target, channel = 'sms' } = body;

    // Validate channel
    if (!['sms', 'whatsapp', 'email'].includes(channel)) {
      return NextResponse.json({ ok: false, error: 'Invalid channel. Use: sms, whatsapp, or email' }, { status: 400 });
    }

    // Validate target
    if (!target) {
      return NextResponse.json({ ok: false, error: 'Phone number or email required' }, { status: 400 });
    }
    if (channel === 'email' && !target.includes('@')) {
      return NextResponse.json({ ok: false, error: 'Valid email address required' }, { status: 400 });
    }
    if (channel !== 'email') {
      const cleaned = target.replace(/[\s\-\+\(\)]/g, '');
      if (cleaned.length < 10 || !/^\d+$/.test(cleaned.replace(/^\+/, ''))) {
        return NextResponse.json({ ok: false, error: 'Valid phone number required (min 10 digits)' }, { status: 400 });
      }
    }

    // Generate OTP
    const result = createOTP(target, channel);
    if (!result.ok) {
      return NextResponse.json(result, { status: 429 });
    }

    // Get provider payload (for logging/debugging)
    const provider = getProviderPayload(target, result._demo_otp, channel);

    // In production: call provider.payload to provider API
    // For demo: OTP is logged to console and returned in _demo_otp

    const channelLabels = { sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email' };
    return NextResponse.json({
      ok: true,
      message: `OTP sent via ${channelLabels[channel]} to ${target}`,
      channel,
      target,
      expiresIn: result.expiresIn,
      provider: provider.provider,
      _demo_otp: result._demo_otp, // Remove in production
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Server error: ' + err.message }, { status: 500 });
  }
}
