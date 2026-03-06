/**
 * Demo catalog: up to 500 products with computer/gaming/IT-relevant images.
 * Image source: Unsplash (see @/lib/productImages.js).
 */

import { CATALOG_CATEGORY_IMAGES } from '@/lib/productImages';

const CATEGORIES = [
  { id: 'gaming-pc', label: 'Gaming PCs', slug: 'gaming-pc' },
  { id: 'laptop', label: 'Laptops', slug: 'laptop' },
  { id: 'cpu', label: 'Processors', slug: 'cpu' },
  { id: 'gpu', label: 'Graphics Cards', slug: 'gpu' },
  { id: 'motherboard', label: 'Motherboards', slug: 'motherboard' },
  { id: 'ram', label: 'Memory', slug: 'ram' },
  { id: 'storage', label: 'Storage', slug: 'storage' },
  { id: 'psu', label: 'Power Supply', slug: 'psu' },
  { id: 'case', label: 'Cases', slug: 'case' },
  { id: 'monitor', label: 'Monitors', slug: 'monitor' },
  { id: 'keyboard', label: 'Keyboards', slug: 'keyboard' },
  { id: 'mouse', label: 'Mice', slug: 'mouse' },
  { id: 'headset', label: 'Headsets', slug: 'headset' },
  { id: 'accessory', label: 'Accessories', slug: 'accessory' },
  { id: 'software', label: 'Software', slug: 'software' },
];

function getCatalogImage(categoryId) {
  return CATALOG_CATEGORY_IMAGES[categoryId] || CATALOG_CATEGORY_IMAGES['components'];
}

const BRANDS = ['TheValueStore', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'NVIDIA', 'AMD', 'Intel', 'Samsung', 'WD', 'Logitech', 'Razer', 'SteelSeries', 'LG', 'Dell', 'HP', 'Acer', 'Lenovo'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

let id = 1;
const out = [];

CATEGORIES.forEach((cat) => {
  const count = cat.id === 'gaming-pc' || cat.id === 'laptop' ? 42 : cat.id === 'software' ? 24 : 38;
  for (let i = 0; i < count; i++) {
    const pid = `C${String(id).padStart(4, '0')}`;
    const price = cat.id === 'gaming-pc' ? randInt(45000, 250000) : cat.id === 'laptop' ? randInt(35000, 180000) : cat.id === 'software' ? randInt(999, 9999) : randInt(999, 85000);
    const rating = (randInt(30, 50) / 10).toFixed(1);
    const reviewCount = randInt(12, 1200);
    out.push({
      id: pid,
      name: `${rand(BRANDS)} ${cat.label.slice(0, -1)} ${id}`,
      price,
      category: cat.id,
      categoryLabel: cat.label,
      image: getCatalogImage(cat.id),
      imageHiRes: getCatalogImage(cat.id).replace(/\?.*/, '') + '?w=1200&h=1200&fit=crop',
      brand: rand(BRANDS),
      rating: parseFloat(rating),
      reviewCount,
      sku: `TVS-${cat.slug.toUpperCase().slice(0, 4)}-${String(id).padStart(4, '0')}`,
      inStock: Math.random() > 0.08,
      tag: i < 3 ? 'bestseller' : i >= count - 2 ? 'new' : null,
      moods: [],
    });
    id++;
  }
});

// Trim to exactly 600 demo products
export const catalogProducts = out.slice(0, 600);

export const catalogCategories = CATEGORIES;

export function getCatalogByCategory(category) {
  if (!category || category === 'all') return catalogProducts;
  return catalogProducts.filter((p) => p.category === category);
}

export function getCatalogProductById(productId) {
  return catalogProducts.find((p) => p.id === productId);
}

export function getCatalogImageBase() {
  return 'https://images.unsplash.com/';
}
