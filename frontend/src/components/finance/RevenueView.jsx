import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarDays, DollarSign, TrendingUp, Receipt, Plus, X } from 'lucide-react';

export const RevenueView = () => {
  const { finance, orders, addTransaction } = useAdmin();
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

  const matchesPeriod = (dateValue) => {
    if (filterType === 'all' || !filterValue) return true;
    const date = String(dateValue || '').slice(0, 10);
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

  const chartBuckets = {};
  filteredTransactions.forEach((transaction) => {
    const key = filterType === 'date' ? String(transaction.date || '').slice(0, 10) : String(transaction.date || '').slice(0, 7);
    if (!key) return;
    if (!chartBuckets[key]) chartBuckets[key] = { period: key, revenue: 0, expenses: 0 };
    chartBuckets[key][transaction.type === 'Expense' ? 'expenses' : 'revenue'] += Number(transaction.amount || 0);
  });
  orders.filter((order) => ['Shipped', 'Delivered', 'Received'].includes(order.orderStatus || order.order_status)).filter((order) => matchesPeriod(order.orderDate || order.created_at || order.date)).forEach((order) => {
    const date = order.orderDate || order.created_at || order.date;
    const key = filterType === 'date' ? String(date || '').slice(0, 10) : String(date || '').slice(0, 7);
    if (!key) return;
    if (!chartBuckets[key]) chartBuckets[key] = { period: key, revenue: 0, expenses: 0 };
    chartBuckets[key].revenue += Number(order.totalAmount || order.total_amount || 0);
  });
  const filteredChartData = Object.values(chartBuckets).sort((a, b) => a.period.localeCompare(b.period));

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

      {/* Area Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900">Revenue & Expense Growth</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredChartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" name="Revenue (Rs)" />
              <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#commGrad)" name="Expenses (Rs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-sm font-extrabold text-slate-900">Revenue Ledger Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Transaction Title</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {!revenues.length ? <tr><td colSpan={5} className="p-6 text-center text-slate-400">No revenue entries recorded yet.</td></tr> : revenues.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-extrabold text-slate-900">{t.title}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{t.category}</td>
                  <td className="p-3.5 font-black text-emerald-600">+Rs {t.amount.toLocaleString('en-PK')}</td>
                  <td className="p-3.5 text-slate-500">{t.date}</td>
                  <td className="p-3.5"><Badge status={t.status}>{t.status}</Badge></td>
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
