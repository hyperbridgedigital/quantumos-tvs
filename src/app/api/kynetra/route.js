import { NextResponse } from 'next/server';
import { getKynetraResponse, BRANDING } from '@/lib/kynetra';

const PLATFORM = 'QuantumOS';
const POWERED_BY = 'TheReelFactory & HyperBridge';

/**
 * POST /api/kynetra
 * Kynetra Agent — Sales, Service & Post-Sales
 * Body: { message: string }
 * Returns: { reply, intent, branding }
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    const { reply, intent } = getKynetraResponse(message || 'help');

    return NextResponse.json({
      reply,
      intent,
      branding: {
        agent: BRANDING.agentName,
        platform: PLATFORM,
        poweredBy: POWERED_BY,
      },
    }, {
      headers: {
        'X-Kynetra-Agent': BRANDING.agentName,
        'X-Platform': PLATFORM,
        'X-Powered-By': POWERED_BY,
      },
    });
  } catch (e) {
    console.error('Kynetra API:', e);
    return NextResponse.json(
      {
        reply: "Sorry, I couldn't process that. Please try again or call +91 98765 43210. — Kynetra · Powered by TheReelFactory & HyperBridge",
        intent: 'service',
        branding: { agent: BRANDING.agentName, platform: PLATFORM, poweredBy: POWERED_BY },
      },
      { status: 200 }
    );
  }
}

/** GET — agent info for frontend */
export async function GET() {
  return NextResponse.json({
    agent: BRANDING.agentName,
    platform: PLATFORM,
    poweredBy: POWERED_BY,
    intents: ['sales', 'service', 'post_sales'],
  }, {
    headers: {
      'X-Kynetra-Agent': BRANDING.agentName,
      'X-Platform': PLATFORM,
      'X-Powered-By': POWERED_BY,
    },
  });
}
