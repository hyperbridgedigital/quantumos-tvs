'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

const TRIGGERS = ['customer_signup','cart_abandoned','no_order_30d','birthday_today','stock_below_reorder','order_delivered','order_placed','ltv_milestone','review_submitted','referral_used'];
const ACTIONS = ['send_whatsapp','send_email','send_sms','notify_admin','add_tag','change_tier','create_ticket','apply_promo'];
const EMPTY = { name:'', trigger:'customer_signup', condition:'', action:'send_whatsapp', template:'', delay:'0h', active:true };

function AutomationRules() {
  const { automationRules, addRule, updateRule, deleteRule, toggleRule, customers, offers, chatbotFlows, show, setAdminTab } = useApp();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const totalFired = automationRules.reduce((a,r)=>a+r.fired,0);
  const totalConverted = automationRules.reduce((a,r)=>a+r.converted,0);
  const activeRules = automationRules.filter(r=>r.active);

  const startEdit = (r) => { setForm({...r}); setEditing(r.id); };
  const startNew = () => { setForm({...EMPTY}); setEditing('new'); };
  const save = () => {
    if (!form.name || !form.trigger) return show('Name & trigger required','error');
    if (editing==='new') addRule(form); else updateRule(editing, form);
    setEditing(null);
  };

  const inp = { width:'100%', padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>🤖 Automation Rules Engine</h2>
          <div style={{ fontSize:12, color:brand.dim }}>IF trigger → THEN action · Connected to CRM, WhatsApp, Promos, Funnels</div>
        </div>
        <button onClick={startNew} style={{ padding:'10px 20px', borderRadius:10, background:brand.emerald, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>+ New Rule</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:10, marginBottom:20 }}>
        <StatCard label="Active Rules" value={activeRules.length} color={brand.emerald} icon="🤖" />
        <StatCard label="Total Fired" value={totalFired.toLocaleString()} color={brand.blue} icon="⚡" />
        <StatCard label="Converted" value={totalConverted.toLocaleString()} color={brand.gold} icon="✅" />
        <StatCard label="Conv Rate" value={totalFired?Math.round(totalConverted/totalFired*100)+'%':'0%'} color={brand.purple} icon="📊" />
      </div>

      {/* Quick links */}
      <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
        <button onClick={() => setAdminTab('crm')} style={{ padding:'6px 14px', borderRadius:8, background:brand.blue+'12', color:brand.blue, fontSize:11, fontWeight:600, border:'none', cursor:'pointer' }}>↗ CRM</button>
        <button onClick={() => setAdminTab('whatsapp')} style={{ padding:'6px 14px', borderRadius:8, background:'#25D366'+'12', color:'#25D366', fontSize:11, fontWeight:600, border:'none', cursor:'pointer' }}>↗ WhatsApp</button>
        <button onClick={() => setAdminTab('funnels')} style={{ padding:'6px 14px', borderRadius:8, background:brand.purple+'12', color:brand.purple, fontSize:11, fontWeight:600, border:'none', cursor:'pointer' }}>↗ Funnels</button>
        <button onClick={() => setAdminTab('promo')} style={{ padding:'6px 14px', borderRadius:8, background:brand.gold+'12', color:brand.gold, fontSize:11, fontWeight:600, border:'none', cursor:'pointer' }}>↗ Promos</button>
      </div>

      {/* Edit form */}
      {editing !== null && (
        <div style={{ background:brand.card, border:'1px solid '+brand.emerald+'30', borderRadius:14, padding:20, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
            <h3 style={{ color:brand.heading, fontSize:15 }}>{editing==='new'?'✨ Create Rule':'✏️ Edit: '+form.name}</h3>
            <button onClick={() => setEditing(null)} style={{ color:brand.dim, background:'none', border:'none', fontSize:16, cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
            <div><label style={{ fontSize:9, color:brand.dim }}>RULE NAME</label><input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} style={inp} /></div>
            <div><label style={{ fontSize:9, color:brand.dim }}>TRIGGER (when)</label>
              <select value={form.trigger} onChange={e => setForm(p=>({...p,trigger:e.target.value}))} style={{...inp,appearance:'auto'}}>
                {TRIGGERS.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
              </select></div>
            <div><label style={{ fontSize:9, color:brand.dim }}>CONDITION (if)</label><input value={form.condition||''} onChange={e => setForm(p=>({...p,condition:e.target.value}))} style={inp} placeholder="e.g. ltv>500, tier=Gold" /></div>
            <div><label style={{ fontSize:9, color:brand.dim }}>ACTION (then)</label>
              <select value={form.action} onChange={e => setForm(p=>({...p,action:e.target.value}))} style={{...inp,appearance:'auto'}}>
                {ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g,' ')}</option>)}
              </select></div>
            <div><label style={{ fontSize:9, color:brand.dim }}>TEMPLATE / PROMO</label><input value={form.template||''} onChange={e => setForm(p=>({...p,template:e.target.value}))} style={inp} placeholder="Template or promo code" /></div>
            <div><label style={{ fontSize:9, color:brand.dim }}>DELAY</label><input value={form.delay||'0h'} onChange={e => setForm(p=>({...p,delay:e.target.value}))} style={inp} placeholder="0h, 1h, 24h, 9am" /></div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={save} style={{ padding:'10px 24px', borderRadius:8, background:brand.emerald, color:'#fff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>💾 Save</button>
            <button onClick={() => setEditing(null)} style={{ padding:'10px 18px', borderRadius:8, color:brand.dim, border:'1px solid '+brand.border, background:'transparent', cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {automationRules.map(r => {
        const convPct = r.fired > 0 ? Math.round(r.converted/r.fired*100) : 0;
        return (
          <div key={r.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderLeft:'4px solid '+(r.active?brand.emerald:brand.dim), borderRadius:12, padding:16, marginBottom:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start', flexWrap:'wrap', gap:8 }}>
              <div style={{ flex:1, minWidth:250 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <span style={{ fontWeight:700, color:brand.heading, fontSize:14 }}>{r.name}</span>
                  <Badge color={r.active?brand.emerald:brand.dim}>{r.active?'active':'paused'}</Badge>
                </div>
                {/* Visual rule flow */}
                <div style={{ display:'flex', alignItems:'center', gap:4, flexWrap:'wrap', marginBottom:6 }}>
                  <span style={{ fontSize:10, padding:'3px 10px', borderRadius:6, background:brand.blue+'15', color:brand.blue, fontWeight:600 }}>WHEN {r.trigger.replace(/_/g,' ')}</span>
                  <span style={{ color:brand.dim, fontSize:12 }}>→</span>
                  {r.condition && <><span style={{ fontSize:10, padding:'3px 10px', borderRadius:6, background:brand.saffron+'15', color:brand.saffron, fontWeight:600 }}>IF {r.condition}</span><span style={{ color:brand.dim, fontSize:12 }}>→</span></>}
                  <span style={{ fontSize:10, padding:'3px 10px', borderRadius:6, background:brand.emerald+'15', color:brand.emerald, fontWeight:600 }}>THEN {r.action.replace(/_/g,' ')}</span>
                  {r.template && <span style={{ fontSize:10, padding:'3px 10px', borderRadius:6, background:brand.purple+'15', color:brand.purple, fontWeight:600 }}>📋 {r.template}</span>}
                  {r.delay && r.delay!=='0h' && <span style={{ fontSize:10, padding:'3px 10px', borderRadius:6, background:brand.dim+'22', color:brand.dim }}>⏱ {r.delay}</span>}
                </div>
                <div style={{ fontSize:11, color:brand.dim }}>
                  Fired: <b style={{ color:brand.heading }}>{r.fired.toLocaleString()}</b> · Converted: <b style={{ color:brand.emerald }}>{r.converted.toLocaleString()}</b> · Rate: <b style={{ color:convPct>20?brand.emerald:brand.saffron }}>{convPct}%</b>
                </div>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => startEdit(r)} style={{ padding:'5px 12px', borderRadius:6, background:brand.blue+'15', color:brand.blue, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>✏️</button>
                <button onClick={() => toggleRule(r.id)} style={{ padding:'5px 12px', borderRadius:6, background:r.active?brand.saffron+'15':brand.emerald+'15', color:r.active?brand.saffron:brand.emerald, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>{r.active?'⏸':'▶'}</button>
                <button onClick={() => {if(confirm('Delete rule?')) deleteRule(r.id);}} style={{ padding:'5px 10px', borderRadius:6, background:brand.red+'15', color:brand.red, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>🗑</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default memo(AutomationRules);
