import { NextResponse } from 'next/server';
import { menuItems, BUDGET_TIERS, withBudgetTiers } from '@/data/products';
import { catalogProducts, catalogCategories } from '@/data/catalog';
import { moods } from '@/data/moods';

/** Force dynamic so request.url is allowed */
export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Query: category, mood, budgetTier, budgetMin, budgetMax, q, useCatalog (1 = 600 demo products)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const mood = searchParams.get('mood') || '';
    const budgetTier = searchParams.get('budgetTier') || '';
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const budgetMin = searchParams.has('budgetMin') ? Number(searchParams.get('budgetMin')) : null;
    const budgetMax = searchParams.has('budgetMax') ? Number(searchParams.get('budgetMax')) : null;
    const useCatalog = searchParams.get('useCatalog') === '1' || searchParams.get('useCatalog') === 'true';

    let list = useCatalog
      ? catalogProducts.map((p) => ({ ...p, budgetTier: BUDGET_TIERS.find((t) => p.price >= t.min && p.price <= t.max)?.id || '60k_plus' }))
      : withBudgetTiers(menuItems);

    if (q) {
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q) ||
          (p.tag || '').toLowerCase().includes(q) ||
          (p.brand || '').toLowerCase().includes(q) ||
          (p.moods || []).some((m) => m.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'all') {
      const c = category.toLowerCase();
      list = list.filter((p) => {
        const pCat = (p.category || '').toLowerCase();
        return pCat === c || pCat === c.replace(/s$/, '') || pCat.replace(/s$/, '') === c.replace(/s$/, '');
      });
    }
    if (mood) {
      list = list.filter((p) => (p.moods || []).includes(mood));
    }
    if (budgetTier) {
      const tier = BUDGET_TIERS.find((t) => t.id === budgetTier);
      if (tier) {
        list = list.filter((p) => p.price >= tier.min && p.price <= tier.max);
      }
    }
    if (budgetMin != null && !Number.isNaN(budgetMin)) {
      list = list.filter((p) => p.price >= budgetMin);
    }
    if (budgetMax != null && !Number.isNaN(budgetMax)) {
      list = list.filter((p) => p.price <= budgetMax);
    }

    return NextResponse.json({
      products: list,
      moods,
      budgetRanges: BUDGET_TIERS,
      categories: useCatalog ? catalogCategories : undefined,
    });
  } catch (e) {
    console.error('GET /api/products:', e);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
