'use client';
import { useState } from 'react';
import { useKynetra } from '@/lib/kynetra/useKynetra';

const SAMPLE_MENU = [
  { id: 1, name: 'Hyderabadi Chicken Biryani', price: 349, category: 'Biryani', available: true, orders: 847, tag: '⭐ Bestseller' },
  { id: 2, name: 'Mutton Biryani', price: 449, category: 'Biryani', available: true, orders: 312, tag: '🔥 Popular' },
  { id: 3, name: 'Veg Dum Biryani', price: 249, category: 'Biryani', available: true, orders: 198, tag: '' },
  { id: 4, name: 'Chicken 65', price: 199, category: 'Starters', available: true, orders: 425, tag: '🔥 Popular' },
  { id: 5, name: 'Double Ka Meetha', price: 149, category: 'Desserts', available: false, orders: 156, tag: '' },
  { id: 6, name: 'Haleem (Seasonal)', price: 299, category: 'Specials', available: false, orders: 0, tag: '🆕 New' },
  { id: 7, name: 'Mirchi Ka Salan', price: 99, category: 'Sides', available: true, orders: 567, tag: '' },
  { id: 8, name: 'Raita', price: 49, category: 'Sides', available: true, orders: 712, tag: '' },
];

export default function MenuPage() {
  const [items, setItems] = useState(SAMPLE_MENU);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const { sendMessage, isLoading } = useKynetra();

  const toggleAvailability = (id) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, available: !item.available } : item))
    );
  };

  const getMenuInsights = async () => {
    const res = await sendMessage({
      message: 'Analyze the current menu and give me optimization suggestions',
      context: { purpose: 'menu_insights', menuItemCount: items.length },
    });
    if (res) setAiSuggestion(res.message);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F0F4F8', fontFamily: "'Fraunces', Georgia, serif", marginBottom: 4 }}>
            Menu Management
          </h1>
          <p style={{ fontSize: 12, color: '#64748B' }}>{items.length} items • {items.filter((i) => i.available).length} available</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={getMenuInsights}
            disabled={isLoading}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: '1px solid rgba(61, 216, 245, 0.2)',
              background: 'rgba(61, 216, 245, 0.08)',
              color: '#3DD8F5',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            🤖 {isLoading ? 'Analyzing...' : 'AI Insights'}
          </button>
          <button
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
              color: '#070B14',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* AI Suggestion */}
      {aiSuggestion && (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: 'rgba(61, 216, 245, 0.06)',
            border: '1px solid rgba(61, 216, 245, 0.15)',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#3DD8F5' }}>KYNETRA AI SUGGESTION</span>
            <button
              onClick={() => setAiSuggestion(null)}
              style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 12 }}
            >
              ✕
            </button>
          </div>
          <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.6, margin: 0 }}>{aiSuggestion}</p>
        </div>
      )}

      {/* Menu Table */}
      <div
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            fontSize: 10,
            fontWeight: 700,
            color: '#64748B',
            letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}
        >
          <span>Item</span>
          <span>Category</span>
          <span>Price</span>
          <span>Orders</span>
          <span>Status</span>
        </div>

        {/* Items */}
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              alignItems: 'center',
              transition: 'background 0.15s',
              opacity: item.available ? 1 : 0.5,
            }}
          >
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{item.name}</span>
              {item.tag && (
                <span style={{ marginLeft: 8, fontSize: 10, color: '#FBBF24' }}>{item.tag}</span>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{item.category}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>₹{item.price}</span>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{item.orders}</span>
            <button
              onClick={() => toggleAvailability(item.id)}
              style={{
                padding: '4px 10px',
                borderRadius: 20,
                border: 'none',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
                background: item.available ? 'rgba(52, 211, 153, 0.12)' : 'rgba(248, 113, 113, 0.12)',
                color: item.available ? '#34D399' : '#F87171',
              }}
            >
              {item.available ? 'Live' : 'Off'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
