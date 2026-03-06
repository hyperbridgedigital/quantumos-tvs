'use client';

import { useState } from 'react';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';
import {
  HERO_BANNERS,
  QUICK_CATEGORIES,
  VALUE_PICK_TAGS,
  BUILD_PRESETS,
  DEALS_SECTIONS,
  GAMING_ZONE,
  BUSINESS_SOLUTIONS,
  CSR_SECTION,
} from '@/data/homepage';
import { getProductImageUrl } from '@/lib/productImages';

export default function HomePage({
  theme,
  products = [],
  onNavigate,
  addToCart,
  recommendations = [],
}) {
  const [heroIndex, setHeroIndex] = useState(0);
  const G = brand.green || brand.primary;
  const E = brand.emerald;
  const displayProducts = recommendations.length ? recommendations : products.slice(0, 6);
  const valuePicks = products
    .filter((p) => p.tag === 'bestseller' || p.tag === 'signature' || p.tag === 'trending')
    .slice(0, 6);
  const showProducts = valuePicks.length ? valuePicks : displayProducts;

  const handleCta = (banner) => {
    if (banner.ctaAction === 'buildpc') onNavigate('buildpc');
    else if (banner.ctaAction === 'shop') onNavigate('shop', banner.ctaQuery);
    else if (banner.ctaAction === 'csr') document.getElementById('csr')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCountdown = (endAt) => {
    const now = new Date();
    const end = new Date(now);
    if (endAt === 'today') end.setHours(23, 59, 59, 999);
    else if (endAt === 'weekend') end.setDate(end.getDate() + (6 - end.getDay()));
    else if (endAt === 'flash') end.setHours(now.getHours() + 4, 0, 0, 0);
    else end.setDate(end.getDate() + 7);
    const diff = Math.max(0, end - now);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Hero banners */}
      <section style={{ marginBottom: 32, borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}>
        <div
          style={{
            background: HERO_BANNERS[heroIndex].gradient,
            padding: '48px 32px',
            minHeight: 220,
            color: '#fff',
            position: 'relative',
          }}
        >
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            {HERO_BANNERS[heroIndex].title}
          </h2>
          <p style={{ fontSize: 15, opacity: 0.9, marginBottom: 20, maxWidth: 480 }}>
            {HERO_BANNERS[heroIndex].subtitle}
          </p>
          <button
            onClick={() => handleCta(HERO_BANNERS[heroIndex])}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              background: E,
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {HERO_BANNERS[heroIndex].cta}
          </button>
          <div style={{ position: 'absolute', bottom: 16, left: 32, display: 'flex', gap: 8 }}>
            {HERO_BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  border: 'none',
                  background: i === heroIndex ? '#fff' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                }}
                aria-label={`Banner ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick category grid */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: theme.storeHeading, marginBottom: 16 }}>
          Shop by category
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {QUICK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onNavigate('shop', `category=${cat.id}`)}
              style={{
                padding: 20,
                background: theme.storeCard,
                border: `1px solid ${theme.storeBorder}`,
                borderRadius: 12,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }}
              onMouseOut={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>{cat.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: theme.storeHeading }}>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Value Picks */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: theme.storeHeading, marginBottom: 16 }}>
          Value Picks
        </h2>
        <p style={{ fontSize: 14, color: theme.storeDim, marginBottom: 16 }}>
          Best price-to-performance. Tags: {VALUE_PICK_TAGS.join(', ')}.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {showProducts.map((p) => {
            const imgUrl = getProductImageUrl(p, 320, 320);
            const goToCategory = () => onNavigate('shop', p.category ? `category=${p.category}` : undefined);
            return (
            <div
              key={p.id}
              style={{
                padding: 16,
                background: theme.storeCard,
                border: `1px solid ${theme.storeBorder}`,
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <button
                type="button"
                onClick={goToCategory}
                style={{ width: '100%', padding: 0, border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                title={p.category ? `Shop ${p.category}` : 'View product'}
              >
                <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', marginBottom: 10, background: theme.storeBg2 }}>
                  <img src={imgUrl} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: E, textTransform: 'uppercase' }}>
                  {p.tag || 'Best Value'}
                </span>
                <div style={{ fontWeight: 700, fontSize: 13, color: theme.storeHeading, marginTop: 4, marginBottom: 4 }}>{p.name}</div>
              </button>
              <div style={{ fontSize: 18, fontWeight: 800, color: G, marginBottom: 10 }}>{fmt(p.price)}</div>
              <button
                onClick={() => addToCart(p)}
                style={{
                  width: '100%',
                  padding: 8,
                  borderRadius: 8,
                  background: G,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 12,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Add to cart
              </button>
            </div>
            );
          })}
        </div>
      </section>

      {/* Build Your PC */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: theme.storeHeading, marginBottom: 8 }}>
          Build Your PC
        </h2>
        <p style={{ fontSize: 14, color: theme.storeDim, marginBottom: 16 }}>
          Choose a preset or start from scratch. Compatibility checked. Wattage & FPS estimates.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {BUILD_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onNavigate('buildpc')}
              style={{
                padding: 20,
                background: theme.storeBg2,
                border: `2px solid ${theme.storeBorder}`,
                borderRadius: 12,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = G; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = theme.storeBorder; }}
            >
              <div style={{ fontSize: 16, fontWeight: 700, color: theme.storeHeading, marginBottom: 4 }}>
                {preset.name}
              </div>
              <div style={{ fontSize: 13, color: theme.storeDim, marginBottom: 8 }}>{preset.desc}</div>
              <div style={{ fontSize: 12, color: theme.storeDim }}>
                ₹{fmt(preset.minPrice)} – ₹{fmt(preset.maxPrice)}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => onNavigate('buildpc')}
          style={{
            marginTop: 16,
            padding: '14px 28px',
            borderRadius: 10,
            background: G,
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Build Your PC
        </button>
      </section>

      {/* Deals */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: theme.storeHeading, marginBottom: 16 }}>
          Deals
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {DEALS_SECTIONS.map((deal) => (
            <div
              key={deal.id}
              style={{
                padding: 20,
                background: theme.storeCard,
                border: `1px solid ${theme.storeBorder}`,
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: theme.storeHeading }}>{deal.title}</span>
                {deal.stockAlert && (
                  <span style={{ fontSize: 11, color: brand.red, fontWeight: 600 }}>Limited stock</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: theme.storeDim, marginBottom: 8 }}>
                Ends in: <strong style={{ color: G }}>{getCountdown(deal.endAt)}</strong>
              </div>
              <button
                onClick={() => onNavigate('shop')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: `1px solid ${G}`,
                  background: 'transparent',
                  color: G,
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                View deals
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Gaming Zone */}
      <section style={{ marginBottom: 40, padding: 24, background: theme.storeBg2, border: `1px solid ${theme.storeBorder}`, borderRadius: 16 }}>
        <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: theme.storeHeading, marginBottom: 8 }}>
          {GAMING_ZONE.title}
        </h2>
        <p style={{ fontSize: 14, color: theme.storeDim, marginBottom: 16 }}>{GAMING_ZONE.subtitle}</p>
        <button
          onClick={() => onNavigate('shop', 'category=gaming-pcs')}
          style={{
            padding: '12px 24px',
            borderRadius: 10,
            background: G,
            color: '#fff',
            fontWeight: 700,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Shop Gaming Zone
        </button>
      </section>

      {/* Business Solutions */}
      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: theme.storeHeading, marginBottom: 8 }}>
          {BUSINESS_SOLUTIONS.title}
        </h2>
        <p style={{ fontSize: 14, color: theme.storeDim, marginBottom: 16 }}>{BUSINESS_SOLUTIONS.subtitle}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {BUSINESS_SOLUTIONS.packages.map((pkg) => (
            <div
              key={pkg.id}
              style={{
                padding: 16,
                background: theme.storeCard,
                border: `1px solid ${theme.storeBorder}`,
                borderRadius: 12,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14, color: theme.storeHeading, marginBottom: 4 }}>{pkg.name}</div>
              <div style={{ fontSize: 13, color: theme.storeDim }}>{pkg.desc}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: theme.storeDim, marginTop: 12 }}>
          Products: {BUSINESS_SOLUTIONS.products.join(', ')}.
        </p>
      </section>

      {/* CSR */}
      <section id="csr" style={{ marginBottom: 24, padding: 24, background: theme.storeBg2, border: `1px solid ${theme.storeBorder}`, borderRadius: 16 }}>
        <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: theme.storeHeading, marginBottom: 8 }}>
          {CSR_SECTION.title}
        </h2>
        <p style={{ fontSize: 14, color: theme.storeDim, marginBottom: 20 }}>{CSR_SECTION.subtitle}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
          {CSR_SECTION.programs.map((prog) => (
            <div key={prog.id} style={{ padding: 12, background: theme.storeCard, borderRadius: 10, border: `1px solid ${theme.storeBorder}` }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: theme.storeHeading, marginBottom: 4 }}>{prog.name}</div>
              <div style={{ fontSize: 13, color: theme.storeDim }}>{prog.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {CSR_SECTION.impact.map((item) => (
            <div key={item.label} style={{ textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: E }}>{item.value}</div>
              <div style={{ fontSize: 12, color: theme.storeDim }}>{item.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
