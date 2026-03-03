'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      const authToken = data.accessToken || data.token;
      if (res.ok && authToken) {
        localStorage.setItem('qos_token', authToken);
        localStorage.setItem('qos_user', JSON.stringify(data.user));
        // Keep legacy full admin flow as primary; Kynetra overlays on top there.
        router.push('/');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#070B14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grain overlay */}
      <div className="bg-grain" style={{ position: 'fixed', inset: 0, opacity: 0.05, pointerEvents: 'none' }} />

      {/* Floating orbs */}
      <div
        className="kyn-orb"
        style={{ position: 'fixed', top: '10%', right: '15%', width: 300, height: 300 }}
      />
      <div
        className="kyn-orb"
        style={{ position: 'fixed', bottom: '10%', left: '10%', width: 200, height: 200, animationDelay: '4s' }}
      />

      <div style={{ width: '100%', maxWidth: 400, padding: 24, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '.25em',
              color: '#64748B',
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            QUANTUMOS
          </div>
          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: "'Fraunces', Georgia, serif",
              marginBottom: 6,
            }}
          >
            Charminar Mehfil
          </h1>
          <div style={{ fontSize: 12, color: '#64748B' }}>Admin Dashboard • Powered by Kynetra AI</div>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleLogin}
          style={{
            padding: 28,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.03)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6, letterSpacing: '.05em' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@charminarmehfil.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: '#E2E8F0',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#94A3B8', marginBottom: 6, letterSpacing: '.05em' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                color: '#E2E8F0',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(248, 113, 113, 0.1)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                color: '#F87171',
                fontSize: 12,
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 12,
              border: 'none',
              background: loading ? 'rgba(61, 216, 245, 0.3)' : 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
              color: '#070B14',
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Authenticating...' : '🔐 Sign In to QuantumOS'}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: '#475569' }}>
          Demo: spadensilver@gmail.com / Super@4455
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 10, color: '#334155' }}>
          Powered by HyperBridge QuantumOS v1.2.0 • Kynetra AI
        </div>
      </div>
    </div>
  );
}
