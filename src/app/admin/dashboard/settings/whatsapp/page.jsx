'use client';
import { useState } from 'react';

export default function WhatsAppSettingsPage() {
  const [config, setConfig] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    accessToken: '',
    verifyToken: 'cm_verify_2026',
    webhookUrl: 'https://charminarmehfil.com/api/whatsapp',
    autoReply: true,
    aiSuggestions: true,
    broadcastEnabled: false,
  });

  const updateField = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F0F4F8', fontFamily: "'Fraunces', Georgia, serif", marginBottom: 4 }}>
        WhatsApp Configuration
      </h1>
      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 24 }}>
        Meta Cloud API integration for WhatsApp Business
      </p>

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* API Credentials */}
        <div style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 14 }}>API Credentials</h3>

          {[
            { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: 'Enter Meta Phone Number ID' },
            { key: 'businessAccountId', label: 'Business Account ID', placeholder: 'Enter Meta Business Account ID' },
            { key: 'accessToken', label: 'Access Token', placeholder: 'Enter permanent access token', type: 'password' },
            { key: 'verifyToken', label: 'Webhook Verify Token', placeholder: 'Verify token for webhook' },
          ].map((field) => (
            <div key={field.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
                {field.label}
              </label>
              <input
                type={field.type || 'text'}
                value={config[field.key]}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#E2E8F0',
                  fontSize: 13,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>

        {/* Kynetra AI Features */}
        <div style={{ padding: 20, borderRadius: 14, background: 'rgba(61, 216, 245, 0.03)', border: '1px solid rgba(61, 216, 245, 0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: '#3DD8F5' }}>Kynetra AI WhatsApp Assist</h3>
          </div>

          {[
            { key: 'autoReply', label: 'Auto-Reply Suggestions', desc: 'AI generates reply suggestions for incoming messages' },
            { key: 'aiSuggestions', label: 'Smart Upsell', desc: 'Suggest relevant items based on order history' },
            { key: 'broadcastEnabled', label: 'Campaign Broadcast', desc: 'Enable bulk WhatsApp template messages' },
          ].map((toggle) => (
            <div
              key={toggle.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#E2E8F0' }}>{toggle.label}</div>
                <div style={{ fontSize: 10, color: '#64748B', marginTop: 2 }}>{toggle.desc}</div>
              </div>
              <button
                onClick={() => updateField(toggle.key, !config[toggle.key])}
                style={{
                  width: 42,
                  height: 24,
                  borderRadius: 12,
                  border: 'none',
                  background: config[toggle.key] ? '#3DD8F5' : 'rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s',
                }}
              >
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#fff',
                    position: 'absolute',
                    top: 3,
                    left: config[toggle.key] ? 21 : 3,
                    transition: 'left 0.2s',
                  }}
                />
              </button>
            </div>
          ))}
        </div>

        <button
          style={{
            padding: '14px 24px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
            color: '#070B14',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Save WhatsApp Configuration
        </button>
      </div>
    </div>
  );
}
