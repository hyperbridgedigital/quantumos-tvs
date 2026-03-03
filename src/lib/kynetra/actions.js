/**
 * Kynetra Action Definitions
 * Executable actions that Kynetra AI can suggest and trigger
 */

export const KYNETRA_ACTIONS = {
  menu_crud: {
    id: 'menu_crud',
    label: 'Menu Management',
    capabilities: ['add_item', 'update_item', 'delete_item', 'toggle_availability', 'update_price', 'create_combo'],
    description: 'Create, update, and manage menu items',
  },
  order_mgmt: {
    id: 'order_mgmt',
    label: 'Order Management',
    capabilities: ['view_orders', 'update_status', 'assign_delivery', 'cancel_order', 'refund_order', 'reassign_orders'],
    description: 'Track and manage customer orders',
  },
  analytics: {
    id: 'analytics',
    label: 'Analytics & Reports',
    capabilities: ['daily_summary', 'revenue_forecast', 'peak_hours', 'export_csv', 'check_anomalies', 'product_performance'],
    description: 'Sales analytics, predictions, and reporting',
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory Control',
    capabilities: ['check_stock', 'auto_reorder', 'waste_report', 'demand_forecast', 'supplier_alerts'],
    description: 'Stock management and demand forecasting',
  },
  whatsapp: {
    id: 'whatsapp',
    label: 'WhatsApp Operations',
    capabilities: ['draft_reply', 'send_template', 'campaign_blast', 'eta_update', 'upsell_suggest'],
    description: 'AI-powered WhatsApp customer engagement',
  },
  crm: {
    id: 'crm',
    label: 'Customer Relations',
    capabilities: ['segment_customers', 'loyalty_status', 'at_risk_alert', 'personalized_offer', 'feedback_analysis'],
    description: 'Customer segmentation and engagement',
  },
};

export function resolveAction(actionId) {
  for (const group of Object.values(KYNETRA_ACTIONS)) {
    if (group.capabilities.includes(actionId)) {
      return { group: group.id, action: actionId };
    }
  }
  return null;
}

export function getActionHandler(actionId) {
  const handlers = {
    daily_summary: () => ({
      type: 'insight',
      title: "Today's Summary",
      data: {
        orders: 156,
        revenue: 47250,
        avgOrderValue: 303,
        topItem: 'Hyderabadi Chicken Biryani',
        peakHour: '1:00 PM - 2:00 PM',
        deliveryAvg: '34 min',
      },
    }),
    check_anomalies: () => ({
      type: 'alert',
      title: 'Anomaly Report',
      items: [
        { severity: 'warning', message: 'Order volume 18% below Tuesday average', time: '2:00 PM' },
        { severity: 'info', message: 'New peak detected: Milkshake orders up 45%', time: '3:30 PM' },
      ],
    }),
    revenue_forecast: () => ({
      type: 'forecast',
      title: '7-Day Revenue Forecast',
      predictions: [
        { day: 'Wed', predicted: 52000, confidence: 0.87 },
        { day: 'Thu', predicted: 48500, confidence: 0.85 },
        { day: 'Fri', predicted: 61000, confidence: 0.82 },
        { day: 'Sat', predicted: 73000, confidence: 0.80 },
        { day: 'Sun', predicted: 68000, confidence: 0.78 },
      ],
    }),
    auto_reorder: () => ({
      type: 'action_result',
      title: 'Auto-Reorder Initiated',
      message: '3 purchase orders created for low-stock items. Supplier notifications sent.',
    }),
    create_combo: () => ({
      type: 'action_result',
      title: 'Combo Created',
      message: 'Biryani Feast combo (Biryani + Raita + Gulab Jamun) created at ₹349. Published to menu.',
    }),
    reassign_orders: () => ({
      type: 'action_result',
      title: 'Orders Reassigned',
      message: '2 delayed orders reassigned to available delivery partners. ETAs updated.',
    }),
  };

  return handlers[actionId] || (() => ({ type: 'info', message: `Action "${actionId}" acknowledged. Processing...` }));
}
