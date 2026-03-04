import { NextResponse } from 'next/server';
import { rateLimit, CSP_HEADERS } from '@/lib/security/middleware';
import { menuItems, withBudgetTiers } from '@/data/products';

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rl = rateLimit('ai:recs:' + ip, 60);
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '';
  const cartIds = searchParams.get('cartIds'); // comma-separated
  const limit = Math.min(20, parseInt(searchParams.get('limit') || '8', 10) || 8);
  const products = withBudgetTiers(menuItems);
  let recs = [];
  if (cartIds && cartIds.trim()) {
    const ids = cartIds.split(',').map((s) => s.trim()).filter(Boolean);
    const inCart = new Set(ids);
    const cartProducts = products.filter((p) => inCart.has(p.id));
    const cartCategories = new Set(cartProducts.map((p) => p.category).filter(Boolean));
    const cartMoods = new Set(cartProducts.flatMap((p) => p.moods || []));
    recs = products
      .filter((p) => !inCart.has(p.id))
      .sort((a, b) => {
        const scoreA = (cartCategories.has(a.category) ? 2 : 0) + (a.moods && a.moods.some((m) => cartMoods.has(m)) ? 1 : 0) + (a.tag ? 1 : 0);
        const scoreB = (cartCategories.has(b.category) ? 2 : 0) + (b.moods && b.moods.some((m) => cartMoods.has(m)) ? 1 : 0) + (b.tag ? 1 : 0);
        return scoreB - scoreA || (b.tag ? 1 : 0) - (a.tag ? 1 : 0);
      })
      .slice(0, limit);
  } else if (category) {
    recs = products.filter((p) => (p.category || '') === category).slice(0, limit);
  } else {
    recs = products.filter((p) => p.tag).slice(0, limit);
    if (recs.length < limit) recs = [...recs, ...products.filter((p) => !p.tag).slice(0, limit - recs.length)];
  }
  return NextResponse.json({ recommendations: recs }, { headers: CSP_HEADERS });
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rl = rateLimit('ai:recs:' + ip, 30);
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  const body = await request.json().catch(() => ({}));
  const cartIds = Array.isArray(body.cartIds) ? body.cartIds : (body.cartIds ? String(body.cartIds).split(',').map((s) => s.trim()).filter(Boolean) : []);
  const category = body.category || '';
  const limit = Math.min(20, parseInt(body.limit || '8', 10) || 8);
  const products = withBudgetTiers(menuItems);
  let recs = [];
  if (cartIds.length > 0) {
    const inCart = new Set(cartIds);
    const cartProducts = products.filter((p) => inCart.has(p.id));
    const cartCategories = new Set(cartProducts.map((p) => p.category).filter(Boolean));
    const cartMoods = new Set(cartProducts.flatMap((p) => p.moods || []));
    recs = products
      .filter((p) => !inCart.has(p.id))
      .sort((a, b) => {
        const scoreA = (cartCategories.has(a.category) ? 2 : 0) + (a.moods && a.moods.some((m) => cartMoods.has(m)) ? 1 : 0) + (a.tag ? 1 : 0);
        const scoreB = (cartCategories.has(b.category) ? 2 : 0) + (b.moods && b.moods.some((m) => cartMoods.has(m)) ? 1 : 0) + (b.tag ? 1 : 0);
        return scoreB - scoreA || (b.tag ? 1 : 0) - (a.tag ? 1 : 0);
      })
      .slice(0, limit);
  } else if (category) {
    recs = products.filter((p) => (p.category || '') === category).slice(0, limit);
  } else {
    recs = products.filter((p) => p.tag).slice(0, limit);
    if (recs.length < limit) recs = [...recs, ...products.filter((p) => !p.tag).slice(0, limit - recs.length)];
  }
  return NextResponse.json({ recommendations: recs, customer_id: body.customer_id }, { headers: CSP_HEADERS });
}
