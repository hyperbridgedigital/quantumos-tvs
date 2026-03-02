import { NextResponse } from 'next/server';
import { rateLimit, CSP_HEADERS } from '@/lib/security/middleware';

export async function GET(request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rl = rateLimit('ai:anomalies:' + ip, 30);
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limit' }, { status: 429 });
  return NextResponse.json({ anomalies: [], models: { anomaly: { status: 'active', accuracy: 94.2 }, fraud: { status: 'active', accuracy: 97.1 } } }, { headers: CSP_HEADERS });
}
