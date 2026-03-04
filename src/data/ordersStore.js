/**
 * In-memory orders store for API and Kynetra order lookup.
 * POST /api/orders pushes here; GET /api/orders/[id] and Kynetra use it.
 */
import { sampleOrders } from '@/data/orders';

const store = [...(sampleOrders || [])];

export function getAllOrders() {
  return [...store];
}

export function getOrderById(id) {
  const norm = (s) => String(s || '').toUpperCase().trim();
  const want = norm(id);
  return store.find((o) => norm(o.id) === want) || null;
}

export function addOrder(order) {
  const o = {
    id: order.id || 'ORD-' + Date.now().toString().slice(-6),
    status: order.status || 'confirmed',
    placed: order.placed || new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    placedDate: order.placedDate || new Date().toISOString(),
    ...order,
  };
  store.unshift(o);
  return o;
}

export function updateOrderStatus(id, status) {
  const i = store.findIndex((o) => String(o.id) === String(id));
  if (i === -1) return null;
  store[i] = { ...store[i], status };
  return store[i];
}
