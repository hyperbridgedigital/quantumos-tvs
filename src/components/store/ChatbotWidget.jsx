'use client';
import { useState, useRef, useEffect, memo } from 'react';
import { brand } from '@/lib/brand';

const QUICK_REPLIES = [
  { label:'🛒 Shop', msg:'Show me products' },
  { label:'📦 Track Order', msg:'Track my order' },
  { label:'🎁 Offers', msg:'What offers do you have?' },
  { label:'🏢 Franchise', msg:'Franchise inquiry' },
  { label:'📞 Support', msg:'I need help' },
];

const BOT_RESPONSES = {
  menu: "🛒 *" + brand.name + " — Top picks*\n\nBrowse the Shop tab for Gaming PCs, laptops & Build Your PC. Use code *WELCOME20* for 20% off first order!\n\nReply with an item to add to cart 🛒",
  track: "📦 Please share your Order ID (e.g., ORD-7X2K) and I'll check the status for you right away!",
  offers: "🎁 *Active Offers:*\n\n✅ WELCOME20 — 20% off first order\n✅ GAMING50 — ₹500 off gaming PCs\n✅ BUILD100 — ₹1,000 off Build Your PC\n✅ FREESHIP — Free delivery over ₹999\n\nJust mention the code at checkout!",
  franchise: "🏢 Partner with " + brand.name + " — from ₹15L.\n\n✅ Full setup & training\n✅ QuantumOS tech platform\n✅ 18-24 month ROI\n\nShare Name, Phone & City — our team will call in 24 hours!",
  help: "👋 How can I help you?\n\n🛒 Shop — Gaming PCs, laptops, Build PC\n📦 Track — Check order status\n🎁 Offers — See active deals\n🏢 Franchise — Investment info\n📞 Call us: +91 98765 43210\n\nOr just type your question!",
  default: "Thanks for your message! 😊\n\nI can help you with:\n🛒 *Shop* — PCs, laptops, Build PC\n📦 *Track* — Order status\n🎁 *Offers* — Active deals\n\nOr type *help* for more options!",
};

function getResponse(msg) {
  const lower = msg.toLowerCase();
  if (lower.match(/menu|shop|gaming|laptop|build|pc|order|buy|product/)) return BOT_RESPONSES.menu;
  if (lower.match(/track|status|where|delivery|order id/)) return BOT_RESPONSES.track;
  if (lower.match(/offer|discount|coupon|deal|code/)) return BOT_RESPONSES.offers;
  if (lower.match(/franchise|invest|business|own/)) return BOT_RESPONSES.franchise;
  if (lower.match(/help|support|issue|problem|hi|hello/)) return BOT_RESPONSES.help;
  return BOT_RESPONSES.default;
}

function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { from:'bot', text:'👋 Welcome to ' + brand.name + '!\n\nI\'m your assistant. How can I help you today?', time:new Date() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  const sendMsg = (text) => {
    if (!text.trim()) return;
    const userMsg = { from:'user', text: text.trim(), time:new Date() };
    setMsgs(p => [...p, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const botReply = { from:'bot', text: getResponse(text), time: new Date() };
      setMsgs(p => [...p, botReply]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };

  const G = '#1B5E20';

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      position:'fixed', bottom:20, right:20, zIndex:9998,
      width:56, height:56, borderRadius:28, border:'none',
      background:'#25D366', color:'#fff', fontSize:26,
      cursor:'pointer', boxShadow:'0 4px 20px rgba(37,211,102,.4)',
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'transform .2s', animation:'float 3s ease-in-out infinite',
    }}>
      💬
    </button>
  );

  return (
    <div style={{
      position:'fixed', bottom:20, right:20, zIndex:9998,
      width:360, height:520, borderRadius:20, overflow:'hidden',
      display:'flex', flexDirection:'column',
      boxShadow:'0 10px 50px rgba(0,0,0,.2)', border:'1px solid #E0E8E0',
      background:'#fff',
    }}>
      {/* Header */}
      <div style={{ background:G, padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:brand.fontDisplay, fontSize:11, color:'#fff', fontWeight:800 }}>TVS</div>
          <div>
            <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>{brand.name}</div>
            <div style={{ color:'#C8E6C9', fontSize:10 }}>🟢 Online · Usually replies instantly</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} style={{ color:'#fff', background:'none', border:'none', fontSize:18, cursor:'pointer', padding:4 }}>✕</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 14px', background:'#F0F4F0' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start', marginBottom:8 }}>
            <div style={{
              maxWidth:'82%', padding:'10px 14px', borderRadius:14,
              background:m.from==='user'?'#DCF8C6':'#fff',
              borderBottomRightRadius:m.from==='user'?4:14,
              borderBottomLeftRadius:m.from==='bot'?4:14,
              boxShadow:'0 1px 2px rgba(0,0,0,.06)',
            }}>
              <div style={{ fontSize:13, color:'#1A2E1C', whiteSpace:'pre-wrap', lineHeight:1.45 }}>{m.text}</div>
              <div style={{ fontSize:9, color:'#8A9588', textAlign:'right', marginTop:4 }}>{m.time.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ display:'flex', marginBottom:8 }}>
            <div style={{ padding:'10px 16px', borderRadius:14, background:'#fff', boxShadow:'0 1px 2px rgba(0,0,0,.06)' }}>
              <span style={{ fontSize:13, color:'#8A9588' }}>typing<span style={{ animation:'pulse 1s infinite' }}>...</span></span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      <div style={{ padding:'6px 12px', background:'#fff', borderTop:'1px solid #E0E8E0', display:'flex', gap:4, overflowX:'auto', flexShrink:0 }}>
        {QUICK_REPLIES.map(q => (
          <button key={q.label} onClick={() => sendMsg(q.msg)} style={{
            padding:'6px 12px', borderRadius:16, border:'1px solid #C8E6C9',
            background:'#E8F5E9', color:G, fontSize:11, fontWeight:600,
            cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
          }}>{q.label}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding:'10px 12px', background:'#fff', borderTop:'1px solid #E0E8E0', display:'flex', gap:8, flexShrink:0 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key==='Enter' && sendMsg(input)}
          placeholder="Type a message..."
          style={{ flex:1, padding:'10px 14px', borderRadius:24, border:'1px solid #DCE6DC', background:'#F8FAF8', fontSize:13, outline:'none', color:'#1A2E1C' }}
        />
        <button onClick={() => sendMsg(input)} style={{
          width:40, height:40, borderRadius:20, background:G, color:'#fff',
          border:'none', cursor:'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center',
        }}>➤</button>
      </div>
    </div>
  );
}
export default memo(ChatbotWidget);
