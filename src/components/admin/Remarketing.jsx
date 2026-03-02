'use client';
import { useState, memo, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt, sumBy } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

const PLATFORMS = [
  { key:'meta', label:'Meta (FB/IG)', icon:'📘', color:'#1877F2', features:['Lookalike','Retarget','Custom'] },
  { key:'google', label:'Google Ads', icon:'🔍', color:'#34A853', features:['Search','Display','YouTube'] },
  { key:'whatsapp', label:'WhatsApp', icon:'💬', color:'#25D366', features:['Broadcast','Bot','Campaign'] },
  { key:'email', label:'Email', icon:'📧', color:'#8B5CF6', features:['Drip','Blast','Triggered'] },
  { key:'sms', label:'SMS', icon:'📱', color:'#3B82F6', features:['OTP','Promo','Transactional'] },
];

function Remarketing() {
  const { customers, orders, offers, remarketingRecords, setRemarketingRecords, automationRules, funnels, show, setAdminTab } = useApp();
  const [tab, setTab] = useState('audiences');
  const [selectedAudience, setSelectedAudience] = useState(null);

  // Auto-generated audience segments from CRM data
  const audiences = useMemo(() => [
    { id:'AUD01', name:'VIP Customers (Platinum + Gold)', filter: c => c.tier==='Platinum'||c.tier==='Gold', size: customers.filter(c=>c.tier==='Platinum'||c.tier==='Gold').length, platforms:['meta','whatsapp','email'], ltv: Math.round(sumBy(customers.filter(c=>c.tier==='Platinum'||c.tier==='Gold'),'ltv')/Math.max(1,customers.filter(c=>c.tier==='Platinum'||c.tier==='Gold').length)), color:brand.gold, ai:'Recommend: Meta Lookalike from VIP list to find similar high-value customers. Expected ROAS 4.2x.' },
    { id:'AUD02', name:'At-Risk (No order 30d)', filter: c => c.tags?.includes('at-risk'), size: customers.filter(c=>c.tags?.includes('at-risk')).length, platforms:['whatsapp','email','sms'], ltv: 0, color:brand.red, ai:'Recommend: WhatsApp win-back with ₹100 off coupon. Auto-rule available. Expected reactivation 17%.' },
    { id:'AUD03', name:'New Customers (≤1 order)', filter: c => c.orders<=1, size: customers.filter(c=>c.orders<=1).length, platforms:['whatsapp','meta','email'], ltv: 0, color:brand.emerald, ai:'Recommend: WhatsApp drip sequence + Meta retarget to convert to 2nd order. Conversion rate ~28%.' },
    { id:'AUD04', name:'High-Value Repeat (5+ orders)', filter: c => c.orders>=5, size: customers.filter(c=>c.orders>=5).length, platforms:['meta','whatsapp'], ltv: Math.round(sumBy(customers.filter(c=>c.orders>=5),'ltv')/Math.max(1,customers.filter(c=>c.orders>=5).length)), color:brand.purple, ai:'Recommend: Referral program push. Each referral generates avg ₹820 LTV. Push via WhatsApp.' },
    { id:'AUD05', name:'Cart Abandoners', filter: c => c.tags?.includes('cart-abandoner'), size: Math.round(customers.length * .12), platforms:['whatsapp','email','meta'], ltv: 0, color:brand.saffron, ai:'Recommend: Automated WhatsApp reminder within 1hr. Add Meta pixel retarget. Recovery rate ~22%.' },
    { id:'AUD06', name:'Birthday This Month', filter: c => c.tags?.includes('birthday-month'), size: Math.round(customers.length/12), platforms:['whatsapp','sms'], ltv: 0, color:brand.pink, ai:'Recommend: Auto-send birthday treat offer. WhatsApp template "birthday_treat". Automation rule exists.' },
    { id:'AUD07', name:'Locality: T.Nagar Area', filter: c => c.locality==='T.Nagar', size: Math.round(customers.length * .25), platforms:['meta','google'], ltv: 0, color:brand.cyan, ai:'Recommend: Google Ads geo-targeted within 3km of T.Nagar store. Add Meta location targeting.' },
    { id:'AUD08', name:'Weekend Warriors (Fri-Sun)', filter: c => c.tags?.includes('weekend'), size: Math.round(customers.length * .35), platforms:['whatsapp','sms','meta'], ltv: 0, color:brand.blue, ai:'Recommend: Schedule WhatsApp broadcast Thu evening with weekend specials. SMS Friday noon reminder.' },
  ], [customers]);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>🎯 Remarketing Audiences</h2>
          <div style={{ fontSize:12, color:brand.dim }}>Auto-segmented from CRM · Mapped to platforms · AI recommendations</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => setAdminTab('crm')} style={{ padding:'6px 14px', borderRadius:8, background:brand.purple+'12', color:brand.purple, fontSize:11, fontWeight:700, border:'none', cursor:'pointer' }}>↗ CRM</button>
          <button onClick={() => setAdminTab('funnels')} style={{ padding:'6px 14px', borderRadius:8, background:brand.gold+'12', color:brand.gold, fontSize:11, fontWeight:700, border:'none', cursor:'pointer' }}>↗ Funnels</button>
          <button onClick={() => setAdminTab('automation')} style={{ padding:'6px 14px', borderRadius:8, background:brand.blue+'12', color:brand.blue, fontSize:11, fontWeight:700, border:'none', cursor:'pointer' }}>🤖 Rules</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))', gap:10, marginBottom:18 }}>
        <StatCard label="Audiences" value={audiences.length} color={brand.blue} icon="🎯" />
        <StatCard label="Total Reach" value={customers.length} color={brand.emerald} icon="👥" />
        <StatCard label="Platforms" value={PLATFORMS.length} color={brand.purple} icon="📡" />
        <StatCard label="Active Rules" value={automationRules.filter(r=>r.active).length} color={brand.gold} icon="🤖" />
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {[{k:'audiences',l:'🎯 Audiences'},{k:'platforms',l:'📡 Platform Map'},{k:'ai',l:'🧠 AI Strategy'}].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, border:'none', background:tab===t.k?brand.gold+'18':'transparent', color:tab===t.k?brand.gold:brand.dim, cursor:'pointer' }}>{t.l}</button>
        ))}
      </div>

      {/* ═══ AUDIENCES ═══ */}
      {tab==='audiences' && <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:10 }}>
        {audiences.map(a => (
          <div key={a.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderLeft:'4px solid '+a.color, borderRadius:12, padding:16, cursor:'pointer' }} onClick={() => setSelectedAudience(selectedAudience===a.id?null:a.id)}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontWeight:700, color:brand.heading, fontSize:14 }}>{a.name}</span>
              <Badge color={a.color}>{a.size} people</Badge>
            </div>
            {a.ltv > 0 && <div style={{ fontSize:11, color:brand.gold, marginBottom:6 }}>Avg LTV: {fmt(a.ltv)}</div>}
            <div style={{ display:'flex', gap:4, marginBottom:8 }}>
              {a.platforms.map(p => { const pl = PLATFORMS.find(x=>x.key===p); return pl ? <span key={p} style={{ fontSize:9, padding:'3px 8px', borderRadius:4, background:pl.color+'15', color:pl.color, fontWeight:700 }}>{pl.icon} {pl.label}</span> : null; })}
            </div>
            {/* AI recommendation */}
            <div style={{ padding:'8px 10px', borderRadius:8, background:brand.purple+'08', border:'1px solid '+brand.purple+'15', fontSize:11 }}>
              <span style={{ color:brand.purple, fontWeight:700 }}>🧠 AI: </span>
              <span style={{ color:brand.dim }}>{a.ai}</span>
            </div>
            {/* Expanded: action buttons */}
            {selectedAudience === a.id && (
              <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
                {a.platforms.map(p => { const pl = PLATFORMS.find(x=>x.key===p); return pl ? <button key={p} onClick={e => { e.stopPropagation(); show('Campaign created for '+a.name+' on '+pl.label); }} style={{ padding:'6px 14px', borderRadius:8, background:pl.color, color:'#fff', fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>{pl.icon} Launch on {pl.label}</button> : null; })}
                <button onClick={e => { e.stopPropagation(); setAdminTab('automation'); }} style={{ padding:'6px 14px', borderRadius:8, background:brand.blue+'15', color:brand.blue, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>🤖 Auto-rule</button>
                <button onClick={e => { e.stopPropagation(); setAdminTab('funnels'); }} style={{ padding:'6px 14px', borderRadius:8, background:brand.gold+'15', color:brand.gold, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>🔄 Add to Funnel</button>
              </div>
            )}
          </div>
        ))}
      </div>}

      {/* ═══ PLATFORM MAP ═══ */}
      {tab==='platforms' && <div>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', color:brand.gold, marginBottom:10 }}>SOCIAL MEDIA & CHANNEL MAPPING</div>
        {PLATFORMS.map(p => {
          const mappedAudiences = audiences.filter(a => a.platforms.includes(p.key));
          const totalReach = mappedAudiences.reduce((a,au) => a + au.size, 0);
          return (
            <div key={p.key} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:16, marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:24 }}>{p.icon}</span>
                  <div>
                    <span style={{ fontWeight:700, color:brand.heading, fontSize:15 }}>{p.label}</span>
                    <div style={{ display:'flex', gap:4, marginTop:4 }}>{p.features.map(f => <Badge key={f} color={p.color}>{f}</Badge>)}</div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:18, fontWeight:700, color:p.color }}>{totalReach}</div>
                  <div style={{ fontSize:9, color:brand.dim }}>Total Reach</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {mappedAudiences.map(a => <span key={a.id} style={{ fontSize:10, padding:'4px 10px', borderRadius:6, background:a.color+'12', color:a.color, fontWeight:600 }}>{a.name} ({a.size})</span>)}
              </div>
            </div>
          );
        })}
      </div>}

      {/* ═══ AI STRATEGY ═══ */}
      {tab==='ai' && <div>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', color:brand.gold, marginBottom:10 }}>🧠 AI-RECOMMENDED REACH STRATEGY</div>
        <div style={{ background:'linear-gradient(135deg,#1A1A2E,'+brand.purple+'06)', border:'1px solid '+brand.purple+'25', borderRadius:14, padding:20, marginBottom:16 }}>
          <h3 style={{ color:brand.heading, fontSize:16, marginBottom:14 }}>How to Reach Every Customer Segment</h3>
          {audiences.map(a => (
            <div key={a.id} style={{ padding:'12px 0', borderBottom:'1px solid '+brand.border+'30' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span style={{ fontWeight:700, color:brand.heading, fontSize:13 }}>{a.name}</span>
                <Badge color={a.color}>{a.size} people</Badge>
              </div>
              <div style={{ fontSize:12, color:brand.dim, marginBottom:6 }}>{a.ai}</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {a.platforms.map(p => { const pl = PLATFORMS.find(x=>x.key===p); return pl ? <span key={p} style={{ fontSize:9, padding:'3px 8px', borderRadius:4, background:pl.color+'15', color:pl.color, fontWeight:700 }}>{pl.icon} {pl.label}</span> : null; })}
                {automationRules.some(r => r.active) && <Badge color={brand.emerald}>🤖 Auto-rule available</Badge>}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <button onClick={() => setAdminTab('automation')} style={{ padding:16, borderRadius:12, background:brand.card, border:'1px solid '+brand.border, textAlign:'left', cursor:'pointer' }}>
            <div style={{ fontSize:14, fontWeight:700, color:brand.heading, marginBottom:4 }}>🤖 Setup Automation Rules</div>
            <div style={{ fontSize:11, color:brand.dim }}>{automationRules.filter(r=>r.active).length} active rules · Triggered on customer events</div>
          </button>
          <button onClick={() => setAdminTab('funnels')} style={{ padding:16, borderRadius:12, background:brand.card, border:'1px solid '+brand.border, textAlign:'left', cursor:'pointer' }}>
            <div style={{ fontSize:14, fontWeight:700, color:brand.heading, marginBottom:4 }}>🔄 Build Conversion Funnels</div>
            <div style={{ fontSize:11, color:brand.dim }}>{funnels.filter(f=>f.active).length} active funnels · Track customer journey</div>
          </button>
        </div>
      </div>}
    </div>
  );
}
export default memo(Remarketing);
