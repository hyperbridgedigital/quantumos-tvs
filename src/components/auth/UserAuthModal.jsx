'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';

export default function UserAuthModal() {
  const { showUserAuth, setShowUserAuth, userSendOTP, userVerifyOTP, show } = useApp();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');

  if (!showUserAuth) return null;

  const handleSendOTP = async () => {
    const res = await userSendOTP(phone, 'sms');
    if (res?.ok) setStep('otp');
    else show(res?.error || 'Failed', 'error');
  };

  const handleVerify = async () => {
    const res = await userVerifyOTP(phone, otp, name, 'sms');
    if (res?.ok) {
      setShowUserAuth(false);
      setStep('phone');
      setPhone('');
      setOtp('');
      setName('');
    } else show(res?.error || 'Failed', 'error');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,.5)',
      }}
      onClick={() => setShowUserAuth(false)}
    >
      <div
        style={{
          background: brand.storeCard,
          padding: 24,
          borderRadius: 16,
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 20px 60px rgba(0,0,0,.2)',
          border: `1px solid ${brand.storeBorder}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: brand.storeHeading, marginBottom: 16 }}>Sign in</h3>
        {step === 'phone' && (
          <>
            <input
              placeholder="Phone (+91)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: `1px solid ${brand.storeBorder}` }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSendOTP} style={{ flex: 1, padding: 12, borderRadius: 8, background: brand.green, color: '#fff', fontWeight: 700, border: 'none' }}>Send OTP</button>
              <button onClick={() => setShowUserAuth(false)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${brand.storeBorder}`, background: 'transparent' }}>Cancel</button>
            </div>
          </>
        )}
        {step === 'otp' && (
          <>
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 8, borderRadius: 8, border: `1px solid ${brand.storeBorder}` }} />
            <input placeholder="OTP" value={otp} onChange={e => setOtp(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: `1px solid ${brand.storeBorder}` }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleVerify} style={{ flex: 1, padding: 12, borderRadius: 8, background: brand.green, color: '#fff', fontWeight: 700, border: 'none' }}>Verify</button>
              <button onClick={() => setStep('phone')} style={{ padding: 12, borderRadius: 8, border: `1px solid ${brand.storeBorder}`, background: 'transparent' }}>Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
