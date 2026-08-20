import React from 'react';
import { BarChart3, Boxes, LogOut, TrendingDown, TrendingUp, Wallet } from 'lucide-react';

export default function InvestorPortal({ session, onLogout }) {
  const [investor, setInvestor] = React.useState(session || {});
  const [stock, setStock] = React.useState([]);
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);

  React.useEffect(() => {
    const headers = { 'x-user-role': 'Investor', 'x-investor-id': String(session?.id || '') };
    Promise.all([
      fetch(`/api/investors/${session?.id}`, { headers }).then((r) => r.ok ? r.json() : null),
      fetch('/api/stock?limit=500', { headers }).then((r) => r.ok ? r.json() : { rows: [] }),
      fetch('/api/orders?limit=500', { headers }).then((r) => r.ok ? r.json() : { rows: [] })
      ,fetch(`/api/investors/${session?.id}/products`, { headers }).then((r) => r.ok ? r.json() : { rows: [] })
    ]).then(([profile, stockData, orderData, productData]) => {
      if (profile) setInvestor(profile);
      setStock(stockData?.rows || []);
      setOrders(orderData?.rows || []);
      setProducts(productData?.rows || []);
    }).catch(() => {});
  }, [session?.id]);

  const investment = Number(investor.investment_amount || investor.investmentAmount || 0);
  const sales = orders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
  const stockValue = stock.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const profit = sales - investment;

  return <div className="min-h-screen bg-slate-100 text-slate-900">
    <header className="flex items-center justify-between bg-slate-950 px-6 py-4 text-white">
      <div><p className="text-lg font-black">Investor Portal</p><p className="text-xs text-slate-400">Welcome, {investor.name || session?.username}</p></div>
      <button onClick={onLogout} className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold"><LogOut size={15}/> Logout</button>
    </header>
    <main className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card icon={Wallet} title="My Investment" value={`Rs ${investment.toLocaleString('en-PK')}`} />
        <Card icon={Boxes} title="My Stock Units" value={stockValue.toLocaleString()} />
        <Card icon={BarChart3} title="Sales" value={`Rs ${sales.toLocaleString('en-PK')}`} />
        <Card icon={profit >= 0 ? TrendingUp : TrendingDown} title="Profit / Loss" value={`Rs ${profit.toLocaleString('en-PK')}`} />
      </div>
      <section className="rounded-2xl bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-black">My Investment Details</h2><div className="grid gap-3 text-sm md:grid-cols-3"><p><span className="text-slate-500">Username:</span> {investor.username || '-'}</p><p><span className="text-slate-500">Email:</span> {investor.email || '-'}</p><p><span className="text-slate-500">Status:</span> {investor.status || '-'}</p><p><span className="text-slate-500">Investment date:</span> {investor.investment_date || '-'}</p><p><span className="text-slate-500">Return rate:</span> {investor.return_rate || 0}%</p><p><span className="text-slate-500">Equity share:</span> {investor.equity_share || '0%'}</p></div></section>
      <div className="grid gap-6 lg:grid-cols-2"><DataTable title="My Stock" columns={['Product','Quantity','Warehouse']} rows={stock.map((x) => [x.product_name || '-', x.quantity || 0, x.warehouse || '-'])}/><DataTable title="My Sales" columns={['Order','Customer','Amount']} rows={orders.map((x) => [x.id, x.customer_name || '-', `Rs ${Number(x.total_amount || 0).toLocaleString('en-PK')}`])}/></div>
      <DataTable title="My Assigned Products" columns={['Product','Category','Price (PKR)','Stock','Status']} rows={products.map((x) => [x.name || '-', x.category || '-', `Rs ${Number(x.discounted_price || x.base_price || 0).toLocaleString('en-PK')}`, x.stock_qty || 0, x.status || '-'])}/>
    </main>
  </div>;
}

function Card({ icon: Icon, title, value }) { return <div className="rounded-2xl bg-white p-5 shadow-sm"><Icon className="mb-3 text-purple-600" size={22}/><p className="text-xs font-bold text-slate-500">{title}</p><p className="mt-1 text-2xl font-black">{value}</p></div>; }
function DataTable({ title, columns, rows }) { return <section className="overflow-hidden rounded-2xl bg-white shadow-sm"><h2 className="p-5 text-lg font-black">{title}</h2><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{columns.map((x) => <th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row, i) => <tr className="border-t" key={i}>{row.map((x, j) => <td className="p-3" key={j}>{x}</td>)}</tr>) : <tr><td className="p-5 text-slate-500" colSpan={columns.length}>No records assigned yet.</td></tr>}</tbody></table></section>; }
