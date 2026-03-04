export const menuItems = [
  { id:'P001', name:'Signature Biryani', price:299, category:'biryani', veg:false, tag:'bestseller', sku:'CM-BIR-001', moods:['comfort','royal','indulgent'] },
  { id:'P002', name:'Irani Chai', price:49, category:'beverages', veg:true, tag:'signature', sku:'CM-CHI-001', moods:['comfort','nostalgic','quick'] },
  { id:'P003', name:'Ferrero Brownie', price:149, category:'desserts', veg:true, tag:'trending', sku:'CM-BRW-001', moods:['indulgent','comfort'] },
  { id:'P004', name:'Cold Coffee', price:89, category:'beverages', veg:true, tag:null, sku:'CM-COF-001', moods:['quick','comfort'] },
  { id:'P005', name:'Rose Falooda', price:119, category:'desserts', veg:true, tag:'signature', sku:'CM-FAL-001', moods:['indulgent','festive'] },
  { id:'P006', name:'Osmania Biscuit', price:39, category:'snacks', veg:true, tag:null, sku:'CM-OSM-001', moods:['nostalgic','quick'] },
  { id:'P007', name:'Party Box (10pc)', price:999, category:'combos', veg:false, tag:'bestseller', sku:'CM-PTY-001', moods:['sharing','festive','royal'] },
  { id:'P008', name:'Dum Ka Roat', price:149, category:'desserts', veg:true, tag:null, sku:'CM-DKR-001', moods:['nostalgic','indulgent'] },
  { id:'P009', name:'Sheer Khurma', price:129, category:'desserts', veg:true, tag:'seasonal', sku:'CM-SHK-001', moods:['festive','nostalgic'] },
  { id:'P010', name:'Chicken 65', price:199, category:'starters', veg:false, tag:'trending', sku:'CM-C65-001', moods:['sharing','comfort','quick'] },
];

/** Budget tiers for filtering — helps customers find goodies within budget */
export const BUDGET_TIERS = [
  { id: 'under_100', label: 'Under ₹100', min: 0, max: 99 },
  { id: '100_300', label: '₹100 – ₹300', min: 100, max: 300 },
  { id: '300_500', label: '₹300 – ₹500', min: 301, max: 500 },
  { id: '500_plus', label: '₹500+', min: 501, max: 99999 },
];

export function getBudgetTier(price) {
  const t = BUDGET_TIERS.find(tier => price >= tier.min && price <= tier.max);
  return t ? t.id : '500_plus';
}

export function withBudgetTiers(items) {
  return items.map(p => ({ ...p, budgetTier: getBudgetTier(p.price) }));
}
