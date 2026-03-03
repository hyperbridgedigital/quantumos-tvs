import { NextResponse } from 'next/server';
import { kynetraQuery } from '@/lib/kynetra/client';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const result = await kynetraQuery(
      `Generate ${type} insights for the restaurant dashboard. Include revenue status, stock alerts, and operational insights.`,
      { purpose: 'dashboard_insights', type }
    );

    const insights = result.insights || generateDefaultInsights(type);

    return NextResponse.json({
      insights,
      generated_at: new Date().toISOString(),
      source: result.insights ? 'kynetra' : 'local',
    });
  } catch (error) {
    console.error('[Kynetra Insights]', error);
    return NextResponse.json({
      insights: generateDefaultInsights('all'),
      generated_at: new Date().toISOString(),
      source: 'fallback',
    });
  }
}

function generateDefaultInsights(type) {
  const all = [
    {
      type: 'revenue',
      title: 'Revenue Update',
      description: "Today's estimated revenue: ₹47,250 from 156 orders. 12% above average for this day of the week.",
      priority: 'medium',
      action: 'View Full Report',
    },
    {
      type: 'stock_alert',
      title: 'Low Stock Warning',
      description: '3 items below reorder level: Basmati Rice (12kg), Chicken (8kg), Saffron (200g). Auto-reorder recommended.',
      priority: 'critical',
      action: 'Reorder Now',
    },
    {
      type: 'opportunity',
      title: 'Menu Optimization',
      description: 'Biryani + Raita bundle could increase average order value by ₹45. 68% of Biryani orders already include Raita.',
      priority: 'low',
      action: 'Create Combo',
    },
    {
      type: 'anomaly',
      title: 'Order Pattern Shift',
      description: 'Dinner peak shifted 30 min earlier this week. 15% more orders between 6:30-7:00 PM. Adjust prep schedule.',
      priority: 'medium',
    },
    {
      type: 'delivery',
      title: 'Delivery Performance',
      description: 'Average delivery time: 34 min (target: 30 min). Jubilee Hills zone consistently 10 min over. Consider route optimization.',
      priority: 'high',
      action: 'View Routes',
    },
  ];

  if (type === 'all') return all;
  return all.filter((i) => i.type === type);
}
