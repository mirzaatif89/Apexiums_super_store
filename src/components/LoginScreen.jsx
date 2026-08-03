import React from 'react';
import { LockKeyhole, LogIn, UserRound } from 'lucide-react';

export default function LoginScreen({ logoSrc, storeName, onLogin }) {
  const [mode, setMode] = React.useState('admin');
  const [username, setUsername] = React.useState('superadmin');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

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
        loginType: mode
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (mode === 'admin') {
      setUsername('superadmin');
    } else {
      setUsername('manager');
    }
    setPassword('');
  }, [mode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-4 py-6 text-white">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl overflow-hidden rounded-[2rem] bg-white text-slate-900 shadow-2xl shadow-slate-950/25 lg:grid-cols-[1fr_0.95fr]">
        <section className="flex flex-col justify-between gap-8 bg-slate-950 p-6 sm:p-10 text-white">
          <div className="flex items-center gap-4">
            <img src={logoSrc} alt={storeName} className="h-14 w-auto rounded-2xl bg-white object-contain p-1" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-teal-300">Secure Access</p>
              <h1 className="mt-1 text-3xl font-black sm:text-4xl">{storeName}</h1>
            </div>
          </div>

          <div className="max-w-xl space-y-4">
            <p className="text-3xl font-black leading-tight sm:text-5xl">
              Login k baad admin dashboard ya user dashboard automatically open hoga.
            </p>
            <p className="max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Admin apna panel dekhega jahan products, orders, users aur revenue nazar aayega.
              Assigned user apna separate dashboard dekhega jahan sirf uski details aur records honge.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Admin Panel', 'Products, orders, users, stock'],
              ['User Panel', 'Own business details and records'],
              ['Secure Login', 'Backend auth with roles']
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <h2 className="font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
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
              <h2 className="text-3xl font-black text-slate-950">
                {mode === 'admin' ? 'Admin access' : 'User access'}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {mode === 'admin'
                  ? 'Superadmin credentials enter karein.'
                  : 'Assigned user/business credentials enter karein.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
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
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
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

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-950">Tip</p>
                <p className="mt-1 leading-6">
                  Admin user backend me `superadmin` se login karein.
                  Business user ko admin dashboard se create/assign kiya ja sakta hai.
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
