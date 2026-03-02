'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';

const TABLES = [
  { name: 'audit_logs', icon: '📋', hotDays: 30, warmDays: 180, archiveDays: 365, purgeDays: 730, rows: '124,521', size: '45 MB', partitions: 6, health: 'healthy' },
  { name: 'order_events', icon: '📦', hotDays: 30, warmDays: 90, archiveDays: 365, purgeDays: 730, rows: '89,412', size: '32 MB', partitions: 4, health: 'healthy' },
  { name: 'analytics_events', icon: '📊', hotDays: 7, warmDays: 30, archiveDays: 90, purgeDays: 365, rows: '512,340', size: '128 MB', partitions: 3, health: 'warning' },
  { name: 'notification_logs', icon: '🔔', hotDays: 14, warmDays: 60, archiveDays: 180, purgeDays: 365, rows: '67,890', size: '18 MB', partitions: 3, health: 'healthy' },
  { name: 'tracking_points', icon: '📍', hotDays: 7, warmDays: 30, archiveDays: 90, purgeDays: 180, rows: '1,234,567', size: '256 MB', partitions: 3, health: 'critical' },
  { name: 'ledger_entries', icon: '💰', hotDays: 30, warmDays: 365, archiveDays: 730, purgeDays: 0, rows: '45,678', size: '12 MB', partitions: 6, health: 'healthy' },
];

const DB_METRICS = [
  { label: 'Total DB Size', value: '1.2 GB', color: brand.blue },
  { label: 'Index Size', value: '380 MB', color: brand.purple },
  { label: 'Active Connections', value: '24/100', color: brand.emerald },
  { label: 'Slow Queries (24h)', value: '3', color: brand.saffron },
  { label: 'Partition Health', value: '5/6 OK', color: brand.gold },
  { label: 'Last Vacuum', value: '2h ago', color: brand.dim },
];

function DataLifecycle() {
  const { show } = useApp();
  const [tables, setTables] = useState(TABLES);
  const [activeTab, setActiveTab] = useState('overview');

  const archive = (name) => { show('Archiving ' + name + ' cold data...'); setTables(p => p.map(t => t.name === name ? { ...t, health: 'archiving' } : t)); setTimeout(() => { setTables(p => p.map(t => t.name === name ? { ...t, health: 'healthy' } : t)); show(name + ' archived!'); }, 1500); };
  const purge = (name) => { if (confirm('Purge expired data from ' + name + '?')) { show('Purging ' + name + '...'); } };
  const createPartition = (name) => { show('Creating next month partition for ' + name + '...'); setTimeout(() => show(name + ' partition created!'), 1000); };

  return (
    <div>
      <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: brand.heading, marginBottom: 4 }}>🗄 Data Lifecycle Management</h2>
      <p style={{ fontSize: 12, color: brand.dim, marginBottom: 16 }}>Partitioning · Hot/Warm/Cold · Archival · Retention · DB Health</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['overview', 'partitions', 'slow_queries', 'automation'].map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', background: activeTab === t ? brand.gold + '22' : 'transparent', color: activeTab === t ? brand.gold : brand.dim }}>
            {t === 'overview' ? '📊 Overview' : t === 'partitions' ? '🗂 Partitions' : t === 'slow_queries' ? '🐌 Slow Queries' : '⚙️ Automation'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginBottom: 20 }}>
          {DB_METRICS.map(m => <StatCard key={m.label} label={m.label} value={m.value} color={m.color} icon="📈" />)}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ borderBottom: '1px solid ' + brand.border }}>
              {['Table', 'Rows', 'Size', 'Hot', 'Warm', 'Archive', 'Purge', 'Partitions', 'Health', 'Actions'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: brand.dim, fontWeight: 600, fontSize: 10 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{tables.map(t => (
              <tr key={t.name} style={{ borderBottom: '1px solid ' + brand.border + '20' }}>
                <td style={{ padding: '8px 10px', fontWeight: 600, color: brand.heading }}>{t.icon} {t.name}</td>
                <td style={{ padding: '8px 10px' }}>{t.rows}</td>
                <td style={{ padding: '8px 10px' }}>{t.size}</td>
                <td style={{ padding: '8px 10px', color: brand.emerald }}>{t.hotDays}d</td>
                <td style={{ padding: '8px 10px', color: brand.saffron }}>{t.warmDays}d</td>
                <td style={{ padding: '8px 10px', color: brand.blue }}>{t.archiveDays}d</td>
                <td style={{ padding: '8px 10px', color: t.purgeDays === 0 ? brand.gold : brand.dim }}>{t.purgeDays === 0 ? 'Never' : t.purgeDays + 'd'}</td>
                <td style={{ padding: '8px 10px' }}>{t.partitions}</td>
                <td style={{ padding: '8px 10px' }}><Badge color={t.health === 'healthy' ? brand.emerald : t.health === 'warning' ? brand.saffron : brand.red}>{t.health}</Badge></td>
                <td style={{ padding: '8px 10px', display: 'flex', gap: 4 }}>
                  <button onClick={() => archive(t.name)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: brand.blue + '15', color: brand.blue, border: 'none' }}>Archive</button>
                  <button onClick={() => purge(t.name)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: brand.red + '15', color: brand.red, border: 'none' }}>Purge</button>
                  <button onClick={() => createPartition(t.name)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: brand.emerald + '15', color: brand.emerald, border: 'none' }}>+Part</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>}

      {activeTab === 'partitions' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
        {tables.flatMap(t => Array.from({ length: t.partitions }, (_, i) => {
          const date = new Date(2026, -t.partitions + i + 2, 1);
          const age = Math.round((Date.now() - date.getTime()) / 86400000);
          const temp = age <= t.hotDays ? 'hot' : age <= t.warmDays ? 'warm' : 'cold';
          return { table: t.name, partition: t.name + '_' + date.toISOString().slice(0, 7).replace('-', '_'), rows: Math.round(Number(t.rows.replace(/,/g, '')) / t.partitions).toLocaleString(), temp, icon: t.icon };
        })).map(p => (
          <div key={p.partition} style={{ background: brand.card, border: '1px solid ' + brand.border, borderLeft: '3px solid ' + (p.temp === 'hot' ? brand.red : p.temp === 'warm' ? brand.saffron : brand.blue), borderRadius: 12, padding: 12 }}>
            <div style={{ fontFamily: 'monospace', fontWeight: 600, color: brand.heading, fontSize: 12 }}>{p.icon} {p.partition}</div>
            <div style={{ display: 'flex', gap: 12, fontSize: 11, marginTop: 4 }}>
              <span>📊 {p.rows} rows</span>
              <Badge color={p.temp === 'hot' ? brand.red : p.temp === 'warm' ? brand.saffron : brand.blue}>{p.temp}</Badge>
            </div>
          </div>
        ))}
      </div>}

      {activeTab === 'slow_queries' && <div>
        {[
          { query: 'SELECT * FROM analytics_events WHERE...', time: '2.4s', table: 'analytics_events', suggestion: 'Add index on (tenant_id, event_name, created_at)' },
          { query: 'SELECT COUNT(*) FROM tracking_points WHERE...', time: '1.8s', table: 'tracking_points', suggestion: 'Use rollup table instead of raw COUNT' },
          { query: 'SELECT * FROM orders JOIN customers ON...', time: '850ms', table: 'orders', suggestion: 'Add composite index on (tenant_id, customer_phone)' },
        ].map((q, i) => (
          <div key={i} style={{ background: brand.card, border: '1px solid ' + brand.border, borderLeft: '3px solid ' + brand.saffron, borderRadius: 12, padding: 16, marginBottom: 8 }}>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: brand.heading, marginBottom: 4 }}>{q.query}</div>
            <div style={{ display: 'flex', gap: 16, fontSize: 11 }}>
              <span style={{ color: brand.red }}>⏱ {q.time}</span>
              <span>📋 {q.table}</span>
            </div>
            <div style={{ fontSize: 11, color: brand.emerald, marginTop: 6 }}>💡 {q.suggestion}</div>
          </div>
        ))}
      </div>}

      {activeTab === 'automation' && <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 12, padding: 16 }}>
        {[
          { job: 'create_monthly_partitions()', schedule: '0 0 25 * *', desc: 'Auto-create next month partitions', last: '2026-01-25', next: '2026-02-25', active: true },
          { job: 'compute_daily_rollup()', schedule: '0 2 * * *', desc: 'Compute revenue/order rollups', last: '2026-02-28 02:00', next: '2026-03-01 02:00', active: true },
          { job: 'archive_cold_data()', schedule: '0 3 * * *', desc: 'Move cold data to archive schema', last: '2026-02-28 03:00', next: '2026-03-01 03:00', active: true },
          { job: 'VACUUM ANALYZE', schedule: '0 4 * * *', desc: 'Nightly vacuum and analyze', last: '2026-02-28 04:00', next: '2026-03-01 04:00', active: true },
          { job: 'retention_enforcer()', schedule: '0 5 * * SUN', desc: 'Purge data past retention window', last: '2026-02-23 05:00', next: '2026-03-02 05:00', active: true },
        ].map(j => (
          <div key={j.job} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid ' + brand.border + '20' }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontWeight: 600, color: brand.heading, fontSize: 13 }}>{j.job}</div>
              <div style={{ fontSize: 11, color: brand.dim }}>{j.desc} · cron: {j.schedule}</div>
              <div style={{ fontSize: 10, color: brand.dim }}>Last: {j.last} · Next: {j.next}</div>
            </div>
            <button style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative', background: j.active ? brand.emerald : brand.dim + '40' }}>
              <span style={{ position: 'absolute', top: 2, left: j.active ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .3s' }} />
            </button>
          </div>
        ))}
      </div>}
    </div>
  );
}

export default memo(DataLifecycle);
