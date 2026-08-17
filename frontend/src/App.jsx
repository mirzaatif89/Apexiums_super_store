import React from 'react';
import AdminDashboard from './pages/admin/AdminDashboard';
import StorefrontHome from './pages/storefront/StorefrontHome';
import UserDashboard from './pages/storefront/UserDashboard';
import { storeLogoSrc, storeName } from './data/storeData';
import { isAdminRole, isSuperAdminRole } from './utils/roles';

const AUTH_KEY = 'apexiums-auth-session';

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(AUTH_KEY);
    return;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
}

export default function App() {
  const [session, setSession] = React.useState(() => readSession());

  function handleLogin(user) {
    const nextSession = {
      ...user,
      businessId:
        isSuperAdminRole(user.role)
          ? null
          : user.businessId || user.id || null,
    };

    saveSession(nextSession);
    setSession(nextSession);
    if (isAdminRole(user.role) || user.loginType === 'admin') {
      window.history.pushState({ page: 'dashboard' }, '', '/dashboard');
    }
  }

  function handleLogout() {
    saveSession(null);
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
