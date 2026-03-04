'use client';
import { memo, useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { ROLES } from '@/data/roles';
import { locales, t } from '@/data/translations';

function TopBar() {
  const { view, setView, user, customer, adminLogout, userLogout, setShowUserAuth, cart, detectNearestStore, currentStore, locale, setLocale } = useApp();
  const isAdmin = view === 'admin';
  const accent = brand.blueElectric;
  const G = brand.green;
  const [locating, setLocating] = useState(false);
  const [detectedStoreName, setDetectedStoreName] = useState('');

  useEffect(() => {
    if (currentStore?.name && !detectedStoreName) setDetectedStoreName(currentStore.name);
  }, [currentStore, detectedStoreName]);

  const handleDetectLocation = async () => {
    setLocating(true);
    try {
      const result = await detectNearestStore();
      if (result?.store?.name) setDetectedStoreName(result.store.name);
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="topbar" style={{
      background: isAdmin ? '#0C0B09' : '#FFFFFF',
      backdropFilter: 'blur(20px)',
      borderBottom: isAdmin ? '1px solid #2A2A3E' : '1px solid '+brand.storeBorder,
      padding: '0 12px',
      boxShadow: isAdmin ? 'none' : '0 1px 8px rgba(37,99,235,.06)',
    }}>
      <div className="topbar-inner" style={{ width:'100%', maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, minHeight:54 }}>
      {/* ═══ LOGO ═══ */}
      <div className="topbar-left" style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer', minWidth:0, flex:1 }} onClick={() => { if (!user) setView('store'); }}>
        {isAdmin ? (
          /* DARK ADMIN — Plain text logo, high contrast */
          <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
            <span style={{ fontFamily:brand.fontDisplay, fontSize:20, fontWeight:800, color:'#FFFFFF', letterSpacing:'-0.02em' }}>QuantumOS</span>
            <span style={{ fontSize:8, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:brand.gold, lineHeight:1 }}>Admin</span>
          </div>
        ) : (
          /* LIGHT STOREFRONT — Green badge + text */
          <>
            <div style={{ width:36, height:36, borderRadius:10, background: brand.blueElectric, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:brand.fontDisplay, fontSize:11, color:'#fff', fontWeight:800 }}>TVS</div>
            <div className="topbar-brand-text" style={{ minWidth:0 }}>
              <div style={{ fontFamily:brand.fontDisplay, fontSize:15, color:brand.storeHeading, fontWeight:700, lineHeight:1.1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>TheValueStore</div>
              <div style={{ fontSize:8, color:brand.blueElectric, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Best Value. Maximum Performance.</div>
            </div>
          </>
        )}
      </div>

      {/* ═══ STOREFRONT NAV ═══ */}
      {view === 'store' && (
        <div className="topbar-right" style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, whiteSpace:'nowrap' }}>
          <button onClick={handleDetectLocation} disabled={locating} style={{ padding:'7px 10px', borderRadius:8, background:'rgba(37,99,235,.08)', color:accent, fontSize:11, fontWeight:700, border:'1px solid #BFDBFE', cursor:'pointer' }}>
            {locating ? t('locating', locale) : '📍 ' + t('autoDetect', locale)}
          </button>
          {detectedStoreName ? (
            <span className="topbar-location-chip" style={{ padding:'5px 10px', borderRadius:8, background:'#EFF6FF', color:accent, fontSize:11, fontWeight:700, border:'1px solid #BFDBFE', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis' }} title={t('store', locale)}>
              📍 {detectedStoreName}
            </span>
          ) : null}
          <span className="topbar-currency-chip" style={{ padding:'5px 10px', borderRadius:8, background:'#ECFDF5', color:brand.emerald, fontSize:11, fontWeight:700, border:'1px solid #A7F3D0' }} title={t('currencyLabel', locale)}>
            {t('currency', locale)}
          </span>
          <select value={locale} onChange={e => setLocale(e.target.value)} style={{ padding:'5px 8px', borderRadius:8, border:'1px solid '+brand.storeBorder, background:'#fff', color:brand.storeHeading, fontSize:11, fontWeight:600, cursor:'pointer', maxWidth:100 }} title="Language">
            {locales.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
          {cart.length > 0 && (
            <span style={{ padding:'5px 12px', borderRadius:8, background:brand.greenMint, color:brand.emerald, fontSize:11, fontWeight:700, border:'1px solid #A7F3D0' }}>
              🛒 {cart.length}
            </span>
          )}
          {customer ? (
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12, color:brand.storeHeading, fontWeight:500 }}>{customer.name}</span>
              <span style={{ fontSize:9, padding:'2px 7px', borderRadius:4, background:brand.greenMint, color:G, fontWeight:700 }}>{customer.tier}</span>
              <button onClick={userLogout} style={{ fontSize:10, color:brand.storeDim, background:'none', border:'none', cursor:'pointer' }}>Sign out</button>
            </div>
          ) : (
            <button onClick={() => setShowUserAuth(true)} style={{ padding:'8px 20px', borderRadius:10, background:accent, color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>Sign In</button>
          )}
        </div>
      )}

      {/* ═══ ADMIN NAV ═══ */}
      {view === 'admin' && user && (
        <div className="topbar-right" style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0, whiteSpace:'nowrap' }}>
          <span style={{ fontSize:10, color:'#888' }}>{user.email}</span>
              <span style={{ fontSize:9, padding:'2px 8px', borderRadius:6, background:ROLES[user.role]?.color+'22', color:ROLES[user.role]?.color, fontWeight:700 }}>
            {ROLES[user.role]?.emoji} {ROLES[user.role]?.label}
          </span>
          <button onClick={() => setView('store')} style={{ fontSize:10, color:'#999', background:'rgba(255,255,255,.04)', padding:'5px 12px', borderRadius:6, border:'1px solid #2A2A3E', cursor:'pointer' }}>
            🛍 Store
          </button>
          <button onClick={adminLogout} style={{ fontSize:10, color:'#EF4444', background:'#EF444412', padding:'5px 12px', borderRadius:6, border:'none', cursor:'pointer' }}>
            Logout
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
export default memo(TopBar);
