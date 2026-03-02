'use client';
import { useState, memo, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

function WhatsAppViral() {
  const { chatbotFlows, addBotFlow, updateBotFlow, chatMessages, addChatMessage, waTemplates, addWaTemplate, updateWaTemplate, customers, show, setAdminTab } = useApp();
  const [tab, setTab] = useState('crm');
  const [editBot, setEditBot] = useState(null);
  const [botForm, setBotForm] = useState({ name:'', trigger:'', steps:[''], active:true });
  const [reply, setReply] = useState('');

  const totalConvos = chatbotFlows.reduce((a,f)=>a+f.conversations,0);
  const activeChats = chatMessages.filter(m => m.status === 'active');
  const escalated = chatMessages.filter(m => m.status === 'escalated');

  const inp = { width:'100%', padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' };
  const tabs = [
    { k:'crm', l:'💬 Live Chat', c:activeChats.length },
    { k:'bot', l:'🤖 Bot Builder', c:chatbotFlows.length },
    { k:'templates', l:'📋 Templates', c:waTemplates.length },
  ];

  const startEditBot = (f) => { setBotForm({ ...f, steps: f.steps || [''] }); setEditBot(f.id); };
  const startNewBot = () => { setBotForm({ name:'', trigger:'', steps:['Step 1'], active:true }); setEditBot('new'); };
  const saveBot = () => {
    if (!botForm.name || !botForm.trigger) return show('Name and trigger required', 'error');
    if (editBot === 'new') addBotFlow(botForm); else updateBotFlow(editBot, botForm);
    setEditBot(null);
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>💬 WhatsApp CRM & Bot Builder</h2>
          <div style={{ fontSize:12, color:brand.dim }}>Live chat · Bot builder · Connected to CRM, Promos, Orders</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => setAdminTab('crm')} style={{ padding:'8px 14px', borderRadius:8, background:'#25D366'+'18', color:'#25D366', fontSize:11, fontWeight:700, border:'none', cursor:'pointer' }}>↗ CRM</button>
          <button onClick={() => setAdminTab('automation')} style={{ padding:'8px 14px', borderRadius:8, background:brand.blue+'18', color:brand.blue, fontSize:11, fontWeight:700, border:'none', cursor:'pointer' }}>🤖 Rules</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))', gap:10, marginBottom:20 }}>
        <StatCard label="Bot Conversations" value={totalConvos.toLocaleString()} color="#25D366" icon="💬" />
        <StatCard label="Active Chats" value={activeChats.length} color={brand.blue} icon="🔴" />
        <StatCard label="Escalated" value={escalated.length} color={brand.red} icon="⚠️" />
        <StatCard label="Bot Flows" value={chatbotFlows.length} color={brand.purple} icon="🤖" />
        <StatCard label="Templates" value={waTemplates.length} color={brand.gold} icon="📋" />
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {tabs.map(t => <button key={t.k} onClick={() => setTab(t.k)} style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, border:'none', background:tab===t.k?'#25D366'+'18':'transparent', color:tab===t.k?'#25D366':brand.dim, cursor:'pointer' }}>{t.l} ({t.c})</button>)}
      </div>

      {/* ═══ LIVE CHAT CRM ═══ */}
      {tab==='crm' && <div>
        <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', color:brand.gold, marginBottom:10 }}>LIVE CONVERSATIONS — Linked to CRM</div>
        {chatMessages.map(m => (
          <div key={m.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderLeft:'4px solid '+(m.status==='active'?'#25D366':m.status==='escalated'?brand.red:brand.dim), borderRadius:10, padding:14, marginBottom:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14 }}>{m.from==='bot'?'🤖':'👤'}</span>
                <span style={{ fontWeight:700, color:brand.heading, fontSize:13 }}>{m.name}</span>
                {m.phone && <span style={{ fontSize:10, color:brand.dim }}>{m.phone}</span>}
                <Badge color={m.status==='active'?'#25D366':m.status==='escalated'?brand.red:brand.dim}>{m.status}</Badge>
                {m.bot && <Badge color={brand.purple}>Flow: {m.bot}</Badge>}
              </div>
              <span style={{ fontSize:10, color:brand.dim }}>{m.time}</span>
            </div>
            <div style={{ fontSize:12, color:brand.text, padding:'6px 0' }}>{m.msg}</div>
            {m.from==='customer' && m.status==='active' && (
              <div style={{ display:'flex', gap:6, marginTop:6 }}>
                <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Reply..." style={{ ...inp, flex:1 }} />
                <button onClick={() => { if(reply) { addChatMessage({ from:'agent', name:'Agent', msg:reply, status:'active' }); setReply(''); show('Reply sent'); }}} style={{ padding:'6px 14px', borderRadius:8, background:'#25D366', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>Send</button>
                <button onClick={() => show('Escalated to manager')} style={{ padding:'6px 12px', borderRadius:8, background:brand.red+'15', color:brand.red, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>Escalate</button>
              </div>
            )}
          </div>
        ))}
      </div>}

      {/* ═══ BOT BUILDER ═══ */}
      {tab==='bot' && <div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'.15em', color:brand.gold }}>BOT FLOWS — Auto-respond to keywords</div>
          <button onClick={startNewBot} style={{ padding:'7px 16px', borderRadius:8, background:brand.emerald, color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>+ New Flow</button>
        </div>

        {editBot !== null && (
          <div style={{ background:brand.card, border:'1px solid '+brand.emerald+'30', borderRadius:12, padding:16, marginBottom:14 }}>
            <h3 style={{ color:brand.heading, fontSize:14, marginBottom:10 }}>{editBot==='new' ? '✨ Create Bot Flow' : '✏️ Edit Flow'}</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
              <div><label style={{ fontSize:9, color:brand.dim }}>FLOW NAME</label><input value={botForm.name} onChange={e => setBotForm(p=>({...p,name:e.target.value}))} style={inp} placeholder="Order Flow" /></div>
              <div><label style={{ fontSize:9, color:brand.dim }}>TRIGGER KEYWORDS (|separated)</label><input value={botForm.trigger} onChange={e => setBotForm(p=>({...p,trigger:e.target.value}))} style={inp} placeholder="order|menu|food" /></div>
            </div>
            <label style={{ fontSize:9, color:brand.dim }}>STEPS (conversation flow)</label>
            {botForm.steps.map((s, i) => (
              <div key={i} style={{ display:'flex', gap:6, marginBottom:4 }}>
                <span style={{ width:24, height:30, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:brand.gold, fontWeight:700 }}>{i+1}</span>
                <input value={s} onChange={e => { const ns = [...botForm.steps]; ns[i]=e.target.value; setBotForm(p=>({...p,steps:ns})); }} style={{ ...inp, flex:1 }} placeholder={'Step '+(i+1)} />
                {botForm.steps.length > 1 && <button onClick={() => { const ns = botForm.steps.filter((_,j)=>j!==i); setBotForm(p=>({...p,steps:ns})); }} style={{ color:brand.red, background:'none', border:'none', cursor:'pointer' }}>✕</button>}
              </div>
            ))}
            <button onClick={() => setBotForm(p=>({...p,steps:[...p.steps,'']}))} style={{ fontSize:10, color:brand.emerald, background:'none', border:'none', cursor:'pointer', marginBottom:10 }}>+ Add Step</button>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={saveBot} style={{ padding:'8px 18px', borderRadius:8, background:brand.emerald, color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>💾 Save</button>
              <button onClick={() => setEditBot(null)} style={{ padding:'8px 14px', borderRadius:8, color:brand.dim, border:'1px solid '+brand.border, background:'transparent', fontSize:12, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {chatbotFlows.map(f => (
          <div key={f.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:10, padding:14, marginBottom:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <div>
                <span style={{ fontWeight:700, color:brand.heading, fontSize:14 }}>{f.name}</span>
                <Badge color={f.active?brand.emerald:brand.dim}>{f.active?'active':'paused'}</Badge>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <span style={{ fontSize:11, color:brand.dim }}>{f.conversations.toLocaleString()} convos</span>
                <button onClick={() => startEditBot(f)} style={{ padding:'4px 10px', borderRadius:6, background:brand.blue+'15', color:brand.blue, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>✏️</button>
                <button onClick={() => updateBotFlow(f.id, { active: !f.active })} style={{ padding:'4px 10px', borderRadius:6, background:f.active?brand.saffron+'15':brand.emerald+'15', color:f.active?brand.saffron:brand.emerald, fontWeight:700, fontSize:10, border:'none', cursor:'pointer' }}>{f.active?'⏸':'▶'}</button>
              </div>
            </div>
            <div style={{ fontSize:10, color:brand.dim, marginBottom:4 }}>Keywords: <span style={{ color:brand.gold, fontFamily:'monospace' }}>{f.trigger}</span></div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
              {f.steps.map((s,i) => <span key={i} style={{ fontSize:9, padding:'3px 8px', borderRadius:6, background:brand.border, color:brand.heading }}>→ {s}</span>)}
            </div>
          </div>
        ))}
      </div>}

      {/* ═══ TEMPLATES ═══ */}
      {tab==='templates' && <div>
        {waTemplates.map(t => (
          <div key={t.id} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:10, padding:14, marginBottom:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <span style={{ fontWeight:700, color:brand.heading, fontSize:13 }}>{t.name}</span>
                <Badge color={t.status==='approved'?brand.emerald:brand.saffron}>{t.status}</Badge>
                <span style={{ fontSize:10, color:brand.dim, marginLeft:8 }}>{t.category} · {t.lang}</span>
              </div>
              <span style={{ fontSize:11, color:brand.dim }}>Sent: {t.sent?.toLocaleString() || 0}</span>
            </div>
            {t.body && <div style={{ fontSize:11, color:brand.text, marginTop:6, padding:'6px 8px', background:'rgba(255,255,255,.02)', borderRadius:6 }}>{t.body.slice(0,120)}...</div>}
          </div>
        ))}
      </div>}
    </div>
  );
}
export default memo(WhatsAppViral);
