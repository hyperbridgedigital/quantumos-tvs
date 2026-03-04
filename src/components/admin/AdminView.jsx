'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';

export default function AdminView() {
  const { user, orders, stores, setShowAdminLogin, adminLogout } = useApp();
  const [adminTab, setAdminTab] = useState('dashboard');
  const [kynetraTemplates, setKynetraTemplates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editReply, setEditReply] = useState('');

  useEffect(() => {
    if (adminTab === 'kynetra') {
      fetch('/api/kynetra/templates')
        .then((r) => r.json())
        .then((d) => setKynetraTemplates(d.templates || []))
        .catch(() => setKynetraTemplates([]));
    }
  }, [adminTab]);

  const saveTemplate = (id, updates) => {
    const next = kynetraTemplates.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setKynetraTemplates(next);
    fetch('/api/kynetra/templates', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templates: next }),
    }).catch(() => {});
    setEditingId(null);
    setEditReply('');
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, background: brand.bg }}>
        <div style={{ fontSize: 48 }}>🔐</div>
        <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 24, color: brand.heading }}>Admin login required</h2>
        <button onClick={() => setShowAdminLogin(true)} style={{ padding: '12px 24px', borderRadius: 12, background: brand.gold, color: '#000', fontWeight: 700, border: 'none' }}>
          Sign in
        </button>
      </div>
    );
  }

  const liveOrders = orders?.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled') || [];
  const activeStores = stores?.filter((s) => s.status === 'active') || [];

  return (
    <div style={{ padding: 24, background: brand.bg, minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 24, color: brand.heading }}>Admin</h1>
        <button onClick={adminLogout} style={{ padding: '8px 16px', borderRadius: 8, background: brand.border, color: brand.text, border: 'none', fontSize: 13 }}>
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          onClick={() => setAdminTab('dashboard')}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: adminTab === 'dashboard' ? brand.gold : brand.border, color: adminTab === 'dashboard' ? '#000' : brand.text, fontWeight: 600 }}
        >
          Dashboard
        </button>
        <button
          onClick={() => setAdminTab('kynetra')}
          style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: adminTab === 'kynetra' ? brand.gold : brand.border, color: adminTab === 'kynetra' ? '#000' : brand.text, fontWeight: 600 }}
        >
          Kynetra
        </button>
      </div>

      {adminTab === 'dashboard' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            <div style={{ padding: 20, background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: brand.emerald }}>{liveOrders.length}</div>
              <div style={{ fontSize: 12, color: brand.dim }}>Active orders</div>
            </div>
            <div style={{ padding: 20, background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: brand.blue }}>{activeStores.length}</div>
              <div style={{ fontSize: 12, color: brand.dim }}>Stores</div>
            </div>
            <div style={{ padding: 20, background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: brand.gold }}>{orders?.length || 0}</div>
              <div style={{ fontSize: 12, color: brand.dim }}>Total orders</div>
            </div>
          </div>

          {liveOrders.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h2 style={{ fontSize: 16, color: brand.heading, marginBottom: 12 }}>Recent orders</h2>
              <div style={{ background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12, overflow: 'hidden' }}>
                {liveOrders.slice(0, 10).map((o) => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: `1px solid ${brand.border}` }}>
                    <span style={{ color: brand.heading }}>{o.id}</span>
                    <span style={{ color: brand.dim }}>{o.customer} · ₹{Number(o.total).toLocaleString('en-IN')}</span>
                    <span style={{ color: brand.emerald }}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={{ marginTop: 32, fontSize: 12, color: brand.dim }}>More admin modules can be added here.</p>
        </>
      )}

      {adminTab === 'kynetra' && (
        <div>
          <h2 style={{ fontSize: 18, color: brand.heading, marginBottom: 16 }}>Kynetra · Templates & actions</h2>
          <p style={{ fontSize: 13, color: brand.dim, marginBottom: 20 }}>Edit reply text and actions. Changes apply to the store chat immediately.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {kynetraTemplates.slice(0, 20).map((t) => (
              <div key={t.id} style={{ padding: 16, background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: brand.heading, marginBottom: 4 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: brand.dim }}>Module: {t.module} · Action: {t.action || 'none'}</div>
                  </div>
                  {editingId === t.id ? (
                    <div style={{ flex: '1 1 100%', marginTop: 8 }}>
                      <textarea
                        value={editReply}
                        onChange={(e) => setEditReply(e.target.value)}
                        style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: `1px solid ${brand.border}`, background: brand.bg2, color: brand.text, fontSize: 13 }}
                      />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => saveTemplate(t.id, { replyText: editReply })} style={{ padding: '8px 16px', borderRadius: 8, background: brand.emerald, color: '#fff', border: 'none', fontWeight: 600 }}>Save</button>
                        <button onClick={() => { setEditingId(null); setEditReply(''); }} style={{ padding: '8px 16px', borderRadius: 8, background: brand.border, color: brand.text, border: 'none' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingId(t.id); setEditReply(t.replyText || ''); }} style={{ padding: '6px 12px', borderRadius: 8, background: brand.border, color: brand.text, border: 'none', fontSize: 12 }}>Edit</button>
                  )}
                </div>
                {editingId !== t.id && <div style={{ marginTop: 8, fontSize: 13, color: brand.text }}>{(t.replyText || '').slice(0, 120)}…</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
