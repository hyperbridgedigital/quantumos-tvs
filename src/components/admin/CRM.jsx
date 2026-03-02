'use client';
import { useState, memo, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt, sumBy } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

const TC = { Platinum:brand.gold, Gold:'#F59E0B', Silver:brand.blue, Bronze:brand.dim };
const SEGMENTS = ['all','Platinum','Gold','Silver','Bronze','at-risk','vip','new','lapsed'];

function CRM() {
  const { customers, updateCustomer, addCustomerTag, removeCustomerTag, orders, show, setAdminTab } = useApp();
  const [segment, setSegment] = useState('all');
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [aiPanel, setAiPanel] = useState(false);

  const avgLTV = customers.length ? Math.round(sumBy(customers,'ltv')/customers.length) : 0;
  const atRisk = customers.filter(c => c.tags?.includes('at-risk'));
  const newCust = customers.filter(c => c.orders <= 1);

  const filtered = useMemo(() => {
    let list = customers;
    if (segment !== 'all') {
      if (['Platinum','Gold','Silver','Bronze'].includes(segment)) list = list.filter(c => c.tier === segment);
      else list = list.filter(c => c.tags?.includes(segment));
    }
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
    return list;
  }, [customers, segment, search]);

  const inp = { width:'100%', padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' };

  // AI Recommendations
  const getAIRec = (c) => {
    if (c.orders === 0) return { icon:'🎯', msg:'Send welcome offer via WhatsApp', action:'Send WELCOME20', channel:'whatsapp', auto:true };
    if (c.tags?.includes('at-risk')) return { icon:'🔥', msg:'Win-back campaign — ₹100 off next order', action:'Send COMEBACK offer', channel:'whatsapp', auto:true };
    if (c.tier === 'Platinum') return { icon:'👑', msg:'VIP exclusive: early access to new menu', action:'Send VIP template', channel:'whatsapp', auto:false };
    if (c.orders > 5 && c.ltv > 2000) return { icon:'📈', msg:'Upsell premium items, refer-a-friend', action:'Send referral code', channel:'sms', auto:true };
    if (c.orders === 1) return { icon:'🔄', msg:'Trigger repeat order — 15% off 2nd order', action:'Send REPEAT15', channel:'email', auto:true };
    return { icon:'📊', msg:'Monitor — standard engagement', action:'Add to newsletter', channel:'email', auto:false };
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>👥 CRM — Customer Intelligence</h2>
          <div style={{ fontSize:12, color:brand.dim }}>{customers.length} customers · Connected to Orders, WhatsApp, Marketing</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => setAiPanel(!aiPanel)} style={{ padding:'8px 16px', borderRadius:8, background:brand.purple+'18', border:'1px solid '+brand.purple+'30', color:brand.purple, fontSize:12, fontWeight:700, cursor:'pointer' }}>🧠 AI Insights</button>
          <button onClick={() => setAdminTab('automation')} style={{ padding:'8px 16px', borderRadius:8, background:brand.blue+'18', border:'1px solid '+brand.blue+'30', color:brand.blue, fontSize:12, fontWeight:700, cursor:'pointer' }}>🤖 Automation Rules</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))', gap:10, marginBottom:20 }}>
        <StatCard label="Total Customers" value={customers.length} color={brand.blue} icon="👥" />
        <StatCard label="Avg LTV" value={fmt(avgLTV)} color={brand.gold} icon="💰" />
        <StatCard label="Platinum VIPs" value={customers.filter(c=>c.tier==='Platinum').length} color={brand.gold} icon="👑" />
        <StatCard label="At-Risk" value={atRisk.length} color={brand.red} icon="⚠️" />
        <StatCard label="New (≤1 order)" value={newCust.length} color={brand.emerald} icon="🆕" />
        <StatCard label="Total Revenue" value={fmt(sumBy(customers,'ltv'))} color={brand.purple} icon="📊" />
      </div>

      {/* AI Panel */}
      {aiPanel && <div style={{ background:'linear-gradient(135deg, #1A1A2E, '+brand.purple+'08)', border:'1px solid '+brand.purple+'25', borderRadius:14, padding:18, marginBottom:16 }}>
        <h3 style={{ color:brand.heading, fontSize:15, marginBottom:10 }}>🧠 AI Customer Intelligence</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:10 }}>
          {[
            { title:'Win-Back Campaign', desc: atRisk.length+' at-risk customers. AI recommends WhatsApp win-back with ₹100 off.', action:'Launch campaign →', color:brand.red, target:'remarketing' },
            { title:'Upsell Opportunity', desc: customers.filter(c=>c.orders>3&&c.ltv<3000).length+' repeat customers ready for premium upsell.', action:'Create segment →', color:brand.gold, target:'remarketing' },
            { title:'Referral Push', desc: customers.filter(c=>c.tier==='Platinum'||c.tier==='Gold').length+' VIPs can drive referrals. Each referral = ₹100 new customer.', action:'Send referral codes →', color:brand.emerald, target:'promo' },
            { title:'Birthday Automation', desc: '~'+Math.round(customers.length/12)+' birthdays this month. Auto-send birthday treat offer.', action:'Setup rule →', color:brand.purple, target:'automation' },
          ].map(r => (
            <div key={r.title} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:10, padding:14 }}>
              <div style={{ fontWeight:700, color:brand.heading, fontSize:13, marginBottom:4 }}>{r.title}</div>
              <div style={{ fontSize:11, color:brand.dim, marginBottom:8 }}>{r.desc}</div>
              <button onClick={() => setAdminTab(r.target)} style={{ padding:'5px 12px', borderRadius:6, background:r.color+'15', color:r.color, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>{r.action}</button>
            </div>
          ))}
        </div>
      </div>}

      {/* Segments */}
      <div style={{ display:'flex', gap:4, marginBottom:14, flexWrap:'wrap' }}>
        {SEGMENTS.map(s => {
          const c = s === 'all' ? customers.length : s === 'at-risk' || s === 'vip' || s === 'new' || s === 'lapsed'
            ? customers.filter(cu => cu.tags?.includes(s)).length
            : customers.filter(cu => cu.tier === s).length;
          return <button key={s} onClick={() => setSegment(s)} style={{ padding:'6px 14px', borderRadius:8, fontSize:11, fontWeight:600, border:'none', background:segment===s?(TC[s]||brand.gold)+'18':'transparent', color:segment===s?(TC[s]||brand.gold):brand.dim, cursor:'pointer' }}>{s==='all'?'All':s} ({c})</button>;
        })}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search name or phone..." style={{ ...inp, marginBottom:14, maxWidth:300 }} />

      {/* Customer list */}
      {filtered.map(c => {
        const ai = getAIRec(c);
        const isEditing = editing === c.id;
        return (
          <div key={c.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:14, marginBottom:6, borderLeft:'4px solid '+(TC[c.tier]||brand.dim) }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', flexWrap:'wrap', gap:8 }}>
              <div style={{ flex:1, minWidth:220 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:20 }}>{c.mood}</span>
                  <span style={{ fontWeight:700, color:brand.heading, fontSize:14 }}>{c.name}</span>
                  <Badge color={TC[c.tier]}>{c.tier}</Badge>
                  {c.tags?.includes('at-risk') && <Badge color={brand.red}>⚠️ at-risk</Badge>}
                </div>
                <div style={{ fontSize:11, color:brand.dim }}>📞 {c.phone} · 📧 {c.email||'—'} · Last: {c.lastOrder} · 📦 {c.orders} orders</div>
                <div style={{ display:'flex', gap:4, marginTop:4, flexWrap:'wrap' }}>
                  {c.tags?.map(t => <span key={t} style={{ fontSize:9, padding:'2px 6px', borderRadius:4, background:brand.border, color:brand.dim, cursor:'pointer' }} onClick={() => removeCustomerTag(c.id, t)}>✕ {t}</span>)}
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:10, fontSize:12 }}>
                <span style={{ color:brand.gold, fontWeight:700, fontSize:14 }}>{fmt(c.ltv)} LTV</span>
                <button onClick={() => setEditing(isEditing ? null : c.id)} style={{ padding:'5px 12px', borderRadius:6, background:brand.blue+'15', color:brand.blue, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>{isEditing?'Close':'✏️ Edit'}</button>
              </div>
            </div>

            {/* AI Recommendation */}
            <div style={{ marginTop:8, padding:'8px 12px', borderRadius:8, background:brand.purple+'08', border:'1px solid '+brand.purple+'15', display:'flex', alignItems:'center', gap:10, fontSize:11 }}>
              <span style={{ fontSize:16 }}>{ai.icon}</span>
              <span style={{ flex:1, color:brand.dim }}>🧠 <strong style={{ color:brand.heading }}>{ai.msg}</strong></span>
              <Badge color={ai.channel==='whatsapp'?'#25D366':brand.blue}>{ai.channel}</Badge>
              {ai.auto && <Badge color={brand.emerald}>auto ✓</Badge>}
            </div>

            {/* Edit panel */}
            {isEditing && (
              <div style={{ marginTop:10, padding:12, background:'rgba(255,255,255,.02)', borderRadius:8, border:'1px solid '+brand.border, display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                <div><label style={{ fontSize:9, color:brand.dim }}>NAME</label><input value={c.name} onChange={e => updateCustomer(c.id, { name: e.target.value })} style={inp} /></div>
                <div><label style={{ fontSize:9, color:brand.dim }}>PHONE</label><input value={c.phone||''} onChange={e => updateCustomer(c.id, { phone: e.target.value })} style={inp} /></div>
                <div><label style={{ fontSize:9, color:brand.dim }}>TIER</label>
                  <select value={c.tier} onChange={e => updateCustomer(c.id, { tier: e.target.value })} style={{...inp,appearance:'auto'}}>
                    {['Bronze','Silver','Gold','Platinum'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize:9, color:brand.dim }}>ADD TAG</label>
                  <select onChange={e => { if(e.target.value) { addCustomerTag(c.id, e.target.value); e.target.value=''; }}} style={{...inp,appearance:'auto'}}>
                    <option value="">+ Tag</option>
                    {['vip','at-risk','new','loyal','lapsed','high-value','referrer','complainer'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={{ fontSize:9, color:brand.dim }}>NOTES</label><input value={c.notes||''} onChange={e => updateCustomer(c.id, { notes: e.target.value })} style={inp} placeholder="Internal notes" /></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default memo(CRM);
