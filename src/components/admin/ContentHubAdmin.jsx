'use client';
import { brand } from '@/lib/brand';

/** Admin: Content Hub — tech blog, buying guides, video hub. Placeholder. */
export default function ContentHubAdmin() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.2em', color: brand.dim, marginBottom: 8 }}>CONTENT & MEDIA</div>
      <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 28, color: brand.heading, marginBottom: 8 }}>Content Hub</h1>
      <p style={{ fontSize: 14, color: brand.dim, marginBottom: 32, maxWidth: 560 }}>
        Manage tech blog, buying guides, and video hub. Full module coming soon.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { label: 'Tech Blog', desc: 'Articles & reviews', emoji: '📝' },
          { label: 'Buying Guides', desc: 'Guides by category', emoji: '📚' },
          { label: 'Video Hub', desc: 'YouTube & shorts', emoji: '🎬' },
          { label: 'SEO & Scheduling', desc: 'Publish & meta', emoji: '📅' },
        ].map(({ label, desc, emoji }) => (
          <div key={label} style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, padding: 20 }}>
            <span style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>{emoji}</span>
            <div style={{ fontWeight: 700, color: brand.heading, fontSize: 14 }}>{label}</div>
            <div style={{ fontSize: 12, color: brand.dim, marginTop: 4 }}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32, padding: 20, background: brand.bg2, borderRadius: 12, border: '1px dashed ' + brand.border }}>
        <div style={{ fontSize: 13, color: brand.dim }}>Placeholder — Admin extensions for content: tech blog, buying guides, video hub.</div>
      </div>
    </div>
  );
}
