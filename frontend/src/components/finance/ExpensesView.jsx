import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CreditCard, DollarSign, Plus, X } from 'lucide-react';

export const ExpensesView = () => {
  const { finance, addTransaction } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Expense',
    amount: '',
    category: 'Software Fees',
    date: '2026-08-11',
    status: 'Completed'
  });

  const expenses = finance.transactions.filter((t) => t.type === 'Expense');

  const expenseBreakdownData = [
    { name: 'Staff Salaries', value: 16500, color: '#f43f5e' },
    { name: 'Software & Hosting Fees', value: 3450, color: '#3b82f6' },
    { name: 'Delivery Expenses', value: 2850, color: '#f59e0b' },
    { name: 'Ad Marketing Costs', value: 4200, color: '#8b5cf6' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    addTransaction({
      ...formData,
      amount: Number(formData.amount)
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Expense Ledger</h2>
          <p className="text-xs text-slate-500 font-medium">Track operational costs including server hosting, staff salaries, logistics, and digital marketing.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus size={16} /> Record Expense Entry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <StatCard
            title="Total Monthly Operating Expenses"
            value={`$${finance.summary.totalExpenses.toLocaleString()}`}
            trend="down"
            description="Under monthly budget cap"
            icon={DollarSign}
            accentColor="rose"
          />

          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Expense Allocation Breakdown</h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdownData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="text-sm font-extrabold text-slate-900">Recent Marketplace Outflows</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3.5">Expense Item</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {expenses.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-extrabold text-slate-900">{t.title}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{t.category}</td>
                    <td className="p-3.5 font-black text-rose-600">-Rs {t.amount.toLocaleString('en-PK')}</td>
                    <td className="p-3.5 text-slate-500">{t.date}</td>
                    <td className="p-3.5"><Badge status={t.status}>{t.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Record Expense Entry</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                  placeholder="e.g. AWS Cloud Infrastructure Bill"
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
                <label className="block font-bold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                >
                  <option value="Software Fees">Software & Cloud Fees</option>
                  <option value="Staff Salaries">Staff Salaries</option>
                  <option value="Delivery Expenses">Delivery & Courier Expenses</option>
                  <option value="Ad Marketing Costs">Ad Marketing Costs</option>
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
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesView;
