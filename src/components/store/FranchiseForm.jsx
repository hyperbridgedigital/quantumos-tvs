'use client';
import { useState, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';

function FranchiseForm() {
  const { settings, franchises, show } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', city: '', investment: '',
    experience: '', currentBusiness: '', message: '',
  });

  const minInv = settings.FRANCHISE_MIN_INVESTMENT || '15';
  const maxInv = settings.FRANCHISE_MAX_INVESTMENT || '35';
  const royalty = settings.FRANCHISE_DEFAULT_ROYALTY || '12';
  const contactEmail = settings.FRANCHISE_CONTACT_EMAIL || 'franchise@thevaluestore.com';
  const contactPhone = settings.FRANCHISE_CONTACT_PHONE || '+91 98765 43210';

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.city) return show('Fill required fields', 'error');
    setSubmitted(true);
    show('🎉 Franchise inquiry submitted! We\'ll contact you within 24 hours.');
  };

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const input = (key, label, type = 'text', required = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: brand.dim, marginBottom: 6, letterSpacing: '.06em', textTransform: 'uppercase' }}>
        {label} {required && <span style={{ color: brand.red }}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea value={form[key]} onChange={e => upd(key, e.target.value)} rows={3} placeholder={label}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, color: brand.heading, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: "'Figtree', system-ui" }} />
      ) : type === 'select' ? (
        <select value={form[key]} onChange={e => upd(key, e.target.value)}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid ' + brand.border, color: brand.heading, fontSize: 14, outline: 'none' }}>
          <option value="" style={{ background: brand.bg2 }}>Select...</option>
          {key === 'investment' && ['Below ₹10L', '₹10-15L', '₹15-25L', '₹25-35L', 'Above ₹35L'].map(o => <option key={o} value={o} style={{ background: brand.bg2 }}>{o}</option>)}
          {key === 'experience' && ['No prior F&B experience', '1-3 years', '3-5 years', '5+ years', 'Currently in F&B business'].map(o => <option key={o} value={o} style={{ background: brand.bg2 }}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key]} onChange={e => upd(key, e.target.value)} placeholder={label}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid ' + brand.border, color: brand.heading, fontSize: 14, outline: 'none' }} />
      )}
    </div>
  );

  if (submitted) return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, background: brand.emerald + '15', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 20 }}>✅</div>
      <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 26, color: brand.heading, marginBottom: 8 }}>Application Received!</h2>
      <p style={{ fontSize: 14, color: brand.dim, marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
        Thank you, {form.name}. Our franchise team will review your application and contact you within 24 hours.
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={'tel:' + contactPhone} style={{ padding: '10px 24px', borderRadius: 12, background: brand.blue + '15', color: brand.blue, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>📞 {contactPhone}</a>
        <a href={'mailto:' + contactEmail} style={{ padding: '10px 24px', borderRadius: 12, background: brand.purple + '15', color: brand.purple, textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>✉️ {contactEmail}</a>
      </div>
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,' + brand.gold + '08, transparent)', border: '1px solid ' + brand.gold + '20', borderRadius: 20, padding: '36px 28px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 200, height: 200, borderRadius: '50%', background: brand.gold + '06' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: brand.gold, marginBottom: 10 }}>🏢 Franchise Opportunity</div>
          <h2 style={{ fontFamily: brand.fontDisplay, fontSize: 'clamp(24px,5vw,36px)', color: brand.heading, lineHeight: 1.1, marginBottom: 8 }}>
            Own a <span style={{ color: brand.gold }}>{brand.name}</span>
          </h2>
          <p style={{ fontSize: 14, color: brand.dim, maxWidth: 480 }}>
            Join India's fastest-growing premium restaurant chain. {franchises?.length || 16}+ outlets across Chennai. Investment: ₹{minInv}L - ₹{maxInv}L.
          </p>
        </div>
      </div>

      {/* Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { v: '₹' + minInv + '-' + maxInv + 'L', l: 'Investment Range', c: brand.gold, e: '💰' },
          { v: royalty + '%', l: 'Royalty Fee', c: brand.blue, e: '📊' },
          { v: '12-18mo', l: 'ROI Period', c: brand.emerald, e: '⏱' },
          { v: (franchises?.length || 16) + '+', l: 'Active Outlets', c: brand.purple, e: '🏪' },
        ].map(s => (
          <div key={s.l} style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{s.e}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.c, fontFamily: brand.fontDisplay }}>{s.v}</div>
            <div style={{ fontSize: 10, color: brand.dim, fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Benefits */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 10, marginBottom: 24 }}>
        {[
          { e: '🍗', t: 'Proven Menu', d: 'Award-winning signature biryani & kebabs loved across Chennai' },
          { e: '📱', t: 'Tech-Powered', d: 'Full admin dashboard, POS, inventory, delivery & WhatsApp automation' },
          { e: '🎓', t: 'Training & Support', d: 'Complete kitchen training, operations manual & ongoing guidance' },
          { e: '📣', t: 'Marketing Engine', d: 'Viral WhatsApp marketing, referral programs & brand campaigns' },
          { e: '🛵', t: 'Delivery Network', d: 'Integrated with Dunzo, Swiggy, Porter & 10+ delivery partners' },
          { e: '📊', t: 'Real-time Analytics', d: 'AI insights, demand forecasting & performance dashboards' },
        ].map(b => (
          <div key={b.t} style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{b.e}</div>
            <div style={{ fontWeight: 700, color: brand.heading, fontSize: 14, marginBottom: 4 }}>{b.t}</div>
            <div style={{ fontSize: 12, color: brand.dim }}>{b.d}</div>
          </div>
        ))}
      </div>

      {/* Inquiry Form */}
      <div style={{ background: brand.card, border: '1px solid ' + brand.border, borderRadius: 20, padding: 28 }}>
        <div style={{ borderBottom: '3px solid ' + brand.gold, display: 'inline-block', marginBottom: 20, paddingBottom: 4 }}>
          <h3 style={{ fontFamily: brand.fontDisplay, fontSize: 20, color: brand.heading }}>📝 Apply for Franchise</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '0 16px' }}>
          {input('name', 'Full Name', 'text', true)}
          {input('phone', 'Phone Number', 'tel', true)}
          {input('email', 'Email Address', 'email')}
          {input('city', 'Preferred City / Area', 'text', true)}
          {input('investment', 'Investment Budget', 'select')}
          {input('experience', 'F&B Experience', 'select')}
        </div>
        {input('currentBusiness', 'Current Business (if any)', 'text')}
        {input('message', 'Why ' + brand.name + '?', 'textarea')}

        <button onClick={handleSubmit}
          style={{ width: '100%', padding: 16, borderRadius: 14, fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg,' + brand.gold + ',' + brand.saffron + ')', color: '#000',
            boxShadow: '0 4px 20px rgba(201,168,76,.3)', marginTop: 8 }}>
          🏢 Submit Franchise Inquiry
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: brand.dim }}>
          Or contact directly: <a href={'tel:' + contactPhone} style={{ color: brand.blue }}>{contactPhone}</a> · <a href={'mailto:' + contactEmail} style={{ color: brand.purple }}>{contactEmail}</a>
        </div>
      </div>
    </div>
  );
}

export default memo(FranchiseForm);
