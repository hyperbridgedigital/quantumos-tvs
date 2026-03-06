import { NextResponse } from 'next/server';
import { BRANDING } from '@/lib/kynetra';
import { getKynetraResponseWithContext } from '@/lib/kynetraContext';
import { getKynetraTemplates } from '@/data/kynetraTemplatesStore';

const PLATFORM = 'QuantumOS';
const POWERED_BY = 'TheReelFactory & HyperBridge';

/**
 * POST /api/kynetra
 * Body: { message: string, orderId?: string, cartIds?: string[], storeId?: string, customerId?: string }
 * Returns: { reply, intent, action?, suggestedReplies?, order?, branding }
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const context = {
      orderId: body.orderId || null,
      cartIds: Array.isArray(body.cartIds) ? body.cartIds : [],
      storeId: body.storeId || null,
      customerId: body.customerId || null,
    };

    const result = getKynetraResponseWithContext(message || 'help', context, getKynetraTemplates());

    return NextResponse.json(
      {
        reply: result.reply,
        intent: result.intent,
        action: result.action ?? null,
        suggestedReplies: result.suggestedReplies ?? [],
        order: result.order ?? null,
        branding: result.branding || { agent: BRANDING.agentName, platform: PLATFORM, poweredBy: POWERED_BY },
      },
      {
        headers: {
          'X-Kynetra-Agent': BRANDING.agentName,
          'X-Platform': PLATFORM,
          'X-Powered-By': POWERED_BY,
        },
      }
    );
  } catch (e) {
    console.error('Kynetra API:', e);
    return NextResponse.json(
      {
        reply: "Sorry, I couldn't process that. Please try again or call +91 98765 43210. — Kynetra · Powered by TheReelFactory & HyperBridge",
        intent: 'service',
        action: null,
        suggestedReplies: ['Show menu', 'Track order', 'Contact support'],
        branding: { agent: BRANDING.agentName, platform: PLATFORM, poweredBy: POWERED_BY },
      },
      { status: 200 }
    );
  }
}

/** GET — agent info for frontend (includes build presets for PC building in Kynetra) */
export async function GET() {
  const { list } = await import('@/data/storeFeaturesDb');
  const buildGuides = list('buildGuides') || [];
  return NextResponse.json({
    agent: BRANDING.agentName,
    platform: PLATFORM,
    poweredBy: POWERED_BY,
    intents: ['sales', 'service', 'post_sales', 'hyperlocal'],
    supportsActions: true,
    actionTypes: ['navigate', 'show_offers', 'show_menu', 'open_buildpc', 'open_franchise', 'open_cart', 'track_order', 'search', 'add_to_cart', 'contact_support'],
    buildPresets: buildGuides.length,
    buildPresetIds: buildGuides.map((p) => p.id),
  }, {
    headers: {
      'X-Kynetra-Agent': BRANDING.agentName,
      'X-Platform': PLATFORM,
      'X-Powered-By': POWERED_BY,
    },
  });
}
