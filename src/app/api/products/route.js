import { NextResponse } from 'next/server';
import { menuItems, BUDGET_TIERS, withBudgetTiers } from '@/data/products';
import { moods } from '@/data/moods';

/** Force dynamic so request.url is allowed */
export const dynamic = 'force-dynamic';

/**
 * GET /api/products
 * Query params: category, mood, budgetTier, budgetMin, budgetMax
 * Returns products + moods + budgetRanges so frontend stays in sync with backend.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const mood = searchParams.get('mood') || '';
    const budgetTier = searchParams.get('budgetTier') || '';
    const budgetMin = searchParams.has('budgetMin') ? Number(searchParams.get('budgetMin')) : null;
    const budgetMax = searchParams.has('budgetMax') ? Number(searchParams.get('budgetMax')) : null;

    let list = withBudgetTiers(menuItems);

    if (category && category !== 'all') {
      list = list.filter((p) => (p.category || 'Main') === category);
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
    });
  } catch (e) {
    console.error('GET /api/products:', e);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
