import { NextResponse } from 'next/server';
import { rateLimit, sanitizeObject, CSP_HEADERS } from '@/lib/security/middleware';
import { getAllOrders, addOrder as addOrderToStore } from '@/data/ordersStore';

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rl = rateLimit('orders:get:' + ip, 60);
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rl.resetAt), ...CSP_HEADERS } });

  const orders = getAllOrders();
  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const start = (page - 1) * limit;
  const slice = orders.slice(start, start + limit);
  return NextResponse.json(
    { orders: slice, meta: { total: orders.length, page, limit } },
    { headers: { 'X-RateLimit-Remaining': String(rl.remaining), ...CSP_HEADERS } }
  );
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rl = rateLimit('orders:post:' + ip, 20);
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  try {
    const body = await request.json();
    const sanitized = sanitizeObject(body);
    if (!sanitized.customer || !sanitized.items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const total = typeof sanitized.total === 'number' ? sanitized.total : (sanitized.total && !isNaN(Number(sanitized.total)) ? Number(sanitized.total) : sanitized.items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.qty) || 1), 0));
    const order = addOrderToStore({
      customer: sanitized.customer,
      phone: sanitized.phone || '',
      store: sanitized.store || 'ST001',
      items: sanitized.items,
      total,
      subtotal: sanitized.subtotal ?? total,
      gst: sanitized.gst ?? 0,
      deliveryFee: sanitized.deliveryFee ?? 0,
      type: sanitized.type || 'delivery',
      address: sanitized.address || '',
      partner: sanitized.partner ?? null,
      eta: sanitized.eta ?? 40,
    });
    return NextResponse.json({ success: true, order }, { status: 201, headers: CSP_HEADERS });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
