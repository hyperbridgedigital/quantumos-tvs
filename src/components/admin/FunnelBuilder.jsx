'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

const EMPTY = { name:'', stages:['Visit','Action','Convert'], counts:[0,0,0], active:true, campaign:'', channel:'whatsapp' };

function FunnelBuilder() {
  const { funnels, addFunnel, updateFunnel, deleteFunnel, offers, automationRules, show, setAdminTab } = useApp();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);

  const totalLeads = funnels.reduce((a,f)=>a+(f.counts?.[0]||0),0);
  const totalConverted = funnels.reduce((a,f)=>a+(f.counts?.[f.counts.length-1]||0),0);

  const startEdit = (f) => { setForm({...f}); setEditing(f.id); };
  const startNew = () => { setForm({...EMPTY}); setEditing('new'); };
  const save = () => {
    if (!form.name) return show('Name required','error');
    if (editing==='new') addFunnel(form); else updateFunnel(editing, form);
    setEditing(null);
  };
  const addStage = () => setForm(p => ({...p, stages:[...p.stages,'New Stage'], counts:[...p.counts,0]}));
  const removeStage = (i) => setForm(p => ({...p, stages:p.stages.filter((_,j)=>j!==i), counts:p.counts.filter((_,j)=>j!==i)}));

  const inp = { width:'100%', padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>🔄 Funnel Builder</h2>
          <div style={{ fontSize:12, color:brand.dim }}>Visual conversion funnels · Linked to campaigns, audiences & automation</div>
        </div>
        <button onClick={startNew} style={{ padding:'10px 20px', borderRadius:10, background:brand.emerald, color:'#fff', fontSize:13, fontWeight:700, border:'none', cursor:'pointer' }}>+ New Funnel</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:10, marginBottom:20 }}>
        <StatCard label="Active Funnels" value={funnels.filter(f=>f.active).length} color={brand.blue} icon="🔄" />
        <StatCard label="Total Leads" value={totalLeads.toLocaleString()} color={brand.gold} icon="👥" />
        <StatCard label="Converted" value={totalConverted.toLocaleString()} color={brand.emerald} icon="✅" />
        <StatCard label="Avg Conv. Rate" value={totalLeads?Math.round(totalConverted/totalLeads*100)+'%':'0%'} color={brand.purple} icon="📊" />
      </div>

      {/* Edit form */}
      {editing !== null && (
        <div style={{ background:brand.card, border:'1px solid '+brand.emerald+'30', borderRadius:14, padding:20, marginBottom:16 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
            <h3 style={{ color:brand.heading, fontSize:15 }}>{editing==='new'?'✨ Create Funnel':'✏️ Edit: '+form.name}</h3>
            <button onClick={() => setEditing(null)} style={{ color:brand.dim, background:'none', border:'none', fontSize:16, cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:12 }}>
            <div><label style={{ fontSize:9, color:brand.dim }}>FUNNEL NAME</label><input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} style={inp} /></div>
            <div><label style={{ fontSize:9, color:brand.dim }}>LINKED CAMPAIGN</label>
              <select value={form.campaign||''} onChange={e => setForm(p=>({...p,campaign:e.target.value}))} style={{...inp,appearance:'auto'}}>
                <option value="">None</option>{offers.map(o => <option key={o.id} value={o.code}>{o.name} ({o.code})</option>)}
              </select></div>
            <div><label style={{ fontSize:9, color:brand.dim }}>CHANNEL</label>
              <select value={form.channel||'whatsapp'} onChange={e => setForm(p=>({...p,channel:e.target.value}))} style={{...inp,appearance:'auto'}}>
                <option value="whatsapp">WhatsApp</option><option value="email">Email</option><option value="sms">SMS</option><option value="social">Social</option>
              </select></div>
          </div>
          <label style={{ fontSize:9, color:brand.dim }}>FUNNEL STAGES</label>
          {form.stages.map((s,i) => (
            <div key={i} style={{ display:'flex', gap:6, marginBottom:4, alignItems:'center' }}>
              <span style={{ width:24, fontSize:10, color:brand.gold, fontWeight:700, textAlign:'center' }}>{i+1}</span>
              <input value={s} onChange={e => { const ns=[...form.stages]; ns[i]=e.target.value; setForm(p=>({...p,stages:ns})); }} style={{...inp,flex:1}} />
              <input type="number" value={form.counts[i]||0} onChange={e => { const nc=[...form.counts]; nc[i]=Number(e.target.value); setForm(p=>({...p,counts:nc})); }} style={{...inp,width:80,textAlign:'center'}} placeholder="Count" />
              {i>0 && <span style={{ fontSize:9, color:brand.emerald, minWidth:40 }}>{form.counts[0]>0?Math.round((form.counts[i]||0)/form.counts[0]*100)+'%':'—'}</span>}
              {form.stages.length>2 && <button onClick={() => removeStage(i)} style={{ color:brand.red, background:'none', border:'none', cursor:'pointer', fontSize:12 }}>✕</button>}
            </div>
          ))}
          <button onClick={addStage} style={{ fontSize:10, color:brand.emerald, background:'none', border:'none', cursor:'pointer', marginBottom:10 }}>+ Add Stage</button>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={save} style={{ padding:'10px 24px', borderRadius:8, background:brand.emerald, color:'#fff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>💾 Save</button>
            <button onClick={() => setEditing(null)} style={{ padding:'10px 18px', borderRadius:8, color:brand.dim, border:'1px solid '+brand.border, background:'transparent', fontSize:13, cursor:'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Funnel cards with visual stages */}
      {funnels.map(f => {
        const max = Math.max(1,...(f.counts||[]));
        const convRate = f.counts?.[0] > 0 ? Math.round((f.counts[f.counts.length-1]/f.counts[0])*100) : 0;
        const linkedRule = automationRules.find(r => r.template?.includes(f.campaign?.toLowerCase()));
        return (
          <div key={f.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:14, padding:18, marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontWeight:700, color:brand.heading, fontSize:16 }}>{f.name}</span>
                <Badge color={f.active?brand.emerald:brand.dim}>{f.active?'active':'paused'}</Badge>
                {f.campaign && <Badge color={brand.gold}>🎫 {f.campaign}</Badge>}
                <Badge color={f.channel==='whatsapp'?'#25D366':brand.blue}>{f.channel}</Badge>
                {linkedRule && <Badge color={brand.purple}>🤖 auto</Badge>}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <span style={{ fontSize:14, fontWeight:700, color:brand.emerald }}>{convRate}% conv</span>
                <button onClick={() => startEdit(f)} style={{ padding:'5px 12px', borderRadius:6, background:brand.blue+'15', color:brand.blue, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>✏️</button>
                <button onClick={() => updateFunnel(f.id,{active:!f.active})} style={{ padding:'5px 12px', borderRadius:6, background:f.active?brand.saffron+'15':brand.emerald+'15', color:f.active?brand.saffron:brand.emerald, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>{f.active?'⏸':'▶'}</button>
                <button onClick={() => {if(confirm('Delete?')) deleteFunnel(f.id);}} style={{ padding:'5px 10px', borderRadius:6, background:brand.red+'15', color:brand.red, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>🗑</button>
              </div>
            </div>
            {/* Visual funnel bars */}
            <div style={{ display:'flex', gap:2, alignItems:'end', height:60, marginBottom:8 }}>
              {(f.stages||[]).map((s,i) => {
                const pct = Math.max(8, (f.counts?.[i]||0)/max*100);
                const colors = [brand.blue, '#25D366', brand.gold, brand.purple, brand.emerald, brand.pink];
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                    <span style={{ fontSize:9, color:brand.heading, fontWeight:700 }}>{(f.counts?.[i]||0).toLocaleString()}</span>
                    <div style={{ width:'100%', height:pct*.5+'px', minHeight:6, background:colors[i%colors.length]+'40', borderRadius:4, border:'1px solid '+colors[i%colors.length]+'30' }} />
                    <span style={{ fontSize:8, color:brand.dim, textAlign:'center', lineHeight:1.1 }}>{s}</span>
                  </div>
                );
              })}
            </div>
            {/* Drop-off analysis */}
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {(f.stages||[]).slice(1).map((s,i) => {
                const prev = f.counts?.[i]||1; const curr = f.counts?.[i+1]||0;
                const drop = prev > 0 ? Math.round((1-curr/prev)*100) : 0;
                return <span key={i} style={{ fontSize:9, padding:'2px 8px', borderRadius:4, background:drop>50?brand.red+'15':brand.saffron+'15', color:drop>50?brand.red:brand.saffron }}>{f.stages[i]}→{s}: {drop}% drop</span>;
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default memo(FunnelBuilder);
