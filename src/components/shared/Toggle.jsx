'use client';
import { brand } from '@/lib/brand';
export function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width:40, height:22, borderRadius:11, position:'relative', cursor:'pointer',
      transition:'background .3s', border:'none', flexShrink:0,
      background: value ? brand.emerald : brand.dim + '40',
    }}>
      <span style={{ position:'absolute', top:2, left: value ? 20 : 2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left .3s' }} />
    </button>
  );
}
export default Toggle;
