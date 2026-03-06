/**
 * PC Builder utilities: compatibility, wattage, FPS estimate, performance score, warnings.
 * Powers the 50-feature PC Builder.
 */

import { getPartById, getPartsByCategory } from '@/data/pcParts';

const FORM_ORDER = { itx: 0, matx: 1, atx: 2 };

const PART_ORDER = ['cpu', 'motherboard', 'ram', 'gpu', 'storage', 'psu', 'case', 'cooler'];

// ─── 1. Socket compatibility (CPU + Motherboard) ───
export function checkSocketCompatibility(cpu, motherboard) {
  if (!cpu || !motherboard) return { ok: true };
  return { ok: cpu.socket === motherboard.socket, message: cpu.socket === motherboard.socket ? null : `CPU socket ${cpu.socket} does not match motherboard ${motherboard.socket}` };
}

// ─── 2. Form factor (Case + Motherboard) ───
const FORM_ORDER_MAP = { itx: 0, matx: 1, atx: 2 };
export function checkFormFactorCompatibility(casePart, motherboard) {
  if (!casePart || !motherboard) return { ok: true };
  const caseOrder = FORM_ORDER_MAP[casePart.formFactor] ?? 2;
  const mbOrder = FORM_ORDER_MAP[motherboard.formFactor] ?? 2;
  return { ok: caseOrder >= mbOrder, message: caseOrder >= mbOrder ? null : `Case supports ${casePart.formFactor.toUpperCase()}, motherboard is ${motherboard.formFactor.toUpperCase()}` };
}

// ─── 3. RAM type (DDR4 vs DDR5 from motherboard/CPU) ───
export function getRamTypeForBuild(cpu, motherboard) {
  const mb = motherboard || cpu;
  if (!mb) return null;
  const speed = mb.ramMaxSpeed || 0;
  return speed >= 4800 ? 'DDR5' : 'DDR4';
}

export function checkRamCompatibility(ram, cpu, motherboard) {
  if (!ram) return { ok: true };
  const expectedDdr = getRamTypeForBuild(cpu, motherboard);
  const isDdr4 = ram.ddr4 === true || (ram.speed && ram.speed < 4800);
  const ramType = isDdr4 ? 'DDR4' : 'DDR5';
  const ok = !expectedDdr || ramType === expectedDdr;
  return { ok, message: ok ? null : `Build expects ${expectedDdr}, selected RAM is ${ramType}` };
}

// ─── 4. RAM speed within CPU/MB max ───
export function checkRamSpeedCompatibility(ram, cpu, motherboard) {
  if (!ram || (!cpu && !motherboard)) return { ok: true };
  const maxSpeed = cpu?.ramMaxSpeed || motherboard?.ramMaxSpeed || 9999;
  return { ok: ram.speed <= maxSpeed, message: ram.speed > maxSpeed ? `RAM ${ram.speed}MHz exceeds max supported ${maxSpeed}MHz` : null };
}

// ─── 5. GPU length vs case ───
export function checkGpuLengthCompatibility(gpu, casePart) {
  if (!gpu || !casePart) return { ok: true };
  const maxLen = casePart.gpuMaxLength || 400;
  return { ok: gpu.length <= maxLen, message: gpu.length > maxLen ? `GPU length ${gpu.length}mm exceeds case max ${maxLen}mm` : null };
}

// ─── 6. Cooler height vs case ───
export function checkCoolerHeightCompatibility(cooler, casePart) {
  if (!cooler || !casePart) return { ok: true };
  const maxH = casePart.coolerMaxHeight || 180;
  const h = cooler.height || 0;
  if (cooler.type === 'aio') return { ok: true }; // AIO rad mounts elsewhere
  return { ok: h <= maxH, message: h > maxH ? `Cooler height ${h}mm exceeds case max ${maxH}mm` : null };
}

// ─── 7. PSU wattage (estimated total draw) ───
export function calculateBuildWattage(parts) {
  let total = 0;
  const partList = Array.isArray(parts) ? parts : [];
  for (const p of partList) {
    if (p.category === 'cpu') total += (p.tdp || 0) * 1.25;
    else if (p.category === 'gpu') total += p.watts || 0;
    else if (p.category === 'ram') total += (p.watts || 4) * (p.sticks || 2);
    else if (p.category === 'storage') total += p.watts || 5;
    else if (p.category === 'motherboard') total += 50;
    else if (p.category === 'cooler') total += 10;
    else if (p.category === 'case') total += 0;
    else if (p.category === 'psu') continue;
  }
  return Math.round(total);
}

// ─── 8. Recommended PSU wattage (total + 20% headroom) ───
export function getRecommendedPsuWattage(parts) {
  const draw = calculateBuildWattage(parts);
  return Math.min(1200, Math.max(450, Math.round(draw * 1.2 / 50) * 50));
}

// ─── 9. PSU sufficient check ───
export function checkPsuWattage(psu, parts) {
  if (!psu) return { ok: true, recommended: getRecommendedPsuWattage(parts) };
  const draw = calculateBuildWattage(parts);
  const recommended = getRecommendedPsuWattage(parts);
  const ok = psu.watts >= draw;
  const recommendedOk = psu.watts >= recommended;
  return {
    ok,
    recommendedOk,
    recommended,
    draw,
    message: !ok ? `PSU ${psu.watts}W is below estimated draw ${draw}W` : !recommendedOk ? `We recommend ${recommended}W+ for headroom` : null,
  };
}

// ─── 10. PSU SFX for SFF cases ───
export function checkPsuFormFactor(psu, casePart) {
  if (!psu || !casePart) return { ok: true };
  if (!casePart.sfxOnly) return { ok: true };
  return { ok: psu.sfx === true, message: psu.sfx ? null : 'This case requires an SFX PSU' };
}

// ─── 11. M.2 slot count ───
export function checkStorageSlots(storageParts, motherboard) {
  if (!motherboard || !storageParts?.length) return { ok: true };
  const m2Count = storageParts.filter((s) => s.formFactor === 'M.2').length;
  const m2Slots = motherboard.m2Slots || 2;
  return { ok: m2Count <= m2Slots, message: m2Count > m2Slots ? `Too many M.2 drives (${m2Count}) for board (${m2Slots} slots)` : null };
}

// ─── 12–15. Warnings (no storage, insufficient PSU, no cooler for high TDP, etc.) ───
export function getBuildWarnings(partsMap) {
  const w = [];
  const cpu = partsMap.cpu;
  const motherboard = partsMap.motherboard;
  const ram = partsMap.ram;
  const gpu = partsMap.gpu;
  const storage = partsMap.storage;
  const storageList = partsMap.storageList || [];
  const psu = partsMap.psu;
  const casePart = partsMap.case;
  const cooler = partsMap.cooler;

  if (!storage && !storageList?.length) w.push({ id: 'no_storage', text: 'Add at least one storage drive.', severity: 'error' });
  const draw = calculateBuildWattage(Object.values(partsMap).flat().filter(Boolean));
  if (psu && psu.watts < draw) w.push({ id: 'psu_insufficient', text: `PSU ${psu.watts}W may be below estimated load (~${draw}W).`, severity: 'error' });
  const rec = getRecommendedPsuWattage(Object.values(partsMap).flat().filter(Boolean));
  if (psu && psu.watts < rec && psu.watts >= draw) w.push({ id: 'psu_headroom', text: `We recommend ${rec}W PSU for headroom.`, severity: 'warning' });
  if (cpu && cpu.tdp > 65 && !cooler) w.push({ id: 'no_cooler', text: 'High TDP CPU — add a CPU cooler for best results.', severity: 'warning' });
  if (motherboard && storageList.length > (motherboard.m2Slots || 2)) w.push({ id: 'm2_slots', text: `Only ${motherboard.m2Slots} M.2 slots on motherboard.`, severity: 'warning' });
  return w;
}

// ─── 16–20. Full compatibility run ───
export function runCompatibilityChecks(partsMap) {
  const results = [];
  const cpu = partsMap.cpu;
  const mb = partsMap.motherboard;
  const ram = partsMap.ram;
  const gpu = partsMap.gpu;
  const psu = partsMap.psu;
  const casePart = partsMap.case;
  const cooler = partsMap.cooler;
  const storageList = [partsMap.storage].filter(Boolean);

  let c = checkSocketCompatibility(cpu, mb);
  if (!c.ok) results.push({ check: 'Socket', ok: false, message: c.message });
  c = checkFormFactorCompatibility(casePart, mb);
  if (!c.ok) results.push({ check: 'Form factor', ok: false, message: c.message });
  c = checkRamCompatibility(ram, cpu, mb);
  if (!c.ok) results.push({ check: 'RAM type', ok: false, message: c.message });
  c = checkRamSpeedCompatibility(ram, cpu, mb);
  if (!c.ok) results.push({ check: 'RAM speed', ok: false, message: c.message });
  c = checkGpuLengthCompatibility(gpu, casePart);
  if (!c.ok) results.push({ check: 'GPU length', ok: false, message: c.message });
  c = checkCoolerHeightCompatibility(cooler, casePart);
  if (!c.ok) results.push({ check: 'Cooler height', ok: false, message: c.message });
  c = checkPsuWattage(psu, Object.values(partsMap).flat().filter(Boolean));
  if (!c.ok) results.push({ check: 'PSU wattage', ok: false, message: c.message });
  else if (c.message) results.push({ check: 'PSU headroom', ok: true, message: c.message });
  c = checkPsuFormFactor(psu, casePart);
  if (!c.ok) results.push({ check: 'PSU form factor', ok: false, message: c.message });
  c = checkStorageSlots(storageList, mb);
  if (!c.ok) results.push({ check: 'M.2 slots', ok: false, message: c.message });

  return results;
}

// ─── 21. Estimated FPS (bottleneck = min of CPU and GPU FPS) ───
export function estimateFps(partsMap) {
  const cpu = partsMap.cpu;
  const gpu = partsMap.gpu;
  if (!cpu && !gpu) return { fps1080: 0, fps1440: 0, fps4k: 0 };
  const cpu1080 = cpu?.fps1080 ?? 0;
  const cpu1440 = cpu?.fps1440 ?? 0;
  const cpu4k = cpu?.fps4k ?? 0;
  const gpu1080 = gpu?.fps1080 ?? 0;
  const gpu1440 = gpu?.fps1440 ?? 0;
  const gpu4k = gpu?.fps4k ?? 0;
  return {
    fps1080: Math.min(cpu1080 || gpu1080, gpu1080 || cpu1080) || Math.max(cpu1080, gpu1080),
    fps1440: Math.min(cpu1440 || gpu1440, gpu1440 || cpu1440) || Math.max(cpu1440, gpu1440),
    fps4k: Math.min(cpu4k || gpu4k, gpu4k || cpu4k) || Math.max(cpu4k, gpu4k),
  };
}

// ─── 22. Performance score 0–100 ───
const TIER_SCORE = { budget: 25, mid: 50, high: 85 };
export function getPerformanceScore(partsMap) {
  const cpu = partsMap.cpu;
  const gpu = partsMap.gpu;
  const cpuScore = cpu ? (TIER_SCORE[cpu.tier] ?? 50) : 0;
  const gpuScore = gpu ? (TIER_SCORE[gpu.tier] ?? 50) : 0;
  if (!cpuScore && !gpuScore) return 0;
  return Math.round((cpuScore * 0.4 + gpuScore * 0.6));
}

// ─── 23. Use-case badges ───
export function getUseCaseBadges(partsMap) {
  const badges = [];
  const score = getPerformanceScore(partsMap);
  const fps = estimateFps(partsMap);
  if (fps.fps4k >= 80) badges.push('4K Gaming');
  else if (fps.fps1440 >= 100) badges.push('1440p Gaming');
  else if (fps.fps1080 >= 100) badges.push('1080p Gaming');
  if (partsMap.cpu?.cores >= 12) badges.push('Creator / Productivity');
  if (partsMap.case?.formFactor === 'itx') badges.push('SFF');
  if (score >= 70) badges.push('High Performance');
  if (score <= 40 && partsMap.cpu) badges.push('Value');
  return badges.length ? badges : ['Custom Build'];
}

// ─── 24. Filter compatible parts for a slot given current build ───
export function getCompatibleParts(categoryId, selectedPartsMap) {
  const all = getPartsByCategory(categoryId);
  const cpu = selectedPartsMap.cpu;
  const mb = selectedPartsMap.motherboard;
  const casePart = selectedPartsMap.case;
  const ramType = getRamTypeForBuild(cpu, mb);
  const recommendedW = getRecommendedPsuWattage(Object.values(selectedPartsMap).flat().filter(Boolean));

  return all.filter((p) => {
    if (categoryId === 'motherboard' && cpu) return p.socket === cpu.socket;
    if (categoryId === 'ram') {
      if (ramType === 'DDR5') return !p.ddr4;
      if (ramType === 'DDR4') return p.ddr4 === true;
    }
    if (categoryId === 'case' && mb) return FORM_ORDER[p.formFactor] >= FORM_ORDER[mb.formFactor];
    if (categoryId === 'cooler' && casePart && p.height) return p.height <= (casePart.coolerMaxHeight || 180);
    if (categoryId === 'psu' && casePart?.sfxOnly) return p.sfx === true;
    return true;
  });
}

// ─── 25. Build subtotal, GST, total ───
export function getBuildPricing(partsList, gstRate = 5, bundleDiscount = 0) {
  const subtotal = partsList.reduce((sum, p) => sum + (p.price || 0) * (p.qty || 1), 0);
  const afterDiscount = Math.max(0, subtotal - bundleDiscount);
  const gst = Math.round(afterDiscount * gstRate / 100);
  const total = afterDiscount + gst;
  return { subtotal, bundleDiscount, afterDiscount, gst, gstRate, total };
}

// ─── 26. Warranty summary ───
export function getWarrantySummary(partsList) {
  return partsList.map((p) => ({ name: p.name, warranty: p.warranty ? `${p.warranty} yr` : '—' }));
}

// ─── 27. Similar builds / recommended preset IDs ───
export function getSimilarBuildIds(partsMap) {
  const cpu = partsMap.cpu;
  const gpu = partsMap.gpu;
  if (cpu?.tier === 'budget' && gpu?.tier === 'mid') return ['BG005', 'BG001'];
  if (cpu?.tier === 'mid' && gpu?.tier === 'high') return ['BG002', 'BG003'];
  if (partsMap.case?.formFactor === 'itx') return ['BG004'];
  return ['BG001', 'BG002'];
}

// ─── 28. All parts in stock → estimated delivery ───
export function getEstimatedDelivery(partsList) {
  const outOfStock = partsList.some((p) => p.inStock === false);
  return outOfStock ? '7–10 days (some items on order)' : '5–7 business days';
}

// ─── 29. Export build as text (for PDF/email/print) ───
export function getBuildSummaryText(partsList, partsMap, pricing, fps, score, warnings) {
  const lines = ['TheValueStore — PC Build Summary', ''];

  partsList.forEach((p) => {
    lines.push(`${p.category}: ${p.name} — ₹${p.price}`);
  });
  lines.push('');
  lines.push(`Subtotal: ₹${pricing.subtotal}`);
  if (pricing.bundleDiscount) lines.push(`Bundle discount: -₹${pricing.bundleDiscount}`);
  lines.push(`GST (${pricing.gstRate}%): ₹${pricing.gst}`);
  lines.push(`Total: ₹${pricing.total}`);
  lines.push('');
  if (fps) lines.push(`Est. FPS — 1080p: ${fps.fps1080} | 1440p: ${fps.fps1440} | 4K: ${fps.fps4k}`);
  if (score != null) lines.push(`Performance score: ${score}/100`);
  if (warnings?.length) lines.push('Warnings: ' + warnings.map((w) => w.text).join('; '));
  return lines.join('\n');
}

// ─── 30. Share build: encode part IDs to short string ───
export function encodeBuildShare(partIds) {
  try {
    return btoa(JSON.stringify(partIds)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  } catch {
    return '';
  }
}

export function decodeBuildShare(encoded) {
  try {
    const str = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(str);
  } catch {
    return [];
  }
}
