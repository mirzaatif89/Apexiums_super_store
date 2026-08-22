import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import StatCard from '../common/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { CalendarDays, DollarSign, TrendingUp, Receipt, Plus, X } from 'lucide-react';

export const RevenueView = () => {
  const { finance, orders, products, addTransaction } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    type: 'Revenue',
    amount: '',
    category: 'Marketplace Commission',
    date: new Date().toISOString().slice(0, 10),
    status: 'Completed'
  });

  const normalizeDate = (dateValue) => {
    if (!dateValue) return '';
    const raw = String(dateValue);
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString().slice(0, 10);
  };
  const matchesPeriod = (dateValue) => {
    if (filterType === 'all' || !filterValue) return true;
    const date = normalizeDate(dateValue);
    if (filterType === 'date') return date === filterValue;
    if (filterType === 'month') return date.startsWith(filterValue);
    if (filterType === 'year') return date.startsWith(filterValue);
    return true;
  };
  const filteredTransactions = finance.transactions.filter((transaction) => matchesPeriod(transaction.date));
  const revenues = filteredTransactions.filter((transaction) => transaction.type === 'Revenue');
  const completedOrderRevenue = orders
    .filter((order) => ['Shipped', 'Delivered', 'Received'].includes(order.orderStatus || order.order_status))
    .filter((order) => matchesPeriod(order.orderDate || order.created_at || order.date))
    .reduce((sum, order) => sum + Number(order.totalAmount || order.total_amount || 0), 0);
  const totalRevenue = completedOrderRevenue + revenues.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const totalExpenses = filteredTransactions.filter((transaction) => transaction.type === 'Expense').reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const netProfit = totalRevenue - totalExpenses;

  const monthlyProducts = {};
  orders
    .filter((order) => !['Cancelled', 'Returned'].includes(order.orderStatus || order.order_status))
    .filter((order) => matchesPeriod(order.orderDate || order.created_at || order.date))
    .forEach((order) => {
      const month = normalizeDate(order.orderDate || order.created_at || order.date).slice(0, 7);
      if (!month) return;
      if (!monthlyProducts[month]) monthlyProducts[month] = {};
      (order.products || []).forEach((item) => {
        const key = String(item.id || item.name || 'Product');
        if (!monthlyProducts[month][key]) monthlyProducts[month][key] = { product: item.name || 'Product', quantity: 0, sales: 0 };
        monthlyProducts[month][key].quantity += Number(item.qty || 1);
        monthlyProducts[month][key].sales += Number(item.qty || 1) * Number(item.price || 0);
      });
    });
  const topSellingData = Object.entries(monthlyProducts).map(([month, productMap]) => {
    const topProduct = Object.values(productMap).sort((a, b) => b.quantity - a.quantity || b.sales - a.sales)[0];
    return { month, ...topProduct };
  }).sort((a, b) => a.month.localeCompare(b.month));

  const productById = new Map(products.map((product) => [String(product.id), product]));
  const categoryMonths = {};
  orders
    .filter((order) => ['Shipped', 'Delivered', 'Received'].includes(order.orderStatus || order.order_status))
    .filter((order) => matchesPeriod(order.orderDate || order.created_at || order.date))
    .forEach((order) => {
      const month = normalizeDate(order.orderDate || order.created_at || order.date).slice(0, 7);
      if (!month) return;
      (order.products || []).forEach((item) => {
        const product = productById.get(String(item.id));
        const category = product?.category || item.category || 'Uncategorized';
        const key = `${month}::${category}`;
        if (!categoryMonths[key]) categoryMonths[key] = { month, category, units: 0, revenue: 0 };
        categoryMonths[key].units += Number(item.qty || 1);
        categoryMonths[key].revenue += Number(item.qty || 1) * Number(item.price || 0);
      });
    });
  const monthlyRevenueTotals = Object.values(categoryMonths).reduce((totals, row) => ({ ...totals, [row.month]: (totals[row.month] || 0) + row.revenue }), {});
  const monthlyExpenseTotals = filteredTransactions.filter((transaction) => transaction.type === 'Expense').reduce((totals, transaction) => {
    const month = normalizeDate(transaction.date).slice(0, 7);
    if (month) totals[month] = (totals[month] || 0) + Number(transaction.amount || 0);
    return totals;
  }, {});
  const categoryProfitRows = Object.values(categoryMonths).map((row) => {
    const revenueShare = monthlyRevenueTotals[row.month] ? row.revenue / monthlyRevenueTotals[row.month] : 0;
    const allocatedExpense = Math.round(Number(monthlyExpenseTotals[row.month] || 0) * revenueShare);
    const profit = row.revenue - allocatedExpense;
    return { ...row, allocatedExpense, profit, margin: row.revenue ? (profit / row.revenue) * 100 : 0 };
  }).sort((a, b) => b.month.localeCompare(a.month) || b.profit - a.profit);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    await addTransaction({
      ...formData,
      amount: Number(formData.amount)
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Revenue & Vendor Commission Analytics</h2>
          <p className="text-xs text-slate-500 font-medium">Platform GMV, commission takeaways, subscription revenues, and payout ledgers.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E8262A] hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus size={16} /> Record Revenue Entry
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-end">
        <div className="flex items-center gap-2 text-slate-700 sm:mr-2"><div className="rounded-xl bg-red-50 p-2 text-[#E8262A]"><CalendarDays size={18}/></div><div><p className="text-xs font-bold">Revenue Period</p><p className="text-[10px] text-slate-500">Select a date, month or year</p></div></div>
        <label className="text-[11px] font-bold text-slate-600">Filter By<select value={filterType} onChange={(event) => { setFilterType(event.target.value); setFilterValue(''); }} className="mt-1 block h-10 min-w-32 rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-red-400"><option value="all">All Time</option><option value="date">Specific Date</option><option value="month">Month</option><option value="year">Year</option></select></label>
        {filterType === 'date' && <label className="text-[11px] font-bold text-slate-600">Select Date<input type="date" value={filterValue} onChange={(event) => setFilterValue(event.target.value)} className="mt-1 block h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-red-400"/></label>}
        {filterType === 'month' && <label className="text-[11px] font-bold text-slate-600">Select Month<input type="month" value={filterValue} onChange={(event) => setFilterValue(event.target.value)} className="mt-1 block h-10 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-red-400"/></label>}
        {filterType === 'year' && <label className="text-[11px] font-bold text-slate-600">Select Year<input type="number" min="2000" max="2100" placeholder="2026" value={filterValue} onChange={(event) => setFilterValue(event.target.value.replace(/\D/g, '').slice(0, 4))} className="mt-1 block h-10 w-32 rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-red-400"/></label>}
        {filterType !== 'all' && filterValue && <button type="button" onClick={() => { setFilterType('all'); setFilterValue(''); }} className="h-10 rounded-xl border border-red-200 px-4 text-xs font-bold text-red-600 hover:bg-red-50">Clear Filter</button>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Revenue"
          value={`Rs ${totalRevenue.toLocaleString('en-PK')}`}
          trend="up"
          description="Completed orders and revenue entries"
          icon={DollarSign}
          accentColor="emerald"
        />
        <StatCard
          title="Total Expense"
          value={`Rs ${totalExpenses.toLocaleString('en-PK')}`}
          trend="down"
          description="All recorded operational expenses"
          icon={Receipt}
          accentColor="rose"
        />
        <StatCard
          title="Net Profit"
          value={`Rs ${netProfit.toLocaleString('en-PK')}`}
          trend="up"
          description="Revenue minus total expenses"
          icon={TrendingUp}
          accentColor="purple"
        />
      </div>

      {/* Monthly Top-Selling Product Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div><h3 className="text-sm font-extrabold text-slate-900">Monthly Top-Selling Products</h3><p className="mt-0.5 text-[11px] text-slate-500">Each month ki sab se zyada quantity mein sell hone wali product</p></div>
        <div className="h-64 w-full">
          {topSellingData.length ? <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSellingData} margin={{ top: 28, right: 16, left: -12, bottom: 4 }}>
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} label={{ value: 'Units Sold', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }} />
              <Tooltip content={({ active, payload, label }) => active && payload?.length ? <div className="rounded-xl border border-red-100 bg-white p-3 text-xs shadow-xl"><p className="font-black text-slate-900">{label}</p><p className="mt-1 font-bold text-[#E8262A]">{payload[0].payload.product}</p><p className="text-slate-600">Quantity sold: <strong>{payload[0].payload.quantity}</strong></p><p className="text-slate-600">Sales: <strong>Rs {Number(payload[0].payload.sales).toLocaleString('en-PK')}</strong></p></div> : null} />
              <Bar dataKey="quantity" name="Units Sold" fill="#F62C40" radius={[10, 10, 0, 0]} maxBarSize={70}>
                <LabelList dataKey="product" position="top" fill="#334155" fontSize={10} fontWeight={700} />
              </Bar>
            </BarChart>
          </ResponsiveContainer> : <div className="flex h-full items-center justify-center rounded-xl bg-slate-50 text-center"><div><TrendingUp className="mx-auto text-slate-300" size={30}/><p className="mt-2 text-xs font-bold text-slate-500">Selected period mein product sales data available nahi hai.</p></div></div>}
        </div>
      </div>

      {/* Monthly Category Profit Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-sm font-extrabold text-slate-900">Monthly Category Profit</h3>
          <p className="mt-0.5 text-[11px] text-slate-500">Category revenue ke proportion ke mutabiq monthly expenses allocate karke estimated net profit</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Month</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Units Sold</th>
                <th className="p-3.5">Revenue</th>
                <th className="p-3.5">Allocated Expense</th>
                <th className="p-3.5">Net Profit</th>
                <th className="p-3.5">Profit Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {!categoryProfitRows.length ? <tr><td colSpan={7} className="p-8 text-center text-slate-400">Selected period mein completed category sales available nahi hain.</td></tr> : categoryProfitRows.map((row) => (
                <tr key={`${row.month}-${row.category}`} className="hover:bg-red-50/30 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{row.month}</td>
                  <td className="p-3.5 font-extrabold text-slate-900">{row.category}</td>
                  <td className="p-3.5 font-bold">{row.units}</td>
                  <td className="p-3.5 font-bold text-blue-700">Rs {row.revenue.toLocaleString('en-PK')}</td>
                  <td className="p-3.5 font-bold text-rose-600">Rs {row.allocatedExpense.toLocaleString('en-PK')}</td>
                  <td className={`p-3.5 font-black ${row.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Rs {row.profit.toLocaleString('en-PK')}</td>
                  <td className="p-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${row.margin >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{row.margin.toFixed(1)}%</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Revenue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Record Revenue Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                  placeholder="e.g. Vendor Seller Subscription Fee"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount ($) *</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                >
                  <option value="Marketplace Commission">Marketplace Commission</option>
                  <option value="Vendor SaaS Fee">Vendor SaaS Fee</option>
                  <option value="Featured Ad Space">Featured Ad Space</option>
                  <option value="Delivery Premium">Delivery Premium</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Record Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueView;
