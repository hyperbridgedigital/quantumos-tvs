'use client';
import { useState } from 'react';
import { brand } from '@/lib/brand';
import { seoDb as initialSeo } from '@/data/seoDb';
import { geoDb as initialGeo } from '@/data/geoDb';
import { llmPromptLibrary as initialPrompts } from '@/data/llmPromptLibrary';
import { chennaipincodes } from '@/data/pincodes';

const s = { card:{ background:brand.bg2, border:'1px solid '+brand.border, borderRadius:12, padding:16 }, label:{ fontSize:10, fontWeight:700, letterSpacing:'.08em', color:brand.dim, textTransform:'uppercase', marginBottom:6 }, input:{ padding:'8px 12px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border, fontSize:12, width:'100%' }, btn:{ padding:'8px 16px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', border:'none' } };

export default function SEOManager() {
  const [seo, setSeo] = useState(initialSeo);
  const [geo, setGeo] = useState(initialGeo);
  const [prompts, setPrompts] = useState(initialPrompts);
  const [tab, setTab] = useState('meta');
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedPincode, setSelectedPincode] = useState('');
  const [lang, setLang] = useState('en');

  const tabs = [
    {key:'meta',label:'🏷 Page Meta'},{key:'schema',label:'📋 Schema.org'},
    {key:'sitemap',label:'🗺 Sitemap'},{key:'speed',label:'⚡ Page Speed'},
    {key:'redirects',label:'↪ Redirects'},{key:'geo',label:'📍 Geo/Local'},
    {key:'llm',label:'🤖 LLM Prompts'},
  ];

  const updatePageMeta = (page, field, value) => {
    setSeo(p => ({...p, pages:{...p.pages,[page]:{...p.pages[page],[field]:value}}}));
  };

  const nearestStore = (pin) => {
    const data = chennaipincodes[pin];
    return data ? data.store : stores[0]?.id || 'ST001';
  };

  const distanceFromStore = (pin, storeId) => {
    const data = chennaipincodes[pin];
    if(!data) return '?';
    const found = stores.find(s=>s.id===storeId); const storeLat = found?.lat || 12.8996;
    const storeLng = found?.lng || 80.2460;
    const d = Math.sqrt(Math.pow(data.lat-storeLat,2)+Math.pow(data.lng-storeLng,2))*111;
    return d.toFixed(1);
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, margin:0 }}>🌐 SEO & Geo Intelligence</h2>
          <p style={{ fontSize:12, color:brand.dim, margin:'4px 0 0' }}>Search optimization, local SEO, and geo-targeting</p>
        </div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <button onClick={()=>setLang(lang==='en'?'ta':'en')} style={{ ...s.btn, background:brand.purple+'22', color:brand.purple, border:'1px solid '+brand.purple+'44', fontSize:10 }}>{lang==='en'?'🇬🇧 English':'🇮🇳 தமிழ்'}</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:16, overflowX:'auto' }}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)} style={{ ...s.btn, background:tab===t.key?brand.gold+'22':'rgba(255,255,255,.04)', color:tab===t.key?brand.gold:brand.dim, border:'1px solid '+(tab===t.key?brand.gold+'44':brand.border), whiteSpace:'nowrap', fontSize:10, padding:'6px 12px' }}>{t.label}</button>
        ))}
      </div>

      {/* Page Meta */}
      {tab==='meta' && <div>
        <div style={{ display:'flex', gap:6, marginBottom:12 }}>
          {Object.keys(seo.pages).map(p=>(
            <button key={p} onClick={()=>setSelectedPage(p)} style={{ ...s.btn, background:selectedPage===p?brand.blue+'22':'rgba(255,255,255,.04)', color:selectedPage===p?brand.blue:brand.dim, border:'1px solid '+(selectedPage===p?brand.blue+'44':brand.border), fontSize:10, padding:'6px 12px' }}>{p}</button>
          ))}
        </div>
        {seo.pages[selectedPage] && <div style={s.card}>
          {['title','description','keywords','ogImage','canonical','robots','h1'].map(field=>(
            <div key={field} style={{ marginBottom:10 }}>
              <div style={s.label}>{field}</div>
              <input value={seo.pages[selectedPage][field]||''} onChange={e=>updatePageMeta(selectedPage,field,e.target.value)} style={s.input} />
              {field==='title' && <div style={{ fontSize:10, color:seo.pages[selectedPage].title?.length>60?brand.red:brand.emerald, marginTop:2 }}>{seo.pages[selectedPage].title?.length||0}/60 chars</div>}
              {field==='description' && <div style={{ fontSize:10, color:seo.pages[selectedPage].description?.length>160?brand.red:brand.emerald, marginTop:2 }}>{seo.pages[selectedPage].description?.length||0}/160 chars</div>}
            </div>
          ))}
        </div>}
      </div>}

      {/* Schema.org */}
      {tab==='schema' && <div style={s.card}>
        <div style={s.label}>Generated Schema.org Markup</div>
        {Object.entries(seo.schemas).map(([key,schema])=>(
          <div key={key} style={{ marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:700, color:brand.heading, marginBottom:6 }}>{key}</div>
            <pre style={{ padding:12, background:brand.bg, borderRadius:8, fontSize:10, color:brand.text, overflow:'auto', maxHeight:200, border:'1px solid '+brand.border }}>{JSON.stringify(schema,null,2)}</pre>
          </div>
        ))}
      </div>}

      {/* Page Speed */}
      {tab==='speed' && <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        {Object.entries(seo.pageSpeedScores).map(([page,scores])=>(
          <div key={page} style={s.card}>
            <div style={{ fontSize:13, fontWeight:700, color:brand.heading, marginBottom:12 }}>{page} Page</div>
            {Object.entries(scores).map(([metric,score])=>(
              <div key={metric} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, alignItems:'center' }}>
                <span style={{ fontSize:11, color:brand.text }}>{metric}</span>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:60, height:6, borderRadius:3, background:brand.bg }}>
                    <div style={{ width:`${score}%`, height:'100%', borderRadius:3, background:score>=90?brand.emerald:score>=50?brand.saffron:brand.red }} />
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:score>=90?brand.emerald:score>=50?brand.saffron:brand.red }}>{score}</span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>}

      {/* Sitemap & Robots */}
      {tab==='sitemap' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={s.card}>
          <div style={s.label}>XML Sitemap</div>
          <p style={{ fontSize:11, color:brand.dim }}>Last generated: {seo.sitemap.lastGenerated}</p>
          <div style={{ marginTop:8, padding:8, background:brand.bg, borderRadius:6 }}>
            {seo.sitemap.urls.map(u=><div key={u} style={{ fontSize:11, color:brand.text, padding:'2px 0' }}>https://thevaluestore.com{u}</div>)}
          </div>
          <button style={{ ...s.btn, background:brand.emerald+'22', color:brand.emerald, border:'1px solid '+brand.emerald+'44', marginTop:8, fontSize:10 }}>🔄 Regenerate Sitemap</button>
        </div>
        <div style={s.card}>
          <div style={s.label}>robots.txt</div>
          <textarea value={seo.robotsTxt} onChange={e=>setSeo(p=>({...p,robotsTxt:e.target.value}))} style={{ ...s.input, minHeight:80, fontFamily:'monospace', fontSize:11 }} />
        </div>
      </div>}

      {/* Redirects */}
      {tab==='redirects' && <div style={s.card}>
        <div style={s.label}>301 Redirect Manager</div>
        <button onClick={()=>setSeo(p=>({...p,redirects:[...p.redirects,{from:'',to:'',active:true}]}))} style={{ ...s.btn, background:brand.gold+'22', color:brand.gold, border:'1px solid '+brand.gold+'44', fontSize:10, marginBottom:8 }}>+ Add Redirect</button>
        {seo.redirects.map((r,i)=>(
          <div key={i} style={{ display:'flex', gap:8, marginBottom:6 }}>
            <input value={r.from} onChange={e=>{const rds=[...seo.redirects];rds[i]={...rds[i],from:e.target.value};setSeo(p=>({...p,redirects:rds}));}} style={{ ...s.input, width:'40%' }} placeholder="From path" />
            <span style={{ color:brand.dim, display:'flex', alignItems:'center' }}>→</span>
            <input value={r.to} onChange={e=>{const rds=[...seo.redirects];rds[i]={...rds[i],to:e.target.value};setSeo(p=>({...p,redirects:rds}));}} style={s.input} placeholder="To path" />
          </div>
        ))}
        {seo.redirects.length===0 && <p style={{ fontSize:12, color:brand.dim }}>No redirects configured</p>}
      </div>}

      {/* Geo/Local SEO */}
      {tab==='geo' && <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, marginBottom:16 }}>
          {geo.stores.map(st=>(
            <div key={st.storeId} style={s.card}>
              <div style={{ fontSize:13, fontWeight:700, color:brand.heading, marginBottom:8 }}>{st.gmb.businessName}</div>
              <div style={{ fontSize:11, color:brand.dim, marginBottom:4 }}>GMB: {st.gmb.placeId}</div>
              <div style={{ fontSize:11, color:brand.text }}>NAP: {st.nap.name} · {st.nap.address} · {st.nap.phone}</div>
              <div style={{ fontSize:11, color:brand.saffron, marginTop:4 }}>⭐ {st.reviews.avg} ({st.reviews.count} reviews)</div>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <div style={s.label}>Geo-Fencing Simulation</div>
          <div style={{ display:'flex', gap:8, marginBottom:8 }}>
            <select value={selectedPincode} onChange={e=>setSelectedPincode(e.target.value)} style={{ ...s.input, width:200 }}>
              <option value="">Select Pincode</option>
              {Object.entries(chennaipincodes).map(([pin,d])=><option key={pin} value={pin}>{pin} — {d.area}</option>)}
            </select>
          </div>
          {selectedPincode && chennaipincodes[selectedPincode] && <div style={{ padding:12, background:brand.bg3, borderRadius:8 }}>
            <div style={{ fontSize:13, color:brand.heading, fontWeight:700 }}>📍 {chennaipincodes[selectedPincode].area}</div>
            <div style={{ fontSize:12, color:brand.text, marginTop:4 }}>Nearest store: {nearestStore(selectedPincode)} ({distanceFromStore(selectedPincode,nearestStore(selectedPincode))} km away)</div>
            <div style={{ fontSize:12, color:brand.emerald, marginTop:4 }}>Delivery time: ~{chennaipincodes[selectedPincode].deliveryTime} min · Fee: ₹{chennaipincodes[selectedPincode].fee}</div>
          </div>}
        </div>
      </div>}

      {/* LLM Prompts */}
      {tab==='llm' && <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {prompts.map(p=>(
          <div key={p.id} style={s.card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div>
                <span style={{ fontSize:12, fontWeight:700, color:brand.heading }}>{p.name}</span>
                <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, marginLeft:8, background:brand.purple+'22', color:brand.purple }}>{p.category}</span>
              </div>
              <span style={{ fontSize:10, padding:'2px 8px', borderRadius:4, background:p.approved?brand.emerald+'22':brand.saffron+'22', color:p.approved?brand.emerald:brand.saffron, fontWeight:600 }}>{p.approved?'Approved':'Pending'}</span>
            </div>
            <div style={{ padding:8, background:brand.bg, borderRadius:6, fontSize:11, color:brand.text, fontFamily:'monospace' }}>{p.prompt}</div>
            <div style={{ display:'flex', gap:4, marginTop:6 }}>
              {p.guardrails.map(g=><span key={g} style={{ fontSize:9, padding:'1px 6px', borderRadius:4, background:brand.red+'15', color:brand.red }}>{g}</span>)}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}
