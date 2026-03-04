#!/usr/bin/env node
// HyperBridge QuantumOS v11.1.0 — Test Data Generator
// Usage: node scripts/generateTestData.mjs --seed 111 --days 90

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'src', 'data');

const seed = parseInt(process.argv.find((a,i,arr) => arr[i-1]==='--seed') || '111');
const days = parseInt(process.argv.find((a,i,arr) => arr[i-1]==='--days') || '90');

// Seeded random
let _s = seed;
function rand() { _s = (_s * 16807 + 0) % 2147483647; return (_s & 0x7fffffff) / 0x7fffffff; }
function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function randDate(daysBack) {
  const now = new Date('2026-02-28T12:00:00+05:30');
  const ms = now.getTime() - Math.floor(rand() * daysBack * 86400000);
  return new Date(ms);
}

const FIRST_NAMES = ['Priya','Aamir','Sneha','Ravi','Fatima','Arjun','Kavitha','Mohammed','Lakshmi','Vikram',
  'Deepa','Karthik','Meera','Rajesh','Anita','Suresh','Divya','Imran','Pooja','Venkat',
  'Nithya','Bharath','Shalini','Prakash','Reshma','Ganesh','Swathi','Farhan','Janani','Ashwin',
  'Sangeetha','Arun','Harini','Naveen','Preethi','Siva','Madhavi','Yusuf','Keerthi','Dinesh'];
const LAST_NAMES = ['Sharma','Khan','Mehta','Reddy','Begum','Patel','Rajan','Hussain','Devi','Kumar',
  'Iyer','Nair','Pillai','Subramani','Jain','Naidu','Menon','Ahmed','Sundar','Balaji',
  'Krishnan','Chopra','Das','Venkatesh','Rao','Mohan','Selvam','Anand','Bhaskar','Pandian'];
const AREAS_ST001 = ['T. Nagar','Nandanam','Kodambakkam','West Mambalam','Ashok Nagar','Vadapalani','CIT Nagar','Teynampet','Nungambakkam','Mylapore','Alwarpet','Adyar','Royapettah','Kilpauk','Egmore','Guindy','Velachery'];
const AREAS_ST002 = ['Akkarai','Perungudi','Thoraipakkam','Navalur','Thiruvanmiyur','Palavakkam','Neelankarai','Sholinganallur','Kelambakkam','Medavakkam','Taramani','Injambakkam','Thazhambur'];
const MENU = [
  {id:'P001',name:'Hyderabad Biryani',price:299,cat:'biryani'},{id:'P002',name:'Irani Chai',price:49,cat:'beverages'},
  {id:'P003',name:'Ferrero Brownie',price:149,cat:'desserts'},{id:'P004',name:'Cold Coffee',price:89,cat:'beverages'},
  {id:'P005',name:'Rose Falooda',price:119,cat:'desserts'},{id:'P006',name:'Osmania Biscuit',price:39,cat:'snacks'},
  {id:'P007',name:'Party Box (10pc)',price:999,cat:'combos'},{id:'P008',name:'Dum Ka Roat',price:149,cat:'desserts'},
  {id:'P009',name:'Sheer Khurma',price:129,cat:'desserts'},{id:'P010',name:'Chicken 65',price:199,cat:'starters'},
];
const STATUSES = ['confirmed','preparing','out_for_delivery','delivered','delivered','delivered','delivered','cancelled'];
const TIERS = ['Bronze','Silver','Gold','Platinum'];
const MOODS = ['😊','😋','🤩','❤️','😌','🤔','😐','😢'];
const TAGS_POOL = ['biryani-lover','dessert-fan','chai-lover','weekend-orderer','corporate','bulk-orders','referrer','vip','health-conscious','late-night','family-orders'];

// Generate 40 customers
const customers = [];
for (let i = 0; i < 40; i++) {
  const fn = FIRST_NAMES[i]; const ln = pick(LAST_NAMES);
  const store = i < 22 ? 'ST001' : 'ST002';
  const areas = store === 'ST001' ? AREAS_ST001 : AREAS_ST002;
  const orderCount = randInt(1, 45);
  const avgVal = randInt(200, 800);
  const ltv = orderCount * avgVal;
  const tier = ltv > 12000 ? 'Platinum' : ltv > 6000 ? 'Gold' : ltv > 2500 ? 'Silver' : 'Bronze';
  const daysAgo = randInt(0, 60);
  const joinMonth = randInt(1, 12);
  const joinYear = rand() > 0.5 ? 2025 : 2024;
  const tags = [];
  for (let t = 0; t < randInt(1, 4); t++) tags.push(pick(TAGS_POOL));

  customers.push({
    id: `C${String(i+1).padStart(3,'0')}`,
    name: `${fn} ${ln}`,
    phone: `+91 9${String(randInt(1000000000, 9999999999)).slice(0,9)}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@gmail.com`,
    orders: orderCount,
    ltv,
    tier,
    lastOrder: daysAgo === 0 ? 'today' : `${daysAgo}d ago`,
    lastOrderDate: randDate(daysAgo).toISOString(),
    mood: pick(MOODS),
    joined: `${joinYear}-${String(joinMonth).padStart(2,'0')}`,
    tags: [...new Set(tags)],
    preferred_store: store,
    preferred_items: [pick(MENU).name, pick(MENU).name],
    area: pick(areas),
    consent_status: rand() > 0.1 ? 'opted_in' : 'opted_out',
  });
}

// Generate 40 orders
const orders = [];
for (let i = 0; i < 40; i++) {
  const cust = customers[i % 40];
  const store = pick(['ST001','ST002']);
  const itemCount = randInt(1, 4);
  const items = [];
  for (let j = 0; j < itemCount; j++) {
    const m = pick(MENU);
    items.push({ name: m.name, qty: randInt(1, 3), price: m.price });
  }
  const total = items.reduce((a, it) => a + it.price * it.qty, 0);
  const status = pick(STATUSES);
  const d = randDate(days);
  const types = ['delivery','pickup','dine_in'];

  orders.push({
    id: `ORD-${String(2700 + i).padStart(4,'0')}`,
    customer: cust.name,
    phone: cust.phone,
    store,
    items,
    total,
    status,
    type: pick(types),
    partner: status === 'out_for_delivery' ? `DP${String(randInt(1,10)).padStart(3,'0')}` : null,
    eta: status === 'delivered' ? 0 : randInt(15, 45),
    placed: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    placedDate: d.toISOString(),
    address: `${randInt(1,200)}, ${pick(store==='ST001' ? AREAS_ST001 : AREAS_ST002)}`,
  });
}

// Generate 10 delivery records
const deliveryPartners = [];
const dpNames = ['Raju K.','Suresh M.','Ahmed B.','Prasad T.','Imran S.','Gopal R.','Dinesh V.','Santhosh P.','Mani K.','Velu N.'];
for (let i = 0; i < 10; i++) {
  const store = i < 6 ? 'ST001' : 'ST002';
  deliveryPartners.push({
    id: `DP${String(i+1).padStart(3,'0')}`,
    name: dpNames[i],
    phone: `+91 90001 ${String(10001 + i)}`,
    vehicle: pick(['bike','scooter','bike','bike']),
    status: pick(['available','delivering','available','offline']),
    lat: store==='ST001' ? 13.04 + rand()*0.02 : 12.90 + rand()*0.02,
    lng: store==='ST001' ? 80.23 + rand()*0.02 : 80.24 + rand()*0.02,
    orders: randInt(0, 2), maxOrders: 3,
    rating: (4 + rand() * 0.9).toFixed(1) * 1,
    today: randInt(5, 20), avgTime: randInt(18, 30),
    store,
  });
}

const deliveryZones = [
  { id:'ZC001', name:'T. Nagar Core', store:'ST001', fee:0, minOrder:149, maxTime:25, active:true },
  { id:'ZC002', name:'West Mambalam / Ashok Nagar', store:'ST001', fee:0, minOrder:149, maxTime:25, active:true },
  { id:'ZC003', name:'Nungambakkam / Kilpauk', store:'ST001', fee:20, minOrder:199, maxTime:30, active:true },
  { id:'ZC004', name:'Mylapore / Alwarpet', store:'ST001', fee:25, minOrder:199, maxTime:32, active:true },
  { id:'ZC005', name:'Adyar / Guindy / Velachery', store:'ST001', fee:30, minOrder:249, maxTime:35, active:true },
  { id:'ZC006', name:'Akkarai / ECR Core', store:'ST002', fee:0, minOrder:149, maxTime:20, active:true },
  { id:'ZC007', name:'Sholinganallur / OMR', store:'ST002', fee:0, minOrder:149, maxTime:22, active:true },
  { id:'ZC008', name:'Palavakkam / Neelankarai', store:'ST002', fee:0, minOrder:149, maxTime:22, active:true },
  { id:'ZC009', name:'Perungudi / Thoraipakkam', store:'ST002', fee:15, minOrder:199, maxTime:25, active:true },
  { id:'ZC010', name:'Thiruvanmiyur / Taramani', store:'ST002', fee:20, minOrder:199, maxTime:28, active:true },
  { id:'ZC011', name:'Kelambakkam / Navalur', store:'ST002', fee:25, minOrder:249, maxTime:35, active:true },
];

// Generate 10 promo/campaign seeds
const promoSeeds = [
  { id:'PROMO001', name:'Welcome 20% OFF', code:'WELCOME20', type:'percent', value:20, maxDiscount:150, minOrder:199, status:'active', used:randInt(100,500), maxUses:9999 },
  { id:'PROMO002', name:'Biryani Bonanza', code:'BIRYANI50', type:'flat', value:50, minOrder:299, status:'active', used:randInt(50,200), maxUses:1000 },
  { id:'PROMO003', name:'Flat ₹100 OFF', code:'FLAT100', type:'flat', value:100, minOrder:499, status:'active', used:randInt(80,300), maxUses:500 },
  { id:'PROMO004', name:'Free Chai Friday', code:'CHAIFRIDAY', type:'freebie', freebieItem:'Irani Chai', minOrder:249, status:'active', used:randInt(40,150), maxUses:300 },
  { id:'PROMO005', name:'Family Pack ₹200', code:'FAMILY200', type:'flat', value:200, minOrder:999, status:'active', used:randInt(20,80), maxUses:300 },
  { id:'PROMO006', name:'Happy Hours 15%', code:'HAPPY15', type:'percent', value:15, maxDiscount:120, minOrder:149, status:'scheduled', timeStart:'14:00', timeEnd:'17:00', used:0, maxUses:999 },
  { id:'PROMO007', name:'ECR Launch 25%', code:'ECR25', type:'percent', value:25, maxDiscount:200, minOrder:349, status:'expired', used:randInt(200,400), maxUses:500, storeFilter:'ST002' },
  { id:'PROMO008', name:'Weekend Special', code:'WEEKEND10', type:'percent', value:10, maxDiscount:100, minOrder:199, status:'active', used:randInt(60,200), maxUses:999, daysOfWeek:['sat','sun'] },
  { id:'PROMO009', name:'Referral ₹100', code:'REFER100', type:'flat', value:100, minOrder:299, status:'active', used:randInt(100,300), maxUses:9999 },
  { id:'PROMO010', name:'Birthday 30% OFF', code:'BDAY30', type:'percent', value:30, maxDiscount:300, minOrder:199, status:'active', used:randInt(30,100), maxUses:9999 },
];

// Generate 200-400 events
const EVENT_TYPES = ['order_placed','order_status_changed','customer_created','customer_updated','stock_updated','promo_redeemed','campaign_sent','admin_login','setting_changed'];
const ACTORS = [
  { type:'system', id:'SYS', email:'system@thevaluestore.com', role:'system' },
  { type:'admin', id:'U001', email:'spadensilver@gmail.com', role:'superadmin' },
  { type:'admin', id:'U002', email:'admin@thevaluestore.com', role:'admin' },
  { type:'admin', id:'U003', email:'manager@thevaluestore.com', role:'manager' },
  { type:'customer', id:'CUST', email:'customer@gmail.com', role:'customer' },
];
const eventCount = randInt(250, 350);
const events = [];
for (let i = 0; i < eventCount; i++) {
  const d = randDate(30);
  const evType = pick(EVENT_TYPES);
  const actor = pick(ACTORS);
  events.push({
    id: `EVT-${String(i+1).padStart(5,'0')}`,
    timestamp: d.toISOString(),
    type: evType,
    actor: { ...actor, id: actor.type === 'customer' ? pick(customers).id : actor.id },
    entity_id: evType.includes('order') ? pick(orders).id : evType.includes('customer') ? pick(customers).id : `ENT-${randInt(1,100)}`,
    entity_type: evType.includes('order') ? 'order' : evType.includes('customer') ? 'customer' : 'system',
    action: evType,
    details: `${evType.replace(/_/g,' ')} at ${d.toLocaleTimeString()}`,
    ip: `${randInt(10,220)}.${randInt(0,255)}.${randInt(0,255)}.${randInt(1,254)}`,
    store_id: pick(['ST001','ST002']),
  });
}

// Build CRM from orders (pipeline-derived)
const crmMap = {};
orders.forEach(o => {
  const key = o.phone;
  if (!crmMap[key]) {
    const c = customers.find(c => c.phone === o.phone) || {};
    crmMap[key] = { ...c, orders: 0, ltv: 0 };
  }
  if (o.status !== 'cancelled') {
    crmMap[key].orders += 1;
    crmMap[key].ltv += o.total;
  }
});
Object.values(crmMap).forEach(c => {
  c.tier = c.ltv > 12000 ? 'Platinum' : c.ltv > 6000 ? 'Gold' : c.ltv > 2500 ? 'Silver' : 'Bronze';
});

// Build remarketing DB
const remarketingRecords = customers.map(c => ({
  customer_id: c.id,
  phone: c.phone,
  email: c.email,
  name: c.name,
  ltv: c.ltv,
  tier: c.tier,
  tags: c.tags,
  last_order_date: c.lastOrderDate,
  order_count: c.orders,
  avg_order_value: c.orders > 0 ? Math.round(c.ltv / c.orders) : 0,
  preferred_items: c.preferred_items,
  preferred_store: c.preferred_store,
  consent_status: c.consent_status,
  consent_log: [{ date: c.joined + '-01', source: 'signup', purpose: 'marketing', status: c.consent_status }],
  platform_ids: { google_cid: `G-${c.id}`, fb_pixel_id: `FB-${c.id}` },
  segments: [],
}));
// Compute segments
remarketingRecords.forEach(r => {
  const segs = [];
  if (r.ltv > 8000) segs.push('high_value');
  if (r.tier === 'Platinum' || r.tier === 'Gold') segs.push('frequent_buyer');
  if (r.order_count <= 2) segs.push('new_customer');
  if (r.preferred_items?.some(i => i.toLowerCase().includes('biryani'))) segs.push('biryani_fan');
  if (r.preferred_items?.some(i => ['brownie','falooda','khurma','roat'].some(d => i.toLowerCase().includes(d)))) segs.push('dessert_lover');
  if (r.tags?.includes('weekend-orderer')) segs.push('weekend_orderer');
  if (r.avg_order_value > 600) segs.push('big_spender');
  r.segments = segs;
});

// Write files
function toExport(varName, data) {
  return `// Auto-generated by generateTestData.mjs — v11.1.0\nexport const ${varName} = ${JSON.stringify(data, null, 2)};\n`;
}

writeFileSync(join(dataDir, 'crm.js'), toExport('customers', customers));
writeFileSync(join(dataDir, 'orders.js'), `// Auto-generated — v11.1.0\nexport const sampleOrders = ${JSON.stringify(orders, null, 2)};\n`);
writeFileSync(join(dataDir, 'delivery.js'), `// Auto-generated — v11.1.0\nexport const deliveryPartners = ${JSON.stringify(deliveryPartners, null, 2)};\n\nexport const deliveryZones = ${JSON.stringify(deliveryZones, null, 2)};\n`);
writeFileSync(join(dataDir, 'remarketingDb.js'), toExport('remarketingRecords', remarketingRecords));
writeFileSync(join(dataDir, 'eventLog.js'), toExport('eventLog', events));
writeFileSync(join(dataDir, 'promoEngine.js'), `// Auto-generated — v11.1.0\nexport const promoTemplates = ${JSON.stringify(promoSeeds, null, 2)};\n`);

// Franchise
const franchises = [
  { id:'FR001', name:'TheValueStore T. Nagar', owner:'HyperBridge Group', phone:'+91 44 4500 1234', status:'active', city:'Chennai', store:'ST001', revenue:485000, orders:1240, royalty:0, since:'2025-01', investment:2500000 },
  { id:'FR002', name:'Mount Road Sangam ECR', owner:'HyperBridge Group', phone:'+91 44 4500 5678', status:'active', city:'Chennai', store:'ST002', revenue:380000, orders:980, royalty:0, since:'2025-06', investment:3000000 },
];
writeFileSync(join(dataDir, 'franchise.js'), toExport('franchises', franchises));

// CRM Sync Ledger
const ledger = orders.slice(0, 20).map((o, i) => ({
  order_id: o.id, processed_at: new Date().toISOString(),
  action_hash: `hash_${o.id}_${i}`, applied_fields: ['orders','ltv','tier','lastOrder'], version: 1,
}));
writeFileSync(join(dataDir, 'crmSyncLedger.js'), toExport('crmSyncLedger', ledger));

// AI Recommendations
const recs = [
  { id:'REC001', type:'revenue', severity:'amber', text:'Revenue dropped 12% on Tuesdays — suggest Happy Hour promo for Tuesdays', action:'Create HAPPY_TUESDAY promo', created: new Date().toISOString() },
  { id:'REC002', type:'crm', severity:'red', text:'Gold customers inactive 14+ days — trigger win-back WhatsApp campaign', action:'Launch win-back campaign', created: new Date().toISOString() },
  { id:'REC003', type:'stock', severity:'amber', text:'Biryani stock runs out by 8 PM — increase evening prep by 20%', action:'Adjust prep schedule', created: new Date().toISOString() },
  { id:'REC004', type:'revenue', severity:'green', text:'ECR store AOV +23% — expand premium menu', action:'Add 5 premium items', created: new Date().toISOString() },
  { id:'REC005', type:'delivery', severity:'amber', text:'OMR zone delivery time avg 38 mins — add 2 more partners', action:'Recruit delivery partners', created: new Date().toISOString() },
  { id:'REC006', type:'marketing', severity:'green', text:'Referral program K-factor 1.4 — increase referral bonus to ₹150', action:'Update referral config', created: new Date().toISOString() },
  { id:'REC007', type:'crm', severity:'amber', text:'23 Bronze customers haven\'t ordered in 30+ days — dormant risk', action:'Send re-engagement offers', created: new Date().toISOString() },
  { id:'REC008', type:'revenue', severity:'green', text:'Weekend orders up 18% — launch weekend-only combo deals', action:'Create weekend combos', created: new Date().toISOString() },
  { id:'REC009', type:'stock', severity:'red', text:'Osmania Biscuit stock critical — only 12 units left', action:'Reorder immediately', created: new Date().toISOString() },
  { id:'REC010', type:'delivery', severity:'green', text:'T. Nagar zone on-time rate 94% — best performing zone', action:'Replicate model to ECR', created: new Date().toISOString() },
];
writeFileSync(join(dataDir, 'aiRecommendations.js'), toExport('aiRecommendations', recs));

console.log(`✅ Generated: 40 customers, 40 orders, 10 delivery partners, 11 zones, 10 promos, ${events.length} events`);
console.log(`✅ Files written to ${dataDir}`);
