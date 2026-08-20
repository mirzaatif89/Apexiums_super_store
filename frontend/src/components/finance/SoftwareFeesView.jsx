import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { Server, ShieldCheck, Cpu, Plus, X } from 'lucide-react';

const categories = ['Cloud Infrastructure', 'SaaS Subscription', 'Security & SSL', 'Domain & Hosting', 'API & Payment Gateway'];

export const SoftwareFeesView = () => {
  const { finance, addTransaction } = useAdmin();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({ title: '', category: 'Cloud Infrastructure', amount: '', date: new Date().toISOString().slice(0, 10), status: 'Completed' });
  const softwareExpenses = finance.transactions.filter((item) => item.type === 'Expense' && categories.includes(item.category));
  const totalFor = (category) => softwareExpenses.filter((item) => item.category === category).reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const save = async (event) => {
    event.preventDefault();
    if (!form.title || !form.amount) return setError('Provider name and amount are required.');
    setSaving(true); setError('');
    try {
      await addTransaction({ title: form.title, type: 'Expense', category: form.category, amount: Number(form.amount), date: form.date, status: form.status });
      setOpen(false);
      setForm({ title: '', category: 'Cloud Infrastructure', amount: '', date: new Date().toISOString().slice(0, 10), status: 'Completed' });
    } catch (saveError) { setError(saveError.message || 'Could not save this fee.'); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div><h2 className="text-2xl font-black text-slate-900 tracking-tight">Software, API & Cloud Hosting Expenses</h2><p className="text-xs text-slate-500 font-medium">Add and manage SaaS, hosting, security, domain, and API costs yourself.</p></div>
      <button onClick={() => { setError(''); setOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"><Plus size={16}/> Add Software Fee</button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <FeeCard icon={Server} label="Cloud & Hosting" amount={totalFor('Cloud Infrastructure') + totalFor('Domain & Hosting')} color="text-emerald-600" />
      <FeeCard icon={Cpu} label="SaaS & API Services" amount={totalFor('SaaS Subscription') + totalFor('API & Payment Gateway')} color="text-blue-600" />
      <FeeCard icon={ShieldCheck} label="Security & SSL" amount={totalFor('Security & SSL')} color="text-purple-600" />
    </div>

    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]"><th className="p-3.5">Software Provider</th><th className="p-3.5">Category</th><th className="p-3.5">Cost</th><th className="p-3.5">Billing Date</th><th className="p-3.5">Status</th></tr></thead><tbody className="divide-y divide-slate-100 font-medium text-slate-700">{softwareExpenses.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-400">No software fees recorded yet. Use “Add Software Fee” to add one.</td></tr> : softwareExpenses.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="p-3.5 font-extrabold text-slate-900">{item.title}</td><td className="p-3.5 font-semibold">{item.category}</td><td className="p-3.5 font-black text-rose-600">-Rs {Number(item.amount || 0).toLocaleString('en-PK')}</td><td className="p-3.5 text-slate-500">{item.date || '-'}</td><td className="p-3.5"><Badge status={item.status}>{item.status}</Badge></td></tr>)}</tbody></table></div></div>

    {open && <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"><div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-red-100"><div className="flex items-center justify-between p-5 border-b"><div><h3 className="font-extrabold text-slate-900">Add Software Fee</h3><p className="text-[11px] text-slate-500 mt-1">This updates finance totals automatically.</p></div><button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-red-600"><X size={18}/></button></div><form onSubmit={save} className="p-5 space-y-3 text-xs">{error && <p className="rounded-lg bg-red-50 border border-red-200 p-2 text-red-700 font-semibold">{error}</p>}<Field label="Provider / Service Name *"><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. AWS, Cloudflare, OpenAI" className="input"/></Field><div className="grid grid-cols-2 gap-3"><Field label="Category"><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input">{categories.map((category) => <option key={category}>{category}</option>)}</select></Field><Field label="Amount (PKR) *"><input required min="0" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input"/></Field></div><div className="grid grid-cols-2 gap-3"><Field label="Billing Date"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input"/></Field><Field label="Payment Status"><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input"><option>Completed</option><option>Pending</option></select></Field></div><div className="flex justify-end gap-2 pt-3 border-t"><button type="button" onClick={() => setOpen(false)} className="px-3 py-2 rounded-xl border font-bold text-slate-600">Cancel</button><button disabled={saving} className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold disabled:opacity-60">{saving ? 'Saving...' : 'Save Fee'}</button></div></form></div></div>}
  </div>;
};

function FeeCard({ icon: Icon, label, amount, color }) { return <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1"><Icon size={18} className={color}/><p className="text-[10px] uppercase font-bold text-slate-400">{label}</p><p className="text-xl font-black text-slate-900">Rs {amount.toLocaleString('en-PK')}</p><p className={`text-[10px] font-bold ${color}`}>Based on saved fee entries</p></div>; }
function Field({ label, children }) { return <label className="block font-bold text-slate-700 mb-1">{label}<span className="block mt-1">{React.cloneElement(children, { className: 'w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-red-500' })}</span></label>; }

export default SoftwareFeesView;
