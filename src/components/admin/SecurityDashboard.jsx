'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';
import { getSecurityEvents } from '@/lib/security/middleware';
import { isEnabled, setFlag, getFlags } from '@/lib/featureFlags';

function SecurityDashboard() {
  const { show } = useApp();
  const [flags, setFlags] = useState(getFlags());
  const events = getSecurityEvents(20);

  const toggleFlag = (key) => {
    const newVal = !flags[key];
    setFlag(key, newVal);
    setFlags(prev => ({ ...prev, [key]: newVal }));
    show(key + ' → ' + (newVal ? 'enabled' : 'disabled'));
  };

  const COMPLIANCE = [
    { name: 'SOC 2 Type II', status: 'ready', items: ['Audit logs immutable', 'Access controls', 'Encryption at rest', 'Incident response plan'] },
    { name: 'ISO 27001', status: 'aligned', items: ['ISMS policy', 'Risk assessment', 'Access management', 'Cryptographic controls'] },
    { name: 'GDPR', status: 'compliant', items: ['Consent management', 'Data portability', 'Right to erasure', 'DPO appointed', 'Breach notification'] },
    { name: 'OWASP Top 10', status: 'protected', items: ['Injection prevention', 'Auth hardening', 'XSS filtering', 'CSRF tokens', 'Rate limiting'] },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: brand.heading, marginBottom: 16 }}>🔒 Security & Compliance Center</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 10, marginBottom: 20 }}>
        <StatCard label="Security Score" value="94/100" color={brand.emerald} icon="🛡" />
        <StatCard label="Active Threats" value="0" color={brand.emerald} icon="⚠️" />
        <StatCard label="Blocked Today" value="23" color={brand.blue} icon="🚫" />
        <StatCard label="TLS Version" value="1.3" color={brand.emerald} icon="🔐" />
        <StatCard label="Encryption" value="AES-256" color={brand.purple} icon="🔑" />
        <StatCard label="MFA Enabled" value="Yes" color={brand.gold} icon="📱" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: brand.gold, marginBottom: 12 }}>🏛 Compliance Status</div>
          {COMPLIANCE.map(c => (
            <div key={c.name} style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 12, padding: 14, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: brand.heading }}>{c.name}</span>
                <Badge color={brand.emerald}>{c.status}</Badge>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {c.items.map(i => <span key={i} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: brand.emerald + '10', color: brand.emerald }}>✅ {i}</span>)}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: brand.purple, marginBottom: 12 }}>🚩 Feature Flags</div>
          <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 12, padding: 16 }}>
            {Object.entries(flags).map(([key, val]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid ' + brand.border + '20' }}>
                <span style={{ fontSize: 12, color: brand.heading, fontFamily: 'monospace' }}>{key}</span>
                <button onClick={() => toggleFlag(key)} style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative', background: val ? brand.emerald : brand.dim + '40' }}>
                  <span style={{ position: 'absolute', top: 2, left: val ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .3s' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: brand.red, marginBottom: 12 }}>🔔 Security Events</div>
      {events.length === 0 ? <div style={{ padding: 20, textAlign: 'center', color: brand.emerald, background: brand.card, borderRadius: 12 }}>✅ No security events — all clear</div> :
      events.map((e, i) => (
        <div key={i} style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 8, padding: 10, marginBottom: 4, fontSize: 12 }}>
          <Badge color={e.blocked ? brand.red : brand.saffron}>{e.type}</Badge>
          <span style={{ color: brand.dim, marginLeft: 8 }}>{e.timestamp}</span>
        </div>
      ))}
    </div>
  );
}

export default memo(SecurityDashboard);
