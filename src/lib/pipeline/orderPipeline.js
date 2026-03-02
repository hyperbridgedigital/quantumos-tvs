// Order → CRM Pipeline — v11.1.0 (Idempotent + Auditable)
import { crmSyncLedger } from '@/data/crmSyncLedger';

const processedOrders = new Set(crmSyncLedger.map(l => l.order_id));
const retryQueue = [];
const eventBus = [];

function hashAction(order, fields) {
  return `${order.id}_${fields.join('_')}_${order.total}_${order.status}`;
}

function computeTier(ltv) {
  if (ltv > 12000) return 'Platinum';
  if (ltv > 6000) return 'Gold';
  if (ltv > 2500) return 'Silver';
  return 'Bronze';
}

function computeTags(customer) {
  const tags = [];
  if (customer.orders <= 2) tags.push('new');
  if (customer.orders > 2) tags.push('returning');
  if (customer.ltv > 10000) tags.push('vip');
  const lastDate = customer.lastOrderDate ? new Date(customer.lastOrderDate) : null;
  const now = new Date();
  if (lastDate) {
    const daysSince = Math.floor((now - lastDate) / 86400000);
    if (daysSince > 30) tags.push('dormant');
    else if (daysSince > 14) tags.push('at-risk');
  }
  if (customer.orders > 10) tags.push('frequent_buyer');
  return [...new Set(tags)];
}

function detectMood(customer) {
  const freq = customer.orders;
  const ltv = customer.ltv;
  const avgVal = freq > 0 ? ltv / freq : 0;
  if (freq > 20 && avgVal > 400) return { mood_label: '🤩', mood_reason: 'High frequency + high value' };
  if (freq > 10) return { mood_label: '😊', mood_reason: 'Frequent orderer' };
  if (avgVal > 600) return { mood_label: '😋', mood_reason: 'Premium spender' };
  if (freq <= 2) return { mood_label: '🤔', mood_reason: 'New — needs nurturing' };
  return { mood_label: '😌', mood_reason: 'Regular customer' };
}

export function logEvent(type, payload) {
  eventBus.push({ type, payload, timestamp: new Date().toISOString() });
}

export function reconcileCRMFromOrder(order, customers, setCustomers) {
  const key = order.phone;
  if (!key) return;
  
  setCustomers(prev => {
    const existing = prev.find(c => c.phone === key);
    if (existing) {
      // Check idempotency
      if (processedOrders.has(order.id)) return prev;
      processedOrders.add(order.id);
      
      return prev.map(c => {
        if (c.phone !== key) return c;
        const newOrders = c.orders + (order.status === 'cancelled' ? 0 : 1);
        const newLtv = c.ltv + (order.status === 'cancelled' ? 0 : order.total);
        const updated = {
          ...c,
          orders: newOrders,
          ltv: newLtv,
          tier: computeTier(newLtv),
          lastOrder: 'just now',
          lastOrderDate: new Date().toISOString(),
          preferred_store: order.store || c.preferred_store,
          preferred_items: order.items ? [...new Set([...(c.preferred_items||[]), ...order.items.map(i=>i.name)])].slice(-5) : c.preferred_items,
        };
        updated.tags = computeTags(updated);
        const { mood_label, mood_reason } = detectMood(updated);
        updated.mood = mood_label;
        updated.mood_reason = mood_reason;
        
        logEvent('customer_updated', { customer_id: c.id, order_id: order.id, fields: ['orders','ltv','tier','lastOrder'] });
        return updated;
      });
    } else {
      processedOrders.add(order.id);
      const newCust = {
        id: 'C' + Date.now().toString(36),
        name: order.customer || 'Customer',
        phone: key,
        email: '',
        orders: order.status === 'cancelled' ? 0 : 1,
        ltv: order.status === 'cancelled' ? 0 : order.total,
        tier: 'Bronze',
        lastOrder: 'just now',
        lastOrderDate: new Date().toISOString(),
        mood: '🤔',
        joined: new Date().toISOString().slice(0, 7),
        tags: ['new'],
        preferred_store: order.store,
        preferred_items: order.items ? order.items.map(i=>i.name).slice(0,3) : [],
        consent_status: 'opted_in',
        area: '',
      };
      logEvent('customer_created', { customer_id: newCust.id, order_id: order.id });
      return [...prev, newCust];
    }
  });
}

export function updateRemarketingFromOrder(order, remarketingRecords, setRemarketingRecords) {
  if (!order.phone) return;
  setRemarketingRecords(prev => {
    const existing = prev.find(r => r.phone === order.phone);
    if (existing) {
      return prev.map(r => {
        if (r.phone !== order.phone) return r;
        const newCount = r.order_count + (order.status === 'cancelled' ? 0 : 1);
        const newLtv = r.ltv + (order.status === 'cancelled' ? 0 : order.total);
        return { ...r, ltv: newLtv, order_count: newCount, avg_order_value: newCount > 0 ? Math.round(newLtv/newCount) : 0, last_order_date: new Date().toISOString(), tier: computeTier(newLtv) };
      });
    }
    return [...prev, {
      customer_id: 'RM-' + Date.now().toString(36), phone: order.phone, email: '', name: order.customer,
      ltv: order.total, tier: 'Bronze', tags: ['new'], last_order_date: new Date().toISOString(),
      order_count: 1, avg_order_value: order.total, preferred_items: order.items?.map(i=>i.name)||[],
      preferred_store: order.store, consent_status: 'opted_in', consent_log: [], platform_ids: {}, segments: ['new_customer'],
    }];
  });
}

export function onOrderCreated(order, customers, setCustomers, remarketingRecords, setRemarketingRecords) {
  try {
    reconcileCRMFromOrder(order, customers, setCustomers);
    updateRemarketingFromOrder(order, remarketingRecords, setRemarketingRecords);
    logEvent('order_placed', { order_id: order.id, store: order.store, total: order.total });
  } catch (e) {
    retryQueue.push({ order, error: e.message, retries: 0, timestamp: new Date().toISOString() });
    logEvent('pipeline_error', { order_id: order.id, error: e.message });
  }
}

export function onOrderStatusChanged(order, prevStatus) {
  logEvent('order_status_changed', { order_id: order.id, from: prevStatus, to: order.status });
}

export function getRetryQueue() { return retryQueue; }
export function getEventBus() { return eventBus; }
export function isProcessed(orderId) { return processedOrders.has(orderId); }
