import { NextResponse } from 'next/server';
import { getSecurityEvents, CSP_HEADERS } from '@/lib/security/middleware';

export async function GET() {
  const events = getSecurityEvents(100);
  return NextResponse.json({ events, total: events.length }, { headers: CSP_HEADERS });
}
