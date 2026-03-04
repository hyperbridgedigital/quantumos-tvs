'use client';
import { useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { brand } from '@/lib/brand';
import TopBar from '@/components/layout/TopBar';
import StoreView from '@/components/store/StoreView';
import AdminView from '@/components/admin/AdminView';
import UserAuthModal from '@/components/auth/UserAuthModal';
import AdminLoginModal from '@/components/auth/AdminLoginModal';

function AppContent() {
  const { view, storeTheme, toast } = useApp();

  useEffect(() => {
    if (typeof document === 'undefined') return;
    let theme = 'store';
    if (view === 'admin') theme = 'admin';
    else if (storeTheme === 'dark') theme = 'store-dark';
    document.body.setAttribute('data-theme', theme);
  }, [view, storeTheme]);

  return (
    <>
      <TopBar />
      {toast && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            padding: '12px 20px',
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            background: toast.type === 'success' ? brand.green : brand.red,
            color: '#fff',
            boxShadow: '0 10px 40px rgba(0,0,0,.2)',
          }}
        >
          {toast.msg}
        </div>
      )}
      <UserAuthModal />
      <AdminLoginModal />
      <main className="page-content">
        {view === 'store' && <StoreView />}
        {view === 'admin' && <AdminView />}
      </main>
    </>
  );
}

export default function HomePage() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
