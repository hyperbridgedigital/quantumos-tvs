'use client';
import { useState, memo, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { ROLES } from '@/data/roles';

const EMPTY_USER = { name: '', email: '', password: '', role: 'staff', store: '', status: 'active' };
const EMPTY_GROUP = { name: '', description: '', role: 'staff', permissions: '' };

const DEFAULT_GROUPS = [
  { id: 'GRP01', name: 'Store Managers', description: 'Day-to-day store operations and staff oversight', role: 'manager', members: 3, permissions: 'Orders, POS, Stock, CRM, Delivery' },
  { id: 'GRP02', name: 'Franchise Owners', description: 'Franchise-level dashboards and POS access', role: 'franchise', members: 2, permissions: 'Dashboard, Orders, POS, Stock' },
  { id: 'GRP03', name: 'Kitchen Staff', description: 'Order queue visibility and stock updates', role: 'staff', members: 5, permissions: 'Orders, POS' },
  { id: 'GRP04', name: 'Marketing Team', description: 'Campaigns, WhatsApp, CRM, and promo management', role: 'manager', members: 2, permissions: 'CRM, WhatsApp, Promo, Campaigns, Funnels' },
];

const inp = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border,
  color: brand.heading, fontSize: 13, outline: 'none', fontFamily: brand.fontBody,
};

const btnBase = {
  padding: '8px 18px', borderRadius: 8, fontSize: 12,
  fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'opacity .15s',
};

function UserManager() {
  const { adminUsers, addAdminUser, updateAdminUser, deleteAdminUser, stores, show } = useApp();

  const [tab, setTab] = useState('users');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_USER);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [groups, setGroups] = useState(DEFAULT_GROUPS);
  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [groupForm, setGroupForm] = useState(EMPTY_GROUP);
  const [deleteGroupConfirm, setDeleteGroupConfirm] = useState(null);

  const filtered = useMemo(() => {
    if (!search) return adminUsers;
    const q = search.toLowerCase();
    return adminUsers.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [adminUsers, search]);

  const set = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), []);
  const setG = useCallback((k, v) => setGroupForm(p => ({ ...p, [k]: v })), []);

  const openAdd = () => { setForm(EMPTY_USER); setEditingId(null); setFormOpen(true); };
  const openEdit = (u) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role, store: u.store || '', status: u.status });
    setEditingId(u.id);
    setFormOpen(true);
  };
  const closeForm = () => { setFormOpen(false); setEditingId(null); setForm(EMPTY_USER); };

  const handleSave = () => {
    if (!form.name.trim()) return show('Name is required', 'error');
    if (!form.email.trim() || !form.email.includes('@')) return show('Valid email is required', 'error');
    if (!editingId && !form.password.trim()) return show('Password is required for new users', 'error');
    if (!editingId && form.password.length < 6) return show('Password must be at least 6 characters', 'error');

    if (editingId) {
      const updates = { name: form.name, email: form.email, role: form.role, store: form.store, status: form.status };
      if (form.password.trim()) updates.password = form.password;
      updateAdminUser(editingId, updates);
    } else {
      addAdminUser(form);
    }
    closeForm();
  };

  const confirmDelete = (id) => { setDeleteConfirm(id); };
  const executeDelete = () => { deleteAdminUser(deleteConfirm); setDeleteConfirm(null); };

  const openAddGroup = () => { setGroupForm(EMPTY_GROUP); setEditingGroupId(null); setGroupFormOpen(true); };
  const openEditGroup = (g) => {
    setGroupForm({ name: g.name, description: g.description, role: g.role, permissions: g.permissions });
    setEditingGroupId(g.id);
    setGroupFormOpen(true);
  };
  const closeGroupForm = () => { setGroupFormOpen(false); setEditingGroupId(null); setGroupForm(EMPTY_GROUP); };

  const handleGroupSave = () => {
    if (!groupForm.name.trim()) return show('Group name is required', 'error');
    if (editingGroupId) {
      setGroups(p => p.map(g => g.id === editingGroupId ? { ...g, ...groupForm } : g));
      show('Group updated');
    } else {
      const id = 'GRP' + String(Date.now()).slice(-4);
      setGroups(p => [...p, { id, members: 0, ...groupForm }]);
      show('Group created');
    }
    closeGroupForm();
  };

  const confirmDeleteGroup = (id) => setDeleteGroupConfirm(id);
  const executeDeleteGroup = () => { setGroups(p => p.filter(g => g.id !== deleteGroupConfirm)); setDeleteGroupConfirm(null); show('Group deleted'); };

  const groupMemberCount = useCallback((role) => adminUsers.filter(u => u.role === role).length, [adminUsers]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: brand.heading, margin: 0 }}>
            👤 User Manager
          </h2>
          <p style={{ fontSize: 12, color: brand.dim, margin: '4px 0 0' }}>
            {adminUsers.length} admin users · {groups.length} groups · Manage access & permissions
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['users', 'groups'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              ...btnBase,
              background: tab === t ? brand.gold : 'transparent',
              color: tab === t ? '#000' : brand.dim,
              border: tab === t ? 'none' : '1px solid ' + brand.border,
            }}>
              {t === 'users' ? '👤 Users' : '👥 Groups'}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ USERS TAB ═══════ */}
      {tab === 'users' && (
        <div>
          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search users by name, email, or role…"
              style={{ ...inp, maxWidth: 340, flex: 1 }}
            />
            <button onClick={openAdd} style={{ ...btnBase, background: brand.emerald, color: '#000' }}>
              + Add User
            </button>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
            {Object.entries(ROLES).map(([key, r]) => {
              const count = adminUsers.filter(u => u.role === key).length;
              return (
                <div key={key} style={{
                  background: brand.card, border: '1px solid ' + brand.border,
                  borderRadius: 10, padding: '12px 14px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 22 }}>{r.emoji}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: r.color }}>{count}</div>
                  <div style={{ fontSize: 11, color: brand.dim }}>{r.label}</div>
                </div>
              );
            })}
            <div style={{
              background: brand.card, border: '1px solid ' + brand.border,
              borderRadius: 10, padding: '12px 14px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22 }}>🟢</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: brand.emerald }}>
                {adminUsers.filter(u => u.status === 'active').length}
              </div>
              <div style={{ fontSize: 11, color: brand.dim }}>Active</div>
            </div>
          </div>

          {/* Inline Form */}
          {formOpen && (
            <div style={{
              background: brand.card, border: '1px solid ' + brand.gold + '40',
              borderRadius: 12, padding: 20, marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: brand.heading, fontSize: 16, fontWeight: 700, margin: 0 }}>
                  {editingId ? '✏️ Edit User' : '➕ New User'}
                </h3>
                <button onClick={closeForm} style={{
                  background: 'transparent', border: 'none', color: brand.dim,
                  fontSize: 18, cursor: 'pointer', lineHeight: 1,
                }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Full Name *</span>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" style={inp} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Email *</span>
                  <input value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@mehfil.com" type="email" style={inp} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>
                    {editingId ? 'New Password (leave blank to keep)' : 'Password *'}
                  </span>
                  <input value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" type="password" style={inp} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Role *</span>
                  <select value={form.role} onChange={e => set('role', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    {Object.entries(ROLES).map(([k, r]) => (
                      <option key={k} value={k}>{r.emoji} {r.label}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Assigned Store</span>
                  <select value={form.store} onChange={e => set('store', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="">— All Stores —</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Status</span>
                  <select value={form.status} onChange={e => set('status', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    <option value="active">🟢 Active</option>
                    <option value="suspended">🔴 Suspended</option>
                  </select>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button onClick={closeForm} style={{ ...btnBase, background: 'transparent', border: '1px solid ' + brand.border, color: brand.dim }}>
                  Cancel
                </button>
                <button onClick={handleSave} style={{ ...btnBase, background: brand.gold, color: '#000' }}>
                  {editingId ? '💾 Update User' : '✅ Create User'}
                </button>
              </div>
            </div>
          )}

          {/* User Cards */}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: brand.dim }}>
              {search ? 'No users match your search.' : 'No admin users found.'}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(u => {
              const role = ROLES[u.role] || ROLES.staff;
              const store = stores.find(s => s.id === u.store);
              const isDeleting = deleteConfirm === u.id;

              return (
                <div key={u.id} style={{
                  background: brand.card, border: '1px solid ' + (isDeleting ? brand.red + '60' : brand.border),
                  borderRadius: 12, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
                  transition: 'border-color .2s',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                    background: role.color + '22', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 20, border: '2px solid ' + role.color + '44',
                  }}>
                    {role.emoji}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: brand.heading, fontSize: 14 }}>{u.name}</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 3,
                        padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        background: role.color + '22', color: role.color,
                      }}>
                        {role.emoji} {role.label}
                      </span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                        background: u.status === 'active' ? brand.emerald + '22' : brand.red + '22',
                        color: u.status === 'active' ? brand.emerald : brand.red,
                      }}>
                        {u.status === 'active' ? '🟢 Active' : '🔴 Suspended'}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: brand.dim, marginTop: 3 }}>
                      {u.email}
                      {store && <span> · 🏪 {store.name}</span>}
                      <span> · Last login: {u.lastLogin}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isDeleting ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: brand.red, fontWeight: 600 }}>Delete?</span>
                      <button onClick={executeDelete} style={{
                        ...btnBase, padding: '6px 14px', background: brand.red, color: '#fff',
                      }}>Yes</button>
                      <button onClick={() => setDeleteConfirm(null)} style={{
                        ...btnBase, padding: '6px 14px', background: 'transparent',
                        border: '1px solid ' + brand.border, color: brand.dim,
                      }}>No</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(u)} style={{
                        ...btnBase, padding: '6px 14px', background: brand.blue + '18',
                        border: '1px solid ' + brand.blue + '30', color: brand.blue,
                      }}>✏️ Edit</button>
                      <button onClick={() => updateAdminUser(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })} style={{
                        ...btnBase, padding: '6px 14px',
                        background: (u.status === 'active' ? brand.red : brand.emerald) + '18',
                        border: '1px solid ' + (u.status === 'active' ? brand.red : brand.emerald) + '30',
                        color: u.status === 'active' ? brand.red : brand.emerald,
                      }}>
                        {u.status === 'active' ? '⏸ Suspend' : '▶ Activate'}
                      </button>
                      <button onClick={() => confirmDelete(u.id)} style={{
                        ...btnBase, padding: '6px 14px', background: brand.red + '18',
                        border: '1px solid ' + brand.red + '30', color: brand.red,
                      }}>🗑</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════ GROUPS TAB ═══════ */}
      {tab === 'groups' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, justifyContent: 'flex-end' }}>
            <button onClick={openAddGroup} style={{ ...btnBase, background: brand.emerald, color: '#000' }}>
              + Add Group
            </button>
          </div>

          {/* Group Form */}
          {groupFormOpen && (
            <div style={{
              background: brand.card, border: '1px solid ' + brand.gold + '40',
              borderRadius: 12, padding: 20, marginBottom: 20,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ color: brand.heading, fontSize: 16, fontWeight: 700, margin: 0 }}>
                  {editingGroupId ? '✏️ Edit Group' : '➕ New Group'}
                </h3>
                <button onClick={closeGroupForm} style={{
                  background: 'transparent', border: 'none', color: brand.dim,
                  fontSize: 18, cursor: 'pointer', lineHeight: 1,
                }}>✕</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Group Name *</span>
                  <input value={groupForm.name} onChange={e => setG('name', e.target.value)} placeholder="e.g. Kitchen Staff" style={inp} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Description</span>
                  <input value={groupForm.description} onChange={e => setG('description', e.target.value)} placeholder="What this group does…" style={inp} />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Role</span>
                  <select value={groupForm.role} onChange={e => setG('role', e.target.value)} style={{ ...inp, cursor: 'pointer' }}>
                    {Object.entries(ROLES).map(([k, r]) => (
                      <option key={k} value={k}>{r.emoji} {r.label}</option>
                    ))}
                  </select>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 11, color: brand.dim, fontWeight: 600 }}>Permissions (comma-separated)</span>
                  <input value={groupForm.permissions} onChange={e => setG('permissions', e.target.value)} placeholder="Orders, POS, Stock…" style={inp} />
                </label>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                <button onClick={closeGroupForm} style={{ ...btnBase, background: 'transparent', border: '1px solid ' + brand.border, color: brand.dim }}>
                  Cancel
                </button>
                <button onClick={handleGroupSave} style={{ ...btnBase, background: brand.gold, color: '#000' }}>
                  {editingGroupId ? '💾 Update Group' : '✅ Create Group'}
                </button>
              </div>
            </div>
          )}

          {/* Group Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {groups.map(g => {
              const role = ROLES[g.role] || ROLES.staff;
              const isDeleting = deleteGroupConfirm === g.id;
              const liveCount = groupMemberCount(g.role);

              return (
                <div key={g.id} style={{
                  background: brand.card, border: '1px solid ' + (isDeleting ? brand.red + '60' : brand.border),
                  borderRadius: 12, padding: 18, transition: 'border-color .2s',
                  display: 'flex', flexDirection: 'column', gap: 10,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{role.emoji}</span>
                        <span style={{ fontWeight: 700, color: brand.heading, fontSize: 15 }}>{g.name}</span>
                      </div>
                      <div style={{ fontSize: 12, color: brand.dim, lineHeight: 1.4 }}>{g.description}</div>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: role.color + '22', color: role.color, whiteSpace: 'nowrap',
                    }}>
                      {role.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                    <div>
                      <span style={{ color: brand.dim }}>Members: </span>
                      <span style={{ color: brand.heading, fontWeight: 700 }}>{liveCount}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ color: brand.dim }}>Permissions: </span>
                      <span style={{ color: brand.gold, fontWeight: 600 }}>{g.permissions || '—'}</span>
                    </div>
                  </div>

                  {isDeleting ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: 12, color: brand.red, fontWeight: 600 }}>Delete group?</span>
                      <button onClick={executeDeleteGroup} style={{ ...btnBase, padding: '5px 12px', background: brand.red, color: '#fff' }}>Yes</button>
                      <button onClick={() => setDeleteGroupConfirm(null)} style={{ ...btnBase, padding: '5px 12px', background: 'transparent', border: '1px solid ' + brand.border, color: brand.dim }}>No</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => openEditGroup(g)} style={{
                        ...btnBase, padding: '5px 12px', background: brand.blue + '18',
                        border: '1px solid ' + brand.blue + '30', color: brand.blue,
                      }}>✏️ Edit</button>
                      <button onClick={() => confirmDeleteGroup(g.id)} style={{
                        ...btnBase, padding: '5px 12px', background: brand.red + '18',
                        border: '1px solid ' + brand.red + '30', color: brand.red,
                      }}>🗑 Delete</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(UserManager);
