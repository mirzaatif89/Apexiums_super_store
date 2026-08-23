import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { Edit2, Plus, Trash2, Truck, X } from "lucide-react";

const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ products: "", date: today(), description: "", totalAmount: "", paymentMethod: "Cash" });

export const DeliveryExpensesView = () => {
  // The existing delivery-expenses API fields are mapped to the new expense form.
  const { deliveryCompanies: expenses, saveDeliveryCompany, deleteDeliveryCompany } = useAdmin();
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const openAdd = () => { setEditingId(null); setForm(blank()); setError(""); setModalOpen(true); };
  const openEdit = (expense) => {
    setEditingId(expense.id);
    setForm({ products: expense.courier || "", date: String(expense.expense_date || "").slice(0, 10) || today(), description: expense.notes || "", totalAmount: expense.amount || "", paymentMethod: expense.tracking_number || "Cash" });
    setError(""); setModalOpen(true);
  };
  const save = async (event) => {
    event.preventDefault();
    if (!form.products.trim() || Number(form.totalAmount) <= 0) return setError("Products and a valid total amount are required.");
    setSaving(true); setError("");
    try {
      await saveDeliveryCompany({ courier: form.products.trim(), service_level: form.paymentMethod, amount: form.totalAmount, effective_date: form.date, status: "Paid", notes: form.description.trim() }, editingId);
      setModalOpen(false);
    } catch (err) { setError(err.message || "Delivery expense could not be saved."); }
    finally { setSaving(false); }
  };
  const remove = async (expense) => {
    if (!window.confirm("Delete this delivery expense?")) return;
    try { await deleteDeliveryCompany(expense.id); } catch (err) { setError(err.message || "Delivery expense could not be deleted."); }
  };
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-black tracking-tight text-slate-900">Delivery Expenses</h2><p className="text-xs font-medium text-slate-500">Record and manage delivery-related expenses.</p></div><button onClick={openAdd} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700"><Plus size={16} /> Add Delivery Expense</button></div>
    {error && !modalOpen ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div> : null}
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 sm:max-w-xs"><Truck className="mb-2 text-blue-600" size={20} /><p className="text-[10px] font-bold uppercase text-slate-400">Total Delivery Expenses</p><p className="text-xl font-black text-slate-900">Rs {total.toLocaleString("en-PK")}</p></div>
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead><tr className="border-b bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><th className="p-3.5">Products</th><th className="p-3.5">Date</th><th className="p-3.5">Description</th><th className="p-3.5">Total Amount</th><th className="p-3.5">Payment Method</th><th className="p-3.5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100 font-medium text-slate-700">{!expenses.length ? <tr><td colSpan={6} className="p-10 text-center text-slate-400">No delivery expenses added yet.</td></tr> : expenses.map((expense) => <tr key={expense.id} className="hover:bg-slate-50"><td className="p-3.5 font-extrabold text-slate-900">{expense.courier}</td><td className="p-3.5 text-slate-500">{String(expense.expense_date || "").slice(0, 10) || "-"}</td><td className="max-w-xs truncate p-3.5">{expense.notes || "-"}</td><td className="p-3.5 font-black text-red-600">Rs {Number(expense.amount || 0).toLocaleString("en-PK")}</td><td className="p-3.5">{expense.tracking_number || "-"}</td><td className="p-3.5 text-right"><div className="inline-flex gap-2"><button onClick={() => openEdit(expense)} title="Edit delivery expense" className="rounded-lg border p-2 text-blue-600 hover:bg-blue-50"><Edit2 size={14} /></button><button onClick={() => remove(expense)} title="Delete delivery expense" className="rounded-lg border p-2 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button></div></td></tr>)}</tbody></table></div></div>
    {modalOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs"><div className="w-full max-w-lg rounded-2xl border border-red-100 bg-white p-5 shadow-2xl"><div className="flex items-center justify-between border-b pb-3"><h3 className="text-base font-black text-slate-900">{editingId ? "Edit Delivery Expense" : "Add Delivery Expense"}</h3><button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-800"><X size={18} /></button></div><form onSubmit={save} className="mt-4 space-y-3 text-xs">{error ? <div className="rounded-xl bg-red-50 px-3 py-2 font-bold text-red-600">{error}</div> : null}<div><label className="mb-1 block font-bold text-slate-700">Products *</label><input required value={form.products} onChange={(e) => set("products", e.target.value)} placeholder="e.g. Packaging, delivery bags" className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none" /></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className="mb-1 block font-bold text-slate-700">Date *</label><input type="date" required value={form.date} onChange={(e) => set("date", e.target.value)} className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none" /></div><div><label className="mb-1 block font-bold text-slate-700">Total Amount (Rs) *</label><input type="number" min="0.01" step="0.01" required value={form.totalAmount} onChange={(e) => set("totalAmount", e.target.value)} className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none" /></div></div><div><label className="mb-1 block font-bold text-slate-700">Description</label><textarea rows="3" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Enter expense details" className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none" /></div><div><label className="mb-1 block font-bold text-slate-700">Payment Method *</label><select value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)} className="w-full rounded-xl border px-3 py-2 font-semibold focus:border-red-500 focus:outline-none"><option>Cash</option><option>Bank Transfer</option><option>JazzCash</option><option>EasyPaisa</option><option>Credit / Debit Card</option></select></div><div className="flex justify-end gap-2 border-t pt-3"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border px-4 py-2 font-bold text-slate-600">Cancel</button><button disabled={saving} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-60">{saving ? "Saving..." : "Save Delivery Expense"}</button></div></form></div></div> : null}
  </div>;
};

export default DeliveryExpensesView;
