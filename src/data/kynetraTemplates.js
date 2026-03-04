/**
 * Kynetra action templates — 50 templates.
 * Each: trigger keywords → reply + action (navigate, show_offers, add_to_cart, etc.).
 * Admin can edit; frontend matches user message and runs action.
 */

export const ACTION_TYPES = [
  { id: 'none', label: 'None', description: 'Reply only' },
  { id: 'navigate', label: 'Navigate', description: 'Switch store tab (home, menu, buildpc, offers, track, franchise)' },
  { id: 'open_buildpc', label: 'Open Build PC', description: 'Open configurator' },
  { id: 'show_offers', label: 'Show Offers', description: 'Go to offers tab' },
  { id: 'show_menu', label: 'Show Menu', description: 'Go to shop/menu' },
  { id: 'open_franchise', label: 'Open Franchise', description: 'Go to franchise tab' },
  { id: 'open_cart', label: 'Open Cart', description: 'Focus cart / menu' },
  { id: 'open_home', label: 'Open Home', description: 'Go to homepage' },
  { id: 'track_order', label: 'Track Order', description: 'Go to orders tab' },
  { id: 'search', label: 'Search', description: 'Go to menu with search' },
  { id: 'add_to_cart', label: 'Add to Cart', description: 'Add product (needs productId in payload)' },
  { id: 'contact_support', label: 'Contact Support', description: 'Show phone / WhatsApp' },
];

export const KYNETRA_MODULES = [
  { id: 'sales', label: 'Sales' },
  { id: 'pre_sales', label: 'Pre-sales' },
  { id: 'post_sales', label: 'Post-sales' },
  { id: 'build_pc', label: 'Build PC' },
  { id: 'csr', label: 'CSR' },
];

/** 50 templates: name, module, triggerKeywords, replyText, action, actionPayload, suggestedReplies */
export const defaultKynetraTemplates = [
  { id: 't01', name: 'Show menu / products', module: 'sales', triggerKeywords: ['menu', 'products', 'shop', 'catalog', 'what do you have', 'show me'], replyText: "Here’s our shop. Opening the Menu so you can browse and add to cart.", action: 'show_menu', actionPayload: { tab: 'menu' }, suggestedReplies: ['Show offers', 'Build a PC'], active: true, order: 1 },
  { id: 't02', name: 'Offers & deals', module: 'sales', triggerKeywords: ['offer', 'deals', 'discount', 'coupon', 'promo', 'code'], replyText: "Opening Offers for you. You’ll find active coupons and deals there.", action: 'show_offers', actionPayload: { tab: 'offers' }, suggestedReplies: ['Apply coupon', 'Show menu'], active: true, order: 2 },
  { id: 't03', name: 'Franchise inquiry', module: 'sales', triggerKeywords: ['franchise', 'partner', 'invest', 'business', 'own store'], replyText: "Opening the Franchise section. You can submit an inquiry and our team will call you.", action: 'open_franchise', actionPayload: { tab: 'franchise' }, suggestedReplies: ['Show menu', 'Contact'], active: true, order: 3 },
  { id: 't04', name: 'Build PC open', module: 'build_pc', triggerKeywords: ['build', 'pc', 'configurator', 'assemble', 'custom pc'], replyText: "Opening the Build PC configurator. Pick parts, check compatibility, and save your build.", action: 'open_buildpc', actionPayload: { tab: 'buildpc' }, suggestedReplies: ['Budget build', 'Compatibility check'], active: true, order: 4 },
  { id: 't05', name: 'Track order', module: 'post_sales', triggerKeywords: ['track', 'status', 'where is my order', 'delivery', 'order id'], replyText: "Opening Orders. Sign in to see your orders and track delivery.", action: 'track_order', actionPayload: { tab: 'track' }, suggestedReplies: ['Refund', 'Reorder'], active: true, order: 5 },
  { id: 't06', name: 'Refund request', module: 'post_sales', triggerKeywords: ['refund', 'money back', 'cancel'], replyText: "For refunds we need your Order ID. Share it here or call +91 98765 43210. Refunds are processed within 5–7 days.", action: 'none', actionPayload: {}, suggestedReplies: ['Track order', 'Complaint'], active: true, order: 6 },
  { id: 't07', name: 'Complaint', module: 'post_sales', triggerKeywords: ['complaint', 'wrong order', 'missing', 'damaged', 'issue'], replyText: "Sorry to hear that. Share your Order ID and what went wrong — we’ll fix it (replacement or refund). You can also call +91 98765 43210.", action: 'none', actionPayload: {}, suggestedReplies: ['Track order', 'Refund'], active: true, order: 7 },
  { id: 't08', name: 'Reorder', module: 'post_sales', triggerKeywords: ['reorder', 'order again', 'same order'], replyText: "Opening the Menu so you can place the same or a new order. Your order history is in the Orders tab after sign-in.", action: 'show_menu', actionPayload: { tab: 'menu' }, suggestedReplies: ['Track order', 'Offers'], active: true, order: 8 },
  { id: 't09', name: 'Go home', module: 'csr', triggerKeywords: ['home', 'main page', 'start'], replyText: "Taking you to the homepage.", action: 'open_home', actionPayload: { tab: 'home' }, suggestedReplies: ['Menu', 'Build PC'], active: true, order: 9 },
  { id: 't10', name: 'View cart', module: 'sales', triggerKeywords: ['cart', 'basket', 'my order', 'checkout'], replyText: "Opening the Menu — your cart is there. Add items and go to checkout when ready.", action: 'open_cart', actionPayload: { tab: 'menu' }, suggestedReplies: ['Offers', 'Build PC'], active: true, order: 10 },
  { id: 't11', name: 'Recommend laptop', module: 'pre_sales', triggerKeywords: ['laptop', 'recommend', 'which laptop', 'gaming laptop'], replyText: "Opening the shop so you can browse Laptops. Filter by category to find gaming or work laptops.", action: 'show_menu', actionPayload: { tab: 'menu', category: 'laptop' }, suggestedReplies: ['Build PC', 'Compare'], active: true, order: 11 },
  { id: 't12', name: 'Recommend GPU', module: 'pre_sales', triggerKeywords: ['gpu', 'graphics', 'video card', 'which gpu'], replyText: "Opening the shop for Graphics Cards. For Build PC we can also help you pick — open the Build PC tab.", action: 'show_menu', actionPayload: { tab: 'menu', category: 'gpu' }, suggestedReplies: ['Build PC', 'Budget build'], active: true, order: 12 },
  { id: 't13', name: 'Budget PC', module: 'pre_sales', triggerKeywords: ['budget', 'cheap', 'under 50k', '50k', 'affordable'], replyText: "Opening Build PC. Set your budget with the slider and use presets like ‘Max Value’ or ‘Gaming 1080p’.", action: 'open_buildpc', actionPayload: { tab: 'buildpc', preset: 'budget' }, suggestedReplies: ['Open Build PC', 'Show menu'], active: true, order: 13 },
  { id: 't14', name: 'Compatibility check', module: 'build_pc', triggerKeywords: ['compatibility', 'compatible', 'will it work', 'fit together'], replyText: "In the Build PC tab we check compatibility live (socket, RAM, PSU, clearance). Open Build PC and add parts to see warnings.", action: 'open_buildpc', actionPayload: { tab: 'buildpc' }, suggestedReplies: ['Open Build PC', 'Budget build'], active: true, order: 14 },
  { id: 't15', name: 'Contact / support', module: 'csr', triggerKeywords: ['contact', 'support', 'help', 'phone', 'call', 'speak'], replyText: "You can reach us at +91 98765 43210 or use the Menu / Orders tabs. For urgent issues, call the number above.", action: 'contact_support', actionPayload: { phone: '+91 98765 43210' }, suggestedReplies: ['Track order', 'Offers'], active: true, order: 15 },
  { id: 't16', name: 'Hello / hi', module: 'csr', triggerKeywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'], replyText: "Hi! I’m Kynetra. I can help with Sales, Pre-sales, Post-sales, Build PC, and general support. What do you need?", action: 'none', actionPayload: {}, suggestedReplies: ['Show menu', 'Build PC', 'Track order'], active: true, order: 16 },
  { id: 't17', name: 'Payment issue', module: 'csr', triggerKeywords: ['payment', 'pay', 'not working', 'failed', 'card', 'upi'], replyText: "For payment issues, try another method (COD, UPI, or card). If it still fails, call +91 98765 43210.", action: 'none', actionPayload: {}, suggestedReplies: ['Contact', 'Track order'], active: true, order: 17 },
  { id: 't18', name: 'Delivery time', module: 'post_sales', triggerKeywords: ['delivery time', 'when', 'how long', 'eta', 'shipping'], replyText: "Delivery is usually 5–7 business days. Track your order in the Orders tab for live status.", action: 'track_order', actionPayload: { tab: 'track' }, suggestedReplies: ['Track order', 'Refund'], active: true, order: 18 },
  { id: 't19', name: 'Compare products', module: 'pre_sales', triggerKeywords: ['compare', 'vs', 'difference', 'which is better'], replyText: "Opening the shop. Use filters and categories to compare. For PCs, use Build PC to compare builds side by side.", action: 'show_menu', actionPayload: { tab: 'menu' }, suggestedReplies: ['Build PC', 'Recommend laptop'], active: true, order: 19 },
  { id: 't20', name: 'New arrivals', module: 'sales', triggerKeywords: ['new', 'latest', 'arrivals', 'new products'], replyText: "Opening the shop. New arrivals are highlighted there.", action: 'show_menu', actionPayload: { tab: 'menu' }, suggestedReplies: ['Offers', 'Build PC'], active: true, order: 20 },
  { id: 't21', name: 'Apply coupon', module: 'sales', triggerKeywords: ['apply coupon', 'use code', 'promo code', 'discount code'], replyText: "Opening Offers where you can see and apply coupon codes at checkout.", action: 'show_offers', actionPayload: { tab: 'offers' }, suggestedReplies: ['Show menu', 'Track order'], active: true, order: 21 },
  { id: 't22', name: 'Gaming PC', module: 'pre_sales', triggerKeywords: ['gaming pc', 'gaming rig', 'gaming desktop'], replyText: "Opening Build PC — pick a Gaming preset (1080p, 1440p, or 4K) or browse Gaming PCs in the shop.", action: 'open_buildpc', actionPayload: { tab: 'buildpc' }, suggestedReplies: ['Budget build', 'Show menu'], active: true, order: 22 },
  { id: 't23', name: 'Warranty', module: 'csr', triggerKeywords: ['warranty', 'guarantee', 'return policy'], replyText: "We offer warranty on products as per manufacturer. Return policy and details are on the product pages and footer.", action: 'none', actionPayload: {}, suggestedReplies: ['Contact', 'Show menu'], active: true, order: 23 },
  { id: 't24', name: 'Sign in', module: 'csr', triggerKeywords: ['sign in', 'login', 'account', 'register'], replyText: "Use the Sign In button at the top to access your account and orders.", action: 'none', actionPayload: {}, suggestedReplies: ['Track order', 'Show menu'], active: true, order: 24 },
  { id: 't25', name: 'Price / cost', module: 'sales', triggerKeywords: ['price', 'cost', 'how much', 'rate'], replyText: "Prices are on each product in the Menu. Open the shop to see current prices and offers.", action: 'show_menu', actionPayload: { tab: 'menu' }, suggestedReplies: ['Offers', 'Build PC'], active: true, order: 25 },
  { id: 't26', name: 'Feedback', module: 'post_sales', triggerKeywords: ['feedback', 'review', 'rate', 'experience'], replyText: "We’d love your feedback! Share your experience here or call +91 98765 43210. It helps us improve.", action: 'none', actionPayload: {}, suggestedReplies: ['Reorder', 'Offers'], active: true, order: 26 },
  { id: 't27', name: 'RAM / memory', module: 'pre_sales', triggerKeywords: ['ram', 'memory', 'ddr5', 'ddr4'], replyText: "Opening the shop for Memory. In Build PC you can pick RAM and see compatibility (e.g. AM5 sweet spot).", action: 'show_menu', actionPayload: { tab: 'menu', category: 'ram' }, suggestedReplies: ['Build PC', 'Compatibility'], active: true, order: 27 },
  { id: 't28', name: 'Storage', module: 'pre_sales', triggerKeywords: ['storage', 'ssd', 'nvme', 'hdd'], replyText: "Opening the shop for Storage. You can also add storage in the Build PC configurator.", action: 'show_menu', actionPayload: { tab: 'menu', category: 'storage' }, suggestedReplies: ['Build PC', 'Show menu'], active: true, order: 28 },
  { id: 't29', name: 'PSU / power', module: 'pre_sales', triggerKeywords: ['psu', 'power supply', 'watt'], replyText: "In Build PC we calculate total watts and suggest PSU headroom. Open Build PC to see power draw.", action: 'open_buildpc', actionPayload: { tab: 'buildpc' }, suggestedReplies: ['Compatibility', 'Budget build'], active: true, order: 29 },
  { id: 't30', name: 'Case / cabinet', module: 'pre_sales', triggerKeywords: ['case', 'cabinet', 'chassis'], replyText: "Opening the shop for Cases. In Build PC we check GPU and cooler clearance for your case.", action: 'show_menu', actionPayload: { tab: 'menu', category: 'case' }, suggestedReplies: ['Build PC', 'Compatibility'], active: true, order: 30 },
  { id: 't31', name: 'Monitor', module: 'pre_sales', triggerKeywords: ['monitor', 'display', 'screen'], replyText: "Opening the shop for Monitors. You can browse by category.", action: 'show_menu', actionPayload: { tab: 'menu', category: 'monitor' }, suggestedReplies: ['Build PC', 'Gaming PC'], active: true, order: 31 },
  { id: 't32', name: 'Keyboard mouse', module: 'pre_sales', triggerKeywords: ['keyboard', 'mouse', 'peripheral'], replyText: "Opening the shop for Keyboards and Mice.", action: 'show_menu', actionPayload: { tab: 'menu' }, suggestedReplies: ['Show menu', 'Offers'], active: true, order: 32 },
  { id: 't33', name: 'Cancel order', module: 'post_sales', triggerKeywords: ['cancel order', 'cancel my order'], replyText: "Share your Order ID and we’ll try to cancel before it ships. Call +91 98765 43210 for fastest cancellation.", action: 'track_order', actionPayload: { tab: 'track' }, suggestedReplies: ['Refund', 'Contact'], active: true, order: 33 },
  { id: 't34', name: 'Replace item', module: 'post_sales', triggerKeywords: ['replace', 'exchange', 'wrong item'], replyText: "Share your Order ID and what you want replaced. We’ll arrange exchange or replacement.", action: 'none', actionPayload: {}, suggestedReplies: ['Track order', 'Contact'], active: true, order: 34 },
  { id: 't35', name: 'Bulk / business', module: 'sales', triggerKeywords: ['bulk', 'business', 'corporate', 'many'], replyText: "For bulk or business orders, open the Franchise tab or call +91 98765 43210 for a dedicated quote.", action: 'open_franchise', actionPayload: { tab: 'franchise' }, suggestedReplies: ['Franchise', 'Contact'], active: true, order: 35 },
  { id: 't36', name: 'Free delivery', module: 'csr', triggerKeywords: ['free delivery', 'shipping free', 'delivery charge'], replyText: "We offer free delivery on orders above a certain value. Check the announcement bar and cart for details.", action: 'open_home', actionPayload: { tab: 'home' }, suggestedReplies: ['Show menu', 'Offers'], active: true, order: 36 },
  { id: 't37', name: 'COD', module: 'csr', triggerKeywords: ['cod', 'cash on delivery', 'pay on delivery'], replyText: "COD is available. Select it at checkout. There may be a limit — see the cart page.", action: 'open_cart', actionPayload: { tab: 'menu' }, suggestedReplies: ['Show menu', 'Track order'], active: true, order: 37 },
  { id: 't38', name: 'FAQ', module: 'csr', triggerKeywords: ['faq', 'questions', 'how to'], replyText: "Common answers: Track order in Orders tab, apply coupons in Offers, build a PC in Build PC tab. Need more? Call +91 98765 43210.", action: 'none', actionPayload: {}, suggestedReplies: ['Track order', 'Build PC', 'Offers'], active: true, order: 38 },
  { id: 't39', name: 'Best seller', module: 'sales', triggerKeywords: ['bestseller', 'best seller', 'popular', 'trending'], replyText: "Opening the shop. Bestsellers and trending products are highlighted on the homepage and in the menu.", action: 'show_menu', actionPayload: { tab: 'menu' }, suggestedReplies: ['New arrivals', 'Offers'], active: true, order: 39 },
  { id: 't40', name: 'Quiet PC', module: 'build_pc', triggerKeywords: ['quiet', 'silent', 'noise'], replyText: "In Build PC use the ‘Silent / Quiet’ preset and we’ll suggest low-noise parts.", action: 'open_buildpc', actionPayload: { tab: 'buildpc', preset: 'silent' }, suggestedReplies: ['Budget build', 'Compatibility'], active: true, order: 40 },
  { id: 't41', name: 'Streaming PC', module: 'pre_sales', triggerKeywords: ['streaming', 'stream', 'content creation'], replyText: "Opening Build PC. Use the ‘Streaming + Gaming’ preset for a balanced streaming build.", action: 'open_buildpc', actionPayload: { tab: 'buildpc', preset: 'streaming' }, suggestedReplies: ['Gaming PC', 'Budget build'], active: true, order: 41 },
  { id: 't42', name: 'Workstation', module: 'pre_sales', triggerKeywords: ['workstation', 'work', 'professional', 'creator'], replyText: "Opening Build PC. Use the ‘Workstation / Creator’ preset for professional builds.", action: 'open_buildpc', actionPayload: { tab: 'buildpc', preset: 'workstation' }, suggestedReplies: ['Build PC', 'Show menu'], active: true, order: 42 },
  { id: 't43', name: 'SFF / small', module: 'build_pc', triggerKeywords: ['small', 'sff', 'mini', 'compact'], replyText: "Opening Build PC. Use the ‘Small Form Factor’ preset for compact builds.", action: 'open_buildpc', actionPayload: { tab: 'buildpc', preset: 'sff' }, suggestedReplies: ['Compatibility', 'Budget build'], active: true, order: 43 },
  { id: 't44', name: 'Save build', module: 'build_pc', triggerKeywords: ['save build', 'save my build', 'share build'], replyText: "In the Build PC tab use ‘Save current build’ and ‘Copy share link’ to save and share your config.", action: 'open_buildpc', actionPayload: { tab: 'buildpc' }, suggestedReplies: ['Open Build PC', 'Compatibility'], active: true, order: 44 },
  { id: 't45', name: 'WhatsApp', module: 'csr', triggerKeywords: ['whatsapp', 'wa', 'chat'], replyText: "You can reach us on WhatsApp for quick support. Check the footer or contact section for the link.", action: 'contact_support', actionPayload: {}, suggestedReplies: ['Contact', 'Track order'], active: true, order: 45 },
  { id: 't46', name: 'Return policy', module: 'csr', triggerKeywords: ['return', 'return policy', 'send back'], replyText: "Return policy and warranty details are on the product pages and in the footer. For a specific return, share your Order ID.", action: 'none', actionPayload: {}, suggestedReplies: ['Refund', 'Contact'], active: true, order: 46 },
  { id: 't47', name: 'Order history', module: 'post_sales', triggerKeywords: ['order history', 'my orders', 'past orders'], replyText: "Sign in and open the Orders tab to see your order history and track status.", action: 'track_order', actionPayload: { tab: 'track' }, suggestedReplies: ['Track order', 'Reorder'], active: true, order: 47 },
  { id: 't48', name: 'Search product', module: 'sales', triggerKeywords: ['search', 'find', 'look for'], replyText: "Opening the shop. Use the search bar on the homepage or in the menu to find products.", action: 'search', actionPayload: { tab: 'menu' }, suggestedReplies: ['Show menu', 'Offers'], active: true, order: 48 },
  { id: 't49', name: 'Thank you', module: 'csr', triggerKeywords: ['thank', 'thanks', 'bye'], replyText: "You’re welcome! If you need anything else, just ask. — Kynetra · QuantumOS", action: 'none', actionPayload: {}, suggestedReplies: ['Show menu', 'Build PC'], active: true, order: 49 },
  { id: 't50', name: 'Default fallback', module: 'csr', triggerKeywords: [], replyText: "I can help with: Menu & offers, Build PC, Track order, Refunds, and more. Use the quick replies or type what you need.", action: 'none', actionPayload: {}, suggestedReplies: ['Show menu', 'Build PC', 'Track order', 'Offers'], active: true, order: 50 },
];

/** Match user message to first matching template (by triggerKeywords). */
export function matchTemplate(message, templates = defaultKynetraTemplates) {
  const lower = (message || '').toLowerCase().trim();
  if (!lower) return templates.find((t) => t.id === 't50') || null;
  const active = templates.filter((t) => t.active);
  for (const t of active) {
    if (t.id === 't50') continue; // fallback last
    const hit = (t.triggerKeywords || []).some((k) => lower.includes(k.toLowerCase()));
    if (hit) return t;
  }
  return templates.find((t) => t.id === 't50') || null;
}

/** Resolve action to tvs-navigate or tvs-action payload. */
export function resolveAction(template) {
  if (!template || !template.action || template.action === 'none') return null;
  const a = template.action;
  const p = template.actionPayload || {};
  if (a === 'navigate' && p.tab) return { type: 'navigate', tab: p.tab, category: p.category, preset: p.preset };
  if (a === 'open_buildpc') return { type: 'navigate', tab: 'buildpc', preset: p.preset };
  if (a === 'show_offers') return { type: 'navigate', tab: 'offers' };
  if (a === 'show_menu') return { type: 'navigate', tab: 'menu', category: p.category };
  if (a === 'open_franchise') return { type: 'navigate', tab: 'franchise' };
  if (a === 'open_cart') return { type: 'navigate', tab: 'menu' };
  if (a === 'open_home') return { type: 'navigate', tab: 'home' };
  if (a === 'track_order') return { type: 'navigate', tab: 'track' };
  if (a === 'search') return { type: 'navigate', tab: 'menu' };
  if (a === 'contact_support') return { type: 'contact', phone: p.phone };
  if (a === 'add_to_cart' && p.productId) return { type: 'add_to_cart', productId: p.productId };
  return null;
}
