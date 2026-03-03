'use client';
import { useState, useEffect } from 'react';
import { useKynetra } from '@/lib/kynetra/useKynetra';
import KynetraActionCard from '@/components/admin/KynetraActionCard';

const STAT_CARDS = [
  { label: "Today's Revenue", value: '₹47,250', change: '+12%', icon: '💰', color: '#34D399' },
  { label: 'Active Orders', value: '12', change: '+3', icon: '📦', color: '#3DD8F5' },
  { label: 'Menu Items', value: '48', change: '2 new', icon: '🍽️', color: '#FBBF24' },
  { label: 'Customers Today', value: '156', change: '+18%', icon: '👥', color: '#A855F7' },
];

const QUICK_ACTIONS = [
  { id: 'daily_summary', label: "Today's Full Summary", icon: '📊', handler: 'daily_summary' },
  { id: 'check_anomalies', label: 'Run Anomaly Check', icon: '🔍', handler: 'check_anomalies' },
  { id: 'revenue_forecast', label: '7-Day Forecast', icon: '📈', handler: 'revenue_forecast' },
  { id: 'auto_reorder', label: 'Smart Reorder', icon: '📦', handler: 'auto_reorder' },
];

export default function AdminDashboardPage() {
  const { executeAction } = useKynetra();

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Fraunces', Georgia, serif",
            marginBottom: 4,
          }}
        >
          Command Center
        </h1>
        <p style={{ fontSize: 13, color: '#64748B' }}>
          AI-powered insights for Charminar Mehfil operations
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: 20,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{stat.icon}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: stat.color,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: `${stat.color}15`,
                }}
              >
                {stat.change}
              </span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#F0F4F8', marginBottom: 4, fontFamily: "'Outfit', sans-serif" }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Kynetra Quick Actions */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span style={{ fontSize: 14 }}>🤖</span>
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Kynetra AI Actions
          </h2>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 10,
          }}
        >
          {QUICK_ACTIONS.map((action) => (
            <KynetraActionCard key={action.id} action={action} onExecute={executeAction} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: '#94A3B8', marginBottom: 14 }}>Recent Activity</h2>
        <div
          style={{
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            overflow: 'hidden',
          }}
        >
          {[
            { time: '2 min ago', event: 'New order #1847 — Chicken Biryani x2, Raita x2', type: 'order', color: '#3DD8F5' },
            { time: '8 min ago', event: 'Delivery completed — Order #1845 to Banjara Hills', type: 'delivery', color: '#34D399' },
            { time: '15 min ago', event: 'Kynetra flagged: Saffron stock critically low (200g)', type: 'alert', color: '#FBBF24' },
            { time: '22 min ago', event: 'WhatsApp: Customer inquiry about Dum Biryani availability', type: 'whatsapp', color: '#25D366' },
            { time: '35 min ago', event: 'Menu update: Mutton Biryani price adjusted to ₹449', type: 'menu', color: '#A855F7' },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 12, color: '#94A3B8' }}>{item.event}</span>
              <span style={{ fontSize: 10, color: '#475569', whiteSpace: 'nowrap' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
