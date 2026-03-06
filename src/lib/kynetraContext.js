/**
 * Kynetra — Context-aware layer: order lookup, template matching, HyperLocal (50 features), actions.
 * Used by POST /api/kynetra with body: { message, orderId?, cartIds?, storeId?, customerId? }
 */
import { getKynetraResponse } from '@/lib/kynetra';
import { matchTemplate, resolveAction, defaultKynetraTemplates } from '@/data/kynetraTemplates';
import { matchHyperLocal } from '@/lib/kynetraHyperLocal';
import { getOrderById } from '@/data/ordersStore';
import { BRANDING } from '@/lib/kynetra';

const ORDER_ID_REGEX = /ORD-[\w-]+/gi;

/**
 * Extract order IDs from message (e.g. "track ORD-2700" or "status of ORD-1234").
 */
export function extractOrderIds(message) {
  if (!message || typeof message !== 'string') return [];
  const matches = message.match(ORDER_ID_REGEX);
  return matches ? [...new Set(matches.map((m) => m.toUpperCase()))] : [];
}

/**
 * Build Kynetra reply with order status when message contains order ID.
 * Priority: 1) HyperLocal match, 2) Template match, 3) Base intent reply.
 */
export function getKynetraResponseWithContext(message, context = {}, templates = defaultKynetraTemplates) {
  const { orderId: contextOrderId, orderIdsFromMessage = true } = context;
  const orderIds = orderIdsFromMessage !== false ? extractOrderIds(message) : [];
  const lookupId = contextOrderId || orderIds[0];
  let order = null;
  if (lookupId) {
    try {
      order = getOrderById(lookupId);
    } catch (_) {}
  }

  let orderBlock = '';
  if (order) {
    orderBlock = `📦 *Order ${order.id}*\nStatus: *${order.status}*\nTotal: ₹${Number(order.total || 0).toLocaleString('en-IN')}\nPlaced: ${order.placed || '-'}\n\n`;
  } else if (lookupId) {
    orderBlock = `📦 No order found for *${lookupId}*. Please check the ID or sign in to see your orders.\n\n`;
  }

  // 1) HyperLocal (50 features) — pincode, nearest store, delivery, etc.
  const hyperLocal = matchHyperLocal(message);
  if (hyperLocal?.reply) {
    return {
      reply: orderBlock ? orderBlock + hyperLocal.reply : hyperLocal.reply,
      intent: 'service',
      action: hyperLocal.action || null,
      suggestedReplies: hyperLocal.suggestedReplies || [],
      order: order ? { id: order.id, status: order.status, total: order.total } : null,
      branding: { agent: BRANDING.agentName, platform: BRANDING.platform, poweredBy: BRANDING.poweredBy },
    };
  }

  const template = matchTemplate(message, templates);
  const action = template ? resolveAction(template) : null;
  const suggestedReplies = template?.suggestedReplies || [];

  const { reply: baseReply, intent } = getKynetraResponse(message || 'help');
  const reply = orderBlock ? orderBlock + baseReply : baseReply;

  return {
    reply,
    intent,
    action,
    suggestedReplies,
    order: order ? { id: order.id, status: order.status, total: order.total } : null,
    branding: { agent: BRANDING.agentName, platform: BRANDING.platform, poweredBy: BRANDING.poweredBy },
  };
}

export { BRANDING };
