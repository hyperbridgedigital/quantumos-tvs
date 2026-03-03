'use client';
import { useState, memo } from 'react';

function KynetraActionCard({ action, onExecute }) {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const res = await onExecute(action);
      setResult(res);
    } finally {
      setExecuting(false);
    }
  };

  const typeStyles = {
    insight: { icon: '📊', color: '#3DD8F5' },
    alert: { icon: '⚠️', color: '#FBBF24' },
    forecast: { icon: '📈', color: '#34D399' },
    action_result: { icon: '✅', color: '#34D399' },
    info: { icon: '💡', color: '#60A5FA' },
  };

  const style = typeStyles[result?.type] || typeStyles.info;

  if (result) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          animation: 'kynetraBubble 0.3s ease-out',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>{style.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: style.color }}>
            {result.title || 'Result'}
          </span>
        </div>

        {result.message && (
          <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
            {result.message}
          </p>
        )}

        {result.data && (
          <div
            style={{
              marginTop: 8,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: 8,
            }}
          >
            {Object.entries(result.data).map(([key, value]) => (
              <div
                key={key}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div style={{ fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 2 }}>
                  {key.replace(/_/g, ' ')}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0' }}>
                  {typeof value === 'number' && key.includes('revenue')
                    ? '₹' + value.toLocaleString()
                    : String(value)}
                </div>
              </div>
            ))}
          </div>
        )}

        {result.items && (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {result.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 6,
                  background:
                    item.severity === 'warning'
                      ? 'rgba(251, 191, 36, 0.08)'
                      : 'rgba(96, 165, 250, 0.08)',
                }}
              >
                <span style={{ fontSize: 10 }}>
                  {item.severity === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8', flex: 1 }}>{item.message}</span>
                {item.time && (
                  <span style={{ fontSize: 10, color: '#64748B' }}>{item.time}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {result.predictions && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, overflowX: 'auto' }}>
            {result.predictions.map((p, i) => (
              <div
                key={i}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'rgba(52, 211, 153, 0.06)',
                  textAlign: 'center',
                  minWidth: 70,
                }}
              >
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 2 }}>{p.day}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#34D399' }}>
                  ₹{(p.predicted / 1000).toFixed(1)}k
                </div>
                <div style={{ fontSize: 9, color: '#64748B' }}>
                  {Math.round(p.confidence * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setResult(null)}
          style={{
            marginTop: 10,
            fontSize: 10,
            color: '#64748B',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleExecute}
      disabled={executing}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid rgba(61, 216, 245, 0.15)',
        background: executing ? 'rgba(61, 216, 245, 0.1)' : 'rgba(61, 216, 245, 0.05)',
        color: '#3DD8F5',
        fontSize: 12,
        fontWeight: 600,
        cursor: executing ? 'wait' : 'pointer',
        transition: 'all 0.2s',
        width: '100%',
        textAlign: 'left',
      }}
    >
      {executing ? (
        <span
          style={{
            width: 14,
            height: 14,
            border: '2px solid rgba(61, 216, 245, 0.3)',
            borderTop: '2px solid #3DD8F5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      ) : (
        <span style={{ fontSize: 14 }}>{action.icon || '⚡'}</span>
      )}
      <span>{action.label}</span>
    </button>
  );
}

export default memo(KynetraActionCard);
