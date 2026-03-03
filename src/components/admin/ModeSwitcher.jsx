'use client';
import { useState, memo } from 'react';

const MODES = [
  { id: 'dine-in', label: 'Dine-In', icon: '🍽️' },
  { id: 'delivery', label: 'Delivery', icon: '🛵' },
  { id: 'hybrid', label: 'Hybrid', icon: '⚡' },
  { id: 'takeaway', label: 'Takeaway', icon: '📦' },
];

function ModeSwitcher({ currentMode = 'hybrid', onChange }) {
  const [mode, setMode] = useState(currentMode);

  const handleChange = (newMode) => {
    setMode(newMode);
    onChange?.(newMode);
  };

  return (
    <div style={{ display: 'flex', gap: 6, padding: 4, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => handleChange(m.id)}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: 'none',
            background: mode === m.id ? 'linear-gradient(135deg, #3DD8F5, #2B7FE0)' : 'transparent',
            color: mode === m.id ? '#070B14' : '#94A3B8',
            fontSize: 12,
            fontWeight: mode === m.id ? 700 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

export default memo(ModeSwitcher);
