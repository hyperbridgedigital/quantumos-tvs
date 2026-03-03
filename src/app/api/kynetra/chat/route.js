import { NextResponse } from 'next/server';
import { kynetraQuery } from '@/lib/kynetra/client';

export async function POST(request) {
  try {
    const { message, context = {} } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const result = await kynetraQuery(message, {
      ...context,
      domain: 'restaurant',
      businessName: 'Charminar Mehfil',
      capabilities: ['menu_crud', 'order_mgmt', 'analytics', 'inventory'],
    });

    return NextResponse.json({
      message: result.message,
      suggestedActions: result.suggestedActions || [],
      insights: result.insights || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Kynetra Chat]', error);
    return NextResponse.json(
      { error: 'Failed to process message', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
