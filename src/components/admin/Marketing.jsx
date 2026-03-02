'use client';
import { memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt, sumBy } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

function Marketing() {
  const { orders, customers, viralCampaigns } = useApp();
  const totalRevenue = sumBy(orders, 'total');
  const avgLTV = customers.length ? Math.round(sumBy(customers, 'ltv') / customers.length) : 0;
  const activeCampaigns = viralCampaigns.filter(c => c.active);
  const totalShares = sumBy(viralCampaigns, 'shares');
  const viralRevenue = sumBy(viralCampaigns, 'revenue');

  return (
    <div>
      <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, marginBottom:16 }}>📣 Marketing & Viral Engine</h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:10, marginBottom:20 }}>
        <StatCard label="Total Customers" value={customers.length} color={brand.blue} icon="👥" />
        <StatCard label="Total Orders" value={orders.length} color={brand.emerald} icon="📦" />
        <StatCard label="Revenue" value={fmt(totalRevenue)} color={brand.gold} icon="💰" />
        <StatCard label="Avg LTV" value={fmt(avgLTV)} color={brand.saffron} icon="📊" />
        <StatCard label="Active Campaigns" value={activeCampaigns.length} color={brand.pink} icon="🚀" />
        <StatCard label="Total Shares" value={totalShares.toLocaleString()} color={brand.purple} icon="🔗" />
      </div>
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:brand.pink, marginBottom:12 }}>🚀 Viral Campaigns — Revenue from Shares</div>
      {viralCampaigns.map(c => (
        <div key={c.name} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:16, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
          <div>
            <div style={{ fontWeight:700, color:brand.heading, fontSize:13 }}>{c.name}</div>
            <div style={{ fontSize:11, color:brand.dim }}>{c.desc}</div>
          </div>
          <div style={{ display:'flex', gap:16, alignItems:'center', fontSize:12 }}>
            <span>🔗 {c.shares.toLocaleString()}</span>
            <span style={{ fontWeight:700, color:brand.gold }}>{fmt(c.revenue)}</span>
            <Badge color={c.active?brand.emerald:brand.dim}>{c.active?'Active':'Off'}</Badge>
          </div>
        </div>
      ))}
      <div style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:20, marginTop:16 }}>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', color:brand.gold, marginBottom:12 }}>📊 KEY METRICS</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16 }}>
          {[{ l:'Viral Revenue', v:fmt(viralRevenue), c:brand.emerald }, { l:'Conv Rate', v:orders.length?Math.round(orders.length/customers.length*100)/10+'%':'--', c:brand.blue }, { l:'Repeat Rate', v:customers.filter(c=>c.orders>1).length?Math.round(customers.filter(c=>c.orders>1).length/customers.length*100)+'%':'0%', c:brand.gold }].map(m => (
            <div key={m.l}><div style={{ fontSize:10, color:brand.dim }}>{m.l}</div><div style={{ fontSize:20, fontWeight:700, color:m.c }}>{m.v}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default memo(Marketing);
