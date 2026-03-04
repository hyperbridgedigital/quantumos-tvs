'use client';
import { brand } from '@/lib/brand';

/** Admin: Marketplace — third-party sellers onboarding, catalog, payouts. Placeholder. */
export default function MarketplaceSellers() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.2em', color: brand.dim, marginBottom: 8 }}>MARKETPLACE</div>
      <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 28, color: brand.heading, marginBottom: 8 }}>Third-Party Sellers</h1>
      <p style={{ fontSize: 14, color: brand.dim, marginBottom: 32, maxWidth: 560 }}>
        Onboard sellers, manage catalog sync, commissions, and payouts. Full module coming soon.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { label: 'Seller Onboarding', desc: 'Apply & verify sellers', emoji: '🏪' },
          { label: 'Catalog & Listings', desc: 'Products per seller', emoji: '📦' },
          { label: 'Commissions & Payouts', desc: 'Fees & settlements', emoji: '💳' },
          { label: 'Policy & Compliance', desc: 'Returns & disputes', emoji: '📋' },
        ].map(({ label, desc, emoji }) => (
          <div key={label} style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, padding: 20 }}>
            <span style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>{emoji}</span>
            <div style={{ fontWeight: 700, color: brand.heading, fontSize: 14 }}>{label}</div>
            <div style={{ fontSize: 12, color: brand.dim, marginTop: 4 }}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32, padding: 20, background: brand.bg2, borderRadius: 12, border: '1px dashed ' + brand.border }}>
        <div style={{ fontSize: 13, color: brand.dim }}>Placeholder — Admin extensions for marketplace (third-party sellers).</div>
      </div>
    </div>
  );
}
