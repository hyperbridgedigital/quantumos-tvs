/**
 * Kynetra HyperLocal — 50 features for local commerce: pincode, nearby stores, delivery, stock, offers.
 * Integrated into getKynetraResponseWithContext; runs before template matching when message matches.
 */
import { BRANDING } from '@/lib/kynetra';
import { brand } from '@/lib/brand';

const PINCODE_REGEX = /\b([1-9][0-9]{5})\b/g;

/** Demo: serviceable pincodes (HyperLocal) */
const SERVICEABLE_PINS = new Set(['600001', '600002', '600003', '600004', '600005', '600006', '600007', '600008', '600009', '600010', '600011', '600012', '600013', '600014', '600015', '600016', '600017', '600018', '600019', '600020', '600021', '600022', '600023', '600024', '600025', '600026', '600027', '600028', '600029', '600030', '600031', '600032', '600033', '600034', '600035', '600036', '600037', '600038', '600039', '600040', '600041', '600042', '600043', '600044', '600045', '600046', '600047', '600048', '600049', '600050', '600051', '600052', '600053', '600054', '600055', '600056', '600057', '600058', '600059', '600060', '110001', '110002', '110003', '400001', '400002', '560001', '560002', '700001', '500001', '380001', '411001', '452001', '302001', '641001', '395001', '530001', '695001', '751001', '781001', '834001', '800001', '122001', '201301', '110059', '110060']);

/** Demo: nearby stores */
const DEMO_STORES = [
  { id: 'ST001', name: 'TheValueStore ECR', city: 'Chennai', pincode: '600041', address: 'ECR Road', open: '10 AM – 9 PM', phone: '+91 98765 43210', distance: '2 km' },
  { id: 'ST002', name: 'TheValueStore T. Nagar', city: 'Chennai', pincode: '600017', address: 'T. Nagar', open: '10 AM – 9 PM', phone: '+91 98765 43211', distance: '5 km' },
  { id: 'ST003', name: 'TheValueStore Mount Road', city: 'Chennai', pincode: '600002', address: 'Anna Salai', open: '10 AM – 8 PM', phone: '+91 98765 43212', distance: '8 km' },
  { id: 'ST004', name: 'TheValueStore Velachery', city: 'Chennai', pincode: '600042', address: 'Velachery', open: '10 AM – 9 PM', phone: '+91 98765 43213', distance: '4 km' },
  { id: 'ST005', name: 'TheValueStore Delhi NCR', city: 'Noida', pincode: '201301', address: 'Sector 18', open: '10 AM – 9 PM', phone: '+91 98765 43214', distance: '12 km' },
];

/**
 * 50 HyperLocal feature IDs and match patterns.
 * When message matches, return { reply, action, suggestedReplies } and skip default flow for that reply.
 */
export const HYPERLOCAL_FEATURES = [
  { id: 'HL01', name: 'Pincode check', keywords: ['pincode', 'pin code', 'pin', 'delivery to', 'serviceable', 'area', 'deliver to'], handler: 'pincodeCheck' },
  { id: 'HL02', name: 'Nearest store', keywords: ['nearest store', 'nearby store', 'store near me', 'where is store', 'store location', 'outlet'], handler: 'nearestStore' },
  { id: 'HL03', name: 'Store timings', keywords: ['store timings', 'store hours', 'open today', 'when open', 'closing time'], handler: 'storeTimings' },
  { id: 'HL04', name: 'Local delivery ETA', keywords: ['delivery time', 'when deliver', 'eta', 'how long delivery', 'days to deliver'], handler: 'deliveryEta' },
  { id: 'HL05', name: 'Store stock', keywords: ['stock', 'available in store', 'pickup', 'in store', 'at store'], handler: 'storeStock' },
  { id: 'HL06', name: 'Click & collect', keywords: ['click collect', 'collect from store', 'pick from store', 'reserve and collect'], handler: 'clickCollect' },
  { id: 'HL07', name: 'City offers', keywords: ['city offer', 'local offer', 'chennai offer', 'delhi offer', 'city deal'], handler: 'cityOffers' },
  { id: 'HL08', name: 'Free delivery zone', keywords: ['free delivery', 'free shipping', 'delivery free', 'no delivery charge'], handler: 'freeDeliveryZone' },
  { id: 'HL09', name: 'COD availability', keywords: ['cod', 'cash on delivery', 'pay on delivery', 'cod available'], handler: 'codAvailability' },
  { id: 'HL10', name: 'Same-day delivery', keywords: ['same day', 'today delivery', 'express delivery', 'urgent delivery'], handler: 'sameDayDelivery' },
  { id: 'HL11', name: 'Store contact', keywords: ['store phone', 'store number', 'call store', 'store contact'], handler: 'storeContact' },
  { id: 'HL12', name: 'Store address', keywords: ['store address', 'store location address', 'where are you', 'physical store'], handler: 'storeAddress' },
  { id: 'HL13', name: 'Multiple cities', keywords: ['cities', 'which cities', 'other cities', 'branches'], handler: 'multipleCities' },
  { id: 'HL14', name: 'Local warranty', keywords: ['warranty service', 'warranty claim', 'service center', 'repair'], handler: 'localWarranty' },
  { id: 'HL15', name: 'Installation local', keywords: ['installation', 'pc assembly', 'setup', 'install at home'], handler: 'installationLocal' },
  { id: 'HL16', name: 'Exchange at store', keywords: ['exchange', 'exchange at store', 'replace at store'], handler: 'exchangeAtStore' },
  { id: 'HL17', name: 'Gift wrap store', keywords: ['gift wrap', 'gift packing', 'wrapping'], handler: 'giftWrap' },
  { id: 'HL18', name: 'Local events', keywords: ['event', 'workshop', 'demo', 'launch event'], handler: 'localEvents' },
  { id: 'HL19', name: 'Student offer local', keywords: ['student discount', 'student offer', 'college id'], handler: 'studentOfferLocal' },
  { id: 'HL20', name: 'Bulk quote local', keywords: ['bulk order', 'bulk quote', 'corporate', 'many pcs'], handler: 'bulkQuoteLocal' },
  { id: 'HL21', name: 'Trade-in at store', keywords: ['trade in', 'exchange old', 'sell old pc'], handler: 'tradeInStore' },
  { id: 'HL22', name: 'EMI store', keywords: ['emi', 'emi option', 'monthly payment'], handler: 'emiStore' },
  { id: 'HL23', name: 'Preorder in store', keywords: ['preorder', 'pre order', 'book now'], handler: 'preorderStore' },
  { id: 'HL24', name: 'Reserve product', keywords: ['reserve', 'hold', 'block product'], handler: 'reserveProduct' },
  { id: 'HL25', name: 'Price match local', keywords: ['price match', 'match price', 'lowest price'], handler: 'priceMatchLocal' },
  { id: 'HL26', name: 'Store demo', keywords: ['demo', 'try before', 'test product'], handler: 'storeDemo' },
  { id: 'HL27', name: 'Expert in store', keywords: ['expert', 'consultant', 'advice in store'], handler: 'expertInStore' },
  { id: 'HL28', name: 'Build PC in store', keywords: ['build pc in store', 'assemble in store', 'custom build store'], handler: 'buildPcInStore' },
  { id: 'HL29', name: 'Delivery slot', keywords: ['delivery slot', 'choose slot', 'time slot'], handler: 'deliverySlot' },
  { id: 'HL30', name: 'Track delivery live', keywords: ['track delivery', 'live track', 'where is delivery'], handler: 'trackDeliveryLive' },
  { id: 'HL31', name: 'Pincode list', keywords: ['list of pincodes', 'serviceable pincodes', 'all pincodes'], handler: 'pincodeList' },
  { id: 'HL32', name: 'Delivery charge', keywords: ['delivery charge', 'shipping cost', 'delivery fee'], handler: 'deliveryCharge' },
  { id: 'HL33', name: 'Minimum order', keywords: ['minimum order', 'min order', 'least order'], handler: 'minimumOrder' },
  { id: 'HL34', name: 'Return pickup', keywords: ['return pickup', 'pickup return', 'return from home'], handler: 'returnPickup' },
  { id: 'HL35', name: 'Local support number', keywords: ['support number', 'helpline', 'customer care number'], handler: 'localSupportNumber' },
  { id: 'HL36', name: 'WhatsApp store', keywords: ['whatsapp store', 'wa store', 'chat store'], handler: 'whatsappStore' },
  { id: 'HL37', name: 'Parking at store', keywords: ['parking', 'parking at store'], handler: 'parkingStore' },
  { id: 'HL38', name: 'Accessibility', keywords: ['wheelchair', 'accessibility', 'disabled access'], handler: 'accessibility' },
  { id: 'HL39', name: 'Store payment modes', keywords: ['payment at store', 'pay in store', 'card at store'], handler: 'storePaymentModes' },
  { id: 'HL40', name: 'Gift card store', keywords: ['gift card', 'voucher', 'store credit'], handler: 'giftCardStore' },
  { id: 'HL41', name: 'Loyalty in store', keywords: ['loyalty', 'points', 'rewards store'], handler: 'loyaltyStore' },
  { id: 'HL42', name: 'Refer store', keywords: ['refer', 'referral', 'refer friend'], handler: 'referStore' },
  { id: 'HL43', name: 'Complaint local', keywords: ['complaint', 'escalate', 'manager'], handler: 'complaintLocal' },
  { id: 'HL44', name: 'Feedback local', keywords: ['feedback', 'review store', 'rate store'], handler: 'feedbackLocal' },
  { id: 'HL45', name: 'Career store', keywords: ['job', 'career', 'hiring', 'vacancy'], handler: 'careerStore' },
  { id: 'HL46', name: 'Franchise nearby', keywords: ['franchise', 'open store', 'partner'], handler: 'franchiseNearby' },
  { id: 'HL47', name: 'Store catalogue', keywords: ['catalogue', 'brochure', 'product list store'], handler: 'storeCatalogue' },
  { id: 'HL48', name: 'New arrival store', keywords: ['new arrival', 'new in store', 'latest in store'], handler: 'newArrivalStore' },
  { id: 'HL49', name: 'Deal of day local', keywords: ['deal of day', 'today deal', 'daily deal'], handler: 'dealOfDayLocal' },
  { id: 'HL50', name: 'Store finder', keywords: ['find store', 'locate store', 'store finder'], handler: 'storeFinder' },
];

function getHandler(handlerId) {
  const handlers = {
    pincodeCheck(msg) {
      const pins = msg.match(PINCODE_REGEX) || [];
      const pin = pins[0];
      if (!pin) return { reply: `Share your *pincode* (6 digits) and I'll check if we deliver there. — *${BRANDING.agentName}* · ${brand.name}`, suggestedReplies: ['600041', '110001', 'Nearest store'] };
      const ok = SERVICEABLE_PINS.has(pin);
      return { reply: ok ? `✅ *${pin}* is serviceable. Delivery in 3–5 days. Free delivery on orders above ₹499.` : `We’re not yet delivering to *${pin}*. Try *Nearest store* for pickup.`, suggestedReplies: ['Nearest store', 'Other pincode'] };
    },
    nearestStore() {
      const list = DEMO_STORES.slice(0, 3).map((s) => `📍 *${s.name}* — ${s.address}, ${s.city} ${s.pincode}\n   ${s.open} · ${s.distance}`).join('\n\n');
      return { reply: `📍 *Nearest stores*\n\n${list}\n\nCall for stock: +91 98765 43210. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'home' }, suggestedReplies: ['Store timings', 'Pincode check'] };
    },
    storeTimings() {
      return { reply: `🕐 *Store timings*\n\nMost stores: *10 AM – 9 PM* (Mon–Sun). Some outlets 10 AM – 8 PM. Check *Nearest store* for your branch. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    deliveryEta() {
      return { reply: `🚚 *Delivery*\n\n• Standard: *3–5 business days*\n• Express: *1–2 days* (extra charge)\n• Depends on pincode. Share pincode for exact ETA. — *${BRANDING.agentName}*`, suggestedReplies: ['Pincode check', 'Track order'] };
    },
    storeStock() {
      return { reply: `📦 *Store stock*\n\nProduct availability varies by store. Call *+91 98765 43210* or ask *Nearest store* — we can check stock for you. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store', 'Click & collect'] };
    },
    clickCollect() {
      return { reply: `🛒 *Click & collect*\n\nAdd to cart → Checkout → Choose *Collect from store*. We’ll reserve for 24h. Bring ID. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'shop' }, suggestedReplies: ['Nearest store', 'Shop'] };
    },
    cityOffers() {
      return { reply: `🎁 *City / local offers*\n\nCheck the *Offers* tab for active coupons. Some deals are pincode-specific. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'offers' }, suggestedReplies: ['Offers', 'Pincode check'] };
    },
    freeDeliveryZone() {
      return { reply: `✅ *Free delivery* on orders above *₹499* for serviceable pincodes. Share your pincode to confirm. — *${BRANDING.agentName}*`, suggestedReplies: ['Pincode check'] };
    },
    codAvailability() {
      return { reply: `💵 *COD* is available in serviceable areas. Max order value for COD may apply. Select COD at checkout. — *${BRANDING.agentName}*`, suggestedReplies: ['Pincode check', 'Shop'] };
    },
    sameDayDelivery() {
      return { reply: `⚡ *Same-day / express* delivery may be available in select cities. Add to cart and check at checkout for options. — *${BRANDING.agentName}*`, suggestedReplies: ['Shop', 'Pincode check'] };
    },
    storeContact() {
      return { reply: `📞 *Store contact*\n\nGeneral: *+91 98765 43210*\nStores: Check *Nearest store* for branch numbers. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    storeAddress() {
      return { reply: `📍 *Store addresses* — Use *Nearest store* for your area. We’re in Chennai, Delhi NCR, and more. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    multipleCities() {
      return { reply: `🏙 *Cities*\n\nWe have stores in *Chennai*, *Delhi NCR*, and more. Share your city or pincode for the nearest outlet. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store', 'Pincode check'] };
    },
    localWarranty() {
      return { reply: `🛠 *Warranty & service*\n\nManufacturer warranty applies. For claims, visit the store with invoice or call +91 98765 43210. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    installationLocal() {
      return { reply: `🔧 *PC assembly / installation*\n\nWe offer assembly at select stores. Add to cart and choose *Installation* or call +91 98765 43210. — *${BRANDING.agentName}*`, suggestedReplies: ['Build PC', 'Nearest store'] };
    },
    exchangeAtStore() {
      return { reply: `🔄 *Exchange at store*\n\nBring the product and invoice to any store for exchange as per policy. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    giftWrap() {
      return { reply: `🎀 *Gift wrap* available at stores. Select at checkout or ask in store. — *${BRANDING.agentName}*`, suggestedReplies: ['Shop'] };
    },
    localEvents() {
      return { reply: `📅 *Events*\n\nWe run PC building workshops and product launches. Follow us or call +91 98765 43210 for dates. — *${BRANDING.agentName}*`, suggestedReplies: ['Build PC'] };
    },
    studentOfferLocal() {
      return { reply: `🎓 *Student offers*\n\nSpecial discounts for students. Check *Offers* tab and use valid college ID at store or upload at checkout. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'offers' }, suggestedReplies: ['Offers'] };
    },
    bulkQuoteLocal() {
      return { reply: `📋 *Bulk / corporate*\n\nOpen *Franchise* or call +91 98765 43210 for bulk quotes and corporate orders. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'franchise' }, suggestedReplies: ['Franchise'] };
    },
    tradeInStore() {
      return { reply: `♻️ *Trade-in*\n\nWe accept old PCs/laptops at select stores. Get a quote — bring the device or describe it. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    emiStore() {
      return { reply: `💳 *EMI* options available at checkout (card-based). No-cost EMI on select products. — *${BRANDING.agentName}*`, suggestedReplies: ['Shop'] };
    },
    preorderStore() {
      return { reply: `📌 *Preorder* — New launches can be pre-ordered. Check product page or call +91 98765 43210. — *${BRANDING.agentName}*`, suggestedReplies: ['Shop'] };
    },
    reserveProduct() {
      return { reply: `📦 *Reserve* — Use *Click & collect* at checkout to reserve for 24h at your chosen store. — *${BRANDING.agentName}*`, suggestedReplies: ['Click & collect', 'Shop'] };
    },
    priceMatchLocal() {
      return { reply: `💰 *Price match* — We try to match genuine local prices. Share the product and competitor price; our team will check. — *${BRANDING.agentName}*`, suggestedReplies: ['Contact'] };
    },
    storeDemo() {
      return { reply: `🖥 *Demo*\n\nVisit any store to try products. Call ahead to confirm demo availability. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    expertInStore() {
      return { reply: `👨‍💻 *Expert advice*\n\nOur store experts can help you choose. Or use *Build PC* here and *Book an expert* for a call. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'buildpc' }, suggestedReplies: ['Build PC'] };
    },
    buildPcInStore() {
      return { reply: `🖥 *Build PC in store*\n\nUse *Build PC* here to configure, then choose *Collect from store* for assembly at store. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'buildpc' }, suggestedReplies: ['Build PC', 'Nearest store'] };
    },
    deliverySlot() {
      return { reply: `📅 *Delivery slot*\n\nAt checkout you can select preferred date/time where available. — *${BRANDING.agentName}*`, suggestedReplies: ['Shop'] };
    },
    trackDeliveryLive() {
      return { reply: `📍 *Track delivery*\n\nUse the *Track* tab with your Order ID for status and live tracking link. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'track' }, suggestedReplies: ['Track order'] };
    },
    pincodeList() {
      return { reply: `📮 We deliver to 100+ pincodes. Share your *6-digit pincode* to check. — *${BRANDING.agentName}*`, suggestedReplies: ['600041', '110001'] };
    },
    deliveryCharge() {
      return { reply: `🚚 *Delivery*\n\n• Free above ₹499\n• Below: ₹29–49 depending on pincode. Check at checkout. — *${BRANDING.agentName}*`, suggestedReplies: ['Pincode check'] };
    },
    minimumOrder() {
      return { reply: `📦 No minimum order for most products. Some offers have min order — see *Offers* tab. — *${BRANDING.agentName}*`, suggestedReplies: ['Offers'] };
    },
    returnPickup() {
      return { reply: `🔄 *Return pickup* — We can arrange pickup for returns in serviceable areas. Share Order ID and we’ll guide you. — *${BRANDING.agentName}*`, suggestedReplies: ['Track order'] };
    },
    localSupportNumber() {
      return { reply: `📞 *Support*: +91 98765 43210 (Mon–Sat 9 AM – 6 PM). — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    whatsappStore() {
      return { reply: `💬 *WhatsApp* — You can message us on WhatsApp for quick support. Link in footer or contact section. — *${BRANDING.agentName}*`, suggestedReplies: ['Contact'] };
    },
    parkingStore() {
      return { reply: `🅿️ *Parking* — Most stores have parking. Confirm with the branch. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    accessibility() {
      return { reply: `♿ *Accessibility* — We aim to make stores accessible. Call +91 98765 43210 for specific branch info. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store'] };
    },
    storePaymentModes() {
      return { reply: `💳 *Pay at store*: Card, UPI, Cash. Online: Card, UPI, Net banking, EMI. — *${BRANDING.agentName}*`, suggestedReplies: ['Shop'] };
    },
    giftCardStore() {
      return { reply: `🎁 *Gift cards* — Available online and in store. Check the *Shop* or footer. — *${BRANDING.agentName}*`, suggestedReplies: ['Shop'] };
    },
    loyaltyStore() {
      return { reply: `⭐ *Loyalty* — Earn points on purchases; redeem on next order. Details in account or at store. — *${BRANDING.agentName}*`, suggestedReplies: ['Shop'] };
    },
    referStore() {
      return { reply: `👥 *Refer & earn* — Share your code from the *Offers* tab. You and your friend get rewards. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'offers' }, suggestedReplies: ['Offers'] };
    },
    complaintLocal() {
      return { reply: `📞 *Complaint* — Share Order ID and issue. Call +91 98765 43210 or we’ll escalate to the store manager. — *${BRANDING.agentName}*`, suggestedReplies: ['Track order'] };
    },
    feedbackLocal() {
      return { reply: `⭐ *Feedback* — We’d love your review! Share here or on our socials. — *${BRANDING.agentName}*`, suggestedReplies: ['Thank you'] };
    },
    careerStore() {
      return { reply: `💼 *Careers* — Openings at stores and HQ. Check our website or send resume to careers@thevaluestore.com. — *${BRANDING.agentName}*`, suggestedReplies: ['Franchise'] };
    },
    franchiseNearby() {
      return { reply: `🏢 *Franchise* — Open the *Franchise* tab to submit an inquiry. Our team will call you. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'franchise' }, suggestedReplies: ['Franchise'] };
    },
    storeCatalogue() {
      return { reply: `📖 *Catalogue* — Browse the *Shop* tab for full product list. 600+ products. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'shop' }, suggestedReplies: ['Shop'] };
    },
    newArrivalStore() {
      return { reply: `🆕 *New arrivals* — Check the *Shop* and homepage for latest products. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'shop' }, suggestedReplies: ['Shop'] };
    },
    dealOfDayLocal() {
      return { reply: `🔥 *Deal of the day* — See *Offers* and homepage *Deals* section. — *${BRANDING.agentName}*`, action: { type: 'navigate', tab: 'offers' }, suggestedReplies: ['Offers'] };
    },
    storeFinder() {
      return { reply: `📍 *Store finder* — Share your *pincode* or *city* and I’ll show nearest stores. — *${BRANDING.agentName}*`, suggestedReplies: ['Nearest store', '600041'] };
    },
  };
  return handlers[handlerId];
}

/**
 * Match message against HyperLocal features; return first match result or null.
 */
export function matchHyperLocal(message) {
  const lower = (message || '').toLowerCase().trim();
  if (!lower) return null;
  for (const f of HYPERLOCAL_FEATURES) {
    const hit = (f.keywords || []).some((k) => lower.includes(k.toLowerCase()));
    if (hit) {
      const fn = getHandler(f.handler);
      if (fn) {
        const result = fn(message);
        return { featureId: f.id, ...result };
      }
    }
  }
  return null;
}
