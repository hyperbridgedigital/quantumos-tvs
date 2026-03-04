'use client';
import Link from 'next/link';
import { brand } from '@/lib/brand';
import { useApp } from '@/context/AppContext';
import { t } from '@/data/translations';

const BLK = brand.black;
const BLUE = brand.blueElectric;
const EMERALD = brand.emerald;
const SH = brand.storeHeading;
const SD = brand.storeDim;
const SB = brand.storeBorder;

const values = [
  { title: 'Best Value', desc: 'We curate price-to-performance so you get more for every rupee.', icon: '💰' },
  { title: 'Maximum Performance', desc: 'Gaming rigs, creator PCs, and AI-ready hardware that delivers.', icon: '⚡' },
  { title: 'Expert Builds', desc: 'PC Builder, compatibility check, wattage calc — we help you choose right.', icon: '🔧' },
  { title: 'Tech That Gives Back', desc: 'Digital classrooms, rural coding labs, and e-waste recycling.', icon: '🌱' },
];

export default function BrandPage() {
  const { locale } = useApp();
  return (
    <div style={{ minHeight: '100vh', background: brand.storeBg, color: SH }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid ' + SB, background: '#fff', padding: '16px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: brand.fontDisplay, fontSize: 12, color: '#fff', fontWeight: 800 }}>TVS</div>
            <div>
              <div style={{ fontFamily: brand.fontDisplay, fontSize: 18, fontWeight: 700, color: SH }}>{brand.name}</div>
              <div style={{ fontSize: 9, color: BLUE, fontWeight: 700, letterSpacing: '.12em' }}>{brand.tagline}</div>
            </div>
          </Link>
          <Link href="/" style={{ padding: '10px 20px', borderRadius: 10, background: BLUE, color: '#fff', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>{t('backToShop', locale)}</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg,' + BLK + ' 0%,#1e3a5f 100%)', padding: '72px 28px', textAlign: 'center' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.28em', color: BLUE }}>ABOUT THEVALUESTORE</span>
          <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(36px,6vw,52px)', color: '#fff', marginTop: 16, marginBottom: 16, lineHeight: 1.1 }}>
            Best Value. Maximum Performance.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,.75)', lineHeight: 1.65 }}>
            We’re your partner for gaming PCs, laptops, and tech — with expert builds, honest advice, and a commitment to performance and impact.
          </p>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '56px 28px', background: brand.storeBg2 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', color: BLUE }}>WHAT WE STAND FOR</span>
            <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(26px,4vw,34px)', color: SH, marginTop: 10 }}>Our Promise</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            {values.map(({ title, desc, icon }) => (
              <div key={title} style={{ background: '#fff', borderRadius: 20, border: '1px solid ' + SB, padding: '28px 24px', textAlign: 'center', boxShadow: '0 2px 14px rgba(0,0,0,.04)' }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 14 }}>{icon}</span>
                <div style={{ fontSize: 18, fontWeight: 700, color: SH, marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: SD, lineHeight: 1.55 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visit us / Store address — Mount Road */}
      <section style={{ padding: '56px 28px', background: brand.storeBg }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.22em', color: EMERALD }}>{t('visitUs', locale).toUpperCase()}</span>
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(24px,4vw,32px)', color: SH, marginTop: 12, marginBottom: 20 }}>{t('storeAtMountRoad', locale)}</h2>
          <p style={{ fontSize: 12, color: brand.blueElectric, fontWeight: 700, marginBottom: 8 }}>{t('currency', locale)}</p>
          <address style={{ fontStyle: 'normal', fontSize: 15, color: SD, lineHeight: 1.7 }}>
            {t('storeAddress', locale)}
          </address>
          <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            {brand.links?.storeAddress && (
              <a href={brand.links.storeAddress} target="_blank" rel="noopener noreferrer" style={{ padding: '14px 28px', borderRadius: 12, background: BLUE, color: '#fff', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                📍 {t('getDirections', locale)}
              </a>
            )}
            <Link href="/" style={{ padding: '14px 28px', borderRadius: 12, background: 'transparent', color: SH, fontSize: 14, fontWeight: 700, textDecoration: 'none', border: '2px solid ' + SB }}>
              {t('shopOnline', locale)}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid ' + SB, padding: '28px 24px', textAlign: 'center', background: '#fff' }}>
        <div style={{ fontSize: 12, color: SD, marginBottom: 12 }}>{brand.footer}</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ fontSize: 12, color: BLUE, fontWeight: 600, textDecoration: 'none' }}>Home</Link>
          {brand.links?.storeAddress && <a href={brand.links.storeAddress} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: BLUE, fontWeight: 600, textDecoration: 'none' }}>{t('storeAndDirections', locale)}</a>}
        </div>
      </footer>
    </div>
  );
}
