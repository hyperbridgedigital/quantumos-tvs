/**
 * Computer, gaming & IT product images — Unsplash (relevant, free to use).
 * Format: https://images.unsplash.com/photo-{id}?w=W&h=H&fit=crop
 */
const BASE = 'https://images.unsplash.com';

function img(id, w = 400, h = 400) {
  return `${BASE}/photo-${id}?w=${w}&h=${h}&fit=crop`;
}

// Curated Unsplash photo IDs for tech/gaming (stable, relevant)
export const PRODUCT_IMAGES = {
  'gaming-pcs': img('1587201092775-0b449674a6f1'),      // gaming PC setup
  'laptops': img('1496181133206-80ce9b88a853'),          // laptop
  'peripherals': img('1511467687858-23d96c32e4ae'),      // mechanical keyboard
  'monitors': img('1527443224154-c4a3942d3acf'),         // monitor
  'components': img('1591488320449-2f47233d73b4'),       // graphics card
  'storage': img('1597871060967-87d6f8368c3a'),          // SSD/storage
  'networking': img('1606904825846-647eb07f5f62'),       // router/network
  'refurbished': img('1588872657578-7efd1f1555ed'),      // laptop
};

// Per-product overrides (product id -> image id) for menuItems
export const MENU_ITEM_IMAGES = {
  'P001': img('1587201092775-0b449674a6f1'),   // Gaming PC Starter
  'P002': img('1496181133206-80ce9b88a853'),   // Gaming Laptop
  'P003': img('1511467687858-23d96c32e4ae'),   // Mechanical Keyboard
  'P004': img('1527864550417-7fd91fc51a46'),   // Gaming Mouse
  'P005': img('1527443224154-c4a3942d3acf'),   // Monitor
  'P006': img('1562976540-1502c2145186'),      // RAM
  'P007': img('1597871060967-87d6f8368c3a'),   // SSD NVMe
  'P008': img('1591488320449-2f47233d73b4'),   // GPU RTX
  'P009': img('1518770660439-4636190af475'),   // CPU / tech
  'P010': img('1587826080692-fb4c0d2d2c2'),   // Webcam
  'P011': img('1591799264318-7e6ef8ddb1ea'),   // NVMe storage
  'P012': img('1606904825846-647eb07f5f62'),   // Router
  'P013': img('1588872657578-7efd1f1555ed'),   // Refurbished Laptop
};

// Catalog category -> image (for generated catalog products)
export const CATALOG_CATEGORY_IMAGES = {
  'gaming-pc': img('1587201092775-0b449674a6f1'),
  'laptop': img('1496181133206-80ce9b88a853'),
  'cpu': img('1518770660439-4636190af475'),
  'gpu': img('1591488320449-2f47233d73b4'),
  'motherboard': img('1518770660439-4636190af475'),
  'ram': img('1562976540-1502c2145186'),
  'storage': img('1597871060967-87d6f8368c3a'),
  'psu': img('1591799264318-7e6ef8ddb1ea'),
  'case': img('1587201092775-0b449674a6f1'),
  'monitor': img('1527443224154-c4a3942d3acf'),
  'keyboard': img('1511467687858-23d96c32e4ae'),
  'mouse': img('1527864550417-7fd91fc51a46'),
  'headset': img('1618366712010-463f0c83ae8e'),
  'accessory': img('1511467687858-23d96c32e4ae'),
  'software': img('1518770660439-4636190af475'),
};

/**
 * Get product image URL — prefers product.image, then MENU_ITEM_IMAGES[id], then category.
 * Always returns a valid URL (computer/gaming/IT image).
 */
export function getProductImageUrl(product, width = 400, height = 400) {
  const fallback = PRODUCT_IMAGES['components'];
  if (!product) return fallback;
  if (product.image && typeof product.image === 'string') return product.image;
  const byId = MENU_ITEM_IMAGES[product.id];
  if (byId) return byId;
  const byCat = PRODUCT_IMAGES[product.category] || CATALOG_CATEGORY_IMAGES[product.category];
  if (byCat) return byCat;
  return fallback;
}
