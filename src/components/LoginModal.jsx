import React from 'react';
import { LockKeyhole, LogIn, UserRound, X } from 'lucide-react';

export default function LoginModal({ open, onClose, onLogin, storeName, logoSrc }) {
  const [mode, setMode] = React.useState('admin');
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!open) {
      setError('');
      setLoading(false);
      return;
    }
    setUsername('');
    setPassword('');
  }, [mode, open]);

  if (!open) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      onLogin({
        ...data.user,
        role: data.user?.role || data.role,
        businessId: data.user?.role === 'SuperAdmin' ? null : data.businessId || data.user?.businessId || data.user?.id,
        loginType: data.user?.role === 'SuperAdmin' ? 'admin' : 'user'
      });
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
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
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
              Login karo aur apne role ke mutabiq dashboard open karo. Superadmin ko full admin panel milega, assigned user ko apna business dashboard milega.
            </p>

            <div className="mt-8 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <LockKeyhole className="text-teal-300" size={18} />
                  <strong className="text-sm">Admin Access</strong>
                </div>
                <p className="mt-2 text-sm text-slate-300">Products, orders, users, banners, revenue aur sab modules.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <UserRound className="text-teal-300" size={18} />
                  <strong className="text-sm">User Access</strong>
                </div>
                <p className="mt-2 text-sm text-slate-300">Assigned business account ka separate dashboard.</p>
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
                onClick={() => setMode('user')}
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                  mode === 'user' ? 'bg-teal-600 text-white' : 'text-slate-600'
                }`}
              >
                <UserRound size={16} />
                User Login
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-2xl font-black text-slate-950">{mode === 'admin' ? 'Admin access' : 'User access'}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {mode === 'admin'
                  ? 'Superadmin credentials enter karein.'
                  : 'Assigned business username aur password enter karein.'}
              </p>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  placeholder="Enter username"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
                  placeholder="Enter password"
                />
              </label>

              {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <LogIn size={16} />
                {loading ? 'Signing in...' : 'Login'}
              </button>

              <p className="text-center text-xs text-slate-500">Use the credentials assigned to your account.</p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
