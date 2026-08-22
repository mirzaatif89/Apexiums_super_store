import React from 'react';
import { BadgePercent, CalendarDays, Edit2, Plus, Search, TicketPercent, Trash2, X } from 'lucide-react';

const today = new Date().toISOString().slice(0, 10);
const emptyCoupon = {
  code: '', title: '', description: '', discount_type: 'Percentage', discount_value: '',
  min_order_amount: '0', use_for: 'All products', usage_limit: '0', used_count: 0,
  valid_from: today, valid_till: '', status: 'Active'
};

export default function CouponsView() {
  const [coupons, setCoupons] = React.useState([]);
  const [query, setQuery] = React.useState('');
  const [form, setForm] = React.useState(null);
  const [editing, setEditing] = React.useState(null);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const loadCoupons = React.useCallback(async () => {
    const response = await fetch('/api/coupons?limit=100');
    const data = response.ok ? await response.json() : { rows: [] };
    setCoupons(Array.isArray(data.rows) ? data.rows : []);
  }, []);

  React.useEffect(() => { loadCoupons().catch(() => setError('Coupons load nahi ho sake.')); }, [loadCoupons]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyCoupon }); setError(''); };
  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({ ...emptyCoupon, ...coupon, valid_from: String(coupon.valid_from || '').slice(0, 10), valid_till: String(coupon.valid_till || '').slice(0, 10) });
    setError('');
  };

  const saveCoupon = async (event) => {
    event.preventDefault();
    const code = form.code.trim().toUpperCase();
    if (!code || Number(form.discount_value) <= 0) return setError('Coupon code aur valid discount value enter karein.');
    if (form.discount_type === 'Percentage' && Number(form.discount_value) > 100) return setError('Percentage discount 100% se zyada nahi ho sakta.');
    if (form.valid_till && form.valid_from && form.valid_till < form.valid_from) return setError('Expiry date start date ke baad honi chahiye.');
    if (!editing && coupons.some((coupon) => String(coupon.code).toUpperCase() === code)) return setError('Ye coupon code pehle se mojood hai.');
    setSaving(true); setError('');
    try {
      const response = await fetch(editing ? `/api/coupons/${editing.id}` : '/api/coupons', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form, code, discount_value: Number(form.discount_value), min_order_amount: Number(form.min_order_amount || 0),
          usage_limit: Number(form.usage_limit || 0), used_count: Number(form.used_count || 0), valid_till: form.valid_till || null
        })
      });
      if (!response.ok) throw new Error((await response.json()).message || 'Coupon save failed');
      setForm(null); setEditing(null);
      await loadCoupons();
    } catch (saveError) { setError(saveError.message); } finally { setSaving(false); }
  };

  const removeCoupon = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"?`)) return;
    await fetch(`/api/coupons/${coupon.id}`, { method: 'DELETE' });
    await loadCoupons();
  };

  const toggleStatus = async (coupon) => {
    await fetch(`/api/coupons/${coupon.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: coupon.status === 'Active' ? 'Inactive' : 'Active' })
    });
    await loadCoupons();
  };

  const filtered = coupons.filter((coupon) => [coupon.code, coupon.title, coupon.description, coupon.use_for].some((value) => String(value || '').toLowerCase().includes(query.toLowerCase())));
  const activeCount = coupons.filter((coupon) => coupon.status === 'Active').length;
  const totalUses = coupons.reduce((sum, coupon) => sum + Number(coupon.used_count || 0), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-black text-slate-900">Coupons & Discounts</h2><p className="text-xs font-medium text-slate-500">Create discount codes customers can apply during checkout.</p></div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700"><Plus size={16}/> Create Coupon</button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Total Coupons</p><p className="mt-1 text-2xl font-bold text-slate-800">{coupons.length}</p></div>
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Active Coupons</p><p className="mt-1 text-2xl font-bold text-slate-800">{activeCount}</p></div>
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Total Uses</p><p className="mt-1 text-2xl font-bold text-slate-800">{totalUses}</p></div>
      </div>

      <div className="relative max-w-md"><Search size={16} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search coupon code or title..." className="w-full rounded-xl border bg-white py-2.5 pl-9 pr-3 text-xs outline-none focus:border-red-400"/></div>

      <div className="overflow-x-auto rounded-2xl border bg-white shadow-xs">
        <table className="w-full min-w-[900px] text-left text-xs">
          <thead className="bg-slate-900 text-[10px] uppercase tracking-wider text-white"><tr>{['Coupon','Discount','Minimum Order','Validity','Usage','Status','Actions'].map((heading) => <th key={heading} className="p-4">{heading}</th>)}</tr></thead>
          <tbody className="divide-y">{filtered.map((coupon) => {
            const expired = coupon.valid_till && String(coupon.valid_till).slice(0, 10) < today;
            return <tr key={coupon.id} className="hover:bg-red-50/30"><td className="p-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-violet-50 p-2 text-violet-600"><TicketPercent size={18}/></div><div><p className="font-black tracking-wider text-slate-900">{coupon.code}</p><p className="text-[10px] text-slate-500">{coupon.title || 'Discount coupon'}</p></div></div></td><td className="p-4 font-bold text-emerald-700">{coupon.discount_type === 'Percentage' ? `${Number(coupon.discount_value)}%` : `Rs ${Number(coupon.discount_value).toLocaleString('en-PK')}`}</td><td className="p-4">Rs {Number(coupon.min_order_amount || 0).toLocaleString('en-PK')}</td><td className="p-4"><p>{String(coupon.valid_from || '').slice(0, 10) || 'Now'}</p><p className={`text-[10px] ${expired ? 'font-bold text-red-600' : 'text-slate-500'}`}>to {String(coupon.valid_till || '').slice(0, 10) || 'No expiry'}</p></td><td className="p-4">{Number(coupon.used_count || 0)} / {Number(coupon.usage_limit || 0) || 'Unlimited'}</td><td className="p-4"><button type="button" onClick={() => toggleStatus(coupon)} className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${coupon.status === 'Active' && !expired ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{expired ? 'Expired' : coupon.status || 'Active'}</button></td><td className="p-4"><div className="flex gap-1"><button type="button" onClick={() => openEdit(coupon)} className="rounded-lg border p-2 text-slate-600 hover:bg-slate-50"><Edit2 size={14}/></button><button type="button" onClick={() => removeCoupon(coupon)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 size={14}/></button></div></td></tr>;
          })}{!filtered.length && <tr><td colSpan="7" className="p-10 text-center text-sm text-slate-500">No coupons found. Create your first discount coupon.</td></tr>}</tbody>
        </table>
      </div>

      {form && <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4"><form onSubmit={saveCoupon} className="my-auto w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h3 className="text-lg font-black text-slate-900">{editing ? 'Edit Coupon' : 'Create Coupon'}</h3><p className="text-xs text-slate-500">Configure the checkout discount rules.</p></div><button type="button" onClick={() => setForm(null)} className="rounded-lg p-2 hover:bg-slate-100"><X size={18}/></button></div><div className="grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold">Coupon Code *<input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '') })} placeholder="SALE20" className="mt-1 w-full rounded-xl border p-2.5 uppercase outline-none focus:border-red-400"/></label><label className="text-xs font-bold">Coupon Title *<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Summer Sale" className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-red-400"/></label><label className="text-xs font-bold">Discount Type<select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5"><option>Percentage</option><option>Fixed Amount</option></select></label><label className="text-xs font-bold">Discount Value *<div className="relative"><input required min="0.01" max={form.discount_type === 'Percentage' ? '100' : undefined} step="0.01" type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5 pr-10 outline-none focus:border-red-400"/><span className="absolute right-3 top-3.5 text-xs font-bold text-slate-400">{form.discount_type === 'Percentage' ? '%' : 'Rs'}</span></div></label><label className="text-xs font-bold">Minimum Order (Rs)<input min="0" type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5"/></label><label className="text-xs font-bold">Usage Limit <span className="font-normal text-slate-400">(0 = unlimited)</span><input min="0" type="number" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5"/></label><label className="text-xs font-bold">Valid From<div className="relative"><CalendarDays size={15} className="absolute bottom-3 left-3 text-slate-400"/><input type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} className="mt-1 w-full rounded-xl border py-2.5 pl-9 pr-3"/></div></label><label className="text-xs font-bold">Valid Till <span className="font-normal text-slate-400">(optional)</span><input type="date" value={form.valid_till} onChange={(e) => setForm({ ...form, valid_till: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5"/></label><label className="text-xs font-bold">Apply To<select value={form.use_for} onChange={(e) => setForm({ ...form, use_for: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5"><option>All products</option><option>Cart discount</option></select></label><label className="text-xs font-bold">Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5"><option>Active</option><option>Inactive</option></select></label><label className="text-xs font-bold sm:col-span-2">Description<textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Coupon details or conditions..." className="mt-1 w-full rounded-xl border p-2.5 outline-none focus:border-red-400"/></label></div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={() => setForm(null)} className="rounded-xl border px-4 py-2.5 text-xs font-bold">Cancel</button><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white disabled:opacity-50"><BadgePercent size={15}/>{saving ? 'Saving...' : 'Save Coupon'}</button></div></form></div>}
    </div>
  );
}
