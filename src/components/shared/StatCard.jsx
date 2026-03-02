'use client';
import { memo } from 'react';
import { brand } from '@/lib/brand';

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ borderTop: `3px solid ${color}`, borderRadius:10, padding:14, background:brand.card, contain:'content' }}>
      <div style={{ fontSize:10, color:brand.dim, fontWeight:600, marginBottom:4 }}>{icon} {label}</div>
      <div style={{ fontFamily:brand.fontDisplay, fontSize:22, fontWeight:700, color }}>{value}</div>
    </div>
  );
}

export default memo(StatCard);
export { StatCard };
