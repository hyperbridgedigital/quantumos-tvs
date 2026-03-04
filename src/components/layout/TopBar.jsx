'use client';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';

export default function TopBar() {
  const { view, setView, user, storeTheme, setStoreTheme, setShowAdminLogin, setShowUserAuth, cart } = useApp();
  const isStore = view === 'store';
  const isDark = storeTheme === 'dark';

  return (
    <header
      className="topbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        background: isStore ? (isDark ? brand.storeDark?.storeBg2 ?? '#1E293B' : brand.storeBg2) : brand.bg2,
        borderBottom: `1px solid ${isStore ? (isDark ? brand.storeDark?.storeBorder : brand.storeBorder) : brand.border}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontFamily: brand.fontDisplay, fontWeight: 700, fontSize: 18, color: isStore ? (isDark ? brand.storeDark?.storeHeading : brand.storeHeading) : brand.heading }}>
          {brand.name}
        </span>
        <button
          onClick={() => setView('store')}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: isStore ? brand.green : 'transparent',
            color: isStore ? '#fff' : brand.dim,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Store
        </button>
        <button
          onClick={() => setView('admin')}
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            border: 'none',
            background: !isStore ? brand.green : 'transparent',
            color: !isStore ? '#fff' : brand.dim,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Admin
        </button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isStore && (
          <button
            onClick={() => setStoreTheme(isDark ? 'light' : 'dark')}
            style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${brand.storeBorder}`, background: 'transparent', fontSize: 12, color: brand.storeDim }}
          >
            {isDark ? '☀️ Light' : '🌙 Dark'}
          </button>
        )}
        {isStore && (
          <button onClick={() => setShowUserAuth(true)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${brand.green}`, background: 'transparent', color: brand.green, fontSize: 13, fontWeight: 600 }}>
            Sign in
          </button>
        )}
        {!user && view === 'admin' && (
          <button onClick={() => setShowAdminLogin(true)} style={{ padding: '8px 16px', borderRadius: 8, background: brand.gold, color: '#000', fontSize: 13, fontWeight: 700, border: 'none' }}>
            Admin Login
          </button>
        )}
        {user && view === 'admin' && (
          <span style={{ fontSize: 12, color: brand.dim }}>{user.name}</span>
        )}
        {isStore && cart?.length > 0 && (
          <span style={{ fontSize: 12, color: brand.storeDim }}>🛒 {cart.length}</span>
        )}
      </div>
    </header>
  );
}
