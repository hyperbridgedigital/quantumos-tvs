'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';
import KynetraChatWidget from './KynetraChatWidget';

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'buildpc', label: 'Build PC' },
  { id: 'offers', label: 'Offers' },
  { id: 'track', label: 'Track' },
  { id: 'franchise', label: 'Franchise' },
];

export default function StoreView() {
  const {
    availableProducts,
    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    cartTotal,
    placeOrder,
    customerOrders,
    settings,
    storeTheme,
    show,
    offers,
    storeFeaturesData,
    createStoreFeature,
    fetchStoreFeatures,
  } = useApp();

  const [storeTab, setStoreTab] = useState('home');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', type: 'delivery' });
  const [searchQ, setSearchQ] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [buildParts, setBuildParts] = useState([]);
  const [buildTotal, setBuildTotal] = useState(null);
  const [franchiseForm, setFranchiseForm] = useState({ name: '', phone: '', city: '', message: '' });

  const theme = storeTheme === 'dark' ? brand.storeDark : brand;
  const G = brand.green;
  const products = Array.isArray(availableProducts) ? availableProducts : [];
  const filteredProducts = searchQ.trim()
    ? products.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(searchQ.toLowerCase()) ||
          (p.category || '').toLowerCase().includes(searchQ.toLowerCase())
      )
    : products;
  const gstRate = Number(settings?.GST_RATE || 5);
  const gst = Math.round(cartTotal * gstRate / 100);
  const deliveryFee = cartTotal >= Number(settings?.DELIVERY_FREE_ABOVE || 499) ? 0 : Number(settings?.DELIVERY_CHARGE || 49);
  const grandTotal = cartTotal + gst + deliveryFee;

  useEffect(() => {
    fetch('/api/ai/recommendations?limit=6' + (cart?.length ? '&cartIds=' + cart.map((i) => i.id).join(',') : ''))
      .then((r) => r.json())
      .then((d) => setRecommendations(d.recommendations || []))
      .catch(() => {});
  }, [cart?.length]);

  const handlePlaceOrder = () => {
    if (!form.name?.trim() || !form.phone?.trim()) {
      show('Enter name and phone', 'error');
      return;
    }
    const order = placeOrder({ ...form });
    if (order) {
      setCheckoutOpen(false);
      setForm({ name: '', phone: '', address: '', type: 'delivery' });
      setStoreTab('track');
      show('Order placed: ' + order.id);
    }
  };

  const addBuildPart = (p, qty = 1) => {
    setBuildParts((prev) => {
      const ex = prev.find((i) => i.productId === p.id);
      if (ex) return prev.map((i) => (i.productId === p.id ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { productId: p.id, name: p.name, price: p.price, qty }];
    });
  };
  const removeBuildPart = (productId) => setBuildParts((p) => p.filter((i) => i.productId !== productId));
  const updateBuildQty = (productId, qty) => {
    if (qty <= 0) removeBuildPart(productId);
    else setBuildParts((p) => p.map((i) => (i.productId === productId ? { ...i, qty } : i)));
  };

  useEffect(() => {
    if (buildParts.length === 0) {
      setBuildTotal(null);
      return;
    }
    fetch('/api/buildpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parts: buildParts.map((i) => ({ productId: i.productId, qty: i.qty })) }),
    })
      .then((r) => r.json())
      .then((d) => setBuildTotal(d.total))
      .catch(() => setBuildTotal(null));
  }, [buildParts]);

  const addBuildToCart = () => {
    buildParts.forEach(({ productId, qty }) => {
      const p = products.find((x) => x.id === productId);
      if (p) for (let i = 0; i < qty; i++) addToCart(p);
    });
    setBuildParts([]);
    setBuildTotal(null);
    setStoreTab('shop');
    show('Build added to cart');
  };

  const activeOffers = Array.isArray(offers) ? offers.filter((o) => o.active) : [];

  const wishlist = storeFeaturesData?.wishlist || [];
  const addToWishlist = (p) => {
    createStoreFeature('wishlist', { productId: p.id, productName: p.name, price: p.price, customerId: 'guest' });
    show('Added to wishlist');
  };
  const [compareIds, setCompareIds] = useState([]);
  const addToCompare = (p) => {
    if (compareIds.includes(p.id)) setCompareIds((c) => c.filter((id) => id !== p.id));
    else if (compareIds.length < 4) setCompareIds((c) => [...c, p.id]);
    else show('Max 4 products to compare', 'error');
  };
  const [priceAlertProduct, setPriceAlertProduct] = useState(null);
  const [priceAlertTarget, setPriceAlertTarget] = useState('');
  const submitPriceAlert = (productId, productName, currentPrice) => {
    const target = Number(priceAlertTarget) || Math.round(currentPrice * 0.9);
    createStoreFeature('priceAlerts', { productId, productName, currentPrice, targetPrice: target, email: 'guest@example.com', status: 'active' });
    show('Price alert set');
    setPriceAlertProduct(null);
    setPriceAlertTarget('');
  };
  const [expertBooking, setExpertBooking] = useState({ topic: '', preferred: '' });
  const submitExpertBooking = () => {
    createStoreFeature('expertBookings', { customerId: 'guest', customerName: form.name || 'Guest', topic: expertBooking.topic || 'Build recommendation', slot: new Date(Date.now() + 86400000).toISOString(), expertName: 'TBD', status: 'pending' });
    show('Expert booking requested. We will call you.');
    setExpertBooking({ topic: '', preferred: '' });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 100px', background: theme.storeBg }}>
      <h1 style={{ fontFamily: brand.fontDisplay, fontSize: 28, color: theme.storeHeading, marginBottom: 4 }}>{brand.name}</h1>
      <p style={{ fontSize: 14, color: theme.storeDim, marginBottom: 16 }}>{brand.tagline}</p>

      {/* Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setStoreTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              background: storeTab === t.id ? G : theme.storeBg2,
              color: storeTab === t.id ? '#fff' : theme.storeDim,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Home */}
      {storeTab === 'home' && (
        <>
          <section style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 18, color: theme.storeHeading, marginBottom: 12 }}>Recommended for you</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {(recommendations.length ? recommendations : products.slice(0, 6)).map((p) => (
                <div key={p.id} style={{ padding: 12, background: theme.storeCard, border: `1px solid ${theme.storeBorder}`, borderRadius: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: theme.storeHeading, marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: G, marginBottom: 8 }}>{fmt(p.price)}</div>
                  <button onClick={() => addToCart(p)} style={{ width: '100%', padding: 8, borderRadius: 8, background: G, color: '#fff', fontWeight: 600, fontSize: 12, border: 'none' }}>Add to cart</button>
                </div>
              ))}
            </div>
          </section>
          <p style={{ fontSize: 14, color: theme.storeDim }}>Use the tabs above to Shop, Build PC, view Offers, Track orders, or inquire about Franchise. Or open the chat for help.</p>
          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 18, color: theme.storeHeading, marginBottom: 12 }}>Book an expert</h2>
            <p style={{ fontSize: 13, color: theme.storeDim, marginBottom: 12 }}>Free 15-min call for build advice or bulk quotes.</p>
            <input placeholder="Topic (e.g. Gaming PC, Streaming build)" value={expertBooking.topic} onChange={(e) => setExpertBooking((f) => ({ ...f, topic: e.target.value }))} style={{ width: '100%', maxWidth: 400, padding: 12, marginBottom: 8, borderRadius: 8, border: `1px solid ${theme.storeBorder}` }} />
            <button onClick={submitExpertBooking} style={{ padding: '12px 20px', borderRadius: 10, background: G, color: '#fff', fontWeight: 600, border: 'none' }}>Request call</button>
          </section>
        </>
      )}

      {/* Shop */}
      {storeTab === 'shop' && (
        <>
          {compareIds.length > 0 && (
            <div style={{ marginBottom: 20, padding: 16, background: theme.storeBg2, border: `1px solid ${theme.storeBorder}`, borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, color: theme.storeHeading }}>Compare ({compareIds.length})</h3>
                <button onClick={() => setCompareIds([])} style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${theme.storeBorder}`, background: 'transparent', fontSize: 12 }}>Clear</button>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${theme.storeBorder}` }}>
                      <th style={{ textAlign: 'left', padding: 8, color: theme.storeDim }}>Product</th>
                      <th style={{ textAlign: 'left', padding: 8, color: theme.storeDim }}>Category</th>
                      <th style={{ textAlign: 'right', padding: 8, color: theme.storeDim }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compareIds.map((id) => {
                      const p = products.find((x) => x.id === id);
                      return p ? (
                        <tr key={id} style={{ borderBottom: `1px solid ${theme.storeBorder}` }}>
                          <td style={{ padding: 8, color: theme.storeHeading }}>{p.name}</td>
                          <td style={{ padding: 8, color: theme.storeDim }}>{p.category || '—'}</td>
                          <td style={{ padding: 8, textAlign: 'right', fontWeight: 700, color: G }}>{fmt(p.price)}</td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <input
              type="search"
              placeholder="Search products..."
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              style={{ width: '100%', maxWidth: 400, padding: '12px 16px', borderRadius: 10, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, color: theme.storeHeading }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filteredProducts.slice(0, 24).map((p) => (
              <div key={p.id} style={{ padding: 16, background: theme.storeCard, border: `1px solid ${theme.storeBorder}`, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: theme.storeHeading, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: theme.storeDim, marginBottom: 8 }}>{p.category || 'Product'}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: G, marginBottom: 10 }}>{fmt(p.price)}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => addToCart(p)} style={{ flex: 1, padding: '10px', borderRadius: 8, background: G, color: '#fff', fontWeight: 700, fontSize: 13, border: 'none' }}>Add to cart</button>
                  <button onClick={() => addToWishlist(p)} style={{ padding: '10px', borderRadius: 8, border: `1px solid ${theme.storeBorder}`, background: 'transparent', fontSize: 16 }} title="Wishlist">♥</button>
                  <button onClick={() => addToCompare(p)} style={{ padding: '10px', borderRadius: 8, border: `1px solid ${theme.storeBorder}`, background: compareIds.includes(p.id) ? G : 'transparent', color: compareIds.includes(p.id) ? '#fff' : theme.storeText, fontSize: 12 }} title="Compare">⇔</button>
                </div>
                {priceAlertProduct?.id === p.id ? (
                  <div style={{ marginTop: 8, padding: 8, background: theme.storeBg2, borderRadius: 8 }}>
                    <input type="number" placeholder="Target price (₹)" value={priceAlertTarget || p.price} onChange={(e) => setPriceAlertTarget(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 6, borderRadius: 6, border: `1px solid ${theme.storeBorder}` }} />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => submitPriceAlert(p.id, p.name, p.price)} style={{ flex: 1, padding: 8, borderRadius: 6, background: G, color: '#fff', fontWeight: 600, fontSize: 12, border: 'none' }}>Set alert</button>
                      <button onClick={() => { setPriceAlertProduct(null); setPriceAlertTarget(''); }} style={{ padding: 8, borderRadius: 6, border: `1px solid ${theme.storeBorder}`, background: 'transparent', fontSize: 12 }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setPriceAlertProduct(p); setPriceAlertTarget(String(p.price)); }} style={{ width: '100%', marginTop: 6, padding: 6, borderRadius: 6, border: `1px solid ${theme.storeBorder}`, background: 'transparent', fontSize: 11, color: theme.storeDim }}>Notify when price drops</button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Build PC */}
      {storeTab === 'buildpc' && (
        <>
          <p style={{ fontSize: 14, color: theme.storeDim, marginBottom: 16 }}>Add components to your build. Total updates automatically.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 14, color: theme.storeHeading, marginBottom: 8 }}>Components & peripherals</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {products.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: theme.storeBg2, borderRadius: 10, border: `1px solid ${theme.storeBorder}` }}>
                    <span style={{ color: theme.storeHeading }}>{p.name} — {fmt(p.price)}</span>
                    <button onClick={() => addBuildPart(p)} style={{ padding: '8px 14px', borderRadius: 8, background: G, color: '#fff', fontWeight: 600, border: 'none' }}>Add</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: 20, background: theme.storeBg2, border: `1px solid ${theme.storeBorder}`, borderRadius: 16, height: 'fit-content' }}>
              <h3 style={{ fontSize: 16, color: theme.storeHeading, marginBottom: 12 }}>Your build</h3>
              {buildParts.length === 0 ? (
                <p style={{ color: theme.storeDim, fontSize: 13 }}>No parts added. Add components from the list.</p>
              ) : (
                <>
                  {buildParts.map((i) => (
                    <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: `1px solid ${theme.storeBorder}` }}>
                      <span style={{ fontSize: 13, color: theme.storeHeading }}>{i.name} × {i.qty}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button onClick={() => updateBuildQty(i.productId, i.qty - 1)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, fontSize: 14 }}>−</button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{i.qty}</span>
                        <button onClick={() => updateBuildQty(i.productId, i.qty + 1)} style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${G}`, background: brand.greenMint, color: G, fontSize: 14 }}>+</button>
                        <span style={{ fontWeight: 700, color: G }}>{fmt(i.price * i.qty)}</span>
                        <button onClick={() => removeBuildPart(i.productId)} style={{ color: brand.red, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `2px solid ${theme.storeBorder}`, fontWeight: 700, fontSize: 18, color: G }}>Total: {buildTotal != null ? fmt(buildTotal) : '—'}</div>
                  <button onClick={addBuildToCart} disabled={buildParts.length === 0} style={{ width: '100%', marginTop: 12, padding: 14, borderRadius: 12, background: G, color: '#fff', fontWeight: 700, border: 'none' }}>Add build to cart</button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Offers */}
      {storeTab === 'offers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeOffers.length === 0 ? (
            <p style={{ color: theme.storeDim }}>No active offers. Check back later or ask Kynetra for deals.</p>
          ) : (
            activeOffers.map((o) => (
              <div key={o.id} style={{ padding: 20, background: theme.storeCard, border: `1px solid ${theme.storeBorder}`, borderRadius: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: theme.storeHeading, marginBottom: 4 }}>{o.icon} {o.name}</div>
                <div style={{ fontSize: 13, color: theme.storeDim, marginBottom: 8 }}>{o.desc}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: G }}>Code: {o.code}</div>
                {o.minOrder && <div style={{ fontSize: 12, color: theme.storeDim }}>Min order: {fmt(o.minOrder)}</div>}
              </div>
            ))
          )}
        </div>
      )}

      {/* Track */}
      {storeTab === 'track' && (
        <div>
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: theme.storeHeading, marginBottom: 16 }}>Your orders</h2>
          {customerOrders?.length > 0 ? (
            customerOrders.slice(0, 10).map((o) => (
              <div key={o.id} style={{ padding: 16, marginBottom: 12, background: theme.storeCard, border: `1px solid ${theme.storeBorder}`, borderRadius: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: theme.storeHeading }}>{o.id}</span>
                  <span style={{ fontSize: 13, color: theme.storeDim }}>{o.status}</span>
                </div>
                <div style={{ marginTop: 4, color: theme.storeDim, fontSize: 13 }}>Total {fmt(o.total)} · {o.placed || ''}</div>
              </div>
            ))
          ) : (
            <p style={{ color: theme.storeDim }}>No orders yet. Place an order from Shop and come back here, or ask Kynetra to track by Order ID.</p>
          )}
        </div>
      )}

      {/* Franchise */}
      {storeTab === 'franchise' && (
        <div style={{ maxWidth: 480 }}>
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: theme.storeHeading, marginBottom: 8 }}>Franchise inquiry</h2>
          <p style={{ fontSize: 14, color: theme.storeDim, marginBottom: 20 }}>Share your details and our team will call you in 24h.</p>
          <input placeholder="Full name" value={franchiseForm.name} onChange={(e) => setFranchiseForm((f) => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: 12, marginBottom: 10, borderRadius: 8, border: `1px solid ${theme.storeBorder}` }} />
          <input placeholder="Phone" value={franchiseForm.phone} onChange={(e) => setFranchiseForm((f) => ({ ...f, phone: e.target.value }))} style={{ width: '100%', padding: 12, marginBottom: 10, borderRadius: 8, border: `1px solid ${theme.storeBorder}` }} />
          <input placeholder="City" value={franchiseForm.city} onChange={(e) => setFranchiseForm((f) => ({ ...f, city: e.target.value }))} style={{ width: '100%', padding: 12, marginBottom: 10, borderRadius: 8, border: `1px solid ${theme.storeBorder}` }} />
          <textarea placeholder="Message (optional)" value={franchiseForm.message} onChange={(e) => setFranchiseForm((f) => ({ ...f, message: e.target.value }))} style={{ width: '100%', padding: 12, marginBottom: 16, borderRadius: 8, border: `1px solid ${theme.storeBorder}`, minHeight: 80 }} />
          <button onClick={() => { show('Inquiry submitted. We will call you soon.'); setFranchiseForm({ name: '', phone: '', city: '', message: '' }); }} style={{ padding: '14px 24px', borderRadius: 12, background: G, color: '#fff', fontWeight: 700, border: 'none' }}>Submit</button>
        </div>
      )}

      {/* Cart & checkout (all tabs) */}
      {cart.length > 0 && (
        <div style={{ marginTop: 32, padding: 24, background: theme.storeBg2, border: `1px solid ${theme.storeBorder}`, borderRadius: 16 }}>
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: theme.storeHeading, marginBottom: 16 }}>Cart ({cart.length} items)</h2>
          {cart.map((item) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.storeBorder}` }}>
              <span style={{ color: theme.storeHeading }}>{item.name} × {item.qty}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => updateCartQty(item.id, item.qty - 1)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${theme.storeBorder}`, background: theme.storeCard, fontSize: 16 }}>−</button>
                <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                <button onClick={() => updateCartQty(item.id, item.qty + 1)} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${G}`, background: brand.greenMint, color: G, fontSize: 16 }}>+</button>
                <span style={{ fontWeight: 700, color: G, minWidth: 70, textAlign: 'right' }}>{fmt(item.price * item.qty)}</span>
                <button onClick={() => removeFromCart(item.id)} style={{ color: brand.red, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: theme.storeDim }}>Subtotal</span><span>{fmt(cartTotal)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: theme.storeDim }}>GST ({gstRate}%)</span><span>{fmt(gst)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ color: theme.storeDim }}>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : fmt(deliveryFee)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginTop: 12, paddingTop: 12, borderTop: `2px solid ${theme.storeBorder}` }}>
              <span>Total</span><span style={{ color: G }}>{fmt(grandTotal)}</span>
            </div>
          </div>
          {!checkoutOpen ? (
            <button onClick={() => setCheckoutOpen(true)} style={{ width: '100%', marginTop: 16, padding: 14, borderRadius: 12, background: G, color: '#fff', fontWeight: 700, fontSize: 16, border: 'none' }}>
              Checkout · {fmt(grandTotal)}
            </button>
          ) : (
            <div style={{ marginTop: 16, padding: 16, background: theme.storeCard, borderRadius: 12, border: `1px solid ${theme.storeBorder}` }}>
              <input placeholder="Full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: 12, marginBottom: 8, borderRadius: 8, border: `1px solid ${theme.storeBorder}` }} />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={{ width: '100%', padding: 12, marginBottom: 8, borderRadius: 8, border: `1px solid ${theme.storeBorder}` }} />
              <input placeholder="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} style={{ width: '100%', padding: 12, marginBottom: 12, borderRadius: 8, border: `1px solid ${theme.storeBorder}` }} />
              <button onClick={handlePlaceOrder} style={{ width: '100%', padding: 14, borderRadius: 12, background: G, color: '#fff', fontWeight: 700, fontSize: 16, border: 'none' }}>
                Place order · {fmt(grandTotal)}
              </button>
            </div>
          )}
        </div>
      )}

      <footer style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${theme.storeBorder}`, fontSize: 12, color: theme.storeDim, textAlign: 'center' }}>
        {brand.footer}
      </footer>

      <KynetraChatWidget onNavigate={(tab) => setStoreTab(tab)} storeTab={storeTab} />
    </div>
  );
}
