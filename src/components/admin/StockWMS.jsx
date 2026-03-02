'use client';
import { useState, memo, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt } from '@/lib/utils';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

function StockWMS() {
  const { stock, updateStock, addStockItem, deleteStockItem, lowStock, orders, stores, show, setAdminTab } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [newItem, setNewItem] = useState({ name:'', category:'Raw Material', store:'ST001', qty:0, reorder:10, unit:'kg', cost:0, supplier:'' });

  const totalValue = stock.reduce((a,s) => a + (s.qty * s.cost), 0);
  const categories = useMemo(() => ['all', ...new Set(stock.map(s => s.category))], [stock]);
  const filtered = useMemo(() => {
    let list = catFilter === 'all' ? stock : stock.filter(s => s.category === catFilter);
    if (search) list = list.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.sku?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [stock, catFilter, search]);

  // Track consumption from orders
  const consumptionRate = useMemo(() => {
    const rates = {};
    orders.forEach(o => o.items?.forEach(i => { rates[i.name] = (rates[i.name]||0) + i.qty; }));
    return rates;
  }, [orders]);

  const inp = { width:'100%', padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, color:brand.heading, fontSize:12, outline:'none' };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:brand.fontDisplay, fontSize:22, color:brand.heading }}>📦 Stock & Warehouse</h2>
          <div style={{ fontSize:12, color:brand.dim }}>Live · Auto-deducts on orders · Connected to OMS, POS</div>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={() => setAdminTab('orders')} style={{ padding:'6px 14px', borderRadius:8, background:brand.blue+'12', color:brand.blue, fontSize:11, fontWeight:700, border:'none', cursor:'pointer' }}>↗ Orders</button>
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding:'8px 18px', borderRadius:8, background:brand.emerald, color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>+ Add Item</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))', gap:10, marginBottom:18 }}>
        <StatCard label="Total SKUs" value={stock.length} color={brand.blue} icon="📦" />
        <StatCard label="Low Stock" value={lowStock.length} color={lowStock.length>0?brand.red:brand.emerald} icon="⚠️" />
        <StatCard label="Inventory Value" value={fmt(totalValue)} color={brand.gold} icon="💰" />
        <StatCard label="Categories" value={categories.length-1} color={brand.purple} icon="🏷" />
      </div>

      {lowStock.length > 0 && <div style={{ background:brand.red+'10', border:'1px solid '+brand.red+'25', borderRadius:10, padding:14, marginBottom:14 }}>
        <div style={{ fontWeight:700, color:brand.red, fontSize:13, marginBottom:4 }}>⚠️ {lowStock.length} items below reorder level</div>
        <div style={{ fontSize:11, color:brand.dim }}>{lowStock.map(s => s.name+' ('+s.qty+'/'+s.reorder+')').join(' · ')}</div>
      </div>}

      {/* Add form */}
      {showAdd && (
        <div style={{ background:brand.card, border:'1px solid '+brand.emerald+'30', borderRadius:12, padding:16, marginBottom:14, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:8 }}>
          {Object.keys(newItem).map(f => (
            <div key={f}>
              <label style={{ fontSize:9, color:brand.dim, fontWeight:700 }}>{f.toUpperCase()}</label>
              {f==='category' ? <select value={newItem[f]} onChange={e => setNewItem(p=>({...p,[f]:e.target.value}))} style={{...inp,appearance:'auto'}}><option>Raw Material</option><option>Packaging</option><option>Spices</option><option>Proteins</option><option>Dairy</option><option>Vegetables</option><option>Beverages</option></select>
              : f==='store' ? <select value={newItem[f]} onChange={e => setNewItem(p=>({...p,[f]:e.target.value}))} style={{...inp,appearance:'auto'}}>{stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
              : <input value={newItem[f]} onChange={e => setNewItem(p=>({...p,[f]:['qty','reorder','cost'].includes(f)?Number(e.target.value):e.target.value}))} type={['qty','reorder','cost'].includes(f)?'number':'text'} style={inp} />}
            </div>
          ))}
          <div style={{ display:'flex', gap:6, alignItems:'end' }}>
            <button onClick={() => { if(newItem.name){ addStockItem(newItem); setNewItem({name:'',category:'Raw Material',store:'ST001',qty:0,reorder:10,unit:'kg',cost:0,supplier:''}); setShowAdd(false); }}} style={{ padding:'8px 16px', borderRadius:8, background:brand.emerald, color:'#fff', fontWeight:700, border:'none', cursor:'pointer' }}>💾 Add</button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search..." style={{ ...inp, maxWidth:220 }} />
        <div style={{ display:'flex', gap:3 }}>
          {categories.map(c => <button key={c} onClick={() => setCatFilter(c)} style={{ padding:'5px 12px', borderRadius:6, fontSize:10, fontWeight:600, border:'none', background:catFilter===c?brand.gold+'18':'transparent', color:catFilter===c?brand.gold:brand.dim, cursor:'pointer' }}>{c==='all'?'All':c}</button>)}
        </div>
      </div>

      {/* Stock table */}
      <div style={{ overflowX:'auto' }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead><tr style={{ borderBottom:'1px solid '+brand.border }}>
            {['SKU','Item','Category','Qty','Reorder','Cost','Supplier','Consumption','Status','Actions'].map(h => (
              <th key={h} style={{ padding:'8px 10px', textAlign:'left', color:brand.dim, fontWeight:600, fontSize:10 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>{filtered.map(s => {
            const isLow = s.qty <= s.reorder;
            const consumed = consumptionRate[s.name] || 0;
            const daysLeft = consumed > 0 ? Math.round(s.qty / (consumed / 7)) : 999;
            const isEditing = editing === s.sku;
            return (
              <tr key={s.sku} style={{ borderBottom:'1px solid '+brand.border+'20', background:isEditing?'rgba(255,255,255,.02)':'transparent' }}>
                <td style={{ padding:'8px 10px', fontFamily:'monospace', color:brand.gold, fontSize:11 }}>{s.sku}</td>
                <td style={{ padding:'8px 10px', fontWeight:600, color:brand.heading }}>
                  {isEditing ? <input value={s.name} onChange={e => updateStock(s.sku, { name: e.target.value })} style={{...inp, width:120}} /> : s.name}
                </td>
                <td style={{ padding:'8px 10px', color:brand.dim }}>{s.category}</td>
                <td style={{ padding:'8px 10px' }}>
                  <input type="number" value={s.qty} onChange={e => updateStock(s.sku, { qty: Number(e.target.value) })} style={{ width:55, textAlign:'center', background:'rgba(255,255,255,.04)', border:'1px solid '+brand.border, borderRadius:6, padding:'4px', color:isLow?brand.red:brand.emerald, fontWeight:700, outline:'none' }} />
                  <span style={{ fontSize:10, color:brand.dim, marginLeft:2 }}>{s.unit}</span>
                </td>
                <td style={{ padding:'8px 10px' }}>
                  {isEditing ? <input type="number" value={s.reorder} onChange={e => updateStock(s.sku, { reorder: Number(e.target.value) })} style={{...inp,width:50}} /> : <span style={{ color:brand.dim }}>{s.reorder}</span>}
                </td>
                <td style={{ padding:'8px 10px' }}>{fmt(s.cost)}</td>
                <td style={{ padding:'8px 10px', fontSize:11, color:brand.dim }}>{isEditing ? <input value={s.supplier} onChange={e => updateStock(s.sku, { supplier: e.target.value })} style={{...inp,width:100}} /> : s.supplier}</td>
                <td style={{ padding:'8px 10px' }}>
                  {consumed > 0 ? <span style={{ color:daysLeft<7?brand.red:brand.emerald, fontSize:11 }}>{consumed}/wk · {daysLeft}d left</span> : <span style={{ color:brand.dim, fontSize:11 }}>—</span>}
                </td>
                <td style={{ padding:'8px 10px' }}><Badge color={isLow?brand.red:brand.emerald}>{isLow?'⚠️ Low':'✅ OK'}</Badge></td>
                <td style={{ padding:'8px 10px', display:'flex', gap:4 }}>
                  <button onClick={() => setEditing(isEditing?null:s.sku)} style={{ fontSize:10, color:brand.blue, background:brand.blue+'12', border:'none', borderRadius:4, padding:'3px 8px', cursor:'pointer' }}>{isEditing?'Done':'✏️'}</button>
                  <button onClick={() => { if(confirm('Delete '+s.name+'?')) deleteStockItem(s.sku); }} style={{ fontSize:10, color:brand.red, background:'none', border:'none', cursor:'pointer' }}>🗑</button>
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </div>
  );
}
export default memo(StockWMS);
