'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { brand } from '@/lib/brand';
import { t } from '@/lib/i18n';
import { catalogProducts, catalogCategories } from '@/data/catalog';
import { seedOffers } from '@/data/seedData';
import { cmsDb } from '@/data/cmsDb';
import { fmt } from '@/lib/utils';

/** Configurable brand landing + homepage with 50 e‑commerce features (best-in-class). */
export default function StoreHome({ onNavigate }) {
  const { cart, addToCart, customer, setShowUserAuth, settings, userLocation, setUserLocation, storeTheme } = useApp();
  const { language, setLanguage, currency, setCurrency, languages, currencies, detectLocation, locationLoading } = useLocale();

  const theme = storeTheme === 'dark' ? brand.storeDark : brand;
  const G = brand.green;
  const GM = brand.greenMint;
  const SH = theme.storeHeading;
  const SD = theme.storeDim;
  const SB = theme.storeBorder;

  const [searchQuery, setSearchQuery] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const s = localStorage.getItem('tvs_recently_viewed');
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [announcementBar, setAnnouncementBar] = useState(settings.ANNOUNCEMENT_BAR !== 'false');
  const [heroSlide, setHeroSlide] = useState(0);

  // Hero: use CMS heroBanners when available (title, subtitle, cta, gradient), else settings + inline slides
  const heroSlides = useMemo(() => {
    const fromCms = (cmsDb.heroBanners || []).filter((b) => b.active).sort((a, b) => (a.order || 0) - (b.order || 0)).slice(0, 6);
    if (fromCms.length > 0) {
      return fromCms.map((b) => ({
        title: b.title,
        subtitle: b.subtitle || '',
        cta: b.cta || t(language, 'shopNow'),
        cta2: b.ctaLink === '/buildpc' ? t(language, 'buildYourPc') : null,
        gradient: b.gradient,
        imageUrl: b.imageUrl,
      }));
    }
    return [
      { title: settings.HERO_TITLE || brand.tagline, subtitle: settings.HERO_SUBTITLE || 'Gaming PCs · Laptops · Build Your PC', cta: t(language, 'shopNow'), cta2: t(language, 'buildYourPc'), gradient: null, imageUrl: null },
      { title: 'Free Delivery on Orders Above ₹' + (settings.DELIVERY_FREE_ABOVE || '499'), subtitle: '60-Minute Delivery · Best Prices', cta: t(language, 'shopNow'), cta2: null, gradient: null, imageUrl: null },
      { title: 'Build Your Dream PC', subtitle: '50+ Features · Compatibility Check · Save & Share', cta: t(language, 'buildYourPc'), cta2: t(language, 'shopNow'), gradient: null, imageUrl: null },
    ];
  }, [language, settings.HERO_TITLE, settings.HERO_SUBTITLE, settings.DELIVERY_FREE_ABOVE]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(() => setHeroSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  const searchResults = useMemo(() => {
    const list = Array.isArray(catalogProducts) ? catalogProducts : [];
    if (!searchQuery.trim()) return list.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return list.filter((p) => p.name?.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q))).slice(0, 12);
  }, [searchQuery]);

  const dealOfTheDay = useMemo(() => {
    const list = Array.isArray(seedOffers) ? seedOffers : [];
    const active = list.filter((o) => o.active);
    return (active[0] || list[0]) || null;
  }, []);
  const flashDeals = useMemo(() => (Array.isArray(seedOffers) ? seedOffers : []).filter((o) => o.active).slice(0, 8), []);
  const trending = useMemo(() => (Array.isArray(catalogProducts) ? catalogProducts : []).filter((p) => p.tag === 'bestseller').slice(0, 8), []);
  const newArrivals = useMemo(() => (Array.isArray(catalogProducts) ? catalogProducts : []).filter((p) => p.tag === 'new').slice(0, 8), []);
  const featuredCategories = useMemo(() => (Array.isArray(catalogCategories) ? catalogCategories : []).slice(0, 12), []);

  // Promo banners from CMS (next 3 after hero in heroBanners)
  const promoBanners = useMemo(() => (cmsDb.heroBanners || []).filter((b) => b.active).slice(3, 6), []);

  const cardStyle = { background: theme.storeCard, border: `1px solid ${SB}`, borderRadius: 12, overflow: 'hidden', boxShadow: storeTheme === 'dark' ? '0 1px 3px rgba(0,0,0,.3)' : '0 1px 3px rgba(15,23,42,.06)' };

  const categoryIcon = (catId) => {
    const map = { 'gaming-pc': '🖥️', 'laptop': '💻', 'cpu': '⚡', 'gpu': '🎮', 'motherboard': '🔌', 'ram': '📦', 'storage': '💾', 'psu': '🔋', 'case': '🖼️', 'monitor': '🖥️', 'keyboard': '⌨️', 'mouse': '🖱️', 'headset': '🎧', 'accessory': '🔧', 'software': '📀' };
    return map[catId] || '🖥️';
  };

  const addToRecent = (p) => {
    setRecentlyViewed((prev) => {
      const next = [{ ...p, viewedAt: Date.now() }, ...prev.filter((x) => x.id !== p.id)].slice(0, 10);
      try { localStorage.setItem('tvs_recently_viewed', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const formatPrice = (price) => (currency === 'INR' ? `₹${fmt(price)}` : `$${Math.round(price / 83)}`);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 80px', background: theme.storeBg }}>
      {/* 44. Announcement bar — from CMS or settings */}
      {announcementBar && (
        <div style={{
          background: (cmsDb.announcementBar && cmsDb.announcementBar.active) ? (cmsDb.announcementBar.bgColor || theme.storeHeading) : theme.storeHeading,
          color: (cmsDb.announcementBar && cmsDb.announcementBar.active) ? (cmsDb.announcementBar.textColor || '#fff') : '#fff',
          padding: '10px 20px', textAlign: 'center', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span>🖥️</span>
          {(cmsDb.announcementBar && cmsDb.announcementBar.active && cmsDb.announcementBar.text) || settings.ANNOUNCEMENT_TEXT || 'Free delivery on orders above ₹' + (settings.DELIVERY_FREE_ABOVE || '999') + ' · Gaming PCs · Laptops · Build Your PC'}
          <button onClick={() => setAnnouncementBar(false)} style={{ marginLeft: 8, background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', cursor: 'pointer', padding: '2px 8px', borderRadius: 4 }}>✕</button>
        </div>
      )}

      {/* 1. Hero carousel — from CMS heroBanners or inline slides */}
      <section style={{
        position: 'relative',
        borderRadius: 20,
        marginBottom: 32,
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${theme.storeHeroStart || brand.greenDark} 0%, ${theme.storeHeroMid || brand.greenDark} 50%, ${theme.storeHeroEnd || brand.greenDark} 100%)`,
        minHeight: 340,
        boxShadow: '0 20px 60px rgba(15,23,42,.25)',
      }}>
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              padding: '56px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              opacity: heroSlide === i ? 1 : 0,
              transition: 'opacity .5s ease',
              background: slide.gradient || 'transparent',
              backgroundImage: slide.imageUrl ? `linear-gradient(to right, rgba(0,0,0,.5), transparent 40%), url(${slide.imageUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: 12 }}>Gaming PCs · Laptops · Tech</span>
            <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(32px,6vw,48px)', color: '#fff', marginBottom: 12, lineHeight: 1.1, letterSpacing: '-0.02em', textShadow: '0 1px 4px rgba(0,0,0,.3)' }}>{slide.title}</h1>
            <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 17, marginBottom: 28, maxWidth: 480 }}>{slide.subtitle}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => onNavigate?.('menu')} style={{ padding: '14px 28px', borderRadius: 10, background: '#fff', color: G, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,.15)' }}>{slide.cta}</button>
              {slide.cta2 && (
                <button
                  onClick={() => onNavigate?.('buildpc')}
                  style={{
                    padding: '14px 28px',
                    borderRadius: 10,
                    background: 'rgba(255,255,255,.12)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    border: '1px solid rgba(255,255,255,.35)',
                    cursor: 'pointer',
                  }}
                >
                  {slide.cta2}
                </button>
              )}
            </div>
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', background: heroSlide === i ? '#fff' : 'rgba(255,255,255,.4)', cursor: 'pointer' }} />
          ))}
        </div>
      </section>

      {/* Promo banners strip — from CMS heroBanners (secondary) */}
      {promoBanners.length > 0 && (
        <section style={{ marginBottom: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {promoBanners.map((b) => (
            <a
              key={b.id}
              href={b.ctaLink || '#'}
              onClick={(e) => { if (b.ctaLink === '/menu' || b.ctaLink === '/buildpc') { e.preventDefault(); onNavigate?.(b.ctaLink === '/buildpc' ? 'buildpc' : 'menu'); } }}
              style={{
                display: 'block', padding: 24, borderRadius: 16, background: b.gradient || theme.storeBg2, border: `1px solid ${SB}`,
                color: '#fff', textDecoration: 'none', minHeight: 120, position: 'relative', overflow: 'hidden',
                backgroundImage: b.imageUrl ? `url(${b.imageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center',
              }}
            >
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, textShadow: '0 1px 2px rgba(0,0,0,.5)' }}>{b.title}</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>{b.subtitle}</div>
                <span style={{ display: 'inline-block', marginTop: 12, padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,.2)', fontWeight: 700, fontSize: 12 }}>{b.cta}</span>
              </div>
            </a>
          ))}
        </section>
      )}

      {/* 2. Global search — prominent store search */}
      <section style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'stretch', flexWrap: 'wrap', maxWidth: 640 }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: SD }}>🔍</span>
            <input
              type="search"
              placeholder={t(language, 'searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '14px 18px 14px 44px', borderRadius: 10, border: `1.5px solid ${SB}`, fontSize: 14, outline: 'none', background: theme.storeBg2 }}
            />
          </div>
          <button onClick={() => onNavigate?.('menu')} style={{ padding: '14px 28px', borderRadius: 10, background: G, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>{t(language, 'search')}</button>
          <button
            type="button"
            onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('kynetra-open', { detail: { message: searchQuery.trim() || 'Find gaming laptops under 60k', send: true } }))}
            style={{ padding: '14px 20px', borderRadius: 10, background: theme.storeBg3, color: SH, fontWeight: 600, border: `1px solid ${SB}`, cursor: 'pointer', fontSize: 13 }}
          >
            💬 Search with Kynetra
          </button>
        </div>
        {searchQuery && (
          <div style={{ marginTop: 14, padding: 16, background: theme.storeBg2, borderRadius: 12, border: `1px solid ${SB}`, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {searchResults.map((p) => (
              <div key={p.id} onClick={() => { addToRecent(p); onNavigate?.('menu', p.id); }} style={{ ...cardStyle, padding: 12, cursor: 'pointer' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: SH, marginTop: 8 }}>{p.name.slice(0, 30)}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: G }}>{formatPrice(p.price)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Kynetra deep integration — Ask Kynetra strip (20 years ahead: AI-first help) */}
      <section style={{ marginBottom: 28, padding: '16px 20px', background: theme.storeBg2, borderRadius: 16, border: `1px solid ${SB}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: SH, marginBottom: 12 }}>💬 Ask Kynetra — natural language search & help</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Best gaming PC under 50k', 'Build my PC', 'Track my order', 'What deals do you have?', 'Gaming laptop for coding'].map((msg) => (
            <button key={msg} type="button" onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('kynetra-open', { detail: { message: msg, send: true } }))} style={{ padding: '8px 16px', borderRadius: 20, border: `1px solid ${SB}`, background: theme.storeCard, color: SH, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{msg}</button>
          ))}
        </div>
      </section>

      {/* 13. Language switcher | 14. Currency switcher | 15. Location */}
      <section style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: SD }}>{t(language, 'language')}:</span>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${SB}`, fontSize: 12 }}>
            {languages.map((l) => (
              <option key={l.code} value={l.code}>{l.native}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: SD }}>{t(language, 'currency')}:</span>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${SB}`, fontSize: 12 }}>
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>
            ))}
          </select>
        </div>
        <button onClick={detectLocation} disabled={locationLoading} style={{ padding: '8px 16px', borderRadius: 8, background: GM, color: G, fontWeight: 600, fontSize: 12, border: `1px solid #C8E6C9`, cursor: 'pointer' }}>
          {locationLoading ? '…' : '📍'} {t(language, 'detectLocation')}
        </button>
        {userLocation && <span style={{ fontSize: 11, color: G }}>✓ Location detected</span>}
      </section>

      {/* 4. Category grid — computer store categories with icons */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: SH, marginBottom: 18, letterSpacing: '-0.02em' }}>{t(language, 'categories')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
          {featuredCategories.map((cat) => (
            <button key={cat.id} onClick={() => onNavigate?.('menu', null, cat.id)} style={{ ...cardStyle, padding: 20, textAlign: 'center', cursor: 'pointer', border: 'none' }}>
              <div style={{ width: 52, height: 52, margin: '0 auto 10px', borderRadius: 12, background: theme.storeBg3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{categoryIcon(cat.id)}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: SH }}>{cat.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Deal of the day | 6. Flash sales */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: SH, marginBottom: 18, letterSpacing: '-0.02em' }}>Deal of the day</h2>
        {dealOfTheDay && (
        <div style={{ ...cardStyle, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 32 }}>🎁</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: SH }}>{dealOfTheDay.name}</div>
            <div style={{ fontSize: 12, color: SD }}>Code: <strong style={{ fontFamily: 'monospace', color: G }}>{dealOfTheDay.code}</strong></div>
          </div>
          <button onClick={() => onNavigate?.('offers')} style={{ padding: '12px 24px', borderRadius: 10, background: G, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>View offer</button>
        </div>
        )}
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
          {flashDeals.map((o) => (
            <div key={o.id} onClick={() => onNavigate?.('offers')} style={{ flexShrink: 0, width: 200, padding: 18, ...cardStyle, cursor: 'pointer' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: SH }}>{o.name}</div>
              <div style={{ fontSize: 12, color: G, marginTop: 6, fontFamily: 'monospace' }}>{o.code}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Trending | 10. New arrivals — product cards computer store style */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: SH, marginBottom: 18, letterSpacing: '-0.02em' }}>Trending</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {trending.map((p) => (
            <div key={p.id} style={{ ...cardStyle }}>
              <div style={{ position: 'relative', background: theme.storeBg2 }} onClick={() => { addToRecent(p); onNavigate?.('menu', p.id); }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover' }} />
                {p.tag && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, padding: '4px 8px', borderRadius: 6, background: G, color: '#fff', fontWeight: 700 }}>{p.tag}</span>}
                <button type="button" onClick={(e) => { e.stopPropagation(); typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('kynetra-open', { detail: { message: 'Tell me about ' + p.name, send: true } })); }} style={{ position: 'absolute', bottom: 8, left: 8, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 11, border: 'none', cursor: 'pointer' }}>💬 Ask</button>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: SH }}>{p.name.slice(0, 36)}</div>
                <div style={{ fontSize: 11, color: SD, marginTop: 4 }}>⭐ {p.rating} ({p.reviewCount})</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <span style={{ fontWeight: 700, fontSize: 16, color: G }}>{formatPrice(p.price)}</span>
                  <button onClick={() => addToCart(p)} style={{ padding: '8px 14px', borderRadius: 8, background: G, color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{t(language, 'addToCart')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: SH, marginBottom: 18, letterSpacing: '-0.02em' }}>New arrivals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {newArrivals.slice(0, 4).map((p) => (
            <div key={p.id} style={{ ...cardStyle }}>
              <div style={{ position: 'relative', background: theme.storeBg2 }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover' }} />
                <button type="button" onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('kynetra-open', { detail: { message: 'Tell me about ' + p.name, send: true } }))} style={{ position: 'absolute', bottom: 8, left: 8, padding: '6px 10px', borderRadius: 8, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 11, border: 'none', cursor: 'pointer' }}>💬 Ask</button>
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: SH }}>{p.name.slice(0, 36)}</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: G, marginTop: 6 }}>{formatPrice(p.price)}</div>
                <button onClick={() => addToCart(p)} style={{ width: '100%', marginTop: 10, padding: 10, borderRadius: 8, background: theme.storeBg3, color: SH, fontSize: 12, fontWeight: 700, border: `1px solid ${SB}`, cursor: 'pointer' }}>{t(language, 'addToCart')}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Kynetra recommends for you — 20 years ahead: AI-driven suggestions */}
      {trending.length >= 2 && (
        <section style={{ marginBottom: 32, padding: '20px', background: theme.storeBg2, borderRadius: 16, border: `1px solid ${SB}` }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: SH, marginBottom: 12 }}>✨ Kynetra recommends for you</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {trending.slice(0, 4).map((p) => (
              <div key={p.id} style={{ ...cardStyle, padding: 12 }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ fontSize: 12, fontWeight: 600, color: SH, marginTop: 8 }}>{p.name.slice(0, 28)}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: G }}>{formatPrice(p.price)}</div>
                <button type="button" onClick={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('kynetra-open', { detail: { message: 'Why did you recommend ' + p.name + '?', send: true } }))} style={{ marginTop: 8, padding: '6px 12px', borderRadius: 8, background: theme.storeBg3, color: SH, fontSize: 11, border: `1px solid ${SB}`, cursor: 'pointer' }}>Ask why</button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: SH, marginBottom: 16 }}>Recently viewed</h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {recentlyViewed.slice(0, 6).map((p) => (
              <div key={p.id} onClick={() => onNavigate?.('menu', p.id)} style={{ flexShrink: 0, width: 160, ...cardStyle, cursor: 'pointer' }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover' }} />
                <div style={{ padding: 10, fontSize: 11, fontWeight: 600, color: SH }}>{p.name?.slice(0, 24)}</div>
                <div style={{ padding: '0 10px 10px', fontSize: 12, fontWeight: 700, color: G }}>{formatPrice(p.price)}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 16. Trust badges — computer store: Secure Pay, Delivery, Warranty, Returns */}
      <section style={{ marginBottom: 32, padding: '24px 20px', background: theme.storeBg2, borderRadius: 16, border: `1px solid ${SB}` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 24, textAlign: 'center' }}>
          <div><div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div><div style={{ fontSize: 13, fontWeight: 700, color: SH }}>Secure payment</div><div style={{ fontSize: 11, color: SD, marginTop: 2 }}>Cards, UPI, EMI</div></div>
          <div><div style={{ fontSize: 28, marginBottom: 10 }}>🚚</div><div style={{ fontSize: 13, fontWeight: 700, color: SH }}>{t(language, 'freeDelivery')}</div><div style={{ fontSize: 11, color: SD, marginTop: 2 }}>On orders above ₹999</div></div>
          <div><div style={{ fontSize: 28, marginBottom: 10 }}>🛡️</div><div style={{ fontSize: 13, fontWeight: 700, color: SH }}>Warranty</div><div style={{ fontSize: 11, color: SD, marginTop: 2 }}>Official brand warranty</div></div>
          <div><div style={{ fontSize: 28, marginBottom: 10 }}>🔄</div><div style={{ fontSize: 13, fontWeight: 700, color: SH }}>{t(language, 'returns')}</div><div style={{ fontSize: 11, color: SD, marginTop: 2 }}>7-day easy returns</div></div>
        </div>
      </section>

      {/* 46. Build PC CTA | 47. Franchise CTA — computer store blocks */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
        <button onClick={() => onNavigate?.('buildpc')} style={{ padding: 28, borderRadius: 16, background: `linear-gradient(135deg, ${G} 0%, ${brand.greenLight} 100%)`, color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', boxShadow: '0 10px 30px rgba(27,94,32,.2)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🖥️</div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{t(language, 'buildYourPc')}</div>
          <div style={{ fontSize: 13, opacity: 0.95 }}>50+ features · Compatibility check · Save & share config</div>
        </button>
        <button onClick={() => onNavigate?.('franchise')} style={{ padding: 28, borderRadius: 16, background: theme.storeHeading, color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', boxShadow: '0 10px 30px rgba(15,23,42,.15)' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🏢</div>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{t(language, 'franchise')}</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>Partner with TheValueStore · Tech retail</div>
        </button>
      </section>

      {/* 17. Footer mega */}
      <footer style={{ borderTop: `1px solid ${SB}`, padding: '32px 0', marginTop: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 24, marginBottom: 24 }}>
          <div><div style={{ fontWeight: 700, color: SH, marginBottom: 8 }}>{t(language, 'help')}</div><div style={{ fontSize: 12, color: SD }}>FAQs · Contact · {t(language, 'returns')}</div></div>
          <div><div style={{ fontWeight: 700, color: SH, marginBottom: 8 }}>Company</div><div style={{ fontSize: 12, color: SD }}>About · Careers · Press</div></div>
          <div><div style={{ fontWeight: 700, color: SH, marginBottom: 8 }}>Legal</div><div style={{ fontSize: 12, color: SD }}>{t(language, 'privacy')} · {t(language, 'terms')}</div></div>
        </div>
        <div style={{ fontSize: 12, color: SD, textAlign: 'center' }}>{brand.footer}</div>
      </footer>
    </div>
  );
}
