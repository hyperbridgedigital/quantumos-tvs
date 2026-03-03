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
    let list = catFilter === 'all' ? availableProducts : availableProducts.filter(p => p.category === catFilter);
    if (vegOnly) list = list.filter(p => !!p.isVeg || /veg/i.test(p.name));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p => (p.name||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q));
    }
    if (sortBy === 'price_asc') list = [...list].sort((a, b) => (a.price||0) - (b.price||0));
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => (b.price||0) - (a.price||0));
    else if (sortBy === 'popular') list = [...list].sort((a, b) => (b.rating||0) - (a.rating||0));
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
    return clean.endsWith('/embed') ? clean : clean + '/embed';
  };
  const scrollVideoCarousel = (dir) => {
    if (!videoCarouselRef.current) return;
    videoCarouselRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  // Design tokens
  const G = '#1B5E20', GL = '#2E7D32', GD = '#0A110A';
  const GOLD = '#C9A84C';
  const SH = brand.storeHeading, SD = brand.storeDim, ST = brand.storeText, SB = brand.storeBorder;
  const trustBadges = ['4.8/5 Guest Rating','60-Min Delivery Promise','HACCP Kitchen Certified','3 Chennai Locations','Fresh Batch Every Service'];
  const curatedCollections = [
    { key:'biryani', label:'Signature Biryanis', desc:'Award-winning dum classics' },
    { key:'starters', label:'Starter Favorites', desc:'Kebabs, 65s & grills' },
    { key:'desserts', label:'Dessert Studio', desc:'Sweet finishers' },
  ];
  const testimonials = [
    { name:'Aarti V.', text:'Consistent quality, premium packaging, and delivery always on point.' },
    { name:'Naveen R.', text:'The ordering experience feels world-class and super smooth.' },
    { name:'Shazia K.', text:'Best biryani presentation and taste combo in the city.' },
  ];
  const inp = { width:'100%', padding:'13px 16px', borderRadius:12, background:'#fff', border:'1.5px solid '+SB, color:SH, fontSize:14, outline:'none', fontFamily:"'Figtree',sans-serif", transition:'border .2s', boxSizing:'border-box' };

  return (
    <div style={{ background:'#FFFDF7', overflowX:'hidden' }}>

      {/* ═══ CINEMATIC HERO — full-bleed ═══ */}
      <div style={{ position:'relative', minHeight:'88vh', display:'flex', alignItems:'center', overflow:'hidden', background:'linear-gradient(155deg,#050E05 0%,#0A1A0A 20%,#1B5E20 55%,#2E7D32 82%,#388E3C 100%)' }}>
        {/* Decorative orbs */}
        <div style={{ position:'absolute', top:'-15%', right:'-8%', width:'min(600px,80vw)', height:'min(600px,80vw)', borderRadius:'50%', background:'radial-gradient(circle,rgba(201,168,76,.15) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:'-20%', left:'-10%', width:'min(500px,70vw)', height:'min(500px,70vw)', borderRadius:'50%', background:'radial-gradient(circle,rgba(27,94,32,.45) 0%,transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'35%', right:'18%', width:280, height:280, borderRadius:'50%', border:'1px solid rgba(201,168,76,.12)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'15%', left:'5%', width:140, height:140, borderRadius:'50%', border:'1px solid rgba(255,255,255,.06)', pointerEvents:'none' }} />

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'88px 28px 72px', width:'100%', position:'relative', zIndex:1 }}>
          {/* Live badge */}
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,.07)', border:'1px solid rgba(255,255,255,.14)', borderRadius:24, padding:'6px 16px', marginBottom:32 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ADE80', boxShadow:'0 0 8px #4ADE80', display:'inline-block', animation:'pulse 2s infinite' }} />
            <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.22em', textTransform:'uppercase', color:'#A5D6A7' }}>Live · {activeStores.length} Locations in Chennai</span>
          </div>

          {/* Main headline */}
          <h1 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(52px,9vw,92px)', color:'#fff', lineHeight:.98, letterSpacing:'-0.03em', marginBottom:22, fontWeight:900 }}>
            The Real<br/>Taste of<br/><span style={{ color:GOLD, fontStyle:'italic' }}>Hyderabad</span>
          </h1>
          <p style={{ fontSize:'clamp(14px,1.8vw,18px)', color:'rgba(255,255,255,.65)', marginBottom:36, maxWidth:480, lineHeight:1.65 }}>
            Dum-sealed Hyderabadi biryani · Brought to Chennai&apos;s finest tables since our founding
          </p>

          {/* CTAs */}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            <button onClick={() => { document.getElementById('menu-anchor')?.scrollIntoView({ behavior:'smooth' }); }} style={{ padding:'16px 32px', borderRadius:12, background:GOLD, color:GD, fontSize:14, fontWeight:800, border:'none', cursor:'pointer', letterSpacing:'.03em', boxShadow:'0 8px 28px rgba(201,168,76,.4)' }}>
              Explore Menu →
            </button>
            <button onClick={() => detectLocation()} disabled={locLoading} style={{ padding:'16px 24px', borderRadius:12, background:'rgba(255,255,255,.1)', border:'1.5px solid rgba(255,255,255,.25)', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', backdropFilter:'blur(12px)' }}>
              {locLoading ? '⏳ Detecting...' : '📍 Find Nearest Store'}
            </button>
            {currentStore && (
              <span style={{ padding:'12px 18px', borderRadius:12, background:'rgba(201,168,76,.12)', border:'1px solid rgba(201,168,76,.28)', color:'#E8D49C', fontSize:12, fontWeight:700 }}>
                ✓ {currentStore.name}
              </span>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display:'flex', gap:clamp(20,4,40), marginTop:56, flexWrap:'wrap' }}>
            {[['4.8★','Guest Rating'],['60min','Delivery Promise'],['3','Chennai Locations'],['97%','On-Time Rate']].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(24px,4vw,36px)', fontWeight:900, color:GOLD, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:10, color:'rgba(255,255,255,.45)', letterSpacing:'.14em', textTransform:'uppercase', marginTop:5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom fade into cream */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:100, background:'linear-gradient(to bottom,transparent,#FFFDF7)', pointerEvents:'none' }} />
      </div>

      {/* ═══ TRUST STRIP — full-bleed dark green ═══ */}
      <div style={{ background:G, padding:'15px 0', overflowX:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', minWidth:'max-content', padding:'0 28px' }}>
          {[...trustBadges, ...trustBadges].map((b,i) => (
            <span key={i} style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'0 22px', color:'#C8E6C9', fontSize:11, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', borderRight:'1px solid rgba(255,255,255,.15)', whiteSpace:'nowrap' }}>
              <span style={{ color:GOLD, fontSize:12 }}>✦</span> {b}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ HERITAGE STORY ═══ */}
      <div style={{ background:'#FFFDF7', padding:'80px 28px' }}>
        <div style={{ maxWidth:1200, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:56 }}>
            <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.28em', textTransform:'uppercase', color:GOLD }}>OUR STORY</span>
            <h2 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(30px,5vw,52px)', color:'#1A1A1A', marginTop:14, lineHeight:1.1, letterSpacing:'-0.02em' }}>
              Two decades perfecting<br/>the art of Dum
            </h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:28 }}>
            {[
              { icon:'🏺', title:'Authentic Dum Process', desc:'Sealed in Handi. Slow-cooked over dum for minimum 2 hours. The same recipe, unchanged since founding.' },
              { icon:'🌿', title:'HACCP-Certified Kitchen', desc:'International food safety standards. Fresh batch every service. Zero compromise on quality — ever.' },
              { icon:'🤝', title:"Chennai's Own", desc:'Born in the heart of the city. 3 locations, one unwavering promise: the real taste of Hyderabad.' },
            ].map(h => (
              <div key={h.title} style={{ textAlign:'center', padding:'36px 28px', background:'#fff', borderRadius:24, border:'1px solid #E8EFE8', boxShadow:'0 6px 28px rgba(27,94,32,.06)', transition:'box-shadow .2s' }}>
                <div style={{ fontSize:48, marginBottom:18 }}>{h.icon}</div>
                <h3 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:'#1A1A1A', marginBottom:14 }}>{h.title}</h3>
                <p style={{ fontSize:14, color:'#6A7868', lineHeight:1.75, margin:0 }}>{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div id="menu-anchor" style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 120px' }}>

        {/* STORE SELECTOR */}
        <div style={{ marginBottom:44 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <span style={{ width:9, height:9, borderRadius:'50%', background:'#4ADE80', boxShadow:'0 0 8px #4ADE80', display:'inline-block' }} />
            <span style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:G }}>Choose Your Store</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:16 }}>
            {activeStores.map(st => {
              const isSel = selectedStore === st.id;
              let dist = '';
              if (userLocation && st.lat && st.lng) {
                const d = Math.sqrt((st.lat - userLocation.lat)**2 + (st.lng - userLocation.lng)**2) * 111;
                dist = d.toFixed(1) + ' km';
              }
              return (
                <button key={st.id} onClick={() => setSelectedStore(st.id)} style={{ textAlign:'left', padding:22, borderRadius:18, border:isSel?'2px solid '+GOLD:'2px solid transparent', background:'#fff', boxShadow:isSel?'0 8px 28px rgba(201,168,76,.18)':'0 2px 14px rgba(0,0,0,.06)', cursor:'pointer', transition:'all .2s', outline:'none', position:'relative', overflow:'hidden' }}>
                  {isSel && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,'+G+','+GOLD+')' }} />}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, color:'#1A1A1A', fontSize:17 }}>{st.name}</div>
                    {dist && <span style={{ fontSize:10, padding:'3px 10px', borderRadius:10, background:'#E8F5E9', color:G, fontWeight:800 }}>{dist}</span>}
                  </div>
                  <div style={{ fontSize:12, color:'#8A9488', marginBottom:14, lineHeight:1.5 }}>{(st.address||'').slice(0,62)}</div>
                  <div style={{ display:'flex', gap:16, fontSize:12 }}>
                    <span style={{ color:G, fontWeight:700 }}>⚡ {st.prepTime}min</span>
                    <span style={{ color:GOLD, fontWeight:700 }}>⭐ {st.rating}</span>
                    <span style={{ color:'#8A9488' }}>{(st.hours||'').split(' - ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SPOTLIGHT */}
        {activeOffers.length > 0 && (
          <div style={{ marginBottom:36, borderRadius:22, overflow:'hidden', background:'linear-gradient(135deg,'+GD+','+G+')', padding:'30px 32px', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.22em', color:GOLD, marginBottom:8 }}>⚡ LIMITED TIME</div>
              <h3 style={{ fontFamily:brand.fontDisplay, fontSize:26, color:'#fff', margin:'0 0 8px' }}>{"Chef's Royal Feast Week"}</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.6)', margin:'0 0 16px' }}>Premium tasting combos & exclusive finishing desserts</p>
              <button onClick={() => setTab('offers')} style={{ padding:'11px 22px', borderRadius:10, background:GOLD, color:GD, fontWeight:800, fontSize:13, border:'none', cursor:'pointer' }}>View Offers →</button>
            </div>
            <div style={{ display:'flex', gap:10, background:'rgba(255,255,255,.07)', borderRadius:16, padding:'16px 22px', backdropFilter:'blur(10px)' }}>
              {[['H',spotlightH],['M',spotlightM],['S',spotlightS]].map(([k,v]) => (
                <div key={k} style={{ textAlign:'center', minWidth:44 }}>
                  <div style={{ fontFamily:brand.fontDisplay, fontSize:34, fontWeight:900, color:GOLD, lineHeight:1 }}>{String(v).padStart(2,'0')}</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,.45)', fontWeight:700, letterSpacing:'.12em', marginTop:5 }}>{k}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NAV TABS — sticky */}
        <div style={{ position:'sticky', top:54, zIndex:90, background:'#FFFDF7', paddingTop:14, paddingBottom:14, marginBottom:32, borderBottom:'1px solid #E8EFE8', marginLeft:-24, marginRight:-24, paddingLeft:24, paddingRight:24 }}>
          <div style={{ display:'flex', gap:6, maxWidth:1200 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ display:'flex', alignItems:'center', gap:7, padding:'11px 22px', borderRadius:12, fontSize:13, fontWeight:700, border:'none', cursor:'pointer', transition:'all .15s', background:tab===t.key?G:'transparent', color:tab===t.key?'#fff':'#6A7868', boxShadow:tab===t.key?'0 4px 14px rgba(27,94,32,.25)':'none', position:'relative' }}>
                {t.icon} {t.label}
                {t.key==='offers' && activeOffers.length>0 && <span style={{ position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background:'#EF4444', color:'#fff', fontSize:8, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>{activeOffers.length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ MENU ═══ */}
        {tab==='menu' && <>
          {/* Quick reorder */}
          {quickReorderItems.length > 0 && (
            <div style={{ background:'linear-gradient(135deg,#E8F5E9,#F4FBF4)', border:'1px solid #C8E6C9', borderRadius:18, padding:'18px 24px', marginBottom:28, display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:180 }}>
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.15em', color:G, marginBottom:4 }}>⚡ QUICK REORDER</div>
                <div style={{ fontSize:13, color:'#4A5548' }}>Your last order — add again in one tap</div>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {quickReorderItems.map(i => (
                  <button key={i.name} onClick={() => { const p = availableProducts.find(p => p.name===i.name); if(p){ addToCart(p); show('Added '+p.name); } }} style={{ padding:'9px 16px', borderRadius:20, border:'1px solid #C8E6C9', background:'#fff', color:G, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                    + {i.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Curated Collections */}
          <div style={{ marginBottom:32 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:G, marginBottom:16 }}>✨ Curated Collections</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
              {curatedCollections.map(c => (
                <button key={c.key} onClick={() => setCatFilter(c.key)} style={{ padding:'22px 20px', borderRadius:18, background:'linear-gradient(135deg,'+GD+','+G+')', border:'none', cursor:'pointer', textAlign:'left', boxShadow:'0 6px 24px rgba(27,94,32,.22)', transition:'transform .15s' }}>
                  <div style={{ fontFamily:brand.fontDisplay, fontSize:17, color:'#fff', fontWeight:700, marginBottom:5 }}>{c.label}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,.6)' }}>{c.desc}</div>
                  <div style={{ marginTop:14, fontSize:11, color:GOLD, fontWeight:700 }}>Explore →</div>
                </button>
              ))}
            </div>
          </div>

          {/* Command bar */}
          <div style={{ background:'#fff', border:'1px solid #E2EBE2', borderRadius:18, padding:'18px 20px', marginBottom:22, boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search dishes, categories, specials..." style={{ ...inp, margin:'0 0 14px', padding:'13px 18px', borderRadius:12, fontSize:14, background:'#F5F8F5' }} />
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <button onClick={() => setVegOnly(v=>!v)} style={{ padding:'8px 16px', borderRadius:20, border:'1.5px solid '+(vegOnly?G:SB), background:vegOnly?'#E8F5E9':'#fff', color:vegOnly?G:'#8A9488', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                {vegOnly ? '🥬 Veg Only ✓' : '🥬 Veg Only'}
              </button>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding:'8px 14px', borderRadius:20, border:'1px solid '+SB, background:'#fff', color:SH, fontSize:11, fontWeight:600, outline:'none' }}>
                <option value="recommended">⭐ Recommended</option>
                <option value="popular">🔥 Popular</option>
                <option value="price_asc">💰 Low → High</option>
                <option value="price_desc">💎 High → Low</option>
              </select>
              <div style={{ display:'flex', gap:6, overflowX:'auto', flex:1 }}>
                {categories.map(c => (
                  <button key={c} onClick={() => setCatFilter(c)} style={{ padding:'8px 18px', borderRadius:20, border:'none', background:catFilter===c?G:'#F0F4F0', color:catFilter===c?'#fff':'#8A9488', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s', flexShrink:0 }}>
                    {c==='all' ? '🍽 All' : c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Delivery info */}
          {currentStore && (
            <div style={{ background:'#E8F5E9', border:'1px solid #C8E6C9', borderRadius:16, padding:'14px 22px', marginBottom:22, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <span style={{ fontSize:24 }}>🚀</span>
              <div style={{ flex:1 }}>
                <span style={{ fontWeight:700, color:SH, fontSize:14 }}>Free delivery over </span>
                <span style={{ fontWeight:900, color:G }}>₹{freeAbove}</span>
                <span style={{ color:SD }}> · Otherwise ₹{deliveryCharge}</span>
              </div>
              <div style={{ textAlign:'center', background:'#fff', borderRadius:10, padding:'8px 18px', border:'1px solid #C8E6C9' }}>
                <div style={{ fontFamily:brand.fontDisplay, fontSize:22, fontWeight:800, color:G }}>{currentStore.prepTime}min</div>
                <div style={{ fontSize:8, color:SD, letterSpacing:'.1em', fontWeight:700 }}>PREP</div>
              </div>
            </div>
          )}

          {/* Offers strip */}
          {activeOffers.length > 0 && (
            <div style={{ marginBottom:28, display:'flex', gap:14, overflowX:'auto', paddingBottom:6 }}>
              {activeOffers.slice(0,5).map(o => (
                <div key={o.id} onClick={() => { setCustInfo(p=>({...p,coupon:o.code})); setAppliedOffer(o); show('🎉 '+o.code+' applied!'); }} style={{ flexShrink:0, width:248, padding:'20px 22px', borderRadius:18, border:'1px solid #E2EBE2', background:'#fff', cursor:'pointer', boxShadow:'0 2px 12px rgba(0,0,0,.04)', transition:'box-shadow .15s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:26 }}>{o.icon}</span>
                    <span style={{ fontWeight:700, fontSize:14, color:SH }}>{o.name}</span>
                  </div>
                  <div style={{ fontSize:12, color:SD, marginBottom:12 }}>{o.desc}</div>
                  <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:800, color:G, background:'#E8F5E9', padding:'5px 14px', borderRadius:8, border:'1px dashed rgba(27,94,32,.3)' }}>{o.code}</span>
                </div>
              ))}
            </div>
          )}

          {/* Products grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:18, marginBottom:36 }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ background:'#fff', borderRadius:22, border:'1px solid #E2EBE2', boxShadow:'0 2px 18px rgba(0,0,0,.05)', overflow:'hidden', opacity:p.available?1:.5, position:'relative', transition:'box-shadow .15s, transform .15s' }}>
                <div style={{ height:4, background:p.category?.toLowerCase().includes('biryani')?'linear-gradient(90deg,'+G+','+GOLD+')':p.category?.toLowerCase().includes('starter')?'linear-gradient(90deg,#FF6B35,'+GOLD+')':'linear-gradient(90deg,#4CAF50,#8BC34A)' }} />
                <div style={{ padding:'18px 20px 18px' }}>
                  {p.tag && <span style={{ position:'absolute', top:18, right:16, fontSize:8, padding:'3px 9px', borderRadius:6, background:G, color:'#fff', fontWeight:800, letterSpacing:'.05em' }}>{p.tag}</span>}
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
                    <span style={{ width:12, height:12, borderRadius:2, border:'2px solid '+(p.isVeg?'#2E7D32':'#D32F2F'), display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:p.isVeg?'#2E7D32':'#D32F2F', display:'block' }} />
                    </span>
                    <span style={{ fontSize:9, color:SD, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em' }}>{p.category || 'Specialty'}</span>
                  </div>
                  <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, color:'#1A1A1A', fontSize:16, marginBottom:4, lineHeight:1.25 }}>{p.name}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16 }}>
                    <span style={{ fontFamily:brand.fontDisplay, fontSize:23, fontWeight:800, color:G }}>₹{p.price}</span>
                    {p.available ? (
                      <button onClick={() => addToCart(p)} style={{ width:40, height:40, borderRadius:12, background:G, color:'#fff', fontSize:22, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(27,94,32,.3)' }}>+</button>
                    ) : (
                      <span style={{ fontSize:10, color:'#EF4444', fontWeight:700, padding:'5px 11px', borderRadius:8, background:'#FEF2F2', border:'1px solid #FECACA' }}>Sold Out</span>
                    )}
                  </div>
                  {cart.find(c => c.id===p.id) && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, justifyContent:'flex-end' }}>
                      <button onClick={() => updateCartQty(p.id, (cart.find(c=>c.id===p.id)?.qty||1)-1)} style={{ width:28, height:28, borderRadius:8, background:'#F0F4F0', color:SH, border:'1px solid '+SB, fontWeight:700, cursor:'pointer', fontSize:14 }}>−</button>
                      <span style={{ fontWeight:800, color:G, minWidth:22, textAlign:'center' }}>{cart.find(c=>c.id===p.id)?.qty}</span>
                      <button onClick={() => addToCart(p)} style={{ width:28, height:28, borderRadius:8, background:'#E8F5E9', color:G, border:'1px solid #C8E6C9', fontWeight:700, cursor:'pointer', fontSize:14 }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp + Referral */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:14, marginBottom:36 }}>
            <div style={{ background:'#fff', border:'1px solid #E2EBE2', borderLeft:'4px solid #25D366', borderRadius:18, padding:'20px 22px', display:'flex', alignItems:'center', gap:16, boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
              <div style={{ width:48, height:48, borderRadius:14, background:'#25D366', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:24, flexShrink:0 }}>💬</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, color:SH, fontSize:14 }}>Order on WhatsApp</div>
                <div style={{ fontSize:12, color:SD }}>₹{settings.VIRAL_REFERRAL_FRIEND||100} off first order</div>
              </div>
              <button onClick={() => window.open?.('https://wa.me/'+waPhone.replace(/[^0-9]/g,''))} style={{ padding:'10px 18px', borderRadius:10, background:'#25D366', color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>Chat</button>
            </div>
            {settings.VIRAL_REFERRAL_ENABLED !== 'false' && (
              <div style={{ background:'#fff', border:'1px solid #E2EBE2', borderLeft:'4px solid '+GOLD, borderRadius:18, padding:'20px 22px', display:'flex', alignItems:'center', gap:16, position:'relative', boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:GOLD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:24, flexShrink:0 }}>🎁</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:SH, fontSize:14 }}>Refer & Earn ₹{settings.VIRAL_REFERRAL_REWARD||100}</div>
                  <div style={{ fontSize:12, color:SD }}>Code: <b style={{ color:G, fontFamily:'monospace' }}>{refCode}</b></div>
                </div>
                <button onClick={() => setShareOpen(!shareOpen)} style={{ padding:'10px 18px', borderRadius:10, background:GOLD, color:GD, fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>Share</button>
                {shareOpen && (
                  <div style={{ position:'absolute', top:'100%', right:0, zIndex:50, background:'#fff', border:'1px solid '+SB, borderRadius:14, padding:10, display:'flex', gap:6, marginTop:6, boxShadow:'0 12px 40px rgba(0,0,0,.1)' }}>
                    <button onClick={() => shareReferral('whatsapp')} style={{ padding:'8px 16px', borderRadius:8, background:'#25D366', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>WhatsApp</button>
                    <button onClick={() => shareReferral('copy')} style={{ padding:'8px 16px', borderRadius:8, background:G, color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>Copy</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Social proof dark section */}
          <div style={{ background:'linear-gradient(140deg,'+GD+','+G+')', borderRadius:26, padding:'48px 40px', marginBottom:36 }}>
            <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.28em', textTransform:'uppercase', color:GOLD, marginBottom:10 }}>BY THE NUMBERS</div>
            <h2 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(22px,4vw,36px)', color:'#fff', marginBottom:36, lineHeight:1.1 }}>A legacy built on taste</h2>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:28, marginBottom:36 }}>
              {[['4.8★','Average Rating'],['97%','On-Time Delivery'],['71%','Repeat Guests'],['2hr+','Dum Process']].map(([v,l]) => (
                <div key={l}>
                  <div style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(30px,5vw,48px)', fontWeight:900, color:GOLD, lineHeight:1 }}>{v}</div>
                  <div style={{ fontSize:12, color:'rgba(255,255,255,.45)', marginTop:7, letterSpacing:'.06em' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:18 }}>
              {testimonials.map(t => (
                <div key={t.name} style={{ background:'rgba(255,255,255,.06)', borderRadius:18, padding:'22px 24px', border:'1px solid rgba(255,255,255,.09)' }}>
                  <div style={{ fontSize:28, color:GOLD, marginBottom:10 }}>❝</div>
                  <p style={{ fontSize:13, color:'rgba(255,255,255,.72)', lineHeight:1.75, margin:'0 0 14px', fontStyle:'italic' }}>{t.text}</p>
                  <div style={{ fontSize:12, fontWeight:700, color:GOLD }}>— {t.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div style={{ background:'#fff', border:'2px solid #E8F5E9', borderRadius:22, padding:'26px 30px', marginBottom:32, boxShadow:'0 6px 28px rgba(27,94,32,.08)' }}>
              <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, color:'#1A1A1A', fontSize:22, marginBottom:22, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ width:42, height:42, borderRadius:12, background:'#E8F5E9', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🛒</span>
                Your Order
                <span style={{ fontSize:14, fontWeight:500, color:SD }}>({cart.reduce((a,i)=>a+i.qty,0)} items)</span>
              </div>
              {cart.map(i => (
                <div key={i.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid #F0F4F0' }}>
                  <span style={{ color:SH, fontSize:14, fontWeight:600 }}>{i.name}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <button onClick={() => updateCartQty(i.id,i.qty-1)} style={{ width:30, height:30, borderRadius:8, background:'#F0F4F0', color:SH, border:'1px solid '+SB, fontWeight:700, cursor:'pointer', fontSize:14 }}>−</button>
                    <span style={{ fontWeight:800, minWidth:24, textAlign:'center', color:SH }}>{i.qty}</span>
                    <button onClick={() => updateCartQty(i.id,i.qty+1)} style={{ width:30, height:30, borderRadius:8, background:'#E8F5E9', color:G, border:'1px solid #C8E6C9', fontWeight:700, cursor:'pointer', fontSize:14 }}>+</button>
                    <span style={{ fontWeight:700, color:G, minWidth:72, textAlign:'right', fontSize:15 }}>₹{i.price*i.qty}</span>
                    <button onClick={() => removeFromCart(i.id)} style={{ color:'#EF4444', background:'none', border:'none', fontSize:16, cursor:'pointer', padding:'4px' }}>✕</button>
                  </div>
                </div>
              ))}
              <div style={{ paddingTop:20, marginTop:14, fontSize:14 }}>
                {[['Subtotal', fmt(cartTotal)],['GST ('+gstRate+'%)', fmt(gst)],['Delivery', isFreeDelivery?'FREE ✓':'₹'+deliveryCharge]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:9, color:SD }}>
                    <span>{k}</span>
                    <span style={{ color:k==='Delivery'&&isFreeDelivery?G:SH, fontWeight:k==='Delivery'&&isFreeDelivery?800:400 }}>{v}</span>
                  </div>
                ))}
                {discount > 0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:9, color:G, fontWeight:700 }}><span>🎁 {appliedOffer?.code}</span><span>−{fmt(discount)}</span></div>}
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:24, marginTop:18, paddingTop:18, borderTop:'2px solid #E8EFE8' }}>
                  <span style={{ color:SH }}>Total</span>
                  <span style={{ color:G }}>{fmt(grandTotal)}</span>
                </div>
              </div>
              {!checkoutOpen ? (
                <button onClick={openCheckout} style={{ width:'100%', marginTop:20, padding:'16px 28px', borderRadius:14, background:G, color:'#fff', fontSize:16, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(27,94,32,.3)' }}>
                  🛒 Proceed to Checkout · {fmt(grandTotal)}
                </button>
              ) : (
                <div style={{ marginTop:22, padding:'26px', background:'#F8FAF8', borderRadius:18, border:'1px solid #E2EBE2' }}>
                  <div style={{ fontSize:11, fontWeight:800, color:G, marginBottom:18, letterSpacing:'.2em' }}>DELIVERY DETAILS</div>
                  {['name','phone','address'].map(f => (
                    <input key={f} placeholder={f==='name'?'Full Name':f==='phone'?'Phone (+91)':'Delivery Address'} value={custInfo[f]} onChange={e => setCustInfo(p=>({...p,[f]:e.target.value}))} style={{ ...inp, marginBottom:10 }} />
                  ))}
                  <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                    {['delivery','pickup'].map(t => (
                      <button key={t} onClick={() => setCustInfo(p=>({...p,type:t}))} style={{ flex:1, padding:12, borderRadius:10, fontSize:13, fontWeight:700, border:'2px solid '+(custInfo.type===t?G:SB), background:custInfo.type===t?'#E8F5E9':'#fff', color:custInfo.type===t?G:SD, cursor:'pointer' }}>
                        {t==='delivery'?'🛵 Delivery':'🏃 Pickup'}
                      </button>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:10, marginBottom:18 }}>
                    <input placeholder="Coupon code" value={custInfo.coupon} onChange={e => setCustInfo(p=>({...p,coupon:e.target.value.toUpperCase()}))} style={{ ...inp, flex:1, textTransform:'uppercase', letterSpacing:'.1em' }} />
                    <button onClick={applyCoupon} style={{ padding:'0 22px', borderRadius:10, background:'rgba(201,168,76,.1)', border:'1.5px solid rgba(201,168,76,.35)', color:GOLD, fontWeight:700, fontSize:12, cursor:'pointer' }}>Apply</button>
                  </div>
                  <button onClick={handlePlace} style={{ width:'100%', padding:'16px 28px', borderRadius:14, background:G, color:'#fff', fontSize:16, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(27,94,32,.3)' }}>
                    ✅ Place Order · {fmt(grandTotal)}
                  </button>
                </div>
              )}
            </div>
          )}
        </>}

        {/* ═══ OFFERS ═══ */}
        {tab==='offers' && (
          <div>
            {settings.VIRAL_REFERRAL_ENABLED !== 'false' && (
              <div style={{ background:'linear-gradient(150deg,'+GD+','+G+','+GL+')', borderRadius:22, padding:'44px 36px', marginBottom:32, textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:14 }}>🎁</div>
                <h3 style={{ fontFamily:brand.fontDisplay, fontSize:30, color:'#fff', marginBottom:10 }}>Refer Friends, Earn Rewards</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.65)', marginBottom:22 }}>They get ₹{settings.VIRAL_REFERRAL_FRIEND||100} off · You earn ₹{settings.VIRAL_REFERRAL_REWARD||100}</p>
                <div style={{ display:'inline-flex', alignItems:'center', gap:14, background:'rgba(255,255,255,.1)', border:'2px dashed rgba(255,255,255,.22)', borderRadius:16, padding:'14px 30px', marginBottom:20 }}>
                  <span style={{ fontFamily:'monospace', fontSize:28, fontWeight:900, color:'#fff' }}>{refCode}</span>
                  <button onClick={() => shareReferral('copy')} style={{ padding:'8px 16px', borderRadius:8, background:'rgba(255,255,255,.2)', color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>📋 Copy</button>
                </div>
                <div><button onClick={() => shareReferral('whatsapp')} style={{ padding:'13px 28px', borderRadius:12, background:'#25D366', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>💬 Share on WhatsApp</button></div>
              </div>
            )}
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', color:G, marginBottom:18 }}>🎉 ACTIVE OFFERS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:16, marginBottom:36 }}>
              {activeOffers.map(o => (
                <div key={o.id} style={{ background:'#fff', borderRadius:20, border:'1px solid #E2EBE2', borderLeft:'4px solid '+G, padding:'22px 24px', boxShadow:'0 2px 14px rgba(0,0,0,.04)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <span style={{ fontSize:34 }}>{o.icon}</span>
                    <div><div style={{ fontWeight:700, fontSize:16, color:SH }}>{o.name}</div><div style={{ fontSize:12, color:SD, marginTop:3 }}>{o.desc}</div></div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontFamily:'monospace', fontSize:15, fontWeight:800, color:G, background:'#E8F5E9', padding:'6px 18px', borderRadius:8, border:'1px dashed rgba(27,94,32,.3)' }}>{o.code}</span>
                    <button onClick={() => { setCustInfo(p=>({...p,coupon:o.code})); setAppliedOffer(o); setTab('menu'); show('🎉 Applied!'); }} style={{ padding:'10px 20px', borderRadius:10, background:G, color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>Apply →</button>
                  </div>
                  {o.minOrder > 0 && <div style={{ fontSize:11, color:SD, marginTop:10 }}>Min: ₹{o.minOrder}{o.freebieItem ? ' · Free: '+o.freebieItem : ''}</div>}
                </div>
              ))}
            </div>
            {settings.VIRAL_REWARDS_ENABLED !== 'false' && <>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', color:G, marginBottom:18 }}>🏆 LOYALTY TIERS</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14 }}>
                {rewardsConf.tiers.map((t,i) => (
                  <div key={t.name} style={{ background:'#fff', borderRadius:18, border:'1px solid #E2EBE2', padding:'22px 20px', textAlign:'center', borderTop:'3px solid '+[SD,'#C0C0C0',GOLD,'#4CAF50'][i], boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
                    <div style={{ fontSize:34, marginBottom:10 }}>{['🥉','🥈','🥇','💎'][i]}</div>
                    <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, fontSize:18, color:SH }}>{t.name}</div>
                    <div style={{ fontSize:11, color:SD, marginBottom:12 }}>{t.minPoints}+ pts · {t.multiplier}x</div>
                    {t.perks.map(p => <div key={p} style={{ fontSize:11, color:G, marginBottom:4 }}>✓ {p}</div>)}
                  </div>
                ))}
              </div>
            </>}
          </div>
        )}

        {/* ═══ ORDERS ═══ */}
        {tab==='track' && (
          <div>
            {!customer && (
              <div style={{ textAlign:'center', padding:'68px 24px' }}>
                <div style={{ fontSize:60, marginBottom:18 }}>🔐</div>
                <h3 style={{ fontFamily:brand.fontDisplay, fontSize:28, color:SH, marginBottom:12 }}>Sign in to view your orders</h3>
                <p style={{ fontSize:14, color:SD, marginBottom:26 }}>Track deliveries and reorder your favourites</p>
                <button onClick={() => setShowUserAuth(true)} style={{ padding:'15px 36px', borderRadius:12, background:G, color:'#fff', fontWeight:800, fontSize:15, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(27,94,32,.3)' }}>Sign In</button>
              </div>
            )}
            {customer && customerOrders.length === 0 && (
              <div style={{ textAlign:'center', padding:'68px 24px' }}>
                <div style={{ fontSize:60, marginBottom:18 }}>📦</div>
                <h3 style={{ fontFamily:brand.fontDisplay, fontSize:28, color:SH, marginBottom:16 }}>No orders yet</h3>
                <button onClick={() => setTab('menu')} style={{ padding:'15px 36px', borderRadius:12, background:G, color:'#fff', fontWeight:800, fontSize:15, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(27,94,32,.3)' }}>Browse Menu</button>
              </div>
            )}
            {customerOrders.map(o => (
              <div key={o.id} style={{ background:'#fff', border:'1px solid #E2EBE2', borderRadius:18, padding:'22px 26px', marginBottom:14, boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <div><span style={{ fontFamily:'monospace', fontWeight:800, color:SH, fontSize:16 }}>{o.id}</span><span style={{ fontSize:12, color:SD, marginLeft:10 }}>{o.placed}</span></div>
                  <Badge color={o.status==='delivered'?G:o.status==='out_for_delivery'?brand.blue:brand.gold}>{o.status.replace(/_/g,' ')}</Badge>
                </div>
                <div style={{ fontSize:13, color:SD, marginBottom:12 }}>{o.items.map(i => i.name+' ×'+i.qty).join(', ')}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:800, color:G, fontSize:18 }}>{fmt(o.total)}</span>
                  {o.eta > 0 && o.status !== 'delivered' && <span style={{ color:G, fontSize:12, fontWeight:700 }}>⏱ ~{o.eta} min</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ FRANCHISE ═══ */}
        {tab==='franchise' && settings.FRANCHISE_ENABLED !== 'false' && (
          <div>
            <div style={{ background:'linear-gradient(155deg,#050E05,'+G+')', borderRadius:26, padding:'52px 40px', marginBottom:36, position:'relative', overflow:'hidden', textAlign:'center' }}>
              <div style={{ position:'absolute', top:-60, right:-40, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,168,76,.18) 0%,transparent 70%)', pointerEvents:'none' }} />
              <div style={{ position:'relative' }}>
                <div style={{ fontSize:60, marginBottom:18 }}>🏢</div>
                <h2 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(28px,5vw,46px)', color:'#fff', marginBottom:12 }}>Own a Charminar Mehfil</h2>
                <p style={{ fontSize:15, color:'rgba(255,255,255,.62)', maxWidth:500, margin:'0 auto 32px' }}>₹{settings.FRANCHISE_MIN_INVESTMENT||15}L – ₹{settings.FRANCHISE_MAX_INVESTMENT||35}L · Full support from day one</p>
                <div style={{ display:'flex', justifyContent:'center', gap:32, flexWrap:'wrap' }}>
                  {[{l:'Investment',v:'₹15–35L'},{l:'Royalty',v:(settings.FRANCHISE_DEFAULT_ROYALTY||12)+'%'},{l:'ROI',v:'18–24mo'},{l:'Locations',v:activeStores.length+'+'}].map(s2 => (
                    <div key={s2.l} style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:brand.fontDisplay, fontSize:30, fontWeight:900, color:GOLD }}>{s2.v}</div>
                      <div style={{ fontSize:10, color:'rgba(255,255,255,.45)', letterSpacing:'.14em', textTransform:'uppercase', marginTop:5 }}>{s2.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, marginBottom:36 }}>
              {[{i:'🍗',t:'Proven Menu',d:'Signature biryani loved across Chennai'},{i:'📦',t:'Full Setup',d:'Kitchen, training, ops, marketing'},{i:'💻',t:'Tech Platform',d:'POS, OMS, delivery included'},{i:'📈',t:'High Margins',d:'60%+ gross optimized supply chain'},{i:'🎯',t:'Marketing Engine',d:'Viral, social, SEO done for you'},{i:'🤝',t:'Owner Network',d:'Thriving franchise owner community'}].map(f => (
                <div key={f.t} style={{ background:'#fff', border:'1px solid #E2EBE2', borderRadius:18, padding:'22px 20px', boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
                  <div style={{ fontSize:30, marginBottom:12 }}>{f.i}</div>
                  <div style={{ fontWeight:700, color:SH, fontSize:14, marginBottom:7 }}>{f.t}</div>
                  <div style={{ fontSize:12, color:SD, lineHeight:1.6 }}>{f.d}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', color:G, marginBottom:16 }}>📝 FRANCHISE INQUIRY</div>
            <div style={{ background:'#fff', borderRadius:22, border:'1px solid #E2EBE2', padding:'32px', maxWidth:600, boxShadow:'0 6px 24px rgba(0,0,0,.06)' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <input placeholder="Full Name *" value={franchiseForm.name} onChange={e => setFranchiseForm(p=>({...p,name:e.target.value}))} style={inp} />
                <input placeholder="Phone *" value={franchiseForm.phone} onChange={e => setFranchiseForm(p=>({...p,phone:e.target.value}))} style={inp} />
              </div>
              <input placeholder="Email" value={franchiseForm.email} onChange={e => setFranchiseForm(p=>({...p,email:e.target.value}))} style={{ ...inp, marginBottom:12 }} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
                <input placeholder="Preferred City" value={franchiseForm.city} onChange={e => setFranchiseForm(p=>({...p,city:e.target.value}))} style={inp} />
                <select value={franchiseForm.investment} onChange={e => setFranchiseForm(p=>({...p,investment:e.target.value}))} style={{ ...inp, appearance:'auto' }}>
                  <option value="">Budget Range</option><option value="15-20L">₹15–20L</option><option value="20-25L">₹20–25L</option><option value="25-35L">₹25–35L</option><option value="35L+">₹35L+</option>
                </select>
              </div>
              <select value={franchiseForm.experience} onChange={e => setFranchiseForm(p=>({...p,experience:e.target.value}))} style={{ ...inp, marginBottom:12, appearance:'auto' }}>
                <option value="">F&B Experience</option><option value="none">None</option><option value="1-3">1–3 years</option><option value="3+">3+ years</option>
              </select>
              <textarea placeholder="Tell us about yourself and why Charminar Mehfil..." value={franchiseForm.message} onChange={e => setFranchiseForm(p=>({...p,message:e.target.value}))} rows={3} style={{ ...inp, marginBottom:18, resize:'vertical' }} />
              <button onClick={() => { if(!franchiseForm.name||!franchiseForm.phone) return show('Fill name & phone','error'); addFranchise({ name:franchiseForm.name, owner:franchiseForm.phone, phone:franchiseForm.phone, city:franchiseForm.city, investment:franchiseForm.investment, email:franchiseForm.email, status:'inquiry' }); show('✅ Inquiry submitted! We will contact you within 24 hours.'); setFranchiseForm({name:'',phone:'',email:'',city:'',investment:'',experience:'',message:''}); }} style={{ width:'100%', padding:'16px 28px', borderRadius:14, background:G, color:'#fff', fontSize:15, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(27,94,32,.3)' }}>
                🏢 Submit Franchise Inquiry
              </button>
            </div>
          </div>
        )}

        {/* ═══ INSTAGRAM / FOLLOW US ═══ */}
        {instagramFeed.active && instagramPosts.length > 0 && (
          <div style={{ marginTop:52, marginBottom:36 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <div>
                <span style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:G }}>📸 FOLLOW US</span>
                <h3 style={{ fontFamily:brand.fontDisplay, fontSize:30, color:'#1A1A1A', margin:'10px 0 5px' }}>{instagramFeed.title || 'Follow Us on Instagram'}</h3>
                {instagramFeed.subtitle && <p style={{ fontSize:13, color:SD, margin:0 }}>{instagramFeed.subtitle}</p>}
              </div>
              {shouldUseVideoCarousel && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => scrollVideoCarousel(-1)} style={{ width:38, height:38, borderRadius:12, border:'1px solid #E2EBE2', background:'#fff', color:SH, cursor:'pointer', fontSize:16 }}>←</button>
                  <button onClick={() => scrollVideoCarousel(1)} style={{ width:38, height:38, borderRadius:12, border:'1px solid #E2EBE2', background:'#fff', color:SH, cursor:'pointer', fontSize:16 }}>→</button>
                </div>
              )}
            </div>
            {shouldUseVideoCarousel ? (
              <div ref={videoCarouselRef} style={{ display:'flex', gap:16, overflowX:'auto', scrollSnapType:'x mandatory', paddingBottom:8 }}>
                {instagramVideoPosts.map(post => (
                  <div key={post.id} style={{ flex:'0 0 320px', scrollSnapAlign:'start', background:'#fff', borderRadius:18, border:'1px solid #E2EBE2', overflow:'hidden', boxShadow:'0 4px 18px rgba(0,0,0,.06)' }}>
                    <iframe src={toInstagramEmbedUrl(post.url)} title={post.caption||post.id} width="100%" height="420" style={{ border:'none' }} loading="lazy" allowTransparency />
                    {post.caption && <div style={{ fontSize:12, color:SD, padding:'12px 16px' }}>{post.caption}</div>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
                {instagramPosts.map(post => (
                  <div key={post.id} style={{ background:'#fff', borderRadius:18, border:'1px solid #E2EBE2', overflow:'hidden', boxShadow:'0 4px 18px rgba(0,0,0,.06)' }}>
                    <iframe src={toInstagramEmbedUrl(post.url)} title={post.caption||post.id} width="100%" height="420" style={{ border:'none' }} loading="lazy" allowTransparency />
                    {post.caption && <div style={{ fontSize:12, color:SD, padding:'12px 16px' }}>{post.caption}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>{/* end main content */}

      {/* FLOATING CART RAIL — fixed bottom */}
      {cart.length > 0 && !checkoutOpen && (
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:800, padding:'14px 24px 24px', background:'linear-gradient(to top,rgba(255,253,247,1) 60%,transparent)', pointerEvents:'none' }}>
          <div style={{ maxWidth:620, margin:'0 auto', pointerEvents:'all' }}>
            <button onClick={openCheckout} style={{ width:'100%', padding:'17px 28px', borderRadius:18, background:G, color:'#fff', fontSize:15, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 10px 36px rgba(27,94,32,.42)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ background:'rgba(255,255,255,.18)', borderRadius:20, padding:'4px 14px', fontSize:13 }}>{cart.reduce((a,i)=>a+i.qty,0)} items</span>
              <span>View Cart &amp; Checkout</span>
              <span style={{ fontFamily:brand.fontDisplay, fontSize:19 }}>{fmt(grandTotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM NAV */}
      <div style={{ position:'fixed', left:'50%', transform:'translateX(-50%)', bottom:cart.length>0?88:18, zIndex:900, background:'rgba(255,255,255,.96)', backdropFilter:'blur(14px)', border:'1px solid rgba(0,0,0,.07)', borderRadius:22, padding:'7px', display:'flex', gap:5, boxShadow:'0 10px 36px rgba(0,0,0,.13)' }}>
        {TABS.slice(0,3).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding:'10px 16px', borderRadius:16, border:'none', background:tab===t.key?G:'transparent', color:tab===t.key?'#fff':'#8A9488', fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* CHATBOT */}
      <ChatBotWidget waPhone={waPhone} show={show} />
    </div>
  );
}

function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

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
    if (t.includes('track')||t.includes('status')||t.includes('where')) return '📦 To track your order, share your Order ID. You can also check the Orders tab above!';
    if (t.includes('offer')||t.includes('deal')||t.includes('discount')||t.includes('coupon')) return '🎁 Active offers:\n\n• WELCOME20 — 20% off first order\n• BIRYANI50 — ₹50 off biryani\n• FAMILY200 — ₹200 off 4+ biryanis\n\nApply at checkout!';
    if (t.includes('franchise')||t.includes('own')||t.includes('invest')) return '🏢 Franchise details:\n\n• Investment: ₹15-35L\n• ROI: 18-24 months\n• Full support from day one\n\nTap the Franchise tab to apply!';
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
    {!open && <button onClick={() => setOpen(true)} style={{ position:'fixed', bottom:24, right:24, width:62, height:62, borderRadius:31, background:'#25D366', border:'none', cursor:'pointer', boxShadow:'0 6px 22px rgba(37,211,102,.42)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, zIndex:1000 }}>💬</button>}
    {open && <div style={{ position:'fixed', bottom:24, right:24, width:368, maxHeight:528, borderRadius:22, overflow:'hidden', zIndex:1000, boxShadow:'0 14px 48px rgba(0,0,0,.16)', border:'1px solid #E0E8E0', display:'flex', flexDirection:'column', background:'#fff' }}>
      <div style={{ padding:'14px 20px', background:G, color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:19, background:'rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
          <div><div style={{ fontWeight:700, fontSize:14 }}>Charminar Mehfil</div><div style={{ fontSize:10, opacity:.75 }}>Online · Replies instantly</div></div>
        </div>
        <button onClick={() => setOpen(false)} style={{ color:'#fff', background:'none', border:'none', fontSize:18, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', background:'#F0F4F0', maxHeight:328 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start', marginBottom:8 }}>
            <div style={{ maxWidth:'82%', padding:'10px 14px', borderRadius:m.from==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px', background:m.from==='user'?G:'#fff', color:m.from==='user'?'#fff':'#333', fontSize:13, lineHeight:1.55, whiteSpace:'pre-wrap', boxShadow:m.from==='bot'?'0 1px 4px rgba(0,0,0,.06)':'none' }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:'7px 16px', background:'#fff', display:'flex', gap:4, overflowX:'auto', borderTop:'1px solid #E8F5E9' }}>
        {quickReplies.map(q => <button key={q} onClick={() => send(q)} style={{ padding:'6px 12px', borderRadius:16, background:'#E8F5E9', color:G, fontSize:11, fontWeight:600, border:'none', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>{q}</button>)}
      </div>
      <div style={{ padding:'10px 16px', background:'#fff', display:'flex', gap:8, borderTop:'1px solid #E8F5E9' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Type a message..." style={{ flex:1, padding:'10px 14px', borderRadius:24, background:'#F0F4F0', border:'none', fontSize:13, outline:'none', color:'#333' }} />
        <button onClick={() => send()} style={{ width:42, height:42, borderRadius:21, background:G, color:'#fff', border:'none', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>→</button>
      </div>
      <div style={{ padding:'8px 16px', background:'#F8FAF8', textAlign:'center', borderTop:'1px solid #E8F5E9' }}>
        <button onClick={() => window.open?.('https://wa.me/'+waPhone.replace(/[^0-9]/g,''))} style={{ fontSize:11, color:'#25D366', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>Continue on WhatsApp →</button>
      </div>
    </div>}
  </>;
}
