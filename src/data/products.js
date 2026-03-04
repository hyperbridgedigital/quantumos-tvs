// Fallback product list when catalog is not used — TheValueStore (gaming PCs, laptops, tech)
export const menuItems = [
  { id:'P001', name:'Gaming PC Starter', price:45999, category:'gaming-pcs', veg:false, tag:'bestseller', sku:'TVS-GPC-001', moods:['gaming','performance'] },
  { id:'P002', name:'Gaming Laptop 15"', price:62999, category:'laptops', veg:true, tag:'signature', sku:'TVS-LAP-001', moods:['portable','gaming'] },
  { id:'P003', name:'Mechanical Keyboard', price:3499, category:'peripherals', veg:true, tag:'trending', sku:'TVS-KBD-001', moods:['gaming','setup'] },
  { id:'P004', name:'Gaming Mouse', price:1999, category:'peripherals', veg:true, tag:null, sku:'TVS-MOU-001', moods:['gaming','quick'] },
  { id:'P005', name:'Monitor 24" 144Hz', price:14999, category:'peripherals', veg:true, tag:'signature', sku:'TVS-MON-001', moods:['gaming','performance'] },
  { id:'P006', name:'RAM 16GB DDR4', price:3499, category:'components', veg:true, tag:null, sku:'TVS-RAM-001', moods:['build','upgrade'] },
  { id:'P007', name:'SSD 512GB NVMe', price:4499, category:'components', veg:true, tag:'bestseller', sku:'TVS-SSD-001', moods:['build','storage'] },
  { id:'P008', name:'GPU RTX 4060', price:28999, category:'components', veg:true, tag:null, sku:'TVS-GPU-001', moods:['gaming','performance'] },
  { id:'P009', name:'CPU Ryzen 5', price:13999, category:'components', veg:true, tag:'trending', sku:'TVS-CPU-001', moods:['build','performance'] },
  { id:'P010', name:'Webcam 1080p', price:2499, category:'peripherals', veg:true, tag:null, sku:'TVS-WEB-001', moods:['work','streaming'] },
];

/** Budget tiers for filtering — tech/gaming price ranges */
export const BUDGET_TIERS = [
  { id: 'under_10k', label: 'Under ₹10K', min: 0, max: 9999 },
  { id: '10k_30k', label: '₹10K – ₹30K', min: 10000, max: 29999 },
  { id: '30k_60k', label: '₹30K – ₹60K', min: 30000, max: 59999 },
  { id: '60k_plus', label: '₹60K+', min: 60000, max: 999999 },
];

export function getBudgetTier(price) {
  const t = BUDGET_TIERS.find(tier => price >= tier.min && price <= tier.max);
  return t ? t.id : '60k_plus';
}

export function withBudgetTiers(items) {
  return items.map(p => ({ ...p, budgetTier: getBudgetTier(p.price) }));
}
