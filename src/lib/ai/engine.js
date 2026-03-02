/**
 * AI Engine — Anomaly Detection, Fraud Scoring, Recommendations, Forecasting
 * All algorithms run client-side for demo; production uses Supabase Edge Functions + OpenAI
 */

// ═══ ANOMALY DETECTION ═══
export function detectAnomalies(orders, stock, stores) {
  const anomalies = [];
  const now = Date.now();

  // Revenue anomaly: sudden drops
  if (orders.length > 5) {
    const recent = orders.slice(0, 5);
    const older = orders.slice(5, 10);
    const recentAvg = recent.reduce((a, o) => a + o.total, 0) / recent.length;
    const olderAvg = older.length ? older.reduce((a, o) => a + o.total, 0) / older.length : recentAvg;
    if (olderAvg > 0 && recentAvg / olderAvg < 0.6) {
      anomalies.push({ type: 'revenue_drop', severity: 'high', description: 'Revenue dropped ' + Math.round((1 - recentAvg / olderAvg) * 100) + '% vs previous period', data: { recentAvg, olderAvg }, created_at: new Date().toISOString() });
    }
  }

  // Stock anomaly: critically low items
  const critical = stock.filter(s => s.qty <= s.reorder * 0.3 && s.qty > 0);
  critical.forEach(s => {
    anomalies.push({ type: 'stock_anomaly', severity: 'critical', description: s.name + ' at ' + Math.round(s.qty / s.reorder * 100) + '% of reorder level', data: { sku: s.sku, qty: s.qty, reorder: s.reorder }, created_at: new Date().toISOString() });
  });

  // Store load anomaly
  stores.filter(s => s.status === 'active').forEach(s => {
    const loadPct = s.load / s.maxOrders;
    if (loadPct > 0.9) {
      anomalies.push({ type: 'store_overload', severity: 'high', description: s.name + ' at ' + Math.round(loadPct * 100) + '% capacity', data: { store: s.id, load: s.load, max: s.maxOrders }, created_at: new Date().toISOString() });
    }
  });

  // Unusual order pattern
  const cancelRate = orders.filter(o => o.status === 'cancelled').length / Math.max(orders.length, 1);
  if (cancelRate > 0.15) {
    anomalies.push({ type: 'unusual_pattern', severity: 'medium', description: 'Cancellation rate at ' + Math.round(cancelRate * 100) + '% (threshold: 15%)', data: { cancelRate }, created_at: new Date().toISOString() });
  }

  return anomalies;
}

// ═══ FRAUD DETECTION ═══
export function scoreFraud(order, customerHistory, recentOrders) {
  let riskScore = 0;
  const signals = [];

  // Velocity check: too many orders in short time
  const last30min = recentOrders.filter(o => o.customer === order.customer).length;
  if (last30min > 3) {
    riskScore += 0.3;
    signals.push({ type: 'velocity', detail: last30min + ' orders in 30min', weight: 0.3 });
  }

  // High value first order
  if (!customerHistory && order.total > 2000) {
    riskScore += 0.2;
    signals.push({ type: 'high_value_new', detail: 'First order over ₹2000', weight: 0.2 });
  }

  // Address mismatch (simplified: different address each order)
  if (customerHistory && customerHistory.orders > 3 && order.address && !order.address.includes('Unknown')) {
    riskScore += 0.15;
    signals.push({ type: 'address_mismatch', detail: 'Unusual delivery area', weight: 0.15 });
  }

  // COD on high value
  if (order.paymentMethod === 'cod' && order.total > 1500) {
    riskScore += 0.1;
    signals.push({ type: 'payment_pattern', detail: 'COD on high-value order', weight: 0.1 });
  }

  const action = riskScore >= 0.6 ? 'blocked' : riskScore >= 0.3 ? 'flagged' : 'approved';
  return { riskScore: Math.min(riskScore, 1), signals, action };
}

// ═══ RECOMMENDATION ENGINE ═══
export function getRecommendations(customer, products, orderHistory) {
  // Collaborative filtering (simplified)
  const ordered = new Set(orderHistory.flatMap(o => o.items?.map(i => i.name) || []));
  const scored = products.map(p => {
    let score = 0;

    // Previously ordered → high affinity
    if (ordered.has(p.name)) score += 0.5;

    // Same category as ordered items
    if (p.category && orderHistory.some(o => o.items?.some(i => i.category === p.category))) score += 0.3;

    // Price affinity (within customer's avg range)
    if (customer?.avg_order_value) {
      const pctDiff = Math.abs(p.price - customer.avg_order_value / 3) / (customer.avg_order_value / 3);
      if (pctDiff < 0.3) score += 0.2;
    }

    // Bestseller boost
    if (p.tag === '⭐ Bestseller' || p.tag === '🔥 Popular') score += 0.15;

    // Time-based: comfort food in evening
    const hour = new Date().getHours();
    if (hour >= 18 && (p.category === 'biryani' || p.category === 'main')) score += 0.1;

    return { ...p, score };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, 6);
}

// ═══ DEMAND FORECASTING ═══
export function forecastDemand(dailyRollups, daysAhead = 7) {
  if (dailyRollups.length < 7) return [];
  // Simple moving average with day-of-week weighting
  const byDow = {};
  dailyRollups.forEach(d => {
    const dow = new Date(d.date).getDay();
    if (!byDow[dow]) byDow[dow] = [];
    byDow[dow].push(d.total_orders);
  });

  const forecast = [];
  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(Date.now() + i * 86400000);
    const dow = date.getDay();
    const history = byDow[dow] || dailyRollups.map(d => d.total_orders);
    const avg = history.reduce((a, v) => a + v, 0) / history.length;
    const trend = dailyRollups.length > 14 ? (dailyRollups.slice(0, 7).reduce((a, d) => a + d.total_orders, 0) / 7) / (dailyRollups.slice(7, 14).reduce((a, d) => a + d.total_orders, 0) / 7) : 1;
    forecast.push({ date: date.toISOString().slice(0, 10), predicted_orders: Math.round(avg * trend), confidence: Math.min(0.95, 0.7 + dailyRollups.length * 0.01) });
  }
  return forecast;
}

// ═══ SENTIMENT ANALYSIS (simple keyword-based) ═══
export function analyzeSentiment(text) {
  const positive = ['great','excellent','amazing','love','best','perfect','delicious','fantastic','wonderful','quick'];
  const negative = ['bad','terrible','worst','hate','awful','disgusting','slow','cold','wrong','missing'];
  const words = text.toLowerCase().split(/\s+/);
  const posCount = words.filter(w => positive.includes(w)).length;
  const negCount = words.filter(w => negative.includes(w)).length;
  const total = posCount + negCount || 1;
  const score = (posCount - negCount) / total;
  return { score, sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral', confidence: Math.min(Math.abs(score) + 0.3, 1) };
}

// ═══ ADMIN INTELLIGENCE ═══
export function getAdminInsights(orders, stock, customers, stores) {
  const insights = [];

  // Revenue insight
  const totalRev = orders.reduce((a, o) => a + o.total, 0);
  insights.push({ type: 'revenue', icon: '💰', title: 'Revenue Performance', description: 'Total revenue: ₹' + (totalRev / 100).toLocaleString() + ' from ' + orders.length + ' orders', priority: 'high' });

  // Stock alerts
  const lowStock = stock.filter(s => s.qty <= s.reorder);
  if (lowStock.length > 0) {
    insights.push({ type: 'stock_alert', icon: '⚠️', title: 'Stock Alert', description: lowStock.length + ' items below reorder level: ' + lowStock.map(s => s.name).join(', '), priority: 'critical', action: 'Go to Stock → Reorder' });
  }

  // Customer insight
  const platinum = customers.filter(c => c.tier === 'Platinum');
  insights.push({ type: 'crm', icon: '👑', title: 'VIP Customers', description: platinum.length + ' Platinum customers contributing ' + Math.round(platinum.reduce((a, c) => a + c.ltv, 0) / Math.max(totalRev / 100, 1) * 100) + '% of revenue', priority: 'medium' });

  // Operational efficiency
  const avgLoad = stores.filter(s => s.status === 'active').reduce((a, s) => a + s.load / s.maxOrders, 0) / Math.max(stores.filter(s => s.status === 'active').length, 1);
  insights.push({ type: 'operations', icon: '⚡', title: 'Store Utilization', description: Math.round(avgLoad * 100) + '% average capacity across ' + stores.filter(s => s.status === 'active').length + ' stores', priority: avgLoad > 0.8 ? 'critical' : 'low' });

  return insights.sort((a, b) => { const p = { critical: 0, high: 1, medium: 2, low: 3 }; return (p[a.priority] || 3) - (p[b.priority] || 3); });
}
