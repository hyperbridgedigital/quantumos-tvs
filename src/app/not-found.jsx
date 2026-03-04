'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', background: '#F8FAFC', color: '#0F172A' }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, marginBottom: 8 }}>404</h1>
      <p style={{ fontSize: 18, color: '#64748B', marginBottom: 24 }}>Page not found</p>
      <Link href="/" style={{ padding: '12px 24px', borderRadius: 10, background: '#0066CC', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
        Go home
      </Link>
    </div>
  );
}
