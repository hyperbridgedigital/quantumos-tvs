'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';

const G = '#1B5E20', GM = '#E8F5E9';
const OTP_CHANNELS = [
  { key: 'sms', label: 'SMS', emoji: '📱', desc: 'Text message to your phone', color: G },
  { key: 'whatsapp', label: 'WhatsApp', emoji: '💬', desc: 'Message on WhatsApp', color: '#25D366' },
  { key: 'email', label: 'Email', emoji: '📧', desc: 'Code to your inbox', color: '#1B5E20' },
];

function UserAuthModal() {
  const { showUserAuth, setShowUserAuth, userSendOTP, userVerifyOTP, settings } = useApp();
  const [step, setStep] = useState('contact');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otpChannel, setOtpChannel] = useState('sms');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const enabledChannels = OTP_CHANNELS.filter(c => {
    if (c.key === 'sms') return settings.OTP_SMS !== 'false';
    if (c.key === 'whatsapp') return settings.OTP_WHATSAPP !== 'false';
    if (c.key === 'email') return settings.OTP_EMAIL !== 'false';
    return true;
  });

  if (!showUserAuth) return null;

  const close = () => { setShowUserAuth(false); setStep('contact'); setPhone(''); setEmail(''); setName(''); setOtp(''); setError(''); };

  const goToChannel = () => {
    setError('');
    if (!phone && !email) return setError('Enter phone or email');
    if (phone && phone.length < 10) return setError('Enter valid 10-digit phone');
    if (email && !email.includes('@')) return setError('Enter valid email');
    if (enabledChannels.length === 1) { setOtpChannel(enabledChannels[0].key); sendOTP(enabledChannels[0].key); return; }
    setStep('channel');
  };

  const sendOTP = async (ch) => {
    setError('');
    const target = ch === 'email' ? email : phone;
    if (!target) return setError(ch === 'email' ? 'Email required' : 'Phone required');
    const res = await userSendOTP(target, ch);
    if (res.ok) { setOtpChannel(ch); setStep('otp'); } else { setError(res.error); }
  };

  const verifyOTP = async () => {
    setError('');
    const target = otpChannel === 'email' ? email : phone;
    const res = await userVerifyOTP(target, otp, name || undefined, otpChannel);
    if (res.ok) close(); else setError(res.error);
  };

  const inp = { width:'100%', padding:'14px 16px', borderRadius:12, background:'#fff', border:'1.5px solid '+brand.storeBorder, color:brand.storeHeading, fontSize:16, outline:'none', fontFamily:"'Figtree',sans-serif", boxSizing:'border-box' };
  const chObj = OTP_CHANNELS.find(c => c.key === otpChannel);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={close} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.4)', backdropFilter:'blur(8px)' }} />

      <div style={{ position:'relative', width:'100%', maxWidth:420, background:'#fff', border:'1px solid '+brand.storeBorder, borderRadius:22, overflow:'hidden', zIndex:1, boxShadow:'0 20px 60px rgba(27,94,32,.12)' }}>
        <div style={{ height:3, background:'linear-gradient(90deg, '+G+', #4CAF50, '+G+')' }} />

        <div style={{ padding:'32px 28px 28px' }}>
          <button onClick={close} style={{ position:'absolute', top:16, right:16, fontSize:18, color:brand.storeDim, background:'none', border:'none', cursor:'pointer' }}>✕</button>

          {/* Header */}
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:G, display:'inline-flex', alignItems:'center', justifyContent:'center', fontFamily:brand.fontDisplay, fontSize:14, color:'#fff', fontWeight:800, marginBottom:12 }}>CM</div>
            <h3 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.storeHeading, marginBottom:4 }}>
              {step === 'contact' ? 'Sign In' : step === 'channel' ? 'Choose OTP Method' : 'Enter Verification Code'}
            </h3>
            <p style={{ fontSize:12, color:brand.storeDim }}>
              {step === 'contact' ? 'Enter your details to get started'
                : step === 'channel' ? 'How would you like to receive your OTP?'
                : `Sent via ${chObj?.emoji} ${chObj?.label} to ${otpChannel === 'email' ? email : '+91 ' + phone}`}
            </p>
          </div>

          {/* STEP 1 */}
          {step === 'contact' && <div>
            <label style={{ display:'block', fontSize:10, color:brand.storeDim, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'.08em' }}>Phone Number</label>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <div style={{ ...inp, width:56, textAlign:'center', flexShrink:0, color:brand.storeDim, fontSize:14, padding:'14px 6px', background:'#F0F4F0' }}>+91</div>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="9876543210" autoFocus maxLength={10} style={inp}
                onKeyDown={e => e.key === 'Enter' && goToChannel()} />
            </div>
            <label style={{ display:'block', fontSize:10, color:brand.storeDim, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'.08em' }}>Email <span style={{ fontWeight:400, textTransform:'none', color:brand.storeDim+'80' }}>(for email OTP)</span></label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={{ ...inp, marginBottom:14 }}
              onKeyDown={e => e.key === 'Enter' && goToChannel()} />
            <label style={{ display:'block', fontSize:10, color:brand.storeDim, fontWeight:700, marginBottom:6, textTransform:'uppercase', letterSpacing:'.08em' }}>Name <span style={{ fontWeight:400, textTransform:'none', color:brand.storeDim+'80' }}>(for delivery)</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" maxLength={50} style={{ ...inp, marginBottom:18 }}
              onKeyDown={e => e.key === 'Enter' && goToChannel()} />
            <button onClick={goToChannel} disabled={!phone && !email}
              style={{ width:'100%', padding:14, borderRadius:12, fontSize:15, fontWeight:700, border:'none',
                cursor:(phone||email)?'pointer':'not-allowed',
                background:(phone||email)?G:brand.storeBorder,
                color:(phone||email)?'#fff':brand.storeDim }}>
              Continue →
            </button>
          </div>}

          {/* STEP 2 */}
          {step === 'channel' && <div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
              {enabledChannels.map(ch => {
                const disabled = (ch.key !== 'email' && !phone) || (ch.key === 'email' && !email);
                return (
                  <button key={ch.key} onClick={() => !disabled && sendOTP(ch.key)} disabled={disabled}
                    style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', borderRadius:14,
                      background:disabled?'#F0F4F0':GM,
                      border:'2px solid '+(disabled?'transparent':ch.color+'25'),
                      color:disabled?brand.storeDim:brand.storeHeading,
                      cursor:disabled?'not-allowed':'pointer', textAlign:'left' }}>
                    <span style={{ fontSize:28 }}>{ch.emoji}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15 }}>{ch.label}
                        {disabled && <span style={{ fontSize:10, color:brand.gold, marginLeft:8 }}>({ch.key === 'email' ? 'email' : 'phone'} required)</span>}
                      </div>
                      <div style={{ fontSize:12, color:brand.storeDim }}>{ch.desc}</div>
                    </div>
                    {!disabled && <span style={{ marginLeft:'auto', color:ch.color, fontSize:18, fontWeight:700 }}>→</span>}
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep('contact')} style={{ width:'100%', padding:10, borderRadius:10, background:'none', border:'none', color:brand.storeDim, fontSize:12, cursor:'pointer' }}>← Back</button>
          </div>}

          {/* STEP 3 */}
          {step === 'otp' && <div>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="• • • • • •" autoFocus maxLength={6}
              style={{ ...inp, textAlign:'center', fontSize:28, letterSpacing:'.4em', fontWeight:700, marginBottom:8, fontFamily:'monospace' }}
              onKeyDown={e => e.key === 'Enter' && otp.length >= 4 && verifyOTP()} />
            <div style={{ fontSize:11, color:brand.storeDim, textAlign:'center', marginBottom:16 }}>
              Demo OTP: <span style={{ color:G, fontFamily:'monospace', fontWeight:700 }}>1234</span>
            </div>
            <button onClick={verifyOTP} disabled={otp.length < 4}
              style={{ width:'100%', padding:14, borderRadius:12, fontSize:15, fontWeight:700, border:'none',
                cursor:otp.length>=4?'pointer':'not-allowed',
                background:otp.length>=4?G:brand.storeBorder,
                color:otp.length>=4?'#fff':brand.storeDim }}>
              ✅ Verify & Sign In
            </button>
            <div style={{ display:'flex', gap:8, marginTop:10 }}>
              <button onClick={() => sendOTP(otpChannel)} style={{ flex:1, padding:10, borderRadius:10, background:'none', border:'1px solid '+brand.storeBorder, color:brand.storeDim, fontSize:11, cursor:'pointer' }}>Resend OTP</button>
              <button onClick={() => { setStep('channel'); setOtp(''); }} style={{ flex:1, padding:10, borderRadius:10, background:'none', border:'1px solid '+brand.storeBorder, color:brand.storeDim, fontSize:11, cursor:'pointer' }}>Change method</button>
            </div>
            <button onClick={() => { setStep('contact'); setOtp(''); }} style={{ width:'100%', marginTop:6, padding:10, background:'none', border:'none', color:brand.storeDim, fontSize:11, cursor:'pointer' }}>← Change number/email</button>
          </div>}

          {error && <div style={{ marginTop:12, padding:'10px 14px', borderRadius:8, background:brand.red+'10', border:'1px solid '+brand.red+'25', color:brand.red, fontSize:12, textAlign:'center' }}>⚠️ {error}</div>}

          <div style={{ marginTop:18, paddingTop:14, borderTop:'1px solid '+brand.storeBorder, textAlign:'center' }}>
            <div style={{ fontSize:11, color:brand.storeDim, marginBottom:6 }}>or order directly via</div>
            <button style={{ padding:'8px 20px', borderRadius:10, background:'#25D366', color:'#fff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>💬 WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(UserAuthModal);
