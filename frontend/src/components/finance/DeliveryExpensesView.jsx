import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { Truck, MapPin, PackageCheck } from 'lucide-react';

export const DeliveryExpensesView = () => {
  const { finance } = useAdmin();
  const deliveryExpenses = finance.transactions.filter((t) => t.category === 'Delivery Expenses');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Logistics & Delivery Expenses</h2>
        <p className="text-xs text-slate-500 font-medium">Courier partner settlements, shipping subsidies, express fulfillment fees, and reverse logistics costs.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">FedEx Express Settlement</p>
          <p className="text-xl font-black text-slate-900">Rs 1,850</p>
          <p className="text-[10px] text-emerald-600 font-bold">142 Shipments</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">DHL Express Global</p>
          <p className="text-xl font-black text-slate-900">Rs 1,200</p>
          <p className="text-[10px] text-blue-600 font-bold">58 Cross-Border Items</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Local Courier Partners</p>
          <p className="text-xl font-black text-slate-900">Rs 640</p>
          <p className="text-[10px] text-purple-600 font-bold">Same Day Delivery</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Logistics Partner / Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Expense Cost</th>
                <th className="p-3.5">Settlement Date</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {deliveryExpenses.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-400">No specific delivery expense entries logged yet.</td></tr>
              ) : (
                deliveryExpenses.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-extrabold text-slate-900">{t.title}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{t.category}</td>
                    <td className="p-3.5 font-black text-rose-600">-Rs {t.amount.toLocaleString('en-PK')}</td>
                    <td className="p-3.5 text-slate-500">{t.date}</td>
                    <td className="p-3.5"><Badge status={t.status}>{t.status}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DeliveryExpensesView;
