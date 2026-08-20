import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Percent, ArrowUpRight, Plus, X } from 'lucide-react';

export const RevenueView = () => {
  const { finance, addTransaction } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Revenue',
    amount: '',
    category: 'Marketplace Commission',
    date: '2026-08-11',
    status: 'Completed'
  });

  const revenues = finance.transactions.filter((t) => t.type === 'Revenue');

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
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus size={16} /> Record Revenue Entry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Gross Merchandise Value (GMV)"
          value={`Rs ${finance.summary.totalRevenue.toLocaleString('en-PK')}`}
          trend="up"
          description="+14.2% from last month"
          icon={DollarSign}
          accentColor="emerald"
        />
        <StatCard
          title="Platform Takeaway Commission"
          value={`Rs ${finance.summary.commissionEarnings.toLocaleString('en-PK')}`}
          trend="up"
          description="Average 10% commission rate"
          icon={Percent}
          accentColor="blue"
        />
        <StatCard
          title="Net Profit Margin"
          value={`Rs ${finance.summary.netProfit.toLocaleString('en-PK')}`}
          trend="up"
          description="Post-expense operational net"
          icon={TrendingUp}
          accentColor="purple"
        />
      </div>

      {/* Area Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900">Revenue & Commission Growth Curve</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" h="100%">
            <AreaChart data={finance.revenueTrend}>
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
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="grossSales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" name="Gross Sales ($)" />
              <Area type="monotone" dataKey="commissions" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#commGrad)" name="Platform Commission ($)" />
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
