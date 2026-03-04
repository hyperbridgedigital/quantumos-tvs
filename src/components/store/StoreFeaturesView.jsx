'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';

const G = '#1B5E20';
const GM = '#E8F5E9';
const SH = brand.storeHeading;
const SD = brand.storeDim;
const SB = brand.storeBorder;
const card = { background: brand.storeCard, border: `1px solid ${SB}`, borderRadius: 16, padding: 16, boxShadow: '0 1px 6px rgba(27,94,32,.05)' };

export default function StoreFeaturesView({ storeTheme }) {
  const theme = storeTheme === 'dark' ? brand.storeDark : brand;
  const {
    storeFeaturesData, createStoreFeature, deleteStoreFeature, addToCart, customer, setShowUserAuth,
    stores, selectedStore,
  } = useApp();
  const [subView, setSubView] = useState('menu');
  const [tradeInForm, setTradeInForm] = useState({ deviceType: 'laptop', deviceName: '', condition: 'good', email: '' });
  const [priceAlertForm, setPriceAlertForm] = useState({ productId: '', productName: '', targetPrice: '', email: '' });
  const [expertForm, setExpertForm] = useState({ topic: '', preferredSlot: '', name: '', phone: '' });

  const { wishlist, priceAlerts, preorders, tradeins, buildGuides, warranties, expertBookings, loyaltyPoints, stockByStore, comparisons } = storeFeaturesData;

  const removeFromWishlist = (id) => deleteStoreFeature('wishlist', id);

  const addPriceAlert = () => {
    if (!priceAlertForm.productName || !priceAlertForm.targetPrice || !priceAlertForm.email) return;
    createStoreFeature('priceAlerts', { ...priceAlertForm, currentPrice: 0, status: 'active' });
    setPriceAlertForm({ productId: '', productName: '', targetPrice: '', email: '' });
  };
  const submitTradeIn = () => {
    if (!tradeInForm.deviceName || !tradeInForm.email) return;
    createStoreFeature('tradeins', { ...tradeInForm, estimatedValue: 0, customerId: customer?.id || 'guest', status: 'pending' });
    setTradeInForm({ deviceType: 'laptop', deviceName: '', condition: 'good', email: '' });
  };
  const bookExpert = () => {
    if (!expertForm.topic || !expertForm.name || !expertForm.phone) return;
    createStoreFeature('expertBookings', { ...expertForm, customerId: customer?.id, customerName: expertForm.name, slot: expertForm.preferredSlot || new Date(Date.now() + 86400000 * 7).toISOString(), expertName: 'Build Expert', status: 'pending' });
    setExpertForm({ topic: '', preferredSlot: '', name: '', phone: '' });
  };

  const totalLoyaltyPoints = loyaltyPoints.reduce((a, x) => a + (x.points || 0), 0);
  const stockForStore = selectedStore ? stockByStore.filter(s => s.storeId === selectedStore) : stockByStore;

  const features = [
    { key: 'wishlist', label: 'Wishlist', icon: '❤️', count: wishlist.length },
    { key: 'priceAlerts', label: 'Price Alerts', icon: '🔔', count: priceAlerts.length },
    { key: 'compare', label: 'Compare', icon: '⚖️' },
    { key: 'preorders', label: 'Pre-orders', icon: '📋', count: preorders.length },
    { key: 'tradein', label: 'Trade-in', icon: '🔄' },
    { key: 'buildGuides', label: 'Build Guides', icon: '📖', count: buildGuides.length },
    { key: 'warranty', label: 'Warranty', icon: '🛡️', count: warranties.length },
    { key: 'expert', label: 'Book Expert', icon: '🎯', count: expertBookings.length },
    { key: 'loyalty', label: 'Loyalty', icon: '🏆', count: totalLoyaltyPoints },
    { key: 'stock', label: 'Stock by Store', icon: '📍' },
  ];

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 80px', background: theme.storeBg }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.2em', color: G, marginBottom: 12 }}>STORE FEATURES</div>
      {subView === 'menu' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {features.map((f) => (
            <button
              key={f.key}
              onClick={() => setSubView(f.key)}
              style={{ ...card, textAlign: 'center', cursor: 'pointer', border: 'none', background: theme.storeCard }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, color: theme.storeHeading, fontSize: 14 }}>{f.label}</div>
              {f.count != null && f.count > 0 && <div style={{ fontSize: 11, color: G, marginTop: 4 }}>{typeof f.count === 'number' ? (f.key === 'loyalty' ? f.count + ' pts' : f.count) : f.count}</div>}
            </button>
          ))}
        </div>
      ) : (
        <>
          <button onClick={() => setSubView('menu')} style={{ marginBottom: 16, padding: '8px 16px', borderRadius: 10, background: GM, color: G, fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>← All features</button>

          {subView === 'wishlist' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>❤️ Wishlist</h2>
              {wishlist.length === 0 ? <p style={{ color: SD }}>No items. Add from Shop or Build PC.</p> : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {wishlist.map((w) => (
                    <div key={w.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><div style={{ fontWeight: 700, color: SH }}>{w.productName}</div><div style={{ fontSize: 12, color: G }}>{fmt(w.price)}</div></div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => addToCart({ id: w.productId, name: w.productName, price: w.price })} style={{ padding: '8px 14px', borderRadius: 8, background: G, color: '#fff', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>Add to cart</button>
                        <button onClick={() => removeFromWishlist(w.id)} style={{ padding: '8px 14px', borderRadius: 8, background: '#fee2e2', color: brand.red, fontSize: 12, border: 'none', cursor: 'pointer' }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {subView === 'priceAlerts' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>🔔 Price Alerts</h2>
              <div style={{ ...card, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: SH, marginBottom: 8 }}>Create alert</div>
                <input placeholder="Product name" value={priceAlertForm.productName} onChange={e => setPriceAlertForm(p => ({ ...p, productName: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8, boxSizing: 'border-box' }} />
                <input type="number" placeholder="Target price (₹)" value={priceAlertForm.targetPrice} onChange={e => setPriceAlertForm(p => ({ ...p, targetPrice: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8, boxSizing: 'border-box' }} />
                <input type="email" placeholder="Email" value={priceAlertForm.email} onChange={e => setPriceAlertForm(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8, boxSizing: 'border-box' }} />
                <button onClick={addPriceAlert} style={{ padding: '10px 20px', borderRadius: 8, background: G, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Notify me</button>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {priceAlerts.map((a) => (
                  <div key={a.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontWeight: 700, color: SH }}>{a.productName}</div><div style={{ fontSize: 11, color: SD }}>Alert at ₹{fmt(a.targetPrice)} · {a.status}</div></div>
                    <button onClick={() => deleteStoreFeature('priceAlerts', a.id)} style={{ padding: '6px 12px', borderRadius: 6, background: '#fee2e2', color: brand.red, fontSize: 11, border: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subView === 'compare' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>⚖️ Compare Products</h2>
              <p style={{ color: SD, marginBottom: 16 }}>Select up to 4 products from Shop to compare specs and price. Use Build PC tab to compare full builds.</p>
              {comparisons.length > 0 && (
                <div style={{ display: 'grid', gap: 10 }}>
                  {comparisons.map((c) => (
                    <div key={c.id} style={{ ...card }}>
                      <div style={{ fontWeight: 700, color: SH, marginBottom: 8 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: SD }}>Products: {c.productIds?.join(', ')}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {subView === 'preorders' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>📋 Pre-orders & Launch Queue</h2>
              {preorders.length === 0 ? <p style={{ color: SD }}>No pre-orders yet. Coming soon: RTX 5060, Ryzen 9000.</p> : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {preorders.map((p) => (
                    <div key={p.id} style={{ ...card }}>
                      <div style={{ fontWeight: 700, color: SH }}>{p.productName}</div>
                      <div style={{ fontSize: 12, color: SD }}>Queue # {p.queuePosition} · ETA {p.eta} · {p.status}</div>
                      {p.deposit > 0 && <div style={{ fontSize: 11, color: G }}>Deposit: ₹{fmt(p.deposit)}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {subView === 'tradein' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>🔄 Trade-in / Upgrade</h2>
              <div style={{ ...card, marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: SH, marginBottom: 8 }}>Submit your device</div>
                <select value={tradeInForm.deviceType} onChange={e => setTradeInForm(p => ({ ...p, deviceType: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8 }}>
                  <option value="laptop">Laptop</option><option value="gpu">GPU</option><option value="pc">PC</option><option value="monitor">Monitor</option>
                </select>
                <input placeholder="Device name / model" value={tradeInForm.deviceName} onChange={e => setTradeInForm(p => ({ ...p, deviceName: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8, boxSizing: 'border-box' }} />
                <select value={tradeInForm.condition} onChange={e => setTradeInForm(p => ({ ...p, condition: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8 }}>
                  <option value="excellent">Excellent</option><option value="good">Good</option><option value="fair">Fair</option>
                </select>
                <input type="email" placeholder="Email" value={tradeInForm.email} onChange={e => setTradeInForm(p => ({ ...p, email: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8, boxSizing: 'border-box' }} />
                <button onClick={submitTradeIn} style={{ padding: '10px 20px', borderRadius: 8, background: G, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Get estimate</button>
              </div>
              {tradeins.length > 0 && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {tradeins.map((t) => (
                    <div key={t.id} style={{ ...card }}>
                      <div style={{ fontWeight: 700, color: SH }}>{t.deviceName}</div>
                      <div style={{ fontSize: 11, color: SD }}>{t.deviceType} · {t.condition} · {t.status}</div>
                      {t.estimatedValue > 0 && <div style={{ fontSize: 12, color: G }}>Est. ₹{fmt(t.estimatedValue)}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {subView === 'buildGuides' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>📖 Build Guides</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {buildGuides.map((g) => (
                  <div key={g.id} style={{ ...card }}>
                    <div style={{ fontWeight: 700, color: SH, fontSize: 16 }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: SD, marginBottom: 8 }}>{g.description}</div>
                    <div style={{ fontSize: 11, color: G }}>₹{fmt(g.budgetMin)} – ₹{fmt(g.budgetMax)} · {g.useCase}</div>
                    <button onClick={() => window.dispatchEvent(new CustomEvent('tvs-navigate', { detail: { tab: 'buildpc' } }))} style={{ marginTop: 10, padding: '8px 16px', borderRadius: 8, background: G, color: '#fff', fontWeight: 600, fontSize: 12, border: 'none', cursor: 'pointer' }}>Open Build PC →</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subView === 'warranty' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>🛡️ Warranty</h2>
              {warranties.length === 0 ? <p style={{ color: SD }}>No warranty records. Add extended care at checkout.</p> : (
                <div style={{ display: 'grid', gap: 10 }}>
                  {warranties.map((w) => (
                    <div key={w.id} style={{ ...card }}>
                      <div style={{ fontWeight: 700, color: SH }}>{w.productName}</div>
                      <div style={{ fontSize: 12, color: SD }}>{w.type} · {w.years} year(s) · Expires {w.expiresAt}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {subView === 'expert' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>🎯 Book Build Expert</h2>
              <div style={{ ...card, marginBottom: 20 }}>
                <input placeholder="Your name" value={expertForm.name} onChange={e => setExpertForm(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8, boxSizing: 'border-box' }} />
                <input placeholder="Phone" value={expertForm.phone} onChange={e => setExpertForm(p => ({ ...p, phone: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8, boxSizing: 'border-box' }} />
                <input placeholder="Topic (e.g. Build recommendation)" value={expertForm.topic} onChange={e => setExpertForm(p => ({ ...p, topic: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8, boxSizing: 'border-box' }} />
                <input type="datetime-local" placeholder="Preferred slot" value={expertForm.preferredSlot} onChange={e => setExpertForm(p => ({ ...p, preferredSlot: e.target.value }))} style={{ width: '100%', padding: 10, borderRadius: 8, border: `1px solid ${SB}`, marginBottom: 8, boxSizing: 'border-box' }} />
                <button onClick={bookExpert} style={{ padding: '10px 20px', borderRadius: 8, background: G, color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>Book slot</button>
              </div>
              {expertBookings.length > 0 && (
                <div style={{ display: 'grid', gap: 8 }}>
                  {expertBookings.map((b) => (
                    <div key={b.id} style={{ ...card }}>
                      <div style={{ fontWeight: 700, color: SH }}>{b.topic || 'Build help'}</div>
                      <div style={{ fontSize: 11, color: SD }}>{b.expertName} · {b.slot?.slice(0, 16)} · {b.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {subView === 'loyalty' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>🏆 Loyalty & Rewards</h2>
              <div style={{ ...card, marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 800, color: G }}>{totalLoyaltyPoints}</div>
                <div style={{ fontSize: 12, color: SD }}>points · 10 pts = ₹1 discount</div>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {loyaltyPoints.map((l) => (
                  <div key={l.id} style={{ ...card, display: 'flex', justifyContent: 'space-between' }}>
                    <div><div style={{ fontWeight: 700, color: SH }}>+{l.points} pts</div><div style={{ fontSize: 11, color: SD }}>{l.reason}</div></div>
                    <div style={{ fontSize: 11, color: SD }}>{l.createdAt?.slice(0, 10)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {subView === 'stock' && (
            <div>
              <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: SH, marginBottom: 16 }}>📍 Stock by Location</h2>
              <p style={{ color: SD, marginBottom: 16 }}>Availability at stores. Reserve in-store or pickup.</p>
              <div style={{ display: 'grid', gap: 10 }}>
                {(stockForStore.length > 0 ? stockForStore : stockByStore.slice(0, 10)).map((s) => (
                  <div key={s.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div><div style={{ fontWeight: 700, color: SH }}>{s.productName}</div><div style={{ fontSize: 12, color: SD }}>{s.storeName}</div></div>
                    <div style={{ fontWeight: 700, color: G }}>{s.qty} in stock</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
