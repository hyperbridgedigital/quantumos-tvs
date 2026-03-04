'use client';
import { useState, useRef, useEffect, memo } from 'react';
import { brand } from '@/lib/brand';

const QUICK_REPLIES = [
  { label: '🛒 Shop', msg: 'Show me gaming PCs and laptops' },
  { label: '📦 Track Order', msg: 'Track my order' },
  { label: '⚡ Deals', msg: 'What deals do you have?' },
  { label: '🔧 PC Builder', msg: 'PC Builder' },
  { label: '📞 Support', msg: 'I need help' },
];

const BOT_RESPONSES = {
  shop: "🛒 *TheValueStore — Shop*\n\n🖥️ Gaming PCs from ₹85K\n💻 Gaming Laptops from ₹75K\n🎮 RTX 4070 Super — ₹59K\n⌨️ Keyboards, headsets, monitors\n\nUse *WELCOME15* for 15% off first order (max ₹2K).\n\nTap the Shop tab to browse!",
  track: "📦 Share your Order ID and I'll check the status right away.",
  deals: "⚡ *Active Deals:*\n\n✅ GPUFLASH — ₹3K off RTX GPUs\n✅ LAPTOP7K — ₹7K off select laptops\n✅ WELCOME15 — 15% off first order (max ₹2K)\n✅ STUDENT10 — 10% for students\n\nApply at checkout!",
  builder: "🔧 PC Builder: compatibility check, wattage calculator, save & share your build. Tap the PC Builder tab!",
  help: "👋 TheValueStore — Best Value. Maximum Performance.\n\n🛒 Shop — PCs, laptops, components\n📦 Track — Order status\n⚡ Deals — Coupons & flash sales\n🔧 PC Builder — Build your rig\n\nOr type your question!",
  default: "Thanks for your message! I can help with Shop, Track order, Deals, or PC Builder. Type *help* for options.",
};

function getResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.match(/shop|pc|laptop|gpu|component|gaming/)) return BOT_RESPONSES.shop;
  if (lower.match(/track|status|where|delivery|order id/)) return BOT_RESPONSES.track;
  if (lower.match(/offer|discount|coupon|deal|code/)) return BOT_RESPONSES.deals;
  if (lower.match(/builder|build|pc build/)) return BOT_RESPONSES.builder;
  if (lower.match(/help|support|issue|problem|hi|hello/)) return BOT_RESPONSES.help;
  return BOT_RESPONSES.default;
}

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from: 'bot', text: "👋 Welcome to TheValueStore!\n\nI'm your tech & gaming assistant. How can I help?", time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);
  const accent = brand.blueElectric;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const sendMsg = (text) => {
    if (!text.trim()) return;
    const userMsg = { from: 'user', text: text.trim(), time: new Date() };
    setMsgs(p => [...p, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const botReply = { from: 'bot', text: getResponse(text), time: new Date() };
      setMsgs(p => [...p, botReply]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9998,
      width: 56, height: 56, borderRadius: 28, border: 'none',
      background: '#25D366', color: '#fff', fontSize: 26,
      cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,211,102,.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'transform .2s',
    }}>
      💬
    </button>
  );

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 9998,
      width: 360, height: 520, borderRadius: 20, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 10px 50px rgba(0,0,0,.2)', border: '1px solid ' + brand.storeBorder,
      background: '#fff',
    }}>
      <div style={{ background: accent, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: brand.fontDisplay, fontSize: 11, color: '#fff', fontWeight: 800 }}>TVS</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>TheValueStore</div>
            <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 10 }}>🟢 Online · Replies instantly</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{ color: '#fff', background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', padding: 4 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', background: brand.storeBg2 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
            <div style={{
              maxWidth: '82%', padding: '10px 14px', borderRadius: 14,
              background: m.from === 'user' ? '#EFF6FF' : '#fff',
              borderBottomRightRadius: m.from === 'user' ? 4 : 14,
              borderBottomLeftRadius: m.from === 'bot' ? 4 : 14,
              boxShadow: '0 1px 2px rgba(0,0,0,.06)',
            }}>
              <div style={{ fontSize: 13, color: brand.storeHeading, whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>{m.text}</div>
              <div style={{ fontSize: 9, color: brand.storeDim, textAlign: 'right', marginTop: 4 }}>{m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display: 'flex', marginBottom: 8 }}>
            <div style={{ padding: '10px 16px', borderRadius: 14, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,.06)' }}>
              <span style={{ fontSize: 13, color: brand.storeDim }}>typing<span style={{ animation: 'pulse 1s infinite' }}>...</span></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: '6px 12px', background: '#fff', borderTop: '1px solid ' + brand.storeBorder, display: 'flex', gap: 4, overflowX: 'auto', flexShrink: 0 }}>
        {QUICK_REPLIES.map(q => (
          <button key={q.label} onClick={() => sendMsg(q.msg)} style={{
            padding: '6px 12px', borderRadius: 16, border: '1px solid #BFDBFE',
            background: '#EFF6FF', color: accent, fontSize: 11, fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
          }}>{q.label}</button>
        ))}
      </div>

      <div style={{ padding: '10px 12px', background: '#fff', borderTop: '1px solid ' + brand.storeBorder, display: 'flex', gap: 8, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMsg(input)}
          placeholder="Type a message..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: '1px solid ' + brand.storeBorder, background: brand.storeBg2, fontSize: 13, outline: 'none', color: brand.storeHeading }}
        />
        <button onClick={() => sendMsg(input)} style={{
          width: 40, height: 40, borderRadius: 20, background: accent, color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>➤</button>
      </div>
    </div>
  );
}
export default memo(ChatbotWidget);
