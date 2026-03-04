/**
 * Kynetra — Deep integration for Sales, Service & Post-Sales
 * QuantumOS · Powered by TheReelFactory & HyperBridge
 */
import { menuItems } from '@/data/products';
import { offersConfig } from '@/data/offers';
import { brand } from '@/lib/brand';

const BRANDING = {
  platform: 'QuantumOS',
  poweredBy: 'TheReelFactory & HyperBridge',
  agentName: 'Kynetra',
};

/** Classify user message into sales | service | post_sales */
export function classifyIntent(message) {
  const lower = (message || '').toLowerCase().trim();
  if (!lower) return 'service';

  // Sales: shop, order, offers, franchise, buy, build pc, laptop, gaming
  const salesPatterns = /\b(menu|shop|order|gaming|laptop|build|pc|buy|offer|discount|coupon|deal|code|price|franchise|invest|business|what do you have|recommend)\b/;
  if (salesPatterns.test(lower)) return 'sales';

  // Post-sales: feedback, refund, complaint, wrong order, missing, reorder, rating, cancel
  const postSalesPatterns = /\b(feedback|refund|complaint|wrong order|missing item|reorder|rate|rating|cancel order|not happy|issue with order|delivery problem|damaged)\b/;
  if (postSalesPatterns.test(lower)) return 'post_sales';

  // Service: track, status, help, support, where, delivery, hi, hello
  return 'service';
}

/** Build reply for Sales intent */
function replySales(message) {
  const lower = (message || '').toLowerCase();
  const activeOffers = offersConfig.filter(o => o.active);
  const topProducts = menuItems.slice(0, 8).map(p => `${p.name} — ₹${p.price}`).join('\n');

  if (/\b(offer|discount|coupon|deal|code)\b/.test(lower)) {
    const offerLines = activeOffers.slice(0, 5).map(o => `✅ ${o.code} — ${o.name}${o.minOrder ? ` (min ₹${o.minOrder})` : ''}`).join('\n');
    return `🎁 *Active offers*\n\n${offerLines}\n\nUse any code at checkout. — *${BRANDING.agentName}* · ${BRANDING.poweredBy}`;
  }
  if (/\b(franchise|invest|business|own)\b/.test(lower)) {
    return `🏢 *Partner — ${brand.name}*\n\n✅ Full setup & training\n✅ QuantumOS tech (POS, delivery, WhatsApp)\n✅ 18–24 month ROI · ₹15L–35L\n\nShare Name, Phone & City — our team will call in 24h.\n\n*${BRANDING.agentName}* · Powered by ${BRANDING.poweredBy}`;
  }
  return `🛒 *Shop — ${brand.name}*\n\n${topProducts}\n\nBrowse the Shop tab to add to cart. Use code *WELCOME20* for 20% off first order!\n\n*${BRANDING.agentName}* · ${BRANDING.poweredBy}`;
}

/** Build reply for Service intent */
function replyService(message) {
  const lower = (message || '').toLowerCase();
  if (/\b(track|status|where|delivery|order id)\b/.test(lower)) {
    return `📦 *Track your order*\n\nShare your Order ID (e.g. ORD-7X2K) and I’ll look it up. You can also check the *Orders* tab after signing in.\n\n*${BRANDING.agentName}* · ${BRANDING.poweredBy}`;
  }
  if (/\b(help|support|hi|hello|hey)\b/.test(lower)) {
    return `👋 I’m *${BRANDING.agentName}*, your assistant on *${BRANDING.platform}*.\n\nI can help with:\n🛒 *Shop* — PCs, laptops, Build PC, offers, franchise\n📦 *Service* — Track order, support\n🔄 *Post-sales* — Feedback, refunds, reorder\n\nType or tap a quick reply below. — Powered by ${BRANDING.poweredBy}`;
  }
  return `I can help with:\n🛒 Shop & offers\n📦 Order tracking\n🔄 Feedback & refunds\n\nWhat do you need? — *${BRANDING.agentName}* · ${BRANDING.poweredBy}`;
}

/** Build reply for Post-Sales intent */
function replyPostSales(message) {
  const lower = (message || '').toLowerCase();
  if (/\b(refund|cancel|money back)\b/.test(lower)) {
    return `🔄 *Refunds*\n\nWe’re sorry if something wasn’t right. Share your Order ID and issue — our team will process refunds per policy (usually within 5–7 days).\n\nCall +91 98765 43210 or reply with your Order ID.\n\n*${BRANDING.agentName}* · ${BRANDING.poweredBy}`;
  }
  if (/\b(complaint|wrong order|missing|damaged|issue)\b/.test(lower)) {
    return `📞 *We’re here to fix it*\n\nPlease share:\n1. Order ID\n2. What went wrong\n\nWe’ll make it right — replacement or refund. Reply here or call +91 98765 43210.\n\n*${BRANDING.agentName}* · ${BRANDING.poweredBy}`;
  }
  if (/\b(reorder|order again|same order)\b/.test(lower)) {
    return `🔄 *Reorder*\n\nHead to the *Shop* tab to place the same (or a new) order. Your last order history is in *Orders* after you sign in.\n\n*${BRANDING.agentName}* · ${BRANDING.poweredBy}`;
  }
  if (/\b(feedback|rate|rating)\b/.test(lower)) {
    return `⭐ *Feedback*\n\nWe’d love to hear from you! Share your experience or rate us. Your feedback helps us improve.\n\nReply with your thoughts or call +91 98765 43210.\n\n*${BRANDING.agentName}* · ${BRANDING.poweredBy}`;
  }
  return `🔄 *Post-sales support*\n\nI can help with refunds, complaints, reorders or feedback. Share your Order ID and what you need.\n\n*${BRANDING.agentName}* · Powered by ${BRANDING.poweredBy}`;
}

/**
 * Kynetra response for a user message.
 * Returns { reply, intent } with QuantumOS & TheReelFactory & HyperBridge branding in content.
 */
export function getKynetraResponse(message) {
  const intent = classifyIntent(message);
  let reply;
  if (intent === 'sales') reply = replySales(message);
  else if (intent === 'post_sales') reply = replyPostSales(message);
  else reply = replyService(message);
  return { reply, intent };
}

export { BRANDING };
