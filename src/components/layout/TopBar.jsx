'use client';
import { memo } from 'react';
import { useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import { ROLES } from '@/data/roles';

function TopBar() {
  const { view, setView, user, customer, adminLogout, userLogout, setShowUserAuth, setShowAdminLogin, cart, settings } = useApp();
  const isAdmin = view === 'admin';
  const G = brand.green;

  return (
    <div className="topbar" style={{
      background: isAdmin ? '#0C0B09' : '#FFFFFF',
      backdropFilter: 'blur(20px)',
      borderBottom: isAdmin ? '1px solid #2A2A3E' : '1px solid '+brand.storeBorder,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px',
      boxShadow: isAdmin ? 'none' : '0 1px 8px rgba(27,94,32,.06)',
    }}>
      {/* ═══ LOGO ═══ */}
      <div style={{ display:'flex', alignItems:'center', gap:10, cursor:'pointer' }} onClick={() => { if (!user) setView('store'); }}>
        {isAdmin ? (
          /* DARK ADMIN — Plain text logo, high contrast */
          <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
            <span style={{ fontFamily:brand.fontDisplay, fontSize:20, fontWeight:800, color:'#FFFFFF', letterSpacing:'-0.02em' }}>QuantumOS</span>
            <span style={{ fontSize:8, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:brand.gold, lineHeight:1 }}>Admin</span>
          </div>
        ) : (
          /* LIGHT STOREFRONT — Green badge + text */
          <>
            <div style={{ width:36, height:36, borderRadius:10, background:G, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:brand.fontDisplay, fontSize:11, color:'#fff', fontWeight:800 }}>TVS</div>
            <div>
              <div style={{ fontFamily:brand.fontDisplay, fontSize:15, color:brand.storeHeading, fontWeight:700, lineHeight:1.1 }}>{brand.name}</div>
              <div style={{ fontSize:8, color:G, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase' }}>{brand.tagline}</div>
            </div>
          </>
        )}
      </div>

      {/* ═══ STOREFRONT NAV ═══ */}
      {view === 'store' && (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {cart.length > 0 && (
            <span style={{ padding:'5px 12px', borderRadius:8, background:brand.greenMint, color:G, fontSize:11, fontWeight:700, border:'1px solid #C8E6C9' }}>
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
            <button onClick={() => setShowUserAuth(true)} style={{ padding:'8px 20px', borderRadius:10, background:G, color:'#fff', fontSize:12, fontWeight:700, border:'none', cursor:'pointer' }}>Sign In</button>
          )}
        </div>
      )}

      {/* ═══ ADMIN NAV ═══ */}
      {view === 'admin' && user && (
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:10, color:'#888' }}>{user.email}</span>
          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:ROLES[user.role]?.color+'22', color:ROLES[user.role]?.color, fontWeight:700 }}>
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
  );
}
export default memo(TopBar);
