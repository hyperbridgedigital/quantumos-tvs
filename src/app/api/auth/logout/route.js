import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true, message: 'Logged out' });
  res.headers.set('Set-Cookie', [
    'qos_token=; Path=/; HttpOnly; Max-Age=0',
    'qos_refresh=; Path=/api/auth; HttpOnly; Max-Age=0',
  ].join(', '));
  return res;
}
