'use client';
import { useState, memo, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt, statusColor } from '@/lib/utils';
import { STATUS_FLOW } from '@/lib/constants';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

function OMS() {
  const { orders, updateOrderStatus, stores, deliveryPartners, customers, stock, show, setAdminTab } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expand, setExpand] = useState(null);

  const filtered = useMemo(() => {
    let list = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    if (search) list = list.filter(o => o.id.toLowerCase().includes(search.toLowerCase()) || o.customer?.toLowerCase().includes(search.toLowerCase()) || o.phone?.includes(search));
    return list;
  }, [orders, filter, search]);

  const liveOrders = orders.filter(o => !['delivered','cancelled'].includes(o.status));
  const totalRev = orders.reduce((a,o) => a + o.total, 0);
  const avgOrder = orders.length ? Math.round(totalRev / orders.length) : 0;
  const cancelRate = orders.length ? Math.round(orders.filter(o=>o.status==='cancelled').length / orders.length * 100) : 0;

  const inp = { padding:'8px 12px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>📦 Order Management</h2>
          <div style={{ fontSize:12, color:brand.dim }}>Live · Connected to Stock, CRM, Delivery, WhatsApp</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:brand.emerald, animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:11, color:brand.emerald, fontWeight:600 }}>LIVE</span>
          <Badge color={brand.blue}>{orders.length} total · {liveOrders.length} active</Badge>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginBottom:18 }}>
        <StatCard label="Total Revenue" value={fmt(totalRev)} color={brand.emerald} icon="💰" />
        <StatCard label="Live Orders" value={liveOrders.length} color={brand.blue} icon="🔴" />
        <StatCard label="Avg Order" value={fmt(avgOrder)} color={brand.gold} icon="📊" />
        <StatCard label="Cancel Rate" value={cancelRate+'%'} color={cancelRate>10?brand.red:brand.emerald} icon="❌" />
        <StatCard label="Delivery" value={deliveryPartners.filter(d=>d.status!=='offline').length+' online'} color={brand.cyan} icon="🚀" />
      </div>

      {/* Connected module links */}
      <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
        {[{l:'Stock',t:'stock',c:brand.emerald},{l:'CRM',t:'crm',c:brand.purple},{l:'Delivery',t:'delivery',c:brand.cyan},{l:'WhatsApp',t:'whatsapp',c:'#25D366'}].map(m => (
          <button key={m.t} onClick={() => setAdminTab(m.t)} style={{ padding:'5px 12px', borderRadius:6, background:m.c+'12', border:'1px solid '+m.c+'25', color:m.c, fontSize:10, fontWeight:700, cursor:'pointer' }}>↗ {m.l}</button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:4, marginBottom:14, flexWrap:'wrap' }}>
        {['all', ...STATUS_FLOW, 'cancelled'].map(s => {
          const c = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
          return <button key={s} onClick={() => setFilter(s)} style={{ padding:'6px 12px', borderRadius:8, fontSize:11, fontWeight:600, border:'none', background:filter===s?(statusColor(s)||brand.gold)+'18':'transparent', color:filter===s?(statusColor(s)||brand.gold):brand.dim, cursor:'pointer' }}>{s==='all'?'All':s.replace(/_/g,' ')} ({c})</button>;
        })}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search order ID, customer, phone..." style={{ ...inp, width:'100%', maxWidth:300, marginBottom:14 }} />

      {filtered.length === 0 && <div style={{ padding:40, textAlign:'center', color:brand.dim }}>No orders match</div>}
      {filtered.map(o => {
        const store = stores.find(s => s.id === o.store);
        const dp = deliveryPartners.find(d => d.id === o.partner);
        const cust = customers.find(c => c.phone === o.phone);
        const isExpanded = expand === o.id;
        return (
          <div key={o.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderLeft:'4px solid '+statusColor(o.status), borderRadius:12, padding:14, marginBottom:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', flexWrap:'wrap', gap:8 }}>
              <div style={{ flex:1, minWidth:220, cursor:'pointer' }} onClick={() => setExpand(isExpanded?null:o.id)}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontFamily:'monospace', fontWeight:700, color:brand.heading, fontSize:13 }}>{o.id}</span>
                  <Badge color={o.type==='delivery'?brand.emerald:brand.blue}>{o.type==='delivery'?'🛵 Delivery':'🏃 Pickup'}</Badge>
                  {store && <Badge color={brand.dim}>🏪 {store.name.split(' ')[0]}</Badge>}
                  {cust && <Badge color={brand.purple}>👥 {cust.tier}</Badge>}
                </div>
                <div style={{ fontSize:12, color:brand.dim }}>👤 {o.customer} · 📞 {o.phone} · 🕐 {o.placed}</div>
                <div style={{ fontSize:11, color:brand.text, marginTop:2 }}>{o.items.map(i => i.name+' ×'+i.qty).join(', ')}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontFamily:brand.fontDisplay, fontWeight:700, color:brand.heading, fontSize:16 }}>{fmt(o.total)}</span>
                {o.status !== 'delivered' && o.status !== 'cancelled' && (
                  <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)} style={{ fontSize:11, padding:'6px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, outline:'none' }}>
                    {STATUS_FLOW.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                    <option value="cancelled">Cancel</option>
                  </select>
                )}
                {o.status === 'delivered' && <Badge color={brand.emerald}>✅ Done</Badge>}
              </div>
            </div>
            {/* Expanded: stock impact, CRM link, delivery */}
            {isExpanded && (
              <div style={{ marginTop:10, padding:12, background:'rgba(255,255,255,.02)', borderRadius:8, border:'1px solid '+brand.border }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, fontSize:11 }}>
                  <div>
                    <div style={{ fontWeight:700, color:brand.gold, marginBottom:4 }}>📦 Stock Impact</div>
                    {o.items.map(i => {
                      const sk = stock.find(s => s.name?.toLowerCase().includes(i.name?.toLowerCase().split(' ')[0]));
                      return <div key={i.id||i.name} style={{ color:brand.dim }}>• {i.name} ×{i.qty} {sk ? '('+sk.qty+' in stock)' : ''}</div>;
                    })}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:brand.purple, marginBottom:4 }}>👥 Customer</div>
                    {cust ? <>
                      <div style={{ color:brand.dim }}>Tier: {cust.tier} · Orders: {cust.orders}</div>
                      <div style={{ color:brand.dim }}>LTV: {fmt(cust.ltv)}</div>
                      {cust.tags?.map(t => <Badge key={t} color={brand.dim}>{t}</Badge>)}
                    </> : <div style={{ color:brand.dim }}>New customer</div>}
                  </div>
                  <div>
                    <div style={{ fontWeight:700, color:brand.cyan, marginBottom:4 }}>🚀 Delivery</div>
                    {dp ? <><div style={{ color:brand.dim }}>{dp.name} · ⭐ {dp.rating}</div><div style={{ color:brand.dim }}>ETA: {o.eta||'—'}min</div></> : <div style={{ color:brand.dim }}>Unassigned</div>}
                    {o.address && <div style={{ color:brand.dim, marginTop:4 }}>📍 {o.address}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default memo(OMS);
