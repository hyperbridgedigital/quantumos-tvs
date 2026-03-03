'use client';
import { useState, useRef, useEffect, memo } from 'react';
import { useKynetra } from '@/lib/kynetra/useKynetra';

const QUICK_PROMPTS = [
  { label: "Today's Sales", prompt: "Show me today's sales summary" },
  { label: 'Low Stock', prompt: 'Which items are running low on stock?' },
  { label: 'Menu Insights', prompt: 'Give me menu performance insights' },
  { label: 'Active Orders', prompt: 'Show active orders status' },
];

function KynetraChat({ className = '' }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to Kynetra AI. I'm your operations assistant for Charminar Mehfil. Ask me about sales, menu, orders, inventory, or anything else.",
      actions: [],
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { sendMessage, executeAction, isLoading } = useKynetra();
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (text) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    const response = await sendMessage({
      message: msg,
      context: {
        domain: 'restaurant',
        businessName: 'Charminar Mehfil',
        capabilities: ['menu_crud', 'order_mgmt', 'analytics', 'inventory'],
      },
    });

    if (response) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.message,
          actions: response.suggestedActions || [],
        },
      ]);
    }
  };

  const handleAction = async (action) => {
    if (action.type === 'navigate') {
      return;
    }
    const result = await executeAction(action);
    if (result?.message) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.message, actions: [] },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          boxShadow: '0 8px 32px rgba(61, 216, 245, 0.3)',
          zIndex: 1000,
          transition: 'transform 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => { e.target.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
        aria-label="Open Kynetra AI Chat"
      >
        🤖
      </button>
    );
  }

  return (
    <div
      className={`kyn-scroll ${className}`}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 380,
        maxHeight: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        background: '#070B14',
        borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        zIndex: 1000,
        overflow: 'hidden',
        animation: 'kynetraBubble 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
            }}
          >
            🤖
          </div>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Kynetra AI
            </div>
            <div style={{ fontSize: 10, color: '#64748B' }}>Charminar Mehfil Ops</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: '#94A3B8',
            width: 28,
            height: 28,
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="kyn-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxHeight: 400,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className="kyn-bubble"
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                background:
                  msg.role === 'user'
                    ? 'linear-gradient(135deg, #3DD8F5, #2B7FE0)'
                    : 'rgba(255,255,255,0.05)',
                color: msg.role === 'user' ? '#070B14' : '#E2E8F0',
                fontSize: 13,
                lineHeight: 1.5,
                fontWeight: msg.role === 'user' ? 600 : 400,
              }}
            >
              {msg.content}
            </div>

            {/* Action Buttons */}
            {msg.actions?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {msg.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleAction(action)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(61, 216, 245, 0.2)',
                      background: 'rgba(61, 216, 245, 0.08)',
                      color: '#3DD8F5',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(61, 216, 245, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(61, 216, 245, 0.08)';
                    }}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start' }}>
            <div
              className="kyn-typing"
              style={{
                padding: '12px 16px',
                borderRadius: '14px 14px 14px 4px',
                background: 'rgba(255,255,255,0.05)',
              }}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div style={{ padding: '0 16px 8px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUICK_PROMPTS.map((qp) => (
            <button
              key={qp.label}
              onClick={() => handleSubmit(qp.prompt)}
              style={{
                padding: '5px 10px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: '#94A3B8',
                fontSize: 11,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = 'rgba(61, 216, 245, 0.3)';
                e.target.style.color = '#3DD8F5';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                e.target.style.color = '#94A3B8';
              }}
            >
              {qp.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: 8,
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Kynetra anything..."
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 10,
            padding: '10px 14px',
            color: '#E2E8F0',
            fontSize: 13,
            outline: 'none',
            fontFamily: 'inherit',
          }}
          disabled={isLoading}
        />
        <button
          onClick={() => handleSubmit()}
          disabled={isLoading || !input.trim()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: 'none',
            background:
              input.trim() && !isLoading
                ? 'linear-gradient(135deg, #3DD8F5, #2B7FE0)'
                : 'rgba(255,255,255,0.05)',
            color: input.trim() && !isLoading ? '#070B14' : '#64748B',
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}

export default memo(KynetraChat);
