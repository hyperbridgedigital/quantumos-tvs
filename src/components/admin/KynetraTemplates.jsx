'use client';

import { useState, useMemo, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { Badge } from '@/components/shared/Badge';
import { ACTION_TYPES, KYNETRA_MODULES } from '@/data/kynetraTemplates';

function KynetraTemplates() {
  const { kynetraTemplates, updateKynetraTemplate, resetKynetraTemplates, show } = useApp();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});

  const filtered = useMemo(() => {
    let list = kynetraTemplates || [];
    if (filter !== 'all') list = list.filter((t) => t.module === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.replyText && t.replyText.toLowerCase().includes(q)) ||
          (t.triggerKeywords && t.triggerKeywords.some((k) => k.toLowerCase().includes(q)))
      );
    }
    return list.sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [kynetraTemplates, filter, search]);

  const openEdit = (t) => {
    setEditing(t.id);
    setEditForm({
      name: t.name || '',
      module: t.module || 'csr',
      triggerKeywords: Array.isArray(t.triggerKeywords) ? t.triggerKeywords.join(', ') : '',
      replyText: t.replyText || '',
      action: t.action || 'none',
      actionPayload: typeof t.actionPayload === 'object' ? JSON.stringify(t.actionPayload, null, 0) : '{}',
      suggestedReplies: Array.isArray(t.suggestedReplies) ? t.suggestedReplies.join(', ') : '',
      active: t.active !== false,
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    const t = editForm;
    updateKynetraTemplate(editing, {
      name: t.name,
      module: t.module,
      triggerKeywords: (t.triggerKeywords || '').split(',').map((k) => k.trim()).filter(Boolean),
      replyText: t.replyText,
      action: t.action,
      actionPayload: (() => {
        try {
          return JSON.parse(t.actionPayload || '{}');
        } catch {
          return {};
        }
      })(),
      suggestedReplies: (t.suggestedReplies || '').split(',').map((r) => r.trim()).filter(Boolean),
      active: t.active,
    });
    setEditing(null);
    setEditForm({});
    show('Template updated');
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };

  return (
    <div>
      <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: brand.heading, marginBottom: 4 }}>💬 Kynetra Action Templates</h2>
      <p style={{ fontSize: 12, color: brand.dim, marginBottom: 16 }}>50 templates: match user prompts → reply + run action (navigate, open Build PC, show offers, etc.). Edits apply on the storefront immediately.</p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
        <input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 220, padding: '10px 14px', borderRadius: 10, border: '1px solid ' + brand.border, background: 'rgba(255,255,255,.04)', color: brand.heading, fontSize: 13, outline: 'none' }}
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid ' + brand.border, background: 'rgba(255,255,255,.04)', color: brand.heading, fontSize: 13 }}
        >
          <option value="all">All modules</option>
          {KYNETRA_MODULES.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>
        <button
          onClick={resetKynetraTemplates}
          style={{ padding: '10px 18px', borderRadius: 10, border: '1px solid ' + brand.red, background: brand.red + '15', color: brand.red, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
        >
          Reset to default 50
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {filtered.map((t) => (
          <div
            key={t.id}
            style={{
              background: brand.card,
              border: '1px solid ' + (t.active ? brand.green + '40' : brand.border),
              borderRadius: 14,
              padding: 14,
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: brand.heading, fontSize: 13 }}>{t.name}</span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Badge color={t.active ? brand.emerald : brand.dim}>{t.active ? 'On' : 'Off'}</Badge>
                <Badge color={brand.blue}>{t.module}</Badge>
              </div>
            </div>
            <div style={{ fontSize: 11, color: brand.dim, marginBottom: 6 }}>
              Triggers: {(t.triggerKeywords || []).slice(0, 5).join(', ')}{(t.triggerKeywords || []).length > 5 ? '…' : ''}
            </div>
            <div style={{ fontSize: 11, color: brand.text, marginBottom: 8, lineHeight: 1.4 }}>{(t.replyText || '').slice(0, 80)}…</div>
            <div style={{ fontSize: 10, color: brand.gold }}>Action: {t.action || 'none'}</div>
            <button
              onClick={() => openEdit(t)}
              style={{ marginTop: 10, padding: '6px 14px', borderRadius: 8, border: '1px solid ' + brand.border, background: 'transparent', color: brand.text, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >
              Edit
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 24,
          }}
          onClick={cancelEdit}
        >
          <div
            style={{
              background: brand.bg2,
              border: '1px solid ' + brand.border,
              borderRadius: 16,
              padding: 24,
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontFamily: brand.fontDisplay, color: brand.heading, marginBottom: 16 }}>Edit template</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid ' + brand.border, background: 'rgba(255,255,255,.04)', color: brand.heading, fontSize: 13 }}
              />
              <label style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Module</label>
              <select
                value={editForm.module}
                onChange={(e) => setEditForm((p) => ({ ...p, module: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid ' + brand.border, background: 'rgba(255,255,255,.04)', color: brand.heading, fontSize: 13 }}
              >
                {KYNETRA_MODULES.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
              <label style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Trigger keywords (comma-separated)</label>
              <input
                value={editForm.triggerKeywords}
                onChange={(e) => setEditForm((p) => ({ ...p, triggerKeywords: e.target.value }))}
                placeholder="menu, shop, products"
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid ' + brand.border, background: 'rgba(255,255,255,.04)', color: brand.heading, fontSize: 13 }}
              />
              <label style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Reply text</label>
              <textarea
                value={editForm.replyText}
                onChange={(e) => setEditForm((p) => ({ ...p, replyText: e.target.value }))}
                rows={3}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid ' + brand.border, background: 'rgba(255,255,255,.04)', color: brand.heading, fontSize: 13, resize: 'vertical' }}
              />
              <label style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Action</label>
              <select
                value={editForm.action}
                onChange={(e) => setEditForm((p) => ({ ...p, action: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid ' + brand.border, background: 'rgba(255,255,255,.04)', color: brand.heading, fontSize: 13 }}
              >
                {ACTION_TYPES.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
              <label style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Action payload (JSON)</label>
              <input
                value={editForm.actionPayload}
                onChange={(e) => setEditForm((p) => ({ ...p, actionPayload: e.target.value }))}
                placeholder='{"tab":"menu"}'
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid ' + brand.border, background: 'rgba(255,255,255,.04)', color: brand.heading, fontSize: 12, fontFamily: 'monospace' }}
              />
              <label style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Suggested replies (comma-separated)</label>
              <input
                value={editForm.suggestedReplies}
                onChange={(e) => setEditForm((p) => ({ ...p, suggestedReplies: e.target.value }))}
                placeholder="Show menu, Build PC"
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid ' + brand.border, background: 'rgba(255,255,255,.04)', color: brand.heading, fontSize: 13 }}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: brand.text }}>
                <input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm((p) => ({ ...p, active: e.target.checked }))} />
                Active
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={saveEdit} style={{ padding: '12px 24px', borderRadius: 10, background: brand.green, color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Save</button>
              <button onClick={cancelEdit} style={{ padding: '12px 24px', borderRadius: 10, background: 'transparent', color: brand.dim, border: '1px solid ' + brand.border, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(KynetraTemplates);
