'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';

const TYPES = [
  { key: 'wishlist', label: 'Wishlist', cols: ['productName', 'price', 'customerId', 'addedAt'] },
  { key: 'priceAlerts', label: 'Price Alerts', cols: ['productName', 'targetPrice', 'email', 'status'] },
  { key: 'preorders', label: 'Pre-orders', cols: ['productName', 'queuePosition', 'deposit', 'status', 'eta'] },
  { key: 'tradeins', label: 'Trade-ins', cols: ['deviceName', 'deviceType', 'condition', 'estimatedValue', 'status'] },
  { key: 'buildGuides', label: 'Build Guides', cols: ['name', 'description', 'budgetMin', 'budgetMax', 'useCase'] },
  { key: 'warranties', label: 'Warranties', cols: ['productName', 'type', 'years', 'expiresAt'] },
  { key: 'expertBookings', label: 'Expert Bookings', cols: ['customerName', 'topic', 'slot', 'expertName', 'status'] },
  { key: 'loyaltyPoints', label: 'Loyalty Points', cols: ['customerId', 'points', 'reason', 'orderId'] },
  { key: 'stockByStore', label: 'Stock by Store', cols: ['productName', 'storeName', 'qty', 'reserved'] },
  { key: 'comparisons', label: 'Comparisons', cols: ['name', 'productIds'] },
];

export default function StoreFeaturesAdmin() {
  const { storeFeaturesData, fetchStoreFeatures, deleteStoreFeature } = useApp();
  const [activeType, setActiveType] = useState('wishlist');

  useEffect(() => {
    fetchStoreFeatures(activeType);
  }, [activeType, fetchStoreFeatures]);

  const list = storeFeaturesData[activeType] || [];
  const meta = TYPES.find(t => t.key === activeType);

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) await deleteStoreFeature(activeType, id);
  };

  return (
    <div>
      <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: brand.heading, marginBottom: 16 }}>✨ Store Features (CRUD)</h2>
      <p style={{ fontSize: 12, color: brand.dim, marginBottom: 20 }}>Wishlist, price alerts, pre-orders, trade-ins, build guides, warranties, expert bookings, loyalty, stock-by-store, comparisons. 50 seed records + API CRUD.</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TYPES.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveType(t.key)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: '1px solid ' + (activeType === t.key ? brand.green : brand.border),
              background: activeType === t.key ? brand.green + '18' : brand.card,
              color: activeType === t.key ? brand.green : brand.text,
              cursor: 'pointer',
            }}
          >
            {t.label} ({storeFeaturesData[t.key]?.length ?? 0})
          </button>
        ))}
      </div>

      <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 12, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: brand.bg2 }}>
              <th style={{ padding: 10, textAlign: 'left', color: brand.dim }}>ID</th>
              {meta?.cols.map((c) => (
                <th key={c} style={{ padding: 10, textAlign: 'left', color: brand.dim }}>{c}</th>
              ))}
              <th style={{ padding: 10, textAlign: 'right', color: brand.dim }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid ' + brand.border }}>
                <td style={{ padding: 8, color: brand.heading }}>{row.id}</td>
                {meta?.cols.map((c) => (
                  <td key={c} style={{ padding: 8, color: brand.text }}>
                    {c === 'productIds' && Array.isArray(row[c]) ? row[c].join(', ') : c === 'budgetMin' || c === 'budgetMax' || c === 'price' || c === 'targetPrice' || c === 'deposit' || c === 'estimatedValue' ? (row[c] != null ? fmt(row[c]) : '') : String(row[c] ?? '')}
                  </td>
                ))}
                <td style={{ padding: 8, textAlign: 'right' }}>
                  <button onClick={() => handleDelete(row.id)} style={{ padding: '4px 10px', borderRadius: 6, background: brand.red + '20', color: brand.red, border: 'none', fontSize: 11, cursor: 'pointer' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: brand.dim }}>No records. Add from storefront or seed data.</div>}
      </div>

      <div style={{ marginTop: 16, padding: 12, background: brand.bg2, borderRadius: 8, fontSize: 11, color: brand.dim }}>
        <strong>API:</strong> GET/POST <code>/api/store-features?type={activeType}</code> · GET/PUT/DELETE <code>/api/store-features/[id]?type={activeType}</code>
      </div>
    </div>
  );
}
