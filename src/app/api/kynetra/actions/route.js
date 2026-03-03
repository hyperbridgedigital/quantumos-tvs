import { NextResponse } from 'next/server';
import { resolveAction, getActionHandler } from '@/lib/kynetra/actions';

export async function POST(request) {
  try {
    const { action } = await request.json();

    if (!action?.handler && !action?.id) {
      return NextResponse.json({ error: 'Action handler or id is required' }, { status: 400 });
    }

    const actionId = action.handler || action.id;
    const resolved = resolveAction(actionId);
    const handler = getActionHandler(actionId);
    const result = handler();

    return NextResponse.json({
      success: true,
      action: actionId,
      group: resolved?.group || 'general',
      result,
      executed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Kynetra Actions]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute action' },
      { status: 500 }
    );
  }
}
