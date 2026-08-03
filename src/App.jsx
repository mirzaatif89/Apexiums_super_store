import React from 'react';
import AdminDashboard from './components/AdminDashboard';
import StorefrontHome from './components/StorefrontHome';
import UserDashboard from './components/UserDashboard';
import { storeLogoSrc, storeName } from './data/storeData';

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
      businessId: user.role === 'SuperAdmin' ? null : user.businessId || user.id || null
    };
    saveSession(nextSession);
    setSession(nextSession);
  }

  function handleLogout() {
    saveSession(null);
    setSession(null);
  }

  React.useEffect(() => {
    document.title = session
      ? `${session.role === 'SuperAdmin' ? 'Admin' : 'User'} Dashboard | ${storeName}`
      : `${storeName} | Online Marketplace`;
    return undefined;
  }, [session]);

  if (!session) {
    return <StorefrontHome onLogin={handleLogin} />;
  }

  if (session.role === 'SuperAdmin') {
    return <AdminDashboard session={session} storeName={storeName} logoSrc={storeLogoSrc} onLogout={handleLogout} />;
  }

  return <UserDashboard session={session} storeName={storeName} logoSrc={storeLogoSrc} onLogout={handleLogout} />;
}
