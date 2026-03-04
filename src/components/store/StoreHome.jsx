'use client';

import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { brand } from '@/lib/brand';
import { t } from '@/lib/i18n';
import { catalogProducts, catalogCategories } from '@/data/catalog';
import { seedOffers } from '@/data/seedData';
import { fmt } from '@/lib/utils';

/** Configurable brand landing + homepage with 50 e‑commerce features (best-in-class). */
export default function StoreHome({ onNavigate }) {
  const { cart, addToCart, customer, setShowUserAuth, settings, userLocation, setUserLocation } = useApp();
  const { language, setLanguage, currency, setCurrency, languages, currencies, detectLocation, locationLoading } = useLocale();

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

  const heroSlides = useMemo(() => [
    { title: settings.HERO_TITLE || brand.tagline, subtitle: settings.HERO_SUBTITLE || 'Gaming PCs · Laptops · Build Your PC', cta: t(language, 'shopNow'), cta2: t(language, 'buildYourPc') },
    { title: 'Free Delivery on Orders Above ₹' + (settings.DELIVERY_FREE_ABOVE || '499'), subtitle: '60-Minute Delivery · Best Prices', cta: t(language, 'shopNow'), cta2: null },
    { title: 'Build Your Dream PC', subtitle: '50+ Features · Compatibility Check · Save & Share', cta: t(language, 'buildYourPc'), cta2: t(language, 'shopNow') },
  ], [language, settings.HERO_TITLE, settings.HERO_SUBTITLE, settings.DELIVERY_FREE_ABOVE]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(() => setHeroSlide((s) => (s + 1) % heroSlides.length), 5000);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return catalogProducts.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return catalogProducts.filter((p) => p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q))).slice(0, 12);
  }, [searchQuery]);

  const dealOfTheDay = useMemo(() => seedOffers.filter((o) => o.active)[0] || seedOffers[0], []);
  const flashDeals = useMemo(() => seedOffers.filter((o) => o.active).slice(0, 8), []);
  const trending = useMemo(() => catalogProducts.filter((p) => p.tag === 'bestseller').slice(0, 8), []);
  const newArrivals = useMemo(() => catalogProducts.filter((p) => p.tag === 'new').slice(0, 8), []);
  const featuredCategories = useMemo(() => catalogCategories.slice(0, 12), []);

  const G = brand.green;
  const GM = brand.greenMint;
  const SH = brand.storeHeading;
  const SD = brand.storeDim;
  const SB = brand.storeBorder;

  const cardStyle = { background: '#fff', border: `1px solid ${SB}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 6px rgba(27,94,32,.05)' };

  const addToRecent = (p) => {
    setRecentlyViewed((prev) => {
      const next = [{ ...p, viewedAt: Date.now() }, ...prev.filter((x) => x.id !== p.id)].slice(0, 10);
      try { localStorage.setItem('tvs_recently_viewed', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const formatPrice = (price) => (currency === 'INR' ? `₹${fmt(price)}` : `$${Math.round(price / 83)}`);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 80px', background: '#fff' }}>
      {/* 44. Announcement bar */}
      {announcementBar && (
        <div style={{ background: G, color: '#fff', padding: '8px 16px', textAlign: 'center', fontSize: 12, fontWeight: 600 }}>
          {settings.ANNOUNCEMENT_TEXT || 'Free delivery on orders above ₹' + (settings.DELIVERY_FREE_ABOVE || '499') + ' · 60-min delivery'}
          <button onClick={() => setAnnouncementBar(false)} style={{ marginLeft: 12, background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* 1. Hero carousel */}
      <section style={{ position: 'relative', borderRadius: 24, marginBottom: 28, overflow: 'hidden', background: `linear-gradient(150deg, ${brand.greenDark} 0%, ${G} 50%, ${brand.greenLight} 100%)`, minHeight: 320 }}>
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              padding: '48px 36px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              opacity: heroSlide === i ? 1 : 0,
              transition: 'opacity .5s ease',
            }}
          >
            <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(28px,5vw,42px)', color: '#fff', marginBottom: 8 }}>{slide.title}</h1>
            <p style={{ color: '#C8E6C9', fontSize: 16, marginBottom: 24 }}>{slide.subtitle}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => onNavigate?.('menu')} style={{ padding: '14px 28px', borderRadius: 12, background: '#fff', color: G, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>{slide.cta}</button>
              {slide.cta2 && <button onClick={() => onNavigate?.('buildpc')} style={{ padding: '14px 28px', borderRadius: 12, background: 'rgba(255,255,255,.2)', color: '#fff', fontWeight: 700, fontSize: 14, border: '1px solid rgba(255,255,255,.4)', cursor: 'pointer' }}>{slide.cta2}</button>
            </div>
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setHeroSlide(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', background: heroSlide === i ? '#fff' : 'rgba(255,255,255,.4)', cursor: 'pointer' }} />
          ))}
        </div>
      </section>

      {/* 2. Global search */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder={t(language, 'searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: 200, padding: '14px 20px', borderRadius: 12, border: `1.5px solid ${SB}`, fontSize: 14, outline: 'none' }}
          />
          <button onClick={() => onNavigate?.('menu')} style={{ padding: '14px 24px', borderRadius: 12, background: G, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>{t(language, 'search')}</button>
        </div>
        {searchQuery && (
          <div style={{ marginTop: 12, padding: 16, background: '#f9f9f9', borderRadius: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
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

      {/* 4. Category grid */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SH, marginBottom: 16 }}>{t(language, 'categories')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
          {featuredCategories.map((cat) => (
            <button key={cat.id} onClick={() => onNavigate?.('menu', null, cat.id)} style={{ ...cardStyle, padding: 20, textAlign: 'center', cursor: 'pointer', border: 'none' }}>
              <div style={{ width: 48, height: 48, margin: '0 auto 8px', borderRadius: 12, background: GM, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🖥️</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: SH }}>{cat.label}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Deal of the day | 6. Flash sales */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SH, marginBottom: 16 }}>Deal of the day</h2>
        <div style={{ ...cardStyle, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 32 }}>🎁</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: SH }}>{dealOfTheDay.name}</div>
            <div style={{ fontSize: 12, color: SD }}>Code: {dealOfTheDay.code}</div>
          </div>
          <button onClick={() => onNavigate?.('offers')} style={{ padding: '12px 24px', borderRadius: 10, background: G, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>View offer</button>
        </div>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
          {flashDeals.map((o) => (
            <div key={o.id} onClick={() => onNavigate?.('offers')} style={{ flexShrink: 0, width: 180, padding: 16, ...cardStyle, cursor: 'pointer' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: SH }}>{o.name}</div>
              <div style={{ fontSize: 11, color: G, marginTop: 4 }}>{o.code}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Trending | 10. New arrivals */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SH, marginBottom: 16 }}>Trending</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {trending.map((p) => (
            <div key={p.id} style={{ ...cardStyle }}>
              <div style={{ position: 'relative' }} onClick={() => { addToRecent(p); onNavigate?.('menu', p.id); }}>
                <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover' }} />
                {p.tag && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 9, padding: '4px 8px', borderRadius: 6, background: G, color: '#fff', fontWeight: 700 }}>{p.tag}</span>}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: SH }}>{p.name.slice(0, 36)}</div>
                <div style={{ fontSize: 11, color: SD }}>⭐ {p.rating} ({p.reviewCount})</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontWeight: 700, color: G }}>{formatPrice(p.price)}</span>
                  <button onClick={() => addToCart(p)} style={{ padding: '6px 14px', borderRadius: 8, background: G, color: '#fff', fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{t(language, 'addToCart')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: SH, marginBottom: 16 }}>New arrivals</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {newArrivals.slice(0, 4).map((p) => (
            <div key={p.id} style={{ ...cardStyle }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', aspectRatio: 1, objectFit: 'cover' }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: SH }}>{p.name.slice(0, 36)}</div>
                <div style={{ fontWeight: 700, color: G, marginTop: 4 }}>{formatPrice(p.price)}</div>
                <button onClick={() => addToCart(p)} style={{ width: '100%', marginTop: 8, padding: 8, borderRadius: 8, background: GM, color: G, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer' }}>{t(language, 'addToCart')}</button>
              </div>
            </div>
          ))}
        </div>
      </section>

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

      {/* 16. Trust badges */}
      <section style={{ marginBottom: 32, padding: 24, background: GM, borderRadius: 16, border: `1px solid #C8E6C9` }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 20, textAlign: 'center' }}>
          <div><div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div><div style={{ fontSize: 12, fontWeight: 700, color: SH }}>Secure payment</div></div>
          <div><div style={{ fontSize: 28, marginBottom: 8 }}>🚚</div><div style={{ fontSize: 12, fontWeight: 700, color: SH }}>{t(language, 'freeDelivery')}</div></div>
          <div><div style={{ fontSize: 28, marginBottom: 8 }}>🔄</div><div style={{ fontSize: 12, fontWeight: 700, color: SH }}>{t(language, 'returns')}</div></div>
          <div><div style={{ fontSize: 28, marginBottom: 8 }}>🛡️</div><div style={{ fontSize: 12, fontWeight: 700, color: SH }}>Warranty</div></div>
        </div>
      </section>

      {/* 46. Build PC CTA | 47. Franchise CTA */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
        <button onClick={() => onNavigate?.('buildpc')} style={{ padding: 24, borderRadius: 16, background: G, color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🖥️</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{t(language, 'buildYourPc')}</div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>50+ features · Save & share</div>
        </button>
        <button onClick={() => onNavigate?.('franchise')} style={{ padding: 24, borderRadius: 16, background: brand.gold, color: '#000', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🏢</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{t(language, 'franchise')}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>Partner with us</div>
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
