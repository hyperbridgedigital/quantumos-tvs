'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt, statusColor } from '@/lib/utils';
import { Badge } from '@/components/shared/Badge';

function Franchise() {
  const { franchises, addFranchise, updateFranchise, settings, show } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [f, setF] = useState({ name:'', owner:'', phone:'', city:'', status:'setup', royalty:Number(settings.FRANCHISE_DEFAULT_ROYALTY||12), investment:0 });

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>🏢 Franchise Management</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{ padding:'8px 16px', borderRadius:8, background:brand.purple+'18', border:'1px solid '+brand.purple, color:brand.purple, fontSize:12, fontWeight:700 }}>+ New Franchise</button>
      </div>

      {showAdd && (
        <div style={{ background:brand.card, border:'1px solid '+brand.purple+'30', borderRadius:12, padding:16, marginBottom:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {['name','owner','phone','city'].map(k => <input key={k} placeholder={k} value={f[k]} onChange={e => setF(p=>({...p,[k]:e.target.value}))} style={{ padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' }} />)}
          <input type="number" placeholder="Royalty %" value={f.royalty} onChange={e => setF(p=>({...p,royalty:Number(e.target.value)}))} style={{ padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' }} />
          <input type="number" placeholder="Investment ₹" value={f.investment} onChange={e => setF(p=>({...p,investment:Number(e.target.value)}))} style={{ padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' }} />
          <button onClick={() => { if(f.name && f.owner) { addFranchise(f); setShowAdd(false); } else show('Fill name & owner','error'); }} style={{ gridColumn:'span 2', padding:10, borderRadius:8, background:brand.purple, color:'#fff', fontWeight:700, border:'none' }}>💾 Create Franchise</button>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:12 }}>
        {franchises.map(fr => (
          <div key={fr.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderLeft:'4px solid '+statusColor(fr.status), borderRadius:12, padding:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
              <div><div style={{ fontWeight:700, color:brand.heading }}>{fr.name.replace('TheValueStore — ','').replace('Charminar Mehfil — ','')}</div><div style={{ fontSize:11, color:brand.dim }}>{fr.owner} · {fr.city} · Since {fr.since}</div></div>
              <select value={fr.status} onChange={e => updateFranchise(fr.id, { status: e.target.value })} style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:statusColor(fr.status), outline:'none' }}>
                <option value="active">Active</option><option value="setup">Setup</option><option value="suspended">Suspended</option><option value="closed">Closed</option>
              </select>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              <div style={{ background:brand.bg, borderRadius:6, padding:6, textAlign:'center' }}><div style={{ fontSize:14, fontWeight:700, color:brand.emerald }}>{fmt(fr.revenue)}</div><div style={{ fontSize:9, color:brand.dim }}>Revenue</div></div>
              <div style={{ background:brand.bg, borderRadius:6, padding:6, textAlign:'center' }}><div style={{ fontSize:14, fontWeight:700, color:brand.blue }}>{fr.orders}</div><div style={{ fontSize:9, color:brand.dim }}>Orders</div></div>
              <div style={{ background:brand.bg, borderRadius:6, padding:6, textAlign:'center' }}><div style={{ fontSize:14, fontWeight:700, color:brand.gold }}>{fr.royalty}%</div><div style={{ fontSize:9, color:brand.dim }}>Royalty</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default memo(Franchise);
