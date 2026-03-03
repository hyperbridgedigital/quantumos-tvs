'use client';
import { useState, useEffect } from 'react';

export default function KynetraSettingsPage() {
  const [config, setConfig] = useState({
    apiKey: '',
    endpoint: 'https://api.kynetra.hyperbridge.digital',
    model: 'kynetra-cognitive-v2',
    chatEnabled: true,
    insightsEnabled: true,
    anomalyDetection: true,
    whatsappAssist: true,
    autoForecast: true,
    menuOptimization: true,
  });

  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [testing, setTesting] = useState(false);

  const updateField = (key, value) => setConfig((prev) => ({ ...prev, [key]: value }));

  const testConnection = async () => {
    setTesting(true);
    setConnectionStatus('testing');
    try {
      const res = await fetch('/api/kynetra/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ping', context: { test: true } }),
      });
      setConnectionStatus(res.ok ? 'connected' : 'error');
    } catch {
      setConnectionStatus('error');
    } finally {
      setTesting(false);
    }
  };

  const statusColors = {
    unknown: { color: '#64748B', label: 'Not tested' },
    testing: { color: '#FBBF24', label: 'Testing...' },
    connected: { color: '#34D399', label: 'Connected' },
    error: { color: '#F87171', label: 'Connection failed' },
  };

  const status = statusColors[connectionStatus];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 24 }}>🤖</span>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Fraunces', Georgia, serif",
          }}
        >
          Kynetra AI Configuration
        </h1>
      </div>
      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 24 }}>
        Configure the Kynetra Cognitive Grid Engine for AI-powered operations
      </p>

      <div style={{ maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Connection */}
        <div style={{ padding: 20, borderRadius: 14, background: 'rgba(61, 216, 245, 0.03)', border: '1px solid rgba(61, 216, 245, 0.1)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#3DD8F5', marginBottom: 14 }}>API Connection</h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
              Kynetra Endpoint
            </label>
            <input
              value={config.endpoint}
              onChange={(e) => updateField('endpoint', e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: '#E2E8F0', fontSize: 13, outline: 'none', fontFamily: "'JetBrains Mono', monospace",
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
              API Key
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => updateField('apiKey', e.target.value)}
              placeholder="kyn_xxxxxxxxxxxxxxxx"
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: '#E2E8F0', fontSize: 13, outline: 'none', fontFamily: "'JetBrains Mono', monospace",
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6 }}>
              Model
            </label>
            <select
              value={config.model}
              onChange={(e) => updateField('model', e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: '#E2E8F0', fontSize: 13, outline: 'none',
              }}
            >
              <option value="kynetra-cognitive-v2">kynetra-cognitive-v2 (Recommended)</option>
              <option value="kynetra-cognitive-v1">kynetra-cognitive-v1 (Legacy)</option>
              <option value="kynetra-lite">kynetra-lite (Faster, less capable)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={testConnection}
              disabled={testing}
              style={{
                padding: '10px 20px', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
                color: '#070B14', fontSize: 12, fontWeight: 700, cursor: testing ? 'wait' : 'pointer',
              }}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            <span style={{ fontSize: 12, color: status.color, fontWeight: 600 }}>
              ● {status.label}
            </span>
          </div>
        </div>

        {/* Feature Toggles */}
        <div style={{ padding: 20, borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 14 }}>AI Features</h3>

          {[
            { key: 'chatEnabled', label: 'Kynetra Chat', desc: 'AI chat assistant in dashboard' },
            { key: 'insightsEnabled', label: 'Smart Insights', desc: 'AI-powered business insights bar' },
            { key: 'anomalyDetection', label: 'Anomaly Detection', desc: 'Real-time alerts for unusual patterns' },
            { key: 'whatsappAssist', label: 'WhatsApp AI Assist', desc: 'AI-generated customer reply suggestions' },
            { key: 'autoForecast', label: 'Demand Forecasting', desc: 'Predictive inventory and sales forecasting' },
            { key: 'menuOptimization', label: 'Menu Optimization', desc: 'AI-driven pricing and combo suggestions' },
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
                  width: 42, height: 24, borderRadius: 12, border: 'none',
                  background: config[toggle.key] ? '#3DD8F5' : 'rgba(255,255,255,0.1)',
                  cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: config[toggle.key] ? 21 : 3, transition: 'left 0.2s',
                }} />
              </button>
            </div>
          ))}
        </div>

        <button
          style={{
            padding: '14px 24px', borderRadius: 12, border: 'none',
            background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
            color: '#070B14', fontSize: 14, fontWeight: 700, cursor: 'pointer',
          }}
        >
          Save Kynetra Configuration
        </button>
      </div>
    </div>
  );
}
