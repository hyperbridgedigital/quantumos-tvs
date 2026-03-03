'use client';
import { useState } from 'react';
import KynetraChat from '@/components/admin/KynetraChat';
import KynetraInsights from '@/components/admin/KynetraInsights';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: '📊', href: '/admin/dashboard' },
  { key: 'menu', label: 'Menu', icon: '🍽️', href: '/admin/dashboard/menu' },
  { key: 'orders', label: 'Orders', icon: '📦', href: '/admin/dashboard/orders' },
  { key: 'settings', label: 'Settings', icon: '⚙️', href: '/admin/dashboard/settings/mode' },
];

function AdminSidebarNav() {
  const [active, setActive] = useState('dashboard');

  return (
    <aside
      style={{
        width: 220,
        minHeight: '100vh',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background: 'rgba(255,255,255,0.04)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        padding: '20px 10px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Brand */}
      <div style={{ padding: '0 12px', marginBottom: 28 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '.2em',
            color: '#64748B',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          QUANTUMOS
        </div>
        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Charminar Mehfil
        </div>
        <div style={{ fontSize: 9, color: '#475569', marginTop: 2 }}>Kynetra AI • v1.2.0</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              setActive(item.key);
              window.location.href = item.href;
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 12px',
              borderRadius: 10,
              background: active === item.key ? 'rgba(61, 216, 245, 0.1)' : 'transparent',
              color: active === item.key ? '#3DD8F5' : '#94A3B8',
              fontSize: 13,
              fontWeight: active === item.key ? 700 : 500,
              textDecoration: 'none',
              transition: 'all 0.15s',
              border: active === item.key ? '1px solid rgba(61, 216, 245, 0.15)' : '1px solid transparent',
            }}
          >
            <span style={{ fontSize: 15, width: 22, textAlign: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Kynetra branding */}
      <div
        style={{
          padding: '12px',
          borderRadius: 10,
          background: 'rgba(61, 216, 245, 0.04)',
          border: '1px solid rgba(61, 216, 245, 0.08)',
          marginTop: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 14 }}>🤖</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            KYNETRA AI
          </span>
        </div>
        <div style={{ fontSize: 10, color: '#64748B', lineHeight: 1.4 }}>
          AI-powered operations intelligence for your restaurant.
        </div>
      </div>
    </aside>
  );
}

export default function AdminDashboardLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#070B14', color: '#E2E8F0' }}>
      {/* Grain texture overlay */}
      <div className="bg-grain" style={{ position: 'fixed', inset: 0, opacity: 0.05, pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ display: 'flex', position: 'relative', zIndex: 1 }}>
        {/* Sidebar with glass-morphism */}
        <AdminSidebarNav />

        {/* Main content */}
        <main style={{ flex: 1, padding: 24, minHeight: '100vh', overflowY: 'auto' }}>
          {/* Kynetra AI Insights Bar */}
          <KynetraInsights style={{ marginBottom: 24 }} />
          {children}
        </main>

        {/* Kynetra Chat Panel (floating) */}
        <KynetraChat />
      </div>

      {/* Floating orb */}
      <div
        className="kyn-orb"
        style={{
          position: 'fixed',
          top: 80,
          right: 80,
          width: 256,
          height: 256,
          zIndex: 0,
        }}
      />
    </div>
  );
}
