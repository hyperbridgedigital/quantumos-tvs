'use client';
import { lazy, Suspense, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { LocaleProvider } from '@/context/LocaleContext';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { brand } from '@/lib/brand';
import TopBar from '@/components/layout/TopBar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import UserAuthModal from '@/components/auth/UserAuthModal';
import AdminLoginModal from '@/components/auth/AdminLoginModal';

const StoreView = lazy(() => import('@/components/store/StoreView'));
const KynetraAgent = lazy(() => import('@/components/store/KynetraAgent'));
const Dashboard = lazy(() => import('@/components/admin/Dashboard'));
const OMS = lazy(() => import('@/components/admin/OMS'));
const StoreLocator = lazy(() => import('@/components/admin/StoreLocator'));
const DeliveryEngine = lazy(() => import('@/components/admin/DeliveryEngine'));
const StockWMS = lazy(() => import('@/components/admin/StockWMS'));
const POS = lazy(() => import('@/components/admin/POS'));
const Franchise = lazy(() => import('@/components/admin/Franchise'));
const WhatsAppViral = lazy(() => import('@/components/admin/WhatsAppViral'));
const Marketing = lazy(() => import('@/components/admin/Marketing'));
const CRM = lazy(() => import('@/components/admin/CRM'));
const PartnerIDs = lazy(() => import('@/components/admin/PartnerIDs'));
const AIInsights = lazy(() => import('@/components/admin/AIInsights'));
const SecurityDashboard = lazy(() => import('@/components/admin/SecurityDashboard'));
const DataLifecycle = lazy(() => import('@/components/admin/DataLifecycle'));
const RBAC = lazy(() => import('@/components/admin/RBAC'));
const Settings = lazy(() => import('@/components/admin/Settings'));
const CommHub = lazy(() => import('@/components/admin/CommHub'));
const KynetraTemplates = lazy(() => import('@/components/admin/KynetraTemplates'));
const PincodeManager = lazy(() => import('@/components/admin/PincodeManager'));

// New v11.1.0 modules
const EventLog = lazy(() => import('@/components/admin/EventLog'));
const CMSManager = lazy(() => import('@/components/admin/CMSManager'));
const SEOManager = lazy(() => import('@/components/admin/SEOManager'));
const RewardsEngine = lazy(() => import('@/components/admin/RewardsEngine'));
const PromoEngine = lazy(() => import('@/components/admin/PromoEngine'));
const Remarketing = lazy(() => import('@/components/admin/Remarketing'));

// New v11.3.0 modules
const FunnelBuilder = lazy(() => import('@/components/admin/FunnelBuilder'));
const AutomationRules = lazy(() => import('@/components/admin/AutomationRules'));
const StoreFeaturesAdmin = lazy(() => import('@/components/admin/StoreFeaturesAdmin'));

function Loader() {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:60 }}>
    <div style={{ width:28, height:28, border:'3px solid '+brand.border, borderTop:'3px solid '+brand.gold, borderRadius:'50%', animation:'spin .8s linear infinite' }} />
  </div>;
}

const MODULES = {
  dashboard: Dashboard, orders: OMS, stores: StoreLocator, delivery: DeliveryEngine,
  stock: StockWMS, pos: POS, storefeatures: StoreFeaturesAdmin, franchise: Franchise, whatsapp: WhatsAppViral,
  marketing: Marketing, crm: CRM, partners: PartnerIDs, commhub: CommHub, kynetra: KynetraTemplates, pincodes: PincodeManager,
  ai: AIInsights, security: SecurityDashboard, data: DataLifecycle,
  rbac: RBAC, settings: Settings,
  // v11.1.0
  eventlog: EventLog, cms: CMSManager, seo: SEOManager,
  rewards: RewardsEngine, promo: PromoEngine, remarketing: Remarketing,
  // v11.3.0
  funnels: FunnelBuilder, automation: AutomationRules,
};

function AppContent() {
  const { view, setView, user, adminTab, toast, setShowAdminLogin, storeTheme } = useApp();
  const Mod = MODULES[adminTab] || Dashboard;

  // Force TheValueStore theme on storefront (light/dark), admin theme in dashboard
  useEffect(() => {
    if (typeof document === 'undefined') return;
    try {
      let theme = 'store';
      if (view === 'admin') theme = 'admin';
      else if (storeTheme === 'dark') theme = 'store-dark';
      if (document.body) document.body.setAttribute('data-theme', theme);
    } catch (_) {}
  }, [view, storeTheme]);

  return (
    <div>
      <TopBar />

      {/* Toast */}
      {toast && (
        <div role="alert" style={{ position:'fixed', bottom:20, right:20, zIndex:9999, background:toast.type==='success'?brand.green:brand.red, color:'#fff', padding:'10px 20px', borderRadius:10, fontSize:13, fontWeight:600, boxShadow:'0 10px 40px rgba(0,0,0,.2)', animation:'fadeIn .3s ease' }}>
          {toast.msg}
        </div>
      )}

      {/* Auth Modals */}
      <UserAuthModal />
      <AdminLoginModal />

      <div className="page-content">
        {/* STOREFRONT VIEW */}
        {view === 'store' && (
          <>
            <Suspense fallback={<Loader />}><StoreView /></Suspense>
            <Suspense fallback={null}><KynetraAgent /></Suspense>
            <footer style={{
              borderTop: '1px solid ' + (storeTheme === 'dark' ? brand.storeDark.storeBorder : brand.storeBorder),
              padding: '32px 20px', textAlign: 'center',
              background: storeTheme === 'dark' ? brand.storeDark.storeBg2 : '#F8FAF8',
            }}>
              <div style={{ fontSize: 12, color: storeTheme === 'dark' ? brand.storeDark.storeDim : brand.storeDim, marginBottom: 8 }}>
                {brand.footer}
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                <a href={brand.links.hyperbridge} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: brand.green + '99', textDecoration: 'none' }}>HyperBridge Group</a>
                <span style={{ fontSize: 10, color: storeTheme === 'dark' ? brand.storeDark.storeDim : brand.storeDim }}>·</span>
                <a href={brand.links.theReelFactory} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: brand.green + '99', textDecoration: 'none' }}>TheReelFactory</a>
                <span style={{ fontSize: 10, color: storeTheme === 'dark' ? brand.storeDark.storeDim : brand.storeDim }}>·</span>
                <a href={brand.links.quantumos} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: brand.green + '99', textDecoration: 'none' }}>QuantumOS</a>
              </div>
              <div style={{ fontSize: 10, color: (storeTheme === 'dark' ? brand.storeDark.storeDim : brand.storeDim) + 'cc', marginBottom: 4 }}>Powered by TheReelFactory & HyperBridge</div>
              <button
                onClick={() => setShowAdminLogin(true)}
                style={{ fontSize: 10, color: (storeTheme === 'dark' ? brand.storeDark.storeDim : brand.storeDim) + '88', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
              >
                QuantumOS Admin →
              </button>
            </footer>
          </>
        )}

        {/* ADMIN VIEW */}
        {view === 'admin' && user && (
          <div style={{ display:'flex', minHeight:'calc(100vh - 54px)', background:brand.bg }}>
            <AdminSidebar />
            <div className="admin-content" style={{ flex:1, padding:24, overflowY:'auto', maxHeight:'calc(100vh - 54px)', background:brand.bg }}>
              <Suspense fallback={<Loader />}><Mod /></Suspense>
            </div>
          </div>
        )}

        {/* ADMIN NOT LOGGED IN */}
        {view === 'admin' && !user && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:16, background:brand.bg }}>
            <div style={{ fontSize:48 }}>🔐</div>
            <h2 style={{ fontFamily:brand.fontDisplay, fontSize:24, color:brand.heading }}>QuantumOS Admin Access Required</h2>
            <p style={{ fontSize:13, color:brand.dim }}>Sign in with your admin credentials</p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setShowAdminLogin(true)} style={{ padding:'12px 24px', borderRadius:12, background:brand.gold, color:'#000', fontSize:14, fontWeight:700, border:'none', cursor:'pointer' }}>
                🔐 QuantumOS Sign In
              </button>
              <button onClick={() => setView('store')} style={{ padding:'12px 24px', borderRadius:12, background:'rgba(255,255,255,.04)', color:brand.dim, fontSize:14, border:'1px solid '+brand.border, cursor:'pointer' }}>
                ← Back to Store
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AppErrorBoundary>
      <LocaleProvider>
        <AppProvider><AppContent /></AppProvider>
      </LocaleProvider>
    </AppErrorBoundary>
  );
}
