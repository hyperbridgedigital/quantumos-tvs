'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt, statusColor } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

function DeliveryEngine() {
  const { deliveryPartners, updatePartnerStatus, addDeliveryPartner, deliveryZones, updateZone, addZone, stores, show } = useApp();
  const active = deliveryPartners.filter(d => d.status !== 'offline');
  const [showAdd, setShowAdd] = useState(false);
  const [newP, setNewP] = useState({ name:'', phone:'', vehicle:'bike', maxOrders:3, store:'' });

  return (
    <div>
      <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, marginBottom:16 }}>🚀 60-Minute Delivery Engine</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:10, marginBottom:20 }}>
        <StatCard label="Active Riders" value={active.length} color={brand.emerald} icon="🛵" />
        <StatCard label="Delivering" value={deliveryPartners.filter(d=>d.status==='delivering').length} color={brand.saffron} icon="📦" />
        <StatCard label="Avg Time" value={active.length?Math.round(active.reduce((a,d)=>a+d.avgTime,0)/active.length)+'m':'--'} color={brand.gold} icon="⏱" />
        <StatCard label="Zones" value={deliveryZones.filter(z=>z.active).length} color={brand.purple} icon="🗺" />
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:brand.emerald }}>🛵 Delivery Partners</div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ fontSize:11, padding:'6px 12px', borderRadius:6, background:brand.emerald+'15', color:brand.emerald, border:'none', fontWeight:700 }}>+ Add Partner</button>
      </div>

      {showAdd && (
        <div style={{ background:brand.card, border:'1px solid '+brand.emerald+'30', borderRadius:12, padding:16, marginBottom:12, display:'flex', gap:8, flexWrap:'wrap', alignItems:'end' }}>
          {['name','phone'].map(f => <input key={f} placeholder={f} value={newP[f]} onChange={e => setNewP(p=>({...p,[f]:e.target.value}))} style={{ flex:1, minWidth:120, padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' }} />)}
          <select value={newP.vehicle} onChange={e => setNewP(p=>({...p,vehicle:e.target.value}))} style={{ padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' }}>
            <option value="bike">Bike</option><option value="scooter">Scooter</option><option value="car">Car</option>
          </select>
          <select value={newP.store} onChange={e => setNewP(p=>({...p,store:e.target.value}))} style={{ padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' }}>
            <option value="">Store...</option>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button onClick={() => { if(newP.name && newP.phone && newP.store) { addDeliveryPartner({...newP, status:'available'}); setNewP({name:'',phone:'',vehicle:'bike',maxOrders:3,store:''}); setShowAdd(false); } else show('Fill all fields','error'); }} style={{ padding:'8px 16px', borderRadius:8, background:brand.emerald, color:'#fff', fontWeight:700, border:'none' }}>Add</button>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:10, marginBottom:20 }}>
        {deliveryPartners.map(d => (
          <div key={d.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderLeft:'3px solid '+statusColor(d.status), borderRadius:12, padding:14 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontWeight:700, color:brand.heading }}>{d.name}</span>
              <select value={d.status} onChange={e => updatePartnerStatus(d.id, e.target.value)} style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:statusColor(d.status), outline:'none' }}>
                <option value="available">Available</option><option value="delivering">Delivering</option><option value="offline">Offline</option><option value="break">Break</option>
              </select>
            </div>
            <div style={{ fontSize:11, color:brand.dim }}>📞 {d.phone} · 🏍 {d.vehicle} · 🏪 {stores.find(s=>s.id===d.store)?.code||'--'}</div>
            <div style={{ display:'flex', gap:10, marginTop:6, fontSize:11 }}>
              <span>📦 {d.orders}/{d.maxOrders}</span>
              <span style={{ color:brand.gold }}>⭐ {d.rating}</span>
              <span>✅ {d.today}</span>
              <span style={{ color:brand.emerald }}>⏱ {d.avgTime}m</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:brand.blue, marginBottom:12 }}>🗺 Delivery Zones</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:8 }}>
        {deliveryZones.map(z => (
          <div key={z.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontWeight:600, color:brand.heading, fontSize:13 }}>{z.name}</span>
              <button onClick={() => updateZone(z.id, { active: !z.active })} style={{ width:36, height:20, borderRadius:10, border:'none', cursor:'pointer', position:'relative', background:z.active?brand.emerald:brand.dim+'40' }}>
                <span style={{ position:'absolute', top:2, left:z.active?18:2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left .3s' }} />
              </button>
            </div>
            <div style={{ display:'flex', gap:10, fontSize:11 }}>
              <span>🚚 {z.fee > 0 ? '₹'+z.fee : 'FREE'}</span>
              <span>🛒 Min ₹{z.minOrder}</span>
              <span>⏱ {z.maxTime}m</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default memo(DeliveryEngine);
