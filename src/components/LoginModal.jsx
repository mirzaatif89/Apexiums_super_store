import React from 'react';
import { LockKeyhole, ShieldCheck, ShoppingBag, UserRound, X } from 'lucide-react';
import { customerAccounts } from '../data/storeData';

const adminDefaults = {
  username: 'superadmin',
  password: 'Admin@12345'
};

export default function LoginModal({ open, onClose, onLogin, storeName, logoSrc }) {
  const [mode, setMode] = React.useState('admin');
  const [adminForm, setAdminForm] = React.useState(adminDefaults);
  const [userForm, setUserForm] = React.useState({ email: 'customer@demo.com', password: '123456' });
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setError('');
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  async function submitAdmin(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Admin login failed');
      onLogin({ ...data.user, role: 'Admin', loginType: 'admin' });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function submitCustomer(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const account = customerAccounts.find(
        (item) => item.email.toLowerCase() === userForm.email.toLowerCase() && item.password === userForm.password
      );
      if (!account) throw new Error('Customer credentials invalid');
      onLogin({ name: account.name, email: account.email, role: account.role, loginType: 'customer' });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4">
      <button type="button" className="absolute inset-0 h-full w-full" aria-label="Close login overlay" onClick={onClose} />
      <section className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="bg-slate-950 p-6 text-white sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={logoSrc} alt={storeName} className="h-12 w-auto rounded-xl bg-white object-contain p-1" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-300">Secure Login</p>
                  <h2 className="mt-1 text-2xl font-black">{storeName}</h2>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
                aria-label="Close login"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Admin aur customer dono ke liye separate login flow. Admin panel me store manage karo aur customer portal me shopping continue karo.
            </p>

            <div className="mt-8 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-teal-300" size={18} />
                  <strong className="text-sm">Admin Portal</strong>
                </div>
                <p className="mt-2 text-sm text-slate-300">Store products, orders, and dashboard access.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="text-teal-300" size={18} />
                  <strong className="text-sm">Customer Portal</strong>
                </div>
                <p className="mt-2 text-sm text-slate-300">Browse products, save favorites, and order quickly.</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="inline-flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setMode('admin')}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                  mode === 'admin' ? 'bg-teal-600 text-white' : 'text-slate-600'
                }`}
              >
                <LockKeyhole size={16} />
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => setMode('customer')}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                  mode === 'customer' ? 'bg-teal-600 text-white' : 'text-slate-600'
                }`}
              >
                <UserRound size={16} />
                Customer Login
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-2xl font-black text-slate-950">
                {mode === 'admin' ? 'Admin access' : 'Customer access'}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {mode === 'admin'
                  ? 'Use your admin username and password.'
                  : 'Use your customer email and password.'}
              </p>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={mode === 'admin' ? submitAdmin : submitCustomer}>
              {mode === 'admin' ? (
                <>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Username</span>
                    <input
                      value={adminForm.username}
                      onChange={(event) => setAdminForm((current) => ({ ...current, username: event.target.value }))}
                      className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Password</span>
                    <input
                      type="password"
                      value={adminForm.password}
                      onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))}
                      className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Email</span>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))}
                      className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Password</span>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                      className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                    />
                  </label>
                </>
              )}

              {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Login'}
              </button>

              {mode === 'customer' ? (
                <p className="text-xs leading-6 text-slate-500">
                  Demo customer: <span className="font-semibold">customer@demo.com</span> / <span className="font-semibold">123456</span>
                </p>
              ) : (
                <p className="text-xs leading-6 text-slate-500">
                  Demo admin: <span className="font-semibold">superadmin</span> / <span className="font-semibold">Admin@12345</span>
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
