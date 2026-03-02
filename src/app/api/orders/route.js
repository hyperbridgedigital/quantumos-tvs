import { NextResponse } from 'next/server';
import { rateLimit, sanitizeObject, CSP_HEADERS } from '@/lib/security/middleware';

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rl = rateLimit('orders:get:' + ip, 60);
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rl.resetAt), ...CSP_HEADERS } });

  return NextResponse.json({ orders: [], meta: { total: 0, page: 1, limit: 20 } }, { headers: { 'X-RateLimit-Remaining': String(rl.remaining), ...CSP_HEADERS } });
}

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rl = rateLimit('orders:post:' + ip, 20);
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  try {
    const body = await request.json();
    const sanitized = sanitizeObject(body);
    // Validate required fields
    if (!sanitized.customer || !sanitized.items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    return NextResponse.json({ success: true, order: { id: 'ORD-' + Date.now(), ...sanitized, status: 'confirmed', placed_at: new Date().toISOString() } }, { status: 201, headers: CSP_HEADERS });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
