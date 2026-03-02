'use client';
import { useState, useMemo } from 'react';
import { brand } from '@/lib/brand';
import { rewardsDb as initialRewards } from '@/data/rewardsDb';
import { customers as crmData } from '@/data/crm';

const s = { card:{ background:brand.bg2, border:'1px solid '+brand.border, borderRadius:12, padding:16 }, label:{ fontSize:10, fontWeight:700, letterSpacing:'.08em', color:brand.dim, textTransform:'uppercase', marginBottom:6 }, val:{ fontSize:20, fontWeight:800, color:brand.heading, fontFamily:brand.fontDisplay }, btn:{ padding:'8px 16px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', border:'none' } };
const tierColors = { Bronze:brand.terra, Silver:brand.cyan, Gold:brand.gold, Platinum:brand.purple };

export default function RewardsEngine() {
  const [config, setConfig] = useState(initialRewards.config);
  const [tab, setTab] = useState('overview');
  const [spinResult, setSpinResult] = useState(null);
  const [scratchResult, setScratchResult] = useState(null);

  const tierDist = useMemo(()=>{
    const d = { Bronze:0, Silver:0, Gold:0, Platinum:0 };
    crmData.forEach(c=>{ if(d[c.tier]!==undefined) d[c.tier]++; });
    return d;
  },[]);

  const doSpin = () => {
    const total = config.spinWheelPrizes.reduce((a,p)=>a+p.weight,0);
    let r = Math.random()*total, cum=0;
    for(const p of config.spinWheelPrizes){cum+=p.weight;if(r<=cum){setSpinResult(p.label);return;}}
  };

  const doScratch = () => {
    const total = config.scratchCardPrizes.reduce((a,p)=>a+p.weight,0);
    let r = Math.random()*total, cum=0;
    for(const p of config.scratchCardPrizes){cum+=p.weight;if(r<=cum){setScratchResult(p.label);return;}}
  };

  const tabs = [{key:'overview',label:'📊 Overview'},{key:'tiers',label:'🏅 Tiers'},{key:'games',label:'🎮 Games'},{key:'milestones',label:'🎯 Milestones'},{key:'redeem',label:'🎁 Redemption'},{key:'referral',label:'🤝 Referral'},{key:'config',label:'⚙️ Config'}];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, margin:0 }}>🏆 Rewards Engine</h2>
          <p style={{ fontSize:12, color:brand.dim, margin:'4px 0 0' }}>Points, tiers, games, milestones & redemptions</p>
        </div>
      </div>

      <div style={{ display:'flex', gap:4, marginBottom:16, overflowX:'auto' }}>
        {tabs.map(t=><button key={t.key} onClick={()=>setTab(t.key)} style={{ ...s.btn, background:tab===t.key?brand.gold+'22':'rgba(255,255,255,.04)', color:tab===t.key?brand.gold:brand.dim, border:'1px solid '+(tab===t.key?brand.gold+'44':brand.border), whiteSpace:'nowrap', fontSize:10, padding:'6px 12px' }}>{t.label}</button>)}
      </div>

      {tab==='overview' && <>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
          {[{l:'Points/₹',v:config.pointsPerRupee,c:brand.gold},{l:'Signup Bonus',v:config.signupBonus,c:brand.emerald},{l:'Referral Bonus',v:config.referralBonus,c:brand.blue},{l:'Min Redeem',v:config.minRedeemPoints,c:brand.saffron}].map((k,i)=>(
            <div key={i} style={s.card}><div style={s.label}>{k.l}</div><div style={{...s.val,color:k.c,fontSize:18}}>{k.v}</div></div>
          ))}
        </div>
        <div style={s.card}>
          <div style={s.label}>Tier Distribution</div>
          <div style={{ display:'flex', gap:16, marginTop:8 }}>
            {Object.entries(tierDist).map(([tier,count])=>(
              <div key={tier} style={{ flex:1, textAlign:'center' }}>
                <div style={{ fontSize:24, fontWeight:800, color:tierColors[tier], fontFamily:brand.fontDisplay }}>{count}</div>
                <div style={{ fontSize:11, color:brand.dim }}>{tier}</div>
                <div style={{ height:4, borderRadius:2, background:brand.bg, marginTop:4 }}><div style={{ width:`${crmData.length>0?count/crmData.length*100:0}%`, height:'100%', borderRadius:2, background:tierColors[tier] }}/></div>
              </div>
            ))}
          </div>
        </div>
      </>}

      {tab==='tiers' && <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12 }}>
        {config.tiers.map(t=>(
          <div key={t.name} style={{ ...s.card, borderLeft:'3px solid '+tierColors[t.name] }}>
            <div style={{ fontSize:16, fontWeight:800, color:tierColors[t.name], fontFamily:brand.fontDisplay, marginBottom:8 }}>{t.name}</div>
            <div style={{ fontSize:11, color:brand.dim, marginBottom:8 }}>Min Points: {t.minPoints} · Multiplier: {t.multiplier}x</div>
            <div style={s.label}>Perks</div>
            {t.perks.map(p=><div key={p} style={{ fontSize:11, color:brand.text, padding:'2px 0' }}>✓ {p}</div>)}
          </div>
        ))}
      </div>}

      {tab==='games' && <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:16 }}>
        <div style={s.card}>
          <div style={{ fontSize:14, fontWeight:700, color:brand.heading, marginBottom:12 }}>🎰 Spin the Wheel</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
            {config.spinWheelPrizes.map(p=>(
              <span key={p.label} style={{ fontSize:10, padding:'4px 8px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border }}>{p.label} ({p.weight}%)</span>
            ))}
          </div>
          <button onClick={doSpin} style={{ ...s.btn, background:brand.gold, color:'#000', width:'100%' }}>🎰 SPIN!</button>
          {spinResult && <div style={{ marginTop:12, padding:12, background:brand.emerald+'22', borderRadius:8, textAlign:'center', fontSize:14, fontWeight:700, color:brand.emerald }}>🎉 You won: {spinResult}</div>}
        </div>
        <div style={s.card}>
          <div style={{ fontSize:14, fontWeight:700, color:brand.heading, marginBottom:12 }}>🎫 Scratch Card</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
            {config.scratchCardPrizes.map(p=>(
              <span key={p.label} style={{ fontSize:10, padding:'4px 8px', borderRadius:6, background:brand.bg, color:brand.text, border:'1px solid '+brand.border }}>{p.label} ({p.weight}%)</span>
            ))}
          </div>
          <button onClick={doScratch} style={{ ...s.btn, background:brand.saffron, color:'#fff', width:'100%' }}>🎫 SCRATCH!</button>
          {scratchResult && <div style={{ marginTop:12, padding:12, background:brand.gold+'22', borderRadius:8, textAlign:'center', fontSize:14, fontWeight:700, color:brand.gold }}>✨ Prize: {scratchResult}</div>}
        </div>
        <div style={s.card}>
          <div style={{ fontSize:14, fontWeight:700, color:brand.heading, marginBottom:12 }}>🔥 Streak Rewards</div>
          {config.streakRewards.map(sr=>(
            <div key={sr.days} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid '+brand.border+'44' }}>
              <span style={{ fontSize:12, color:brand.text }}>{sr.days}-day streak</span>
              <span style={{ fontSize:11, color:brand.emerald, fontWeight:600 }}>{sr.reward}</span>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <div style={{ fontSize:14, fontWeight:700, color:brand.heading, marginBottom:12 }}>🎂 Special Rewards</div>
          <div style={{ padding:'8px 0', borderBottom:'1px solid '+brand.border+'44' }}>
            <span style={{ fontSize:12, color:brand.text }}>Birthday: </span>
            <span style={{ fontSize:11, color:brand.gold }}>{config.birthdayReward.value}{config.birthdayReward.type==='percent'?'%':'₹'} OFF (max ₹{config.birthdayReward.maxDiscount||'∞'})</span>
          </div>
          <div style={{ padding:'8px 0' }}>
            <span style={{ fontSize:12, color:brand.text }}>Anniversary: </span>
            <span style={{ fontSize:11, color:brand.gold }}>₹{config.anniversaryReward.value} OFF</span>
          </div>
        </div>
      </div>}

      {tab==='milestones' && <div style={s.card}>
        <div style={s.label}>Order Milestones</div>
        {config.milestones.map(m=>(
          <div key={m.orders} style={{ display:'flex', alignItems:'center', gap:16, padding:'12px 0', borderBottom:'1px solid '+brand.border+'44' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:brand.gold+'22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:brand.gold, fontFamily:brand.fontDisplay }}>{m.orders}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:brand.heading }}>{m.reward}</div>
              <div style={{ fontSize:11, color:brand.dim }}>After {m.orders} orders · +{m.points} bonus points</div>
            </div>
          </div>
        ))}
      </div>}

      {tab==='redeem' && <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
        {config.redemptionCatalog.map(r=>(
          <div key={r.id} style={{ ...s.card, textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:8 }}>{r.type==='freebie'?'🍽':'💰'}</div>
            <div style={{ fontSize:13, fontWeight:700, color:brand.heading, marginBottom:4 }}>{r.name}</div>
            <div style={{ fontSize:18, fontWeight:800, color:brand.gold, fontFamily:brand.fontDisplay }}>{r.points.toLocaleString()} pts</div>
          </div>
        ))}
      </div>}

      {tab==='referral' && <div style={s.card}>
        <div style={s.label}>Multi-Level Referral</div>
        {config.referralLevels.map(l=>(
          <div key={l.level} style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid '+brand.border+'44' }}>
            <span style={{ fontSize:12, color:brand.text }}>Level {l.level}: {l.label}</span>
            <span style={{ fontSize:12, fontWeight:700, color:brand.emerald }}>+{l.bonus} pts</span>
          </div>
        ))}
      </div>}

      {tab==='config' && <div style={s.card}>
        <div style={s.label}>Adjust Rewards Config</div>
        {[{key:'pointsPerRupee',label:'Points per ₹1'},{key:'pointsToRupeeRatio',label:'Points to ₹1 ratio'},{key:'signupBonus',label:'Signup Bonus'},{key:'referralBonus',label:'Referral Bonus'},{key:'minRedeemPoints',label:'Min Redeem Points'}].map(f=>(
          <div key={f.key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid '+brand.border+'44' }}>
            <span style={{ fontSize:12, color:brand.text }}>{f.label}</span>
            <input type="number" value={config[f.key]} onChange={e=>setConfig(p=>({...p,[f.key]:Number(e.target.value)}))} style={{ padding:'4px 8px', borderRadius:6, background:brand.bg, color:brand.heading, border:'1px solid '+brand.border, fontSize:12, width:80, textAlign:'right' }} />
          </div>
        ))}
      </div>}
    </div>
  );
}
