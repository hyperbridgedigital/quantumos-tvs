'use client';
import { useState, memo, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

const EMPTY = { name:'', code:'', discount:10, discountType:'percent', maxDiscount:150, minOrder:199, maxUses:999, freebieItem:'', type:'coupon', icon:'🎁', color:'#22C55E', channel:'all', desc:'' };

function PromoEngine() {
  const { offers, addOffer, updateOffer, deleteOffer, orders, show } = useApp();
  const [tab, setTab] = useState('promos');
  const [editing, setEditing] = useState(null); // null = list, 'new' = create, or offer id
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState('');

  const activeOffers = offers.filter(o => o.active);
  const totalRedemptions = offers.reduce((a, o) => a + (o.used || 0), 0);
  const revenue = useMemo(() => orders.reduce((a, o) => a + o.total, 0), [orders]);

  const filtered = offers.filter(o => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.code?.toLowerCase().includes(search.toLowerCase()));

  const startEdit = (o) => { setForm({ ...o }); setEditing(o.id); };
  const startNew = () => { setForm({ ...EMPTY, code: 'PROMO' + Math.random().toString(36).slice(2,5).toUpperCase() }); setEditing('new'); };
  const save = () => {
    if (!form.name || !form.code) return show('Name and code required', 'error');
    if (editing === 'new') { addOffer(form); } else { updateOffer(editing, form); }
    setEditing(null); setForm(EMPTY);
  };

  const inp = { width:'100%', padding:'10px 12px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:13, outline:'none' };
  const tabs = [{ k:'promos', l:'🎯 Promos', c:offers.length }, { k:'campaigns', l:'📣 Campaigns', c:5 }, { k:'templates', l:'📋 WA Templates', c:20 }];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>🎯 Promo Engine</h2>
          <div style={{ fontSize:12, color:brand.dim }}>{offers.length} promos · {activeOffers.length} active · ₹{Math.round(revenue*.08).toLocaleString()} promo-driven revenue</div>
        </div>
        <button onClick={startNew} style={{ padding:'10px 20px', borderRadius:10, background:brand.emerald, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>+ New Promo</button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:10, marginBottom:20 }}>
        <StatCard label="Active Promos" value={activeOffers.length} color={brand.emerald} icon="🎯" />
        <StatCard label="Total Redemptions" value={totalRedemptions.toLocaleString()} color={brand.blue} icon="🎫" />
        <StatCard label="Promo Revenue" value={'₹'+Math.round(revenue*.08).toLocaleString()} color={brand.gold} icon="💰" />
        <StatCard label="Avg Discount" value={Math.round(offers.reduce((a,o)=>a+(o.discount||0),0)/Math.max(1,offers.length))+'%'} color={brand.purple} icon="📊" />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {tabs.map(t => <button key={t.k} onClick={() => setTab(t.k)} style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, border:'none', background:tab===t.k?brand.gold+'18':'transparent', color:tab===t.k?brand.gold:brand.dim, cursor:'pointer' }}>{t.l} ({t.c})</button>)}
      </div>

      {/* EDIT/CREATE FORM */}
      {editing !== null && (
        <div style={{ background:brand.card, border:'1px solid '+brand.emerald+'30', borderRadius:14, padding:20, marginBottom:16, animation:'fadeIn .2s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ color:brand.heading, fontSize:16 }}>{editing==='new' ? '✨ Create Promo' : '✏️ Edit: '+form.name}</h3>
            <button onClick={() => { setEditing(null); setForm(EMPTY); }} style={{ color:brand.dim, background:'none', border:'none', fontSize:16, cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            <div><label style={{ fontSize:10, color:brand.dim }}>NAME *</label><input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} style={inp} placeholder="Welcome 20% OFF" /></div>
            <div><label style={{ fontSize:10, color:brand.dim }}>CODE *</label><input value={form.code} onChange={e => setForm(p=>({...p,code:e.target.value.toUpperCase()}))} style={{...inp,textTransform:'uppercase',letterSpacing:'.1em'}} /></div>
            <div><label style={{ fontSize:10, color:brand.dim }}>TYPE</label>
              <select value={form.discountType} onChange={e => setForm(p=>({...p,discountType:e.target.value}))} style={{...inp,appearance:'auto'}}>
                <option value="percent">Percent Off</option><option value="flat">Flat ₹ Off</option><option value="freebie">Freebie</option>
              </select>
            </div>
            <div><label style={{ fontSize:10, color:brand.dim }}>DISCOUNT {form.discountType==='percent'?'%':'₹'}</label><input type="number" value={form.discount} onChange={e => setForm(p=>({...p,discount:Number(e.target.value)}))} style={inp} /></div>
            <div><label style={{ fontSize:10, color:brand.dim }}>MAX DISCOUNT ₹</label><input type="number" value={form.maxDiscount||''} onChange={e => setForm(p=>({...p,maxDiscount:Number(e.target.value)}))} style={inp} /></div>
            <div><label style={{ fontSize:10, color:brand.dim }}>MIN ORDER ₹</label><input type="number" value={form.minOrder} onChange={e => setForm(p=>({...p,minOrder:Number(e.target.value)}))} style={inp} /></div>
            <div><label style={{ fontSize:10, color:brand.dim }}>MAX USES</label><input type="number" value={form.maxUses} onChange={e => setForm(p=>({...p,maxUses:Number(e.target.value)}))} style={inp} /></div>
            <div><label style={{ fontSize:10, color:brand.dim }}>FREEBIE ITEM</label><input value={form.freebieItem||''} onChange={e => setForm(p=>({...p,freebieItem:e.target.value}))} style={inp} placeholder="Irani Chai" /></div>
            <div><label style={{ fontSize:10, color:brand.dim }}>CHANNEL</label>
              <select value={form.channel||'all'} onChange={e => setForm(p=>({...p,channel:e.target.value}))} style={{...inp,appearance:'auto'}}>
                <option value="all">All</option><option value="whatsapp">WhatsApp</option><option value="website">Website</option><option value="pos">POS</option>
              </select>
            </div>
          </div>
          <div style={{ marginTop:10 }}><label style={{ fontSize:10, color:brand.dim }}>DESCRIPTION</label><input value={form.desc||''} onChange={e => setForm(p=>({...p,desc:e.target.value}))} style={inp} placeholder="Short description" /></div>
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            <button onClick={save} style={{ padding:'10px 24px', borderRadius:8, background:brand.emerald, color:'#fff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>💾 {editing==='new'?'Create':'Save Changes'}</button>
            <button onClick={() => { setEditing(null); setForm(EMPTY); }} style={{ padding:'10px 18px', borderRadius:8, background:'transparent', color:brand.dim, border:'1px solid '+brand.border, fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search promos..." style={{ ...inp, marginBottom:14, maxWidth:300 }} />

      {/* Promo list */}
      {tab==='promos' && filtered.map(o => (
        <div key={o.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderLeft:'4px solid '+(o.active?brand.emerald:brand.dim), borderRadius:12, padding:16, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          <div style={{ flex:1, minWidth:220 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
              <span style={{ fontSize:18 }}>{o.icon}</span>
              <span style={{ fontWeight:700, color:brand.heading, fontSize:15 }}>{o.name}</span>
              <Badge color={o.active?brand.emerald:brand.dim}>{o.active?'active':'paused'}</Badge>
            </div>
            <div style={{ fontSize:12, color:brand.dim }}>
              Code: <span style={{ color:brand.gold, fontFamily:'monospace', fontWeight:700 }}>{o.code}</span>
              {' · '}{o.discountType==='percent' ? o.discount+'% off' : o.discountType==='flat' ? '₹'+o.discount+' off' : 'Freebie: '+o.freebieItem}
              {o.minOrder > 0 && ' · Min ₹'+o.minOrder}
              {' · Used: '+(o.used||0)+'/'+(o.maxUses||'∞')}
              {o.channel && o.channel !== 'all' && ' · '+o.channel}
            </div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={() => startEdit(o)} style={{ padding:'6px 14px', borderRadius:8, background:brand.blue+'15', color:brand.blue, fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>✏️ Edit</button>
            <button onClick={() => updateOffer(o.id, { active: !o.active })} style={{ padding:'6px 14px', borderRadius:8, background:o.active?brand.saffron+'15':brand.emerald+'15', color:o.active?brand.saffron:brand.emerald, fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>{o.active?'⏸ Pause':'▶ Resume'}</button>
            <button onClick={() => { if(confirm('Delete '+o.name+'?')) deleteOffer(o.id); }} style={{ padding:'6px 14px', borderRadius:8, background:brand.red+'15', color:brand.red, fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}
export default memo(PromoEngine);
