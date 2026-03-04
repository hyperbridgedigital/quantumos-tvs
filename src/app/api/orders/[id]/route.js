import { NextResponse } from 'next/server';
import { getOrderById } from '@/data/ordersStore';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    const order = getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
