'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';

function POS() {
  const { products, stores, selectedStore, addOrder, show, settings, stock, updateStock } = useApp();
  const [items, setItems] = useState([]);
  const [payMethod, setPayMethod] = useState('upi');
  const total = items.reduce((a, i) => a + i.price * i.qty, 0);
  const gst = Math.round(total * (Number(settings.GST_RATE) || 5) / 100);
  const grand = total + gst;
  const store = stores.find(s => s.id === selectedStore);

  const addItem = (item) => {
    setItems(p => {
      const ex = p.find(i => i.id === item.id);
      if (ex) return p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      return [...p, { ...item, qty: 1 }];
    });
  };

  const removeItem = (id) => setItems(p => p.filter(i => i.id !== id));
  const updateQty = (id, qty) => qty <= 0 ? removeItem(id) : setItems(p => p.map(i => i.id === id ? { ...i, qty } : i));

  const completeSale = () => {
    if (!items.length) return show('Add items first', 'error');
    addOrder({
      customer: 'POS Walk-in', phone: '+91 00000 00000', store: selectedStore,
      items: items.map(i => ({ name: i.name, qty: i.qty, price: i.price })),
      total: grand, type: 'dine_in', address: store?.name || 'POS', partner: null, eta: 0,
    });
    // Deduct stock
    items.forEach(item => {
      const si = stock.find(s => s.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0]));
      if (si) updateStock(si.sku, { qty: Math.max(0, si.qty - item.qty) });
    });
    setItems([]);
    show('Sale completed! Order created in OMS ✅');
  };

  return (
    <div>
      <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading, marginBottom:4 }}>🧾 Point of Sale</h2>
      <div style={{ fontSize:12, color:brand.dim, marginBottom:16 }}>Store: <strong style={{ color:brand.gold }}>{store?.name || '--'}</strong> · Orders go to OMS · Stock auto-deducts</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:8 }}>
          {products.map(m => (
            <button key={m.id} onClick={() => addItem(m)} style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:14, textAlign:'center', color:brand.text, transition:'all .2s' }}>
              {m.tag && <div style={{ fontSize:8, color:brand.gold, fontWeight:700, marginBottom:2 }}>{m.tag}</div>}
              <div style={{ fontWeight:600, color:brand.heading, fontSize:13, marginBottom:4 }}>{m.name}</div>
              <div style={{ fontFamily:brand.fontDisplay, fontSize:18, fontWeight:700, color:brand.gold }}>{fmt(m.price)}</div>
            </button>
          ))}
        </div>
        <div style={{ background:brand.card, border:'1px solid '+brand.border, borderRadius:12, padding:16, position:'sticky', top:80 }}>
          <div style={{ fontWeight:700, color:brand.heading, fontSize:15, marginBottom:12 }}>🧾 Bill</div>
          {items.length === 0 ? <div style={{ color:brand.dim, fontSize:12, padding:20, textAlign:'center' }}>Tap items to add</div> :
          items.map(i => (
            <div key={i.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
              <span style={{ color:brand.heading, fontSize:13, flex:1 }}>{i.name}</span>
              <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                <button onClick={() => updateQty(i.id, i.qty-1)} style={{ width:22, height:22, borderRadius:4, background:brand.border, color:brand.heading, border:'none', fontWeight:700, fontSize:12 }}>−</button>
                <span style={{ fontWeight:600, color:brand.heading, minWidth:16, textAlign:'center', fontSize:12 }}>{i.qty}</span>
                <button onClick={() => updateQty(i.id, i.qty+1)} style={{ width:22, height:22, borderRadius:4, background:brand.border, color:brand.heading, border:'none', fontWeight:700, fontSize:12 }}>+</button>
                <span style={{ fontWeight:700, color:brand.gold, minWidth:50, textAlign:'right', fontSize:12 }}>{fmt(i.price*i.qty)}</span>
                <button onClick={() => removeItem(i.id)} style={{ color:brand.red, background:'none', border:'none', fontSize:11 }}>✕</button>
              </div>
            </div>
          ))}
          <div style={{ borderTop:'1px solid '+brand.border, paddingTop:8, marginTop:8, fontSize:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}><span>Subtotal</span><span>{fmt(total)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}><span>GST {settings.GST_RATE||5}%</span><span>{fmt(gst)}</span></div>
            <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:18, color:brand.heading, marginTop:4 }}><span>Total</span><span style={{ color:brand.gold }}>{fmt(grand)}</span></div>
          </div>
          <div style={{ display:'flex', gap:4, marginTop:10 }}>
            {['upi','cash','card'].map(m => (
              <button key={m} onClick={() => setPayMethod(m)} style={{ flex:1, padding:6, borderRadius:6, fontSize:11, fontWeight:600, border:'1px solid '+(payMethod===m?brand.gold:brand.border), background:payMethod===m?brand.gold+'15':'transparent', color:payMethod===m?brand.gold:brand.dim }}>
                {m==='upi'?'📱 UPI':m==='cash'?'💵 Cash':'💳 Card'}
              </button>
            ))}
          </div>
          <div style={{ display:'flex', gap:6, marginTop:10 }}>
            <button onClick={completeSale} style={{ flex:1, padding:10, borderRadius:8, background:brand.emerald, color:'#fff', fontWeight:700, fontSize:13, border:'none' }}>💳 Complete Sale</button>
            <button onClick={() => setItems([])} style={{ padding:10, borderRadius:8, background:brand.red+'18', color:brand.red, fontWeight:700, fontSize:13, border:'none' }}>Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default memo(POS);
