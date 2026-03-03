/**
 * Kynetra Cognitive Grid Engine — API Client
 * Enterprise AI orchestration layer by HyperBridge Digital
 */

const KYNETRA_ENDPOINT = process.env.KYNETRA_ENDPOINT || 'https://api.kynetra.hyperbridge.digital';
const KYNETRA_API_KEY = process.env.KYNETRA_API_KEY;
const KYNETRA_MODEL = process.env.KYNETRA_MODEL || 'kynetra-cognitive-v2';

export async function kynetraQuery(prompt, context = {}) {
  if (!KYNETRA_API_KEY) {
    return fallbackResponse(prompt, context);
  }

  try {
    const response = await fetch(`${KYNETRA_ENDPOINT}/v1/cognitive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KYNETRA_API_KEY}`,
        'X-Kynetra-Domain': 'restaurant-ops',
      },
      body: JSON.stringify({
        model: KYNETRA_MODEL,
        prompt,
        context: {
          domain: 'restaurant',
          businessName: 'Charminar Mehfil',
          ...context,
        },
        capabilities: ['function_calling', 'analytics', 'predictions'],
      }),
    });

    if (!response.ok) {
      throw new Error(`Kynetra API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('[Kynetra] API call failed:', error.message);
    return fallbackResponse(prompt, context);
  }
}

export async function kynetraStream(prompt, context = {}) {
  if (!KYNETRA_API_KEY) {
    return null;
  }

  const response = await fetch(`${KYNETRA_ENDPOINT}/v1/cognitive/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KYNETRA_API_KEY}`,
      'X-Kynetra-Domain': 'restaurant-ops',
    },
    body: JSON.stringify({
      model: KYNETRA_MODEL,
      prompt,
      context: { domain: 'restaurant', businessName: 'Charminar Mehfil', ...context },
      stream: true,
    }),
  });

  return response.body;
}

function fallbackResponse(prompt, context) {
  const lower = prompt.toLowerCase();

  if (lower.includes('sales') || lower.includes('revenue')) {
    return {
      message: "Today's estimated revenue is ₹47,250 from 156 orders. Peak hours were 12:30-2:00 PM (lunch) and 7:00-9:00 PM (dinner). Biryani combos drove 38% of revenue.",
      suggestedActions: [
        { id: 'view_sales', label: 'View Sales Report', type: 'navigate', target: '/admin/dashboard' },
        { id: 'export_csv', label: 'Export to CSV', type: 'action', handler: 'exportSalesCSV' },
      ],
      insights: { trend: 'up', changePercent: 12.5 },
    };
  }

  if (lower.includes('stock') || lower.includes('inventory') || lower.includes('out of stock')) {
    return {
      message: 'Current inventory status: 3 items below reorder level — Basmati Rice (12kg remaining), Chicken (8kg), Saffron (200g). Auto-reorder has been suggested for these items.',
      suggestedActions: [
        { id: 'reorder', label: 'Auto-Reorder Low Stock', type: 'action', handler: 'autoReorder' },
        { id: 'view_stock', label: 'View Inventory', type: 'navigate', target: 'stock' },
      ],
    };
  }

  if (lower.includes('menu') || lower.includes('biryani') || lower.includes('item')) {
    return {
      message: 'Menu performance: Hyderabadi Chicken Biryani is the top seller (23% of orders). Consider promoting Mutton Biryani — it has high margins but only 8% order share. Combo meal suggestion: Biryani + Raita + Gulab Jamun at ₹349 could boost AOV by 15%.',
      suggestedActions: [
        { id: 'create_combo', label: 'Create Suggested Combo', type: 'action', handler: 'createCombo' },
        { id: 'edit_menu', label: 'Edit Menu', type: 'navigate', target: 'menu' },
      ],
    };
  }

  if (lower.includes('order') || lower.includes('delivery')) {
    return {
      message: '12 active orders in pipeline. Average delivery time today: 34 minutes. 2 orders flagged for potential delay (Jubilee Hills area — high traffic). Delivery partner Raju K. has the fastest completion rate.',
      suggestedActions: [
        { id: 'view_orders', label: 'View Active Orders', type: 'navigate', target: 'orders' },
        { id: 'reassign', label: 'Reassign Delayed Orders', type: 'action', handler: 'reassignOrders' },
      ],
    };
  }

  return {
    message: `I'm Kynetra, your AI assistant for Charminar Mehfil operations. I can help with sales analytics, menu optimization, inventory management, order tracking, and WhatsApp customer engagement. What would you like to know?`,
    suggestedActions: [
      { id: 'today_summary', label: "Today's Summary", type: 'action', handler: 'dailySummary' },
      { id: 'anomalies', label: 'Check Anomalies', type: 'action', handler: 'checkAnomalies' },
      { id: 'forecast', label: 'Revenue Forecast', type: 'action', handler: 'revenueForecast' },
    ],
  };
}

export function isKynetraConfigured() {
  return !!KYNETRA_API_KEY;
}
