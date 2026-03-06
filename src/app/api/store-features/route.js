import { NextResponse } from 'next/server';
import { list, create } from '@/data/storeFeaturesDb';

const TYPES = ['wishlist', 'priceAlerts', 'preorders', 'tradeins', 'buildGuides', 'warranties', 'expertBookings', 'loyaltyPoints', 'stockByStore', 'comparisons', 'savedBuilds'];

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    if (!type || !TYPES.includes(type)) {
      return NextResponse.json({ error: 'Missing or invalid type. Use ?type=wishlist|priceAlerts|preorders|tradeins|buildGuides|warranties|expertBookings|loyaltyPoints|stockByStore|comparisons|savedBuilds' }, { status: 400 });
    }
    const data = list(type);
    return NextResponse.json({ [type]: data });
  } catch (e) {
    console.error('GET /api/store-features:', e);
    return NextResponse.json({ error: 'Failed to list' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, ...payload } = body;
    if (!type || !TYPES.includes(type)) {
      return NextResponse.json({ error: 'Missing or invalid type in body' }, { status: 400 });
    }
    const item = create(type, payload);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error('POST /api/store-features:', e);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
