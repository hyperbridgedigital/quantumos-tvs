'use client';
import { memo, useMemo, useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt, sumBy } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

function Dashboard() {
  const { orders, stores, stock, franchises, liveOrders, lowStock, customers, activeStores, deliveryPartners, settings, offers, automationRules, chatbotFlows, funnels, setAdminTab } = useApp();
  const [pulse, setPulse] = useState(0);
  useEffect(() => { const t = setInterval(() => setPulse(p => p + 1), 5000); return () => clearInterval(t); }, []);

  const totalRevenue = orders.reduce((a, o) => a + o.total, 0);
  const todayOrders = orders.filter(o => o.status !== 'cancelled');
  const avgOrder = todayOrders.length ? Math.round(totalRevenue / todayOrders.length) : 0;
  const onlineDrivers = deliveryPartners.filter(d => d.status !== 'offline');
  const avgDelivery = onlineDrivers.reduce((a, d) => a + d.avgTime, 0) / Math.max(1, onlineDrivers.length);
  const activePromos = offers.filter(o => o.active).length;
  const activeRules = automationRules.filter(r => r.active).length;
  const totalBotConvos = chatbotFlows.reduce((a,f)=>a+f.conversations,0);
  const atRisk = customers.filter(c => c.tags?.includes('at-risk')).length;
  const customerLTV = customers.length ? Math.round(sumBy(customers,'ltv')/customers.length) : 0;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:24, color:brand.heading }}>⚡ Command Center</h2>
          <div style={{ fontSize:12, color:brand.dim }}>Real-time · All modules connected · {settings.STORE_NAME || 'Charminar Mehfil'}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:brand.emerald, animation:'pulse 2s infinite' }} />
          <span style={{ fontSize:11, color:brand.emerald, fontWeight:600 }}>LIVE</span>
        </div>
      </div>

      {/* Primary KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))', gap:10, marginBottom:20 }}>
        <StatCard label="Today Revenue" value={fmt(totalRevenue)} color={brand.emerald} icon="💰" />
        <StatCard label="Live Orders" value={liveOrders.length} color={brand.blue} icon="📦" />
        <StatCard label="Avg Order" value={fmt(avgOrder)} color={brand.gold} icon="📊" />
        <StatCard label="Online Drivers" value={onlineDrivers.length+'/'+deliveryPartners.length} color={brand.cyan} icon="🚀" />
        <StatCard label="Active Stores" value={activeStores.length} color={brand.gold} icon="🏪" />
        <StatCard label="Low Stock" value={lowStock.length} color={lowStock.length>0?brand.red:brand.emerald} icon="⚠️" />
        <StatCard label="Customers" value={customers.length} color={brand.pink} icon="👥" />
        <StatCard label="At-Risk" value={atRisk} color={atRisk>0?brand.red:brand.emerald} icon="🔥" />
      </div>

      {/* Connected systems */}
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.18em', color:brand.gold, marginBottom:10 }}>⚡ CONNECTED SYSTEMS — LIVE STATUS</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginBottom:20 }}>
        {[
          { title:'Orders (OMS)', value:orders.length+' total · '+liveOrders.length+' active', color:brand.blue, status:'live', tab:'orders' },
          { title:'Stock/WMS', value:stock.length+' SKUs · '+lowStock.length+' low', color:lowStock.length>0?brand.red:brand.emerald, status:lowStock.length>0?'alert':'live', tab:'stock' },
          { title:'CRM', value:customers.length+' customers · ₹'+customerLTV+' avg LTV', color:brand.purple, status:'live', tab:'crm' },
          { title:'Promo Engine', value:activePromos+' promos · '+offers.reduce((a,o)=>a+(o.used||0),0)+' redeemed', color:brand.emerald, status:'live', tab:'promo' },
          { title:'WhatsApp CRM', value:totalBotConvos.toLocaleString()+' bot convos · '+chatbotFlows.length+' flows', color:'#25D366', status:'live', tab:'whatsapp' },
          { title:'Automation', value:activeRules+' rules · '+automationRules.reduce((a,r)=>a+r.fired,0).toLocaleString()+' fired', color:brand.blue, status:'live', tab:'automation' },
          { title:'Delivery', value:onlineDrivers.length+' drivers · '+Math.round(avgDelivery)+'m avg', color:brand.cyan, status:onlineDrivers.length>0?'live':'offline', tab:'delivery' },
          { title:'Funnels', value:funnels.filter(f=>f.active).length+' active funnels', color:brand.gold, status:'live', tab:'funnels' },
        ].map(s => (
          <button key={s.title} onClick={() => setAdminTab(s.tab)} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:14, textAlign:'left', cursor:'pointer' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ fontWeight:700, color:brand.heading, fontSize:13 }}>{s.title}</span>
              <span style={{ width:6, height:6, borderRadius:'50%', background:s.status==='live'?brand.emerald:s.status==='alert'?brand.red:'#555' }} />
            </div>
            <div style={{ fontSize:11, color:brand.dim }}>{s.value}</div>
            <div style={{ width:'100%', height:3, borderRadius:2, background:brand.border, marginTop:8, overflow:'hidden' }}>
              <div style={{ height:3, width: s.status==='live'?'100%':s.status==='alert'?'60%':'0%', background:s.color, borderRadius:2, transition:'width 1s' }} />
            </div>
          </button>
        ))}
      </div>

      {/* Live Store Performance */}
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.18em', color:brand.gold, marginBottom:10 }}>🏪 STORE PERFORMANCE — LIVE</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(250px,1fr))', gap:10, marginBottom:20 }}>
        {activeStores.map(s => {
          const pct = Math.round((s.load / s.maxOrders) * 100);
          const storeOrders = orders.filter(o => o.store === s.id);
          const storeRev = storeOrders.reduce((a,o) => a + o.total, 0);
          return (
            <div key={s.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <span style={{ fontWeight:700, color:brand.heading, fontSize:14 }}>{s.name}</span>
                <Badge color={pct>80?brand.red:brand.emerald}>{pct}% load</Badge>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, fontSize:11, marginBottom:8 }}>
                <div><div style={{ color:brand.dim }}>Revenue</div><div style={{ color:brand.gold, fontWeight:700 }}>{fmt(storeRev)}</div></div>
                <div><div style={{ color:brand.dim }}>Orders</div><div style={{ color:brand.heading, fontWeight:700 }}>{storeOrders.length}</div></div>
                <div><div style={{ color:brand.dim }}>Rating</div><div style={{ color:brand.gold, fontWeight:700 }}>⭐ {s.rating}</div></div>
              </div>
              <div style={{ height:4, background:brand.border, borderRadius:2, overflow:'hidden' }}>
                <div style={{ height:4, width:pct+'%', background:pct>80?brand.red:brand.emerald, borderRadius:2, transition:'width .5s' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Quick Actions */}
      <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.18em', color:brand.gold, marginBottom:10 }}>🧠 AI RECOMMENDED ACTIONS</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:10 }}>
        {[
          lowStock.length > 0 && { icon:'⚠️', msg:lowStock.length+' items below reorder. Auto-reorder?', action:'Review Stock →', tab:'stock', color:brand.red },
          atRisk > 0 && { icon:'🔥', msg:atRisk+' at-risk customers. Launch win-back campaign?', action:'Open CRM →', tab:'crm', color:brand.red },
          liveOrders.length > 5 && { icon:'🚀', msg:'High order volume. '+onlineDrivers.length+' drivers online. Need more?', action:'Delivery Ops →', tab:'delivery', color:brand.blue },
          { icon:'📈', msg:'Top promo: '+offers.sort((a,b)=>(b.used||0)-(a.used||0))[0]?.code+' ('+offers.sort((a,b)=>(b.used||0)-(a.used||0))[0]?.used+' uses)', action:'Promo Engine →', tab:'promo', color:brand.emerald },
        ].filter(Boolean).map((a,i) => (
          <button key={i} onClick={() => setAdminTab(a.tab)} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:10, padding:14, textAlign:'left', cursor:'pointer', display:'flex', gap:10, alignItems:'center' }}>
            <span style={{ fontSize:22 }}>{a.icon}</span>
            <div style={{ flex:1 }}><div style={{ fontSize:12, color:brand.heading, fontWeight:600 }}>{a.msg}</div></div>
            <span style={{ fontSize:10, color:a.color, fontWeight:700 }}>{a.action}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export default memo(Dashboard);
