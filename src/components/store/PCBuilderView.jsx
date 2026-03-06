'use client';

import { useState, useEffect, useMemo } from 'react';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';
import { PART_CATEGORIES, getPartsByCategory, getPartById } from '@/data/pcParts';
import { getCompatibleParts } from '@/lib/pcBuilderUtils';
import {
  getBuildSummaryText,
  encodeBuildShare,
  decodeBuildShare,
  getBuildPricing,
} from '@/lib/pcBuilderUtils';

const G = brand.green || brand.primary;
const E = brand.emerald;

const PROMO_CODES = { BUILD100: 1000, TVSPC500: 500 };

export default function PCBuilderView({
  theme,
  settings = {},
  show,
  createStoreFeature,
  fetchStoreFeatures,
  storeFeaturesData,
  pendingBuildPresetId,
  setPendingBuildPresetId,
  onRequestExpert,
  addToCart,
}) {
  const gstRate = Number(settings?.GST_RATE) || 5;
  const [step, setStep] = useState('cpu');
  const [selected, setSelected] = useState({});
  const [searchInCategory, setSearchInCategory] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [buildSummary, setBuildSummary] = useState(null);
  const [savedBuilds, setSavedBuilds] = useState([]);
  const [saveName, setSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [comparePart, setComparePart] = useState(null);
  const [shareUrl, setShareUrl] = useState('');

  const [presets, setPresets] = useState([]);
  useEffect(() => {
    fetch('/api/buildpc').then((r) => r.json()).then((d) => setPresets(d.presets || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const buildParam = params?.get('build');
    if (buildParam) {
      try {
        const partIds = decodeBuildShare(buildParam);
        const next = {};
        partIds.forEach((id) => {
          const p = getPartById(id);
          if (p) next[p.category] = p;
        });
        if (Object.keys(next).length > 0) setSelected(next);
      } catch (_) {}
    }
  }, []);

  // Load preset when Kynetra sends user to Build PC with a preset (e.g. "Budget build")
  useEffect(() => {
    if (!pendingBuildPresetId || !setPendingBuildPresetId) return;
    fetch('/api/buildpc')
      .then((r) => r.json())
      .then((d) => {
        const presets = d.presets || [];
        const preset = presets.find((p) => p.id === pendingBuildPresetId);
        if (preset && preset.partIds) {
          const next = {};
          preset.partIds.forEach((id) => {
            const p = getPartById(id);
            if (p) next[p.category] = p;
          });
          setSelected(next);
          show('Preset loaded: ' + (preset.name || pendingBuildPresetId));
        }
      })
      .catch(() => {})
      .finally(() => setPendingBuildPresetId(null));
  }, [pendingBuildPresetId, setPendingBuildPresetId, show]);

  const partIds = useMemo(() => {
    const ids = {};
    PART_CATEGORIES.forEach((c) => {
      const p = selected[c.id];
      if (p) ids[c.id] = p.id;
    });
    return ids;
  }, [selected]);

  const partsList = useMemo(() => Object.values(selected).filter(Boolean), [selected]);
  const partsMap = useMemo(() => {
    const m = {};
    partsList.forEach((p) => { m[p.category] = p; });
    m.storageList = partsList.filter((p) => p.category === 'storage');
    return m;
  }, [partsList]);

  useEffect(() => {
    if (Object.keys(partIds).length === 0) {
      setBuildSummary(null);
      return;
    }
    fetch('/api/buildpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partIds,
        gstRate,
        bundleDiscount: partsList.length >= 6 ? 1000 : 0,
      }),
    })
      .then((r) => r.json())
      .then(setBuildSummary)
      .catch(() => setBuildSummary(null));
  }, [partIds, gstRate, partsList.length]);

  useEffect(() => {
    fetch('/api/store-features?type=savedBuilds')
      .then((r) => r.json())
      .then((d) => setSavedBuilds(d.savedBuilds || []))
      .catch(() => {});
  }, [showSaveModal, showLoadModal]);

  const compatibleParts = useMemo(() => {
    const list = getCompatibleParts(step, partsMap);
    let out = searchInCategory.trim() ? list.filter((p) => (p.name || '').toLowerCase().includes(searchInCategory.toLowerCase())) : list;
    if (sortBy === 'price_asc') out = [...out].sort((a, b) => (a.price || 0) - (b.price || 0));
    if (sortBy === 'price_desc') out = [...out].sort((a, b) => (b.price || 0) - (a.price || 0));
    return out;
  }, [step, partsMap, searchInCategory, sortBy]);

  const selectPart = (part) => {
    setSelected((s) => ({ ...s, [part.category]: part }));
  };
  const removePart = (categoryId) => {
    setSelected((s) => { const n = { ...s }; delete n[categoryId]; return n; });
  };

  const applyPromo = () => {
    const code = (promoCode || '').toUpperCase().trim();
    const discount = PROMO_CODES[code];
    if (discount) {
      setAppliedPromo({ code, discount });
      show(`Promo ${code} applied: ₹${discount} off`);
    } else {
      setAppliedPromo(null);
      show('Invalid promo code', 'error');
    }
  };

  const bundleDiscount = partsList.length >= 6 ? 1000 : 0;
  const promoDiscount = appliedPromo?.discount || 0;
  const pricing = useMemo(
    () => getBuildPricing(partsList, gstRate, bundleDiscount + promoDiscount),
    [partsList, gstRate, bundleDiscount, promoDiscount]
  );

  const handleSaveBuild = () => {
    if (!saveName.trim()) { show('Enter a build name', 'error'); return; }
    const partIdsArr = Object.values(partIds);
    createStoreFeature('savedBuilds', { name: saveName.trim(), partIds: partIdsArr, customerId: 'guest' });
    show('Build saved');
    setSaveName('');
    setShowSaveModal(false);
  };

  const handleLoadBuild = (build) => {
    const ids = build.partIds || [];
    const next = {};
    ids.forEach((id) => {
      const p = getPartById(id);
      if (p) next[p.category] = p;
    });
    setSelected(next);
    setShowLoadModal(false);
    show('Build loaded');
  };

  const handleLoadPreset = (preset) => {
    const ids = preset.partIds || [];
    const next = {};
    ids.forEach((id) => {
      const p = getPartById(id);
      if (p) next[p.category] = p;
    });
    setSelected(next);
    show(`Preset "${preset.name}" loaded`);
  };

  const handleShareBuild = () => {
    const encoded = encodeBuildShare(Object.values(partIds));
    const url = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?build=${encoded}` : '';
    setShareUrl(url);
    if (url && navigator.clipboard) navigator.clipboard.writeText(url).then(() => show('Link copied to clipboard'));
  };

  const handleCloneBuild = () => {
    setSaveName('My Build (Copy)');
    setShowSaveModal(true);
  };

  const handleClearBuild = () => {
    setSelected({});
    setAppliedPromo(null);
    setShowClearConfirm(false);
    show('Build cleared');
  };

  const handlePrint = () => {
    const text = getBuildSummaryText(
      partsList,
      partsMap,
      pricing,
      buildSummary?.fpsEstimate,
      buildSummary?.performanceScore,
      buildSummary?.warnings
    );
    const w = window.open('', '_blank');
    w.document.write(`<pre style="font-family:system-ui; padding:24px;">${text.replace(/</g, '&lt;')}</pre>`);
    w.document.close();
    w.print();
    w.close();
  };

  const handleEmailBuild = () => {
    const text = getBuildSummaryText(
      partsList,
      partsMap,
      pricing,
      buildSummary?.fpsEstimate,
      buildSummary?.performanceScore,
      buildSummary?.warnings
    );
    const mailto = `mailto:?subject=My PC Build - TheValueStore&body=${encodeURIComponent(text)}`;
    window.location.href = mailto;
  };

  const handleAddBuildToCart = () => {
    partsList.forEach((p) => addToCart({ id: p.id, name: p.name, price: p.price }));
    show('Build added to cart');
  };

  const allRequired = PART_CATEGORIES.filter((c) => c.required).every((c) => selected[c.id]);
  const hasAnyPart = partsList.length > 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>
      {/* Left: Step wizard + part selection */}
      <div>
        <p style={{ fontSize: 14, color: theme.storeDim, marginBottom: 16 }}>
          Build step-by-step. Compatibility is checked automatically. Wattage and FPS estimates in the sidebar.
        </p>

        {/* Build presets: load a preset to pre-fill */}
        {presets.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: 14, color: theme.storeHeading, marginBottom: 8 }}>Load preset</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeBg2, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 1. Step-by-step wizard tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {PART_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setStep(c.id)}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid ${step === c.id ? G : theme.storeBorder}`,
                background: step === c.id ? G : theme.storeBg2,
                color: step === c.id ? '#fff' : theme.storeHeading,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {c.icon} {c.label} {selected[c.id] ? '✓' : ''}
            </button>
          ))}
        </div>

        {/* 2. Search within category */}
        <div style={{ marginBottom: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="search"
            placeholder={`Search ${PART_CATEGORIES.find((c) => c.id === step)?.label || step}...`}
            value={searchInCategory}
            onChange={(e) => setSearchInCategory(e.target.value)}
            style={{ flex: '1', minWidth: 180, padding: '10px 14px', borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, color: theme.storeHeading }}
          />
          {/* 3. Sort parts */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, color: theme.storeHeading }}
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* 4. Compatible parts list (filter by compatibility) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {compatibleParts.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 14,
                background: selected[step]?.id === p.id ? brand.greenMint : theme.storeCard,
                border: `1px solid ${selected[step]?.id === p.id ? G : theme.storeBorder}`,
                borderRadius: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: theme.storeHeading }}>{p.name}</div>
                <div style={{ fontSize: 12, color: theme.storeDim }}>
                  {p.brand} · {fmt(p.price)}
                  {p.tdp != null && ` · ${p.tdp}W TDP`}
                  {p.watts != null && p.category === 'gpu' && ` · ${p.watts}W`}
                  {p.socket && ` · ${p.socket}`}
                  {p.formFactor && ` · ${p.formFactor}`}
                  {p.speed && ` · ${p.speed}MHz`}
                  {p.warranty && ` · ${p.warranty}yr warranty`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setComparePart(comparePart?.id === p.id ? null : p)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.storeBorder}`, background: 'transparent', fontSize: 12, cursor: 'pointer' }}
                >
                  Compare
                </button>
                <button
                  onClick={() => selectPart(p)}
                  style={{ padding: '8px 16px', borderRadius: 8, background: G, color: '#fff', fontWeight: 600, fontSize: 13, border: 'none', cursor: 'pointer' }}
                >
                  {selected[step]?.id === p.id ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Your build sidebar */}
      <div style={{ position: 'sticky', top: 24 }}>
        <div style={{ padding: 20, background: theme.storeBg2, border: `1px solid ${theme.storeBorder}`, borderRadius: 16 }}>
          <h3 style={{ fontSize: 18, color: theme.storeHeading, marginBottom: 16 }}>Your build</h3>

          {/* 5. Empty slot placeholders */}
          {PART_CATEGORIES.map((c) => {
            const p = selected[c.id];
            return (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: theme.storeDim, marginBottom: 4 }}>{c.label}</div>
                {p ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, background: theme.storeCard, borderRadius: 10, border: `1px solid ${theme.storeBorder}` }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: theme.storeHeading }}>{p.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, color: G }}>{fmt(p.price)}</span>
                      <button onClick={() => removePart(c.id)} style={{ color: brand.red, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} title="Remove">✕</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setStep(c.id)}
                    style={{ width: '100%', padding: 12, borderRadius: 10, border: `2px dashed ${theme.storeBorder}`, background: 'transparent', color: theme.storeDim, fontSize: 13, cursor: 'pointer' }}
                  >
                    + Add {c.label}
                  </button>
                )}
              </div>
            );
          })}

          {/* 6. Compatibility matrix */}
          {buildSummary?.compatibility?.length > 0 && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.storeBorder}` }}>
              <h4 style={{ fontSize: 14, color: theme.storeHeading, marginBottom: 8 }}>Compatibility</h4>
              {buildSummary.compatibility.map((c, i) => (
                <div key={i} style={{ fontSize: 12, color: c.ok ? E : brand.red, marginBottom: 4 }}>
                  {c.ok ? '✓' : '✗'} {c.check}: {c.message || 'OK'}
                </div>
              ))}
            </div>
          )}

          {/* 7. Wattage & recommended PSU */}
          {buildSummary?.wattage && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.storeBorder}` }}>
              <h4 style={{ fontSize: 14, color: theme.storeHeading, marginBottom: 8 }}>Power</h4>
              <div style={{ fontSize: 13, color: theme.storeDim }}>
                Est. draw: <strong style={{ color: theme.storeHeading }}>{buildSummary.wattage.estimatedDraw}W</strong>
                <br />
                Recommended PSU: <strong style={{ color: G }}>{buildSummary.wattage.recommendedPsuWattage}W+</strong>
              </div>
            </div>
          )}

          {/* 8. FPS estimate */}
          {buildSummary?.fpsEstimate && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${theme.storeBorder}` }}>
              <h4 style={{ fontSize: 14, color: theme.storeHeading, marginBottom: 8 }}>Est. gaming FPS</h4>
              <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                <span>1080p: <strong>{buildSummary.fpsEstimate.fps1080}</strong></span>
                <span>1440p: <strong>{buildSummary.fpsEstimate.fps1440}</strong></span>
                <span>4K: <strong>{buildSummary.fpsEstimate.fps4k}</strong></span>
              </div>
            </div>
          )}

          {/* 9. Performance score */}
          {buildSummary?.performanceScore != null && (
            <div style={{ marginTop: 12 }}>
              <h4 style={{ fontSize: 14, color: theme.storeHeading, marginBottom: 4 }}>Performance score</h4>
              <div style={{ fontSize: 24, fontWeight: 800, color: E }}>{buildSummary.performanceScore}/100</div>
            </div>
          )}

          {/* 10. Use-case badges */}
          {buildSummary?.useCaseBadges?.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {buildSummary.useCaseBadges.map((b) => (
                <span key={b} style={{ padding: '4px 10px', borderRadius: 8, background: E + '22', color: E, fontSize: 12, fontWeight: 600 }}>{b}</span>
              ))}
            </div>
          )}

          {/* 11. Warnings */}
          {buildSummary?.warnings?.length > 0 && (
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(239,68,68,0.1)', borderRadius: 10, border: `1px solid ${brand.red}` }}>
              {buildSummary.warnings.map((w) => (
                <div key={w.id} style={{ fontSize: 12, color: brand.red, marginBottom: 4 }}>⚠ {w.text}</div>
              ))}
            </div>
          )}

          {/* 12. Pricing: subtotal, GST, bundle discount, promo */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `2px solid ${theme.storeBorder}` }}>
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: theme.storeDim }}>Subtotal</span>
              <span style={{ float: 'right', fontWeight: 700 }}>{fmt(pricing.subtotal)}</span>
            </div>
            {bundleDiscount > 0 && (
              <div style={{ fontSize: 13, marginBottom: 6, color: E }}>
                <span>Bundle discount (full build)</span>
                <span style={{ float: 'right' }}>-{fmt(bundleDiscount)}</span>
              </div>
            )}
            {promoDiscount > 0 && (
              <div style={{ fontSize: 13, marginBottom: 6, color: E }}>
                <span>Promo {appliedPromo?.code}</span>
                <span style={{ float: 'right' }}>-{fmt(promoDiscount)}</span>
              </div>
            )}
            <div style={{ fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: theme.storeDim }}>GST ({gstRate}%)</span>
              <span style={{ float: 'right' }}>{fmt(pricing.gst)}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: G, marginTop: 12 }}>
              Total: {fmt(pricing.total)}
            </div>
          </div>

          {/* 13. Promo code input */}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <input
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              style={{ flex: 1, padding: 10, borderRadius: 8, border: `1px solid ${theme.storeBorder}` }}
            />
            <button onClick={applyPromo} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${G}`, background: 'transparent', color: G, fontWeight: 600, cursor: 'pointer' }}>Apply</button>
          </div>

          {/* 14. Warranty summary */}
          {buildSummary?.warrantySummary?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h4 style={{ fontSize: 14, color: theme.storeHeading, marginBottom: 8 }}>Warranty</h4>
              <div style={{ fontSize: 12, color: theme.storeDim }}>
                {buildSummary.warrantySummary.slice(0, 5).map((w, i) => (
                  <div key={i}>{w.name}: {w.warranty}</div>
                ))}
              </div>
            </div>
          )}

          {/* 15. Estimated delivery */}
          {buildSummary?.estimatedDelivery && (
            <div style={{ marginTop: 12, fontSize: 13, color: theme.storeDim }}>
              Est. delivery: {buildSummary.estimatedDelivery}
            </div>
          )}

          {/* 16. Similar builds */}
          {buildSummary?.similarBuildIds?.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: theme.storeDim }}>
              Similar presets: {buildSummary.similarBuildIds.join(', ')}
            </div>
          )}

          {/* Action buttons: Save, Load, Share, Clone, Clear, Print, Email, Expert, Add to cart */}
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => setShowSaveModal(true)} disabled={!hasAnyPart} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, fontWeight: 600, cursor: hasAnyPart ? 'pointer' : 'not-allowed', opacity: hasAnyPart ? 1 : 0.6 }}>Save build</button>
            <button onClick={() => setShowLoadModal(true)} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, fontWeight: 600, cursor: 'pointer' }}>Load saved build</button>
            <button onClick={handleShareBuild} disabled={!hasAnyPart} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, fontWeight: 600, cursor: hasAnyPart ? 'pointer' : 'not-allowed', opacity: hasAnyPart ? 1 : 0.6 }}>Share build</button>
            {shareUrl && <input readOnly value={shareUrl} style={{ fontSize: 11, padding: 8, borderRadius: 6, border: `1px solid ${theme.storeBorder}` }} />}
            <button onClick={handleCloneBuild} disabled={!hasAnyPart} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, fontWeight: 600, cursor: hasAnyPart ? 'pointer' : 'not-allowed', opacity: hasAnyPart ? 1 : 0.6 }}>Clone build</button>
            <button onClick={() => setShowClearConfirm(true)} disabled={!hasAnyPart} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${brand.red}`, background: 'transparent', color: brand.red, fontWeight: 600, cursor: hasAnyPart ? 'pointer' : 'not-allowed', opacity: hasAnyPart ? 1 : 0.6 }}>Clear build</button>
            <button onClick={handlePrint} disabled={!hasAnyPart} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, fontWeight: 600, cursor: hasAnyPart ? 'pointer' : 'not-allowed', opacity: hasAnyPart ? 1 : 0.6 }}>Print build</button>
            <button onClick={handleEmailBuild} disabled={!hasAnyPart} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, fontWeight: 600, cursor: hasAnyPart ? 'pointer' : 'not-allowed', opacity: hasAnyPart ? 1 : 0.6 }}>Email build</button>
            {onRequestExpert && <button onClick={() => onRequestExpert('Review my PC build')} style={{ width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${E}`, background: 'transparent', color: E, fontWeight: 600, cursor: 'pointer' }}>Expert review</button>}
            <button onClick={handleAddBuildToCart} disabled={!allRequired} style={{ width: '100%', padding: 14, borderRadius: 12, background: allRequired ? G : theme.storeBorder, color: '#fff', fontWeight: 700, fontSize: 16, border: 'none', cursor: allRequired ? 'pointer' : 'not-allowed', opacity: allRequired ? 1 : 0.7 }}>Add build to cart · {fmt(pricing.total)}</button>
          </div>
        </div>
      </div>

      {/* Compare part modal */}
      {comparePart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setComparePart(null)}>
          <div style={{ background: theme.storeCard, padding: 24, borderRadius: 16, maxWidth: 400, width: '90%', border: `1px solid ${theme.storeBorder}` }} onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginBottom: 12 }}>Compare: {comparePart.name}</h4>
            <div style={{ fontSize: 13, color: theme.storeDim }}>
              {Object.entries(comparePart).filter(([k, v]) => !['category', 'pros', 'cons'].includes(k) && v != null && typeof v !== 'object').map(([k, v]) => (
                <div key={k} style={{ marginBottom: 4 }}><strong>{k}</strong>: {String(v)}</div>
              ))}
            </div>
            <button onClick={() => setComparePart(null)} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, background: theme.storeBorder, border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Save build modal */}
      {showSaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: theme.storeCard, padding: 24, borderRadius: 16, maxWidth: 400, width: '90%', border: `1px solid ${theme.storeBorder}` }}>
            <h4 style={{ marginBottom: 12 }}>Save build</h4>
            <input placeholder="Build name" value={saveName} onChange={(e) => setSaveName(e.target.value)} style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 8, border: `1px solid ${theme.storeBorder}` }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleSaveBuild} style={{ flex: 1, padding: 12, borderRadius: 10, background: G, color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Save</button>
              <button onClick={() => setShowSaveModal(false)} style={{ padding: 12, borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: 'transparent', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Load build modal */}
      {showLoadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: theme.storeCard, padding: 24, borderRadius: 16, maxWidth: 440, width: '90%', maxHeight: '80vh', overflow: 'auto', border: `1px solid ${theme.storeBorder}` }}>
            <h4 style={{ marginBottom: 12 }}>Load saved build</h4>
            {savedBuilds.length === 0 ? (
              <p style={{ color: theme.storeDim }}>No saved builds. Save one from the sidebar.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {savedBuilds.map((b) => (
                  <button key={b.id} onClick={() => handleLoadBuild(b)} style={{ padding: 12, textAlign: 'left', borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeBg2, cursor: 'pointer' }}>
                    <div style={{ fontWeight: 600 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: theme.storeDim }}>{(b.partIds || []).length} parts</div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setShowLoadModal(false)} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 8, background: theme.storeBorder, border: 'none', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}

      {/* Clear confirm */}
      {showClearConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: theme.storeCard, padding: 24, borderRadius: 16, maxWidth: 360, border: `1px solid ${theme.storeBorder}` }}>
            <p style={{ marginBottom: 16 }}>Clear all parts from this build?</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleClearBuild} style={{ flex: 1, padding: 12, borderRadius: 10, background: brand.red, color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Clear</button>
              <button onClick={() => setShowClearConfirm(false)} style={{ padding: 12, borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: 'transparent', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
