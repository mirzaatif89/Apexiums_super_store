import React from 'react';
import {
  Bell,
  ClipboardList,
  LogOut,
  Package,
  ShieldCheck,
  Store,
  UserCircle2
} from 'lucide-react';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-PK')}`;

function apiFetch(path, session, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.role ? { 'x-user-role': session.role } : {}),
    ...(session?.businessId ? { 'x-business-id': String(session.businessId) } : {})
  };
  return fetch(path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
}

function StatCard({ label, value, icon: Icon, hint }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">{label}</p>
          <strong className="mt-2 block text-2xl font-black text-slate-950">{value}</strong>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Icon size={20} />
        </span>
      </div>
      {hint ? <p className="mt-4 text-sm text-slate-500">{hint}</p> : null}
    </article>
  );
}

export default function UserDashboard({ session, storeName, logoSrc, onLogout }) {
  const [summary, setSummary] = React.useState(null);
  const [businesses, setBusinesses] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, businessRes, productRes, orderRes, notificationRes] = await Promise.all([
        apiFetch('/api/dashboard/summary', session),
        apiFetch('/api/business-accounts', session),
        apiFetch('/api/products?limit=6', session),
        apiFetch('/api/orders?limit=6', session),
        apiFetch('/api/notifications?limit=5', session)
      ]);

      const [summaryData, businessData, productData, orderData, notificationData] = await Promise.all([
        summaryRes.json(),
        businessRes.json(),
        productRes.json(),
        orderRes.json(),
        notificationRes.json()
      ]);

      setSummary(summaryData);
      setBusinesses(businessData.rows || []);
      setProducts(productData.rows || []);
      setOrders(orderData.rows || []);
      setNotifications(notificationData.rows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [session]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const business = businesses[0] || {};
  const stats = [
    { label: 'Products', value: summary?.products?.total ?? 0, icon: Package, hint: 'Your assigned catalog' },
    { label: 'Orders', value: summary?.orders?.total ?? 0, icon: ClipboardList, hint: 'Scoped order count' },
    { label: 'Unread', value: summary?.notifications?.unread ?? 0, icon: Bell, hint: 'Pending alerts' },
    { label: 'Status', value: business.status || session.role || 'Active', icon: ShieldCheck, hint: 'Account access' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt={storeName} className="h-12 w-auto object-contain" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">User Dashboard</p>
              <h1 className="text-lg font-black text-slate-950">
                Welcome back, {business.business_name || session.name || 'User'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 sm:inline-flex">
              {session.role}
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="grid gap-6">
          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

          <article className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
            <div className="grid gap-6 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/20">
                    <Store className="text-teal-300" size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Assigned Portal</p>
                    <h2 className="text-2xl font-black">{business.business_name || 'My Business'}</h2>
                  </div>
                </div>
                <UserCircle2 className="text-slate-400" size={28} />
              </div>

              <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Ye aapka dedicated dashboard hai jahan aap apni business details, orders, products aur notifications dekh sakte hain.
              </p>
            </div>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Business details</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Profile information</h2>
              </div>
              <ShieldCheck className="text-teal-600" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                ['Business Name', business.business_name],
                ['Username', business.username],
                ['Owner', business.owner_name],
                ['Email', business.email],
                ['Phone', business.phone],
                ['Role', business.role || session.role]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                  <p className="mt-2 font-semibold text-slate-950">{value || '-'}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Recent orders</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">My orders</h2>
              </div>
              <ClipboardList className="text-teal-600" />
            </div>
            <div className="mt-4 grid gap-3">
              {(loading ? Array.from({ length: 4 }) : orders).map((order, index) => (
                <div key={order?.id || index} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-slate-950">{loading ? 'Loading order...' : order.customer_name}</h3>
                      <p className="text-sm text-slate-500">{loading ? '' : `#ORD-${order.id} • ${order.order_status}`}</p>
                    </div>
                    {!loading ? <strong className="text-slate-950">{money(order.total_amount)}</strong> : null}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Products</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Assigned catalog</h2>
              </div>
              <Package className="text-teal-600" />
            </div>
            <div className="mt-4 grid gap-3">
              {(loading ? Array.from({ length: 4 }) : products).map((product, index) => (
                <div key={product?.id || index} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                  {loading ? (
                    <div className="h-14 w-14 rounded-2xl bg-slate-100" />
                  ) : (
                    <img src={product.image_url} alt={product.name} className="h-14 w-14 rounded-2xl object-cover" />
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-950">{loading ? 'Loading product...' : product.name}</h3>
                    <p className="text-sm text-slate-500">{loading ? '' : product.category}</p>
                  </div>
                  {!loading ? <strong className="text-slate-950">{money(product.actual_price || product.discounted_price)}</strong> : null}
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Notifications</p>
                <h2 className="mt-1 text-xl font-black text-slate-950">Recent alerts</h2>
              </div>
              <Bell className="text-teal-600" />
            </div>
            <div className="mt-4 grid gap-3">
              {(loading ? Array.from({ length: 3 }) : notifications).map((note, index) => (
                <div key={note?.id || index} className="rounded-2xl bg-slate-50 p-4">
                  <h3 className="font-semibold text-slate-950">{loading ? 'Loading notification...' : note.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{loading ? '' : note.message}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
