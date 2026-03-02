'use client';
import { memo } from 'react';

function Badge({ children, color, bg }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 8px', borderRadius:6, fontSize:10, fontWeight:700, background:bg || (color + '22'), color }}>
      {children}
    </span>
  );
}

export default memo(Badge);
export { Badge };
