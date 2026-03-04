'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { matchTemplate, resolveAction } from '@/data/kynetraTemplates';

const MODULES = [
  { key: 'sales', label: 'Sales', icon: '📋' },
  { key: 'pre_sales', label: 'Pre-sales', icon: '💡' },
  { key: 'post_sales', label: 'Post-sales', icon: '🔄' },
  { key: 'build_pc', label: 'Build PC', icon: '🖥️' },
  { key: 'csr', label: 'Help (CSR)', icon: '📞' },
];

const WELCOME_MSG = `👋 Hi! I'm Kynetra — your Sales, Pre-sales, Post-sales & Build PC assistant.\n\n📋 Sales — Products, offers, franchise\n💡 Pre-sales — Recommendations, Build PC\n🔄 Post-sales — Track, refund, reorder\n🖥️ Build PC — Configurator, compatibility\n📞 Help — FAQs, contact\n\nPowered by TheReelFactory & HyperBridge`;

function runAction(resolved) {
  if (!resolved || typeof window === 'undefined') return;
  if (resolved.type === 'navigate') {
    window.dispatchEvent(new CustomEvent('tvs-navigate', {
      detail: { tab: resolved.tab, category: resolved.category, preset: resolved.preset },
    }));
  }
  if (resolved.type === 'contact' && resolved.phone) {
    window.open('tel:' + resolved.phone.replace(/\s/g, ''), '_self');
  }
  if (resolved.type === 'add_to_cart' && resolved.productId) {
    window.dispatchEvent(new CustomEvent('tvs-action', { detail: { type: 'add_to_cart', productId: resolved.productId } }));
  }
}

function KynetraAgent() {
  const { kynetraTemplates, storeTheme } = useApp();
  const theme = storeTheme === 'dark' ? brand.storeDark : brand;
  const [open, setOpen] = useState(false);
  const [module, setModule] = useState('sales');
  const [msgs, setMsgs] = useState([
    { from: 'bot', text: WELCOME_MSG, time: new Date(), intent: null },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const sendMsgRef = useRef(null);

  // Deep integration: open Kynetra from anywhere with optional pre-filled message
  useEffect(() => {
    const handler = (e) => {
      const { message, send = true } = e.detail || {};
      setOpen(true);
      if (message && sendMsgRef.current) {
        if (send) setTimeout(() => sendMsgRef.current(message), 100);
        else setInput(message);
      }
    };
    window.addEventListener('kynetra-open', handler);
    return () => window.removeEventListener('kynetra-open', handler);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendMsg = async (text) => {
    if (!text.trim()) return;
    const userMsg = { from: 'user', text: text.trim(), time: new Date() };
    setMsgs((p) => [...p, userMsg]);
    setInput('');
    setTyping(true);

    const template = matchTemplate(text.trim(), kynetraTemplates || []);
    if (template) {
      const resolved = resolveAction(template);
      runAction(resolved);
      const replyText = template.replyText || "I'm here to help. Use the quick replies below.";
      const suggestedReplies = template.suggestedReplies || [];
      setMsgs((p) => [
        ...p,
        {
          from: 'bot',
          text: replyText + (suggestedReplies.length ? '\n\nQuick: ' + suggestedReplies.slice(0, 3).join(' · ') : ''),
          time: new Date(),
          intent: template.module,
          suggestedReplies,
        },
      ]);
      setTyping(false);
      return;
    }

    try {
      const res = await fetch('/api/kynetra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), module }),
      });
      const data = await res.json();
      const botReply = {
        from: 'bot',
        text: data.reply || "I'm here to help. Use the quick replies or ask: Menu, Track order, Build PC, or Refund.",
        time: new Date(),
        intent: data.intent || 'csr',
      };
      setMsgs((p) => [...p, botReply]);
    } catch (e) {
      setMsgs((p) => [
        ...p,
        {
          from: 'bot',
          text: "Sorry, I couldn't reach the server. Please try again or call +91 98765 43210.\n\n— Kynetra · Powered by TheReelFactory & HyperBridge",
          time: new Date(),
          intent: 'csr',
        },
      ]);
    } finally {
      setTyping(false);
    }
  };
  sendMsgRef.current = sendMsg;

  const G = brand.green || '#1B5E20';
  const GM = brand.greenMint || '#E8F5E9';

  const repliesByModule = {
    sales: [
      { label: 'Shop & products', msg: 'Show me products and deals' },
      { label: 'Deals', msg: 'What offers do you have?' },
      { label: 'Franchise', msg: 'Franchise inquiry' },
    ],
    pre_sales: [
      { label: 'Build a PC', msg: 'I want to build a PC' },
      { label: 'Which GPU?', msg: 'Which graphics card should I buy?' },
      { label: 'Budget 50k', msg: 'Best PC under 50k' },
    ],
    post_sales: [
      { label: 'Track order', msg: 'Track my order' },
      { label: 'Refund', msg: 'I want a refund' },
      { label: 'Complaint', msg: 'I have a complaint' },
    ],
    build_pc: [
      { label: 'Open Build PC', msg: 'Open the Build PC configurator' },
      { label: 'Compatibility', msg: 'Check PC part compatibility' },
      { label: 'Budget build', msg: 'Suggest a budget gaming build' },
    ],
    csr: [
      { label: 'Help', msg: 'I need help' },
      { label: 'Contact', msg: 'Speak to someone' },
      { label: 'FAQ', msg: 'FAQs' },
    ],
  };
  const replies = repliesByModule[module] || repliesByModule.sales;

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Kynetra assistant"
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 9998,
          width: 56,
          height: 56,
          borderRadius: 28,
          border: 'none',
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          color: '#fff',
          fontSize: 26,
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(27,94,32,.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform .2s',
        }}
      >
        💬
      </button>
    );

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9998,
        width: 380,
        maxWidth: 'calc(100vw - 24px)',
        height: 560,
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 50px rgba(0,0,0,.2)',
        border: '1px solid ' + theme.storeBorder,
        background: theme.storeBg,
      }}
    >
      <div style={{ background: G, padding: '12px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: brand.fontDisplay, fontSize: 11, color: '#fff', fontWeight: 800 }}>K</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Kynetra</div>
              <div style={{ color: '#C8E6C9', fontSize: 10 }}>Sales · Pre-sales · Post-sales · Build PC · CSR</div>
            </div>
          </div>
          <button onClick={() => setOpen(false)} style={{ color: '#fff', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
          {MODULES.map((m) => (
            <button
              key={m.key}
              onClick={() => setModule(m.key)}
              style={{
                padding: '6px 12px',
                borderRadius: 10,
                border: 'none',
                background: module === m.key ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', background: theme.storeBg2 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: 14,
                background: m.from === 'user' ? GM : theme.storeCard,
                border: '1px solid ' + (m.from === 'user' ? '#C8E6C9' : theme.storeBorder),
                borderBottomRightRadius: m.from === 'user' ? 4 : 14,
                borderBottomLeftRadius: m.from === 'bot' ? 4 : 14,
                boxShadow: '0 1px 2px rgba(0,0,0,.06)',
              }}
            >
              <div style={{ fontSize: 13, color: theme.storeHeading, whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{m.text}</div>
              <div style={{ fontSize: 9, color: theme.storeDim, textAlign: 'right', marginTop: 4 }}>{m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', marginBottom: 8 }}>
            <div style={{ padding: '10px 16px', borderRadius: 14, background: theme.storeCard, border: '1px solid ' + theme.storeBorder, boxShadow: '0 1px 2px rgba(0,0,0,.06)' }}>
              <span style={{ fontSize: 13, color: theme.storeDim }}>Kynetra typing<span style={{ animation: 'pulse 1s infinite' }}>...</span></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: '8px 12px', background: theme.storeBg, borderTop: '1px solid ' + theme.storeBorder, display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0 }}>
        {replies.map((q) => (
          <button
            key={q.label}
            onClick={() => sendMsg(q.msg)}
            style={{ padding: '6px 12px', borderRadius: 16, border: '1px solid ' + theme.storeBorder, background: theme.storeBg2, color: theme.storeHeading, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '10px 12px', background: theme.storeBg, borderTop: '1px solid ' + theme.storeBorder, display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMsg(input)}
          placeholder="Ask anything — products, Build PC, track order..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: '1px solid ' + theme.storeBorder, background: theme.storeBg2, fontSize: 13, outline: 'none', color: theme.storeHeading }}
        />
        <button onClick={() => sendMsg(input)} style={{ width: 40, height: 40, borderRadius: 20, background: G, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>➤</button>
      </div>

      <div style={{ padding: '6px 12px', background: theme.storeBg2, borderTop: '1px solid ' + theme.storeBorder, textAlign: 'center', fontSize: 9, color: theme.storeDim, fontWeight: 600, letterSpacing: '.05em', flexShrink: 0 }}>
        Powered by TheReelFactory & HyperBridge · QuantumOS
      </div>
    </div>
  );
}

export default memo(KynetraAgent);
