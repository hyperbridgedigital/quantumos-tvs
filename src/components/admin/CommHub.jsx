'use client';
import { useState, useMemo, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/shared/Badge';
import { partnerConfig } from '@/data/partners';

const CHANNELS = [
  { key: 'whatsapp', label: 'WhatsApp', emoji: '💚', color: '#25D366' },
  { key: 'sms', label: 'SMS', emoji: '📨', color: '#3B82F6' },
  { key: 'email', label: 'Email', emoji: '📧', color: '#8B5CF6' },
];

const CHANNEL_PREFIX = { whatsapp: '💚 WhatsApp', sms: '📨 SMS', email: '📧 Email' };

function CommHub() {
  const { partnerValues, updatePartnerConfig, savePartnerConfig, show, settings } = useApp();
  const [channel, setChannel] = useState('whatsapp');
  const [sub, setSub] = useState('providers');
  const [search, setSearch] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testMsg, setTestMsg] = useState('Hello from ' + brand.name + '! Your OTP is 1234.');
  const [sending, setSending] = useState(false);
  const [showPass, setShowPass] = useState({});

  // Active provider per channel (stored in settings-like state)
  const [activeProviders, setActiveProviders] = useState({
    whatsapp: 'Meta', sms: 'MSG91', email: 'SendGrid'
  });

  // Filter sections by channel
  const channelSections = useMemo(() => {
    const prefix = CHANNEL_PREFIX[channel];
    return Object.entries(partnerConfig).filter(([section]) => section.startsWith(prefix));
  }, [channel]);

  // Get unique providers per channel
  const channelProviders = useMemo(() => {
    const providers = new Map();
    channelSections.forEach(([section, keys]) => {
      const providerName = section.split('—')[1]?.trim().split('(')[0]?.trim() || 'Unknown';
      const origin = section.includes('India') ? '🇮🇳' : section.includes('Global') ? '🌍' : '';
      const configured = keys.filter(k => partnerValues[k.key]).length;
      const total = keys.length;
      const docs = keys[0]?.docs || '';
      providers.set(providerName, { name: providerName, section, keys, configured, total, origin, docs });
    });
    return [...providers.values()];
  }, [channelSections, partnerValues]);

  // Stats
  const stats = useMemo(() => {
    const totalProviders = channelProviders.length;
    const configured = channelProviders.filter(p => p.configured > 0).length;
    const totalKeys = channelProviders.reduce((a, p) => a + p.total, 0);
    const filledKeys = channelProviders.reduce((a, p) => a + p.configured, 0);
    return { totalProviders, configured, totalKeys, filledKeys };
  }, [channelProviders]);

  const filtered = channelSections.filter(([section, keys]) =>
    !search || section.toLowerCase().includes(search.toLowerCase()) ||
    keys.some(k => k.label.toLowerCase().includes(search.toLowerCase()) || k.partner.toLowerCase().includes(search.toLowerCase()))
  );

  const testSend = () => {
    setSending(true);
    const target = channel === 'email' ? testEmail : testPhone;
    if (!target) { show('Enter a ' + (channel === 'email' ? 'email' : 'phone number'), 'error'); setSending(false); return; }
    setTimeout(() => {
      show('✅ Test ' + channel + ' sent to ' + target + ' via ' + activeProviders[channel]);
      setSending(false);
    }, 1500);
  };

  const setActive = (provider) => {
    setActiveProviders(p => ({ ...p, [channel]: provider }));
    show(provider + ' set as active ' + channel + ' provider');
  };

  const togglePass = (key) => setShowPass(p => ({ ...p, [key]: !p[key] }));

  const ch = CHANNELS.find(c => c.key === channel);

  return (
    <div>
      <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 22, color: brand.heading, marginBottom: 4 }}>📡 Communication Hub</h2>
      <p style={{ fontSize: 12, color: brand.dim, marginBottom: 16 }}>Configure SMS, Email & WhatsApp providers — Indian & Global · Test Send · Provider Switching</p>

      {/* Channel tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {CHANNELS.map(c => (
          <button key={c.key} onClick={() => { setChannel(c.key); setSub('providers'); setSearch(''); }}
            style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: '2px solid ' + (channel === c.key ? c.color : 'transparent'), background: channel === c.key ? c.color + '15' : 'rgba(255,255,255,.03)', color: channel === c.key ? c.color : brand.dim, cursor: 'pointer' }}>
            {c.emoji} {c.label}
            <span style={{ fontSize: 10, display: 'block', fontWeight: 400, marginTop: 2 }}>
              {Object.entries(partnerConfig).filter(([s]) => s.startsWith(CHANNEL_PREFIX[c.key])).length} providers
            </span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(145px,1fr))', gap: 10, marginBottom: 16 }}>
        <StatCard label="Active Provider" value={activeProviders[channel]} color={ch.color} icon="✅" />
        <StatCard label="Providers Available" value={stats.totalProviders} color={brand.blue} icon="📦" />
        <StatCard label="Configured" value={stats.configured + '/' + stats.totalProviders} color={stats.configured > 0 ? brand.emerald : brand.saffron} icon="🔧" />
        <StatCard label="API Keys Filled" value={stats.filledKeys + '/' + stats.totalKeys} color={brand.purple} icon="🔑" />
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {['providers', 'configure', 'test', 'logs'].map(t => (
          <button key={t} onClick={() => setSub(t)}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', background: sub === t ? ch.color + '22' : 'transparent', color: sub === t ? ch.color : brand.dim, cursor: 'pointer' }}>
            {t === 'providers' ? '📦 Providers' : t === 'configure' ? '🔧 Configure' : t === 'test' ? '🧪 Test Send' : '📋 Delivery Logs'}
          </button>
        ))}
      </div>

      {/* ═══ PROVIDERS OVERVIEW ═══ */}
      {sub === 'providers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 10 }}>
          {channelProviders.map(p => (
            <div key={p.name} style={{ background: brand.card, border: '1px solid ' + (activeProviders[channel] === p.name ? ch.color : brand.border), borderRadius: 14, padding: 16, position: 'relative' }}>
              {activeProviders[channel] === p.name && (
                <div style={{ position: 'absolute', top: -1, right: 16, background: ch.color, color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 10px', borderRadius: '0 0 6 6', letterSpacing: '.1em' }}>ACTIVE</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, color: brand.heading, fontSize: 15 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: brand.dim }}>{p.origin} {p.total} keys</div>
                </div>
                <Badge color={p.configured === p.total && p.total > 0 ? brand.emerald : p.configured > 0 ? brand.saffron : brand.dim}>
                  {p.configured}/{p.total}
                </Badge>
              </div>

              {/* Progress bar */}
              <div style={{ height: 4, background: brand.border, borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ height: 4, width: (p.configured / p.total * 100) + '%', background: p.configured === p.total ? brand.emerald : ch.color, borderRadius: 2, transition: 'width .3s' }} />
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { setActive(p.name); }} disabled={p.configured === 0}
                  style={{ flex: 1, padding: '7px 0', borderRadius: 8, fontSize: 11, fontWeight: 700, border: 'none', cursor: p.configured > 0 ? 'pointer' : 'not-allowed',
                    background: activeProviders[channel] === p.name ? ch.color + '22' : (p.configured > 0 ? brand.emerald + '15' : brand.border),
                    color: activeProviders[channel] === p.name ? ch.color : (p.configured > 0 ? brand.emerald : brand.dim) }}>
                  {activeProviders[channel] === p.name ? '✅ Active' : p.configured > 0 ? 'Set Active' : 'Not Configured'}
                </button>
                <button onClick={() => { setSub('configure'); setSearch(p.name); }}
                  style={{ padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid ' + brand.border, background: 'transparent', color: brand.dim, cursor: 'pointer' }}>
                  ⚙️
                </button>
                {p.docs && (
                  <a href={p.docs} target="_blank" rel="noopener" style={{ padding: '7px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid ' + brand.border, background: 'transparent', color: brand.blue, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    📄
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══ CONFIGURE KEYS ═══ */}
      {sub === 'configure' && (
        <div>
          <input placeholder={'Search ' + channel + ' providers...'} value={search} onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 360, marginBottom: 16, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, borderRadius: 10, padding: '10px 14px', color: brand.heading, fontSize: 13, outline: 'none', width: '100%' }} />

          {filtered.map(([section, keys]) => {
            const providerName = section.split('—')[1]?.trim().split('(')[0]?.trim();
            const isActive = activeProviders[channel] === providerName;
            const fKeys = keys.filter(k => !search || k.label.toLowerCase().includes(search.toLowerCase()) || k.partner.toLowerCase().includes(search.toLowerCase()));
            if (!fKeys.length && search) return null;

            return (
              <div key={section} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: ch.color }}>{section}</div>
                  {isActive && <Badge color={ch.color}>ACTIVE</Badge>}
                  {!isActive && <button onClick={() => setActive(providerName)} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: brand.emerald + '15', color: brand.emerald, border: 'none', cursor: 'pointer' }}>Set Active</button>}
                </div>
                <div style={{ background: brand.card, border: '1px solid ' + (isActive ? ch.color + '40' : brand.border), borderRadius: 14, padding: 16 }}>
                  {(fKeys.length ? fKeys : keys).map(k => (
                    <div key={k.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid ' + brand.border + '15' }}>
                      <Badge color={brand.blue}>{k.partner}</Badge>
                      <label style={{ width: 170, fontSize: 12, color: brand.text, fontWeight: 600, flexShrink: 0 }}>{k.label}</label>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type={k.type === 'password' && !showPass[k.key] ? 'password' : 'text'}
                          value={partnerValues[k.key] || ''}
                          onChange={e => updatePartnerConfig(k.key, e.target.value)}
                          placeholder={k.label}
                          style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, borderRadius: 8, padding: '9px 12px', paddingRight: k.type === 'password' ? 36 : 12, color: brand.heading, fontSize: 13, outline: 'none' }}
                        />
                        {k.type === 'password' && (
                          <button onClick={() => togglePass(k.key)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: brand.dim, fontSize: 11, cursor: 'pointer' }}>
                            {showPass[k.key] ? '🙈' : '👁'}
                          </button>
                        )}
                      </div>
                      {partnerValues[k.key] ? (
                        <span style={{ fontSize: 10, color: brand.emerald }}>✅</span>
                      ) : (
                        <span style={{ fontSize: 10, color: brand.dim }}>○</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <button onClick={() => { savePartnerConfig(); show('All ' + channel + ' provider keys saved!'); }}
            style={{ padding: '12px 32px', borderRadius: 12, background: ch.color, color: '#fff', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 8 }}>
            💾 Save All {channel.charAt(0).toUpperCase() + channel.slice(1)} Config
          </button>
        </div>
      )}

      {/* ═══ TEST SEND ═══ */}
      {sub === 'test' && (
        <div style={{ maxWidth: 480 }}>
          <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: ch.color, marginBottom: 16 }}>
              🧪 Test {channel.toUpperCase()} via {activeProviders[channel]}
            </div>

            {channel !== 'email' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: brand.dim, fontWeight: 600, marginBottom: 6 }}>Phone Number</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, color: brand.dim, fontSize: 14, flexShrink: 0 }}>+91</div>
                  <input type="tel" value={testPhone} onChange={e => setTestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210" maxLength={10}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, color: brand.heading, fontSize: 14, outline: 'none' }} />
                </div>
              </div>
            )}

            {channel === 'email' && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, color: brand.dim, fontWeight: 600, marginBottom: 6 }}>Email Address</label>
                <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, color: brand.heading, fontSize: 14, outline: 'none' }} />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: brand.dim, fontWeight: 600, marginBottom: 6 }}>Message</label>
              <textarea value={testMsg} onChange={e => setTestMsg(e.target.value)} rows={3}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, color: brand.heading, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: "'Figtree', sans-serif" }} />
            </div>

            <button onClick={testSend} disabled={sending}
              style={{ width: '100%', padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, border: 'none', cursor: sending ? 'not-allowed' : 'pointer', background: sending ? brand.border : ch.color, color: sending ? brand.dim : '#fff' }}>
              {sending ? '⏳ Sending...' : '🚀 Send Test ' + channel.charAt(0).toUpperCase() + channel.slice(1)}
            </button>
          </div>

          {/* Provider quick-switch for testing */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: brand.dim, marginBottom: 8, fontWeight: 600 }}>Switch provider for testing:</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {channelProviders.filter(p => p.configured > 0).map(p => (
                <button key={p.name} onClick={() => setActive(p.name)}
                  style={{ padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600, border: '1px solid ' + (activeProviders[channel] === p.name ? ch.color : brand.border), background: activeProviders[channel] === p.name ? ch.color + '15' : 'transparent', color: activeProviders[channel] === p.name ? ch.color : brand.dim, cursor: 'pointer' }}>
                  {activeProviders[channel] === p.name ? '✅ ' : ''}{p.name}
                </button>
              ))}
              {channelProviders.filter(p => p.configured > 0).length === 0 && (
                <div style={{ fontSize: 12, color: brand.saffron, padding: 8 }}>⚠️ No providers configured yet. Go to Configure tab to add API keys.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ DELIVERY LOGS ═══ */}
      {sub === 'logs' && (
        <div>
          <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + brand.border, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: brand.heading }}>Recent {channel} Deliveries</span>
              <Badge color={brand.emerald}>Live</Badge>
            </div>
            {[
              { to: '+91 98765 43210', status: 'delivered', provider: activeProviders[channel], time: '2 min ago', template: 'order_confirmation' },
              { to: '+91 87654 32109', status: 'delivered', provider: activeProviders[channel], time: '8 min ago', template: 'otp_verify' },
              { to: '+91 76543 21098', status: 'read', provider: activeProviders[channel], time: '15 min ago', template: 'delivery_update' },
              { to: '+91 65432 10987', status: 'sent', provider: activeProviders[channel], time: '22 min ago', template: 'marketing_blast' },
              { to: '+91 54321 09876', status: 'failed', provider: activeProviders[channel], time: '45 min ago', template: 'otp_verify' },
              { to: '+91 43210 98765', status: 'delivered', provider: activeProviders[channel], time: '1h ago', template: 'feedback_request' },
            ].map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: '1px solid ' + brand.border + '15', fontSize: 12 }}>
                <span style={{ color: brand.heading, fontFamily: 'monospace', width: 130, flexShrink: 0 }}>{channel === 'email' ? l.to.replace(/\+91 /, '') + '@mail.com' : l.to}</span>
                <Badge color={l.status === 'delivered' ? brand.emerald : l.status === 'read' ? brand.blue : l.status === 'sent' ? brand.saffron : brand.red}>{l.status}</Badge>
                <span style={{ color: brand.dim }}>{l.provider}</span>
                <span style={{ color: brand.dim, fontFamily: 'monospace', fontSize: 10 }}>{l.template}</span>
                <span style={{ color: brand.dim, marginLeft: 'auto', fontSize: 10 }}>{l.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(CommHub);
