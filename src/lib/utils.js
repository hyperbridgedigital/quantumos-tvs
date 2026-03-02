export const uid = () => Math.random().toString(36).slice(2, 8);
export const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;
export const discount = (price, compare) => compare > price ? Math.round(((compare - price) / compare) * 100) : 0;
export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const groupBy = (arr, key) => arr.reduce((r, i) => { (r[i[key]] = r[i[key]] || []).push(i); return r; }, {});
export const sumBy = (arr, key) => arr.reduce((a, i) => a + (Number(i[key]) || 0), 0);
export const statusColor = (s) => ({ active:'#22C55E', confirmed:'#8B5CF6', preparing:'#E67E22', out_for_delivery:'#3B82F6', delivered:'#22C55E', cancelled:'#EF4444', available:'#22C55E', delivering:'#E67E22', offline:'#EF4444', upcoming:'#3B82F6', approved:'#22C55E', pending:'#E67E22' }[s] || '#666');
