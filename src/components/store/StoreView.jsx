'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';
import { Badge } from '@/components/shared/Badge';

const TABS = [
  { key:'menu', label:'Menu', icon:'🍽' },
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
    userLocation, setUserLocation, stores, cms, addFranchise
  } = useApp();

  const [tab, setTab] = useState('menu');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [custInfo, setCustInfo] = useState({ name:'', phone:'', email:'', address:'', locality:'', city:'Chennai', state:'Tamil Nadu', pincode:'', landmark:'', type:'delivery', coupon:'' });
  const [locLoading, setLocLoading] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [refCode] = useState(() => 'CM' + Math.random().toString(36).slice(2,6).toUpperCase());
  const [franchiseForm, setFranchiseForm] = useState({ name:'', phone:'', email:'', city:'', investment:'', experience:'', message:'' });
  const [shareOpen, setShareOpen] = useState(false);
  const [catFilter, setCatFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [spotlightEndsAt] = useState(() => Date.now() + 1000 * 60 * 60 * 18);
  const [nowTs, setNowTs] = useState(Date.now());
  const videoCarouselRef = useRef(null);
  const autoLocationTriedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

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

  const detectLocation = ({ silent = false } = {}) => {
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
          if (nearest) {
            setSelectedStore(nearest.id);
            if (!silent) show('📍 ' + nearest.name + ' (' + minDist.toFixed(1) + ' km)');
          }
          setLocLoading(false);
        },
        () => { if (!silent) show('Location denied', 'error'); setLocLoading(false); }
      );
    } else { setLocLoading(false); }
  };

  useEffect(() => {
    if (autoLocationTriedRef.current) return;
    autoLocationTriedRef.current = true;
    if (!userLocation) detectLocation({ silent: true });
  }, [userLocation]);

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
    const txt = 'Order from Charminar Mehfil – ₹' + (settings.VIRAL_REFERRAL_FRIEND||100) + ' OFF with code: ' + refCode + ' 🍗';
    if (p === 'whatsapp') window.open?.('https://wa.me/?text=' + encodeURIComponent(txt));
    else if (p === 'copy') { navigator.clipboard?.writeText(refCode); show('Copied!'); }
    setShareOpen(false);
  };

  const categories = useMemo(() => ['all', ...new Set(availableProducts.map(p => p.category || 'Main'))], [availableProducts]);
  const filteredProducts = useMemo(() => {
    let list = catFilter === 'all'
      ? availableProducts
      : availableProducts.filter(p => p.category === catFilter);

    if (vegOnly) {
      list = list.filter(p => !!p.isVeg || /veg/i.test(p.name));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const category = (p.category || '').toLowerCase();
        return name.includes(q) || category.includes(q);
      });
    }

    if (sortBy === 'price_asc') list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortBy === 'popular') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));

    return list;
  }, [availableProducts, catFilter, vegOnly, searchQuery, sortBy]);
  const activeOffers = offers.filter(o => o.active);
  const waPhone = partnerValues.WA_PHONE_NUMBER_ID || settings.SUPPORT_PHONE || '+91 98765 43210';
  const quickReorderItems = useMemo(() => {
    const latest = customerOrders?.[0];
    if (!latest?.items?.length) return [];
    return latest.items.slice(0, 3);
  }, [customerOrders]);
  const spotlightSeconds = Math.max(0, Math.floor((spotlightEndsAt - nowTs) / 1000));
  const spotlightH = Math.floor(spotlightSeconds / 3600);
  const spotlightM = Math.floor((spotlightSeconds % 3600) / 60);
  const spotlightS = spotlightSeconds % 60;
  const instagramFeed = cms?.instagramFeed || { active:false, posts:[] };
  const instagramPosts = (instagramFeed.posts || []).filter(p => p.active).slice(0, instagramFeed.maxItems || 8);
  const instagramVideoPosts = instagramPosts.filter(p => p.mediaType === 'video');
  const shouldUseVideoCarousel = instagramVideoPosts.length > 1;

  const toInstagramEmbedUrl = (url) => {
    if (!url) return '';
    const clean = url.trim().replace(/\?.*$/, '').replace(/\/$/, '');
    if (clean.endsWith('/embed')) return clean;
    return clean + '/embed';
  };

  const scrollVideoCarousel = (dir) => {
    if (!videoCarouselRef.current) return;
    videoCarouselRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  // ═══ DESIGN TOKENS — Green + White from logo ═══
  const G = '#1B5E20', GL = '#2E7D32', GM = '#E8F5E9', GD = '#0D3B12';
  const SH = brand.storeHeading, SD = brand.storeDim, ST = brand.storeText, SB = brand.storeBorder;
  const trustBadges = [
    '4.8/5 Guest Rating',
    '60-Min Delivery Promise',
    'HACCP-Compliant Kitchen',
    'Secure Payments',
    'Fresh Batch Every Service',
  ];
  const curatedCollections = [
    { key:'biryani', label:'Signature Biryanis', desc:'Award-winning classics' },
    { key:'starters', label:'Starter Favorites', desc:'Kebabs, 65s, and grills' },
    { key:'desserts', label:'Dessert Studio', desc:'Sweet finishers' },
  ];
  const testimonials = [
    { name:'Aarti V.', text:'Consistent quality, premium packaging, and delivery always on point.' },
    { name:'Naveen R.', text:'The ordering experience feels world-class and super smooth.' },
    { name:'Shazia K.', text:'Best biryani presentation and taste combo in the city.' },
  ];

  const inp = { width:'100%', padding:'13px 16px', borderRadius:12, background:'#fff', border:'1.5px solid '+SB, color:SH, fontSize:14, outline:'none', fontFamily:"'Figtree',sans-serif", transition:'border .2s', boxSizing:'border-box' };
  const greenBtn = { padding:'14px 28px', borderRadius:12, background:G, color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' };
  const card = { background:'#fff', border:'1px solid '+SB, borderRadius:16, boxShadow:'0 1px 6px rgba(27,94,32,.05)' };

  return (
    <div style={{ maxWidth:960, margin:'0 auto', padding:'0 16px 80px', background:'#fff' }}>

      {/* ═══ HERO ═══ */}
      <div style={{ position:'relative', borderRadius:24, marginBottom:28, overflow:'hidden', background:'linear-gradient(150deg, '+GD+' 0%, '+G+' 45%, '+GL+' 100%)', padding:'48px 36px 44px', animation:'fadeIn .5s ease' }}>
        <div style={{ position:'absolute', top:-50, right:-30, width:160, height:160, borderRadius:'50%', border:'1px solid rgba(255,255,255,.07)' }} />
        <div style={{ position:'absolute', bottom:-30, left:80, width:100, height:100, borderRadius:'50%', border:'1px solid rgba(255,255,255,.05)' }} />

        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ADE80', boxShadow:'0 0 10px #4ADE80' }} />
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.22em', textTransform:'uppercase', color:'#A5D6A7' }}>Live · {activeStores.length} Locations in Chennai</span>
        </div>

        <h1 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(34px,7vw,54px)', color:'#fff', lineHeight:1, marginBottom:6 }}>
          Charminar{' '}<span style={{ color:brand.gold }}>Mehfil</span>
        </h1>
        <p style={{ fontFamily:brand.fontDisplay, fontSize:17, color:'#C8E6C9', fontStyle:'italic', marginBottom:24, letterSpacing:'.01em' }}>The Real Taste of Hyderabad</p>

        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <button onClick={detectLocation} disabled={locLoading} style={{ display:'flex', alignItems:'center', gap:6, padding:'11px 22px', borderRadius:12, background:'rgba(255,255,255,.14)', backdropFilter:'blur(10px)', border:'1px solid rgba(255,255,255,.18)', color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer' }}>
            {locLoading ? '⏳ Detecting...' : '📍 Find Nearest Store'}
          </button>
          {currentStore && <span style={{ padding:'11px 18px', borderRadius:12, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.14)', color:'#E8F5E9', fontSize:12, fontWeight:600 }}>✓ {currentStore.name}</span>}
        </div>
      </div>

      {/* ═══ PREMIUM TRUST STRIP ═══ */}
      <div style={{ ...card, marginBottom:16, padding:'12px 16px', display:'flex', gap:8, overflowX:'auto', background:'#FCFDFC' }}>
        {trustBadges.map((b) => (
          <span key={b} style={{ fontSize:11, color:SH, padding:'6px 12px', borderRadius:20, background:GM, border:'1px solid #D5E8D6', whiteSpace:'nowrap', fontWeight:600 }}>
            ✓ {b}
          </span>
        ))}
      </div>

      {/* ═══ PREMIUM SPOTLIGHT PANEL ═══ */}
      <div style={{ ...card, marginBottom:20, padding:0, overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(120deg,#F6FBF6,#FFFFFF)', padding:'16px 18px', display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:12 }}>
          <div>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.18em', color:G, marginBottom:6 }}>LIMITED SPOTLIGHT</div>
            <h3 style={{ margin:0, fontFamily:brand.fontDisplay, fontSize:24, color:SH }}>Chef's Royal Feast Week</h3>
            <p style={{ margin:'6px 0 10px', fontSize:12, color:SD }}>Premium tasting combos, curated sides, and exclusive finishing desserts.</p>
            <button onClick={() => setTab('offers')} style={{ padding:'9px 16px', borderRadius:10, background:G, color:'#fff', border:'none', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              View Premium Offers →
            </button>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', border:'1px solid '+SB, borderRadius:12, padding:'12px 14px' }}>
            {[['H',spotlightH],['M',spotlightM],['S',spotlightS]].map(([k,v]) => (
              <div key={k} style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontFamily:brand.fontDisplay, fontSize:26, fontWeight:700, color:G }}>{String(v).padStart(2,'0')}</div>
                <div style={{ fontSize:9, color:SD, fontWeight:700, letterSpacing:'.12em' }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ NAV ═══ */}
      <div style={{ display:'flex', gap:3, marginBottom:28, background:'#F0F4F0', borderRadius:14, padding:4 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ display:'flex', alignItems:'center', gap:6, padding:'11px 18px', borderRadius:10, fontSize:13, fontWeight:700, border:'none', flex:1, justifyContent:'center', transition:'all .15s', background:tab===t.key?'#fff':'transparent', color:tab===t.key?G:SD, boxShadow:tab===t.key?'0 1px 6px rgba(27,94,32,.08)':'none' }}>
            <span>{t.icon}</span>{t.label}
            {t.key==='offers' && activeOffers.length>0 && <span style={{ width:18, height:18, borderRadius:'50%', background:brand.red, color:'#fff', fontSize:9, fontWeight:800, display:'inline-flex', alignItems:'center', justifyContent:'center' }}>{activeOffers.length}</span>}
          </button>
        ))}
      </div>

      {/* ═══ MENU ═══ */}
      {tab==='menu' && <>
        {/* Premium command bar */}
        <div style={{ ...card, padding:14, marginBottom:16, display:'grid', gridTemplateColumns:'1.3fr auto auto auto', gap:8, alignItems:'center' }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dishes, categories, or specials..."
            style={{ ...inp, margin:0, padding:'11px 14px' }}
          />
          <button onClick={() => setVegOnly(v => !v)} style={{ padding:'10px 12px', borderRadius:10, border:'1px solid '+(vegOnly ? '#8CD28E' : SB), background:vegOnly ? GM : '#fff', color:vegOnly ? G : SD, fontSize:11, fontWeight:700, cursor:'pointer' }}>
            {vegOnly ? '🥬 Veg Only' : 'Veg'}
          </button>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding:'10px 12px', borderRadius:10, border:'1px solid '+SB, background:'#fff', color:SH, fontSize:11, fontWeight:600 }}>
            <option value="recommended">Recommended</option>
            <option value="popular">Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button onClick={() => setTab('track')} style={{ padding:'10px 12px', borderRadius:10, border:'1px solid '+SB, background:'#fff', color:SH, fontSize:11, fontWeight:700, cursor:'pointer' }}>
            Quick Track
          </button>
        </div>

        {/* Curated collections */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:G, marginBottom:8 }}>✨ Curated Collections</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:8 }}>
            {curatedCollections.map((c) => (
              <button key={c.key} onClick={() => setCatFilter(c.key)} style={{ ...card, textAlign:'left', padding:'14px 16px', cursor:'pointer', border:'1px solid '+SB }}>
                <div style={{ fontWeight:700, color:SH, fontSize:13, marginBottom:4 }}>{c.label}</div>
                <div style={{ fontSize:11, color:SD }}>{c.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick reorder */}
        {quickReorderItems.length > 0 && (
          <div style={{ ...card, padding:14, marginBottom:16 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:G, marginBottom:8 }}>⚡ Reorder in One Tap</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {quickReorderItems.map((i) => (
                <button key={i.name} onClick={() => {
                  const product = availableProducts.find((p) => p.name === i.name);
                  if (product) {
                    addToCart(product);
                    show('Added ' + product.name);
                  }
                }} style={{ padding:'8px 12px', borderRadius:18, border:'1px solid '+SB, background:'#fff', color:SH, fontSize:11, fontWeight:600, cursor:'pointer' }}>
                  + {i.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Store selector */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:G, marginBottom:12 }}>📍 Choose Store</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:10 }}>
            {activeStores.map(st => (
              <button key={st.id} onClick={() => setSelectedStore(st.id)} style={{ textAlign:'left', padding:18, borderRadius:14, border: selectedStore===st.id ? '2px solid '+G : '1px solid '+SB, width:'100%', background: selectedStore===st.id ? GM : '#fff', color:ST, cursor:'pointer', transition:'all .15s', boxShadow: selectedStore===st.id ? '0 2px 12px rgba(27,94,32,.08)' : '0 1px 4px rgba(0,0,0,.03)' }}>
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
          <div style={{ textAlign:'center', padding:'8px 16px', background:'#fff', borderRadius:12, border:'1px solid #C8E6C9' }}>
            <div style={{ fontFamily:brand.fontDisplay, fontSize:22, fontWeight:700, color:G }}>{currentStore.prepTime}min</div>
            <div style={{ fontSize:8, color:SD, letterSpacing:'.1em', fontWeight:700 }}>PREP TIME</div>
          </div>
        </div>}

        {/* Offers strip */}
        {activeOffers.length > 0 && <div style={{ marginBottom:24, display:'flex', gap:10, overflowX:'auto', paddingBottom:6 }}>
          {activeOffers.slice(0,5).map(o => (
            <div key={o.id} onClick={() => { setCustInfo(p=>({...p,coupon:o.code})); setAppliedOffer(o); show('🎉 '+o.code+' applied!'); }}
              style={{ flexShrink:0, width:230, padding:'16px 18px', borderRadius:14, border:'1px solid '+SB, background:'#fff', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,.03)' }}>
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
            {shareOpen && <div style={{ position:'absolute', top:'100%', right:0, zIndex:50, background:'#fff', border:'1px solid '+SB, borderRadius:12, padding:10, display:'flex', gap:6, marginTop:4, boxShadow:'0 10px 40px rgba(0,0,0,.1)' }}>
              <button onClick={() => shareReferral('whatsapp')} style={{ padding:'7px 14px', borderRadius:8, background:'#25D366', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>WhatsApp</button>
              <button onClick={() => shareReferral('copy')} style={{ padding:'7px 14px', borderRadius:8, background:G, color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>Copy</button>
            </div>}
          </div>}
        </div>

        {/* Category filter */}
        <div style={{ display:'flex', gap:6, marginBottom:18, overflowX:'auto', paddingBottom:4 }}>
          {categories.map(c => <button key={c} onClick={() => setCatFilter(c)} style={{ padding:'8px 20px', borderRadius:24, fontSize:12, fontWeight:600, border:'1px solid '+(catFilter===c?G:SB), background:catFilter===c?G:'#fff', color:catFilter===c?'#fff':ST, cursor:'pointer', whiteSpace:'nowrap', flexShrink:0, transition:'all .15s' }}>{c==='all'?'🍽 All':c}</button>)}
        </div>

        {/* Products grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:14, marginBottom:28 }}>
          {filteredProducts.map(p => (
            <div key={p.id} style={{ ...card, padding:18, opacity:p.available?1:.4, position:'relative' }}>
              {p.tag && <span style={{ position:'absolute', top:12, right:12, fontSize:8, padding:'3px 10px', borderRadius:6, background:G, color:'#fff', fontWeight:800 }}>{p.tag}</span>}
              <div style={{ fontWeight:700, color:SH, fontSize:15, marginBottom:4 }}>{p.name}</div>
              {p.category && <div style={{ fontSize:10, color:SD, marginBottom:10 }}>{p.category}</div>}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontFamily:brand.fontDisplay, fontSize:22, fontWeight:700, color:G }}>{fmt(p.price)}</span>
                {p.available ? <button onClick={() => addToCart(p)} style={{ padding:'8px 18px', borderRadius:10, background:G, color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', border:'none' }}>+ Add</button>
                : <span style={{ fontSize:10, color:brand.red, fontWeight:600 }}>Sold Out</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Premium social proof */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:G, marginBottom:10 }}>🌍 Global Quality Signals</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10, marginBottom:12 }}>
            <div style={{ ...card, padding:'14px 16px' }}><div style={{ fontSize:11, color:SD }}>Avg Rating</div><div style={{ fontFamily:brand.fontDisplay, fontSize:28, color:SH }}>4.8</div></div>
            <div style={{ ...card, padding:'14px 16px' }}><div style={{ fontSize:11, color:SD }}>On-Time Deliveries</div><div style={{ fontFamily:brand.fontDisplay, fontSize:28, color:SH }}>97%</div></div>
            <div style={{ ...card, padding:'14px 16px' }}><div style={{ fontSize:11, color:SD }}>Repeat Guests</div><div style={{ fontFamily:brand.fontDisplay, fontSize:28, color:SH }}>71%</div></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{ ...card, padding:'14px 16px' }}>
                <div style={{ fontSize:12, color:SH, marginBottom:8, lineHeight:1.5 }}>"{t.text}"</div>
                <div style={{ fontSize:11, fontWeight:700, color:G }}>{t.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Cart ═══ */}
        {cart.length > 0 && <div style={{ ...card, padding:26, marginBottom:28, border:'2px solid '+G+'18' }}>
          <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, color:SH, fontSize:20, marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ width:36, height:36, borderRadius:10, background:GM, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🛒</span>
            Your Order <span style={{ fontSize:13, fontWeight:500, color:SD }}>({cart.reduce((a,i)=>a+i.qty,0)} items)</span>
          </div>
          {cart.map(i => (
            <div key={i.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #F0F4F0' }}>
              <span style={{ color:SH, fontSize:14, fontWeight:500 }}>{i.name}</span>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={() => updateCartQty(i.id,i.qty-1)} style={{ width:28, height:28, borderRadius:8, background:'#F0F4F0', color:SH, border:'1px solid '+SB, fontWeight:700, cursor:'pointer', fontSize:14 }}>−</button>
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
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:20, marginTop:12, paddingTop:12, borderTop:'2px solid #E0E8E0' }}>
              <span style={{ color:SH }}>Total</span>
              <span style={{ color:G }}>{fmt(grandTotal)}</span>
            </div>
          </div>
          {!checkoutOpen ? (
            <button onClick={openCheckout} style={{ ...greenBtn, width:'100%', marginTop:16, fontSize:16, padding:15 }}>🛒 Checkout · {fmt(grandTotal)}</button>
          ) : (
            <div style={{ marginTop:18, padding:22, background:'#F8FAF8', borderRadius:14, border:'1px solid '+SB }}>
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
        {customer && customerOrders.length === 0 && <div style={{ textAlign:'center', padding:'50px 20px' }}><div style={{ fontSize:48, marginBottom:12 }}>📦</div><h3 style={{ fontFamily:brand.fontDisplay, color:SH }}>No orders yet</h3><button onClick={() => setTab('menu')} style={{ ...greenBtn, marginTop:14 }}>Browse Menu</button></div>}
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
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:30, color:'#fff', marginBottom:8 }}>Own a Charminar Mehfil</h2>
          <p style={{ fontSize:14, color:'#C8E6C9', maxWidth:500, margin:'0 auto 22px' }}>₹{settings.FRANCHISE_MIN_INVESTMENT||15}L – ₹{settings.FRANCHISE_MAX_INVESTMENT||35}L investment</p>
          <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
            {[{ l:'Investment', v:'₹'+(settings.FRANCHISE_MIN_INVESTMENT||15)+'-'+(settings.FRANCHISE_MAX_INVESTMENT||35)+'L' },{ l:'Royalty', v:(settings.FRANCHISE_DEFAULT_ROYALTY||12)+'%' },{ l:'Locations', v:activeStores.length+'+' },{ l:'ROI', v:'18-24mo' }].map(s2 => (
              <div key={s2.l}><div style={{ fontFamily:brand.fontDisplay, fontSize:24, fontWeight:700, color:brand.gold }}>{s2.v}</div><div style={{ fontSize:10, color:'#A5D6A7', letterSpacing:'.1em' }}>{s2.l}</div></div>
            ))}
          </div>
        </div>

        <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', color:G, marginBottom:12 }}>✨ WHY CHARMINAR MEHFIL</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:10, marginBottom:24 }}>
          {[{i:'🍗',t:'Proven Menu',d:'Signature biryani & kebabs loved across Chennai'},{i:'📦',t:'Full Support',d:'Kitchen, training, ops, marketing'},{i:'💻',t:'Tech Platform',d:'POS, OMS, delivery, WhatsApp — included'},{i:'📈',t:'High Margins',d:'60%+ gross, optimized supply chain'},{i:'🎯',t:'Marketing',d:'Viral engine, social, SEO done for you'},{i:'🤝',t:'Community',d:'Network of franchise owners'}].map(f => (
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
            <option value="">F&B Experience</option><option value="none">None</option><option value="1-3">1-3 years</option><option value="3+">3+ years</option>
          </select>
          <textarea placeholder="Tell us about yourself..." value={franchiseForm.message} onChange={e => setFranchiseForm(p=>({...p,message:e.target.value}))} rows={3} style={{ ...inp, marginBottom:14, resize:'vertical' }} />
          <button onClick={() => { if(!franchiseForm.name||!franchiseForm.phone) return show('Fill name & phone','error'); addFranchise({ name: franchiseForm.name, owner: franchiseForm.phone, phone: franchiseForm.phone, city: franchiseForm.city, investment: franchiseForm.investment, email: franchiseForm.email, status: 'inquiry' }); show('✅ Inquiry submitted!'); setFranchiseForm({name:'',phone:'',email:'',city:'',investment:'',experience:'',message:''}); }} style={{ ...greenBtn, width:'100%' }}>🏢 Submit Franchise Inquiry</button>
        </div>
      </div>}

      {/* ═══ FOLLOW US (BOTTOM) ═══ */}
      {instagramFeed.active && instagramPosts.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:G, marginBottom:6 }}>📸 FOLLOW US</div>
              <h3 style={{ fontFamily:brand.fontDisplay, fontSize:24, color:SH, margin:0 }}>
                {instagramFeed.title || 'Follow Us on Instagram'}
              </h3>
              {instagramFeed.subtitle && <p style={{ fontSize:12, color:SD, margin:'6px 0 0' }}>{instagramFeed.subtitle}</p>}
            </div>
            {shouldUseVideoCarousel && (
              <div style={{ display:'flex', gap:6 }}>
                <button onClick={() => scrollVideoCarousel(-1)} style={{ width:32, height:32, borderRadius:8, border:'1px solid '+SB, background:'#fff', color:SH, cursor:'pointer' }}>←</button>
                <button onClick={() => scrollVideoCarousel(1)} style={{ width:32, height:32, borderRadius:8, border:'1px solid '+SB, background:'#fff', color:SH, cursor:'pointer' }}>→</button>
              </div>
            )}
          </div>

          {shouldUseVideoCarousel ? (
            <div ref={videoCarouselRef} style={{ display:'flex', gap:12, overflowX:'auto', scrollSnapType:'x mandatory', paddingBottom:6 }}>
              {instagramVideoPosts.map((post) => (
                <div key={post.id} style={{ ...card, flex:'0 0 320px', scrollSnapAlign:'start', overflow:'hidden' }}>
                  <iframe
                    src={toInstagramEmbedUrl(post.url)}
                    title={post.caption || post.id}
                    width="100%"
                    height="420"
                    style={{ border:'none' }}
                    loading="lazy"
                    allowTransparency
                  />
                  {post.caption && <div style={{ fontSize:11, color:SD, padding:'10px 12px' }}>{post.caption}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
              {instagramPosts.map((post) => (
                <div key={post.id} style={{ ...card, overflow:'hidden' }}>
                  <iframe
                    src={toInstagramEmbedUrl(post.url)}
                    title={post.caption || post.id}
                    width="100%"
                    height="420"
                    style={{ border:'none' }}
                    loading="lazy"
                    allowTransparency
                  />
                  {post.caption && <div style={{ fontSize:11, color:SD, padding:'10px 12px' }}>{post.caption}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Premium sticky quick actions */}
      <div style={{ position:'fixed', left:'50%', transform:'translateX(-50%)', bottom:14, zIndex:900, background:'#ffffffee', backdropFilter:'blur(8px)', border:'1px solid '+SB, borderRadius:16, padding:'6px', display:'flex', gap:6, boxShadow:'0 8px 30px rgba(0,0,0,.08)' }}>
        <button onClick={() => setTab('menu')} style={{ padding:'8px 12px', borderRadius:10, border:'none', background:tab==='menu'?GM:'transparent', color:tab==='menu'?G:SD, fontSize:11, fontWeight:700, cursor:'pointer' }}>🍽 Menu</button>
        <button onClick={() => setTab('offers')} style={{ padding:'8px 12px', borderRadius:10, border:'none', background:tab==='offers'?GM:'transparent', color:tab==='offers'?G:SD, fontSize:11, fontWeight:700, cursor:'pointer' }}>🎁 Offers</button>
        <button onClick={() => setTab('track')} style={{ padding:'8px 12px', borderRadius:10, border:'none', background:tab==='track'?GM:'transparent', color:tab==='track'?G:SD, fontSize:11, fontWeight:700, cursor:'pointer' }}>📦 Track</button>
      </div>

      {/* ═══ WHATSAPP CHATBOT WIDGET ═══ */}
      <ChatBotWidget waPhone={waPhone} show={show} />
    </div>
  );
}

function ChatBotWidget({ waPhone, show }) {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from:'bot', text:'👋 Welcome to Charminar Mehfil! I can help you with:\n\n🍗 Order food\n📦 Track order\n🎁 View offers\n🏢 Franchise info\n\nJust type or tap below!' }
  ]);
  const [input, setInput] = useState('');
  const G = '#1B5E20';

  const quickReplies = ['🍽 Menu','📦 Track Order','🎁 Offers','🏢 Franchise'];

  const botReply = (text) => {
    const t = text.toLowerCase();
    if (t.includes('menu')||t.includes('order')||t.includes('food')||t.includes('biryani')) return '🍗 Our bestsellers:\n\n• Hyderabadi Dum Biryani — ₹349\n• Haleem (seasonal) — ₹249\n• Kebab Platter — ₹449\n• Irani Chai — ₹49\n\nWould you like to place an order? Tap the menu tab above!';
    if (t.includes('track')||t.includes('status')||t.includes('where')) return '📦 To track your order, share your Order ID (e.g. ORD-7X2). You can also check the Orders tab above!';
    if (t.includes('offer')||t.includes('deal')||t.includes('discount')||t.includes('coupon')) return '🎁 Active offers:\n\n• WELCOME20 — 20% off first order\n• BIRYANI50 — ₹50 off biryani\n• FAMILY200 — ₹200 off 4+ biryanis\n\nApply at checkout!';
    if (t.includes('franchise')||t.includes('own')||t.includes('invest')) return '🏢 Franchise details:\n\n• Investment: ₹15-35L\n• ROI: 18-24 months\n• Full support\n\nTap the Franchise tab or I can connect you with our team!';
    if (t.includes('hello')||t.includes('hi')||t.includes('hey')) return '👋 Vanakkam! How can I help today?';
    return '🤔 I can help with:\n\n🍽 Ordering food\n📦 Tracking orders\n🎁 Offers & discounts\n🏢 Franchise info\n\nOr tap a quick reply below!';
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
          <div><div style={{ fontWeight:700, fontSize:14 }}>Charminar Mehfil</div><div style={{ fontSize:10, opacity:.8 }}>Online · Replies instantly</div></div>
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
