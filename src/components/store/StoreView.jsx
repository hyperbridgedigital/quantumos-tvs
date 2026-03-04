'use client';
import { useState, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';
import { Badge } from '@/components/shared/Badge';
import { moods } from '@/data/moods';
import { BUDGET_TIERS } from '@/data/products';
import { catalogProducts, catalogCategories } from '@/data/catalog';
import BuildPCView from '@/components/store/BuildPCView';
import StoreHome from '@/components/store/StoreHome';
import StoreFeaturesView from '@/components/store/StoreFeaturesView';

const TABS = [
  { key:'home', label:'Home', icon:'🏠' },
  { key:'menu', label:'Shop', icon:'🛒' },
  { key:'buildpc', label:'Build PC', icon:'🖥️' },
  { key:'more', label:'More', icon:'✨' },
  { key:'offers', label:'Offers', icon:'🎁' },
  { key:'track', label:'Orders', icon:'📦' },
  { key:'franchise', label:'Franchise', icon:'🏢' },
];

export default function StoreView() {
  const {
    activeStores, selectedStore, setSelectedStore, currentStore,
    availableProducts, cart, addToCart, removeFromCart, updateCartQty, cartTotal,
    placeOrder, customerOrders, settings, partnerValues, show,
    customer, setShowUserAuth, offers, rewardsConf,
    userLocation, setUserLocation, stores, storeTheme
  } = useApp();

  const theme = storeTheme === 'dark' ? brand.storeDark : brand;

  const [tab, setTab] = useState('home');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [custInfo, setCustInfo] = useState({ name:'', phone:'', email:'', address:'', locality:'', city:'Chennai', state:'Tamil Nadu', pincode:'', landmark:'', type:'delivery', coupon:'' });
  const [locLoading, setLocLoading] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [refCode] = useState(() => 'TVS' + Math.random().toString(36).slice(2,6).toUpperCase());
  const [franchiseForm, setFranchiseForm] = useState({ name:'', phone:'', email:'', city:'', investment:'', experience:'', message:'' });
  const [shareOpen, setShareOpen] = useState(false);
  const [catFilter, setCatFilter] = useState('all');
  const [moodFilter, setMoodFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');

  const freeAbove = Number(settings.DELIVERY_FREE_ABOVE || 499);
  const deliveryCharge = Number(settings.DELIVERY_CHARGE || 29);
  const gstRate = Number(settings.GST_RATE || 5);
  const gst = Math.round(cartTotal * gstRate / 100);
  const isFreeDelivery = custInfo.type === 'pickup' || cartTotal >= freeAbove;
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryCharge;
  const discount = useMemo(() => {
    if (!appliedOffer) return 0;
    if (appliedOffer.discountType === 'percent') return Math.min(Math.round(cartTotal * appliedOffer.discount / 100), appliedOffer.maxDiscount || 9999);
    if (appliedOffer.discountType === 'flat') return appliedOffer.discount;
    return 0;
  }, [appliedOffer, cartTotal]);
  const grandTotal = Math.max(0, cartTotal + gst + finalDeliveryFee - discount);

  const detectLocation = () => {
    setLocLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          let nearest = null, minDist = Infinity;
          stores.filter(s => s.status === 'active').forEach(s => {
            const d = Math.sqrt((s.lat - loc.lat) ** 2 + (s.lng - loc.lng) ** 2) * 111;
            if (d < minDist) { minDist = d; nearest = s; }
          });
          if (nearest) { setSelectedStore(nearest.id); show('📍 ' + nearest.name + ' (' + minDist.toFixed(1) + ' km)'); }
          setLocLoading(false);
        },
        () => { show('Location denied', 'error'); setLocLoading(false); }
      );
    } else { setLocLoading(false); }
  };

  useEffect(() => { if (!userLocation && !selectedStore) detectLocation(); }, []);

  // Kynetra can request tab change (e.g. "Open Build PC")
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.tab) setTab(e.detail.tab);
      if (e.detail?.category) setCatFilter(e.detail.category);
    };
    window.addEventListener('tvs-navigate', handler);
    return () => window.removeEventListener('tvs-navigate', handler);
  }, []);

  // Build PC: when URL has ?build=, switch to Build PC tab (share link restore)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('build')) setTab('buildpc');
  }, []);

  const openCheckout = () => {
    if (customer) setCustInfo(p => ({ ...p, name: customer.name || '', phone: customer.phone || '' }));
    setCheckoutOpen(true);
  };
  const applyCoupon = () => {
    const code = custInfo.coupon.trim().toUpperCase();
    const offer = offers.find(o => o.code === code && o.active);
    if (!offer) return show('Invalid coupon', 'error');
    if (cartTotal < (offer.minOrder || 0)) return show('Min order ₹' + offer.minOrder, 'error');
    setAppliedOffer(offer); show('🎉 ' + offer.name + ' applied!');
  };
  const handlePlace = () => {
    if (!custInfo.name || !custInfo.phone) return show('Fill name & phone', 'error');
    const order = placeOrder({ ...custInfo, discount, appliedOffer: appliedOffer?.code });
    if (order) { setCheckoutOpen(false); setCustInfo({ name:'', phone:'', address:'', type:'delivery', coupon:'' }); setAppliedOffer(null); setTab('track'); }
  };
  const shareReferral = (p) => {
    const txt = 'Shop at ' + brand.name + ' – ₹' + (settings.VIRAL_REFERRAL_FRIEND||100) + ' OFF with code: ' + refCode + ' 🎮';
    if (p === 'whatsapp') window.open?.('https://wa.me/?text=' + encodeURIComponent(txt));
    else if (p === 'copy') { navigator.clipboard?.writeText(refCode); show('Copied!'); }
    setShareOpen(false);
  };

  const categories = useMemo(() => {
    if (catalogProducts?.length && Array.isArray(catalogCategories)) return ['all', ...catalogCategories.map((c) => c.id)];
    return ['all', ...new Set((availableProducts || []).map(p => p.category || 'Main'))];
  }, [availableProducts, catalogProducts, catalogCategories]);
  const filteredProducts = useMemo(() => {
    let list = catalogProducts?.length ? catalogProducts : (availableProducts || []);
    if (catFilter && catFilter !== 'all') list = list.filter(p => (p.category || p.categoryLabel) === catFilter || p.category === catFilter);
    if (moodFilter) list = list.filter(p => (p.moods || []).includes(moodFilter));
    if (budgetFilter) {
      const tier = BUDGET_TIERS.find(t => t.id === budgetFilter);
      if (tier) list = list.filter(p => p.price >= tier.min && p.price <= tier.max);
    }
    return list;
  }, [availableProducts, catalogProducts, catFilter, moodFilter, budgetFilter]);
  const activeOffers = offers.filter(o => o.active);
  const waPhone = partnerValues.WA_PHONE_NUMBER_ID || settings.SUPPORT_PHONE || '+91 98765 43210';

  // ═══ DESIGN TOKENS — Green + theme (light/dark) ═══
  const G = '#1B5E20', GL = '#2E7D32', GM = '#E8F5E9', GD = '#0D3B12';
  const SH = theme.storeHeading, SD = theme.storeDim, ST = theme.storeText, SB = theme.storeBorder;

  const inp = { width:'100%', padding:'13px 16px', borderRadius:12, background: theme.storeCard, border:'1.5px solid '+SB, color:SH, fontSize:14, outline:'none', fontFamily:"'Figtree',sans-serif", transition:'border .2s', boxSizing:'border-box' };
  const greenBtn = { padding:'14px 28px', borderRadius:12, background:G, color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' };
  const card = { background: theme.storeCard, border:'1px solid '+SB, borderRadius:16, boxShadow: storeTheme === 'dark' ? '0 1px 3px rgba(0,0,0,.3)' : 'var(--store-card-shadow, 0 1px 3px rgba(15,23,42,.06))' };

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'0 16px 80px', background: theme.storeBg }}>

      {/* ═══ NAV — Home shows new hero carousel inside StoreHome ═══ */}
      <div style={{ display:'flex', gap:3, marginBottom:28, background: theme.storeBg2, borderRadius:14, padding:4, border: '1px solid '+SB }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display:'flex', alignItems:'center', gap:6, padding:'11px 18px', borderRadius:10, fontSize:13, fontWeight:700, border:'none', flex:1, justifyContent:'center', transition:'all .15s', background: tab===t.key ? brand.storeCard : 'transparent', color: tab===t.key ? G : SD, boxShadow: tab===t.key ? 'var(--store-card-shadow, 0 1px 3px rgba(15,23,42,.06))' : 'none' }}>
            <span>{t.icon}</span>{t.label}
            {t.key==='offers' && activeOffers.length>0 && <span style={{ width:18, height:18, borderRadius:'50%', background:brand.red, color:'#fff', fontSize:9, fontWeight:800, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{activeOffers.length}</span>}
          </button>
        ))}
      </div>

      {/* ═══ HOME (50-feature landing) ═══ */}
      {tab==='home' && <StoreHome onNavigate={(targetTab, productId, categoryId) => { setTab(targetTab || 'menu'); if (categoryId) setCatFilter(categoryId); }} />}

      {/* ═══ BUILD PC (CSR) ═══ */}
      {tab==='buildpc' && <BuildPCView />}

      {/* ═══ MORE (10 store features) ═══ */}
      {tab==='more' && <StoreFeaturesView storeTheme={storeTheme} />}

      {/* ═══ MENU ═══ */}
      {tab==='menu' && <>
        {/* Store selector */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:G, marginBottom:12 }}>📍 Choose Store</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:10 }}>
            {activeStores.map(st => (
              <button key={st.id} onClick={() => setSelectedStore(st.id)} style={{ textAlign:'left', padding:18, borderRadius:14, border: selectedStore===st.id ? '2px solid '+G : '1px solid '+SB, width:'100%', background: selectedStore===st.id ? GM : brand.storeCard, color:ST, cursor:'pointer', transition:'all .15s', boxShadow: selectedStore===st.id ? '0 2px 12px rgba(27,94,32,.08)' : 'var(--store-card-shadow, 0 1px 3px rgba(15,23,42,.06))' }}>
                <div style={{ fontWeight:700, color:SH, fontSize:14, marginBottom:4 }}>{st.name}</div>
                <div style={{ fontSize:11, color:SD, marginBottom:8 }}>{(st.address||'').slice(0,55)}</div>
                <div style={{ display:'flex', gap:12, fontSize:11 }}>
                  <span style={{ color:G, fontWeight:600 }}>⚡ {st.prepTime}min</span>
                  <span style={{ color:brand.gold, fontWeight:600 }}>⭐ {st.rating}</span>
                  <span style={{ color:SD }}>{st.hours}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery banner */}
        {currentStore && <div style={{ background:GM, border:'1px solid #C8E6C9', borderRadius:16, padding:'18px 24px', marginBottom:24, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ width:48, height:48, borderRadius:14, background:G, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:22, flexShrink:0 }}>🚀</div>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontWeight:700, color:SH, fontSize:15 }}>60-Minute Delivery</div>
            <div style={{ fontSize:12, color:ST }}>Free over <b style={{ color:G }}>₹{freeAbove}</b> · Otherwise <b>₹{deliveryCharge}</b></div>
          </div>
          <div style={{ textAlign:'center', padding:'8px 16px', background: brand.storeCard, borderRadius:12, border:'1px solid #C8E6C9' }}>
            <div style={{ fontFamily:brand.fontDisplay, fontSize:22, fontWeight:700, color:G }}>{currentStore.prepTime}min</div>
            <div style={{ fontSize:8, color:SD, letterSpacing:'.1em', fontWeight:700 }}>FULFILLMENT</div>
          </div>
        </div>}

        {/* Offers strip */}
        {activeOffers.length > 0 && <div style={{ marginBottom:24, display:'flex', gap:10, overflowX:'auto', paddingBottom:6 }}>
          {activeOffers.slice(0,5).map(o => (
            <div key={o.id} onClick={() => { setCustInfo(p=>({...p,coupon:o.code})); setAppliedOffer(o); show('🎉 '+o.code+' applied!'); }}
              style={{ flexShrink:0, width:230, padding:'16px 18px', borderRadius:14, border:'1px solid '+SB, background: brand.storeCard, cursor:'pointer', boxShadow: 'var(--store-card-shadow, 0 1px 3px rgba(15,23,42,.06))' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}><span style={{ fontSize:22 }}>{o.icon}</span><span style={{ fontWeight:700, fontSize:13, color:SH }}>{o.name}</span></div>
              <div style={{ fontSize:11, color:SD, marginBottom:8 }}>{o.desc}</div>
              <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, color:G, background:GM, padding:'4px 12px', borderRadius:6, border:'1px dashed '+G+'30' }}>{o.code}</span>
            </div>
          ))}
        </div>}

        {/* WhatsApp + Referral */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:10, marginBottom:24 }}>
          <div style={{ ...card, padding:'16px 20px', display:'flex', alignItems:'center', gap:14, borderLeft:'4px solid #25D366' }}>
            <div style={{ width:44, height:44, borderRadius:12, background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:20, flexShrink:0 }}>💬</div>
            <div style={{ flex:1 }}><div style={{ fontWeight:700, color:SH, fontSize:13 }}>WhatsApp Order</div><div style={{ fontSize:11, color:SD }}>₹{settings.VIRAL_REFERRAL_FRIEND||100} off first order</div></div>
            <button onClick={() => window.open?.('https://wa.me/'+waPhone.replace(/[^0-9]/g,''))} style={{ padding:'8px 16px', borderRadius:8, background:'#25D366', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>Chat</button>
          </div>
          {settings.VIRAL_REFERRAL_ENABLED !== 'false' && <div style={{ ...card, padding:'16px 20px', display:'flex', alignItems:'center', gap:14, borderLeft:'4px solid '+brand.gold, position:'relative' }}>
            <div style={{ width:44, height:44, borderRadius:12, background:brand.gold, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:20, flexShrink:0 }}>🎁</div>
            <div style={{ flex:1 }}><div style={{ fontWeight:700, color:SH, fontSize:13 }}>Refer & Earn ₹{settings.VIRAL_REFERRAL_REWARD||100}</div><div style={{ fontSize:11, color:SD }}>Code: <b style={{ color:G }}>{refCode}</b></div></div>
            <button onClick={() => setShareOpen(!shareOpen)} style={{ padding:'8px 16px', borderRadius:8, background:brand.gold, color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>Share</button>
            {shareOpen && <div style={{ position:'absolute', top:'100%', right:0, zIndex:50, background: brand.storeCard, border:'1px solid '+SB, borderRadius:12, padding:10, display:'flex', gap:6, marginTop:4, boxShadow: 'var(--store-card-shadow-hover, 0 10px 40px rgba(15,23,42,.08))' }}>
              <button onClick={() => shareReferral('whatsapp')} style={{ padding:'7px 14px', borderRadius:8, background:'#25D366', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>WhatsApp</button>
              <button onClick={() => shareReferral('copy')} style={{ padding:'7px 14px', borderRadius:8, background:G, color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>Copy</button>
            </div>}
          </div>}
        </div>

        {/* Category filter */}
        <div style={{ display:'flex', gap:6, marginBottom:18, overflowX:'auto', paddingBottom:4 }}>
          {categories.map(c => <button key={c} onClick={() => setCatFilter(c)} style={{ padding:'8px 20px', borderRadius:24, fontSize:12, fontWeight:600, border:'1px solid '+(catFilter===c?G:SB), background: catFilter===c ? G : brand.storeCard, color:catFilter===c?'#fff':ST, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'all .15s' }}>{c==='all'?'All':(catalogCategories?.find(x=>x.id===c)?.label||c)}</button>)}
        </div>

        {/* Budget filter — find goodies within your budget */}
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', color:G, marginBottom:10 }}>💰 Budget</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={() => setBudgetFilter('')} style={{ padding:'10px 18px', borderRadius:12, fontSize:12, fontWeight:600, border:'1.5px solid '+(budgetFilter===''?G:SB), background: budgetFilter==='' ? GM : brand.storeCard, color:budgetFilter===''?G:SD, cursor:'pointer', transition:'all .15s', boxShadow:budgetFilter===''?'0 1px 6px rgba(27,94,32,.08)':'none' }}>Any</button>
            {BUDGET_TIERS.map(t => (
              <button key={t.id} onClick={() => setBudgetFilter(budgetFilter===t.id?'':t.id)} style={{ padding:'10px 18px', borderRadius:12, fontSize:12, fontWeight:600, border:'1.5px solid '+(budgetFilter===t.id?G:SB), background: budgetFilter===t.id ? GM : brand.storeCard, color:budgetFilter===t.id?G:SD, cursor:'pointer', transition:'all .15s', boxShadow:budgetFilter===t.id?'0 1px 6px rgba(27,94,32,.08)':'none' }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Mood filter — emotional / vibe */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', color:G, marginBottom:10 }}>✨ Vibe</div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <button onClick={() => setMoodFilter('')} style={{ padding:'10px 18px', borderRadius:12, fontSize:12, fontWeight:600, border:'1.5px solid '+(moodFilter===''?G:SB), background: moodFilter==='' ? GM : brand.storeCard, color:moodFilter===''?G:SD, cursor:'pointer', transition:'all .15s', boxShadow:moodFilter===''?'0 1px 6px rgba(27,94,32,.08)':'none' }}>All vibes</button>
            {moods.map(m => (
              <button key={m.slug} onClick={() => setMoodFilter(moodFilter===m.slug?'':m.slug)} style={{ padding:'10px 18px', borderRadius:12, fontSize:12, fontWeight:600, border:'1.5px solid '+(moodFilter===m.slug?m.color:SB), background: moodFilter===m.slug ? m.color+'18' : brand.storeCard, color:moodFilter===m.slug?m.color:SD, cursor:'pointer', transition:'all .15s', boxShadow:moodFilter===m.slug?'0 1px 6px rgba(0,0,0,.06)':'none' }}><span style={{ marginRight:4 }}>{m.emoji}</span>{m.name}</button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:14, marginBottom:28 }}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn:'1 / -1', textAlign:'center', padding:'48px 24px', background:GM, borderRadius:16, border:'1px solid #C8E6C9' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
              <div style={{ fontWeight:700, color:SH, fontSize:16, marginBottom:6 }}>No items match your filters</div>
            <div style={{ fontSize:11, color:SD, marginBottom:8 }}>Try relaxing Budget or category to see more.</div>
            <button onClick={() => { setBudgetFilter(''); setMoodFilter(''); setCatFilter('all'); }} style={{ ...greenBtn }}>Clear filters</button>
            </div>
          ) : filteredProducts.map(p => (
            <div key={p.id} style={{ ...card, padding:18, opacity:(p.available !== false && p.inStock !== false) ? 1 : .4, position:'relative' }}>
              {p.image && <img src={p.image} alt={p.name} style={{ width:'100%', aspectRatio:1, objectFit:'cover', borderRadius:12, marginBottom:12 }} />}
              {p.tag && <span style={{ position:'absolute', top:12, right:12, fontSize:8, padding:'3px 10px', borderRadius:6, background:G, color:'#fff', fontWeight:800 }}>{p.tag}</span>}
              <div style={{ fontWeight:700, color:SH, fontSize:15, marginBottom:4 }}>{p.name}</div>
              {(p.category || p.categoryLabel) && <div style={{ fontSize:10, color:SD, marginBottom:10 }}>{p.categoryLabel || p.category}</div>}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:brand.fontDisplay, fontSize:22, fontWeight:700, color:G }}>{fmt(p.price)}</span>
                {(p.available !== false && p.inStock !== false) ? <button onClick={() => addToCart(p)} style={{ padding:'8px 18px', borderRadius:10, background:G, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', border:'none' }}>+ Add</button>
                : <span style={{ fontSize:10, color:brand.red, fontWeight:600 }}>Sold Out</span>}
              </div>
            </div>
          ))}
        </div>

        {/* ═══ Cart ═══ */}
        {cart.length > 0 && <div style={{ ...card, padding:26, marginBottom:28, border:'2px solid '+G+'18' }}>
          {/* Kynetra at checkout — 20 years ahead: AI help when you need it */}
          <div style={{ marginBottom:16, padding:12, background: theme.storeBg2, borderRadius:12, border:'1px solid '+SB }}>
            <div style={{ fontSize:11, fontWeight:700, color:SH, marginBottom:8 }}>💬 Need help? Ask Kynetra</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['Discount code?', 'Track order', 'Change address?', 'Best GPU for my build'].map(msg => (
                <button key={msg} type="button" onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('kynetra-open', { detail: { message: msg, send: true } }))} style={{ padding:'6px 14px', borderRadius:20, border:'1px solid '+SB, background: theme.storeCard, color:SH, fontSize:11, fontWeight:600, cursor:'pointer' }}>{msg}</button>
              ))}
            </div>
          </div>
          <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, color:SH, fontSize:20, marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:36, height:36, borderRadius:10, background:GM, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🛒</span>
            Your Order <span style={{ fontSize:13, fontWeight:500, color:SD }}>({cart.reduce((a,i)=>a+i.qty,0)} items)</span>
          </div>
          {cart.map(i => (
            <div key={i.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid '+SB }}>
              <span style={{ color:SH, fontSize:14, fontWeight:500 }}>{i.name}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={() => updateCartQty(i.id,i.qty-1)} style={{ width:28, height:28, borderRadius:8, background: theme.storeBg2, color:SH, border:'1px solid '+SB, fontWeight:700, cursor:'pointer', fontSize:14 }}>−</button>
                <span style={{ fontWeight:700, minWidth:24, textAlign:'center', color:SH }}>{i.qty}</span>
                <button onClick={() => updateCartQty(i.id,i.qty+1)} style={{ width:28, height:28, borderRadius:8, background:GM, color:G, border:'1px solid #C8E6C9', fontWeight:700, cursor:'pointer', fontSize:14 }}>+</button>
                <span style={{ fontWeight:700, color:G, minWidth:65, textAlign:'right' }}>{fmt(i.price*i.qty)}</span>
                <button onClick={() => removeFromCart(i.id)} style={{ color:brand.red, background:'none', border:'none', fontSize:14, cursor:'pointer' }}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ paddingTop:16, marginTop:10, fontSize:13 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ color:SD }}>Subtotal</span><span style={{ color:SH }}>{fmt(cartTotal)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ color:SD }}>GST ({gstRate}%)</span><span style={{ color:SH }}>{fmt(gst)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ color:SD }}>Delivery</span>
              {isFreeDelivery ? <span style={{ color:G, fontWeight:700 }}>FREE ✓</span> : <span style={{ color:SH }}>₹{deliveryCharge} <span style={{ fontSize:10, color:G }}>· Free over ₹{freeAbove}</span></span>}
            </div>
            {discount>0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ color:G }}>🎁 {appliedOffer?.code}</span><span style={{ color:G, fontWeight:700 }}>−{fmt(discount)}</span></div>}
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:20, marginTop:12, paddingTop:12, borderTop:'2px solid '+SB }}>
              <span style={{ color:SH }}>Total</span>
              <span style={{ color:G }}>{fmt(grandTotal)}</span>
            </div>
          </div>
          {!checkoutOpen ? (
            <button onClick={openCheckout} style={{ ...greenBtn, width:'100%', marginTop:16, fontSize:16, padding:15 }}>🛒 Checkout · {fmt(grandTotal)}</button>
          ) : (
            <div style={{ padding:22, background: theme.storeBg2, borderRadius:14, border:'1px solid '+SB }}>
              <div style={{ fontSize:10, fontWeight:800, color:G, marginBottom:12, letterSpacing:'.2em' }}>DELIVERY DETAILS</div>
              {['name','phone','address'].map(f => <input key={f} placeholder={f==='name'?'Full Name':f==='phone'?'Phone (+91)':'Delivery Address'} value={custInfo[f]} onChange={e => setCustInfo(p=>({...p,[f]:e.target.value}))} style={{ ...inp, marginBottom:8 }} />)}
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                {['delivery','pickup'].map(t => <button key={t} onClick={() => setCustInfo(p=>({...p,type:t}))} style={{ flex:1, padding:11, borderRadius:10, fontSize:13, fontWeight:700, border:'2px solid '+(custInfo.type===t?G:SB), background:custInfo.type===t?GM:'#fff', color:custInfo.type===t?G:SD, cursor:'pointer', transition:'all .15s' }}>{t==='delivery'?'🛵 Delivery':'🏃 Pickup'}</button>)}
              </div>
              <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                <input placeholder="Coupon code" value={custInfo.coupon} onChange={e => setCustInfo(p=>({...p,coupon:e.target.value.toUpperCase()}))} style={{ ...inp, flex:1, textTransform:'uppercase', letterSpacing:'.1em' }} />
                <button onClick={applyCoupon} style={{ padding:'0 20px', borderRadius:10, background:brand.gold+'15', border:'1px solid '+brand.gold+'35', color:brand.gold, fontWeight:700, fontSize:12, cursor:'pointer' }}>Apply</button>
              </div>
              <button onClick={handlePlace} style={{ ...greenBtn, width:'100%', fontSize:16, padding:15 }}>✅ Place Order · {fmt(grandTotal)}</button>
            </div>
          )}
        </div>}
      </>}

      {/* ═══ OFFERS ═══ */}
      {tab==='offers' && <div>
        {settings.VIRAL_REFERRAL_ENABLED !== 'false' && <div style={{ background:'linear-gradient(150deg, '+GD+', '+G+', '+GL+')', borderRadius:20, padding:'36px 28px', marginBottom:24, textAlign:'center' }}>
          <div style={{ fontSize:44, marginBottom:10 }}>🎁</div>
          <h3 style={{ fontFamily:brand.fontDisplay, fontSize:26, color:'#fff', marginBottom:6 }}>Refer Friends, Earn Rewards</h3>
          <p style={{ fontSize:13, color:'#C8E6C9', marginBottom:18 }}>They get ₹{settings.VIRAL_REFERRAL_FRIEND||100} off, you earn ₹{settings.VIRAL_REFERRAL_REWARD||100}.</p>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(255,255,255,.12)', border:'2px dashed rgba(255,255,255,.25)', borderRadius:12, padding:'12px 26px', marginBottom:16 }}>
            <span style={{ fontFamily:'monospace', fontSize:24, fontWeight:800, color:'#fff' }}>{refCode}</span>
            <button onClick={() => shareReferral('copy')} style={{ padding:'6px 14px', borderRadius:8, background:'rgba(255,255,255,.2)', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>📋 Copy</button>
          </div>
          <div><button onClick={() => shareReferral('whatsapp')} style={{ padding:'10px 22px', borderRadius:10, background:'#25D366', color:'#fff', fontWeight:700, fontSize:13, border:'none', cursor:'pointer' }}>💬 Share on WhatsApp</button></div>
        </div>}

        <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', color:G, marginBottom:12 }}>🎉 ACTIVE OFFERS</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:12, marginBottom:24 }}>
          {activeOffers.map(o => (
            <div key={o.id} style={{ ...card, padding:20, borderLeft:'4px solid '+G }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <span style={{ fontSize:30 }}>{o.icon}</span>
                <div><div style={{ fontWeight:700, fontSize:15, color:SH }}>{o.name}</div><div style={{ fontSize:11, color:SD }}>{o.desc}</div></div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:'monospace', fontSize:14, fontWeight:700, color:G, background:GM, padding:'5px 14px', borderRadius:6, border:'1px dashed '+G+'30' }}>{o.code}</span>
                <button onClick={() => { setCustInfo(p=>({...p,coupon:o.code})); setAppliedOffer(o); setTab('menu'); show('🎉 Applied!'); }} style={{ padding:'8px 16px', borderRadius:8, background:G, color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>Apply →</button>
              </div>
              {o.minOrder>0 && <div style={{ fontSize:10, color:SD, marginTop:8 }}>Min: ₹{o.minOrder}{o.freebieItem ? ' · Freebie: '+o.freebieItem : ''}</div>}
            </div>
          ))}
        </div>

        {settings.VIRAL_REWARDS_ENABLED !== 'false' && <>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', color:G, marginBottom:12 }}>🏆 LOYALTY TIERS</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(185px,1fr))', gap:10 }}>
            {rewardsConf.tiers.map((t,i) => (
              <div key={t.name} style={{ ...card, padding:18, textAlign:'center', borderTop:'3px solid '+[SD,'#C0C0C0',brand.gold,'#4CAF50'][i] }}>
                <div style={{ fontSize:30, marginBottom:6 }}>{['🥉','🥈','🥇','💎'][i]}</div>
                <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, fontSize:16, color:SH }}>{t.name}</div>
                <div style={{ fontSize:11, color:SD, marginBottom:8 }}>{t.minPoints}+ pts · {t.multiplier}x</div>
                {t.perks.map(p => <div key={p} style={{ fontSize:10, color:G, marginBottom:2 }}>✓ {p}</div>)}
              </div>
            ))}
          </div>
        </>}
      </div>}

      {/* ═══ ORDERS ═══ */}
      {tab==='track' && <div>
        {!customer && <div style={{ textAlign:'center', padding:'50px 20px' }}><div style={{ fontSize:48, marginBottom:12 }}>🔐</div><h3 style={{ fontFamily:brand.fontDisplay, color:SH, marginBottom:10 }}>Sign in to view orders</h3><button onClick={() => setShowUserAuth(true)} style={greenBtn}>Sign In</button></div>}
        {customer && customerOrders.length === 0 && <div style={{ textAlign:'center', padding:'50px 20px' }}><div style={{ fontSize:48, marginBottom:12 }}>📦</div><h3 style={{ fontFamily:brand.fontDisplay, color:SH }}>No orders yet</h3><button onClick={() => setTab('menu')} style={{ ...greenBtn, marginTop:14 }}>Browse Shop</button></div>}
        {customerOrders.map(o => (
          <div key={o.id} style={{ ...card, padding:20, marginBottom:10 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <div><span style={{ fontFamily:'monospace', fontWeight:700, color:SH }}>{o.id}</span><span style={{ fontSize:11, color:SD, marginLeft:8 }}>{o.placed}</span></div>
              <Badge color={o.status==='delivered'?G:o.status==='out_for_delivery'?brand.blue:brand.gold}>{o.status.replace(/_/g,' ')}</Badge>
            </div>
            <div style={{ fontSize:12, color:SD }}>{o.items.map(i => i.name+' ×'+i.qty).join(', ')}</div>
            <div style={{ display:'flex', justifyContent:'space-between', marginTop:8 }}><span style={{ fontWeight:700, color:G }}>{fmt(o.total)}</span>{o.eta>0 && o.status!=='delivered' && <span style={{ color:G, fontSize:12, fontWeight:600 }}>⏱ ~{o.eta}min</span>}</div>
          </div>
        ))}
      </div>}

      {/* ═══ FRANCHISE ═══ */}
      {tab==='franchise' && settings.FRANCHISE_ENABLED!=='false' && <div>
        <div style={{ background:'linear-gradient(150deg, '+GD+', '+G+', '+GL+')', borderRadius:20, padding:'40px 30px', marginBottom:24, textAlign:'center' }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🏢</div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:30, color:'#fff', marginBottom:8 }}>Partner with {brand.name}</h2>
          <p style={{ fontSize:14, color:'#C8E6C9', maxWidth:500, margin:'0 auto 22px' }}>₹{settings.FRANCHISE_MIN_INVESTMENT||15}L – ₹{settings.FRANCHISE_MAX_INVESTMENT||35}L investment</p>
          <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
            {[{ l:'Investment', v:'₹'+(settings.FRANCHISE_MIN_INVESTMENT||15)+'-'+(settings.FRANCHISE_MAX_INVESTMENT||35)+'L' },{ l:'Royalty', v:(settings.FRANCHISE_DEFAULT_ROYALTY||12)+'%' },{ l:'Locations', v:activeStores.length+'+' },{ l:'ROI', v:'18-24mo' }].map(s2 => (
              <div key={s2.l}><div style={{ fontFamily:brand.fontDisplay, fontSize:24, fontWeight:700, color:brand.gold }}>{s2.v}</div><div style={{ fontSize:10, color:'#A5D6A7', letterSpacing:'.1em' }}>{s2.l}</div></div>
            ))}
          </div>
        </div>

        <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', color:G, marginBottom:12 }}>✨ WHY {brand.name.toUpperCase()}</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginBottom:24 }}>
          {[{i:'🖥️',t:'Proven Catalog',d:'Gaming PCs, laptops & components loved by builders'},{i:'📦',t:'Full Support',d:'Setup, training, ops, marketing'},{i:'💻',t:'Tech Platform',d:'POS, OMS, delivery, WhatsApp — included'},{i:'📈',t:'High Margins',d:'60%+ gross, optimized supply chain'},{i:'🎯',t:'Marketing',d:'Viral engine, social, SEO done for you'},{i:'🤝',t:'Community',d:'Network of franchise owners'}].map(f => (
            <div key={f.t} style={{ ...card, padding:18 }}><div style={{ fontSize:28, marginBottom:8 }}>{f.i}</div><div style={{ fontWeight:700, color:SH, fontSize:14, marginBottom:4 }}>{f.t}</div><div style={{ fontSize:12, color:SD }}>{f.d}</div></div>
          ))}
        </div>

        <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', color:G, marginBottom:12 }}>📝 FRANCHISE INQUIRY</div>
        <div style={{ ...card, padding:26, maxWidth:540 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            <input placeholder="Full Name *" value={franchiseForm.name} onChange={e => setFranchiseForm(p=>({...p,name:e.target.value}))} style={inp} />
            <input placeholder="Phone *" value={franchiseForm.phone} onChange={e => setFranchiseForm(p=>({...p,phone:e.target.value}))} style={inp} />
          </div>
          <input placeholder="Email *" value={franchiseForm.email} onChange={e => setFranchiseForm(p=>({...p,email:e.target.value}))} style={{ ...inp, marginBottom:8 }} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:8 }}>
            <input placeholder="Preferred City" value={franchiseForm.city} onChange={e => setFranchiseForm(p=>({...p,city:e.target.value}))} style={inp} />
            <select value={franchiseForm.investment} onChange={e => setFranchiseForm(p=>({...p,investment:e.target.value}))} style={{ ...inp, appearance:'auto' }}>
              <option value="">Budget</option><option value="15-20L">₹15-20L</option><option value="20-25L">₹20-25L</option><option value="25-35L">₹25-35L</option><option value="35L+">₹35L+</option>
            </select>
          </div>
          <select value={franchiseForm.experience} onChange={e => setFranchiseForm(p=>({...p,experience:e.target.value}))} style={{ ...inp, marginBottom:8, appearance:'auto' }}>
            <option value="">Retail / Tech Experience</option><option value="none">None</option><option value="1-3">1-3 years</option><option value="3+">3+ years</option>
          </select>
          <textarea placeholder="Tell us about yourself..." value={franchiseForm.message} onChange={e => setFranchiseForm(p=>({...p,message:e.target.value}))} rows={3} style={{ ...inp, marginBottom:14, resize:'vertical' }} />
          <button onClick={() => { if(!franchiseForm.name||!franchiseForm.phone) return show('Fill name & phone','error'); show('✅ Inquiry submitted!'); setFranchiseForm({name:'',phone:'',email:'',city:'',investment:'',experience:'',message:''}); }} style={{ ...greenBtn, width:'100%' }}>🏢 Submit Franchise Inquiry</button>
        </div>
      </div>}

      {/* ═══ WHATSAPP CHATBOT WIDGET ═══ */}
      <ChatBotWidget waPhone={waPhone} show={show} />
    </div>
  );
}

function ChatBotWidget({ waPhone, show }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from:'bot', text:'👋 Welcome to ' + brand.name + '! I can help you with:\n\n🛒 Shop\n📦 Track order\n🎁 View offers\n🏢 Partner info\n\nJust type or tap below!' }
  ]);
  const [input, setInput] = useState('');
  const G = '#1B5E20';

  const quickReplies = ['🛒 Shop','📦 Track Order','🎁 Offers','🏢 Franchise'];

  const botReply = (text) => {
    const t = text.toLowerCase();
    if (t.includes('menu')||t.includes('shop')||t.includes('order')||t.includes('laptop')||t.includes('gaming')||t.includes('build')||t.includes('pc')) return '🖥️ Our top picks:\n\n• Gaming PCs — from ₹45,999\n• Gaming Laptops — from ₹62,999\n• Build Your PC — configurator\n• Peripherals & accessories\n\nTap the Shop tab to browse!';
    if (t.includes('track')||t.includes('status')||t.includes('where')) return '📦 To track your order, share your Order ID (e.g. ORD-7X2). You can also check the Orders tab above!';
    if (t.includes('offer')||t.includes('deal')||t.includes('discount')||t.includes('coupon')) return '🎁 Active offers:\n\n• WELCOME20 — 20% off first order\n• GAMING50 — ₹500 off gaming PCs\n• BUILD100 — ₹1,000 off Build Your PC\n\nApply at checkout!';
    if (t.includes('franchise')||t.includes('own')||t.includes('invest')) return '🏢 Franchise details:\n\n• Investment: ₹15-35L\n• ROI: 18-24 months\n• Full support\n\nTap the Franchise tab or I can connect you with our team!';
    if (t.includes('hello')||t.includes('hi')||t.includes('hey')) return '👋 Hi! How can I help today?';
    return '🤔 I can help with:\n\n🛒 Shopping (PCs, laptops, Build PC)\n📦 Tracking orders\n🎁 Offers & discounts\n🏢 Franchise info\n\nOr tap a quick reply below!';
  };

  const send = (text) => {
    const t = text || input;
    if (!t.trim()) return;
    setMsgs(p => [...p, { from:'user', text: t }]);
    setInput('');
    setTimeout(() => setMsgs(p => [...p, { from:'bot', text: botReply(t) }]), 600);
  };

  return <>
    {!open && <button onClick={() => setOpen(true)} style={{ position:'fixed', bottom:24, right:24, width:60, height:60, borderRadius:30, background:'#25D366', border:'none', cursor:'pointer', boxShadow:'0 6px 20px rgba(37,211,102,.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, zIndex:1000 }}>💬</button>}
    {open && <div style={{ position:'fixed', bottom:24, right:24, width:360, maxHeight:520, borderRadius:20, overflow:'hidden', zIndex:1000, boxShadow:'0 10px 40px rgba(0,0,0,.15)', border:'1px solid #E0E8E0', display:'flex', flexDirection:'column', background:'#fff' }}>
      <div style={{ padding:'14px 18px', background:G, color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:18, background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
          <div><div style={{ fontWeight:700, fontSize:14 }}>{brand.name}</div><div style={{ fontSize:10, opacity:.8 }}>Online · Replies instantly</div></div>
        </div>
        <button onClick={() => setOpen(false)} style={{ color:'#fff', background:'none', border:'none', fontSize:18, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', background:'#F0F4F0', maxHeight:320 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start', marginBottom:8 }}>
            <div style={{ maxWidth:'80%', padding:'10px 14px', borderRadius:m.from==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px', background:m.from==='user'?G:'#fff', color:m.from==='user'?'#fff':'#333', fontSize:13, lineHeight:1.5, whiteSpace:'pre-wrap', boxShadow:m.from==='bot'?'0 1px 4px rgba(0,0,0,.06)':'none' }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:'6px 16px', background:'#fff', display:'flex', gap:4, overflowX:'auto', borderTop:'1px solid #E8F5E9' }}>
        {quickReplies.map(q => <button key={q} onClick={() => send(q)} style={{ padding:'6px 12px', borderRadius:16, background:'#E8F5E9', color:G, fontSize:11, fontWeight:600, border:'none', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>{q}</button>)}
      </div>
      <div style={{ padding:'10px 16px', background:'#fff', display:'flex', gap:8, borderTop:'1px solid #E8F5E9' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Type a message..." style={{ flex:1, padding:'10px 14px', borderRadius:24, background:'#F0F4F0', border:'none', fontSize:13, outline:'none', color:'#333' }} />
        <button onClick={() => send()} style={{ width:40, height:40, borderRadius:20, background:G, color:'#fff', border:'none', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>→</button>
      </div>
      <div style={{ padding:'8px 16px', background:'#F8FAF8', textAlign:'center', borderTop:'1px solid #E8F5E9' }}>
        <button onClick={() => window.open?.('https://wa.me/'+waPhone.replace(/[^0-9]/g,''))} style={{ fontSize:11, color:'#25D366', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>Continue on WhatsApp →</button>
      </div>
    </div>}
  </>;
}
