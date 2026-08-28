import React from 'react';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import StorefrontHome from './pages/storefront/StorefrontHome.jsx';
import UserDashboard from './pages/storefront/UserDashboard.jsx';
import { storeLogoSrc, storeName } from './data/storeData';
import { isAdminRole, isSuperAdminRole, roleKey } from './utils/roles';
import InvestorPortal from './pages/investor/InvestorPortal.jsx';
import SellerPortal from './pages/seller/SellerPortal.jsx';
import PrivacyPolicyModal from './components/PrivacyPolicyModal.jsx';

function AppContent() {
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    // Customer and seller sessions use secure HTTP-only cookies backed by the
    // server database. Only the remaining legacy business portals are retained
    // client-side while they use their existing token flow.
    try {
      const stored = JSON.parse(localStorage.getItem('elistin-portal-session') || 'null');
      if (roleKey(stored?.user?.role) === 'seller') localStorage.removeItem('elistin-portal-session');
      if (stored?.user && roleKey(stored.user.role) !== 'seller' && stored?.savedAt && Date.now() - stored.savedAt < 1000 * 60 * 60 * 24 * 7) setSession(stored.user);
    } catch {}
    fetch('/api/auth/session', { credentials: 'include' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.user) setSession(data.user); })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    const visitorKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    fetch('/api/analytics/visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorKey }) }).catch(() => {});
  }, []);

  function handleLogin(user) {
    const nextSession = {
      ...user,
      businessId:
        isSuperAdminRole(user.role)
          ? null
          : user.businessId || user.id || null,
    };

    setSession(nextSession);
    if (!['user', 'seller'].includes(roleKey(nextSession.role))) {
      localStorage.setItem('elistin-portal-session', JSON.stringify({ user: nextSession, savedAt: Date.now() }));
    } else {
      localStorage.removeItem('elistin-portal-session');
    }
    if (isAdminRole(user.role) || user.loginType === 'admin') {
      window.history.pushState({ page: 'dashboard' }, '', '/dashboard');
    }
  }

  function handleLogout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    localStorage.removeItem('elistin-portal-session');
    setSession(null);
    window.history.pushState({}, '', '/');
  }

  React.useEffect(() => {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    document.title = path === '/' || path === '/index.html'
      ? `${storeName} | Online Marketplace`
      : `${isAdminRole(session?.role) ? 'Admin' : 'User'} Dashboard | ${storeName}`;

    return undefined;
  }, [session]);

  // No logged-in user → show the existing storefront/login flow
  if (!session) {
    return (
      <StorefrontHome
        onLogin={handleLogin}
        storeName={storeName}
        logoSrc={storeLogoSrc}
      />
    );
  }

  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  const isAdminPage = currentPath !== '/' && currentPath !== '/index.html';

  if (roleKey(session.role) === 'investor') {
    return <InvestorPortal session={session} onLogout={handleLogout} />;
  }

  if (roleKey(session.role) === 'seller') {
    return <SellerPortal session={session} onLogout={handleLogout} />;
  }

  // Admin panel is available only on an explicit admin URL. Root is always the storefront.
  if (isAdminPage && (isAdminRole(session.role) || session.loginType === 'admin')) {
    return (
      <AdminDashboard
        session={session}
        storeName={storeName}
        logoSrc={storeLogoSrc}
        onLogout={handleLogout}
      />
    );
  }

  // Normal customer/user -> show storefront with active session
  return (
    <StorefrontHome
      session={session}
      onLogin={handleLogin}
      onLogout={handleLogout}
      storeName={storeName}
      logoSrc={storeLogoSrc}
    />
  );
}

export default function App() {
  return <><AppContent/><PrivacyPolicyModal/></>;
}
