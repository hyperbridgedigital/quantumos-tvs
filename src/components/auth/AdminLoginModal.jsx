'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';

function AdminLoginModal() {
  const { showAdminLogin, setShowAdminLogin, adminLogin, userSendOTP, userVerifyOTP } = useApp();
  const [mode, setMode] = useState('password'); // password | otp
  const [channel, setChannel] = useState('sms'); // sms | whatsapp | email
  const [step, setStep] = useState('input'); // input | verify
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [target, setTarget] = useState('');
  const [otp, setOtp] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [demoOtp, setDemoOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  if (!showAdminLogin) return null;

  const close = () => {
    setShowAdminLogin(false);
    setEmail(''); setPassword(''); setTarget(''); setOtp('');
    setError(''); setShowPass(false); setLoading(false);
    setStep('input'); setOtpSent(false); setDemoOtp('');
    setMode('password'); setChannel('sms'); setResendTimer(0);
  };

  // ═══ Password login ═══
  const handlePasswordLogin = async () => {
    setError(''); setLoading(true);
    const res = await adminLogin(email, password);
    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  // ═══ OTP send ═══
  const handleSendOTP = async () => {
    setError(''); setLoading(true);
    const res = await userSendOTP(target, channel);
    if (res.ok) {
      setOtpSent(true); setStep('verify');
      if (res._demo_otp) setDemoOtp(res._demo_otp);
      // Start resend timer
      setResendTimer(30);
      const t = setInterval(() => setResendTimer(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  // ═══ OTP verify ═══
  const handleVerifyOTP = async () => {
    setError(''); setLoading(true);
    const res = await userVerifyOTP(target, otp, '', channel);
    if (!res.ok) setError(res.error);
    else close();
    setLoading(false);
  };

  // ═══ Resend ═══
  const handleResend = async () => {
    setOtp(''); setError(''); setLoading(true);
    const res = await userSendOTP(target, channel);
    if (res.ok) {
      if (res._demo_otp) setDemoOtp(res._demo_otp);
      setResendTimer(30);
      const t = setInterval(() => setResendTimer(p => { if (p <= 1) { clearInterval(t); return 0; } return p - 1; }), 1000);
    } else { setError(res.error); }
    setLoading(false);
  };

  const quickLogin = (e, p) => { setEmail(e); setPassword(p); setMode('password'); };

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 12,
    background: 'rgba(255,255,255,.06)', border: '1px solid ' + brand.border,
    color: brand.heading, fontSize: 14, outline: 'none', boxSizing: 'border-box',
    fontFamily: "'Figtree', system-ui, sans-serif",
  };

  const channelConfig = {
    sms:      { icon: '📱', label: 'SMS',      placeholder: '+91 98765 43210', inputType: 'tel',   desc: 'We\'ll send a 6-digit OTP to your mobile' },
    whatsapp: { icon: '💬', label: 'WhatsApp',  placeholder: '+91 98765 43210', inputType: 'tel',   desc: 'OTP will arrive in your WhatsApp chat' },
    email:    { icon: '📧', label: 'Email',     placeholder: 'you@example.com', inputType: 'email', desc: 'Check your inbox for the verification code' },
  };
  const ch = channelConfig[channel];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.85)', backdropFilter: 'blur(14px)' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 420, background: brand.bg2, border: '1px solid ' + brand.border, borderRadius: 20, overflow: 'hidden', zIndex: 1 }}>
        <div style={{ height: 3, background: 'linear-gradient(90deg,' + brand.gold + ',' + brand.saffron + ',' + brand.gold + ')' }} />

        <div style={{ padding: '28px 28px 24px' }}>
          <button onClick={close} style={{ position: 'absolute', top: 16, right: 16, fontSize: 18, color: brand.dim, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: brand.fontDisplay, fontSize: 26, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>QuantumOS</div>
              <div style={{ fontSize: 9, color: brand.gold, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', marginTop: 2 }}>Powered by TheReelFactory & HyperBridge</div>
            </div>
            <h3 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: brand.heading, margin: '0 0 4px' }}>
              {step === 'verify' ? 'Enter Verification Code' : 'Sign In'}
            </h3>
            <p style={{ fontSize: 11, color: brand.dim, margin: 0 }}>
              {step === 'verify' ? `Code sent via ${ch.label} to ${target}` : 'Choose your preferred authentication method'}
            </p>
          </div>

          {/* ═══ MODE TOGGLE ═══ */}
          {step === 'input' && (
            <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid ' + brand.border, marginBottom: 18 }}>
              {[
                { k: 'password', l: '🔐 Password', d: 'Admin credentials' },
                { k: 'otp', l: '📲 OTP Login', d: 'Phone, Email, or WhatsApp' },
              ].map(m => (
                <button key={m.k} onClick={() => { setMode(m.k); setError(''); }}
                  style={{ flex: 1, padding: '10px 8px', background: mode === m.k ? brand.gold + '18' : 'transparent', border: 'none', borderRight: m.k === 'password' ? '1px solid ' + brand.border : 'none', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: mode === m.k ? brand.gold : brand.dim }}>{m.l}</div>
                  <div style={{ fontSize: 9, color: brand.dim, marginTop: 2 }}>{m.d}</div>
                </button>
              ))}
            </div>
          )}

          {/* ═══ PASSWORD MODE ═══ */}
          {mode === 'password' && step === 'input' && (<>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 10, color: brand.dim, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@thevaluestore.com" autoFocus autoComplete="email" style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && document.getElementById('admin-pass')?.focus()} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 10, color: brand.dim, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input id="admin-pass" type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password" style={inputStyle}
                  onKeyDown={e => e.key === 'Enter' && email && password && handlePasswordLogin()} />
                <button onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: brand.dim, fontSize: 12, cursor: 'pointer' }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>
          </>)}

          {/* ═══ OTP MODE — Channel Select ═══ */}
          {mode === 'otp' && step === 'input' && (<>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, color: brand.dim, fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.08em' }}>Verify via</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {Object.entries(channelConfig).map(([k, v]) => (
                  <button key={k} onClick={() => { setChannel(k); setTarget(''); setError(''); }}
                    style={{ flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'center', transition: 'all .2s',
                      background: channel === k ? brand.gold + '15' : 'rgba(255,255,255,.03)',
                      border: '1.5px solid ' + (channel === k ? brand.gold + '55' : brand.border),
                    }}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{v.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: channel === k ? brand.gold : brand.dim }}>{v.label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 10, color: brand.dim, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                {channel === 'email' ? 'Email Address' : 'Mobile Number'}
              </label>
              <input type={ch.inputType} value={target} onChange={e => setTarget(e.target.value)}
                placeholder={ch.placeholder} autoFocus style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && target && handleSendOTP()} />
              <div style={{ fontSize: 9, color: brand.dim, marginTop: 4 }}>{ch.desc}</div>
            </div>
          </>)}

          {/* ═══ OTP VERIFY STEP ═══ */}
          {step === 'verify' && (<>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 10, color: brand.dim, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>6-Digit OTP Code</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • • • •" autoFocus style={{ ...inputStyle, textAlign: 'center', fontSize: 24, fontWeight: 700, letterSpacing: '0.5em', fontFamily: 'monospace' }}
                onKeyDown={e => e.key === 'Enter' && otp.length >= 4 && handleVerifyOTP()} />
            </div>

            {/* Demo OTP hint */}
            {demoOtp && (
              <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: brand.gold + '10', border: '1px solid ' + brand.gold + '25', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11 }}>🧪</span>
                <span style={{ fontSize: 10, color: brand.gold }}>Demo OTP: <b style={{ fontFamily: 'monospace', fontSize: 13 }}>{demoOtp}</b> (or use 1234)</span>
              </div>
            )}

            {/* Resend + change method */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <button onClick={() => { setStep('input'); setOtp(''); setOtpSent(false); setError(''); setDemoOtp(''); }}
                style={{ fontSize: 11, color: brand.dim, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                ← Change method
              </button>
              <button onClick={handleResend} disabled={resendTimer > 0 || loading}
                style={{ fontSize: 11, color: resendTimer > 0 ? brand.dim : brand.gold, background: 'none', border: 'none', cursor: resendTimer > 0 ? 'default' : 'pointer' }}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : '🔄 Resend OTP'}
              </button>
            </div>
          </>)}

          {/* Error */}
          {error && (
            <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: brand.red + '12', border: '1px solid ' + brand.red + '30', color: brand.red, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Action button */}
          {mode === 'password' && step === 'input' && (
            <button onClick={handlePasswordLogin} disabled={!email || !password || loading}
              style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, border: 'none',
                cursor: (email && password && !loading) ? 'pointer' : 'not-allowed',
                background: (email && password && !loading) ? brand.gold : brand.border,
                color: (email && password && !loading) ? '#000' : brand.dim,
              }}>
              {loading ? '⏳ Authenticating...' : '🔐 Sign In'}
            </button>
          )}
          {mode === 'otp' && step === 'input' && (
            <button onClick={handleSendOTP} disabled={!target || loading}
              style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, border: 'none',
                cursor: (target && !loading) ? 'pointer' : 'not-allowed',
                background: (target && !loading) ? brand.gold : brand.border,
                color: (target && !loading) ? '#000' : brand.dim,
              }}>
              {loading ? '⏳ Sending...' : `${ch.icon} Send OTP via ${ch.label}`}
            </button>
          )}
          {step === 'verify' && (
            <button onClick={handleVerifyOTP} disabled={otp.length < 4 || loading}
              style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, border: 'none',
                cursor: (otp.length >= 4 && !loading) ? 'pointer' : 'not-allowed',
                background: (otp.length >= 4 && !loading) ? brand.emerald : brand.border,
                color: (otp.length >= 4 && !loading) ? '#fff' : brand.dim,
              }}>
              {loading ? '⏳ Verifying...' : '✅ Verify & Sign In'}
            </button>
          )}

          {/* Quick demo access */}
          {step === 'input' && (
            <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid ' + brand.border }}>
              <div style={{ fontSize: 9, color: brand.dim, textAlign: 'center', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.1em' }}>Demo Quick Access</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {[
                  { label: '👑 Super Admin', email: 'spadensilver@gmail.com', pass: 'Admin@123', color: '#C9A84C' },
                  { label: '🔑 Admin', email: 'admin@mehfil.com', pass: 'Admin@123', color: '#3B82F6' },
                  { label: '👔 Manager', email: 'manager@mehfil.com', pass: 'Manager@1', color: '#22C55E' },
                  { label: '🏪 Franchise', email: 'franchise@mehfil.com', pass: 'Franch@1', color: '#8B5CF6' },
                ].map(q => (
                  <button key={q.email} onClick={() => quickLogin(q.email, q.pass)}
                    style={{ padding: '8px 10px', borderRadius: 8, background: q.color + '10', border: '1px solid ' + q.color + '25', color: q.color, fontSize: 10, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}>
                    {q.label}
                    <div style={{ fontSize: 8, color: brand.dim, marginTop: 2, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.email}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Provider info */}
          {mode === 'otp' && step === 'input' && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <div style={{ fontSize: 8, color: brand.dim + '88' }}>
                Providers: {channel === 'sms' ? 'MSG91 → 2Factor.in' : channel === 'whatsapp' ? 'Meta Cloud API → Gupshup' : 'Pepipost → SendGrid'} (primary → fallback)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(AdminLoginModal);
