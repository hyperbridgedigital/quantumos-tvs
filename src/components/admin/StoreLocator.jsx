'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { statusColor } from '@/lib/utils';
import { Badge } from '@/components/shared/Badge';

const EMPTY = { name:'', code:'', status:'active', manager:'', phone:'', hours:'10:30 AM - 3:00 AM (Next Day)', radius:5, prepTime:20, maxOrders:50, type:'express', delivery:true, pickup:true, dineIn:false, seating:12, address:'', lat:17.43, lng:78.40, pincodesText:'' };

function StoreLocator() {
  const { stores, addStore, updateStore, deleteStore, show } = useApp();
  const [editing, setEditing] = useState(null); // null | 'new' | store id
  const [form, setForm] = useState(EMPTY);

  const startEdit = (s) => { setEditing(s.id); setForm({ ...s, pincodesText: (s.pincodes || []).join(', ') }); };
  const startNew = () => { setEditing('new'); setForm(EMPTY); };
  const save = () => {
    if (!form.name || !form.code) return show('Name and code required', 'error');
    const nextForm = {
      ...form,
      pincodes: (form.pincodesText || '')
        .split(',')
        .map(p => p.trim())
        .filter(Boolean),
    };
    delete nextForm.pincodesText;
    if (editing === 'new') addStore(nextForm);
    else updateStore(editing, nextForm);
    setEditing(null);
  };
  const cancel = () => setEditing(null);

  const applyDefaultTimings = () => {
    stores.forEach((s) => {
      const isFlagship = (s.type || '').toLowerCase() === 'flagship';
      updateStore(s.id, {
        hours: isFlagship ? '10:30 AM - 8:00 PM' : '10:30 AM - 8:00 PM',
      });
    });
    show('Default store timings applied');
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>🏪 Store Locator & Management</h2>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={applyDefaultTimings} style={{ padding:'8px 16px', borderRadius:8, background:brand.blue+'18', border:'1px solid '+brand.blue, color:brand.blue, fontSize:12, fontWeight:700 }}>🕐 Apply Default Timings</button>
          <button onClick={startNew} style={{ padding:'8px 16px', borderRadius:8, background:brand.emerald+'18', border:'1px solid '+brand.emerald, color:brand.emerald, fontSize:12, fontWeight:700 }}>+ Add Store</button>
        </div>
      </div>

      {editing && (
        <div style={{ background:brand.card, border:'1px solid '+brand.gold+'40', borderRadius:12, padding:20, marginBottom:16 }}>
          <div style={{ fontWeight:700, color:brand.gold, marginBottom:12 }}>{editing === 'new' ? '➕ New Store' : '✏️ Edit Store'}</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {['name','code','manager','phone','hours','address','type','status'].map(f => (
              <div key={f}>
                <label style={{ fontSize:10, color:brand.dim, fontWeight:600 }}>{f.toUpperCase()}</label>
                {f === 'status' ? (
                  <select value={form[f]} onChange={e => setForm(p => ({...p, [f]:e.target.value}))} style={{ width:'100%', padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' }}>
                    <option value="active">Active</option><option value="upcoming">Upcoming</option><option value="closed">Closed</option>
                  </select>
                ) : (
                  <input value={form[f]||''} onChange={e => setForm(p => ({...p, [f]:e.target.value}))} placeholder={f}
                    style={{ width:'100%', padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' }} />
                )}
              </div>
            ))}
            {['radius','prepTime','maxOrders','seating'].map(f => (
              <div key={f}>
                <label style={{ fontSize:10, color:brand.dim, fontWeight:600 }}>{f.toUpperCase()}</label>
                <input type="number" value={form[f]||0} onChange={e => setForm(p => ({...p, [f]:Number(e.target.value)}))}
                  style={{ width:'100%', padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' }} />
              </div>
            ))}
          </div>
          <div style={{ marginTop:10 }}>
            <label style={{ fontSize:10, color:brand.dim, fontWeight:600 }}>SERVICEABLE PINCODES (comma separated)</label>
            <textarea
              value={form.pincodesText || ''}
              onChange={e => setForm(p => ({ ...p, pincodesText: e.target.value }))}
              placeholder="600017, 600018, 600033"
              style={{ width:'100%', minHeight:70, marginTop:4, padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none', resize:'vertical' }}
            />
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            {['delivery','pickup','dineIn'].map(f => (
              <label key={f} style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:brand.text, cursor:'pointer' }}>
                <input type="checkbox" checked={!!form[f]} onChange={e => setForm(p => ({...p, [f]:e.target.checked}))} /> {f}
              </label>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={save} style={{ padding:'8px 20px', borderRadius:8, background:brand.emerald, color:'#fff', fontWeight:700, border:'none' }}>💾 Save</button>
            <button onClick={cancel} style={{ padding:'8px 20px', borderRadius:8, background:'transparent', border:'1px solid '+brand.border, color:brand.dim }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
        {stores.map(s => {
          const sc = statusColor(s.status);
          return (
            <div key={s.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderLeft:'4px solid '+sc, borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <div><div style={{ fontWeight:700, color:brand.heading }}>{s.name}</div><div style={{ fontSize:11, color:brand.dim }}>{s.code} · {s.type} · {s.address}</div></div>
                <Badge color={sc}>{s.status}</Badge>
              </div>
              <div style={{ fontSize:12, color:brand.text, marginBottom:8 }}>👤 {s.manager} · 📞 {s.phone} · 🕐 {s.hours} · 📍 {s.radius}km</div>
              <div style={{ fontSize:11, color:brand.dim, marginBottom:8 }}>📮 Serviceable pincodes: {(s.pincodes || []).length}</div>
              {s.status === 'active' && <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:8 }}>
                <div style={{ background:brand.bg, borderRadius:6, padding:4, textAlign:'center' }}><div style={{ fontSize:14, fontWeight:700, color:s.load/s.maxOrders>.8?brand.red:brand.emerald }}>{s.load}</div><div style={{ fontSize:8, color:brand.dim }}>/{s.maxOrders}</div></div>
                <div style={{ background:brand.bg, borderRadius:6, padding:4, textAlign:'center' }}><div style={{ fontSize:14, fontWeight:700, color:brand.gold }}>{s.prepTime}m</div><div style={{ fontSize:8, color:brand.dim }}>prep</div></div>
                <div style={{ background:brand.bg, borderRadius:6, padding:4, textAlign:'center' }}><div style={{ fontSize:14, fontWeight:700, color:brand.gold }}>⭐{s.rating}</div><div style={{ fontSize:8, color:brand.dim }}>rating</div></div>
                <div style={{ background:brand.bg, borderRadius:6, padding:4, textAlign:'center' }}><div style={{ fontSize:14, fontWeight:700, color:brand.dim }}>{s.seating}</div><div style={{ fontSize:8, color:brand.dim }}>seats</div></div>
              </div>}
              <div style={{ display:'flex', gap:4, fontSize:10 }}>
                {s.delivery && <Badge color={brand.emerald}>🛵 Delivery</Badge>}
                {s.pickup && <Badge color={brand.blue}>🏃 Pickup</Badge>}
                {s.dineIn && <Badge color={brand.purple}>🍽 Dine-in</Badge>}
              </div>
              <div style={{ display:'flex', gap:6, marginTop:8 }}>
                <button onClick={() => startEdit(s)} style={{ fontSize:10, padding:'4px 10px', borderRadius:6, background:brand.gold+'15', color:brand.gold, border:'none' }}>✏️ Edit</button>
                <button onClick={() => { if(confirm('Delete '+s.name+'?')) deleteStore(s.id); }} style={{ fontSize:10, padding:'4px 10px', borderRadius:6, background:brand.red+'15', color:brand.red, border:'none' }}>🗑 Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default memo(StoreLocator);
