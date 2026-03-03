'use client';
import { useState } from 'react';

const OTP_PROVIDERS = [
  { id: 'fast2sms', name: 'Fast2SMS', type: 'SMS', status: 'active', icon: '📱' },
  { id: 'msg91', name: 'MSG91', type: 'SMS', status: 'inactive', icon: '📱' },
  { id: 'resend', name: 'Resend', type: 'Email', status: 'active', icon: '📧' },
  { id: 'whatsapp', name: 'WhatsApp OTP', type: 'WhatsApp', status: 'active', icon: '💬' },
];

export default function OTPSettingsPage() {
  const [providers, setProviders] = useState(OTP_PROVIDERS);
  const [otpLength, setOtpLength] = useState(6);
  const [otpExpiry, setOtpExpiry] = useState(300);

  const toggleProvider = (id) => {
    setProviders((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
      )
    );
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F0F4F8', fontFamily: "'Fraunces', Georgia, serif", marginBottom: 4 }}>
        OTP Providers
      </h1>
      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 24 }}>
        Configure multi-channel OTP verification for customer authentication
      </p>

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* General Settings */}
        <div style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 14 }}>General Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                OTP Length
              </label>
              <select
                value={otpLength}
                onChange={(e) => setOtpLength(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#E2E8F0',
                  fontSize: 13,
                  outline: 'none',
                }}
              >
                <option value={4}>4 digits</option>
                <option value={6}>6 digits</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                Expiry (seconds)
              </label>
              <input
                type="number"
                value={otpExpiry}
                onChange={(e) => setOtpExpiry(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#E2E8F0',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Providers */}
        {providers.map((provider) => (
          <div
            key={provider.id}
            style={{
              padding: 20,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${provider.status === 'active' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.06)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{provider.icon}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0' }}>{provider.name}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{provider.type} Provider</div>
              </div>
            </div>
            <button
              onClick={() => toggleProvider(provider.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                background: provider.status === 'active' ? 'rgba(52, 211, 153, 0.12)' : 'rgba(255,255,255,0.06)',
                color: provider.status === 'active' ? '#34D399' : '#64748B',
              }}
            >
              {provider.status === 'active' ? '● Active' : '○ Inactive'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
