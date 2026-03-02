'use client';
import { memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { Badge } from '@/components/shared/Badge';
import { ADMIN_TABS } from '@/data/roles';

function RBAC() {
  const { roles, toggleRoleTab, show } = useApp();

  return (
    <div>
      <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, marginBottom:4 }}>🛡 Role-Based Access Control</h2>
      <p style={{ fontSize:12, color:brand.dim, marginBottom:20 }}>Changes apply instantly — switch roles in TopBar to verify.</p>
      {Object.entries(roles).map(([key, role]) => (
        <div key={key} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:16, marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
            <span style={{ fontSize:20 }}>{role.emoji}</span>
            <span style={{ fontWeight:700, color:brand.heading, fontSize:15 }}>{role.label}</span>
            <Badge color={role.color}>{key}</Badge>
            {role.tabs.includes('all') && <Badge color={brand.gold}>FULL ACCESS</Badge>}
          </div>
          {!role.tabs.includes('all') && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {ADMIN_TABS.map(t => {
                const has = role.tabs.includes(t.key);
                return (
                  <button key={t.key} onClick={() => toggleRoleTab(key, t.key)} style={{
                    padding:'5px 12px', borderRadius:8, fontSize:11, fontWeight:600, border:'1px solid '+(has?brand.emerald+'40':brand.border),
                    background:has?brand.emerald+'18':'transparent', color:has?brand.emerald:brand.dim }}>
                    {has?'✅':'⬜'} {t.emoji} {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
      <button onClick={() => show('RBAC saved!')} style={{ padding:'10px 24px', borderRadius:8, background:brand.gold, color:'#000', fontWeight:700, border:'none' }}>💾 Save RBAC</button>
    </div>
  );
}
export default memo(RBAC);
