/**
 * Seed data: 100 entries per entity for demo (offers, stores, reviews, orders, Kynetra, customers).
 * Used by admin and storefront when no backend data exists.
 */

const uid = () => Math.random().toString(36).slice(2, 9);
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── 100 Offers ───
export const seedOffers = Array.from({ length: 100 }, (_, i) => ({
  id: `OFF${String(i + 1).padStart(3, '0')}`,
  name: `Offer ${i + 1}`,
  code: `SEED${String(i + 1).padStart(3, '0')}`,
  discountType: i % 3 === 0 ? 'flat' : 'percent',
  discount: i % 3 === 0 ? 100 + i * 10 : 5 + (i % 20),
  maxDiscount: i % 3 === 0 ? null : 500 + i * 50,
  minOrder: i * 100,
  active: i % 5 !== 0,
  icon: '🎁',
  desc: `Seed offer description ${i + 1}`,
  used: rand(0, 500),
}));

// ─── 100 Stores ───
const cities = ['Chennai', 'Bangalore', 'Mumbai', 'Delhi', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Coimbatore', 'Kochi'];
export const seedStores = Array.from({ length: 100 }, (_, i) => ({
  id: `ST${String(i + 1).padStart(3, '0')}`,
  name: `TheValueStore ${cities[i % cities.length]} ${i + 1}`,
  address: `${rand(1, 999)} Main Road, ${cities[i % cities.length]}`,
  lat: 8 + Math.random() * 20,
  lng: 72 + Math.random() * 25,
  status: i % 10 === 0 ? 'inactive' : 'active',
  prepTime: 15 + (i % 45),
  rating: (35 + i % 15) / 10,
  hours: '9 AM – 9 PM',
}));

// ─── 100 Reviews ───
const reviewTexts = ['Great product!', 'Fast delivery.', 'Exactly as described.', 'Good value.', 'Recommended.', 'Works perfectly.'];
export const seedReviews = Array.from({ length: 100 }, (_, i) => ({
  id: `REV${String(i + 1).padStart(3, '0')}`,
  productId: `C${String((i % 500) + 1).padStart(4, '0')}`,
  rating: (rand(30, 50) / 10).toFixed(1),
  text: reviewTexts[i % reviewTexts.length],
  userName: `User ${i + 1}`,
  date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
  verified: i % 3 !== 0,
}));

// ─── 100 Orders (sample) ───
export const seedOrders = Array.from({ length: 100 }, (_, i) => ({
  id: `ORD-${String(1000 + i).padStart(4, '0')}`,
  status: ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'][i % 5],
  placed: new Date(Date.now() - i * 3600000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
  placedDate: new Date(Date.now() - i * 3600000).toISOString(),
  customer: `Customer ${i + 1}`,
  phone: '+91 98765' + String(10000 + i).slice(-5),
  store: seedStores[i % seedStores.length].id,
  items: [{ name: `Product ${(i % 50) + 1}`, qty: 1 + (i % 3), price: 1999 + i * 100 }],
  total: 2499 + i * 150,
  subtotal: 2299 + i * 140,
  gst: 200 + i * 10,
  deliveryFee: i % 4 === 0 ? 0 : 49,
  type: 'delivery',
  address: seedStores[i % seedStores.length].address,
  eta: 45 + (i % 30),
}));

// ─── 100 Kynetra conversations (Sales, Pre-sales, Post-sales, Build PC, CSR) ───
const intents = ['sales', 'pre_sales', 'post_sales', 'build_pc', 'csr'];
export const seedKynetraConversations = Array.from({ length: 100 }, (_, i) => ({
  id: `KYN${String(i + 1).padStart(3, '0')}`,
  intent: intents[i % 5],
  customerPhone: '+91 98765' + String(40000 + i).slice(-5),
  customerName: `User ${i + 1}`,
  messages: [
    { from: 'user', text: ['Show deals', 'I want to build a PC', 'Track my order', 'I have a complaint', 'Need help'][i % 5], time: new Date(Date.now() - i * 60000).toISOString() },
    { from: 'bot', text: 'Kynetra reply placeholder.', time: new Date(Date.now() - i * 60000 + 5000).toISOString() },
  ],
  status: ['open', 'resolved', 'escalated'][i % 3],
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
}));

// ─── 100 Customers ───
export const seedCustomers = Array.from({ length: 100 }, (_, i) => ({
  id: `C${String(i + 1).padStart(3, '0')}`,
  name: `Customer ${i + 1}`,
  phone: '+91 98765' + String(10000 + i).slice(-5),
  email: `customer${i + 1}@example.com`,
  orders: rand(0, 25),
  ltv: rand(0, 150000),
  tier: ['Bronze', 'Silver', 'Gold', 'Platinum'][Math.min(3, Math.floor(i / 25))],
  lastOrder: i % 5 === 0 ? 'never' : `${i % 30} days ago`,
  joined: new Date(Date.now() - i * 86400000 * 30).toISOString().slice(0, 7),
  tags: i % 10 === 0 ? ['vip'] : ['customer'],
}));

// ─── 100 Landing sections (configurable blocks) ───
export const seedLandingSections = Array.from({ length: 100 }, (_, i) => ({
  id: `SEC${String(i + 1).padStart(3, '0')}`,
  type: ['hero', 'banner', 'features', 'testimonials', 'categories', 'promo', 'cta', 'faq'][i % 8],
  title: `Section ${i + 1}`,
  content: `Configurable content block ${i + 1}.`,
  visible: i < 15,
  order: i,
  config: {},
}));

