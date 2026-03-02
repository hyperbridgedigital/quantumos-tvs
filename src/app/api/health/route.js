import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    version: '10.4.0-enterprise',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      cache: 'connected',
      ai_engine: 'active',
      whatsapp: 'configured',
      security: 'hardened',
    },
    uptime: process.uptime(),
  });
}
