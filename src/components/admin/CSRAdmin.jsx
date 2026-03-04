'use client';
import { brand } from '@/lib/brand';

/** Admin: CSR (Tech for Good) — programs, impact metrics. Placeholder. */
export default function CSRAdmin() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.2em', color: brand.dim, marginBottom: 8 }}>TECH FOR GOOD</div>
      <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 28, color: brand.heading, marginBottom: 8 }}>CSR & Impact</h1>
      <p style={{ fontSize: 14, color: brand.dim, marginBottom: 32, maxWidth: 560 }}>
        Manage CSR programs, impact metrics, and digital classroom / scholarship data. Full module coming soon.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { label: 'Digital Classrooms', desc: 'Schools & devices', emoji: '🏫' },
          { label: 'Rural Coding Labs', desc: 'Centers & schedules', emoji: '💻' },
          { label: 'Scholarships', desc: 'Women in Tech', emoji: '🎓' },
          { label: 'E-waste & Recycling', desc: 'Tonnes & partners', emoji: '♻️' },
        ].map(({ label, desc, emoji }) => (
          <div key={label} style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, padding: 20 }}>
            <span style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>{emoji}</span>
            <div style={{ fontWeight: 700, color: brand.heading, fontSize: 14 }}>{label}</div>
            <div style={{ fontSize: 12, color: brand.dim, marginTop: 4 }}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 32, padding: 20, background: brand.bg2, borderRadius: 12, border: '1px dashed ' + brand.border }}>
        <div style={{ fontSize: 13, color: brand.dim }}>Placeholder — Admin extensions for CSR (Tech for Good).</div>
      </div>
    </div>
  );
}
