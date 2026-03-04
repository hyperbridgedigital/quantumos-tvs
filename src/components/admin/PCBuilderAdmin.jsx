'use client';
import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { BUILDER_STEP_ORDER, BUILDER_STEP_LABELS, pcBuilderMeta } from '@/data/pcBuilderMeta';

/** Admin: PC Builder — manage builder steps, view catalog with live meta, builder status. */
export default function PCBuilderAdmin() {
  const { products } = useApp();

  const builderCategories = useMemo(() => {
    const set = new Set(BUILDER_STEP_ORDER);
    return BUILDER_STEP_ORDER;
  }, []);

  const catalogByStep = useMemo(() => {
    const byStep = {};
    BUILDER_STEP_ORDER.forEach(step => { byStep[step] = []; });
    products.forEach(p => {
      if (builderCategories.includes(p.category)) {
        const meta = pcBuilderMeta[p.id] || {};
        byStep[p.category].push({ ...p, builderMeta: meta });
      }
    });
    return byStep;
  }, [products, builderCategories]);

  const totalComponents = useMemo(() => {
    return BUILDER_STEP_ORDER.reduce((acc, step) => acc + (catalogByStep[step]?.length || 0), 0);
  }, [catalogByStep]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.2em', color: brand.dim, marginBottom: 8 }}>STORE · PC BUILDER</div>
      <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 28, color: brand.heading, marginBottom: 8 }}>PC Builder Admin</h1>
      <p style={{ fontSize: 14, color: brand.dim, marginBottom: 24, maxWidth: 560 }}>
        Builder step order, compatibility meta (TDP, socket, RAM type, form factor), and catalog are driven by live data. Frontend builder uses the same products and meta.
      </p>

      {/* Live status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28, padding: '14px 20px', background: brand.green + '18', borderRadius: 12, border: '1px solid ' + brand.green + '44' }}>
        <span style={{ fontSize: 24 }}>✅</span>
        <div>
          <div style={{ fontWeight: 700, color: brand.heading, fontSize: 14 }}>Builder live</div>
          <div style={{ fontSize: 12, color: brand.dim }}>{totalComponents} components across {BUILDER_STEP_ORDER.length} steps · Compatibility & wattage from pcBuilderMeta</div>
        </div>
      </div>

      {/* Step order */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 18, color: brand.heading, marginBottom: 12 }}>Step order</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {BUILDER_STEP_ORDER.map((step, i) => (
            <span key={step} style={{ padding: '8px 14px', background: brand.card, border: '1px solid ' + brand.border, borderRadius: 10, fontSize: 13, fontWeight: 600, color: brand.heading }}>
              {i + 1}. {BUILDER_STEP_LABELS[step]}
            </span>
          ))}
        </div>
      </div>

      {/* Catalog by step with meta */}
      <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 18, color: brand.heading, marginBottom: 12 }}>Builder catalog (live from products)</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {BUILDER_STEP_ORDER.map(step => {
          const items = catalogByStep[step] || [];
          if (items.length === 0) return null;
          return (
            <div key={step} style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: brand.bg2, borderBottom: '1px solid ' + brand.border, fontWeight: 700, color: brand.heading, fontSize: 14 }}>
                {BUILDER_STEP_LABELS[step]} ({items.length})
              </div>
              <div style={{ padding: 12 }}>
                <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: brand.dim }}>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid ' + brand.border }}>Product</th>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid ' + brand.border }}>ID</th>
                      <th style={{ padding: '8px 10px', borderBottom: '1px solid ' + brand.border }}>Meta (TDP / socket / RAM / form / wattage)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid ' + brand.border }}>
                        <td style={{ padding: '8px 10px', color: brand.heading }}>{p.name}</td>
                        <td style={{ padding: '8px 10px', color: brand.dim }}>{p.id}</td>
                        <td style={{ padding: '8px 10px', color: brand.dim, fontFamily: 'monospace', fontSize: 11 }}>
                          {Object.keys(p.builderMeta || {}).length ? JSON.stringify(p.builderMeta) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24, padding: 16, background: brand.bg2, borderRadius: 12, border: '1px dashed ' + brand.border, fontSize: 12, color: brand.dim }}>
        Meta is defined in <code style={{ background: brand.card, padding: '2px 6px', borderRadius: 4 }}>src/data/pcBuilderMeta.js</code>. Edit that file to add TDP, socket, ramType, formFactor, or wattage for new products. Frontend builder uses the same data for live compatibility and PSU recommendation.
      </div>
    </div>
  );
}
