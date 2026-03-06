'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { SIDEBAR_GROUPS } from '@/data/roles';
import { ROLE_CONFIG } from '@/lib/auth/credentials';
import Dashboard from './Dashboard';

function getAllTabKeys() {
  return SIDEBAR_GROUPS.flatMap((g) => g.tabs.map((t) => t.key));
}

function getAllowedTabs(user) {
  if (!user?.role) return [];
  const config = ROLE_CONFIG[user.role];
  if (!config) return [];
  const tabs = config.tabs;
  if (tabs === 'all') return getAllTabKeys();
  return Array.isArray(tabs) ? tabs : [];
}

export default function AdminView() {
  const { user, orders, stores, setShowAdminLogin, adminLogout } = useApp();
  const [adminTab, setAdminTab] = useState('dashboard');
  const [kynetraTemplates, setKynetraTemplates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editReply, setEditReply] = useState('');

  const allowedTabSet = new Set(getAllowedTabs(user));

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
    <div style={{ display: 'flex', minHeight: '100vh', background: brand.bg }}>
      {/* Sidebar — all nav links visible for allowed tabs */}
      <aside
        style={{
          width: 260,
          flexShrink: 0,
          padding: '24px 12px',
          borderRight: `1px solid ${brand.border}`,
          background: brand.bg2,
          overflowY: 'auto',
        }}
      >
        <div style={{ fontSize: 11, color: brand.dim, fontWeight: 700, marginBottom: 16, paddingLeft: 8 }}>NAVIGATION</div>
        {SIDEBAR_GROUPS.map((group) => {
          const visibleTabs = group.tabs.filter((t) => allowedTabSet.has(t.key));
          if (visibleTabs.length === 0) return null;
          return (
            <div key={group.key} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: brand.dim, marginBottom: 8, paddingLeft: 8 }}>{group.icon} {group.label}</div>
              {visibleTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setAdminTab(tab.key)}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '10px 12px',
                    marginBottom: 4,
                    borderRadius: 8,
                    border: 'none',
                    textAlign: 'left',
                    background: adminTab === tab.key ? brand.gold : 'transparent',
                    color: adminTab === tab.key ? '#000' : brand.text,
                    fontWeight: adminTab === tab.key ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ marginRight: 6 }}>{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          );
        })}
      </aside>

      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 24, color: brand.heading }}>Admin</h1>
          <button onClick={adminLogout} style={{ padding: '8px 16px', borderRadius: 8, background: brand.border, color: brand.text, border: 'none', fontSize: 13 }}>
            Logout
          </button>
        </div>

        {adminTab === 'dashboard' && (
          <Dashboard
            liveOrders={liveOrders}
            orders={orders}
            activeStores={activeStores}
            brand={brand}
          />
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

        {/* Placeholder for other tabs — links appear and are clickable */}
        {adminTab !== 'dashboard' && adminTab !== 'kynetra' && (
          <div style={{ padding: 24, background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12 }}>
            <h2 style={{ fontSize: 18, color: brand.heading, marginBottom: 8 }}>{SIDEBAR_GROUPS.flatMap((g) => g.tabs).find((t) => t.key === adminTab)?.label || adminTab}</h2>
            <p style={{ fontSize: 14, color: brand.dim }}>Section placeholder. Full module can be re-enabled from codebase.</p>
          </div>
        )}
      </div>
    </div>
  );
}
