/**
 * Demo catalog: up to 500 products with high-resolution placeholder images.
 * Image base: https://picsum.photos/seed/{id}/800/800 (good resolution).
 * All configurable from admin; categories and counts can be driven by settings.
 */

const IMG = (id) => `https://picsum.photos/seed/${id}/800/800`;

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

const BRANDS = ['TheValueStore', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'NVIDIA', 'AMD', 'Intel', 'Samsung', 'WD', 'Logitech', 'Razer', 'SteelSeries', 'LG', 'Dell', 'HP', 'Acer', 'Lenovo'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

let id = 1;
const out = [];

CATEGORIES.forEach((cat) => {
  const count = cat.id === 'gaming-pc' || cat.id === 'laptop' ? 35 : cat.id === 'software' ? 20 : 32;
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
      image: IMG(pid),
      imageHiRes: IMG(pid).replace('/800/800', '/1200/1200'),
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

// Trim to exactly 500
export const catalogProducts = out.slice(0, 500);

export const catalogCategories = CATEGORIES;

export function getCatalogByCategory(category) {
  if (!category || category === 'all') return catalogProducts;
  return catalogProducts.filter((p) => p.category === category);
}

export function getCatalogProductById(productId) {
  return catalogProducts.find((p) => p.id === productId);
}

export function getCatalogImageBase() {
  return 'https://picsum.photos/seed/';
}
