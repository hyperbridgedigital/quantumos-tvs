'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { Badge } from '@/components/shared/Badge';
import { partnerConfig } from '@/data/partners';

function PartnerIDs() {
  const { partnerValues, updatePartnerConfig, savePartnerConfig } = useApp();
  const [search, setSearch] = useState('');

  return (
    <div>
      <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, marginBottom:4 }}>🔑 Partner ID Configuration</h2>
      <p style={{ fontSize:12, color:brand.dim, marginBottom:16 }}>All 40+ API keys configurable. Changes affect storefront & API routes live.</p>
      <input placeholder="Search partners..." value={search} onChange={e => setSearch(e.target.value)}
        style={{ maxWidth:300, marginBottom:20, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, borderRadius:8, padding:'9px 12px', color:brand.heading, fontSize:13, outline:'none', width:'100%' }} />
      {Object.entries(partnerConfig).map(([section, keys]) => {
        const filtered = keys.filter(k => !search || k.label.toLowerCase().includes(search.toLowerCase()) || k.partner.toLowerCase().includes(search.toLowerCase()));
        if (!filtered.length) return null;
        return (
          <div key={section} style={{ marginBottom:24 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:brand.gold, marginBottom:12 }}>{section}</div>
            <div style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:16 }}>
              {filtered.map(k => (
                <div key={k.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid '+brand.border+'20' }}>
                  <Badge color={brand.blue}>{k.partner}</Badge>
                  <label style={{ width:160, fontSize:12, color:brand.text, fontWeight:600, flexShrink:0 }}>{k.label}</label>
                  <input type={k.type==='password'?'password':'text'} value={partnerValues[k.key]||''} onChange={e => updatePartnerConfig(k.key, e.target.value)} placeholder={k.label}
                    style={{ flex:1, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, borderRadius:8, padding:'9px 12px', color:brand.heading, fontSize:13, outline:'none' }} />
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <button onClick={savePartnerConfig} style={{ padding:'12px 32px', borderRadius:10, background:brand.gold, color:'#000', fontWeight:700, fontSize:14, border:'none' }}>💾 Save All Partner Config</button>
    </div>
  );
}
export default memo(PartnerIDs);
