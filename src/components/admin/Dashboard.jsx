'use client';

export default function Dashboard({ liveOrders = [], orders = [], activeStores = [], brand }) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
        <div style={{ padding: 20, background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: brand.emerald }}>{liveOrders.length}</div>
          <div style={{ fontSize: 12, color: brand.dim }}>Active orders</div>
        </div>
        <div style={{ padding: 20, background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏪</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: brand.blue }}>{activeStores.length}</div>
          <div style={{ fontSize: 12, color: brand.dim }}>Stores</div>
        </div>
        <div style={{ padding: 20, background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: brand.gold }}>{orders?.length || 0}</div>
          <div style={{ fontSize: 12, color: brand.dim }}>Total orders</div>
        </div>
      </div>

      {liveOrders.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, color: brand.heading, marginBottom: 12 }}>Recent orders</h2>
          <div style={{ background: brand.card, border: `1px solid ${brand.border}`, borderRadius: 12, overflow: 'hidden' }}>
            {liveOrders.slice(0, 10).map((o) => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, borderBottom: `1px solid ${brand.border}` }}>
                <span style={{ color: brand.heading }}>{o.id}</span>
                <span style={{ color: brand.dim }}>{o.customer} · ₹{Number(o.total).toLocaleString('en-IN')}</span>
                <span style={{ color: brand.emerald }}>{o.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ marginTop: 32, fontSize: 12, color: brand.dim }}>More admin modules can be added here.</p>
    </>
  );
}
