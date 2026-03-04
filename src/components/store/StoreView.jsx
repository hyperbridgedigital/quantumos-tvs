'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';
import { Badge } from '@/components/shared/Badge';
import { quickCategories, categoryLandingMeta, productCategoriesMap } from '@/data/products';
import { dealsEngine } from '@/data/offers';
import { BUILDER_STEP_ORDER, BUILDER_STEP_LABELS, pcBuilderMeta, BUILDER_OVERHEAD_WATTS, PSU_HEADROOM_PERCENT } from '@/data/pcBuilderMeta';

const TABS = [
  { key: 'shop', label: 'Shop', icon: '🛒' },
  { key: 'deals', label: 'Deals', icon: '⚡' },
  { key: 'track', label: 'Orders', icon: '📦' },
  { key: 'builder', label: 'PC Builder', icon: '🔧' },
  { key: 'content', label: 'Content', icon: '📚' },
  { key: 'community', label: 'Community', icon: '🖼️' },
  { key: 'csr', label: 'Tech for Good', icon: '🌱' },
  { key: 'marketplace', label: 'Marketplace', icon: '🏪' },
];

export default function StoreView() {
  const {
    activeStores, selectedStore, setSelectedStore, currentStore,
    availableProducts, cart, addToCart, removeFromCart, updateCartQty, cartTotal,
    placeOrder, customerOrders, settings, partnerValues, show,
    customer, setShowUserAuth, offers, rewardsConf,
    userLocation, setUserLocation, stores, cms, addFranchise
  } = useApp();

  const [tab, setTab] = useState('shop');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [custInfo, setCustInfo] = useState({ name:'', phone:'', email:'', address:'', locality:'', city:'', state:'', pincode:'', landmark:'', type:'delivery', coupon:'' });
  const [locLoading, setLocLoading] = useState(false);
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [refCode] = useState(() => 'TVS' + Math.random().toString(36).slice(2,6).toUpperCase());
  const [shareOpen, setShareOpen] = useState(false);
  const [catFilter, setCatFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [heroIndex, setHeroIndex] = useState(0);
  const [spotlightEndsAt] = useState(() => Date.now() + 1000 * 60 * 60 * 18);
  const [nowTs, setNowTs] = useState(Date.now());
  const [builderSelection, setBuilderSelection] = useState({});
  const videoCarouselRef = useRef(null);
  const autoLocationTriedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Hero banner rotation
  useEffect(() => {
    const t = setInterval(() => setHeroIndex(i => (i + 1) % 4), 5000);
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
    const txt = 'Get the best value on gaming & tech! TheValueStore — ₹' + (settings.VIRAL_REFERRAL_FRIEND || 500) + ' OFF with code: ' + refCode + ' 🎮';
    if (p === 'whatsapp') window.open?.('https://wa.me/?text=' + encodeURIComponent(txt));
    else if (p === 'copy') { navigator.clipboard?.writeText(refCode); show('Copied!'); }
    setShareOpen(false);
  };

  const categories = useMemo(() => ['all', ...new Set(availableProducts.map(p => p.category).filter(Boolean))], [availableProducts]);
  const filteredProducts = useMemo(() => {
    let list = catFilter === 'all' ? availableProducts : availableProducts.filter(p => p.category === catFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p => (p.name||'').toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q) || (p.brand||'').toLowerCase().includes(q));
    }
    if (sortBy === 'price_asc') list = [...list].sort((a, b) => (a.price||0) - (b.price||0));
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => (b.price||0) - (a.price||0));
    else if (sortBy === 'popular') list = [...list].sort((a, b) => (b.rating||0) - (a.rating||0));
    return list;
  }, [availableProducts, catFilter, searchQuery, sortBy]);

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
  const valuePicks = useMemo(() => availableProducts.filter(p => p.tag && ['Best Value','Top Gaming Pick','Creator Choice'].includes(p.tag)).slice(0, 9), [availableProducts]);
  const gamingZoneProducts = useMemo(() => availableProducts.filter(p => ['laptops','gamingPcs','gpu','keyboards','headsets','streaming','monitors'].includes(p.category)).slice(0, 8), [availableProducts]);
  const instagramFeed = cms?.instagramFeed || { active:false, posts:[] };
  const instagramPosts = (instagramFeed.posts || []).filter(p => p.active).slice(0, instagramFeed.maxItems || 8);
  const instagramVideoPosts = instagramPosts.filter(p => p.mediaType === 'video');
  const shouldUseVideoCarousel = instagramVideoPosts.length > 1;

  // Design tokens — TheValueStore palette
  const BLK = brand.black;
  const BLUE = brand.blueElectric;
  const EMERALD = brand.emerald;
  const GOLD = brand.gold;
  const SH = brand.storeHeading;
  const SD = brand.storeDim;
  const ST = brand.storeText;
  const SB = brand.storeBorder;
  const trustBadges = ['Free Shipping Over ₹5K','Expert PC Building','18-Month Warranty','Secure Checkout','Tech for Education'];
  const heroBanners = [
    { title: 'Build Your Dream PC', subtitle: 'Custom builds with compatibility check & wattage calculator', cta: 'Start PC Builder', ctaAction: () => { setTab('builder'); setTimeout(() => document.getElementById('shop-anchor')?.scrollIntoView({ behavior: 'smooth' }), 100); }, gradient: 'linear-gradient(135deg,#0D0D0F 0%,#1E3A5F 50%,#0D0D0F 100%)' },
    { title: 'RTX Gaming Starts Here', subtitle: 'NVIDIA RTX 40-series GPUs & prebuilt gaming rigs', cta: 'Shop Gaming PCs', ctaAction: () => { setTab('shop'); setCatFilter('gamingPcs'); setTimeout(() => document.getElementById('shop-anchor')?.scrollIntoView({ behavior: 'smooth' }), 100); }, gradient: 'linear-gradient(135deg,#0D0D0F 0%,#312e81 50%,#0D0D0F 100%)' },
    { title: 'AI-Ready Laptops', subtitle: 'Creator & student laptops for work and play', cta: 'Shop AI PCs', ctaAction: () => { setTab('shop'); setCatFilter('laptops'); setTimeout(() => document.getElementById('shop-anchor')?.scrollIntoView({ behavior: 'smooth' }), 100); }, gradient: 'linear-gradient(135deg,#0D0D0F 0%,#064e3b 50%,#0D0D0F 100%)' },
    { title: 'Tech That Gives Back', subtitle: 'Digital classrooms · Rural coding labs · E-waste recycling', cta: 'Explore CSR', ctaAction: () => { setTab('csr'); setTimeout(() => document.getElementById('csr-anchor')?.scrollIntoView({ behavior: 'smooth' }), 100); }, gradient: 'linear-gradient(135deg,#0D0D0F 0%,#14532d 50%,#0D0D0F 100%)' },
  ];
  const buildTypes = [
    { key: 'budget', label: 'Budget Build', desc: 'Best value under ₹80K', icon: '💰' },
    { key: 'creator', label: 'Creator Build', desc: 'Streaming & content creation', icon: '🎬' },
    { key: 'extreme', label: 'Extreme Gaming', desc: 'Max FPS, no compromise', icon: '🔥' },
  ];
  // PC Builder: products by step (from live catalog)
  const builderProductsByStep = useMemo(() => {
    const byStep = {};
    BUILDER_STEP_ORDER.forEach(s => { byStep[s] = availableProducts.filter(p => p.category === s); });
    return byStep;
  }, [availableProducts]);
  // Filter products per step by compatibility (socket, ramType, formFactor)
  const builderFilteredByStep = useMemo(() => {
    const sel = builderSelection;
    const meta = (id) => pcBuilderMeta[id] || {};
    const out = {};
    BUILDER_STEP_ORDER.forEach(step => {
      let list = builderProductsByStep[step] || [];
      if (step === 'motherboard' && sel.cpu) {
        const socket = meta(sel.cpu.id).socket;
        if (socket) list = list.filter(p => meta(p.id).socket === socket);
      }
      if (step === 'ram' && sel.motherboard) {
        const ramType = meta(sel.motherboard.id).ramType;
        if (ramType) list = list.filter(p => meta(p.id).ramType === ramType);
      }
      if (step === 'cabinet' && sel.motherboard) {
        const formFactor = meta(sel.motherboard.id).formFactor;
        const supports = (m) => (m.supports || [m.formFactor]).includes(formFactor);
        list = list.filter(p => supports(meta(p.id)));
      }
      if (step === 'psu') {
        const totalTdp = BUILDER_OVERHEAD_WATTS + BUILDER_STEP_ORDER.reduce((sum, s) => {
          const p = sel[s];
          if (!p) return sum;
          const m = meta(p.id);
          return sum + (m.tdp || 0);
        }, 0);
        const recommended = Math.ceil((totalTdp + (totalTdp * PSU_HEADROOM_PERCENT / 100)) / 50) * 50;
        list = list.filter(p => (meta(p.id).wattage || 0) >= recommended);
      }
      out[step] = list;
    });
    return out;
  }, [builderSelection, builderProductsByStep]);
  const builderTotalTdp = useMemo(() => {
    const meta = (id) => pcBuilderMeta[id] || {};
    return BUILDER_OVERHEAD_WATTS + BUILDER_STEP_ORDER.reduce((sum, step) => {
      const p = builderSelection[step];
      if (!p) return sum;
      const m = meta(p.id);
      return sum + (m.tdp || 0);
    }, 0);
  }, [builderSelection]);
  const builderRecommendedPsuWatts = useMemo(() => {
    const raw = builderTotalTdp + Math.ceil(builderTotalTdp * PSU_HEADROOM_PERCENT / 100);
    return Math.ceil(raw / 50) * 50;
  }, [builderTotalTdp]);
  const builderBuildTotal = useMemo(() => {
    return BUILDER_STEP_ORDER.reduce((sum, step) => {
      const p = builderSelection[step];
      return sum + (p ? p.price : 0);
    }, 0);
  }, [builderSelection]);
  const builderSelect = (step, product) => setBuilderSelection(prev => ({ ...prev, [step]: product }));
  const builderClear = (step) => setBuilderSelection(prev => ({ ...prev, [step]: null }));
  const builderAddBuildToCart = () => {
    const items = BUILDER_STEP_ORDER.map(s => builderSelection[s]).filter(Boolean);
    if (items.length === 0) return show('Select at least one component', 'error');
    items.forEach(p => addToCart(p));
    show('Build added to cart (' + items.length + ' items)');
  };
  const businessSolutions = [
    { label: 'Startups', desc: 'Scaling your first office', icon: '🚀' },
    { label: 'Design Studios', desc: 'Workstations & color-accurate displays', icon: '🎨' },
    { label: 'Video Editors', desc: 'High-throughput storage & GPU', icon: '🎞️' },
    { label: 'Developers', desc: 'Dev rigs & servers', icon: '💻' },
  ];
  const csrPrograms = [
    { title: 'Digital Classrooms', stat: '120+', desc: 'Schools equipped with devices' },
    { title: 'Rural Coding Labs', stat: '15', desc: 'Centers in tier-2/3 cities' },
    { title: 'Women in Tech Scholarships', stat: '500+', desc: 'Beneficiaries so far' },
    { title: 'E-waste Recycling', stat: '2.5T', desc: 'Tonnes recycled annually' },
  ];
  const inp = { width:'100%', padding:'13px 16px', borderRadius:12, background:'#fff', border:'1.5px solid '+SB, color:SH, fontSize:14, outline:'none', fontFamily:"'Inter',sans-serif", transition:'border .2s', boxSizing:'border-box' };

  const toInstagramEmbedUrl = (url) => {
    if (!url) return '';
    const clean = url.trim().replace(/\?.*$/, '').replace(/\/$/, '');
    return clean.endsWith('/embed') ? clean : clean + '/embed';
  };
  const scrollVideoCarousel = (dir) => {
    if (!videoCarouselRef.current) return;
    videoCarouselRef.current.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  return (
    <div style={{ background: brand.storeBg, overflowX: 'hidden' }}>

      {/* ═══ HERO BANNERS — 4 rotating ═══ */}
      <div style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: heroBanners[heroIndex].gradient, transition: 'background 0.6s ease' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(ellipse 80% 50% at 70% 40%, rgba(59,130,246,.12) 0%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 28px 64px', width: '100%', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 24, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: EMERALD, boxShadow: '0 0 10px ' + EMERALD, display: 'inline-block', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.9)' }}>TheValueStore · Best Value. Maximum Performance.</span>
          </div>
          <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(42px,8vw,72px)', color: '#fff', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 16, fontWeight: 800 }}>
            {heroBanners[heroIndex].title}
          </h1>
          <p style={{ fontSize: 'clamp(14px,1.6vw,17px)', color: 'rgba(255,255,255,.7)', marginBottom: 32, maxWidth: 480, lineHeight: 1.6 }}>
            {heroBanners[heroIndex].subtitle}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={heroBanners[heroIndex].ctaAction} style={{ padding: '16px 32px', borderRadius: 12, background: BLUE, color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', letterSpacing: '.03em', boxShadow: '0 8px 28px rgba(59,130,246,.4)' }}>
              {heroBanners[heroIndex].cta} →
            </button>
            {currentStore && (
              <span style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)', color: '#93C5FD', fontSize: 12, fontWeight: 700 }}>
                ✓ {currentStore.name}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 48, flexWrap: 'wrap' }}>
            {heroBanners.map((b, i) => (
              <button key={i} onClick={() => setHeroIndex(i)} style={{ padding: '8px 14px', borderRadius: 10, background: heroIndex === i ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.2)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                {b.title.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, transparent, ' + brand.storeBg + ')', pointerEvents: 'none' }} />
      </div>

      {/* ═══ TRUST STRIP ═══ */}
      <div style={{ background: BLK, padding: '14px 0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', minWidth: 'max-content', padding: '0 28px' }}>
          {[...trustBadges, ...trustBadges].map((b, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 20px', color: 'rgba(255,255,255,.75)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', borderRight: '1px solid rgba(255,255,255,.12)', whiteSpace: 'nowrap' }}>
              <span style={{ color: BLUE, fontSize: 12 }}>✦</span> {b}
            </span>
          ))}
        </div>
      </div>

      {/* ═══ QUICK CATEGORY GRID ═══ */}
      <div style={{ background: brand.storeBg2, padding: '48px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.28em', textTransform: 'uppercase', color: BLUE }}>SHOP BY CATEGORY</span>
            <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(24px,4vw,36px)', color: SH, marginTop: 10, lineHeight: 1.2 }}>Find Your Gear</h2>
            <p style={{ fontSize: 14, color: SD, marginTop: 10, maxWidth: 520, margin: '10px auto 0' }}>Gaming PCs, laptops, components, monitors, and more — with expert advice and best value.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {quickCategories.map(c => {
              const count = availableProducts.filter(p => p.category === c.key || (c.key === 'cpu' && ['cpu','gpu','motherboard','ram','storage','psu','cooling','cabinet'].includes(p.category))).length;
              return (
                <button key={c.key} onClick={() => { setTab('shop'); setCatFilter(c.key === 'cpu' ? 'cpu' : c.key); document.getElementById('shop-anchor')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ padding: '22px 16px', borderRadius: 18, background: '#fff', border: '1px solid ' + SB, textAlign: 'center', cursor: 'pointer', transition: 'all .2s', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>{c.icon}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: SH, display: 'block', lineHeight: 1.25 }}>{c.label}</span>
                  {c.shortDesc && <span style={{ fontSize: 11, color: SD, marginTop: 6, display: 'block', lineHeight: 1.35 }}>{c.shortDesc}</span>}
                  {count > 0 && <span style={{ fontSize: 10, color: BLUE, fontWeight: 700, marginTop: 8, display: 'inline-block' }}>{count} products</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ VALUE PICKS ═══ */}
      {valuePicks.length > 0 && (
        <div style={{ background: brand.storeBg, padding: '48px 28px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', color: EMERALD }}>VALUE PICKS</span>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(22px,3.5vw,30px)', color: SH, marginTop: 8 }}>Best Price-to-Performance</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {valuePicks.slice(0, 6).map(p => (
                <div key={p.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid ' + SB, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.04)', position: 'relative' }}>
                  {p.image && (
                    <div style={{ aspectRatio: '1', background: brand.storeBg2, position: 'relative' }}>
                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    </div>
                  )}
                  <div style={{ padding: '18px' }}>
                    {p.tag && <span style={{ position: 'absolute', top: 12, right: 12, fontSize: 9, padding: '3px 8px', borderRadius: 6, background: BLUE, color: '#fff', fontWeight: 700 }}>{p.tag}</span>}
                    <div style={{ fontFamily: brand.fontDisplay, fontWeight: 700, color: SH, fontSize: 14, marginBottom: 6, lineHeight: 1.25 }}>{p.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: BLUE }}>₹{p.price?.toLocaleString('en-IN')}</span>
                      {p.available !== false && (
                        <button onClick={() => addToCart(p)} style={{ width: 36, height: 36, borderRadius: 10, background: BLUE, color: '#fff', fontSize: 18, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ BUILD YOUR PC SECTION ═══ */}
      <div style={{ background: 'linear-gradient(135deg,#0D0D0F 0%,#1e3a5f 100%)', padding: '52px 28px', marginBottom: 0 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.28em', color: BLUE }}>PC BUILDER</span>
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(28px,5vw,44px)', color: '#fff', marginTop: 10, marginBottom: 12 }}>Build Your Dream PC</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.65)', marginBottom: 32, maxWidth: 520, margin: '0 auto 32px' }}>Compatibility check · Wattage calculator · FPS estimate · Save & share your build</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 640, margin: '0 auto 28px' }}>
            {buildTypes.map(b => (
              <div key={b.key} style={{ padding: '24px 20px', borderRadius: 16, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
                <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>{b.icon}</span>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>{b.label}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{b.desc}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setTab('builder')} style={{ padding: '16px 40px', borderRadius: 12, background: BLUE, color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(59,130,246,.4)' }}>
            Build Your PC →
          </button>
        </div>
      </div>

      {/* ═══ DEALS SECTION ═══ */}
      <div style={{ background: brand.storeBg2, padding: '44px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', color: GOLD }}>DEALS</span>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(22px,3.5vw,30px)', color: SH, marginTop: 6 }}>Daily Deals & Flash Sales</h2>
            </div>
            <div style={{ display: 'flex', gap: 10, background: 'rgba(0,0,0,.06)', borderRadius: 14, padding: '12px 18px' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: BLUE }}>{String(spotlightH).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: BLUE }}>:</span>
              <span style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: BLUE }}>{String(spotlightM).padStart(2, '0')}</span>
              <span style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: BLUE }}>:</span>
              <span style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: BLUE }}>{String(spotlightS).padStart(2, '0')}</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {activeOffers.slice(0, 4).map(o => (
              <div key={o.id} onClick={() => { setCustInfo(p => ({ ...p, coupon: o.code })); setAppliedOffer(o); show('🎉 ' + o.code + ' applied!'); }} style={{ padding: '20px 22px', borderRadius: 18, border: '1px solid ' + SB, background: '#fff', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,.04)', transition: 'box-shadow .2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 24 }}>{o.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: SH }}>{o.name}</span>
                </div>
                <div style={{ fontSize: 12, color: SD, marginBottom: 12 }}>{o.desc}</div>
                <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: BLUE, background: '#EFF6FF', padding: '5px 12px', borderRadius: 8, border: '1px dashed rgba(59,130,246,.3)' }}>{o.code}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ GAMING ZONE ═══ */}
      <div style={{ background: brand.storeBg, padding: '48px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ background: 'linear-gradient(135deg,#0D0D0F,#312e81)', borderRadius: 20, padding: '32px 28px', marginBottom: 28 }}>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', color: '#A5B4FC' }}>GAMING ZONE</span>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(26px,4vw,38px)', color: '#fff', marginTop: 10 }}>Unleash Next-Gen Gaming Power</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', marginTop: 8 }}>Gaming laptops · RTX GPUs · Mechanical keyboards · Headsets · Chairs</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {gamingZoneProducts.map(p => (
              <div key={p.id} style={{ background: '#fff', borderRadius: 18, border: '1px solid ' + SB, overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,.04)', opacity: p.available !== false ? 1 : 0.6 }}>
                {p.image && (
                  <div style={{ aspectRatio: '1', background: brand.storeBg2 }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                )}
                <div style={{ padding: '18px' }}>
                  {p.tag && <span style={{ fontSize: 8, padding: '3px 8px', borderRadius: 6, background: BLUE, color: '#fff', fontWeight: 700, marginBottom: 8, display: 'inline-block' }}>{p.tag}</span>}
                  <div style={{ fontFamily: brand.fontDisplay, fontWeight: 700, color: SH, fontSize: 14, marginBottom: 8, lineHeight: 1.25 }}>{p.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: BLUE }}>₹{p.price?.toLocaleString('en-IN')}</span>
                    {p.available !== false && <button onClick={() => addToCart(p)} style={{ width: 36, height: 36, borderRadius: 10, background: BLUE, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 700 }}>+</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ BUSINESS SOLUTIONS ═══ */}
      <div style={{ background: brand.storeBg2, padding: '44px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.28em', color: BLUE }}>BUSINESS</span>
            <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(24px,4vw,34px)', color: SH, marginTop: 10 }}>Solutions for Teams & Studios</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {businessSolutions.map(b => (
              <div key={b.label} style={{ background: '#fff', borderRadius: 18, border: '1px solid ' + SB, padding: '24px 20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,.04)' }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>{b.icon}</span>
                <div style={{ fontWeight: 700, color: SH, fontSize: 15, marginBottom: 6 }}>{b.label}</div>
                <div style={{ fontSize: 12, color: SD, lineHeight: 1.5 }}>{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ CSR SECTION ═══ */}
      <div id="csr-anchor" style={{ background: 'linear-gradient(135deg,#064e3b 0%,#0D0D0F 100%)', padding: '52px 28px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.28em', color: EMERALD }}>THEVALUESTORE TECH FOR EDUCATION</span>
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(26px,4vw,40px)', color: '#fff', marginTop: 10, marginBottom: 12 }}>Tech That Gives Back</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.7)', marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>Digital classrooms, rural coding labs, women in tech scholarships, and e-waste recycling — we measure impact by numbers.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {csrPrograms.map(c => (
              <div key={c.title} style={{ padding: '28px 20px', borderRadius: 16, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
                <div style={{ fontFamily: brand.fontDisplay, fontSize: 42, fontWeight: 900, color: EMERALD, lineHeight: 1 }}>{c.stat}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginTop: 10 }}>{c.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginTop: 6 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div id="shop-anchor" style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px 120px' }}>

        {/* STORE / SERVICE CENTER SELECTOR */}
        <div style={{ marginBottom:44 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <span style={{ width:9, height:9, borderRadius:'50%', background:EMERALD, boxShadow:'0 0 8px '+EMERALD, display:'inline-block' }} />
            <span style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:BLUE }}>Choose Your Location</span>
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
                <button key={st.id} onClick={() => setSelectedStore(st.id)} style={{ textAlign:'left', padding:22, borderRadius:18, border:isSel?'2px solid '+BLUE:'2px solid transparent', background:'#fff', boxShadow:isSel?'0 8px 28px rgba(59,130,246,.18)':'0 2px 14px rgba(0,0,0,.06)', cursor:'pointer', transition:'all .2s', outline:'none', position:'relative', overflow:'hidden' }}>
                  {isSel && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,'+BLK+','+BLUE+')' }} />}
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, color:SH, fontSize:17 }}>{st.name}</div>
                    {dist && <span style={{ fontSize:10, padding:'3px 10px', borderRadius:10, background:'#EFF6FF', color:BLUE, fontWeight:800 }}>{dist}</span>}
                  </div>
                  <div style={{ fontSize:12, color:SD, marginBottom:14, lineHeight:1.5 }}>{(st.address||'').slice(0,62)}</div>
                  <div style={{ display:'flex', gap:16, fontSize:12 }}>
                    <span style={{ color:BLUE, fontWeight:700 }}>⚡ Service</span>
                    <span style={{ color:GOLD, fontWeight:700 }}>⭐ {st.rating}</span>
                    <span style={{ color:SD }}>{(st.hours||'').split(' - ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SPOTLIGHT / DEALS CTA */}
        {activeOffers.length > 0 && (
          <div style={{ marginBottom:36, borderRadius:22, overflow:'hidden', background:'linear-gradient(135deg,'+BLK+','+BLUE+')', padding:'30px 32px', display:'grid', gridTemplateColumns:'1fr auto', gap:24, alignItems:'center' }}>
            <div>
              <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.22em', color:GOLD, marginBottom:8 }}>⚡ LIMITED TIME</div>
              <h3 style={{ fontFamily:brand.fontDisplay, fontSize:26, color:'#fff', margin:'0 0 8px' }}>GPU Flash Sale & Laptop Festival</h3>
              <p style={{ fontSize:13, color:'rgba(255,255,255,.6)', margin:'0 0 16px' }}>Use code GPUFLASH or LAPTOP7K at checkout</p>
              <button onClick={() => setTab('deals')} style={{ padding:'11px 22px', borderRadius:10, background:BLUE, color:'#fff', fontWeight:800, fontSize:13, border:'none', cursor:'pointer' }}>View Deals →</button>
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
        <div style={{ position:'sticky', top:54, zIndex:90, background:brand.storeBg, paddingTop:14, paddingBottom:14, marginBottom:32, borderBottom:'1px solid '+SB, marginLeft:-24, marginRight:-24, paddingLeft:24, paddingRight:24 }}>
          <div style={{ display:'flex', gap:6, maxWidth:1200 }}>
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{ display:'flex', alignItems:'center', gap:7, padding:'11px 22px', borderRadius:12, fontSize:13, fontWeight:700, border:'none', cursor:'pointer', transition:'all .15s', background:tab===t.key?BLUE:'transparent', color:tab===t.key?'#fff':SD, boxShadow:tab===t.key?'0 4px 14px rgba(59,130,246,.25)':'none', position:'relative' }}>
                {t.icon} {t.label}
                {t.key==='deals' && activeOffers.length>0 && <span style={{ position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background:brand.red, color:'#fff', fontSize:8, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>{activeOffers.length}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ SHOP ═══ */}
        {tab==='shop' && <>
          {/* Category landing hero — when a category is selected */}
          {catFilter !== 'all' && (() => {
            const meta = categoryLandingMeta[catFilter];
            const title = meta?.title || productCategoriesMap[catFilter] || catFilter;
            const subtitle = meta?.subtitle;
            const description = meta?.description;
            const highlights = meta?.highlights;
            const icon = meta?.icon || '📦';
            return (
              <div style={{ marginBottom: 36 }}>
                <div style={{ background: 'linear-gradient(135deg,' + BLK + ',' + BLUE + ')', borderRadius: 24, padding: '40px 32px', marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 56, lineHeight: 1 }}>{icon}</div>
                    <div style={{ flex: 1, minWidth: 260 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: 'rgba(255,255,255,.7)' }}>CATEGORY</span>
                      <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(24px,4vw,32px)', color: '#fff', marginTop: 8, marginBottom: 8 }}>{title}</h2>
                      {subtitle && <p style={{ fontSize: 15, color: 'rgba(255,255,255,.8)', marginBottom: 14 }}>{subtitle}</p>}
                      {description && <p style={{ fontSize: 14, color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }}>{description}</p>}
                    </div>
                  </div>
                  {highlights && highlights.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,.15)' }}>
                      {highlights.map((h, i) => (
                        <span key={i} style={{ padding: '8px 16px', borderRadius: 20, background: 'rgba(255,255,255,.12)', color: '#fff', fontSize: 12, fontWeight: 600 }}>✓ {h}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Quick reorder */}
          {quickReorderItems.length > 0 && (
            <div style={{ background:'linear-gradient(135deg,#EFF6FF,#F4F4F5)', border:'1px solid #BFDBFE', borderRadius:18, padding:'18px 24px', marginBottom:28, display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
              <div style={{ flex:1, minWidth:180 }}>
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.15em', color:BLUE, marginBottom:4 }}>⚡ QUICK REORDER</div>
                <div style={{ fontSize:13, color:ST }}>Your last order — add again in one tap</div>
              </div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {quickReorderItems.map(i => (
                  <button key={i.name} onClick={() => { const p = availableProducts.find(p => p.name===i.name); if(p){ addToCart(p); show('Added '+p.name); } }} style={{ padding:'9px 16px', borderRadius:20, border:'1px solid #BFDBFE', background:'#fff', color:BLUE, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                    + {i.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category pills */}
          <div style={{ marginBottom:28 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:BLUE, marginBottom:14 }}>Categories</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {categories.map(c => (
                <button key={c} onClick={() => setCatFilter(c)} style={{ padding:'10px 20px', borderRadius:20, background:catFilter===c?BLUE:'#fff', color:catFilter===c?'#fff':SD, fontSize:12, fontWeight:700, border:'1px solid '+(catFilter===c?BLUE:SB), cursor:'pointer', transition:'all .15s' }}>
                  {c==='all' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>

          {/* Command bar */}
          <div style={{ background:'#fff', border:'1px solid '+SB, borderRadius:18, padding:'18px 20px', marginBottom:22, boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products, brands, categories..." style={{ ...inp, margin:'0 0 14px', padding:'13px 18px', borderRadius:12, fontSize:14, background:brand.storeBg2 }} />
            <div style={{ fontSize:10, color:SD, marginBottom:10 }}>Search: autocomplete · trending · AI recommendations (coming soon)</div>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding:'8px 14px', borderRadius:20, border:'1px solid '+SB, background:'#fff', color:SH, fontSize:11, fontWeight:600, outline:'none' }}>
                <option value="recommended">⭐ Recommended</option>
                <option value="popular">🔥 Popular</option>
                <option value="price_asc">💰 Low → High</option>
                <option value="price_desc">💎 High → Low</option>
              </select>
            </div>
          </div>

          {/* Advanced filters placeholder */}
          <div style={{ marginBottom:22 }}>
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.15em', color:BLUE, marginBottom:10 }}>ADVANCED FILTERS (coming soon)</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {['Brand', 'CPU', 'GPU', 'RAM', 'Refresh rate', 'Price range'].map(f => (
                <button key={f} disabled style={{ padding:'8px 16px', borderRadius:20, border:'1px dashed '+SB, background:brand.storeBg2, color:SD, fontSize:12, fontWeight:600, cursor:'not-allowed' }}>{f}</button>
              ))}
            </div>
          </div>

          {/* Shipping info */}
          {currentStore && (
            <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:16, padding:'14px 22px', marginBottom:22, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <span style={{ fontSize:24 }}>🚚</span>
              <div style={{ flex:1 }}>
                <span style={{ fontWeight:700, color:SH, fontSize:14 }}>Free shipping over </span>
                <span style={{ fontWeight:900, color:BLUE }}>₹5,000</span>
                <span style={{ color:SD }}> · Secure checkout · 18-month warranty on select items</span>
              </div>
            </div>
          )}

          {/* Offers strip */}
          {activeOffers.length > 0 && (
            <div style={{ marginBottom:28, display:'flex', gap:14, overflowX:'auto', paddingBottom:6 }}>
              {activeOffers.slice(0,5).map(o => (
                <div key={o.id} onClick={() => { setCustInfo(p=>({...p,coupon:o.code})); setAppliedOffer(o); show('🎉 '+o.code+' applied!'); }} style={{ flexShrink:0, width:248, padding:'20px 22px', borderRadius:18, border:'1px solid '+SB, background:'#fff', cursor:'pointer', boxShadow:'0 2px 12px rgba(0,0,0,.04)', transition:'box-shadow .15s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                    <span style={{ fontSize:26 }}>{o.icon}</span>
                    <span style={{ fontWeight:700, fontSize:14, color:SH }}>{o.name}</span>
                  </div>
                  <div style={{ fontSize:12, color:SD, marginBottom:12 }}>{o.desc}</div>
                  <span style={{ fontFamily:'monospace', fontSize:13, fontWeight:800, color:BLUE, background:'#EFF6FF', padding:'5px 14px', borderRadius:8, border:'1px dashed rgba(59,130,246,.3)' }}>{o.code}</span>
                </div>
              ))}
            </div>
          )}

          {/* Products grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:18, marginBottom:36 }}>
            {filteredProducts.map(p => (
              <div key={p.id} style={{ background:'#fff', borderRadius:22, border:'1px solid '+SB, boxShadow:'0 2px 18px rgba(0,0,0,.05)', overflow:'hidden', opacity:p.available!==false?1:.5, position:'relative', transition:'box-shadow .15s, transform .15s' }}>
                <div style={{ height:4, background:'linear-gradient(90deg,'+BLUE+','+EMERALD+')' }} />
                {p.image && (
                  <div style={{ aspectRatio: '1', background: brand.storeBg2 }}>
                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                  </div>
                )}
                <div style={{ padding:'18px 20px 18px' }}>
                  {p.tag && <span style={{ position:'absolute', top:18, right:16, fontSize:8, padding:'3px 9px', borderRadius:6, background:BLUE, color:'#fff', fontWeight:800, letterSpacing:'.05em' }}>{p.tag}</span>}
                  <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:7 }}>
                    {p.brand && <span style={{ fontSize:9, color:SD, fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em' }}>{p.brand}</span>}
                  </div>
                  <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, color:SH, fontSize:16, marginBottom:4, lineHeight:1.25 }}>{p.name}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:16 }}>
                    <span style={{ fontFamily:brand.fontDisplay, fontSize:23, fontWeight:800, color:BLUE }}>₹{(p.price||0).toLocaleString('en-IN')}</span>
                    {p.available !== false ? (
                      <button onClick={() => addToCart(p)} style={{ width:40, height:40, borderRadius:12, background:BLUE, color:'#fff', fontSize:22, fontWeight:700, border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(59,130,246,.3)' }}>+</button>
                    ) : (
                      <span style={{ fontSize:10, color:brand.red, fontWeight:700, padding:'5px 11px', borderRadius:8, background:'#FEF2F2', border:'1px solid #FECACA' }}>Sold Out</span>
                    )}
                  </div>
                  {cart.find(c => c.id===p.id) && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, justifyContent:'flex-end' }}>
                      <button onClick={() => updateCartQty(p.id, (cart.find(c=>c.id===p.id)?.qty||1)-1)} style={{ width:28, height:28, borderRadius:8, background:brand.storeBg2, color:SH, border:'1px solid '+SB, fontWeight:700, cursor:'pointer', fontSize:14 }}>−</button>
                      <span style={{ fontWeight:800, color:BLUE, minWidth:22, textAlign:'center' }}>{cart.find(c=>c.id===p.id)?.qty}</span>
                      <button onClick={() => addToCart(p)} style={{ width:28, height:28, borderRadius:8, background:'#EFF6FF', color:BLUE, border:'1px solid #BFDBFE', fontWeight:700, cursor:'pointer', fontSize:14 }}>+</button>
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
                <div style={{ fontWeight:700, color:SH, fontSize:14 }}>Chat with us</div>
                <div style={{ fontSize:12, color:SD }}>₹{settings.VIRAL_REFERRAL_FRIEND||500} off first order via WhatsApp</div>
              </div>
              <button onClick={() => window.open?.('https://wa.me/'+waPhone.replace(/[^0-9]/g,''))} style={{ padding:'10px 18px', borderRadius:10, background:'#25D366', color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>Chat</button>
            </div>
            {settings.VIRAL_REFERRAL_ENABLED !== 'false' && (
              <div style={{ background:'#fff', border:'1px solid #E2EBE2', borderLeft:'4px solid '+GOLD, borderRadius:18, padding:'20px 22px', display:'flex', alignItems:'center', gap:16, position:'relative', boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
                <div style={{ width:48, height:48, borderRadius:14, background:GOLD, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:24, flexShrink:0 }}>🎁</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:SH, fontSize:14 }}>Refer & Earn ₹{settings.VIRAL_REFERRAL_REWARD||500}</div>
                  <div style={{ fontSize:12, color:SD }}>Code: <b style={{ color:BLUE, fontFamily:'monospace' }}>{refCode}</b></div>
                </div>
                <button onClick={() => setShareOpen(!shareOpen)} style={{ padding:'10px 18px', borderRadius:10, background:GOLD, color:BLK, fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>Share</button>
                {shareOpen && (
                  <div style={{ position:'absolute', top:'100%', right:0, zIndex:50, background:'#fff', border:'1px solid '+SB, borderRadius:14, padding:10, display:'flex', gap:6, marginTop:6, boxShadow:'0 12px 40px rgba(0,0,0,.1)' }}>
                    <button onClick={() => shareReferral('whatsapp')} style={{ padding:'8px 16px', borderRadius:8, background:'#25D366', color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>WhatsApp</button>
                    <button onClick={() => shareReferral('copy')} style={{ padding:'8px 16px', borderRadius:8, background:BLUE, color:'#fff', fontWeight:700, fontSize:11, border:'none', cursor:'pointer' }}>Copy</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div style={{ background:'#fff', border:'2px solid #EFF6FF', borderRadius:22, padding:'26px 30px', marginBottom:32, boxShadow:'0 6px 28px rgba(59,130,246,.08)' }}>
              <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, color:SH, fontSize:22, marginBottom:22, display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ width:42, height:42, borderRadius:12, background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>🛒</span>
                Your Cart
                <span style={{ fontSize:14, fontWeight:500, color:SD }}>({cart.reduce((a,i)=>a+i.qty,0)} items)</span>
              </div>
              {cart.map(i => (
                <div key={i.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:'1px solid '+brand.storeBg3 }}>
                  <span style={{ color:SH, fontSize:14, fontWeight:600 }}>{i.name}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <button onClick={() => updateCartQty(i.id,i.qty-1)} style={{ width:30, height:30, borderRadius:8, background:brand.storeBg2, color:SH, border:'1px solid '+SB, fontWeight:700, cursor:'pointer', fontSize:14 }}>−</button>
                    <span style={{ fontWeight:800, minWidth:24, textAlign:'center', color:SH }}>{i.qty}</span>
                    <button onClick={() => updateCartQty(i.id,i.qty+1)} style={{ width:30, height:30, borderRadius:8, background:'#EFF6FF', color:BLUE, border:'1px solid #BFDBFE', fontWeight:700, cursor:'pointer', fontSize:14 }}>+</button>
                    <span style={{ fontWeight:700, color:BLUE, minWidth:72, textAlign:'right', fontSize:15 }}>₹{((i.price||0)*i.qty).toLocaleString('en-IN')}</span>
                    <button onClick={() => removeFromCart(i.id)} style={{ color:brand.red, background:'none', border:'none', fontSize:16, cursor:'pointer', padding:'4px' }}>✕</button>
                  </div>
                </div>
              ))}
              <div style={{ paddingTop:20, marginTop:14, fontSize:14 }}>
                {[['Subtotal', fmt(cartTotal)],['GST ('+gstRate+'%)', fmt(gst)],['Delivery', isFreeDelivery?'FREE ✓':'₹'+deliveryCharge]].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:9, color:SD }}>
                    <span>{k}</span>
                    <span style={{ color:k==='Delivery'&&isFreeDelivery?BLUE:SH, fontWeight:k==='Delivery'&&isFreeDelivery?800:400 }}>{v}</span>
                  </div>
                ))}
                {discount > 0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:9, color:EMERALD, fontWeight:700 }}><span>🎁 {appliedOffer?.code}</span><span>−{fmt(discount)}</span></div>}
                <div style={{ display:'flex', justifyContent:'space-between', fontWeight:800, fontSize:24, marginTop:18, paddingTop:18, borderTop:'2px solid '+SB }}>
                  <span style={{ color:SH }}>Total</span>
                  <span style={{ color:BLUE }}>{fmt(grandTotal)}</span>
                </div>
              </div>
              {!checkoutOpen ? (
                <button onClick={openCheckout} style={{ width:'100%', marginTop:20, padding:'16px 28px', borderRadius:14, background:BLUE, color:'#fff', fontSize:16, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(59,130,246,.3)' }}>
                  🛒 Proceed to Checkout · {fmt(grandTotal)}
                </button>
              ) : (
                <div style={{ marginTop:22, padding:'26px', background:brand.storeBg2, borderRadius:18, border:'1px solid '+SB }}>
                  <div style={{ fontSize:11, fontWeight:800, color:BLUE, marginBottom:18, letterSpacing:'.2em' }}>DELIVERY DETAILS</div>
                  {['name','phone','address'].map(f => (
                    <input key={f} placeholder={f==='name'?'Full Name':f==='phone'?'Phone (+91)':'Delivery Address'} value={custInfo[f]} onChange={e => setCustInfo(p=>({...p,[f]:e.target.value}))} style={{ ...inp, marginBottom:10 }} />
                  ))}
                  <div style={{ display:'flex', gap:10, marginBottom:16 }}>
                    {['delivery','pickup'].map(t => (
                      <button key={t} onClick={() => setCustInfo(p=>({...p,type:t}))} style={{ flex:1, padding:12, borderRadius:10, fontSize:13, fontWeight:700, border:'2px solid '+(custInfo.type===t?BLUE:SB), background:custInfo.type===t?'#EFF6FF':'#fff', color:custInfo.type===t?BLUE:SD, cursor:'pointer' }}>
                        {t==='delivery'?'🚚 Delivery':'🏃 Pickup'}
                      </button>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:10, marginBottom:18 }}>
                    <input placeholder="Coupon code" value={custInfo.coupon} onChange={e => setCustInfo(p=>({...p,coupon:e.target.value.toUpperCase()}))} style={{ ...inp, flex:1, textTransform:'uppercase', letterSpacing:'.1em' }} />
                    <button onClick={applyCoupon} style={{ padding:'0 22px', borderRadius:10, background:'rgba(245,158,11,.1)', border:'1.5px solid rgba(245,158,11,.35)', color:GOLD, fontWeight:700, fontSize:12, cursor:'pointer' }}>Apply</button>
                  </div>
                  <button onClick={handlePlace} style={{ width:'100%', padding:'16px 28px', borderRadius:14, background:BLUE, color:'#fff', fontSize:16, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(59,130,246,.3)' }}>
                    ✅ Place Order · {fmt(grandTotal)}
                  </button>
                </div>
              )}
            </div>
          )}
        </>}

        {/* ═══ DEALS ═══ */}
        {tab==='deals' && (
          <div>
            {settings.VIRAL_REFERRAL_ENABLED !== 'false' && (
              <div style={{ background:'linear-gradient(150deg,'+BLK+','+BLUE+')', borderRadius:22, padding:'44px 36px', marginBottom:32, textAlign:'center' }}>
                <div style={{ fontSize:48, marginBottom:14 }}>🎁</div>
                <h3 style={{ fontFamily:brand.fontDisplay, fontSize:30, color:'#fff', marginBottom:10 }}>Refer Friends, Earn Rewards</h3>
                <p style={{ fontSize:14, color:'rgba(255,255,255,.65)', marginBottom:22 }}>They get ₹{settings.VIRAL_REFERRAL_FRIEND||500} off · You earn ₹{settings.VIRAL_REFERRAL_REWARD||500}</p>
                <div style={{ display:'inline-flex', alignItems:'center', gap:14, background:'rgba(255,255,255,.1)', border:'2px dashed rgba(255,255,255,.22)', borderRadius:16, padding:'14px 30px', marginBottom:20 }}>
                  <span style={{ fontFamily:'monospace', fontSize:28, fontWeight:900, color:'#fff' }}>{refCode}</span>
                  <button onClick={() => shareReferral('copy')} style={{ padding:'8px 16px', borderRadius:8, background:'rgba(255,255,255,.2)', color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>📋 Copy</button>
                </div>
                <div><button onClick={() => shareReferral('whatsapp')} style={{ padding:'13px 28px', borderRadius:12, background:'#25D366', color:'#fff', fontWeight:700, fontSize:14, border:'none', cursor:'pointer' }}>💬 Share on WhatsApp</button></div>
              </div>
            )}
            <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', color:BLUE, marginBottom:18 }}>🎉 ACTIVE DEALS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:16, marginBottom:36 }}>
              {activeOffers.map(o => (
                <div key={o.id} style={{ background:'#fff', borderRadius:20, border:'1px solid '+SB, borderLeft:'4px solid '+BLUE, padding:'22px 24px', boxShadow:'0 2px 14px rgba(0,0,0,.04)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                    <span style={{ fontSize:34 }}>{o.icon}</span>
                    <div><div style={{ fontWeight:700, fontSize:16, color:SH }}>{o.name}</div><div style={{ fontSize:12, color:SD, marginTop:3 }}>{o.desc}</div></div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontFamily:'monospace', fontSize:15, fontWeight:800, color:BLUE, background:'#EFF6FF', padding:'6px 18px', borderRadius:8, border:'1px dashed rgba(59,130,246,.3)' }}>{o.code}</span>
                    <button onClick={() => { setCustInfo(p=>({...p,coupon:o.code})); setAppliedOffer(o); setTab('shop'); show('🎉 Applied!'); }} style={{ padding:'10px 20px', borderRadius:10, background:BLUE, color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>Apply →</button>
                  </div>
                  {o.minOrder > 0 && <div style={{ fontSize:11, color:SD, marginTop:10 }}>Min: ₹{o.minOrder}{o.freebieItem ? ' · Free: '+o.freebieItem : ''}</div>}
                </div>
              ))}
            </div>
            {settings.VIRAL_REWARDS_ENABLED !== 'false' && <>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', color:BLUE, marginBottom:18 }}>🏆 LOYALTY TIERS</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:14 }}>
                {rewardsConf.tiers.map((t,i) => (
                  <div key={t.name} style={{ background:'#fff', borderRadius:18, border:'1px solid #E2EBE2', padding:'22px 20px', textAlign:'center', borderTop:'3px solid '+[SD,'#C0C0C0',GOLD,'#4CAF50'][i], boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
                    <div style={{ fontSize:34, marginBottom:10 }}>{['🥉','🥈','🥇','💎'][i]}</div>
                    <div style={{ fontFamily:brand.fontDisplay, fontWeight:700, fontSize:18, color:SH }}>{t.name}</div>
                    <div style={{ fontSize:11, color:SD, marginBottom:12 }}>{t.minPoints}+ pts · {t.multiplier}x</div>
                    {t.perks.map(p => <div key={p} style={{ fontSize:11, color:BLUE, marginBottom:4 }}>✓ {p}</div>)}
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
                <button onClick={() => setShowUserAuth(true)} style={{ padding:'15px 36px', borderRadius:12, background:BLUE, color:'#fff', fontWeight:800, fontSize:15, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(59,130,246,.3)' }}>Sign In</button>
              </div>
            )}
            {customer && customerOrders.length === 0 && (
              <div style={{ textAlign:'center', padding:'68px 24px' }}>
                <div style={{ fontSize:60, marginBottom:18 }}>📦</div>
                <h3 style={{ fontFamily:brand.fontDisplay, fontSize:28, color:SH, marginBottom:16 }}>No orders yet</h3>
                <button onClick={() => setTab('shop')} style={{ padding:'15px 36px', borderRadius:12, background:BLUE, color:'#fff', fontWeight:800, fontSize:15, border:'none', cursor:'pointer', boxShadow:'0 8px 24px rgba(59,130,246,.3)' }}>Browse Shop</button>
              </div>
            )}
            {customerOrders.map(o => (
              <div key={o.id} style={{ background:'#fff', border:'1px solid #E2EBE2', borderRadius:18, padding:'22px 26px', marginBottom:14, boxShadow:'0 2px 10px rgba(0,0,0,.04)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <div><span style={{ fontFamily:'monospace', fontWeight:800, color:SH, fontSize:16 }}>{o.id}</span><span style={{ fontSize:12, color:SD, marginLeft:10 }}>{o.placed}</span></div>
                  <Badge color={o.status==='delivered'?EMERALD:o.status==='out_for_delivery'?brand.blue:brand.gold}>{o.status.replace(/_/g,' ')}</Badge>
                </div>
                <div style={{ fontSize:13, color:SD, marginBottom:12 }}>{o.items.map(i => i.name+' ×'+i.qty).join(', ')}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:800, color:BLUE, fontSize:18 }}>{fmt(o.total)}</span>
                  {o.eta > 0 && o.status !== 'delivered' && <span style={{ color:BLUE, fontSize:12, fontWeight:700 }}>⏱ ~{o.eta} min</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ PC BUILDER ═══ */}
        {tab==='builder' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,'+BLK+','+BLUE+')', borderRadius:26, padding:'52px 40px', marginBottom:36, textAlign:'center' }}>
              <div style={{ fontSize:56, marginBottom:16 }}>🔧</div>
              <h2 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(28px,5vw,42px)', color:'#fff', marginBottom:12 }}>Build Your PC</h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.7)', maxWidth:560, margin:'0 auto 24px' }}>
                Step-by-step compatibility check · Wattage calculator · Add entire build to cart.
              </p>
              <div style={{ display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap', marginBottom:28 }}>
                {buildTypes.map(b => (
                  <div key={b.key} style={{ padding:'20px 28px', borderRadius:16, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.12)' }}>
                    <span style={{ fontSize:28, display:'block', marginBottom:8 }}>{b.icon}</span>
                    <div style={{ fontWeight:700, color:'#fff', fontSize:15 }}>{b.label}</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginTop:4 }}>{b.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-step builder */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:28, alignItems:'start' }}>
              <div style={{ flex:'1 1 400px', minWidth:0 }}>
                {BUILDER_STEP_ORDER.map(step => {
                  const list = builderFilteredByStep[step] || [];
                  const selected = builderSelection[step];
                  const label = BUILDER_STEP_LABELS[step];
                  return (
                    <div key={step} style={{ marginBottom:28, background:'#fff', borderRadius:20, border:'1px solid '+SB, overflow:'hidden', boxShadow:'0 2px 14px rgba(0,0,0,.04)' }}>
                      <div style={{ padding:'14px 20px', background:brand.storeBg2, borderBottom:'1px solid '+SB, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <span style={{ fontWeight:700, color:SH, fontSize:15 }}>{label}</span>
                        {selected && (
                          <button onClick={() => builderClear(step)} style={{ fontSize:12, color:BLUE, background:'none', border:'none', cursor:'pointer', fontWeight:600 }}>Clear</button>
                        )}
                      </div>
                      <div style={{ padding:16 }}>
                        {selected ? (
                          <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'#EFF6FF', borderRadius:12, border:'1px solid #BFDBFE' }}>
                            {selected.image && (
                              <img src={selected.image} alt={selected.name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', background: brand.storeBg2 }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight:700, color:SH, fontSize:14 }}>{selected.name}</div>
                              <div style={{ fontSize:13, color:SD }}>{fmt(selected.price)}</div>
                            </div>
                            <button onClick={() => builderClear(step)} style={{ padding:'8px 14px', borderRadius:10, border:'1px solid '+SB, background:'#fff', color:SD, fontSize:12, cursor:'pointer', fontWeight:600 }}>Change</button>
                          </div>
                        ) : (
                          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12 }}>
                            {list.length === 0 ? (
                              <div style={{ fontSize:13, color:SD, gridColumn:'1 / -1' }}>No compatible options. Select previous steps first.</div>
                            ) : (
                              list.map(p => (
                                <button key={p.id} onClick={() => builderSelect(step, p)} style={{ display:'flex', flexDirection:'column', alignItems:'stretch', padding:0, borderRadius:14, border:'1px solid '+SB, background:'#fff', color:SH, fontSize:13, fontWeight:600, cursor:'pointer', textAlign:'left', overflow:'hidden', transition:'all .2s', boxShadow:'0 2px 8px rgba(0,0,0,.04)' }}>
                                  {p.image && (
                                    <div style={{ aspectRatio: '1', background: brand.storeBg2 }}>
                                      <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                                    </div>
                                  )}
                                  <div style={{ padding: '12px 14px' }}>
                                    <div style={{ marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                                    <div style={{ fontSize: 13, color: BLUE, fontWeight: 800 }}>{fmt(p.price)}</div>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary + Wattage + Add to cart */}
              <div style={{ flex:'0 0 340px', position:'sticky', top:24 }}>
                <div style={{ background:'#fff', borderRadius:20, border:'1px solid '+SB, padding:24, boxShadow:'0 2px 14px rgba(0,0,0,.04)' }}>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.18em', color:SD, marginBottom:12 }}>BUILD SUMMARY</div>
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ color:SD, fontSize:13 }}>Estimated system draw</span>
                      <span style={{ fontWeight:700, color:SH }}>{builderTotalTdp} W</span>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ color:SD, fontSize:13 }}>Recommended PSU</span>
                      <span style={{ fontWeight:700, color:BLUE }}>≥ {builderRecommendedPsuWatts} W</span>
                    </div>
                  </div>
                  <div style={{ borderTop:'1px solid '+SB, paddingTop:16, marginBottom:16 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontWeight:700, color:SH, fontSize:18 }}>Build total</span>
                      <span style={{ fontWeight:800, color:BLUE, fontSize:22 }}>{fmt(builderBuildTotal)}</span>
                    </div>
                  </div>
                  <button onClick={builderAddBuildToCart} disabled={builderBuildTotal===0} style={{ width:'100%', padding:'16px 24px', borderRadius:12, background:builderBuildTotal===0 ? '#ccc' : BLUE, color:'#fff', fontSize:15, fontWeight:700, border:'none', cursor:builderBuildTotal===0 ? 'not-allowed' : 'pointer', boxShadow: builderBuildTotal===0 ? 'none' : '0 8px 24px rgba(59,130,246,.4)' }}>
                    Add entire build to cart
                  </button>
                  <div style={{ marginTop:12, fontSize:12, color:SD, textAlign:'center' }}>
                    {Object.keys(builderSelection).filter(s => builderSelection[s]).length} of {BUILDER_STEP_ORDER.length} steps selected
                  </div>
                </div>
              </div>
            </div>

            {/* Partner builds */}
            <div style={{ marginTop:32, padding:28, background:'linear-gradient(135deg,#EFF6FF,#F4F4F5)', borderRadius:20, border:'1px solid #BFDBFE' }}>
              <div style={{ fontSize:11, fontWeight:800, letterSpacing:'.18em', color:BLUE, marginBottom:10 }}>PARTNER BUILDS</div>
              <h3 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:SH, marginBottom:10 }}>Influencer & affiliate builds</h3>
              <p style={{ fontSize:13, color:SD, marginBottom:16 }}>Curated builds from our partners with referral links. Commission dashboard in Admin.</p>
              <button onClick={() => show('Influencer build pages & commission dashboard coming soon.')} style={{ padding:'10px 20px', borderRadius:10, background:BLUE, color:'#fff', fontWeight:700, fontSize:12, border:'none', cursor:'pointer' }}>View Partner Builds</button>
            </div>
          </div>
        )}

        {/* ═══ CSR / TECH FOR GOOD ═══ */}
        {tab==='csr' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,#064e3b 0%,'+BLK+')', borderRadius:26, padding:'48px 40px', marginBottom:36, textAlign:'center' }}>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.28em', color:EMERALD }}>THEVALUESTORE TECH FOR EDUCATION</span>
              <h2 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(26px,4vw,38px)', color:'#fff', marginTop:12, marginBottom:12 }}>Tech That Gives Back</h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.7)', maxWidth:560, margin:'0 auto' }}>Digital classrooms, rural coding labs, women in tech scholarships, and e-waste recycling — we measure impact by numbers.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:20 }}>
              {csrPrograms.map(c => (
                <div key={c.title} style={{ background:'#fff', borderRadius:20, border:'1px solid '+SB, padding:'28px 24px', textAlign:'center', boxShadow:'0 2px 14px rgba(0,0,0,.04)' }}>
                  <div style={{ fontFamily:brand.fontDisplay, fontSize:40, fontWeight:900, color:EMERALD, lineHeight:1 }}>{c.stat}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:SH, marginTop:12 }}>{c.title}</div>
                  <div style={{ fontSize:12, color:SD, marginTop:6 }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ CONTENT HUB ═══ */}
        {tab==='content' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,'+BLK+','+BLUE+')', borderRadius:26, padding:'48px 40px', marginBottom:36, textAlign:'center' }}>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.28em', color:BLUE }}>CONTENT HUB</span>
              <h2 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(26px,4vw,38px)', color:'#fff', marginTop:12, marginBottom:12 }}>Tech Blog · Buying Guides · Video Hub</h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.7)', maxWidth:560, margin:'0 auto' }}>Articles, guides, and videos to help you choose and get the most from your gear.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 }}>
              {[{ title:'Tech Blog', desc:'Reviews, benchmarks, and how-tos', icon:'📝' }, { title:'Buying Guides', desc:'PC, laptop, GPU, monitor guides', icon:'📚' }, { title:'Video Hub', desc:'YouTube reviews and build logs', icon:'🎬' }].map(c => (
                <div key={c.title} style={{ background:'#fff', borderRadius:20, border:'1px solid '+SB, padding:'28px 24px', textAlign:'center', boxShadow:'0 2px 14px rgba(0,0,0,.04)' }}>
                  <span style={{ fontSize:40, display:'block', marginBottom:12 }}>{c.icon}</span>
                  <div style={{ fontSize:18, fontWeight:700, color:SH, marginBottom:8 }}>{c.title}</div>
                  <div style={{ fontSize:13, color:SD }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:32, padding:24, background:brand.storeBg2, borderRadius:16, border:'1px dashed '+SB, textAlign:'center' }}>
              <div style={{ fontSize:13, color:SD }}>Content hub (tech blog, buying guides, video hub) — full module coming soon.</div>
            </div>
          </div>
        )}

        {/* ═══ COMMUNITY ═══ */}
        {tab==='community' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,'+BLK+','+brand.purple+')', borderRadius:26, padding:'48px 40px', marginBottom:36, textAlign:'center' }}>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.28em', color:'#A78BFA' }}>COMMUNITY</span>
              <h2 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(26px,4vw,38px)', color:'#fff', marginTop:12, marginBottom:12 }}>Build Gallery · Ratings & Reviews</h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.7)', maxWidth:560, margin:'0 auto' }}>Share your builds, rate products, and read reviews from the community.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 }}>
              {[{ title:'Build Gallery', desc:'Featured and community PC builds', icon:'🖼️' }, { title:'Ratings & Reviews', desc:'Product reviews and star ratings', icon:'⭐' }].map(c => (
                <div key={c.title} style={{ background:'#fff', borderRadius:20, border:'1px solid '+SB, padding:'28px 24px', textAlign:'center', boxShadow:'0 2px 14px rgba(0,0,0,.04)' }}>
                  <span style={{ fontSize:40, display:'block', marginBottom:12 }}>{c.icon}</span>
                  <div style={{ fontSize:18, fontWeight:700, color:SH, marginBottom:8 }}>{c.title}</div>
                  <div style={{ fontSize:13, color:SD }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:32, padding:24, background:brand.storeBg2, borderRadius:16, border:'1px dashed '+SB, textAlign:'center' }}>
              <div style={{ fontSize:13, color:SD }}>Community (build gallery, ratings/reviews) — full module coming soon.</div>
            </div>
          </div>
        )}

        {/* ═══ MARKETPLACE ═══ */}
        {tab==='marketplace' && (
          <div>
            <div style={{ background:'linear-gradient(135deg,'+BLK+','+EMERALD+')', borderRadius:26, padding:'48px 40px', marginBottom:36, textAlign:'center' }}>
              <span style={{ fontSize:10, fontWeight:800, letterSpacing:'.28em', color:EMERALD }}>MARKETPLACE</span>
              <h2 style={{ fontFamily:brand.fontDisplay, fontSize:'clamp(26px,4vw,38px)', color:'#fff', marginTop:12, marginBottom:12 }}>Third-Party Sellers</h2>
              <p style={{ fontSize:15, color:'rgba(255,255,255,.7)', maxWidth:560, margin:'0 auto' }}>Shop from TheValueStore and verified third-party sellers. Same trust, more choice.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:20 }}>
              {[{ title:'TheValueStore', desc:'Official catalog', icon:'🛒' }, { title:'Partner Sellers', desc:'Verified third-party listings', icon:'🏪' }].map(c => (
                <div key={c.title} style={{ background:'#fff', borderRadius:20, border:'1px solid '+SB, padding:'28px 24px', textAlign:'center', boxShadow:'0 2px 14px rgba(0,0,0,.04)' }}>
                  <span style={{ fontSize:40, display:'block', marginBottom:12 }}>{c.icon}</span>
                  <div style={{ fontSize:18, fontWeight:700, color:SH, marginBottom:8 }}>{c.title}</div>
                  <div style={{ fontSize:13, color:SD }}>{c.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:32, padding:24, background:brand.storeBg2, borderRadius:16, border:'1px dashed '+SB, textAlign:'center' }}>
              <div style={{ fontSize:13, color:SD }}>Marketplace (third-party sellers) — full module coming soon.</div>
            </div>
          </div>
        )}

        {/* ═══ INSTAGRAM / FOLLOW US ═══ */}
        {instagramFeed.active && instagramPosts.length > 0 && (
          <div style={{ marginTop:52, marginBottom:36 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:22 }}>
              <div>
                <span style={{ fontSize:11, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:BLUE }}>📸 FOLLOW US</span>
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
        <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:800, padding:'14px 24px 24px', background:'linear-gradient(to top,'+brand.storeBg+' 60%,transparent)', pointerEvents:'none' }}>
          <div style={{ maxWidth:620, margin:'0 auto', pointerEvents:'all' }}>
            <button onClick={openCheckout} style={{ width:'100%', padding:'17px 28px', borderRadius:18, background:BLUE, color:'#fff', fontSize:15, fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 10px 36px rgba(59,130,246,.42)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ background:'rgba(255,255,255,.18)', borderRadius:20, padding:'4px 14px', fontSize:13 }}>{cart.reduce((a,i)=>a+i.qty,0)} items</span>
              <span>View Cart &amp; Checkout</span>
              <span style={{ fontFamily:brand.fontDisplay, fontSize:19 }}>{fmt(grandTotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM NAV */}
      <div style={{ position:'fixed', left:'50%', transform:'translateX(-50%)', bottom:cart.length>0?88:18, zIndex:900, background:'rgba(255,255,255,.96)', backdropFilter:'blur(14px)', border:'1px solid rgba(0,0,0,.07)', borderRadius:22, padding:'7px', display:'flex', gap:5, maxWidth:'calc(100vw - 32px)', overflowX:'auto', boxShadow:'0 10px 36px rgba(0,0,0,.13)' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding:'10px 14px', borderRadius:16, border:'none', background:tab===t.key?BLUE:'transparent', color:tab===t.key?'#fff':SD, fontSize:11, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', transition:'all .15s', flexShrink:0, position:'relative' }}>
            {t.icon} {t.label}
            {t.key==='deals' && activeOffers.length>0 && <span style={{ position:'absolute', top:6, right:6, width:16, height:16, borderRadius:'50%', background:brand.red, color:'#fff', fontSize:8, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>{activeOffers.length}</span>}
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
    { from:'bot', text:'👋 Welcome to TheValueStore! I can help you with:\n\n🛒 Shop PCs & components\n📦 Track order\n⚡ Deals & coupons\n🔧 PC Builder\n🌱 Tech for Good\n\nJust type or tap below!' }
  ]);
  const [input, setInput] = useState('');
  const accent = brand.blueElectric;
  const quickReplies = ['🛒 Shop','📦 Track Order','⚡ Deals','🔧 PC Builder'];
  const botReply = (text) => {
    const t = text.toLowerCase();
    if (t.includes('shop')||t.includes('pc')||t.includes('laptop')||t.includes('gpu')) return '🛒 Our top picks:\n\n• Gaming PCs from ₹85K\n• RTX 4070 Super — ₹59K\n• Gaming laptops from ₹75K\n\nTap the Shop tab to browse!';
    if (t.includes('track')||t.includes('status')||t.includes('order')) return '📦 To track your order, share your Order ID or check the Orders tab above.';
    if (t.includes('deal')||t.includes('coupon')||t.includes('offer')) return '⚡ Active: GPUFLASH ₹3K off, LAPTOP7K ₹7K off, WELCOME15 15% first order. Apply at checkout!';
    if (t.includes('builder')||t.includes('build')) return '🔧 PC Builder: compatibility check, wattage calc, save & share. Tap PC Builder tab for the tool.';
    if (t.includes('hello')||t.includes('hi')) return '👋 Hi! Need help with gaming PCs, laptops, or deals? Just ask.';
    return '🤔 I can help with: Shop, Track order, Deals, PC Builder. Or tap a quick reply below!';
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
      <div style={{ padding:'14px 20px', background:accent, color:'#fff', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:38, height:38, borderRadius:19, background:'rgba(255,255,255,.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>🤖</div>
          <div><div style={{ fontWeight:700, fontSize:14 }}>TheValueStore</div><div style={{ fontSize:10, opacity:.75 }}>Online · Replies instantly</div></div>
        </div>
        <button onClick={() => setOpen(false)} style={{ color:'#fff', background:'none', border:'none', fontSize:18, cursor:'pointer' }}>✕</button>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'14px 16px', background:'#F0F4F0', maxHeight:328 }}>
        {msgs.map((m,i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start', marginBottom:8 }}>
            <div style={{ maxWidth:'82%', padding:'10px 14px', borderRadius:m.from==='user'?'16px 16px 4px 16px':'16px 16px 16px 4px', background:m.from==='user'?accent:'#fff', color:m.from==='user'?'#fff':'#333', fontSize:13, lineHeight:1.55, whiteSpace:'pre-wrap', boxShadow:m.from==='bot'?'0 1px 4px rgba(0,0,0,.06)':'none' }}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:'7px 16px', background:'#fff', display:'flex', gap:4, overflowX:'auto', borderTop:'1px solid #E8F5E9' }}>
        {quickReplies.map(q => <button key={q} onClick={() => send(q)} style={{ padding:'6px 12px', borderRadius:16, background:'#EFF6FF', color:accent, fontSize:11, fontWeight:600, border:'none', cursor:'pointer', whiteSpace:'nowrap', flexShrink:0 }}>{q}</button>)}
      </div>
      <div style={{ padding:'10px 16px', background:'#fff', display:'flex', gap:8, borderTop:'1px solid #E8F5E9' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && send()} placeholder="Type a message..." style={{ flex:1, padding:'10px 14px', borderRadius:24, background:'#F0F4F0', border:'none', fontSize:13, outline:'none', color:'#333' }} />
        <button onClick={() => send()} style={{ width:42, height:42, borderRadius:21, background:accent, color:'#fff', border:'none', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>→</button>
      </div>
      <div style={{ padding:'8px 16px', background:'#F8FAF8', textAlign:'center', borderTop:'1px solid #E8F5E9' }}>
        <button onClick={() => window.open?.('https://wa.me/'+waPhone.replace(/[^0-9]/g,''))} style={{ fontSize:11, color:'#25D366', fontWeight:700, background:'none', border:'none', cursor:'pointer' }}>Continue on WhatsApp →</button>
      </div>
    </div>}
  </>;
}
