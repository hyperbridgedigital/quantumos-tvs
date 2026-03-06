import { NextResponse } from 'next/server';
import { menuItems } from '@/data/products';
import { list } from '@/data/storeFeaturesDb';
import { getPartById } from '@/data/pcParts';
import {
  runCompatibilityChecks,
  calculateBuildWattage,
  getRecommendedPsuWattage,
  getBuildWarnings,
  estimateFps,
  getPerformanceScore,
  getUseCaseBadges,
  getBuildPricing,
  getWarrantySummary,
  getEstimatedDelivery,
  getSimilarBuildIds,
} from '@/lib/pcBuilderUtils';

export const dynamic = 'force-dynamic';

const productMap = new Map(menuItems.map((p) => [p.id, p]));

function buildPartsMapFromPartIds(partIds) {
  const map = {};
  const list = [];
  if (Array.isArray(partIds)) {
    partIds.forEach((id) => {
      const p = getPartById(id);
      if (p) {
        map[p.category] = p;
        list.push({ ...p, qty: 1 });
      }
    });
  } else if (partIds && typeof partIds === 'object') {
    Object.entries(partIds).forEach(([cat, id]) => {
      const p = getPartById(id);
      if (p) {
        map[p.category] = p;
        list.push({ ...p, qty: 1 });
      }
    });
  }
  map.storageList = list.filter((p) => p.category === 'storage');
  return { map, list };
}

/**
 * POST /api/buildpc
 * Body (legacy): { parts: [{ productId, qty }] } → menuItems total
 * Body (PC Builder): { partIds: { cpu: 'cpu_1', ... } | string[] } → full summary
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const gstRate = Number(body.gstRate) || 5;
    const bundleDiscount = Number(body.bundleDiscount) || 0;

    if (body.partIds !== undefined) {
      const { map: partsMap, list: partsList } = buildPartsMapFromPartIds(body.partIds);
      const compatibility = runCompatibilityChecks(partsMap);
      const draw = calculateBuildWattage(partsList);
      const recommendedPsu = getRecommendedPsuWattage(partsList);
      const warnings = getBuildWarnings({ ...partsMap, storageList: partsMap.storageList });
      const fps = estimateFps(partsMap);
      const performanceScore = getPerformanceScore(partsMap);
      const badges = getUseCaseBadges(partsMap);
      const pricing = getBuildPricing(partsList, gstRate, bundleDiscount);
      const warrantySummary = getWarrantySummary(partsList);
      const estimatedDelivery = getEstimatedDelivery(partsList);
      const similarBuildIds = getSimilarBuildIds(partsMap);

      return NextResponse.json({
        total: pricing.total,
        subtotal: pricing.subtotal,
        gst: pricing.gst,
        gstRate: pricing.gstRate,
        bundleDiscount: pricing.bundleDiscount,
        afterDiscount: pricing.afterDiscount,
        items: partsList.map((p) => ({ partId: p.id, name: p.name, price: p.price, category: p.category, qty: 1 })),
        valid: partsList.length > 0,
        compatibility,
        wattage: { estimatedDraw: draw, recommendedPsuWattage: recommendedPsu },
        fpsEstimate: fps,
        performanceScore,
        useCaseBadges: badges,
        warnings,
        warrantySummary,
        estimatedDelivery,
        similarBuildIds,
      });
    }

    const parts = Array.isArray(body.parts) ? body.parts : [];
    const items = [];
    let total = 0;
    const warnings = [];
    for (const { productId, qty = 1 } of parts) {
      const p = productMap.get(productId);
      if (!p) {
        warnings.push(`Unknown product: ${productId}`);
        continue;
      }
      const q = Math.max(1, parseInt(qty, 10) || 1);
      items.push({ productId: p.id, name: p.name, price: p.price, qty: q, category: p.category });
      total += p.price * q;
    }
    const gst = Math.round(total * gstRate / 100);
    return NextResponse.json({
      total: total + gst,
      subtotal: total,
      gst,
      gstRate,
      items,
      valid: items.length > 0,
      warnings: warnings.length ? warnings : undefined,
    });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

/**
 * GET /api/buildpc
 * Returns presets (build guides) for Build PC configurator.
 */
export async function GET() {
  try {
    const buildGuides = list('buildGuides') || [];
    return NextResponse.json({ presets: buildGuides });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load presets' }, { status: 500 });
  }
}
