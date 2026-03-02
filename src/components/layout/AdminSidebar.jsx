'use client';
import { memo, useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { ROLES, SIDEBAR_GROUPS } from '@/data/roles';

function AdminSidebar() {
  const { user, canAccess, adminTab, setAdminTab, liveOrders, lowStock, customers } = useApp();
  const [collapsed, setCollapsed] = useState({});

  const atRiskCount = useMemo(() => customers.filter(c => c.tags?.includes('at-risk')).length, [customers]);
  const badges = { orders: liveOrders.length, stock: lowStock.length, crm: atRiskCount };

  const toggle = (key) => setCollapsed(p => ({ ...p, [key]: !p[key] }));

  const visibleGroups = useMemo(() => {
    return SIDEBAR_GROUPS.map(g => ({
      ...g,
      tabs: g.tabs.filter(t => canAccess(t.key)),
    })).filter(g => g.tabs.length > 0);
  }, [canAccess]);

  return (
    <div className="admin-sidebar" style={{ width:210, background:'#0E0D0B', borderRight:'1px solid #1E1D1A', padding:'14px 6px', flexShrink:0, overflowY:'auto', maxHeight:'calc(100vh - 54px)' }}>
      {/* User */}
      <div style={{ padding:'0 10px', marginBottom:14 }}>
        <div style={{ fontSize:11, fontWeight:700, color:brand.gold }}>{ROLES[user.role]?.emoji} {user.name}</div>
        <div style={{ fontSize:8, color:'#555', fontWeight:600, letterSpacing:'.12em' }}>QuantumOS v{brand.version}</div>
      </div>

      {/* Grouped navigation */}
      {visibleGroups.map(g => (
        <div key={g.key} style={{ marginBottom:4 }}>
          {/* Group header */}
          <button onClick={() => toggle(g.key)} style={{
            width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'6px 10px', border:'none', background:'transparent', cursor:'pointer',
          }}>
            <span style={{ fontSize:9, fontWeight:800, letterSpacing:'.18em', color:'#555', textTransform:'uppercase' }}>
              {g.label}
            </span>
            <span style={{ fontSize:8, color:'#444', transition:'transform .15s', transform: collapsed[g.key] ? 'rotate(-90deg)' : 'rotate(0)' }}>▼</span>
          </button>

          {/* Tabs */}
          {!collapsed[g.key] && g.tabs.map(t => {
            const isActive = adminTab === t.key;
            const badge = badges[t.key];
            return (
              <button key={t.key} onClick={() => setAdminTab(t.key)} style={{
                width:'100%', display:'flex', alignItems:'center', gap:8,
                padding:'7px 10px', marginBottom:1, borderRadius:8, border:'none',
                background: isActive ? brand.gold+'15' : 'transparent',
                color: isActive ? brand.gold : '#777',
                fontSize:12, fontWeight: isActive ? 700 : 500, textAlign:'left', cursor:'pointer',
                transition:'all .12s',
              }}>
                <span style={{ fontSize:13, width:18, textAlign:'center', opacity: isActive ? 1 : .7 }}>{t.emoji}</span>
                <span style={{ flex:1 }}>{t.label}</span>
                {badge > 0 && (
                  <span style={{
                    fontSize:9, padding:'1px 5px', borderRadius:6, fontWeight:700,
                    background: t.key==='stock' || t.key==='crm' ? brand.red+'22' : brand.blue+'22',
                    color: t.key==='stock' || t.key==='crm' ? brand.red : brand.blue,
                  }}>{badge}</span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
export default memo(AdminSidebar);
