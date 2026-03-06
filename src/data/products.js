// Fallback product list when catalog is not used — TheValueStore (gaming PCs, laptops, tech)
// Categories aligned with master prompt: Laptops, Gaming PCs, PC Components, Displays, Storage, Networking, Accessories, Refurbished
// Images: computer/gaming/IT-relevant (see @/lib/productImages.js)
import { MENU_ITEM_IMAGES } from '@/lib/productImages';

export const menuItems = [
  { id:'P001', name:'Gaming PC Starter', price:45999, category:'gaming-pcs', veg:false, tag:'bestseller', sku:'TVS-GPC-001', moods:['gaming','performance'], image: MENU_ITEM_IMAGES['P001'] },
  { id:'P002', name:'Gaming Laptop 15"', price:62999, category:'laptops', veg:true, tag:'signature', sku:'TVS-LAP-001', moods:['portable','gaming'], image: MENU_ITEM_IMAGES['P002'] },
  { id:'P003', name:'Mechanical Keyboard', price:3499, category:'peripherals', veg:true, tag:'trending', sku:'TVS-KBD-001', moods:['gaming','setup'], image: MENU_ITEM_IMAGES['P003'] },
  { id:'P004', name:'Gaming Mouse', price:1999, category:'peripherals', veg:true, tag:null, sku:'TVS-MOU-001', moods:['gaming','quick'], image: MENU_ITEM_IMAGES['P004'] },
  { id:'P005', name:'Monitor 24" 144Hz', price:14999, category:'monitors', veg:true, tag:'signature', sku:'TVS-MON-001', moods:['gaming','performance'], image: MENU_ITEM_IMAGES['P005'] },
  { id:'P006', name:'RAM 16GB DDR4', price:3499, category:'components', veg:true, tag:null, sku:'TVS-RAM-001', moods:['build','upgrade'], image: MENU_ITEM_IMAGES['P006'] },
  { id:'P007', name:'SSD 512GB NVMe', price:4499, category:'components', veg:true, tag:'bestseller', sku:'TVS-SSD-001', moods:['build','storage'], image: MENU_ITEM_IMAGES['P007'] },
  { id:'P008', name:'GPU RTX 4060', price:28999, category:'components', veg:true, tag:null, sku:'TVS-GPU-001', moods:['gaming','performance'], image: MENU_ITEM_IMAGES['P008'] },
  { id:'P009', name:'CPU Ryzen 5', price:13999, category:'components', veg:true, tag:'trending', sku:'TVS-CPU-001', moods:['build','performance'], image: MENU_ITEM_IMAGES['P009'] },
  { id:'P010', name:'Webcam 1080p', price:2499, category:'peripherals', veg:true, tag:null, sku:'TVS-WEB-001', moods:['work','streaming'], image: MENU_ITEM_IMAGES['P010'] },
  { id:'P011', name:'1TB NVMe SSD', price:6999, category:'storage', veg:true, tag:null, sku:'TVS-STO-001', moods:['build','storage'], image: MENU_ITEM_IMAGES['P011'] },
  { id:'P012', name:'Wi‑Fi 6 Router', price:3499, category:'networking', veg:true, tag:null, sku:'TVS-NET-001', moods:['home','work'], image: MENU_ITEM_IMAGES['P012'] },
  { id:'P013', name:'Refurbished Gaming Laptop', price:42999, category:'refurbished', veg:true, tag:'Best Value', sku:'TVS-REF-001', moods:['value','gaming'], image: MENU_ITEM_IMAGES['P013'] },
];

/** Catalog category taxonomy for filters and nav — computer retail */
export const CATALOG_CATEGORIES = [
  { id: 'laptops', label: 'Laptops', slug: 'laptops' },
  { id: 'gaming-pcs', label: 'Gaming PCs', slug: 'gaming-pcs' },
  { id: 'components', label: 'PC Components', slug: 'components' },
  { id: 'peripherals', label: 'Accessories', slug: 'peripherals' },
  { id: 'monitors', label: 'Monitors', slug: 'monitors' },
  { id: 'storage', label: 'Storage', slug: 'storage' },
  { id: 'networking', label: 'Networking', slug: 'networking' },
  { id: 'refurbished', label: 'Refurbished Value Deals', slug: 'refurbished' },
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
