'use client';
import { useState } from 'react';

const MODES = [
  {
    id: 'dine-in',
    label: 'Dine-In',
    icon: '🍽️',
    description: 'Full restaurant dining experience with table management and QR ordering',
    features: ['Table Management', 'QR Code Ordering', 'Waiter Alerts', 'Bill Splitting'],
  },
  {
    id: 'delivery',
    label: 'Delivery Only',
    icon: '🛵',
    description: 'Online ordering with delivery partner integration and live tracking',
    features: ['Delivery Zones', 'Partner Assignment', 'Live Tracking', 'ETA Updates'],
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    icon: '⚡',
    description: 'Both dine-in and delivery modes active simultaneously',
    features: ['All Dine-In Features', 'All Delivery Features', 'Load Balancing', 'Priority Queue'],
  },
  {
    id: 'takeaway',
    label: 'Takeaway',
    icon: '📦',
    description: 'Counter pickup with SMS/WhatsApp notifications',
    features: ['Order Queue', 'Ready Alerts', 'WhatsApp Notifications', 'Counter Display'],
  },
];

export default function ModeSwitcherPage() {
  const [activeMode, setActiveMode] = useState('hybrid');

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F0F4F8', fontFamily: "'Fraunces', Georgia, serif", marginBottom: 4 }}>
        Operating Mode
      </h1>
      <p style={{ fontSize: 12, color: '#64748B', marginBottom: 24 }}>
        Switch between operating modes for Charminar Mehfil
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {MODES.map((mode) => {
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              style={{
                padding: 20,
                borderRadius: 14,
                border: `1px solid ${isActive ? 'rgba(61, 216, 245, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                background: isActive ? 'rgba(61, 216, 245, 0.06)' : 'rgba(255,255,255,0.02)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{mode.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: isActive ? '#3DD8F5' : '#E2E8F0' }}>
                    {mode.label}
                  </div>
                  {isActive && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#34D399', letterSpacing: '.1em' }}>
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
              <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.5, marginBottom: 12 }}>
                {mode.description}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {mode.features.map((f) => (
                  <span
                    key={f}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 9,
                      fontWeight: 600,
                      background: 'rgba(255,255,255,0.04)',
                      color: '#64748B',
                    }}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
