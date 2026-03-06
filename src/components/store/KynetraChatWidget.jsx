'use client';
import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';

/** Strip simple markdown bold for display */
function stripMd(text) {
  if (!text) return '';
  return String(text).replace(/\*([^*]+)\*/g, '$1').replace(/\n/g, ' ');
}

export default function KynetraChatWidget({ onNavigate, storeTab }) {
  const { cart, customerOrders, addToCart, availableProducts, setPendingBuildPresetId } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm Kynetra, your assistant. Ask about orders, offers, Build PC, or type **Track order** with your Order ID.", ts: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: msg, ts: Date.now() }]);
    setLoading(true);
    try {
      const lastOrderId = customerOrders?.[0]?.id || null;
      const res = await fetch('/api/kynetra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          cartIds: (cart || []).map((i) => i.id),
          orderId: lastOrderId,
          storeId: 'ST001',
        }),
      });
      const data = await res.json();
      const reply = data.reply || "I couldn't process that. Try 'Track order' or 'Show offers'.";
      setMessages((m) => [...m, { role: 'bot', text: reply, ts: Date.now(), action: data.action, suggestedReplies: data.suggestedReplies || [] }]);
      if (data.action) {
        if (data.action.type === 'navigate' && data.action.tab) {
          const tab = data.action.tab === 'menu' ? 'shop' : data.action.tab;
          if (tab === 'buildpc' && (data.action.presetId || data.action.preset) && setPendingBuildPresetId) setPendingBuildPresetId(data.action.presetId || data.action.preset);
          if (onNavigate) onNavigate(tab, data.action.category ? `category=${data.action.category}` : undefined);
        }
        if (data.action.type === 'add_to_cart' && data.action.productId && addToCart) {
          const product = (availableProducts || []).find((p) => p.id === data.action.productId);
          if (product) addToCart(product);
        }
      }
    } catch (_) {
      setMessages((m) => [...m, { role: 'bot', text: 'Network error. Please try again.', ts: Date.now() }]);
    }
    setLoading(false);
  };

  const theme = brand.storeDark?.storeBg2 ? { bg: brand.storeDark.storeBg2, border: brand.storeDark.storeBorder, heading: brand.storeDark.storeHeading, text: brand.storeDark.storeText } : { bg: '#1E293B', border: '#475569', heading: '#F8FAFC', text: '#E2E8F0' };
  const G = brand.green;

  return (
    <>
      <button
        type="button"
        aria-label="Open Kynetra chat"
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          background: G,
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,.25)',
          fontSize: 24,
          zIndex: 9998,
          cursor: 'pointer',
        }}
      >
        💬
      </button>
      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: 90,
            right: 24,
            width: 360,
            maxWidth: 'calc(100vw - 48px)',
            height: 480,
            maxHeight: '70vh',
            background: theme.bg,
            border: `1px solid ${theme.border}`,
            borderRadius: 16,
            boxShadow: '0 20px 60px rgba(0,0,0,.3)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, background: 'rgba(0,0,0,.2)', color: theme.heading, fontWeight: 700, fontSize: 14 }}>
            Kynetra · Powered by QuantumOS
          </div>
          <div ref={listRef} style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  background: m.role === 'user' ? G : theme.border,
                  color: '#fff',
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                {stripMd(m.text)}
                {m.role === 'bot' && m.suggestedReplies?.length > 0 && (
                  <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {m.suggestedReplies.slice(0, 5).map((s, j) => (
                      <button
                        key={j}
                        type="button"
                        onClick={() => sendMessage(s)}
                        style={{ padding: '6px 10px', borderRadius: 8, border: 'none', background: 'rgba(255,255,255,.25)', color: '#fff', fontSize: 12, cursor: 'pointer' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12, background: theme.border, color: theme.text, fontSize: 13 }}>
                ...
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
            style={{ padding: 12, borderTop: `1px solid ${theme.border}` }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about orders, offers, Build PC..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: `1px solid ${theme.border}`, background: 'rgba(0,0,0,.2)', color: theme.text, fontSize: 13 }}
            />
          </form>
        </div>
      )}
    </>
  );
}
