import React from 'react';
import {
  BadgeDollarSign,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  LogOut,
  Plus,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  UserCog
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

function CreateUserModal({ open, onClose, onSubmit, loading }) {
  const [form, setForm] = React.useState({
    business_name: '',
    username: '',
    password: '',
    owner_name: '',
    email: '',
    phone: '',
    role: 'BusinessAdmin'
  });

  React.useEffect(() => {
    if (!open) {
      setForm({
        business_name: '',
        username: '',
        password: '',
        owner_name: '',
        email: '',
        phone: '',
        role: 'BusinessAdmin'
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4">
      <button type="button" aria-label="Close modal" className="absolute inset-0" onClick={onClose} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
        className="relative z-10 w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Assign User</p>
            <h3 className="mt-1 text-2xl font-black text-slate-950">Create business account</h3>
          </div>
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {[
            ['business_name', 'Business Name'],
            ['username', 'Username'],
            ['password', 'Password'],
            ['owner_name', 'Owner Name'],
            ['email', 'Email'],
            ['phone', 'Phone']
          ].map(([key, label]) => (
            <label key={key} className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">{label}</span>
              <input
                value={form[key]}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'}
                className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
              />
            </label>
          ))}

          <label className="grid gap-2 sm:col-span-2">
            <span className="text-sm font-semibold text-slate-700">Role</span>
            <select
              value={form.role}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}
              className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              <option>BusinessAdmin</option>
              <option>Manager</option>
              <option>Support</option>
            </select>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Plus size={16} />
            {loading ? 'Saving...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminDashboard({ session, storeName, logoSrc, onLogout }) {
  const [summary, setSummary] = React.useState(null);
  const [businesses, setBusinesses] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [notifications, setNotifications] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const businessId = session.role === 'SuperAdmin' ? null : session.businessId;

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

  async function createUser(form) {
    setSaving(true);
    setError('');
    try {
      const response = await apiFetch('/api/business-accounts', session, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create account');
      setCreateOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const stats = [
    { label: 'Products', value: summary?.products?.total ?? '0', icon: ShoppingBag, hint: 'Live catalog items' },
    { label: 'Revenue', value: money(summary?.orders?.revenue ?? 0), icon: BadgeDollarSign, hint: 'From active orders' },
    { label: 'Businesses', value: summary?.businesses?.total ?? businesses.length ?? 0, icon: Building2, hint: 'Assigned accounts' },
    { label: 'Unread', value: summary?.notifications?.unread ?? 0, icon: Bell, hint: 'Pending alerts' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt={storeName} className="h-12 w-auto object-contain" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Admin Dashboard</p>
              <h1 className="text-lg font-black text-slate-950">Welcome back, {session.name || 'Admin'}</h1>
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

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[250px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-950 p-4 text-white">
            <UserCog size={20} className="text-teal-300" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Panel</p>
              <h2 className="font-black">Store Control</h2>
            </div>
          </div>
          <nav className="mt-4 grid gap-2">
            {['Overview', 'Products', 'Orders', 'Users', 'Notifications'].map((item) => (
              <button
                key={item}
                type="button"
                className="flex min-h-11 items-center rounded-2xl px-4 text-left text-sm font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
              >
                {item}
              </button>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white"
          >
            <Plus size={16} />
            Assign User
          </button>
        </aside>

        <section className="grid gap-6">
          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Users</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Assigned accounts</h2>
                </div>
                <button onClick={() => setCreateOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-50 px-4 text-sm font-semibold text-teal-700">
                  <Plus size={16} />
                  Create
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                <div className="max-h-[24rem] overflow-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
                      <tr>
                        {['Business', 'Username', 'Role', 'Status'].map((column) => (
                          <th key={column} className="px-4 py-3">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(loading ? Array.from({ length: 4 }) : businesses).map((row, index) => (
                        <tr key={row?.id || index} className="border-t border-slate-200">
                          {loading ? (
                            <td colSpan={4} className="px-4 py-4">
                              <div className="h-4 rounded-full bg-slate-100" />
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-3 font-medium text-slate-900">{row.business_name}</td>
                              <td className="px-4 py-3 text-slate-600">{row.username}</td>
                              <td className="px-4 py-3 text-slate-600">{row.role}</td>
                              <td className="px-4 py-3">
                                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{row.status}</span>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Low stock</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Alerts</h2>
                </div>
                <Boxes className="text-teal-600" />
              </div>

              <div className="mt-4 grid gap-3">
                {(summary?.lowStockItems || []).map((item) => (
                  <div key={item.sku || item.product_name} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-950">{item.product_name}</h3>
                        <p className="text-sm text-slate-500">{item.sku || 'No SKU'}</p>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                        Qty {item.quantity}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Warehouse: {item.warehouse || 'Main'}</p>
                  </div>
                ))}
                {!loading && !(summary?.lowStockItems || []).length ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">No low stock items.</p>
                ) : null}
              </div>
            </article>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Products</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Recent products</h2>
                </div>
                <ShoppingBag className="text-teal-600" />
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
                    {!loading ? <span className="font-bold text-slate-900">{money(product.actual_price || product.discounted_price)}</span> : null}
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Orders</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Latest orders</h2>
                </div>
                <ClipboardList className="text-teal-600" />
              </div>
              <div className="mt-4 grid gap-3">
                {(loading ? Array.from({ length: 4 }) : orders).map((order, index) => (
                  <div key={order?.id || index} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                    <div>
                      <h3 className="font-semibold text-slate-950">{loading ? 'Loading order...' : order.customer_name}</h3>
                      <p className="text-sm text-slate-500">{loading ? '' : `#ORD-${order.id} • ${order.order_status}`}</p>
                    </div>
                    {!loading ? <strong className="text-slate-950">{money(order.total_amount)}</strong> : null}
                  </div>
                ))}
              </div>
            </article>
          </div>

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

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={createUser} loading={saving} />
    </div>
  );
}
