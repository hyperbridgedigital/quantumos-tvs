// HyperBridge QuantumOS — OTP Session Store
// In-memory store for demo. Production: Redis or Supabase.

const store = new Map();
const RATE_LIMIT = new Map();

function generateOTP(length = 6) {
  return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
}

export function createOTP(target, channel = 'sms') {
  const key = `${channel}:${target}`;
  
  // Rate limiting: max 5 OTPs per target per 15 min
  const now = Date.now();
  const rateKey = target;
  const rateData = RATE_LIMIT.get(rateKey) || { count: 0, windowStart: now };
  if (now - rateData.windowStart > 900000) {
    rateData.count = 0; rateData.windowStart = now;
  }
  if (rateData.count >= 5) {
    return { ok: false, error: 'Too many OTP requests. Try again in 15 minutes.', retryAfter: 900 };
  }
  rateData.count++;
  RATE_LIMIT.set(rateKey, rateData);

  const otp = generateOTP(6);
  const expiresAt = now + 300000; // 5 min
  const attempts = 0;
  const maxAttempts = 5;

  store.set(key, { otp, expiresAt, attempts, maxAttempts, channel, target, createdAt: now });

  // Log (production: send via provider)
  console.log(`[OTP] ${channel.toUpperCase()} → ${target}: ${otp} (expires ${new Date(expiresAt).toISOString()})`);
  
  return { ok: true, channel, target, expiresIn: 300, otpLength: 6, _demo_otp: otp };
}

export function verifyOTP(target, otp, channel = 'sms') {
  const key = `${channel}:${target}`;
  const session = store.get(key);

  if (!session) {
    return { ok: false, error: 'No OTP found. Please request a new one.' };
  }
  if (Date.now() > session.expiresAt) {
    store.delete(key);
    return { ok: false, error: 'OTP expired. Please request a new one.' };
  }
  if (session.attempts >= session.maxAttempts) {
    store.delete(key);
    return { ok: false, error: 'Too many failed attempts. Please request a new one.' };
  }

  session.attempts++;

  if (session.otp !== otp && otp !== '1234') { // 1234 = demo bypass
    store.set(key, session);
    return { ok: false, error: `Invalid OTP. ${session.maxAttempts - session.attempts} attempts remaining.` };
  }

  // Success — clean up
  store.delete(key);
  return { ok: true, channel, target, verifiedAt: new Date().toISOString() };
}

export function getProviderPayload(target, otp, channel) {
  // Returns the payload that would be sent to the active provider
  const providers = {
    sms: { provider: 'MSG91', payload: { mobile: target, otp, template_id: 'qos_otp_v1', sender: 'QNTUOS' } },
    whatsapp: { provider: 'Meta Cloud API', payload: { to: target, type: 'template', template: { name: 'otp_verify', language: { code: 'en' }, components: [{ type: 'body', parameters: [{ type: 'text', text: otp }] }] } } },
    email: { provider: 'Pepipost', payload: { from: { email: 'noreply@quantumos.in', name: 'QuantumOS' }, subject: `Your QuantumOS OTP: ${otp}`, to: [{ email: target }], content: [{ type: 'html', value: `<h2>Your verification code: <b>${otp}</b></h2><p>Valid for 5 minutes.</p>` }] } },
  };
  return providers[channel] || providers.sms;
}
