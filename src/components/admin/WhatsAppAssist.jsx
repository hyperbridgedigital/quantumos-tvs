'use client';
import { useState, memo } from 'react';
import { generateWhatsAppSuggestions } from '@/lib/kynetra/prompts/whatsapp-assist';

function WhatsAppAssist({ customerMessage, context = {}, onSelectReply }) {
  const [suggestions] = useState(() => generateWhatsAppSuggestions(customerMessage, context));
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const handleSelect = (idx) => {
    setSelectedIdx(idx);
    setEditText(suggestions[idx].message);
    setEditing(false);
  };

  const handleSend = () => {
    const message = editing ? editText : suggestions[selectedIdx]?.message;
    if (message && onSelectReply) {
      onSelectReply(message);
    }
  };

  const toneColors = {
    friendly: { bg: 'rgba(52, 211, 153, 0.08)', border: '#34D399', label: '😊 Friendly' },
    formal: { bg: 'rgba(96, 165, 250, 0.08)', border: '#60A5FA', label: '📋 Formal' },
    empathetic: { bg: 'rgba(251, 191, 36, 0.08)', border: '#FBBF24', label: '🤝 Empathetic' },
    retention: { bg: 'rgba(168, 85, 247, 0.08)', border: '#A855F7', label: '🎯 Retention' },
    casual: { bg: 'rgba(52, 211, 153, 0.06)', border: '#34D399', label: '👋 Casual' },
  };

  return (
    <div
      style={{
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14 }}>💬</span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #3DD8F5, #2B7FE0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '.05em',
          }}
        >
          KYNETRA WHATSAPP ASSIST
        </span>
      </div>

      {/* Customer message preview */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: 9, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Customer Message
        </div>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            background: 'rgba(37, 211, 102, 0.08)',
            border: '1px solid rgba(37, 211, 102, 0.15)',
            fontSize: 12,
            color: '#94A3B8',
            lineHeight: 1.4,
          }}
        >
          {customerMessage}
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 9, color: '#64748B', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Suggested Replies
        </div>

        {suggestions.map((s, idx) => {
          const tone = toneColors[s.tone] || toneColors.friendly;
          const isSelected = selectedIdx === idx;

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${isSelected ? tone.border : 'rgba(255,255,255,0.06)'}`,
                background: isSelected ? tone.bg : 'transparent',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: tone.border, fontWeight: 700 }}>{tone.label}</span>
                {isSelected && (
                  <span style={{ fontSize: 10, color: '#34D399' }}>✓ Selected</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: isSelected ? '#E2E8F0' : '#94A3B8', lineHeight: 1.4 }}>
                {s.message}
              </div>
            </button>
          );
        })}
      </div>

      {/* Edit & Send */}
      {selectedIdx !== null && (
        <div style={{ padding: '0 14px 14px' }}>
          {editing ? (
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{
                width: '100%',
                minHeight: 80,
                padding: 10,
                borderRadius: 8,
                border: '1px solid rgba(61, 216, 245, 0.2)',
                background: 'rgba(255,255,255,0.03)',
                color: '#E2E8F0',
                fontSize: 12,
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit',
                marginBottom: 8,
              }}
            />
          ) : null}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setEditing(!editing)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: '#94A3B8',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {editing ? 'Cancel Edit' : '✏️ Edit'}
            </button>
            <button
              onClick={handleSend}
              style={{
                flex: 1,
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📤 Send via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(WhatsAppAssist);
