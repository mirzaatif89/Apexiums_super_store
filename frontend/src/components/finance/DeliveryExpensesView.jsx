import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { Edit2, Plus, Trash2, Truck, X } from 'lucide-react';

const emptyForm = () => ({ courier: '', service_level: '', amount: '', effective_date: new Date().toISOString().slice(0, 10), status: 'Active', notes: '' });

export const DeliveryExpensesView = () => {
  const { deliveryCompanies, saveDeliveryCompany, deleteDeliveryCompany } = useAdmin();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => { setEditingId(null); setForm(emptyForm()); setError(''); setModalOpen(true); };
  const openEdit = (company) => {
    setEditingId(company.id);
    setForm({ courier: company.courier || '', service_level: company.tracking_number || '', amount: company.amount || '', effective_date: String(company.expense_date || '').slice(0, 10), status: company.payment_status || 'Active', notes: company.notes || '' });
    setError(''); setModalOpen(true);
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.courier.trim() || Number(form.amount) <= 0) return setError('Enter the delivery company name and a valid rate.');
    setSaving(true); setError('');
    try { await saveDeliveryCompany({ ...form, courier: form.courier.trim() }, editingId); setModalOpen(false); }
    catch (saveError) { setError(saveError.message || 'Delivery company could not be saved.'); }
    finally { setSaving(false); }
  };
  const handleDelete = async (company) => {
    if (!window.confirm(`Remove ${company.courier}?`)) return;
    try { await deleteDeliveryCompany(company.id); } catch (deleteError) { setError(deleteError.message); }
  };
  const activeCompanies = deliveryCompanies.filter((company) => String(company.payment_status).toLowerCase() === 'active');
  const averageRate = activeCompanies.length ? activeCompanies.reduce((sum, company) => sum + Number(company.amount || 0), 0) / activeCompanies.length : 0;

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-black tracking-tight text-slate-900">Delivery Companies & Rates</h2><p className="text-xs font-medium text-slate-500">Add courier partners and manage their delivery rates and service levels.</p></div><button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700"><Plus size={16}/> Add Delivery Company</button></div>
    {error && !modalOpen ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div> : null}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4"><Truck className="mb-2 text-blue-600" size={20}/><p className="text-[10px] font-bold uppercase text-slate-400">Total Companies</p><p className="text-xl font-black text-slate-900">{deliveryCompanies.length}</p></div><div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Active Partners</p><p className="mt-2 text-xl font-black text-emerald-600">{activeCompanies.length}</p></div><div className="rounded-2xl border border-red-100 bg-gradient-to-br from-white to-red-50 p-4"><p className="text-[10px] font-bold uppercase text-slate-400">Average Delivery Rate</p><p className="mt-2 text-xl font-black text-red-600">Rs {Math.round(averageRate).toLocaleString('en-PK')}</p></div></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead><tr className="border-b bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><th className="p-3.5">Delivery Company</th><th className="p-3.5">Service Level</th><th className="p-3.5">Rate</th><th className="p-3.5">Effective Date</th><th className="p-3.5">Status</th><th className="p-3.5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 font-medium text-slate-700">
      {!deliveryCompanies.length ? <tr><td colSpan={6} className="p-10 text-center text-slate-400">No delivery companies added yet.</td></tr> : deliveryCompanies.map((company) => <tr key={company.id} className="hover:bg-slate-50"><td className="p-3.5"><p className="font-extrabold text-slate-900">{company.courier}</p><p className="max-w-xs truncate text-[10px] text-slate-400">{company.notes || 'No additional notes'}</p></td><td className="p-3.5 font-semibold">{company.tracking_number || 'Standard Delivery'}</td><td className="p-3.5 font-black text-red-600">Rs {Number(company.amount || 0).toLocaleString('en-PK')}</td><td className="p-3.5 text-slate-500">{String(company.expense_date || '').slice(0, 10) || '-'}</td><td className="p-3.5"><Badge status={company.payment_status === 'Active' ? 'Active' : 'Inactive'}>{company.payment_status || 'Active'}</Badge></td><td className="p-3.5 text-right"><div className="inline-flex gap-2"><button onClick={() => openEdit(company)} title="Edit company and rate" className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"><Edit2 size={14}/></button><button onClick={() => handleDelete(company)} title="Delete company" className="rounded-lg border p-2 text-red-600 hover:bg-red-50"><Trash2 size={14}/></button></div></td></tr>)}
    </tbody></table></div></div>
    {modalOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"><div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-5 shadow-2xl"><div className="flex items-center justify-between border-b pb-3"><h3 className="text-base font-black text-slate-900">{editingId ? 'Edit Delivery Company & Rate' : 'Add Delivery Company'}</h3><button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={18}/></button></div><form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">{error ? <div className="rounded-xl bg-red-50 px-3 py-2 font-bold text-red-600">{error}</div> : null}<div><label className="mb-1 block font-bold text-slate-700">Company Name *</label><input required value={form.courier} onChange={(event) => setForm({ ...form, courier: event.target.value })} placeholder="e.g. TCS, Leopards, M&P" className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none"/></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-1 block font-bold text-slate-700">Delivery Rate (Rs) *</label><input type="number" min="1" step="0.01" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none"/></div><div><label className="mb-1 block font-bold text-slate-700">Effective Date *</label><input type="date" required value={form.effective_date} onChange={(event) => setForm({ ...form, effective_date: event.target.value })} className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none"/></div></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-1 block font-bold text-slate-700">Service Level</label><input value={form.service_level} onChange={(event) => setForm({ ...form, service_level: event.target.value })} placeholder="Standard, Same Day, Overnight" className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none"/></div><div><label className="mb-1 block font-bold text-slate-700">Status</label><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none"><option>Active</option><option>Inactive</option></select></div></div><div><label className="mb-1 block font-bold text-slate-700">Notes</label><textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Coverage, weight limits, or special terms" className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none"/></div><div className="flex justify-end gap-2 border-t pt-3"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border px-4 py-2 font-bold text-slate-600">Cancel</button><button disabled={saving} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-60">{saving ? 'Saving...' : 'Save Company & Rate'}</button></div></form></div></div> : null}
  </div>;
};

export default DeliveryExpensesView;
