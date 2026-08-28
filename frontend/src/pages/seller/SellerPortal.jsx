import React from 'react';
import { BarChart3, Boxes, CircleDollarSign, ClipboardList, LogOut, PackageCheck, RotateCcw, ShoppingBag } from 'lucide-react';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-PK')}`;

export default function SellerPortal({ session, onLogout }) {
  const [tab, setTab] = React.useState('dashboard');
  const [data, setData] = React.useState({ profile: session || {}, summary: {}, orders: [], returns: [], stock: [] });
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch('/api/seller/me/dashboard', { credentials: 'include' });
        if (!response.ok) throw new Error('Could not load your seller workspace.');
        const next = await response.json();
        if (mounted) { setData(next); setError(''); }
      } catch (loadError) { if (mounted) setError(loadError.message); }
    };
    load();
    const interval = window.setInterval(load, 30000);
    return () => { mounted = false; window.clearInterval(interval); };
  }, []);

  const views = {
    dashboard: <Dashboard summary={data.summary} profile={data.profile} />,
    orders: <Table title="Orders" columns={['Order', 'Customer', 'Status', 'Amount']} rows={data.orders.map((x) => [x.id, x.customer_name || x.customer_email || '-', x.order_status || x.status || 'Pending', money(x.total_amount)])} />,
    returns: <Table title="Returns" columns={['Return', 'Order', 'Reason', 'Status']} rows={data.returns.map((x) => [x.id, x.order_id || '-', x.reason || x.return_reason || '-', x.status || 'Pending'])} />,
    stocks: <Table title="Stock" columns={['Product', 'SKU', 'Quantity', 'Status']} rows={data.stock.map((x) => [x.product_name || '-', x.sku || '-', x.quantity || 0, x.stock_status || '-'])} />,
    revenue: <Revenue orders={data.orders} total={data.summary.revenue} />
  };
  return <div className="min-h-screen bg-slate-100 text-slate-900"><header className="border-b border-white/10 bg-slate-950 text-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E8262A]"><ShoppingBag size={20}/></span><div><p className="font-black">Elistin Seller Portal</p><p className="text-xs text-slate-400">{data.profile.business_name || session?.business_name || 'My Store'}</p></div></div><button onClick={onLogout} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/15"><LogOut size={15}/>Logout</button></div></header><div className="mx-auto flex max-w-7xl gap-5 p-4 md:p-6"><aside className="hidden w-56 shrink-0 rounded-2xl bg-white p-3 shadow-sm md:block">{[['dashboard','Dashboard',BarChart3],['orders','Orders',ClipboardList],['returns','Returns',RotateCcw],['stocks','Stocks',Boxes],['revenue','Revenue',CircleDollarSign]].map(([id,label,Icon]) => <button key={id} onClick={() => setTab(id)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${tab === id ? 'bg-red-50 text-[#E8262A]' : 'text-slate-600 hover:bg-slate-50'}`}><Icon size={18}/>{label}</button>)}</aside><main className="min-w-0 flex-1"><nav className="mb-4 flex gap-2 overflow-x-auto md:hidden">{[['dashboard','Dashboard'],['orders','Orders'],['returns','Returns'],['stocks','Stocks'],['revenue','Revenue']].map(([id,label]) => <button key={id} onClick={() => setTab(id)} className={`shrink-0 rounded-xl px-3 py-2 text-xs font-bold ${tab === id ? 'bg-[#E8262A] text-white' : 'bg-white text-slate-600'}`}>{label}</button>)}</nav>{error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div> : views[tab]}</main></div></div>;
}

function Dashboard({ summary, profile }) { return <><div className="mb-6"><p className="text-sm font-bold text-[#E8262A]">Welcome back, {profile.owner_name || profile.username || 'Seller'}</p><h1 className="mt-1 text-2xl font-black">Business overview</h1></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={ClipboardList} label="Orders" value={summary.orders || 0}/><Metric icon={RotateCcw} label="Returns" value={summary.returns || 0}/><Metric icon={Boxes} label="Stock units" value={summary.stockUnits || 0}/><Metric icon={CircleDollarSign} label="Revenue" value={money(summary.revenue)}/></div><section className="mt-6 rounded-2xl bg-white p-5 shadow-sm"><h2 className="font-black">Your seller account</h2><div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><p><span className="text-slate-400">Store</span><br/><b>{profile.business_name || '-'}</b></p><p><span className="text-slate-400">Email</span><br/><b>{profile.email || '-'}</b></p><p><span className="text-slate-400">Status</span><br/><b className="text-emerald-600">{profile.status || 'Active'}</b></p></div></section></> }
function Metric({ icon: Icon, label, value }) { return <article className="rounded-2xl bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-[#E8262A]"><Icon size={20}/></span><p className="mt-4 text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></article>; }
function Table({ title, columns, rows }) { return <section className="overflow-hidden rounded-2xl bg-white shadow-sm"><h1 className="p-5 text-xl font-black">{title}</h1><div className="overflow-x-auto"><table className="w-full min-w-[550px] text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{columns.map((x) => <th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row,i) => <tr className="border-t" key={i}>{row.map((x,j) => <td className="p-3" key={j}>{x}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-8 text-center text-slate-400">No records yet.</td></tr>}</tbody></table></div></section>; }
function Revenue({ orders, total }) { return <><div className="rounded-2xl bg-gradient-to-br from-[#E8262A] to-rose-700 p-6 text-white"><p className="text-sm font-semibold text-white/80">Total revenue</p><p className="mt-2 text-4xl font-black">{money(total)}</p></div><div className="mt-6"><Table title="Revenue by order" columns={['Order', 'Date', 'Status', 'Amount']} rows={orders.map((x) => [x.id, x.created_at ? new Date(x.created_at).toLocaleDateString('en-PK') : '-', x.order_status || x.status || 'Pending', money(x.total_amount)])}/></div></>; }
