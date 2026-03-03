'use client';
import { useState } from 'react';
import WhatsAppAssist from '@/components/admin/WhatsAppAssist';

const SAMPLE_ORDERS = [
  { id: 1847, customer: 'Rahul Sharma', items: 'Chicken Biryani x2, Raita x2', total: 796, status: 'preparing', time: '2 min ago', area: 'Banjara Hills', phone: '+91 98765 43210' },
  { id: 1846, customer: 'Priya Patel', items: 'Mutton Biryani x1, Chicken 65 x1', total: 648, status: 'out_for_delivery', time: '12 min ago', area: 'Jubilee Hills', phone: '+91 87654 32109' },
  { id: 1845, customer: 'Ahmed Khan', items: 'Veg Biryani x3, Mirchi Ka Salan x2', total: 945, status: 'delivered', time: '25 min ago', area: 'Tolichowki', phone: '+91 76543 21098' },
  { id: 1844, customer: 'Sneha Reddy', items: 'Chicken Biryani x1, Double Ka Meetha x2', total: 647, status: 'preparing', time: '5 min ago', area: 'Gachibowli', phone: '+91 65432 10987' },
  { id: 1843, customer: 'Vikram Singh', items: 'Haleem x2, Raita x2', total: 696, status: 'confirmed', time: '1 min ago', area: 'Hitech City', phone: '+91 54321 09876' },
];

const STATUS_STYLES = {
  confirmed: { label: 'Confirmed', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.12)' },
  preparing: { label: 'Preparing', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.12)' },
  out_for_delivery: { label: 'Out for Delivery', color: '#3DD8F5', bg: 'rgba(61, 216, 245, 0.12)' },
  delivered: { label: 'Delivered', color: '#34D399', bg: 'rgba(52, 211, 153, 0.12)' },
  cancelled: { label: 'Cancelled', color: '#F87171', bg: 'rgba(248, 113, 113, 0.12)' },
};

export default function OrdersPage() {
  const [orders] = useState(SAMPLE_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [waMessage, setWaMessage] = useState('');

  const handleWhatsAppAssist = (order) => {
    setSelectedOrder(order);
    setWaMessage(`Where is my order? I ordered ${order.items}`);
    setShowWhatsApp(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#F0F4F8', fontFamily: "'Fraunces', Georgia, serif", marginBottom: 4 }}>
            Orders
          </h1>
          <p style={{ fontSize: 12, color: '#64748B' }}>
            {orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length} active •{' '}
            {orders.length} total today
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {/* Orders List */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.02)',
              overflow: 'hidden',
            }}
          >
            {orders.map((order, i) => {
              const status = STATUS_STYLES[order.status] || STATUS_STYLES.confirmed;
              return (
                <div
                  key={order.id}
                  style={{
                    padding: '16px 18px',
                    borderBottom: i < orders.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    cursor: 'pointer',
                    background: selectedOrder?.id === order.id ? 'rgba(61, 216, 245, 0.04)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => setSelectedOrder(order)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#E2E8F0' }}>#{order.id}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>{order.customer}</span>
                    </div>
                    <span
                      style={{
                        padding: '3px 10px',
                        borderRadius: 20,
                        fontSize: 10,
                        fontWeight: 700,
                        color: status.color,
                        background: status.bg,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>{order.items}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#3DD8F5' }}>₹{order.total}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, color: '#475569' }}>{order.area} • {order.time}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppAssist(order);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 6,
                          border: '1px solid rgba(37, 211, 102, 0.2)',
                          background: 'rgba(37, 211, 102, 0.08)',
                          color: '#25D366',
                          fontSize: 10,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        💬 WA
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* WhatsApp Assist Panel */}
        {showWhatsApp && selectedOrder && (
          <div style={{ width: 340, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8' }}>WhatsApp Assist</span>
              <button
                onClick={() => setShowWhatsApp(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 14 }}
              >
                ✕
              </button>
            </div>
            <WhatsAppAssist
              customerMessage={waMessage}
              context={{
                customerName: selectedOrder.customer,
                orderId: selectedOrder.id,
                orderStatus: STATUS_STYLES[selectedOrder.status]?.label,
                eta: '15-20 minutes',
              }}
              onSelectReply={(msg) => {
                console.log('Send WhatsApp:', msg, 'to', selectedOrder.phone);
                setShowWhatsApp(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
