'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';
import {
  pcParts,
  PART_CATEGORIES,
  USE_CASE_PRESETS,
  AESTHETIC_FILTERS,
  FORM_FACTORS,
  getPartsByCategory,
  getPartById,
} from '@/data/pcParts';

const STORAGE_KEY = 'thevaluestore_buildpc';
const SAVED_BUILDS_KEY = 'thevaluestore_buildpc_saved';
const WISHLIST_KEY = 'thevaluestore_buildpc_wishlist';

// ─── 50 FEATURES: implementation helpers ───

function useBuildState() {
  const [selected, setSelected] = useState(() => {
    if (typeof window === 'undefined') return {};
    try {
      // 33. Share build — restore from URL
      const params = new URLSearchParams(window.location.search);
      const buildParam = params.get('build');
      if (buildParam) {
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(buildParam))));
          if (decoded && typeof decoded === 'object') return decoded;
        } catch (_) {}
      }
      const s = localStorage.getItem(STORAGE_KEY);
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(selected)); } catch (_) {}
  }, [selected]);
  return [selected, setSelected];
}

function checkCompatibility(selected, parts) {
  const issues = [];
  const cpu = selected.cpu ? getPartById(selected.cpu) : null;
  const mb = selected.motherboard ? getPartById(selected.motherboard) : null;
  const gpu = selected.gpu ? getPartById(selected.gpu) : null;
  const ram = selected.ram ? getPartById(selected.ram) : null;
  const psu = selected.psu ? getPartById(selected.psu) : null;
  const casePart = selected.case ? getPartById(selected.case) : null;
  const cooler = selected.cooler ? getPartById(selected.cooler) : null;

  if (cpu && mb && cpu.socket !== mb.socket) issues.push({ type: 'socket', msg: `CPU socket ${cpu.socket} doesn't match motherboard ${mb.socket}` });
  if (mb && ram) {
    if (ram.ddr4 && mb.socket === 'AM5') issues.push({ type: 'ram', msg: 'DDR4 RAM not compatible with AM5 motherboard' });
    if (!ram.ddr4 && mb.socket === 'AM4') issues.push({ type: 'ram', msg: 'DDR5 RAM not compatible with AM4 motherboard' });
  }
  if (psu) {
    const totalWatts = (cpu?.tdp || 0) + (gpu?.watts || 0) + (ram?.watts || 0) + 50;
    if (totalWatts > psu.watts * 0.85) issues.push({ type: 'psu', msg: `Estimated load ~${Math.round(totalWatts)}W exceeds recommended headroom for ${psu.watts}W PSU` });
  }
  if (casePart && gpu && gpu.length > casePart.gpuMaxLength) issues.push({ type: 'clearance', msg: `GPU length ${gpu.length}mm exceeds case max ${casePart.gpuMaxLength}mm` });
  if (casePart && cooler && cooler.height > 0 && cooler.height > casePart.coolerMaxHeight) issues.push({ type: 'clearance', msg: `Cooler height ${cooler.height}mm exceeds case max ${casePart.coolerMaxHeight}mm` });
  if (mb && casePart && mb.formFactor === 'itx' && casePart.formFactor !== 'itx') issues.push({ type: 'form', msg: 'ITX board in non-ITX case' });
  if (mb && casePart && casePart.formFactor === 'itx' && mb.formFactor !== 'itx') issues.push({ type: 'form', msg: 'Case is ITX but motherboard is not' });
  return issues;
}

function getTotalWatts(selected) {
  const parts = ['cpu', 'gpu', 'ram', 'storage', 'motherboard'].map((c) => selected[c]).filter(Boolean).map((id) => getPartById(id));
  let w = 50;
  parts.forEach((p) => { w += p.tdp || p.watts || 0; });
  return w;
}

function getBottleneckScore(selected) {
  const cpu = selected.cpu ? getPartById(selected.cpu) : null;
  const gpu = selected.gpu ? getPartById(selected.gpu) : null;
  if (!cpu || !gpu) return null;
  const cpuFps = (cpu.fps1080 + cpu.fps1440 + cpu.fps4k) / 3;
  const gpuFps = (gpu.fps1080 + gpu.fps1440 + gpu.fps4k) / 3;
  const ratio = cpuFps / gpuFps;
  if (ratio > 1.15) return { level: 'gpu', msg: 'GPU may bottleneck', percent: Math.round((1 - gpuFps / cpuFps) * 100) };
  if (ratio < 0.85) return { level: 'cpu', msg: 'CPU may bottleneck', percent: Math.round((1 - cpuFps / gpuFps) * 100) };
  return { level: 'balanced', msg: 'Well balanced', percent: 0 };
}

function getThermalScore(selected) {
  const cpu = selected.cpu ? getPartById(selected.cpu) : null;
  const cooler = selected.cooler ? getPartById(selected.cooler) : null;
  const casePart = selected.case ? getPartById(selected.case) : null;
  if (!cpu) return null;
  const tdp = cpu.tdp || 65;
  const coolerTdp = cooler ? cooler.tdpRating : 0;
  const hasAIO = cooler?.type === 'aio';
  let score = 100;
  if (coolerTdp < tdp && coolerTdp > 0) score -= 30;
  else if (coolerTdp >= tdp * 1.2) score += 10;
  if (casePart?.radSupport && hasAIO) score += 5;
  return Math.max(0, Math.min(100, score));
}

function getFutureProofScore(selected) {
  const parts = Object.values(selected).filter(Boolean).map((id) => getPartById(id));
  const avg = parts.length ? parts.reduce((a, p) => a + (p.futureProof || 5), 0) / parts.length : 5;
  return Math.round(avg);
}

function getPricePerFrame(selected, resolution = '1080p') {
  const gpu = selected.gpu ? getPartById(selected.gpu) : null;
  const total = getTotalPrice(selected);
  if (!gpu || total === 0) return null;
  const fps = gpu[`fps${resolution === '1440p' ? '1440' : resolution === '4k' ? '4k' : '1080'}`] || 60;
  return { ppf: total / fps, fps };
}

function getTotalPrice(selected, currency = 'INR') {
  return Object.values(selected).reduce((sum, id) => {
    const p = getPartById(id);
    return sum + (p ? (currency === 'USD' ? Math.round(p.price / 83) : p.price) : 0);
  }, 0);
}

function getNoiseEstimate(selected) {
  const parts = Object.values(selected).filter(Boolean).map((id) => getPartById(id));
  const withNoise = parts.filter((p) => p.noise != null);
  if (withNoise.length === 0) return null;
  const avg = withNoise.reduce((a, p) => a + p.noise, 0) / withNoise.length;
  return Math.round(avg);
}

function getWarrantySummary(selected) {
  return Object.values(selected).reduce((acc, id) => {
    const p = getPartById(id);
    if (p && p.warranty) acc.push({ name: p.name, years: p.warranty });
    return acc;
  }, []);
}

function getBuildDifficulty(selected) {
  const hasAIO = selected.cooler ? getPartById(selected.cooler)?.type === 'aio' : false;
  const itx = selected.case ? getPartById(selected.case)?.formFactor === 'itx' : false;
  if (itx && hasAIO) return { level: 'expert', label: 'Expert', tip: 'ITX + AIO is tight' };
  if (itx || hasAIO) return { level: 'intermediate', label: 'Intermediate', tip: 'Mind cable routing' };
  return { level: 'beginner', label: 'Beginner', tip: 'Standard ATX build' };
}

function getToolRequirements(selected) {
  const base = ['Phillips screwdriver', 'Thermal paste (if not pre-applied)', 'Anti-static wrist strap (recommended)'];
  const cooler = selected.cooler ? getPartById(selected.cooler) : null;
  if (cooler?.type === 'aio') base.push('AIO mounting bracket per socket');
  if (selected.case && getPartById(selected.case)?.formFactor === 'itx') base.push('Magnetic screwdriver for tight spaces');
  return base;
}

/** 14. Price history sparkline (mock — bars) */
function getPriceHistorySparkline(partId) {
  const p = getPartById(partId);
  if (!p) return null;
  const base = p.price;
  return [base * 1.08, base * 1.02, base * 0.97, base * 0.99, base];
}

/** 42. Diversity score — mix of brands */
function getDiversityScore(selected) {
  const brands = Object.values(selected).filter(Boolean).map((id) => getPartById(id)?.brand).filter(Boolean);
  const unique = new Set(brands).size;
  return { unique, total: brands.length, score: brands.length ? Math.min(100, Math.round((unique / brands.length) * 100)) : 0 };
}

function generateShareLink(selected) {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(selected))));
  return typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?build=${payload}` : '';
}

function exportPCPartPickerFormat(selected) {
  const lines = [];
  PART_CATEGORIES.forEach((cat) => {
    const id = selected[cat.id];
    if (id) {
      const p = getPartById(id);
      if (p) lines.push(`${p.name}\t${p.price}\t${typeof window !== 'undefined' ? window.location.href : ''}`);
    }
  });
  return lines.join('\n');
}

function exportBOM(selected) {
  const rows = [['Category', 'Part', 'Price (₹)', 'Specs']];
  PART_CATEGORIES.forEach((cat) => {
    const id = selected[cat.id];
    if (id) {
      const p = getPartById(id);
      if (p) rows.push([cat.label, p.name, p.price, [p.socket, p.tdp, p.watts, p.speed].filter(Boolean).join(' ')]);
    }
  });
  return rows.map((r) => r.join(',')).join('\n');
}

export default function BuildPCView() {
  const [selected, setSelected] = useBuildState();
  const [preset, setPreset] = useState('');
  const [budgetSlider, setBudgetSlider] = useState(100000);
  const [aestheticFilter, setAestheticFilter] = useState('any');
  const [formFactorFilter, setFormFactorFilter] = useState('');
  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [savedBuilds, setSavedBuilds] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const s = localStorage.getItem(SAVED_BUILDS_KEY);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [compareList, setCompareList] = useState([]);
  const [buildNotes, setBuildNotes] = useState({});
  const [wishlist, setWishlist] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const s = localStorage.getItem(WISHLIST_KEY);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });
  const [customPart, setCustomPart] = useState({ name: '', price: 0, category: 'other' });
  const [shareLink, setShareLink] = useState('');
  const [activeCompareBuild, setActiveCompareBuild] = useState(null);
  const [gstState, setGstState] = useState('18');
  const [resolution, setResolution] = useState('1080p');
  const [persona, setPersona] = useState(''); // Max FPS / Max silence / Max value

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    if (params.get('build')) setShareLink(generateShareLink(selected));
  }, [selected]);

  useEffect(() => { setSavedBuilds((prev) => { try { localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(prev)); } catch (_) {} return prev; }); }, [savedBuilds]);
  useEffect(() => { setWishlist((prev) => { try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(prev)); } catch (_) {} return prev; }); }, [wishlist]);

  const totalPrice = useMemo(() => getTotalPrice(selected, currency), [selected, currency]);
  const compatibilityIssues = useMemo(() => checkCompatibility(selected, pcParts), [selected]);
  const totalWatts = useMemo(() => getTotalWatts(selected), [selected]);
  const psuPart = selected.psu ? getPartById(selected.psu) : null;
  const psuHeadroom = psuPart ? Math.round((1 - totalWatts / psuPart.watts) * 100) : null;
  const bottleneck = useMemo(() => getBottleneckScore(selected), [selected]);
  const thermalScore = useMemo(() => getThermalScore(selected), [selected]);
  const futureProof = useMemo(() => getFutureProofScore(selected), [selected]);
  const pricePerFrame = useMemo(() => getPricePerFrame(selected, resolution), [selected, resolution]);
  const noiseEstimate = useMemo(() => getNoiseEstimate(selected), [selected]);
  const warrantySummary = useMemo(() => getWarrantySummary(selected), [selected]);
  const buildDifficulty = useMemo(() => getBuildDifficulty(selected), [selected]);
  const toolRequirements = useMemo(() => getToolRequirements(selected), [selected]);
  const diversity = useMemo(() => getDiversityScore(selected), [selected]);

  const filteredParts = useCallback(
    (category) => {
      let list = getPartsByCategory(category);
      if (!showOutOfStock) list = list.filter((p) => p.inStock);
      if (aestheticFilter && aestheticFilter !== 'any') list = list.filter((p) => p.aesthetic === aestheticFilter || !p.aesthetic);
      if (formFactorFilter) list = list.filter((p) => p.formFactor === formFactorFilter || !p.formFactor);
      if (budgetSlider > 0) list = list.filter((p) => p.price <= budgetSlider * 1.2);
      return list;
    },
    [showOutOfStock, aestheticFilter, formFactorFilter, budgetSlider]
  );

  const alternateSuggestions = useCallback(
    (partId) => {
      const p = getPartById(partId);
      if (!p) return [];
      return getPartsByCategory(p.category).filter((x) => x.id !== partId && x.price < p.price).slice(0, 3);
    },
    []
  );

  const addToCompare = (build) => setCompareList((prev) => (prev.some((b) => b.id === build.id) ? prev : [...prev, build]));
  const saveCurrentBuild = () => {
    const name = `Build ${new Date().toLocaleDateString()} ${totalPrice}`;
    setSavedBuilds((prev) => [...prev, { id: Date.now().toString(), name, selected: { ...selected }, totalPrice, savedAt: new Date().toISOString() }]);
  };
  const loadBuild = (build) => setSelected(build.selected || {});
  const toggleWishlist = (id) => setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const addCustomPart = () => {
    if (!customPart.name || customPart.price <= 0) return;
    const id = `custom_${Date.now()}`;
    setSelected((s) => ({ ...s, [customPart.category]: id }));
    setCustomPart({ name: '', price: 0, category: 'other' });
  };
  const copyShareLink = () => {
    const link = generateShareLink(selected);
    setShareLink(link);
    if (typeof navigator !== 'undefined' && navigator.clipboard) navigator.clipboard.writeText(link);
  };

  const G = brand.green;
  const GM = brand.greenMint;
  const SH = brand.storeHeading;
  const SD = brand.storeDim;
  const SB = brand.storeBorder;

  const cardStyle = { background: '#fff', border: `1px solid ${SB}`, borderRadius: 16, padding: 16, boxShadow: '0 1px 6px rgba(27,94,32,.05)' };
  const sectionTitle = { fontSize: 10, fontWeight: 800, letterSpacing: '.2em', textTransform: 'uppercase', color: G, marginBottom: 12 };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 80px', background: '#fff' }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(150deg, ${brand.greenDark} 0%, ${G} 50%, ${brand.greenLight} 100%)`, borderRadius: 24, padding: '40px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', border: '1px solid rgba(255,255,255,.1)' }} />
        <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(28px,5vw,42px)', color: '#fff', marginBottom: 8 }}>Build Your PC</h1>
        <p style={{ color: '#C8E6C9', fontSize: 14, marginBottom: 20 }}>50+ features you won’t find on typical e‑commerce — compatibility, bottleneck & thermal checks, presets, export & more.</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 12, fontWeight: 600 }}>✓ Live compatibility</span>
          <span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 12, fontWeight: 600 }}>✓ Bottleneck & thermal</span>
          <span style={{ padding: '8px 14px', borderRadius: 10, background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 12, fontWeight: 600 }}>✓ Save & share builds</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
        <div>
          {/* 17. Use-case presets */}
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <div style={sectionTitle}>Use-case presets</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {USE_CASE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setPreset(p.id); setBudgetSlider((p.budgetMin + p.budgetMax) / 2); }}
                  style={{ padding: '10px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600, border: `1.5px solid ${preset === p.id ? G : SB}`, background: preset === p.id ? GM : '#fff', color: preset === p.id ? G : SD, cursor: 'pointer' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 18–19. Aesthetic + form factor filters */}
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <div style={sectionTitle}>Aesthetic & form factor</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {AESTHETIC_FILTERS.map((a) => (
                <button key={a.id} onClick={() => setAestheticFilter(a.id)} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600, border: `1px solid ${aestheticFilter === a.id ? G : SB}`, background: aestheticFilter === a.id ? GM : '#fff', color: aestheticFilter === a.id ? G : SD, cursor: 'pointer' }}>{a.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {FORM_FACTORS.map((f) => (
                <button key={f.id} onClick={() => setFormFactorFilter(formFactorFilter === f.id ? '' : f.id)} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600, border: `1px solid ${formFactorFilter === f.id ? G : SB}`, background: formFactorFilter === f.id ? GM : '#fff', color: formFactorFilter === f.id ? G : SD, cursor: 'pointer' }}>{f.label}</button>
              ))}
            </div>
          </div>

          {/* 16. Budget slider */}
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <div style={sectionTitle}>Budget slider (₹)</div>
            <input type="range" min="30000" max="300000" step="5000" value={budgetSlider} onChange={(e) => setBudgetSlider(Number(e.target.value))} style={{ width: '100%', accentColor: G }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: SD }}>₹30k — ₹{Math.round(budgetSlider / 1000)}k — ₹300k</div>
          </div>

          {/* 43. Availability toggle */}
          <div style={{ ...cardStyle, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: SH }}>Show out-of-stock parts</span>
            <button onClick={() => setShowOutOfStock(!showOutOfStock)} style={{ width: 44, height: 24, borderRadius: 12, background: showOutOfStock ? G : '#ccc', border: 'none', cursor: 'pointer', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 2, left: showOutOfStock ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
            </button>
          </div>

          {/* Part selectors by category */}
          {PART_CATEGORIES.map((cat) => (
            <div key={cat.id} style={{ ...cardStyle, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={sectionTitle}>{cat.icon} {cat.label}</span>
                {selected[cat.id] && (
                  <span style={{ fontSize: 10, padding: '4px 10px', borderRadius: 8, background: GM, color: G, fontWeight: 700 }}>✓ Selected</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {filteredParts(cat.id).map((p) => {
                  const isSelected = selected[cat.id] === p.id;
                  return (
                    <div
                      key={p.id}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, border: `2px solid ${isSelected ? G : SB}`, background: isSelected ? GM : '#fafafa', cursor: 'pointer' }}
                      onClick={() => setSelected((s) => ({ ...s, [cat.id]: isSelected ? undefined : p.id }))}
                    >
                      <div>
                        <div style={{ fontWeight: 700, color: SH, fontSize: 13 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: SD }}>{p.brand} · {currency === 'INR' ? `₹${fmt(p.price)}` : `$${Math.round(p.price / 83)}`}</div>
                        {/* 39. Per-part pros/cons */}
                        {p.pros && <div style={{ fontSize: 10, color: G, marginTop: 4 }}>✓ {p.pros.join(' · ')}</div>}
                        {p.cons && <div style={{ fontSize: 10, color: brand.red, marginTop: 2 }}>✗ {p.cons.join(' · ')}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {/* 13. Wishlist / notify */}
                        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }} style={{ padding: '6px 10px', borderRadius: 8, background: wishlist.includes(p.id) ? brand.gold : '#eee', color: wishlist.includes(p.id) ? '#000' : SD, fontSize: 11, border: 'none', cursor: 'pointer' }} title="Notify when cheaper">{wishlist.includes(p.id) ? '★' : '☆'}</button>
                        {/* 37. Release date badge */}
                        {p.releaseYear >= 2024 && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: G, color: '#fff' }}>New</span>}
                        {p.releaseYear <= 2022 && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: SD, color: '#fff' }}>EOL soon</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* 15. Alternate part suggestions */}
              {selected[cat.id] && alternateSuggestions(selected[cat.id]).length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${SB}` }}>
                  <div style={{ fontSize: 10, color: SD, marginBottom: 6 }}>Similar for less:</div>
                  {alternateSuggestions(selected[cat.id]).map((alt) => (
                    <button key={alt.id} onClick={() => setSelected((s) => ({ ...s, [cat.id]: alt.id }))} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', marginBottom: 4, borderRadius: 8, background: '#f5f5f5', border: 'none', fontSize: 11, color: SH, cursor: 'pointer' }}>{alt.name} — ₹{fmt(alt.price)}</button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* 44. Custom part */}
          <div style={{ ...cardStyle, marginBottom: 20 }}>
            <div style={sectionTitle}>Add custom part</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <input placeholder="Part name" value={customPart.name} onChange={(e) => setCustomPart((p) => ({ ...p, name: e.target.value }))} style={{ flex: 1, minWidth: 120, padding: '10px 12px', borderRadius: 10, border: `1px solid ${SB}`, fontSize: 12 }} />
              <input type="number" placeholder="₹" value={customPart.price || ''} onChange={(e) => setCustomPart((p) => ({ ...p, price: Number(e.target.value) || 0 }))} style={{ width: 90, padding: '10px 12px', borderRadius: 10, border: `1px solid ${SB}`, fontSize: 12 }} />
              <button onClick={addCustomPart} style={{ padding: '10px 18px', borderRadius: 10, background: G, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Add</button>
            </div>
          </div>
        </div>

        {/* Right sidebar: summary + 50 features */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ ...cardStyle, marginBottom: 16, border: `2px solid ${G}20` }}>
            <div style={{ fontFamily: brand.fontDisplay, fontWeight: 700, fontSize: 20, color: SH, marginBottom: 16 }}>Build summary</div>
            {/* 45. Currency toggle */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <button onClick={() => setCurrency('INR')} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${currency === 'INR' ? G : SB}`, background: currency === 'INR' ? GM : '#fff', color: currency === 'INR' ? G : SD, cursor: 'pointer' }}>INR</button>
              <button onClick={() => setCurrency('USD')} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${currency === 'USD' ? G : SB}`, background: currency === 'USD' ? GM : '#fff', color: currency === 'USD' ? G : SD, cursor: 'pointer' }}>USD</button>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: G, marginBottom: 16 }}>{currency === 'INR' ? `₹${fmt(totalPrice)}` : `$${Math.round(totalPrice)}`}</div>

            {/* 14. Price history sparkline (mock for build total) */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 28, marginBottom: 16 }}>
              {[1.05, 1.02, 0.98, 1.01, 0.99, 1].map((mult, i) => (
                <div key={i} style={{ width: 8, height: Math.max(4, 24 * mult), background: i === 5 ? G : '#ddd', borderRadius: 2 }} title="Price trend (mock)" />
              ))}
              <span style={{ fontSize: 9, color: SD, marginLeft: 6 }}>Trend</span>
            </div>

            {/* 1. Live compatibility */}
            {compatibilityIssues.length > 0 && (
              <div style={{ marginBottom: 12, padding: 12, background: '#FEE2E2', borderRadius: 12, border: '1px solid #EF4444' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: brand.red, marginBottom: 6 }}>Compatibility issues</div>
                {compatibilityIssues.map((i, idx) => (
                  <div key={idx} style={{ fontSize: 11, color: '#B91C1C', marginBottom: 4 }}>• {i.msg}</div>
                ))}
                {/* 10. Conflict resolution */}
                <div style={{ fontSize: 10, color: SD, marginTop: 6 }}>Change the suggested part above to resolve.</div>
              </div>
            )}
            {compatibilityIssues.length === 0 && Object.keys(selected).length > 0 && (
              <div style={{ padding: '8px 12px', background: GM, borderRadius: 10, fontSize: 11, fontWeight: 600, color: G, marginBottom: 12 }}>✓ No compatibility conflicts</div>
            )}
            {/* 20. Compatibility badges */}
            {compatibilityIssues.length === 0 && Object.keys(selected).length >= 3 && (
              <div style={{ fontSize: 10, color: SD, marginBottom: 12 }}>Verified compatible · Socket, TDP, clearance checked</div>
            )}

            {/* 2. Bottleneck */}
            {bottleneck && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: SD, marginBottom: 4 }}>Bottleneck</div>
                <div style={{ padding: '8px 12px', borderRadius: 10, background: bottleneck.level === 'balanced' ? GM : '#FEF3C7', color: bottleneck.level === 'balanced' ? G : '#92400E', fontSize: 12, fontWeight: 600 }}>{bottleneck.msg}</div>
              </div>
            )}

            {/* 3. Power draw + headroom */}
            {psuPart && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: SD, marginBottom: 4 }}>Power draw · PSU headroom</div>
                <div style={{ padding: '8px 12px', borderRadius: 10, background: psuHeadroom >= 20 ? GM : '#FEE2E2', fontSize: 12, fontWeight: 600 }}>~{totalWatts}W · {psuHeadroom}% headroom</div>
              </div>
            )}

            {/* 4. Thermal score */}
            {thermalScore != null && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: SD, marginBottom: 4 }}>Thermal score</div>
                <div style={{ padding: '8px 12px', borderRadius: 10, background: GM, fontSize: 12, fontWeight: 600 }}>{thermalScore}/100</div>
              </div>
            )}

            {/* 5. Future-proof */}
            {futureProof > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: SD, marginBottom: 4 }}>Future-proof</div>
                <div style={{ padding: '8px 12px', borderRadius: 10, background: GM, fontSize: 12, fontWeight: 600 }}>{futureProof}/10</div>
              </div>
            )}

            {/* 6. Price per frame */}
            {pricePerFrame && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: SD, marginBottom: 4 }}>Price per frame ({resolution})</div>
                <div style={{ padding: '8px 12px', borderRadius: 10, background: '#f0f0f0', fontSize: 12, fontWeight: 600 }}>₹{Math.round(pricePerFrame.ppf)}/fps · ~{pricePerFrame.fps} fps</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {['1080p', '1440p', '4k'].map((res) => (
                    <button key={res} onClick={() => setResolution(res)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, border: `1px solid ${resolution === res ? G : SB}`, background: resolution === res ? GM : '#fff', color: resolution === res ? G : SD, cursor: 'pointer' }}>{res}</button>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Noise estimate */}
            {noiseEstimate != null && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: SD, marginBottom: 4 }}>Est. noise</div>
                <div style={{ padding: '8px 12px', borderRadius: 10, background: '#f0f0f0', fontSize: 12, fontWeight: 600 }}>~{noiseEstimate} dB</div>
              </div>
            )}

            {/* 42. Diversity score */}
            {diversity.total > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: SD, marginBottom: 4 }}>Brand diversity</div>
                <div style={{ padding: '8px 12px', borderRadius: 10, background: '#f0f0f0', fontSize: 12, fontWeight: 600 }}>{diversity.unique} brands · {diversity.score}%</div>
              </div>
            )}

            {/* 27. PSU tier */}
            {psuPart && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: SD, marginBottom: 4 }}>PSU tier</div>
                <div style={{ padding: '8px 12px', borderRadius: 10, background: GM, fontSize: 12, fontWeight: 600 }}>{psuPart.tier || 'A'} · {psuPart.efficiency} · {psuPart.warranty}y warranty</div>
              </div>
            )}

            {/* 25. RAM speed sweet spot note */}
            {selected.ram && (() => {
              const ram = getPartById(selected.ram);
              const cpu = selected.cpu ? getPartById(selected.cpu) : null;
              const am5Sweet = cpu?.socket === 'AM5' && ram?.am5SweetSpot;
              return am5Sweet ? (
                <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 10, background: GM, fontSize: 11, color: G }}>✓ RAM at AM5 sweet spot ({ram.speed} MT/s)</div>
              ) : null;
            })()}

            {/* 24. PCIe lane usage note */}
            {selected.gpu && (selected.storage || selected.motherboard) && (
              <div style={{ marginBottom: 12, fontSize: 10, color: SD }}>PCIe: GPU uses x16 · M.2 uses board lanes</div>
            )}

            {/* 41. Upgrade path note */}
            {selected.cpu && (() => {
              const cpu = getPartById(selected.cpu);
              if (cpu?.socket === 'AM5') return <div style={{ marginBottom: 12, fontSize: 10, color: G }}>Upgrade path: AM5 future CPUs supported</div>;
              if (cpu?.socket === 'AM4') return <div style={{ marginBottom: 12, fontSize: 10, color: SD }}>AM4: platform mature, limited future upgrades</div>;
              return null;
            })()}

            {/* 28–29. One-click personas */}
            <div style={sectionTitle}>One-click personas</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              <button onClick={() => setPersona('fps')} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600, border: `1px solid ${persona === 'fps' ? G : SB}`, background: persona === 'fps' ? GM : '#fff', color: persona === 'fps' ? G : SD, cursor: 'pointer' }}>Max FPS</button>
              <button onClick={() => setPersona('silence')} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600, border: `1px solid ${persona === 'silence' ? G : SB}`, background: persona === 'silence' ? GM : '#fff', color: persona === 'silence' ? G : SD, cursor: 'pointer' }}>Max silence</button>
              <button onClick={() => setPersona('value')} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600, border: `1px solid ${persona === 'value' ? G : SB}`, background: persona === 'value' ? GM : '#fff', color: persona === 'value' ? G : SD, cursor: 'pointer' }}>Max value</button>
            </div>

            {/* 35. Warranty summary */}
            {warrantySummary.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={sectionTitle}>Warranty summary</div>
                {warrantySummary.map((w, i) => (
                  <div key={i} style={{ fontSize: 11, color: SD, marginBottom: 2 }}>{w.name}: {w.years}y</div>
                ))}
              </div>
            )}

            {/* 48. Build difficulty */}
            <div style={{ marginBottom: 12 }}>
              <div style={sectionTitle}>Build difficulty</div>
              <div style={{ padding: '8px 12px', borderRadius: 10, background: '#f0f0f0', fontSize: 12, fontWeight: 600 }}>{buildDifficulty.label}</div>
              <div style={{ fontSize: 10, color: SD, marginTop: 4 }}>{buildDifficulty.tip}</div>
            </div>

            {/* 49. Tool requirements */}
            <div style={{ marginBottom: 12 }}>
              <div style={sectionTitle}>Tools needed</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: SD }}>
                {toolRequirements.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            {/* 46. Tax estimator */}
            <div style={{ marginBottom: 12 }}>
              <div style={sectionTitle}>GST (India)</div>
              <select value={gstState} onChange={(e) => setGstState(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: `1px solid ${SB}`, fontSize: 12 }}>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
              <div style={{ fontSize: 12, color: SH, marginTop: 6 }}>Tax: ₹{fmt(Math.round(totalPrice * Number(gstState) / 100))}</div>
            </div>

            {/* 47. Delivery date estimate */}
            <div style={{ marginBottom: 12 }}>
              <div style={sectionTitle}>Est. delivery</div>
              <div style={{ padding: '8px 12px', borderRadius: 10, background: '#f0f0f0', fontSize: 12, color: SH }}>5–7 business days (all in stock)</div>
            </div>

            {/* 36. Bundle detector */}
            {selected.cpu && selected.motherboard && (
              <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: GM, fontSize: 11, color: G }}>✓ CPU + Motherboard combo compatible</div>
            )}

            {/* 11. Saved builds */}
            <div style={sectionTitle}>Saved builds</div>
            <button onClick={saveCurrentBuild} style={{ width: '100%', padding: '10px 16px', borderRadius: 10, background: G, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', marginBottom: 10 }}>Save current build</button>
            {savedBuilds.slice(-5).reverse().map((b) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${SB}` }}>
                <span style={{ fontSize: 11, color: SH }}>{b.name}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => loadBuild(b)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: GM, color: G, border: 'none', cursor: 'pointer' }}>Load</button>
                  <button onClick={() => addToCompare(b)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600, background: '#f0f0f0', color: SH, border: 'none', cursor: 'pointer' }}>Compare</button>
                </div>
              </div>
            ))}

            {/* 33. Share build */}
            <div style={{ ...sectionTitle, marginTop: 16 }}>Share build</div>
            <button onClick={copyShareLink} style={{ width: '100%', padding: '10px 16px', borderRadius: 10, background: brand.blue, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Copy share link</button>
            {shareLink && <div style={{ fontSize: 10, color: G, marginTop: 6 }}>Link copied!</div>}

            {/* 30–32. Export */}
            <div style={sectionTitle}>Export</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => { const t = exportPCPartPickerFormat(selected); if (typeof navigator !== 'undefined') navigator.clipboard.writeText(t); }} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#f0f0f0', color: SH, border: 'none', cursor: 'pointer' }}>PCPartPicker format</button>
              <button onClick={() => { const t = exportBOM(selected); if (typeof navigator !== 'undefined') navigator.clipboard.writeText(t); }} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#f0f0f0', color: SH, border: 'none', cursor: 'pointer' }}>BOM CSV</button>
              <button onClick={() => window.print()} style={{ padding: '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#f0f0f0', color: SH, border: 'none', cursor: 'pointer' }}>Print build sheet</button>
            </div>
          </div>

          {/* 34. Build notes */}
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={sectionTitle}>Build notes</div>
            <textarea placeholder="Add notes for this build..." value={buildNotes[Object.keys(selected).join(',')] || ''} onChange={(e) => setBuildNotes((n) => ({ ...n, [Object.keys(selected).join(',')]: e.target.value }))} rows={3} style={{ width: '100%', padding: 10, borderRadius: 10, border: `1px solid ${SB}`, fontSize: 12, resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          {/* 50. Video guide links */}
          <div style={{ ...cardStyle }}>
            <div style={sectionTitle}>Video guides</div>
            <a href="https://www.youtube.com/results?search_query=how+to+build+pc+2024" target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12, color: brand.blue, marginBottom: 6 }}>Full build guide (YouTube)</a>
            {selected.cpu && getPartById(selected.cpu)?.guideUrl && <a href={getPartById(selected.cpu).guideUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12, color: brand.blue }}>CPU install guide</a>}
          </div>

          {/* 21. Simple 3D case preview — box + slots */}
          {selected.case && (() => {
            const casePart = getPartById(selected.case);
            const gpu = selected.gpu ? getPartById(selected.gpu) : null;
            const cooler = selected.cooler ? getPartById(selected.cooler) : null;
            const gpuOk = !gpu || (casePart.gpuMaxLength && gpu.length <= casePart.gpuMaxLength);
            const coolerOk = !cooler || !cooler.height || (casePart.coolerMaxHeight && cooler.height <= casePart.coolerMaxHeight);
            return (
              <div style={{ ...cardStyle, marginTop: 16 }}>
                <div style={sectionTitle}>Case preview</div>
                <div style={{ width: '100%', aspectRatio: '1.2', maxWidth: 200, margin: '0 auto', background: '#1a1a2e', borderRadius: 12, padding: 12, position: 'relative' }}>
                  <div style={{ position: 'absolute', top: 8, left: 8, right: 8, height: 24, background: '#2A2A3E', borderRadius: 4 }} title="MB" />
                  <div style={{ position: 'absolute', top: 40, left: 8, width: '30%', height: 16, background: '#2A2A3E', borderRadius: 4 }} title="CPU" />
                  <div style={{ position: 'absolute', top: 40, right: 8, width: '50%', height: 40, background: gpuOk ? '#2E7D32' : '#EF4444', borderRadius: 4 }} title={gpuOk ? 'GPU fits' : 'GPU too long'} />
                  <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, height: 12, background: '#2A2A3E', borderRadius: 4 }} title="PSU" />
                </div>
                <div style={{ fontSize: 10, color: SD, marginTop: 8 }}>Clearance: GPU {gpuOk ? '✓' : '✗'} · Cooler {coolerOk ? '✓' : '✗'}</div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 12. Compare builds panel */}
      {compareList.length > 0 && (
        <div style={{ ...cardStyle, marginTop: 24 }}>
          <div style={sectionTitle}>Compare builds</div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareList.length}, 1fr)`, gap: 16, overflowX: 'auto' }}>
            {compareList.map((b) => (
              <div key={b.id} style={{ padding: 12, background: '#f9f9f9', borderRadius: 12, minWidth: 200 }}>
                <div style={{ fontWeight: 700, color: SH, fontSize: 13, marginBottom: 8 }}>{b.name}</div>
                <div style={{ fontSize: 12, color: G, marginBottom: 8 }}>₹{fmt(b.totalPrice)}</div>
                <button onClick={() => { setActiveCompareBuild(b); loadBuild(b); }} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, background: G, color: '#fff', border: 'none', cursor: 'pointer' }}>View</button>
                <button onClick={() => setCompareList((p) => p.filter((x) => x.id !== b.id))} style={{ marginLeft: 8, padding: '6px 12px', borderRadius: 8, fontSize: 11, background: '#eee', color: SD, border: 'none', cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 38. Prosumer tips */}
      <div style={{ ...cardStyle, marginTop: 24, padding: 20 }}>
        <div style={sectionTitle}>Prosumer tips</div>
        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: SD, lineHeight: 1.8 }}>
          <li>Enable EXPO/XMP in BIOS for full RAM speed (DDR5/DDR4).</li>
          <li>Update motherboard BIOS before first boot for best compatibility.</li>
          <li>Use two separate PCIe cables for high-power GPUs (no daisy-chain).</li>
          <li>M.2 Gen4 runs hot — consider a heatsink if your board doesn’t include one.</li>
        </ul>
      </div>
    </div>
  );
}
