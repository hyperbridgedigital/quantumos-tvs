'use client';
import { useState, useEffect, memo } from 'react';
import { useKynetra } from '@/lib/kynetra/useKynetra';

const INSIGHT_ICONS = {
  revenue: '💰',
  stock_alert: '⚠️',
  anomaly: '🔴',
  opportunity: '🎯',
  trend: '📈',
  crm: '👥',
  delivery: '🛵',
  default: '💡',
};

const PRIORITY_COLORS = {
  critical: { bg: 'rgba(248, 113, 113, 0.1)', border: 'rgba(248, 113, 113, 0.2)', text: '#F87171' },
  high: { bg: 'rgba(251, 191, 36, 0.1)', border: 'rgba(251, 191, 36, 0.2)', text: '#FBBF24' },
  medium: { bg: 'rgba(61, 216, 245, 0.1)', border: 'rgba(61, 216, 245, 0.2)', text: '#3DD8F5' },
  low: { bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.15)', text: '#34D399' },
};

function KynetraInsights({ className = '' }) {
  const [insights, setInsights] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const { getInsights } = useKynetra();

  useEffect(() => {
    loadInsights();
    const interval = setInterval(loadInsights, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (insights.length <= 1 || isExpanded) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % insights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [insights.length, isExpanded]);

  async function loadInsights() {
    const data = await getInsights('all');
    if (data?.insights?.length) {
      setInsights(data.insights);
    } else {
      setInsights(getDefaultInsights());
    }
  }

  function getDefaultInsights() {
    return [
      {
        type: 'revenue',
        title: 'Revenue Up 12%',
        description: "Today's revenue ₹47,250 — 12% above Tuesday average. Biryani combos driving growth.",
        priority: 'medium',
        action: 'View Report',
      },
      {
        type: 'stock_alert',
        title: '3 Items Low Stock',
        description: 'Basmati Rice, Chicken, and Saffron below reorder level. Auto-reorder suggested.',
        priority: 'critical',
        action: 'Reorder Now',
      },
      {
        type: 'opportunity',
        title: 'Combo Opportunity',
        description: '68% of Biryani orders include Raita. Bundle pricing could increase AOV by 15%.',
        priority: 'low',
        action: 'Create Combo',
      },
      {
        type: 'trend',
        title: 'Peak Hour Shift',
        description: 'Dinner peak shifted 30min earlier this week (6:30 PM). Consider adjusting prep schedule.',
        priority: 'medium',
      },
    ];
  }

  const current = insights[activeIndex];
  if (!current) return null;

  const priorityStyle = PRIORITY_COLORS[current.priority] || PRIORITY_COLORS.medium;

  return (
    <div className={className}>
      {/* Collapsed: Single scrolling insight */}
      {!isExpanded && (
        <div
          onClick={() => setIsExpanded(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 12,
            background: priorityStyle.bg,
            border: `1px solid ${priorityStyle.border}`,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          <span style={{ fontSize: 18 }}>{INSIGHT_ICONS[current.type] || INSIGHT_ICONS.default}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: priorityStyle.text }}>
                {current.title}
              </span>
              <span
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(61, 216, 245, 0.1)',
                  color: '#3DD8F5',
                  fontWeight: 700,
                  letterSpacing: '.05em',
                }}
              >
                KYNETRA AI
              </span>
            </div>
            <div
              style={{
                fontSize: 11,
                color: '#94A3B8',
                marginTop: 2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {current.description}
            </div>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 4 }}>
            {insights.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: i === activeIndex ? '#3DD8F5' : 'rgba(255,255,255,0.15)',
                  transition: 'background 0.3s',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Expanded: All insights */}
      {isExpanded && (
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '.08em',
                }}
              >
                KYNETRA INSIGHTS
              </span>
              <span
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(52, 211, 153, 0.1)',
                  color: '#34D399',
                  fontWeight: 700,
                }}
              >
                LIVE
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: 'none',
                color: '#64748B',
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              Collapse
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 1 }}>
            {insights.map((insight, i) => {
              const ps = PRIORITY_COLORS[insight.priority] || PRIORITY_COLORS.medium;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '12px 16px',
                    background: ps.bg,
                    borderLeft: `2px solid ${ps.border}`,
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ fontSize: 16, marginTop: 1 }}>
                    {INSIGHT_ICONS[insight.type] || INSIGHT_ICONS.default}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: ps.text, marginBottom: 2 }}>
                      {insight.title}
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>
                      {insight.description}
                    </div>
                    {insight.action && (
                      <button
                        style={{
                          marginTop: 6,
                          fontSize: 10,
                          fontWeight: 700,
                          color: '#3DD8F5',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          cursor: 'pointer',
                          letterSpacing: '.03em',
                        }}
                      >
                        {insight.action} →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(KynetraInsights);
