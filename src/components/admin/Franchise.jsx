'use client';
import { useState, memo, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { fmt, uid } from '@/lib/utils';

// ── Constants ──────────────────────────────────────────────────────────────────
const STAGES = [
  { key: 'inquiry',    label: 'Inquiry',    color: brand.blue },
  { key: 'qualified',  label: 'Qualified',  color: brand.purple },
  { key: 'site_visit', label: 'Site Visit', color: brand.cyan },
  { key: 'loi',        label: 'LOI Signed', color: brand.gold },
  { key: 'agreement',  label: 'Agreement',  color: brand.saffron },
  { key: 'setup',      label: 'Setup',      color: brand.terra },
  { key: 'active',     label: 'Active',     color: brand.emerald },
  { key: 'renewal',    label: 'Renewal',    color: '#F97316' },
];
const STAGE_KEYS = STAGES.map(s => s.key);

const TABS = [
  { key: 'pipeline',    label: 'Pipeline',           emoji: '📋' },
  { key: 'active',      label: 'Active Franchises',  emoji: '🏪' },
  { key: 'territories', label: 'Territories',         emoji: '🗺' },
  { key: 'compliance',  label: 'Compliance',          emoji: '✅' },
  { key: 'performance', label: 'Performance',         emoji: '📊' },
];

const COMPLIANCE_ITEMS = [
  { key: 'fssai',      label: 'FSSAI License',           type: 'bool',  weight: 20 },
  { key: 'gst',        label: 'GST Registration',         type: 'bool',  weight: 15 },
  { key: 'health',     label: 'Health Inspection',        type: 'bool',  weight: 20 },
  { key: 'brandAudit', label: 'Brand Standards Audit',    type: 'score', weight: 25 },
  { key: 'training',   label: 'Staff Training Certified', type: 'bool',  weight: 15 },
  { key: 'fire',       label: 'Fire Safety',              type: 'bool',  weight: 5  },
];

const DEFAULT_TERRITORIES = [
  { id: 'T001', area: 'ECR / Sholinganallur', city: 'Chennai', franchise: 'HyperBridge Group — ECR', since: '2024-01', radius: 8, status: 'covered', mapUrl: 'https://maps.google.com/?q=12.8996,80.2460' },
  { id: 'T002', area: 'T. Nagar / Kodambakkam', city: 'Chennai', franchise: 'HyperBridge Group — Mount Road', since: '2025-03', radius: 5, status: 'covered', mapUrl: 'https://maps.google.com/?q=13.0418,80.2341' },
  { id: 'T003', area: 'Anna Nagar', city: 'Chennai', franchise: '', since: '', radius: 6, status: 'available', mapUrl: 'https://maps.google.com/?q=13.0851,80.2101' },
  { id: 'T004', area: 'Velachery', city: 'Chennai', franchise: '', since: '', radius: 5, status: 'pending', mapUrl: 'https://maps.google.com/?q=12.9815,80.2176' },
  { id: 'T005', area: 'Porur / Guindy', city: 'Chennai', franchise: '', since: '', radius: 7, status: 'available', mapUrl: 'https://maps.google.com/?q=13.0358,80.1667' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function enrich(f) {
  const isObjC = f.compliance && typeof f.compliance === 'object';
  const rev = f.revenue || 0;
  return {
    status: 'active',
    phone: '',
    email: '',
    city: 'Chennai',
    territory: 'Chennai',
    assignedStoreId: '',
    royalty: 12,
    investment: 5000000,
    revenueHistory: [
      { month: '2025-10', amount: Math.round(rev * 0.80) },
      { month: '2025-11', amount: Math.round(rev * 0.88) },
      { month: '2025-12', amount: Math.round(rev * 0.94) },
      { month: '2026-01', amount: Math.round(rev * 1.00) },
      { month: '2026-02', amount: Math.round(rev * 1.06) },
    ],
    ...f,
    compliance: isObjC ? f.compliance : {
      fssai: true,  fssaiExpiry: '2027-01-15',
      gst: true,
      health: true, healthDate: '2025-10-01',
      brandAudit: 88,
      training: true,
      fire: true,
    },
  };
}

function compScore(c) {
  if (!c || typeof c !== 'object') return 0;
  let s = 0;
  if (c.fssai)      s += 20;
  if (c.gst)        s += 15;
  if (c.health)     s += 20;
  if (c.brandAudit) s += Math.round((Math.min(Number(c.brandAudit), 100) / 100) * 25);
  if (c.training)   s += 15;
  if (c.fire)       s += 5;
  return Math.min(s, 100);
}

function scoreColor(n) {
  if (n >= 80) return brand.emerald;
  if (n >= 60) return brand.gold;
  return brand.red;
}

function stageColor(key) {
  return STAGES.find(s => s.key === key)?.color || brand.dim;
}

function shortName(name) {
  return (name || '').replace(/HyperBridge Group — |Charminar Mehfil — /g, '');
}

// ── Style helpers ──────────────────────────────────────────────────────────────
const cardStyle = (extra = {}) => ({
  background: brand.card, border: '1px solid ' + brand.border, borderRadius: 12, padding: 16, ...extra,
});

const inp = (extra = {}) => ({
  padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,.04)',
  border: '1px solid ' + brand.border, color: brand.heading, fontSize: 12,
  outline: 'none', width: '100%', boxSizing: 'border-box', ...extra,
});

const Btn = ({ color = brand.purple, children, onClick, small, full, solid }) => (
  <button onClick={onClick} style={{
    padding: small ? '5px 10px' : '8px 16px', borderRadius: 8, cursor: 'pointer',
    background: solid ? color : color + '18', border: '1px solid ' + color,
    color: solid ? '#fff' : color, fontSize: small ? 10 : 12, fontWeight: 700,
    width: full ? '100%' : 'auto', whiteSpace: 'nowrap',
  }}>{children}</button>
);

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ ...cardStyle(), flex: 1, minWidth: 140, borderTop: '3px solid ' + color }}>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: brand.fontBody }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: brand.heading, marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: brand.dim, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{ padding: '2px 8px', borderRadius: 10, background: color + '20', color, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function Franchise() {
  const { franchises, addFranchise, updateFranchise, stores, show } = useApp();
  const enriched = useMemo(() => franchises.map(enrich), [franchises]);

  const [tab, setTab] = useState('pipeline');

  // Pipeline
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiry, setInquiry]   = useState({ name: '', owner: '', phone: '', email: '', city: '', territory: '', royalty: 12, investment: 0 });

  // Active Franchises
  const [showAddFr, setShowAddFr] = useState(false);
  const [newFr, setNewFr]         = useState({ name: '', owner: '', phone: '', email: '', city: '', territory: '', royalty: 12, investment: 0, status: 'active', assignedStoreId: '' });

  // Territories
  const [territories, setTerritories]   = useState(DEFAULT_TERRITORIES);
  const [showAddTerr, setShowAddTerr]   = useState(false);
  const [newTerr, setNewTerr]           = useState({ area: '', city: 'Chennai', franchise: '', since: '', radius: 5, status: 'available', mapUrl: '' });

  // Compliance
  const [editingFrId, setEditingFrId]   = useState(null);
  const [compEdit, setCompEdit]         = useState({});

  // Stats
  const active      = enriched.filter(f => f.status === 'active');
  const totalRev    = active.reduce((a, f) => a + (f.revenue || 0), 0);
  const totalRoyalty= active.reduce((a, f) => a + Math.round((f.revenue || 0) * ((f.royalty || 12) / 100)), 0);
  const maxRev      = Math.max(...enriched.map(f => f.revenue || 0), 1);

  // ── Handlers ────────────────────────────────────────────────────────────────
  function moveStage(id, dir) {
    const fr   = enriched.find(f => f.id === id);
    if (!fr) return;
    const idx  = STAGE_KEYS.indexOf(fr.status);
    const next = STAGE_KEYS[idx + dir];
    if (!next) return show(dir > 0 ? 'Already at final stage' : 'Already at first stage', 'error');
    updateFranchise(id, { status: next });
  }

  function submitInquiry() {
    if (!inquiry.name || !inquiry.owner) return show('Name & Owner required', 'error');
    addFranchise({ ...inquiry, status: 'inquiry' });
    setInquiry({ name: '', owner: '', phone: '', email: '', city: '', territory: '', royalty: 12, investment: 0 });
    setShowInquiryForm(false);
  }

  function submitNewFr() {
    if (!newFr.name || !newFr.owner) return show('Name & Owner required', 'error');
    addFranchise(newFr);
    setNewFr({ name: '', owner: '', phone: '', email: '', city: '', territory: '', royalty: 12, investment: 0, status: 'active', assignedStoreId: '' });
    setShowAddFr(false);
  }

  function addTerritory() {
    if (!newTerr.area) return show('Area name required', 'error');
    setTerritories(p => [...p, { id: 'T' + uid(), ...newTerr }]);
    setNewTerr({ area: '', city: 'Chennai', franchise: '', since: '', radius: 5, status: 'available', mapUrl: '' });
    setShowAddTerr(false);
    show('Territory added');
  }

  function startEditCompliance(fr) {
    setEditingFrId(fr.id);
    setCompEdit({ ...fr.compliance });
  }

  function saveCompliance() {
    updateFranchise(editingFrId, { compliance: compEdit });
    setEditingFrId(null);
  }

  const terrStatusColor = { covered: brand.emerald, available: brand.blue, pending: brand.gold };

  // ── Shared form label ───────────────────────────────────────────────────────
  function Label({ children }) {
    return <div style={{ fontSize: 10, color: brand.dim, marginBottom: 3, fontWeight: 600 }}>{children}</div>;
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: brand.fontBody }}>

      {/* ═══ HEADER ═══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: brand.heading, margin: 0 }}>
            🏢 Franchise Lifecycle Manager
          </h2>
          <p style={{ fontSize: 12, color: brand.dim, margin: '4px 0 0' }}>
            Charminar Mehfil · {franchises.length} franchises · {active.length} active
          </p>
        </div>
      </div>

      {/* ═══ TAB BAR ══════════════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all .15s',
            border: '1px solid ' + (tab === t.key ? brand.purple : brand.border),
            background: tab === t.key ? brand.purple + '20' : 'transparent',
            color: tab === t.key ? brand.purple : brand.dim,
          }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: PIPELINE
      ══════════════════════════════════════════════════════════════════════════ */}
      {tab === 'pipeline' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: 12, color: brand.dim }}>
              Drag franchises through acquisition stages · {enriched.length} total
            </span>
            <Btn color={brand.blue} onClick={() => setShowInquiryForm(v => !v)}>
              + Convert Inquiry from CRM
            </Btn>
          </div>

          {showInquiryForm && (
            <div style={{ ...cardStyle({ borderColor: brand.blue + '40', marginBottom: 16 }) }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: brand.blue, marginBottom: 12 }}>🔍 New Inquiry</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[['name', 'Franchise Name'], ['owner', 'Owner Name'], ['phone', 'Phone'], ['email', 'Email'], ['city', 'City'], ['territory', 'Territory']].map(([k, pl]) => (
                  <div key={k}>
                    <Label>{pl}</Label>
                    <input placeholder={pl} value={inquiry[k]} onChange={e => setInquiry(p => ({ ...p, [k]: e.target.value }))} style={inp()} />
                  </div>
                ))}
                <div>
                  <Label>Royalty %</Label>
                  <input type="number" placeholder="12" value={inquiry.royalty} onChange={e => setInquiry(p => ({ ...p, royalty: Number(e.target.value) }))} style={inp()} />
                </div>
                <div>
                  <Label>Investment ₹</Label>
                  <input type="number" placeholder="5000000" value={inquiry.investment} onChange={e => setInquiry(p => ({ ...p, investment: Number(e.target.value) }))} style={inp()} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Btn color={brand.blue} onClick={submitInquiry} full solid>Add to Pipeline</Btn>
                </div>
              </div>
            </div>
          )}

          {/* Kanban board — horizontal scroll */}
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12 }}>
            {STAGES.map(stage => {
              const cards = enriched.filter(f => f.status === stage.key);
              return (
                <div key={stage.key} style={{ minWidth: 195, flex: '0 0 195px' }}>
                  {/* Column header */}
                  <div style={{
                    padding: '8px 12px', borderRadius: '8px 8px 0 0',
                    background: stage.color + '15', border: '1px solid ' + stage.color + '40',
                    borderBottom: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: stage.color, textTransform: 'uppercase', letterSpacing: .8 }}>
                      {stage.label}
                    </span>
                    <span style={{ background: stage.color + '30', color: stage.color, fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 8 }}>
                      {cards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div style={{
                    border: '1px solid ' + stage.color + '30', borderTop: 'none',
                    borderRadius: '0 0 8px 8px', minHeight: 220, padding: 8,
                    display: 'flex', flexDirection: 'column', gap: 8, background: brand.bg2,
                  }}>
                    {cards.map(fr => {
                      const idx = STAGE_KEYS.indexOf(fr.status);
                      return (
                        <div key={fr.id} style={{
                          background: brand.card, border: '1px solid ' + brand.border,
                          borderLeft: '3px solid ' + stage.color, borderRadius: 8, padding: 10,
                        }}>
                          <div style={{ fontWeight: 700, fontSize: 12, color: brand.heading, marginBottom: 2 }}>
                            {shortName(fr.name)}
                          </div>
                          <div style={{ fontSize: 10, color: brand.dim, marginBottom: 4 }}>
                            {fr.owner}
                          </div>
                          <div style={{ fontSize: 10, color: brand.dim, marginBottom: 4 }}>
                            📍 {fr.city} {fr.since ? `· Since ${fr.since}` : ''}
                          </div>
                          {fr.revenue > 0 && (
                            <div style={{ fontSize: 10, color: brand.emerald, marginBottom: 6, fontWeight: 600 }}>
                              {fmt(fr.revenue)} rev
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                            {idx > 0 && (
                              <button onClick={() => moveStage(fr.id, -1)} style={{
                                flex: 1, padding: '3px 0', borderRadius: 5, cursor: 'pointer',
                                background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border,
                                color: brand.dim, fontSize: 9,
                              }}>← Back</button>
                            )}
                            {idx < STAGE_KEYS.length - 1 && (
                              <button onClick={() => moveStage(fr.id, 1)} style={{
                                flex: 1, padding: '3px 0', borderRadius: 5, cursor: 'pointer',
                                background: stage.color + '20', border: '1px solid ' + stage.color,
                                color: stage.color, fontSize: 9, fontWeight: 700,
                              }}>Forward →</button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {cards.length === 0 && (
                      <div style={{ textAlign: 'center', color: brand.dim, fontSize: 11, paddingTop: 30, opacity: .4 }}>
                        No franchises
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: ACTIVE FRANCHISES
      ══════════════════════════════════════════════════════════════════════════ */}
      {tab === 'active' && (
        <div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatCard label="Total Franchises"  value={enriched.length}    color={brand.purple} />
            <StatCard label="Active"             value={active.length}      color={brand.emerald} />
            <StatCard label="Revenue This Month" value={fmt(totalRev)}      color={brand.gold}   sub="Combined active" />
            <StatCard label="Royalty Earned"     value={fmt(totalRoyalty)}  color={brand.blue}   sub="This month" />
          </div>

          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: brand.dim }}>{enriched.length} franchise(s) across all stages</span>
            <Btn color={brand.purple} onClick={() => setShowAddFr(v => !v)}>+ New Franchise</Btn>
          </div>

          {/* Add form */}
          {showAddFr && (
            <div style={{ ...cardStyle({ borderColor: brand.purple + '40', marginBottom: 16 }) }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: brand.purple, marginBottom: 12 }}>🏪 Register Franchise</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[['name', 'Franchise Name'], ['owner', 'Owner Name'], ['phone', 'Phone'], ['email', 'Email'], ['city', 'City'], ['territory', 'Territory']].map(([k, pl]) => (
                  <div key={k}>
                    <Label>{pl}</Label>
                    <input placeholder={pl} value={newFr[k]} onChange={e => setNewFr(p => ({ ...p, [k]: e.target.value }))} style={inp()} />
                  </div>
                ))}
                <div>
                  <Label>Royalty %</Label>
                  <input type="number" value={newFr.royalty} onChange={e => setNewFr(p => ({ ...p, royalty: Number(e.target.value) }))} style={inp()} />
                </div>
                <div>
                  <Label>Investment ₹</Label>
                  <input type="number" value={newFr.investment} onChange={e => setNewFr(p => ({ ...p, investment: Number(e.target.value) }))} style={inp()} />
                </div>
                <div>
                  <Label>Assigned Store</Label>
                  <select value={newFr.assignedStoreId} onChange={e => setNewFr(p => ({ ...p, assignedStoreId: e.target.value }))} style={inp()}>
                    <option value="">— None —</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select value={newFr.status} onChange={e => setNewFr(p => ({ ...p, status: e.target.value }))} style={inp()}>
                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 1', display: 'flex', alignItems: 'flex-end' }}>
                  <Btn color={brand.purple} onClick={submitNewFr} full solid>💾 Create Franchise</Btn>
                </div>
              </div>
            </div>
          )}

          {/* Franchise table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {enriched.map(fr => {
              const royaltyAmt = Math.round((fr.revenue || 0) * ((fr.royalty || 12) / 100));
              const cScore     = compScore(fr.compliance);
              const assignedStore = stores.find(s => s.id === fr.assignedStoreId);
              const sc = stageColor(fr.status);
              return (
                <div key={fr.id} style={{ ...cardStyle({ borderLeft: '4px solid ' + sc }) }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    {/* Left info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: brand.heading }}>
                          {shortName(fr.name)}
                        </span>
                        <Badge label={STAGES.find(s => s.key === fr.status)?.label || fr.status} color={sc} />
                      </div>
                      <div style={{ fontSize: 11, color: brand.dim, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <span>👤 {fr.owner}</span>
                        <span>📍 {fr.city}</span>
                        {fr.since && <span>📅 Since {fr.since}</span>}
                        {fr.phone && <span>📞 {fr.phone}</span>}
                        {assignedStore && <span>🏪 {assignedStore.name}</span>}
                      </div>
                    </div>

                    {/* Metrics grid */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[
                        { label: 'Revenue',    val: fmt(fr.revenue || 0),  color: brand.emerald },
                        { label: 'Orders',     val: (fr.orders || 0).toLocaleString(), color: brand.blue },
                        { label: 'Royalty',    val: `${fr.royalty || 12}%`, color: brand.gold },
                        { label: 'Royalty ₹',  val: fmt(royaltyAmt),        color: brand.gold },
                        { label: 'Compliance', val: `${cScore}%`,           color: scoreColor(cScore) },
                      ].map(m => (
                        <div key={m.label} style={{ background: brand.bg, borderRadius: 8, padding: '8px 12px', textAlign: 'center', minWidth: 72 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{m.val}</div>
                          <div style={{ fontSize: 9, color: brand.dim, marginTop: 1 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                      <select
                        value={fr.status}
                        onChange={e => updateFranchise(fr.id, { status: e.target.value })}
                        style={{ padding: '5px 8px', borderRadius: 6, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, color: sc, fontSize: 10, outline: 'none', cursor: 'pointer' }}
                      >
                        {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                      </select>
                      <Btn color={brand.blue} small onClick={() => setTab('compliance')}>Compliance</Btn>
                      <Btn color={brand.red}  small onClick={() => updateFranchise(fr.id, { status: 'suspended' })}>Suspend</Btn>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: TERRITORIES
      ══════════════════════════════════════════════════════════════════════════ */}
      {tab === 'territories' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {['covered', 'available', 'pending'].map(s => (
                <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: brand.dim }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: terrStatusColor[s], display: 'inline-block' }} />
                  {territories.filter(t => t.status === s).length} {s}
                </span>
              ))}
            </div>
            <Btn color={brand.emerald} onClick={() => setShowAddTerr(v => !v)}>+ Add Territory</Btn>
          </div>

          {showAddTerr && (
            <div style={{ ...cardStyle({ borderColor: brand.emerald + '40', marginBottom: 16 }) }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: brand.emerald, marginBottom: 12 }}>🗺 New Territory</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                <div><Label>Area Name</Label><input placeholder="Anna Nagar" value={newTerr.area} onChange={e => setNewTerr(p => ({ ...p, area: e.target.value }))} style={inp()} /></div>
                <div><Label>City</Label><input placeholder="Chennai" value={newTerr.city} onChange={e => setNewTerr(p => ({ ...p, city: e.target.value }))} style={inp()} /></div>
                <div><Label>Assigned Franchise</Label><input placeholder="Franchise name" value={newTerr.franchise} onChange={e => setNewTerr(p => ({ ...p, franchise: e.target.value }))} style={inp()} /></div>
                <div><Label>Since (YYYY-MM)</Label><input placeholder="2026-01" value={newTerr.since} onChange={e => setNewTerr(p => ({ ...p, since: e.target.value }))} style={inp()} /></div>
                <div><Label>Exclusivity Radius (km)</Label><input type="number" value={newTerr.radius} onChange={e => setNewTerr(p => ({ ...p, radius: Number(e.target.value) }))} style={inp()} /></div>
                <div><Label>Status</Label>
                  <select value={newTerr.status} onChange={e => setNewTerr(p => ({ ...p, status: e.target.value }))} style={inp()}>
                    <option value="covered">Covered</option>
                    <option value="available">Available</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}><Label>Google Maps URL</Label><input placeholder="https://maps.google.com/..." value={newTerr.mapUrl} onChange={e => setNewTerr(p => ({ ...p, mapUrl: e.target.value }))} style={inp()} /></div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Btn color={brand.emerald} onClick={addTerritory} full solid>Add Territory</Btn>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {territories.map(t => {
              const tc = terrStatusColor[t.status] || brand.dim;
              return (
                <div key={t.id} style={{ ...cardStyle({ borderLeft: '4px solid ' + tc, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }) }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, color: brand.heading, fontSize: 14 }}>📍 {t.area}</span>
                      <Badge label={t.status.toUpperCase()} color={tc} />
                    </div>
                    <div style={{ fontSize: 11, color: brand.dim, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span>🏙 {t.city}</span>
                      {t.franchise && <span>🏪 {t.franchise}</span>}
                      {t.since && <span>📅 Since {t.since}</span>}
                      <span>🔵 {t.radius} km exclusivity zone</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {t.mapUrl && (
                      <a href={t.mapUrl} target="_blank" rel="noreferrer" style={{
                        padding: '6px 12px', borderRadius: 8, background: brand.blue + '18',
                        border: '1px solid ' + brand.blue, color: brand.blue, fontSize: 10,
                        fontWeight: 700, textDecoration: 'none',
                      }}>
                        🗺 View Map
                      </a>
                    )}
                    <select
                      value={t.status}
                      onChange={e => setTerritories(p => p.map(x => x.id === t.id ? { ...x, status: e.target.value } : x))}
                      style={{ padding: '5px 8px', borderRadius: 6, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, color: tc, fontSize: 10, outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="covered">Covered</option>
                      <option value="available">Available</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: COMPLIANCE
      ══════════════════════════════════════════════════════════════════════════ */}
      {tab === 'compliance' && (
        <div>
          <div style={{ fontSize: 12, color: brand.dim, marginBottom: 16 }}>
            Compliance status per franchise · Click "Edit" to update certifications
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {enriched.map(fr => {
              const c      = fr.compliance;
              const score  = compScore(c);
              const isEdit = editingFrId === fr.id;
              const sc     = stageColor(fr.status);
              return (
                <div key={fr.id} style={{ ...cardStyle({ borderTop: '3px solid ' + scoreColor(score) }) }}>
                  {/* Franchise header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: brand.heading }}>{shortName(fr.name)}</span>
                      <span style={{ fontSize: 11, color: brand.dim, marginLeft: 10 }}>{fr.owner} · {fr.city}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Score bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 100, height: 6, background: brand.bg, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: score + '%', height: '100%', background: scoreColor(score), borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(score) }}>{score}%</span>
                      </div>
                      {isEdit
                        ? <><Btn color={brand.emerald} small solid onClick={saveCompliance}>✓ Save</Btn><Btn color={brand.red} small onClick={() => setEditingFrId(null)}>Cancel</Btn></>
                        : <Btn color={brand.gold} small onClick={() => startEditCompliance(fr)}>✎ Edit</Btn>
                      }
                    </div>
                  </div>

                  {/* Compliance grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                    {COMPLIANCE_ITEMS.map(item => {
                      const val   = isEdit ? compEdit[item.key] : c?.[item.key];
                      const isPassing = item.type === 'score' ? Number(val) >= 70 : !!val;
                      const itemColor = isPassing ? brand.emerald : brand.red;
                      return (
                        <div key={item.key} style={{
                          background: brand.bg, borderRadius: 8, padding: '10px 12px',
                          border: '1px solid ' + (isPassing ? brand.emerald + '30' : brand.red + '30'),
                        }}>
                          <div style={{ fontSize: 10, color: brand.dim, marginBottom: 5 }}>{item.label}</div>
                          {isEdit ? (
                            item.type === 'score' ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input
                                  type="number" min="0" max="100"
                                  value={compEdit[item.key] ?? ''}
                                  onChange={e => setCompEdit(p => ({ ...p, [item.key]: Number(e.target.value) }))}
                                  style={{ ...inp({ width: 60, padding: '4px 8px', fontSize: 11 }) }}
                                />
                                <span style={{ fontSize: 10, color: brand.dim }}>/100</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => setCompEdit(p => ({ ...p, [item.key]: !p[item.key] }))}
                                style={{
                                  padding: '3px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                                  background: compEdit[item.key] ? brand.emerald + '20' : brand.red + '20',
                                  border: '1px solid ' + (compEdit[item.key] ? brand.emerald : brand.red),
                                  color: compEdit[item.key] ? brand.emerald : brand.red,
                                }}
                              >
                                {compEdit[item.key] ? '✓ Yes' : '✗ No'}
                              </button>
                            )
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: itemColor }}>
                                {item.type === 'score' ? `${val ?? 0}/100` : (val ? '✓ Yes' : '✗ No')}
                              </span>
                              {item.key === 'fssai' && c?.fssaiExpiry && (
                                <span style={{ fontSize: 9, color: brand.dim }}>exp {c.fssaiExpiry}</span>
                              )}
                              {item.key === 'health' && c?.healthDate && (
                                <span style={{ fontSize: 9, color: brand.dim }}>last {c.healthDate}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: PERFORMANCE
      ══════════════════════════════════════════════════════════════════════════ */}
      {tab === 'performance' && (
        <div>
          {/* Summary stats */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatCard label="Combined Revenue"    value={fmt(totalRev)}     color={brand.emerald} sub="Active franchises · this month" />
            <StatCard label="Total Royalty Due"   value={fmt(totalRoyalty)} color={brand.gold}    sub="Payable to HQ" />
            <StatCard label="Avg Royalty Rate"    value={active.length ? (active.reduce((a, f) => a + (f.royalty || 12), 0) / active.length).toFixed(1) + '%' : '—'} color={brand.purple} />
            <StatCard label="Top Franchise"       value={shortName(enriched.sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]?.name || '—')} color={brand.blue} />
          </div>

          {/* Revenue bars per franchise */}
          <div style={{ ...cardStyle({ marginBottom: 16 }) }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: brand.heading, marginBottom: 14 }}>
              📊 Revenue by Franchise
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[...enriched].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).map((fr, i) => {
                const pct   = Math.round(((fr.revenue || 0) / maxRev) * 100);
                const rAmt  = Math.round((fr.revenue || 0) * ((fr.royalty || 12) / 100));
                const isTop = i === 0;
                return (
                  <div key={fr.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isTop && <span style={{ fontSize: 12 }}>🏆</span>}
                        <span style={{ fontSize: 12, fontWeight: 600, color: isTop ? brand.gold : brand.heading }}>
                          {shortName(fr.name)}
                        </span>
                        <Badge label={STAGES.find(s => s.key === fr.status)?.label || fr.status} color={stageColor(fr.status)} />
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: brand.dim }}>
                        <span style={{ color: brand.emerald, fontWeight: 700 }}>{fmt(fr.revenue || 0)}</span>
                        <span>Royalty: <span style={{ color: brand.gold, fontWeight: 600 }}>{fmt(rAmt)}</span></span>
                        <span>{fr.royalty || 12}%</span>
                        <span>{(fr.orders || 0).toLocaleString()} orders</span>
                      </div>
                    </div>
                    {/* Revenue bar */}
                    <div style={{ height: 10, background: brand.bg, borderRadius: 5, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ width: pct + '%', height: '100%', background: isTop ? brand.gold : brand.emerald, borderRadius: 5, transition: 'width .4s ease' }} />
                    </div>
                    {/* Royalty bar */}
                    <div style={{ height: 5, background: brand.bg, borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: Math.round(((fr.royalty || 12) / 20) * 100) + '%', height: '100%', background: brand.gold + '80', borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly trend per franchise */}
          <div style={{ ...cardStyle() }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: brand.heading, marginBottom: 14 }}>
              📅 Monthly Revenue Trend
            </div>
            {enriched.map(fr => {
              const hist = fr.revenueHistory || [];
              const peak = Math.max(...hist.map(h => h.amount), 1);
              return (
                <div key={fr.id} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: brand.heading, marginBottom: 8 }}>
                    {shortName(fr.name)}
                    <span style={{ fontSize: 10, color: brand.dim, marginLeft: 8 }}>{fr.royalty || 12}% royalty</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60 }}>
                    {hist.map((h, i) => {
                      const barH    = Math.round((h.amount / peak) * 52);
                      const isLast  = i === hist.length - 1;
                      const isPrev  = i === hist.length - 2;
                      const barColor = isLast ? brand.gold : isPrev ? brand.emerald : brand.emerald + '60';
                      return (
                        <div key={h.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                          <div style={{ fontSize: 8, color: brand.dim, whiteSpace: 'nowrap' }}>
                            {isLast ? fmt(h.amount) : ''}
                          </div>
                          <div style={{ width: '100%', height: barH + 'px', background: barColor, borderRadius: '3px 3px 0 0', transition: 'height .3s ease', minHeight: 4 }} />
                          <div style={{ fontSize: 8, color: brand.dim }}>{h.month.slice(5)}</div>
                        </div>
                      );
                    })}
                  </div>
                  {/* This vs last month comparison */}
                  {hist.length >= 2 && (() => {
                    const cur  = hist[hist.length - 1].amount;
                    const prev = hist[hist.length - 2].amount;
                    const diff = cur - prev;
                    const pct  = prev ? Math.round((diff / prev) * 100) : 0;
                    const up   = diff >= 0;
                    return (
                      <div style={{ fontSize: 10, color: brand.dim, marginTop: 4, display: 'flex', gap: 12 }}>
                        <span>This month: <span style={{ color: brand.gold, fontWeight: 600 }}>{fmt(cur)}</span></span>
                        <span>Last month: <span style={{ color: brand.dim }}>{fmt(prev)}</span></span>
                        <span style={{ color: up ? brand.emerald : brand.red, fontWeight: 600 }}>
                          {up ? '▲' : '▼'} {Math.abs(pct)}%
                        </span>
                        <span>Royalty due: <span style={{ color: brand.gold, fontWeight: 600 }}>{fmt(Math.round(cur * ((fr.royalty || 12) / 100)))}</span></span>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

export default memo(Franchise);
