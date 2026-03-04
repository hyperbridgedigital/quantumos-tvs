'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';

export default function AdminLoginModal() {
  const { showAdminLogin, setShowAdminLogin, adminLogin, show } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAdminLogin) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await adminLogin(email, password);
    setLoading(false);
    if (res?.ok) setShowAdminLogin(false);
    else show(res?.error || 'Login failed', 'error');
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
        background: 'rgba(0,0,0,.6)',
      }}
      onClick={() => setShowAdminLogin(false)}
    >
      <div
        style={{
          background: brand.card,
          padding: 28,
          borderRadius: 16,
          maxWidth: 380,
          width: '100%',
          border: `1px solid ${brand.border}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: brand.heading, marginBottom: 20 }}>Admin login</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: `1px solid ${brand.border}`, background: brand.bg2, color: brand.heading }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: 12, marginBottom: 20, borderRadius: 8, border: `1px solid ${brand.border}`, background: brand.bg2, color: brand.heading }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: 12, borderRadius: 8, background: brand.gold, color: '#000', fontWeight: 700, border: 'none' }}>
              {loading ? '...' : 'Sign in'}
            </button>
            <button type="button" onClick={() => setShowAdminLogin(false)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${brand.border}`, background: 'transparent', color: brand.text }}>Cancel</button>
          </div>
        </form>
        <p style={{ marginTop: 12, fontSize: 11, color: brand.dim }}>Demo: admin@thevaluestore.com / Admin@123</p>
      </div>
    </div>
  );
}
