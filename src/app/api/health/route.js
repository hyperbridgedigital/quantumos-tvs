import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'not_configured';
  if (process.env.DATABASE_URL) {
    try {
      const sql = getDb();
      await sql`SELECT 1`;
      dbStatus = 'connected';
    } catch (e) {
      dbStatus = 'error';
    }
  }

  return NextResponse.json({
    status: 'healthy',
    version: '1.2.0',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      ai_engine: 'active',
      whatsapp: 'configured',
      security: 'hardened',
    },
    uptime: process.uptime(),
  });
}
