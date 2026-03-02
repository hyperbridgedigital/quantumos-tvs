'use client';
import { useState, useMemo, useEffect } from 'react';
import { brand } from '@/lib/brand';
import { eventLog as initialEvents } from '@/data/eventLog';

const EVENT_TYPES = ['order_placed','order_status_changed','customer_created','customer_updated','stock_updated','promo_redeemed','campaign_sent','admin_login','setting_changed'];
const s = { card: { background: brand.bg2, border: '1px solid '+brand.border, borderRadius: 12, padding: 16 }, label: { fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: brand.dim, textTransform: 'uppercase', marginBottom: 6 }, val: { fontSize: 20, fontWeight: 800, color: brand.heading, fontFamily: brand.fontDisplay } };

export default function EventLog() {
  const [events, setEvents] = useState(initialEvents);
  const [filters, setFilters] = useState({ type: '', dateFrom: '', dateTo: '', actor: '', store: '', entityType: '' });
  const [retentionDays, setRetentionDays] = useState(90);
  const [page, setPage] = useState(1);
  const perPage = 25;

  // Simulate real-time polling
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev => {
        const types = EVENT_TYPES;
        const newEvent = {
          id: `EVT-LIVE-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: types[Math.floor(Math.random() * types.length)],
          actor: { type: 'system', id: 'SYS', email: 'system@mehfil.com', role: 'system' },
          entity_id: `ENT-${Math.floor(Math.random()*100)}`,
          entity_type: 'system',
          action: 'heartbeat',
          details: 'System health check',
          ip: '127.0.0.1',
          store_id: ['ST001','ST002','ST003'][Math.floor(Math.random()*3)],
        };
        return [newEvent, ...prev].slice(0, 1000);
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    let f = [...events];
    if (filters.type) f = f.filter(e => e.type === filters.type);
    if (filters.store) f = f.filter(e => e.store_id === filters.store);
    if (filters.actor) f = f.filter(e => e.actor?.email?.includes(filters.actor));
    if (filters.entityType) f = f.filter(e => e.entity_type === filters.entityType);
    if (filters.dateFrom) f = f.filter(e => e.timestamp >= filters.dateFrom);
    if (filters.dateTo) f = f.filter(e => e.timestamp <= filters.dateTo + 'T23:59:59');
    return f.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [events, filters]);

  const paged = filtered.slice((page-1)*perPage, page*perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const exportCSV = () => {
    const header = 'ID,Timestamp,Type,Actor,Entity,Store,Details\n';
    const rows = filtered.map(e => `${e.id},${e.timestamp},${e.type},${e.actor?.email||''},${e.entity_id},${e.store_id},${(e.details||'').replace(/,/g,';')}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'event_log.csv'; a.click();
  };

  const purgeOld = () => {
    const cutoff = new Date(Date.now() - retentionDays * 86400000).toISOString();
    setEvents(prev => prev.filter(e => e.timestamp >= cutoff));
  };

  const typeColor = (t) => {
    if (t.includes('order')) return brand.blue;
    if (t.includes('customer')) return brand.emerald;
    if (t.includes('stock')) return brand.saffron;
    if (t.includes('admin')) return brand.purple;
    if (t.includes('promo') || t.includes('campaign')) return brand.pink;
    return brand.dim;
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, margin:0 }}>📋 Event Log</h2>
          <p style={{ fontSize:12, color:brand.dim, margin:'4px 0 0' }}>{events.length} total events · Real-time feed active</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={exportCSV} style={{ padding:'8px 16px', borderRadius:8, background:brand.emerald+'22', color:brand.emerald, border:'1px solid '+brand.emerald+'44', fontSize:11, fontWeight:700, cursor:'pointer' }}>📥 Export CSV</button>
          <button onClick={purgeOld} style={{ padding:'8px 16px', borderRadius:8, background:brand.red+'22', color:brand.red, border:'1px solid '+brand.red+'44', fontSize:11, fontWeight:700, cursor:'pointer' }}>🗑 Purge &gt;{retentionDays}d</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[{ label:'Total Events', val:events.length, color:brand.blue },{ label:'Today', val:events.filter(e=>e.timestamp?.startsWith(new Date().toISOString().slice(0,10))).length, color:brand.emerald },{ label:'Order Events', val:events.filter(e=>e.type?.includes('order')).length, color:brand.saffron },{ label:'Unique Actors', val:new Set(events.map(e=>e.actor?.email)).size, color:brand.purple }].map((k,i) => (
          <div key={i} style={s.card}>
            <div style={s.label}>{k.label}</div>
            <div style={{ ...s.val, color:k.color }}>{k.val.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ ...s.card, marginBottom:16, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <select value={filters.type} onChange={e=>setFilters(p=>({...p,type:e.target.value}))} style={{ padding:'6px 10px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border, fontSize:11 }}>
          <option value="">All Types</option>
          {EVENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filters.store} onChange={e=>setFilters(p=>({...p,store:e.target.value}))} style={{ padding:'6px 10px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border, fontSize:11 }}>
          <option value="">All Stores</option>
          <option value="ST001">ST001 Mount Road Sangam</option>
          <option value="ST002">ST002 Charminar Mehfil</option><option value="ST003">ST003 Jamal Sangam</option>
        </select>
        <input type="date" value={filters.dateFrom} onChange={e=>setFilters(p=>({...p,dateFrom:e.target.value}))} style={{ padding:'6px 10px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border, fontSize:11 }} />
        <input type="date" value={filters.dateTo} onChange={e=>setFilters(p=>({...p,dateTo:e.target.value}))} style={{ padding:'6px 10px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border, fontSize:11 }} />
        <input placeholder="Actor email..." value={filters.actor} onChange={e=>setFilters(p=>({...p,actor:e.target.value}))} style={{ padding:'6px 10px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border, fontSize:11, width:140 }} />
        <button onClick={()=>setFilters({type:'',dateFrom:'',dateTo:'',actor:'',store:'',entityType:''})} style={{ padding:'6px 12px', borderRadius:6, background:'rgba(255,255,255,.04)', color:brand.dim, border:'1px solid '+brand.border, fontSize:11, cursor:'pointer' }}>Clear</button>
        <div style={{ marginLeft:'auto', display:'flex', gap:6, alignItems:'center' }}>
          <span style={{ fontSize:10, color:brand.dim }}>Retention:</span>
          <select value={retentionDays} onChange={e=>setRetentionDays(Number(e.target.value))} style={{ padding:'4px 8px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border, fontSize:11 }}>
            <option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option><option value={180}>180 days</option><option value={365}>1 year</option>
          </select>
        </div>
      </div>

      {/* Event Table */}
      <div style={{ ...s.card, padding:0, overflow:'hidden' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
          <thead><tr style={{ background:brand.bg3 }}>
            {['Time','Type','Actor','Entity','Store','Details'].map(h=><th key={h} style={{ padding:'10px 12px', textAlign:'left', color:brand.dim, fontWeight:700, fontSize:10, letterSpacing:'.06em', textTransform:'uppercase', borderBottom:'1px solid '+brand.border }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {paged.map(e => (
              <tr key={e.id} style={{ borderBottom:'1px solid '+brand.border+'44' }}>
                <td style={{ padding:'8px 12px', color:brand.text, whiteSpace:'nowrap' }}>{e.timestamp ? new Date(e.timestamp).toLocaleString('en-IN',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '-'}</td>
                <td style={{ padding:'8px 12px' }}><span style={{ padding:'2px 8px', borderRadius:4, fontSize:10, fontWeight:600, background:typeColor(e.type)+'22', color:typeColor(e.type) }}>{e.type}</span></td>
                <td style={{ padding:'8px 12px', color:brand.text }}>{e.actor?.email || '-'}</td>
                <td style={{ padding:'8px 12px', color:brand.dim, fontFamily:'monospace', fontSize:10 }}>{e.entity_id}</td>
                <td style={{ padding:'8px 12px', color:brand.text }}>{e.store_id}</td>
                <td style={{ padding:'8px 12px', color:brand.dim, maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
        <span style={{ fontSize:11, color:brand.dim }}>Showing {(page-1)*perPage+1}-{Math.min(page*perPage,filtered.length)} of {filtered.length}</span>
        <div style={{ display:'flex', gap:4 }}>
          <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} style={{ padding:'4px 12px', borderRadius:6, background:brand.bg2, color:brand.text, border:'1px solid '+brand.border, fontSize:11, cursor:page>1?'pointer':'default', opacity:page>1?1:.5 }}>← Prev</button>
          <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} style={{ padding:'4px 12px', borderRadius:6, background:brand.bg2, color:brand.text, border:'1px solid '+brand.border, fontSize:11, cursor:page<totalPages?'pointer':'default', opacity:page<totalPages?1:.5 }}>Next →</button>
        </div>
      </div>

      {/* Live Indicator */}
      <div style={{ position:'fixed', bottom:20, left:220, display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:20, background:brand.bg2, border:'1px solid '+brand.emerald+'44' }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:brand.emerald, animation:'pulse 2s infinite' }} />
        <span style={{ fontSize:10, color:brand.emerald, fontWeight:600 }}>Live Feed Active</span>
      </div>
    </div>
  );
}
