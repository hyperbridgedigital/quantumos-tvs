'use client';
import { memo, useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { settingsConfig } from '@/data/settings';
import { addressProviders as addrCfg } from '@/data/addressProviders';
import { verificationProviders as verifCfg } from '@/data/verificationProviders';

const s = { card:{ background:brand.bg2, border:'1px solid '+brand.border, borderRadius:12, padding:16 }, label:{ fontSize:10, fontWeight:700, letterSpacing:'.08em', color:brand.dim, textTransform:'uppercase' } };

function ProviderCard({ p, type, isActive, onToggle }) {
  const regionColor = p.region === 'india' ? brand.saffron : brand.blue;
  return (
    <div style={{ ...s.card, borderLeft:`3px solid ${isActive ? brand.emerald : brand.border}`, marginBottom:8, opacity: p.status==='inactive' && !isActive ? 0.65 : 1 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:4 }}>
            <span style={{ fontSize:13, fontWeight:700, color:brand.heading }}>{p.name}</span>
            <span style={{ fontSize:8, padding:'2px 6px', borderRadius:4, background:regionColor+'22', color:regionColor, fontWeight:600, textTransform:'uppercase' }}>{p.region}</span>
            {isActive && <span style={{ fontSize:8, padding:'2px 6px', borderRadius:4, background:brand.emerald+'22', color:brand.emerald, fontWeight:700 }}>ACTIVE</span>}
          </div>
          {p.description && <div style={{ fontSize:10, color:brand.dim, marginBottom:6, lineHeight:1.4 }}>{p.description}</div>}
          <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:6 }}>
            {(p.features||[]).slice(0,5).map(f => <span key={f} style={{ fontSize:8, padding:'1px 5px', borderRadius:3, background:'rgba(255,255,255,.05)', color:brand.dim }}>{f}</span>)}
          </div>
          <div style={{ display:'flex', gap:12, fontSize:9, color:brand.dim }}>
            {p.pricing && <span>💰 {p.pricing.model === 'free' ? 'Free' : p.pricing.currency === 'INR' ? `₹${Object.values(p.pricing).find(v=>typeof v==='number'&&v>0)}/req` : `$${Object.values(p.pricing).find(v=>typeof v==='number'&&v>0)}/req`}</span>}
            {p.integrationKit && <span>📦 {typeof p.integrationKit === 'string' ? p.integrationKit : p.integrationKit.npm || p.integrationKit.docs ? 'SDK Available' : 'REST API'}</span>}
            {p.docs && <a href={p.docs} target="_blank" rel="noopener noreferrer" style={{ color:brand.gold+'99', textDecoration:'none' }}>📄 Docs</a>}
          </div>
        </div>
        <button onClick={() => onToggle(p.id)} style={{ padding:'6px 14px', borderRadius:6, fontSize:9, fontWeight:700, cursor:'pointer', background: isActive ? brand.emerald+'22' : 'rgba(255,255,255,.06)', color: isActive ? brand.emerald : brand.dim, border:`1px solid ${isActive ? brand.emerald+'44' : brand.border}` }}>
          {isActive ? '✓ Active' : 'Activate'}
        </button>
      </div>
      {isActive && <div style={{ marginTop:10, padding:10, background:'rgba(255,255,255,.03)', borderRadius:8 }}>
        <div style={{ fontSize:9, color:brand.gold, fontWeight:700, marginBottom:6 }}>⚙️ CONFIGURATION</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:6 }}>
          {Object.entries(p.config||{}).map(([k,v]) => <div key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:9, color:brand.dim, minWidth:80 }}>{k}:</span>
            <input defaultValue={typeof v === 'string' ? v : JSON.stringify(v)} style={{ flex:1, background:'rgba(255,255,255,.06)', border:'1px solid '+brand.border, borderRadius:4, padding:'3px 6px', color:brand.heading, fontSize:9, outline:'none' }} placeholder={`Enter ${k}`} />
          </div>)}
        </div>
        {p.compliance && <div style={{ display:'flex', gap:6, marginTop:6 }}>
          {Object.entries(p.compliance).filter(([,v])=>v).map(([k]) => <span key={k} style={{ fontSize:8, padding:'1px 5px', borderRadius:3, background:brand.emerald+'11', color:brand.emerald }}>✓ {k.toUpperCase()}</span>)}
        </div>}
      </div>}
    </div>
  );
}

function Settings() {
  const { settings, updateSetting, saveSettings } = useApp();
  const [tab, setTab] = useState('general');
  const [activeAddr, setActiveAddr] = useState(addrCfg.active);
  const [activeSMS, setActiveSMS] = useState(verifCfg.activeProviders.sms);
  const [activeEmail, setActiveEmail] = useState(verifCfg.activeProviders.email);
  const [activeWA, setActiveWA] = useState(verifCfg.activeProviders.whatsapp);

  const tabs = [
    { k:'general', l:'⚙️ General' },
    { k:'address', l:'📍 Address Providers' },
    { k:'verify', l:'📱 Verification' },
    { k:'integrations', l:'🔌 Integration Kits' },
  ];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, margin:0 }}>⚙️ Platform Settings</h2>
          <p style={{ fontSize:12, color:brand.dim, margin:'4px 0 0' }}>Autonomous. Connected. Scalable.</p>
        </div>
      </div>
      <div style={{ display:'flex', gap:4, marginBottom:16 }}>
        {tabs.map(t => <button key={t.k} onClick={()=>setTab(t.k)} style={{ padding:'7px 14px', borderRadius:8, fontSize:10, fontWeight:700, cursor:'pointer', background:tab===t.k?brand.gold+'22':'rgba(255,255,255,.04)', color:tab===t.k?brand.gold:brand.dim, border:'1px solid '+(tab===t.k?brand.gold+'44':brand.border) }}>{t.l}</button>)}
      </div>

      {/* GENERAL SETTINGS */}
      {tab === 'general' && <>
        {Object.entries(settingsConfig).map(([section, keys]) => (
          <div key={section} style={{ marginBottom:24 }}>
            <div style={{ ...s.label, color:brand.gold, marginBottom:12 }}>{section}</div>
            <div style={s.card}>
              {keys.map(k => (
                <div key={k.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid '+brand.border+'20' }}>
                  <span style={{ fontSize:13, color:brand.heading }}>{k.label}</span>
                  {k.type === 'toggle' ? (
                    <button onClick={() => updateSetting(k.key, settings[k.key]==='true'?'false':'true')} style={{ width:40, height:22, borderRadius:11, border:'none', cursor:'pointer', position:'relative', background: settings[k.key]==='true' ? brand.emerald : brand.dim+'40' }}>
                      <span style={{ position:'absolute', top:2, left:settings[k.key]==='true'?20:2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left .3s' }} />
                    </button>
                  ) : k.type === 'select' ? (
                    <select value={settings[k.key]||k.value} onChange={e => updateSetting(k.key, e.target.value)} style={{ width:200, textAlign:'right', background:'rgba(255,255,255,.06)', border:'1px solid '+brand.border, borderRadius:8, padding:'6px 10px', color:brand.heading, fontSize:13, outline:'none', appearance:'auto' }}>
                      {(k.options||[]).map(o => <option key={o} value={o} style={{ background:brand.bg2, color:brand.heading }}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={settings[k.key]||''} onChange={e => updateSetting(k.key, e.target.value)} style={{ width:200, textAlign:'right', background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, borderRadius:8, padding:'6px 10px', color:brand.heading, fontSize:13, outline:'none' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={saveSettings} style={{ padding:'12px 32px', borderRadius:10, background:brand.gold, color:'#000', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>💾 Save Settings</button>
      </>}

      {/* ADDRESS PROVIDERS */}
      {tab === 'address' && <>
        <div style={{ ...s.card, marginBottom:16, background:'linear-gradient(135deg,'+brand.bg2+','+brand.card+')' }}>
          <div style={{ fontSize:12, fontWeight:700, color:brand.heading, marginBottom:8 }}>📍 Address Autofill Configuration</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            <div style={{ padding:10, background:'rgba(255,255,255,.04)', borderRadius:8 }}>
              <div style={{ ...s.label, fontSize:8, marginBottom:4 }}>Active Provider</div>
              <div style={{ fontSize:14, fontWeight:700, color:brand.gold }}>{addrCfg.providers.find(p=>p.id===activeAddr)?.name || 'None'}</div>
            </div>
            <div style={{ padding:10, background:'rgba(255,255,255,.04)', borderRadius:8 }}>
              <div style={{ ...s.label, fontSize:8, marginBottom:4 }}>Total Providers</div>
              <div style={{ fontSize:14, fontWeight:700, color:brand.heading }}>{addrCfg.providers.length}</div>
            </div>
            <div style={{ padding:10, background:'rgba(255,255,255,.04)', borderRadius:8 }}>
              <div style={{ ...s.label, fontSize:8, marginBottom:4 }}>Fallback</div>
              <div style={{ fontSize:14, fontWeight:700, color:brand.saffron }}>{addrCfg.providers.find(p=>p.id===addrCfg.fallbackProvider)?.name || 'None'}</div>
            </div>
          </div>
        </div>
        <div style={{ ...s.label, color:brand.saffron, marginBottom:8 }}>🇮🇳 INDIA PROVIDERS</div>
        {addrCfg.providers.filter(p=>p.type==='india').map(p => <ProviderCard key={p.id} p={p} type="address" isActive={p.id===activeAddr} onToggle={setActiveAddr} />)}
        <div style={{ ...s.label, color:brand.blue, marginBottom:8, marginTop:16 }}>🌐 INTERNATIONAL PROVIDERS</div>
        {addrCfg.providers.filter(p=>p.type==='international').map(p => <ProviderCard key={p.id} p={p} type="address" isActive={p.id===activeAddr} onToggle={setActiveAddr} />)}
      </>}

      {/* VERIFICATION PROVIDERS */}
      {tab === 'verify' && <>
        <div style={{ ...s.card, marginBottom:16, background:'linear-gradient(135deg,'+brand.bg2+','+brand.card+')' }}>
          <div style={{ fontSize:12, fontWeight:700, color:brand.heading, marginBottom:8 }}>📱 Verification Provider Status</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {[
              { l:'SMS', v:verifCfg.sms.find(p=>p.id===activeSMS)?.name, c:brand.emerald },
              { l:'Email', v:verifCfg.email.find(p=>p.id===activeEmail)?.name, c:brand.blue },
              { l:'WhatsApp', v:verifCfg.whatsapp.find(p=>p.id===activeWA)?.name, c:brand.whatsapp },
              { l:'OTP Length', v:`${verifCfg.otpLength} digits`, c:brand.gold },
            ].map(i => <div key={i.l} style={{ padding:10, background:'rgba(255,255,255,.04)', borderRadius:8 }}>
              <div style={{ ...s.label, fontSize:8, marginBottom:4 }}>{i.l}</div>
              <div style={{ fontSize:12, fontWeight:700, color:i.c }}>{i.v}</div>
            </div>)}
          </div>
          <div style={{ display:'flex', gap:8, marginTop:10, fontSize:9, color:brand.dim }}>
            <span>⏱ OTP Expiry: {verifCfg.otpExpiry}s</span>
            <span>🔄 Max Retries: {verifCfg.maxRetries}</span>
            <span>⏳ Cooldown: {verifCfg.cooldownSeconds}s</span>
            <span style={{ color: verifCfg.demoMode ? brand.saffron : brand.emerald }}>
              {verifCfg.demoMode ? '🔧 DEMO MODE (OTP: '+verifCfg.demoOTP+')' : '🟢 PRODUCTION'}
            </span>
          </div>
        </div>

        <div style={{ ...s.label, color:brand.emerald, marginBottom:8 }}>📱 SMS PROVIDERS ({verifCfg.sms.length})</div>
        {verifCfg.sms.map(p => <ProviderCard key={p.id} p={p} type="sms" isActive={p.id===activeSMS} onToggle={setActiveSMS} />)}

        <div style={{ ...s.label, color:brand.blue, marginBottom:8, marginTop:16 }}>📧 EMAIL PROVIDERS ({verifCfg.email.length})</div>
        {verifCfg.email.map(p => <ProviderCard key={p.id} p={p} type="email" isActive={p.id===activeEmail} onToggle={setActiveEmail} />)}

        <div style={{ ...s.label, color:brand.whatsapp, marginBottom:8, marginTop:16 }}>💚 WHATSAPP PROVIDERS ({verifCfg.whatsapp.length})</div>
        {verifCfg.whatsapp.map(p => <ProviderCard key={p.id} p={p} type="whatsapp" isActive={p.id===activeWA} onToggle={setActiveWA} />)}
      </>}

      {/* INTEGRATION KITS */}
      {tab === 'integrations' && <>
        <div style={{ ...s.card, marginBottom:16 }}>
          <div style={{ fontSize:12, fontWeight:700, color:brand.heading, marginBottom:10 }}>📦 Available Integration Kits & SDKs</div>
          <p style={{ fontSize:11, color:brand.dim, marginBottom:14, lineHeight:1.5 }}>Install integration kits for active providers. All providers support standard REST APIs; SDKs provide enhanced developer experience with type safety and built-in retry logic.</p>
        </div>
        {[
          { title:'Address Autofill SDKs', providers:addrCfg.providers.filter(p=>p.integrationKit), color:brand.gold },
          { title:'SMS/OTP SDKs', providers:verifCfg.sms.filter(p=>p.integrationKit?.npm||p.integrationKit?.docs), color:brand.emerald },
          { title:'Email SDKs', providers:verifCfg.email.filter(p=>p.integrationKit?.npm||p.integrationKit?.docs), color:brand.blue },
          { title:'WhatsApp SDKs', providers:verifCfg.whatsapp.filter(p=>p.integrationKit?.npm||p.integrationKit?.docs), color:brand.whatsapp },
        ].map(g => <div key={g.title} style={{ marginBottom:16 }}>
          <div style={{ ...s.label, color:g.color, marginBottom:8 }}>{g.title}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
            {g.providers.map(p => <div key={p.id} style={{ ...s.card, padding:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:brand.heading, marginBottom:4 }}>{p.name}</div>
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                {(typeof p.integrationKit === 'string') ?
                  <code style={{ fontSize:9, color:brand.gold, background:'rgba(255,255,255,.06)', padding:'2px 6px', borderRadius:3 }}>npm i {p.integrationKit}</code>
                : <>
                  {p.integrationKit?.npm && <code style={{ fontSize:9, color:brand.gold, background:'rgba(255,255,255,.06)', padding:'2px 6px', borderRadius:3 }}>npm i {p.integrationKit.npm}</code>}
                  {p.integrationKit?.pip && <code style={{ fontSize:9, color:brand.cyan, background:'rgba(255,255,255,.06)', padding:'2px 6px', borderRadius:3 }}>pip install {p.integrationKit.pip}</code>}
                  {p.integrationKit?.docs && <a href={p.integrationKit.docs} target="_blank" rel="noopener noreferrer" style={{ fontSize:9, color:brand.gold+'aa', textDecoration:'none' }}>📄 {p.integrationKit.docs.replace('https://','').slice(0,40)}...</a>}
                </>}
              </div>
            </div>)}
          </div>
        </div>)}
      </>}
    </div>
  );
}
export default memo(Settings);
