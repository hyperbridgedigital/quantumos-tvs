'use client';
import { useState, useMemo, useCallback, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { Badge } from '@/components/shared/Badge';
import { StatCard } from '@/components/shared/StatCard';
import { allChennaiPincodes, chennaipincodes, chennaiDeliveryPartners } from '@/data/pincodes';

function PincodeManager() {
  const { stores, updateStore, show, settings } = useApp();
  const [selectedStoreId, setSelectedStoreId] = useState('ST001');
  const [sub, setSub] = useState('map'); // map | list | delivery | partners
  const [search, setSearch] = useState('');
  const [editPin, setEditPin] = useState(null);
  const [editTime, setEditTime] = useState('25');
  const [editFee, setEditFee] = useState('0');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkSelected, setBulkSelected] = useState(new Set());

  // Pincode state (store-level)
  const [pincodeMap, setPincodeMap] = useState(chennaipincodes);

  const selectedStore = stores.find(s => s.id === selectedStoreId);
  const storeList = stores.filter(s => s.city === 'Chennai' || s.pincodes?.length > 0);

  // Pincodes assigned to this store
  const storePincodes = useMemo(() => {
    return Object.entries(pincodeMap)
      .filter(([, v]) => v.store === selectedStoreId)
      .map(([pin, v]) => ({ pin, ...v }));
  }, [pincodeMap, selectedStoreId]);

  // Available (unassigned) pincodes
  const unassigned = useMemo(() => {
    return allChennaiPincodes.filter(p => !pincodeMap[p.pin] || pincodeMap[p.pin].store !== selectedStoreId);
  }, [pincodeMap, selectedStoreId]);

  // Stats
  const stats = useMemo(() => ({
    total: storePincodes.length,
    freeDelivery: storePincodes.filter(p => p.fee === 0).length,
    avgTime: storePincodes.length ? Math.round(storePincodes.reduce((a, p) => a + p.deliveryTime, 0) / storePincodes.length) : 0,
    maxTime: storePincodes.length ? Math.max(...storePincodes.map(p => p.deliveryTime)) : 0,
  }), [storePincodes]);

  const filtered = search
    ? storePincodes.filter(p => p.pin.includes(search) || p.area.toLowerCase().includes(search.toLowerCase()))
    : storePincodes;

  const filteredUnassigned = search
    ? unassigned.filter(p => p.pin.includes(search) || p.area.toLowerCase().includes(search.toLowerCase()))
    : unassigned;

  // Add pincode to store
  const assignPin = useCallback((pin, area, lat, lng) => {
    setPincodeMap(p => ({
      ...p,
      [pin]: { area, lat, lng, store: selectedStoreId, deliveryTime: Number(selectedStore?.prepTime || 25), fee: 0 }
    }));
    show(pin + ' (' + area + ') assigned to ' + selectedStore?.name);
  }, [selectedStoreId, selectedStore, show]);

  // Remove pincode
  const removePin = useCallback((pin) => {
    setPincodeMap(p => {
      const next = { ...p };
      delete next[pin];
      return next;
    });
    show(pin + ' removed');
  }, [show]);

  // Update delivery settings for a pincode
  const updatePin = useCallback((pin, updates) => {
    setPincodeMap(p => ({ ...p, [pin]: { ...p[pin], ...updates } }));
  }, []);

  // Bulk add selected pincodes
  const bulkAdd = () => {
    bulkSelected.forEach(pin => {
      const pc = allChennaiPincodes.find(p => p.pin === pin);
      if (pc) assignPin(pc.pin, pc.area, pc.lat, pc.lng);
    });
    setBulkSelected(new Set());
    setBulkMode(false);
    show(bulkSelected.size + ' pincodes added');
  };

  // Toggle bulk selection
  const toggleBulk = (pin) => {
    setBulkSelected(p => {
      const next = new Set(p);
      next.has(pin) ? next.delete(pin) : next.add(pin);
      return next;
    });
  };

  // Distance-based bulk select (within X km)
  const selectByRadius = (radiusKm) => {
    if (!selectedStore) return;
    const toRad = d => d * Math.PI / 180;
    const dist = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };
    const nearby = allChennaiPincodes.filter(p =>
      dist(selectedStore.lat, selectedStore.lng, p.lat, p.lng) <= radiusKm &&
      (!pincodeMap[p.pin] || pincodeMap[p.pin].store !== selectedStoreId)
    );
    setBulkSelected(new Set(nearby.map(p => p.pin)));
    show(nearby.length + ' pincodes within ' + radiusKm + 'km selected');
  };

  return (
    <div>
      <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: brand.heading, marginBottom: 4 }}>📍 Pincode → Store Mapping</h2>
      <p style={{ fontSize: 12, color: brand.dim, marginBottom: 16 }}>Map pincodes to stores · Control delivery time & fee · Bulk add by radius</p>

      {/* Store selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {storeList.map(s => (
          <button key={s.id} onClick={() => setSelectedStoreId(s.id)}
            style={{ padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 600, border: '2px solid ' + (selectedStoreId === s.id ? brand.gold : 'transparent'),
              background: selectedStoreId === s.id ? brand.gold + '15' : 'rgba(255,255,255,.03)', color: selectedStoreId === s.id ? brand.gold : brand.dim, cursor: 'pointer' }}>
            {s.name}
            <span style={{ display: 'block', fontSize: 9, color: brand.dim, marginTop: 2 }}>{s.area}</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 10, marginBottom: 16 }}>
        <StatCard label="Pincodes Mapped" value={stats.total} color={brand.gold} icon="📍" />
        <StatCard label="Free Delivery" value={stats.freeDelivery} color={brand.emerald} icon="🆓" />
        <StatCard label="Avg Delivery" value={stats.avgTime + ' min'} color={brand.blue} icon="⏱" />
        <StatCard label="Max Delivery" value={stats.maxTime + ' min'} color={brand.saffron} icon="🔥" />
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[
          { k: 'map', l: '🗺 Map View' }, { k: 'list', l: '📋 Pincode List' },
          { k: 'add', l: '➕ Add Pincodes' }, { k: 'delivery', l: '🛵 Delivery Config' },
          { k: 'partners', l: '🚀 Partners' },
        ].map(t => (
          <button key={t.k} onClick={() => setSub(t.k)}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', background: sub === t.k ? brand.gold + '22' : 'transparent', color: sub === t.k ? brand.gold : brand.dim, cursor: 'pointer' }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ═══ MAP VIEW — Visual pincode map ═══ */}
      {sub === 'map' && (
        <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, overflow: 'hidden' }}>
          {/* Map container with pins */}
          <div style={{ position: 'relative', height: 420, background: '#111' }}>
            {/* Google Maps Embed - shows store + pincode areas */}
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${selectedStore?.lat || 13.04},${selectedStore?.lng || 80.23}&zoom=12`}
              style={{ width: '100%', height: '100%', border: 0 }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
            />
            {/* Pincode overlay */}
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,.85)', borderRadius: 10, padding: '10px 14px', maxHeight: 300, overflowY: 'auto' }}>
              <div style={{ fontSize: 10, color: brand.gold, fontWeight: 700, marginBottom: 6 }}>📍 {storePincodes.length} PINCODES</div>
              {storePincodes.slice(0, 15).map(p => (
                <div key={p.pin} style={{ fontSize: 10, color: brand.heading, padding: '2px 0', display: 'flex', gap: 6 }}>
                  <span style={{ color: brand.gold, fontFamily: 'monospace' }}>{p.pin}</span>
                  <span style={{ color: brand.dim }}>{p.area}</span>
                  <span style={{ color: p.fee === 0 ? brand.emerald : brand.saffron, marginLeft: 'auto' }}>{p.fee === 0 ? 'FREE' : '₹' + p.fee}</span>
                </div>
              ))}
              {storePincodes.length > 15 && <div style={{ fontSize: 9, color: brand.dim, marginTop: 4 }}>+{storePincodes.length - 15} more</div>}
            </div>
            {/* Store marker info */}
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,.85)', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 12, color: brand.heading, fontWeight: 700 }}>{selectedStore?.name}</div>
              <div style={{ fontSize: 10, color: brand.dim }}>{selectedStore?.address}</div>
              <div style={{ fontSize: 10, color: brand.gold, marginTop: 4 }}>Prep: {selectedStore?.prepTime}min · {selectedStore?.hours}</div>
            </div>
          </div>

          {/* Quick radius select */}
          <div style={{ padding: 14, borderTop: '1px solid ' + brand.border, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Bulk select by radius:</span>
            {[3, 5, 8, 10, 15].map(r => (
              <button key={r} onClick={() => { selectByRadius(r); setSub('add'); }}
                style={{ padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid ' + brand.border, background: 'transparent', color: brand.blue, cursor: 'pointer' }}>
                {r}km
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ═══ PINCODE LIST — Current mappings ═══ */}
      {sub === 'list' && (
        <div>
          <input placeholder="Search pincode or area..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 300, marginBottom: 14, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, borderRadius: 10, padding: '10px 14px', color: brand.heading, fontSize: 13, outline: 'none', width: '100%' }} />

          <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 80px 50px', gap: 8, padding: '10px 16px', borderBottom: '1px solid ' + brand.border, fontSize: 10, fontWeight: 700, color: brand.dim }}>
              <span>PIN</span><span>AREA</span><span>TIME</span><span>FEE</span><span></span>
            </div>
            {filtered.map(p => (
              <div key={p.pin} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 80px 80px 50px', gap: 8, padding: '10px 16px', borderBottom: '1px solid ' + brand.border + '15', alignItems: 'center', fontSize: 12 }}>
                <span style={{ fontFamily: 'monospace', color: brand.gold, fontWeight: 700 }}>{p.pin}</span>
                <span style={{ color: brand.heading }}>{p.area}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="number" value={p.deliveryTime} onChange={e => updatePin(p.pin, { deliveryTime: Number(e.target.value) })}
                    style={{ width: 45, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, borderRadius: 6, padding: '4px 6px', color: brand.heading, fontSize: 12, outline: 'none', textAlign: 'center' }} />
                  <span style={{ fontSize: 10, color: brand.dim }}>min</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 10, color: brand.dim }}>₹</span>
                  <input type="number" value={p.fee} onChange={e => updatePin(p.pin, { fee: Number(e.target.value) })}
                    style={{ width: 45, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, borderRadius: 6, padding: '4px 6px', color: brand.heading, fontSize: 12, outline: 'none', textAlign: 'center' }} />
                </div>
                <button onClick={() => removePin(p.pin)} style={{ fontSize: 10, color: brand.red, background: brand.red + '12', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: brand.dim, fontSize: 13 }}>No pincodes mapped yet. Go to "Add Pincodes" tab.</div>}
          </div>
        </div>
      )}

      {/* ═══ ADD PINCODES — Bulk add from available list ═══ */}
      {sub === 'add' && (
        <div>
          {/* Bulk actions bar */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <input placeholder="Search available pincodes..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, borderRadius: 10, padding: '10px 14px', color: brand.heading, fontSize: 13, outline: 'none' }} />
            <span style={{ fontSize: 11, color: brand.dim }}>Select by radius:</span>
            {[3, 5, 8, 10].map(r => (
              <button key={r} onClick={() => selectByRadius(r)}
                style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid ' + brand.blue + '40', background: brand.blue + '10', color: brand.blue, cursor: 'pointer' }}>
                {r}km
              </button>
            ))}
            {bulkSelected.size > 0 && (
              <button onClick={bulkAdd}
                style={{ padding: '8px 18px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: brand.emerald, color: '#fff', border: 'none', cursor: 'pointer' }}>
                ✅ Add {bulkSelected.size} Pincodes
              </button>
            )}
          </div>

          {/* Available pincodes grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
            {filteredUnassigned.map(p => {
              const selected = bulkSelected.has(p.pin);
              const alreadyAssigned = pincodeMap[p.pin]?.store === selectedStoreId;
              return (
                <div key={p.pin} onClick={() => toggleBulk(p.pin)}
                  style={{ padding: '12px 14px', borderRadius: 12, cursor: 'pointer', border: '2px solid ' + (selected ? brand.emerald : alreadyAssigned ? brand.dim + '40' : brand.border),
                    background: selected ? brand.emerald + '12' : brand.card, transition: 'all .15s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: selected ? brand.emerald : brand.heading }}>{p.pin}</span>
                    {selected && <span style={{ fontSize: 14 }}>✅</span>}
                    {alreadyAssigned && <Badge color={brand.dim}>Assigned</Badge>}
                  </div>
                  <div style={{ fontSize: 12, color: brand.dim, marginTop: 4 }}>{p.area}</div>
                </div>
              );
            })}
          </div>
          {filteredUnassigned.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: brand.dim }}>All pincodes assigned! 🎉</div>}
        </div>
      )}

      {/* ═══ DELIVERY CONFIG — Store-level delivery settings ═══ */}
      {sub === 'delivery' && selectedStore && (
        <div style={{ maxWidth: 520 }}>
          <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: brand.gold, marginBottom: 16 }}>🏪 {selectedStore.name} — Delivery Settings</div>

            {[
              { key: 'prepTime', label: 'Kitchen Prep Time (min)', type: 'number' },
              { key: 'hours', label: 'Operating Hours', type: 'text' },
              { key: 'status', label: 'Store Status', type: 'select', options: ['active', 'paused', 'closed', 'maintenance'] },
              { key: 'type', label: 'Store Type', type: 'select', options: ['flagship', 'premium', 'express', 'cloud', 'franchise'] },
            ].map(f => (
              <div key={f.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid ' + brand.border + '15' }}>
                <span style={{ fontSize: 13, color: brand.heading }}>{f.label}</span>
                {f.type === 'select' ? (
                  <select value={selectedStore[f.key]} onChange={e => updateStore(selectedStoreId, { [f.key]: e.target.value })}
                    style={{ width: 180, background: 'rgba(255,255,255,.06)', border: '1px solid ' + brand.border, borderRadius: 8, padding: '6px 10px', color: brand.heading, fontSize: 13, outline: 'none' }}>
                    {f.options.map(o => <option key={o} value={o} style={{ background: brand.bg2 }}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type} value={selectedStore[f.key] || ''} onChange={e => updateStore(selectedStoreId, { [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value })}
                    style={{ width: 180, textAlign: 'right', background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, borderRadius: 8, padding: '6px 10px', color: brand.heading, fontSize: 13, outline: 'none' }} />
                )}
              </div>
            ))}
          </div>

          {/* Bulk delivery time update */}
          <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, padding: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: brand.blue, marginBottom: 14 }}>⏱ Bulk Update Delivery Times</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'All ≤3km → 20min, Free', fn: () => storePincodes.forEach(p => { /* would need distance calc */ }) },
              ].map(() => null)}
              <span style={{ fontSize: 11, color: brand.dim }}>Set all pincodes to:</span>
              <input type="number" value={editTime} onChange={e => setEditTime(e.target.value)} placeholder="min" style={{ width: 60, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, borderRadius: 8, padding: '6px 10px', color: brand.heading, fontSize: 13, outline: 'none', textAlign: 'center' }} />
              <span style={{ fontSize: 11, color: brand.dim }}>min, ₹</span>
              <input type="number" value={editFee} onChange={e => setEditFee(e.target.value)} placeholder="fee" style={{ width: 60, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, borderRadius: 8, padding: '6px 10px', color: brand.heading, fontSize: 13, outline: 'none', textAlign: 'center' }} />
              <button onClick={() => {
                storePincodes.forEach(p => updatePin(p.pin, { deliveryTime: Number(editTime), fee: Number(editFee) }));
                show('All ' + storePincodes.length + ' pincodes updated');
              }} style={{ padding: '6px 16px', borderRadius: 8, background: brand.blue, color: '#fff', fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                Apply All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PARTNERS — Chennai hyperlocal delivery partners ═══ */}
      {sub === 'partners' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10 }}>
          {chennaiDeliveryPartners.map(p => (
            <div key={p.key} style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: brand.heading }}>{p.name}</div>
                <Badge color={p.color}>{p.type}</Badge>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <a href={p.docs} target="_blank" rel="noopener"
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 600, background: p.color + '15', color: p.color, border: 'none', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                  📄 Docs
                </a>
                <button onClick={() => show('Configure ' + p.name + ' in Partners → Delivery section')}
                  style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid ' + brand.border, background: 'transparent', color: brand.dim, cursor: 'pointer' }}>
                  ⚙️ Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(PincodeManager);
