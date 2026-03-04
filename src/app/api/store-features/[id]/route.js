import { NextResponse } from 'next/server';
import { getById, update, remove } from '@/data/storeFeaturesDb';

const TYPES = ['wishlist', 'priceAlerts', 'preorders', 'tradeins', 'buildGuides', 'warranties', 'expertBookings', 'loyaltyPoints', 'stockByStore', 'comparisons'];

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    if (!type || !TYPES.includes(type)) {
      return NextResponse.json({ error: 'Missing or invalid type' }, { status: 400 });
    }
    const item = getById(type, id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (e) {
    console.error('GET /api/store-features/[id]:', e);
    return NextResponse.json({ error: 'Failed to get' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, ...payload } = body;
    if (!type || !TYPES.includes(type)) {
      return NextResponse.json({ error: 'Missing or invalid type in body' }, { status: 400 });
    }
    const item = update(type, id, payload);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    console.error('PUT /api/store-features/[id]:', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    if (!type || !TYPES.includes(type)) {
      return NextResponse.json({ error: 'Missing or invalid type' }, { status: 400 });
    }
    const done = remove(type, id);
    if (!done) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/store-features/[id]:', e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
