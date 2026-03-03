'use client';
import { lazy, Suspense } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import TopBar from '@/components/layout/TopBar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import UserAuthModal from '@/components/auth/UserAuthModal';
import AdminLoginModal from '@/components/auth/AdminLoginModal';

const StoreView = lazy(() => import('@/components/store/StoreView'));
const ChatbotWidget = lazy(() => import('@/components/store/ChatbotWidget'));
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

// v1.2.0 — Kynetra AI + User Management
const KynetraChat = lazy(() => import('@/components/admin/KynetraChat'));
const KynetraInsights = lazy(() => import('@/components/admin/KynetraInsights'));
const UserManager = lazy(() => import('@/components/admin/UserManager'));

function Loader() {
  return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:60 }}>
    <div style={{ width:28, height:28, border:'3px solid '+brand.border, borderTop:'3px solid '+brand.gold, borderRadius:'50%', animation:'spin .8s linear infinite' }} />
  </div>;
}

const MODULES = {
  dashboard: Dashboard, orders: OMS, stores: StoreLocator, delivery: DeliveryEngine,
  stock: StockWMS, pos: POS, franchise: Franchise, whatsapp: WhatsAppViral,
  marketing: Marketing, crm: CRM, partners: PartnerIDs, commhub: CommHub, pincodes: PincodeManager,
  ai: AIInsights, security: SecurityDashboard, data: DataLifecycle,
  rbac: RBAC, settings: Settings,
  // v11.1.0
  eventlog: EventLog, cms: CMSManager, seo: SEOManager,
  rewards: RewardsEngine, promo: PromoEngine, remarketing: Remarketing,
  // v11.3.0
  funnels: FunnelBuilder, automation: AutomationRules,
  // v1.2.0
  users: UserManager,
};

function AppContent() {
  const { view, setView, user, adminTab, toast, setShowAdminLogin } = useApp();
  const Mod = MODULES[adminTab] || Dashboard;

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
            <Suspense fallback={null}><ChatbotWidget /></Suspense>
            <footer style={{ borderTop:'1px solid '+brand.storeBorder, padding:'32px 20px', textAlign:'center', background:'#F8FAF8' }}>
              <div style={{ fontSize:12, color:brand.storeDim, marginBottom:8 }}>
                {brand.footer}
              </div>
              <button
                onClick={() => setShowAdminLogin(true)}
                style={{ fontSize:10, color:brand.storeDim+'88', background:'none', border:'none', cursor:'pointer', padding:'4px 8px' }}
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
              <div style={{ marginBottom: 16 }}>
                <Suspense fallback={null}><KynetraInsights /></Suspense>
              </div>
              <Suspense fallback={<Loader />}><Mod /></Suspense>
            </div>
            <Suspense fallback={null}><KynetraChat /></Suspense>
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
  return <AppProvider><AppContent /></AppProvider>;
}
