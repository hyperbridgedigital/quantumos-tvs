import { NextResponse } from 'next/server';
import { rateLimit, CSP_HEADERS } from '@/lib/security/middleware';

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rl = rateLimit('ai:recs:' + ip, 30);
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  const body = await request.json();
  return NextResponse.json({ recommendations: [], customer_id: body.customer_id }, { headers: CSP_HEADERS });
}
