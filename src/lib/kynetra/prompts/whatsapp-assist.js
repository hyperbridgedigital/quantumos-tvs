/**
 * Kynetra System Prompts — WhatsApp Assistance
 */

export const WHATSAPP_ASSIST_PROMPT = `You are Kynetra WhatsApp Assistant for Charminar Mehfil.

ROLE: Generate customer-facing WhatsApp message suggestions for the admin team.

CAPABILITIES:
- Auto-draft replies to customer queries
- ETA updates with friendly tone
- Upsell suggestions based on order history
- Complaint resolution templates
- Promotional message drafts

TONE:
- Friendly, warm, and respectful
- Use appropriate Hyderabadi hospitality phrases
- Include relevant emojis sparingly
- Keep messages concise (WhatsApp-friendly length)

RULES:
1. Never send messages automatically — always suggest for admin approval
2. Include personalization tokens: {customer_name}, {order_id}, {eta}
3. Provide 2-3 alternative responses ranked by tone (formal, friendly, casual)
4. Flag sensitive situations for human review`;

export const WHATSAPP_TEMPLATES = {
  order_confirmation: {
    name: 'Order Confirmed',
    template: 'Assalamu Alaikum {customer_name}! 🎉 Your order #{order_id} is confirmed. Estimated delivery: {eta}. Track live: {tracking_link}',
  },
  eta_update: {
    name: 'ETA Update',
    template: 'Hi {customer_name}, quick update on your order #{order_id} — your food is being prepared with love! New ETA: {eta}. Thank you for your patience 🙏',
  },
  delivery_complete: {
    name: 'Delivered',
    template: 'Your order has been delivered! 🎊 We hope you enjoy your meal, {customer_name}. Rate us: {feedback_link}',
  },
  promo_blast: {
    name: 'Promotion',
    template: '🌟 Special offer for you, {customer_name}! {promo_text}. Order now: {order_link}. Valid till {expiry}.',
  },
  complaint_ack: {
    name: 'Complaint Acknowledgment',
    template: "We're sorry to hear about your experience, {customer_name}. Your feedback on order #{order_id} is noted. Our team is looking into this right away. We'll make it right! 🙏",
  },
};

export function generateWhatsAppSuggestions(customerMessage, context = {}) {
  const lower = customerMessage.toLowerCase();
  const suggestions = [];

  if (lower.includes('where') || lower.includes('status') || lower.includes('track')) {
    suggestions.push({
      tone: 'friendly',
      message: `Hi ${context.customerName || 'there'}! Your order is on its way 🛵 Current status: ${context.orderStatus || 'Being prepared'}. ETA: ${context.eta || '25-30 mins'}. You can track it live here: ${context.trackingLink || '[tracking link]'}`,
    });
    suggestions.push({
      tone: 'formal',
      message: `Dear ${context.customerName || 'Customer'}, your order #${context.orderId || '---'} is currently ${context.orderStatus || 'in progress'}. Expected delivery time: ${context.eta || '25-30 minutes'}. Thank you for your patience.`,
    });
  }

  if (lower.includes('late') || lower.includes('delay') || lower.includes('waiting')) {
    suggestions.push({
      tone: 'empathetic',
      message: `We sincerely apologize for the delay, ${context.customerName || 'dear customer'}. Your order is our priority. Updated ETA: ${context.eta || '10 mins'}. As a token of apology, we'd like to offer you a 10% discount on your next order. 🙏`,
    });
  }

  if (lower.includes('cancel')) {
    suggestions.push({
      tone: 'retention',
      message: `We're sorry you want to cancel, ${context.customerName || 'dear customer'}. Before we process this, can we help resolve any concerns? We value your patronage at Charminar Mehfil. If you'd still like to cancel, we'll process a full refund immediately.`,
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      tone: 'friendly',
      message: `Thank you for reaching out to Charminar Mehfil! 🍽️ How can we help you today, ${context.customerName || 'dear customer'}?`,
    });
  }

  return suggestions;
}
