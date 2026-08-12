import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { Server, ShieldCheck, Cpu } from 'lucide-react';

export const SoftwareFeesView = () => {
  const { finance } = useAdmin();
  const softwareExpenses = finance.transactions.filter((t) => t.category === 'Software Fees' || t.category === 'Server & Infrastructure');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Software, API & Cloud Hosting Expenses</h2>
        <p className="text-xs text-slate-500 font-medium">SaaS tool subscriptions, Google Cloud / AWS infrastructure costs, domain hosting, and payment gateway fees.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Cloud Infra</p>
          <p className="text-xl font-black text-slate-900">$2,450.00</p>
          <p className="text-[10px] text-emerald-600 font-bold">AWS & Cloudflare Edge</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">SaaS Subscriptions</p>
          <p className="text-xl font-black text-slate-900">$1,000.00</p>
          <p className="text-[10px] text-blue-600 font-bold">Stripe, SendGrid, Twilio</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">SSL & Security Audit</p>
          <p className="text-xl font-black text-slate-900">$450.00</p>
          <p className="text-[10px] text-purple-600 font-bold">Quarterly Pen-Test</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Software Provider</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Cost</th>
                <th className="p-3.5">Billing Date</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {softwareExpenses.length === 0 ? (
                <tr><td colSpan={5} className="p-6 text-center text-slate-400">No software fee entries logged yet.</td></tr>
              ) : (
                softwareExpenses.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-extrabold text-slate-900">{t.title}</td>
                    <td className="p-3.5 font-semibold text-slate-700">{t.category}</td>
                    <td className="p-3.5 font-black text-rose-600">-${t.amount.toLocaleString()}</td>
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

export default SoftwareFeesView;
