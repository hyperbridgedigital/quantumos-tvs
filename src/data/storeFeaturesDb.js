/**
 * Store features DB: wishlist, price alerts, preorders, trade-ins, build guides,
 * warranties, expert bookings, loyalty points, stock-by-store.
 * 50 seed records + in-memory CRUD for API.
 */

const uid = () => Math.random().toString(36).slice(2, 11);

// ─── SEED DATA (50 records across 10 features) ───
export const seedWishlist = [
  { id: 'WL001', productId: 'P001', customerId: 'C001', productName: 'Gaming PC Starter', price: 45999, addedAt: '2025-02-01T10:00:00Z' },
  { id: 'WL002', productId: 'P008', customerId: 'C002', productName: 'GPU RTX 4060', price: 28999, addedAt: '2025-02-02T11:00:00Z' },
  { id: 'WL003', productId: 'P005', customerId: 'C001', productName: 'Monitor 24" 144Hz', price: 14999, addedAt: '2025-02-03T09:00:00Z' },
  { id: 'WL004', productId: 'P002', customerId: 'C003', productName: 'Gaming Laptop 15"', price: 62999, addedAt: '2025-02-04T14:00:00Z' },
  { id: 'WL005', productId: 'P007', customerId: 'C002', productName: 'SSD 512GB NVMe', price: 4499, addedAt: '2025-02-05T16:00:00Z' },
];

export const seedPriceAlerts = [
  { id: 'PA001', productId: 'P008', productName: 'GPU RTX 4060', currentPrice: 28999, targetPrice: 25999, email: 'user1@example.com', status: 'active', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'PA002', productId: 'P002', productName: 'Gaming Laptop 15"', currentPrice: 62999, targetPrice: 59999, email: 'user2@example.com', status: 'active', createdAt: '2025-02-02T11:00:00Z' },
  { id: 'PA003', productId: 'P001', productName: 'Gaming PC Starter', currentPrice: 45999, targetPrice: 42999, phone: '+919876543210', status: 'active', createdAt: '2025-02-03T09:00:00Z' },
  { id: 'PA004', productId: 'P005', productName: 'Monitor 24" 144Hz', currentPrice: 14999, targetPrice: 13999, email: 'user4@example.com', status: 'triggered', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'PA005', productId: 'P009', productName: 'CPU Ryzen 5', currentPrice: 13999, targetPrice: 12999, email: 'user5@example.com', status: 'active', createdAt: '2025-02-05T16:00:00Z' },
];

export const seedPreorders = [
  { id: 'PO001', productId: 'RTX5060', productName: 'NVIDIA RTX 5060 (Pre-order)', queuePosition: 1, deposit: 5000, customerId: 'C001', status: 'queued', eta: '2025-04-01', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'PO002', productId: 'RZ9000', productName: 'AMD Ryzen 9000 (Pre-order)', queuePosition: 2, deposit: 3000, customerId: 'C002', status: 'queued', eta: '2025-03-15', createdAt: '2025-02-02T11:00:00Z' },
  { id: 'PO003', productId: 'LAP-NEW', productName: 'Gaming Laptop 2025 (Pre-order)', queuePosition: 3, deposit: 10000, customerId: 'C003', status: 'queued', eta: '2025-05-01', createdAt: '2025-02-03T09:00:00Z' },
  { id: 'PO004', productId: 'MON-4K', productName: '32" 4K 144Hz Monitor (Pre-order)', queuePosition: 4, deposit: 2000, customerId: 'C001', status: 'queued', eta: '2025-04-20', createdAt: '2025-02-04T14:00:00Z' },
  { id: 'PO005', productId: 'KB-PRO', productName: 'Mechanical Keyboard Pro (Pre-order)', queuePosition: 5, deposit: 1000, customerId: 'C002', status: 'queued', eta: '2025-03-01', createdAt: '2025-02-05T16:00:00Z' },
];

export const seedTradeins = [
  { id: 'TI001', deviceType: 'laptop', deviceName: 'Dell Inspiron 15', condition: 'good', estimatedValue: 18000, customerId: 'C001', status: 'pending', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'TI002', deviceType: 'gpu', deviceName: 'GTX 1660 Ti', condition: 'excellent', estimatedValue: 12000, customerId: 'C002', status: 'approved', createdAt: '2025-02-02T11:00:00Z' },
  { id: 'TI003', deviceType: 'laptop', deviceName: 'HP Pavilion Gaming', condition: 'fair', estimatedValue: 22000, customerId: 'C003', status: 'pending', createdAt: '2025-02-03T09:00:00Z' },
  { id: 'TI004', deviceType: 'pc', deviceName: 'Custom Build i5 + 3060', condition: 'good', estimatedValue: 45000, customerId: 'C001', status: 'evaluating', createdAt: '2025-02-04T14:00:00Z' },
  { id: 'TI005', deviceType: 'monitor', deviceName: 'LG 24" 1080p', condition: 'excellent', estimatedValue: 6000, customerId: 'C002', status: 'pending', createdAt: '2025-02-05T16:00:00Z' },
];

export const seedBuildGuides = [
  { id: 'BG001', name: '₹50K Gaming 1080p', description: 'Best value 1080p gaming build', budgetMin: 45000, budgetMax: 55000, partIds: ['cpu_5', 'mb_5', 'gpu_4', 'ram_4', 'st_5', 'psu_3', 'case_2'], useCase: 'gaming_1080p', createdAt: '2025-01-10T10:00:00Z' },
  { id: 'BG002', name: '₹75K 1440p Beast', description: 'Smooth 1440p gaming', budgetMin: 70000, budgetMax: 80000, partIds: ['cpu_1', 'mb_2', 'gpu_2', 'ram_1', 'st_1', 'psu_1', 'case_3'], useCase: 'gaming_1440p', createdAt: '2025-01-12T10:00:00Z' },
  { id: 'BG003', name: 'Streaming + Gaming', description: 'Encode and game without compromise', budgetMin: 90000, budgetMax: 110000, partIds: ['cpu_3', 'mb_1', 'gpu_2', 'ram_2', 'st_2', 'psu_2', 'case_1', 'cooler_2'], useCase: 'streaming', createdAt: '2025-01-15T10:00:00Z' },
  { id: 'BG004', name: 'SFF Compact Build', description: 'Small form factor portable PC', budgetMin: 60000, budgetMax: 75000, partIds: ['cpu_1', 'mb_4', 'gpu_1', 'ram_3', 'st_3', 'psu_4', 'case_4', 'cooler_5'], useCase: 'sff', createdAt: '2025-01-18T10:00:00Z' },
  { id: 'BG005', name: 'Max Value Budget', description: 'Every rupee counts', budgetMin: 35000, budgetMax: 45000, partIds: ['cpu_5', 'mb_3', 'gpu_4', 'ram_4', 'st_5', 'psu_3', 'case_2'], useCase: 'budget', createdAt: '2025-01-20T10:00:00Z' },
];

export const seedWarranties = [
  { id: 'WR001', orderId: 'ORD-1001', productId: 'P001', productName: 'Gaming PC Starter', type: 'standard', years: 1, expiresAt: '2026-02-01', customerId: 'C001', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'WR002', orderId: 'ORD-1002', productId: 'P002', productName: 'Gaming Laptop 15"', type: 'extended', years: 3, expiresAt: '2028-02-02', customerId: 'C002', createdAt: '2025-02-02T11:00:00Z' },
  { id: 'WR003', orderId: 'ORD-1003', productId: 'P008', productName: 'GPU RTX 4060', type: 'standard', years: 3, expiresAt: '2028-02-03', customerId: 'C003', createdAt: '2025-02-03T09:00:00Z' },
  { id: 'WR004', orderId: 'ORD-1004', productId: 'P005', productName: 'Monitor 24" 144Hz', type: 'extended', years: 2, expiresAt: '2027-02-04', customerId: 'C001', createdAt: '2025-02-04T14:00:00Z' },
  { id: 'WR005', orderId: 'ORD-1005', productId: 'P007', productName: 'SSD 512GB NVMe', type: 'standard', years: 5, expiresAt: '2030-02-05', customerId: 'C002', createdAt: '2025-02-05T16:00:00Z' },
];

export const seedExpertBookings = [
  { id: 'EB001', customerId: 'C001', customerName: 'Ravi K', slot: '2025-03-10T14:00:00Z', expertName: 'Arjun Nair', topic: 'Build recommendation', status: 'confirmed', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'EB002', customerId: 'C002', customerName: 'Priya S', slot: '2025-03-12T11:00:00Z', expertName: 'Kavitha Rajan', topic: 'High-end build', status: 'confirmed', createdAt: '2025-02-02T11:00:00Z' },
  { id: 'EB003', customerId: 'C003', customerName: 'Ahmed J', slot: '2025-03-15T16:00:00Z', expertName: 'Faizan Ahmed', topic: 'SFF build', status: 'pending', createdAt: '2025-02-03T09:00:00Z' },
  { id: 'EB004', customerId: 'C001', customerName: 'Ravi K', slot: '2025-02-20T10:00:00Z', expertName: 'Arjun Nair', topic: 'Upgrade path', status: 'completed', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'EB005', customerId: 'C002', customerName: 'Priya S', slot: '2025-03-18T09:00:00Z', expertName: 'Kavitha Rajan', topic: 'Streaming PC', status: 'confirmed', createdAt: '2025-02-05T16:00:00Z' },
];

export const seedLoyaltyPoints = [
  { id: 'LP001', customerId: 'C001', points: 150, reason: 'Order ORD-1001', orderId: 'ORD-1001', createdAt: '2025-02-01T10:00:00Z' },
  { id: 'LP002', customerId: 'C002', points: 320, reason: 'Order ORD-1002', orderId: 'ORD-1002', createdAt: '2025-02-02T11:00:00Z' },
  { id: 'LP003', customerId: 'C001', points: 50, reason: 'Signup bonus', orderId: null, createdAt: '2025-01-15T10:00:00Z' },
  { id: 'LP004', customerId: 'C003', points: 100, reason: 'Referral', orderId: null, createdAt: '2025-02-04T14:00:00Z' },
  { id: 'LP005', customerId: 'C002', points: 280, reason: 'Order ORD-1005', orderId: 'ORD-1005', createdAt: '2025-02-05T16:00:00Z' },
];

export const seedStockByStore = [
  { id: 'SB001', productId: 'P001', productName: 'Gaming PC Starter', storeId: 'ST001', storeName: 'TheValueStore ECR', qty: 12, reserved: 2, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'SB002', productId: 'P001', productName: 'Gaming PC Starter', storeId: 'ST002', storeName: 'TheValueStore T. Nagar', qty: 8, reserved: 0, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'SB003', productId: 'P008', productName: 'GPU RTX 4060', storeId: 'ST001', storeName: 'TheValueStore ECR', qty: 15, reserved: 3, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'SB004', productId: 'P002', productName: 'Gaming Laptop 15"', storeId: 'ST002', storeName: 'TheValueStore T. Nagar', qty: 6, reserved: 1, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'SB005', productId: 'P005', productName: 'Monitor 24" 144Hz', storeId: 'ST001', storeName: 'TheValueStore ECR', qty: 20, reserved: 0, createdAt: '2025-02-01T10:00:00Z' },
  { id: 'SB006', productId: 'P005', productName: 'Monitor 24" 144Hz', storeId: 'ST003', storeName: 'TheValueStore Mount Road', qty: 10, reserved: 0, createdAt: '2025-02-01T10:00:00Z' },
];

// Comparison presets (product IDs to compare) — 5 seed
export const seedComparisons = [
  { id: 'CP001', name: 'Mid-range GPUs', productIds: ['P008', 'gpu_4', 'gpu_6'], createdAt: '2025-02-01T10:00:00Z' },
  { id: 'CP002', name: 'Gaming CPUs', productIds: ['cpu_1', 'cpu_3', 'cpu_2'], createdAt: '2025-02-02T11:00:00Z' },
  { id: 'CP003', name: '1080p Gaming Laptops', productIds: ['P002', 'C0012', 'C0025'], createdAt: '2025-02-03T09:00:00Z' },
  { id: 'CP004', name: 'NVMe SSDs', productIds: ['st_1', 'st_2', 'st_3', 'st_4'], createdAt: '2025-02-04T14:00:00Z' },
  { id: 'CP005', name: 'Budget Monitors', productIds: ['P005', 'P010'], createdAt: '2025-02-05T16:00:00Z' },
];

// ─── IN-MEMORY STORE (mutations via API) ───
const store = {
  wishlist: [...seedWishlist],
  priceAlerts: [...seedPriceAlerts],
  preorders: [...seedPreorders],
  tradeins: [...seedTradeins],
  buildGuides: [...seedBuildGuides],
  warranties: [...seedWarranties],
  expertBookings: [...seedExpertBookings],
  loyaltyPoints: [...seedLoyaltyPoints],
  stockByStore: [...seedStockByStore],
  comparisons: [...seedComparisons],
};

const TYPES = ['wishlist', 'priceAlerts', 'preorders', 'tradeins', 'buildGuides', 'warranties', 'expertBookings', 'loyaltyPoints', 'stockByStore', 'comparisons'];

export function getStore() {
  return store;
}

export function list(type) {
  if (!TYPES.includes(type)) return null;
  return store[type] || [];
}

export function getById(type, id) {
  const arr = list(type);
  return arr ? arr.find((x) => x.id === id) : null;
}

export function create(type, data) {
  if (!TYPES.includes(type)) return null;
  const prefix = { wishlist: 'WL', priceAlerts: 'PA', preorders: 'PO', tradeins: 'TI', buildGuides: 'BG', warranties: 'WR', expertBookings: 'EB', loyaltyPoints: 'LP', stockByStore: 'SB', comparisons: 'CP' }[type] || 'SF';
  const id = data.id || `${prefix}-${uid()}`;
  const item = { ...data, id, createdAt: data.createdAt || new Date().toISOString() };
  store[type].push(item);
  return item;
}

export function update(type, id, data) {
  const arr = list(type);
  if (!arr) return null;
  const idx = arr.findIndex((x) => x.id === id);
  if (idx === -1) return null;
  store[type][idx] = { ...arr[idx], ...data, id };
  return store[type][idx];
}

export function remove(type, id) {
  const arr = list(type);
  if (!arr) return false;
  const idx = arr.findIndex((x) => x.id === id);
  if (idx === -1) return false;
  store[type].splice(idx, 1);
  return true;
}

export function resetToSeed() {
  store.wishlist = [...seedWishlist];
  store.priceAlerts = [...seedPriceAlerts];
  store.preorders = [...seedPreorders];
  store.tradeins = [...seedTradeins];
  store.buildGuides = [...seedBuildGuides];
  store.warranties = [...seedWarranties];
  store.expertBookings = [...seedExpertBookings];
  store.loyaltyPoints = [...seedLoyaltyPoints];
  store.stockByStore = [...seedStockByStore];
  store.comparisons = [...seedComparisons];
}
