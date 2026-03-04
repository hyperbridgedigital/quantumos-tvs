const DEBUG_API = typeof window !== 'undefined' && (localStorage.getItem('qos_debug_api') === '1' || /[?&]debug=1/.test(window.location.search));

/** Safely parse JSON from fetch Response; handles HTML/404 responses that cause "Unexpected token '<'" */
export async function parseJsonFromResponse(res, url = '') {
  const ct = (res.headers.get('content-type') || '').toLowerCase();
  if (!ct.includes('application/json')) {
    const t = await res.clone().text();
    console.warn('[API] Non-JSON response (enable ?debug=1 or localStorage.qos_debug_api=1 for details):', url, 'status:', res.status, 'content-type:', ct || '(none)');
    if (DEBUG_API) console.warn('[API DEBUG] bodyPreview:', t.slice(0, 400));
    throw new Error('Server returned HTML instead of JSON (API route may be missing or misconfigured)');
  }
  return res.json();
}

export const uid = () => Math.random().toString(36).slice(2, 8);
export const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');
export const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
export const pct = (a, b) => b ? Math.round((a / b) * 100) : 0;
export const discount = (price, compare) => compare > price ? Math.round(((compare - price) / compare) * 100) : 0;
export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const groupBy = (arr, key) => arr.reduce((r, i) => { (r[i[key]] = r[i[key]] || []).push(i); return r; }, {});
export const sumBy = (arr, key) => arr.reduce((a, i) => a + (Number(i[key]) || 0), 0);
export const statusColor = (s) => ({ active:'#22C55E', confirmed:'#8B5CF6', preparing:'#E67E22', out_for_delivery:'#3B82F6', delivered:'#22C55E', cancelled:'#EF4444', available:'#22C55E', delivering:'#E67E22', offline:'#EF4444', upcoming:'#3B82F6', approved:'#22C55E', pending:'#E67E22' }[s] || '#666');
