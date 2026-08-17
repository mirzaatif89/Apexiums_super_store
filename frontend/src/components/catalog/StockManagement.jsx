import React from 'react';
import { Boxes, Plus, Search, X, Edit2, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const emptyStock = { productId: '', totalItems: '', stockBelongTo: '', quantity: '', description: '' };

export default function StockManagement() {
  const { stockRecords, products, addStockRecord } = useAdmin();
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(emptyStock);
  const rows = products.map((product) => {
    const records = stockRecords.filter((row) => String(row.productId) === String(product.id));
    const latest = records[0];
    const remaining = Number(product.stock) || 0;
    const total = Number(latest?.totalItems ?? remaining) || 0;
    return { id: latest?.id || `product-${product.id}`, productId: product.id, sku: product.sku || '—', productName: product.name, soldItems: Math.max(0, total - remaining), quantity: remaining, remaining, description: latest?.description || product.description || '', product };
  }).filter((row) => [row.productId, row.productName, row.product.category, row.description].some((value) => String(value || '').toLowerCase().includes(query.toLowerCase())));

  function submit(event) {
    event.preventDefault();
    addStockRecord(form);
    setForm(emptyStock);
    setOpen(false);
  }

  return <div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-2xl font-black text-slate-900">Stock / Inventory</h2><p className="text-xs font-medium text-slate-500">Product-wise stock ownership, totals, quantities and descriptions.</p></div><button onClick={() => setOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white"><Plus size={16}/> Add Stock</button></div>
    <div className="flex items-center gap-3 rounded-2xl border bg-white p-4"><Search size={16} className="text-slate-400"/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search Product ID, product, seller..." className="w-full bg-transparent text-xs font-semibold outline-none"/></div>
    <div className="overflow-hidden rounded-2xl border bg-white"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-900 text-[10px] font-bold uppercase text-white"><tr><th className="p-4">SKU</th><th className="p-4">Product Image / Name</th><th className="p-4">Sold Items</th><th className="p-4">Category</th><th className="p-4">Quantity</th><th className="p-4">Remaining</th><th className="p-4">Actions</th></tr></thead><tbody className="divide-y">{rows.map((row)=>{ const product = products.find((p) => String(p.id) === String(row.productId)); return <tr key={row.id} className="hover:bg-slate-50"><td className="p-4 font-black">{row.sku}</td><td className="p-4"><div className="flex items-center gap-3 font-bold"><img src={product?.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&q=80'} alt={row.productName} className="h-10 w-10 rounded-lg border object-cover"/><span>{row.productName}</span></div></td><td className="p-4">{row.soldItems}</td><td className="p-4">{product?.category || '—'}</td><td className="p-4 font-black text-emerald-700">{row.quantity}</td><td className="p-4 font-black text-sky-700">{row.remaining}</td><td className="p-4"><div className="flex gap-2"><button type="button" title="Edit stock" className="rounded-lg border p-2 text-slate-600 hover:bg-slate-100"><Edit2 size={14}/></button><button type="button" title="Delete stock" className="rounded-lg border p-2 text-rose-600 hover:bg-rose-50"><Trash2 size={14}/></button></div></td></tr>;})}</tbody></table></div></div>
    {open && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4"><form onSubmit={submit} className="w-full max-w-lg rounded-2xl bg-white p-6"><div className="mb-5 flex justify-between"><div><h3 className="text-lg font-black">Add Stock</h3><p className="text-xs text-slate-500">Enter all inventory details.</p></div><button type="button" onClick={()=>setOpen(false)}><X size={18}/></button></div><div className="grid gap-4 sm:grid-cols-2">
      <label className="text-xs font-bold">Product ID *<select required value={form.productId} onChange={(e)=>{const product=products.find((p)=>String(p.id)===e.target.value);setForm({...form,productId:e.target.value,stockBelongTo:product?.seller||form.stockBelongTo,description:product?.description||form.description})}} className="mt-1 w-full rounded-xl border p-2.5"><option value="">Select product</option>{products.map((p)=><option key={p.id} value={p.id}>{p.id} — {p.name}</option>)}</select></label>
      {[['totalItems','Total Items *','number'],['stockBelongTo','Stock Belong To *','text'],['quantity','Quantity *','number']].map(([key,label,type])=><label key={key} className="text-xs font-bold">{label}<input type={type} min={type==='number'?'0':undefined} required value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})} className="mt-1 w-full rounded-xl border p-2.5"/></label>)}
      <label className="text-xs font-bold sm:col-span-2">Description *<textarea required rows="3" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} className="mt-1 w-full rounded-xl border p-2.5"/></label>
    </div><div className="mt-5 flex justify-end gap-2"><button type="button" onClick={()=>setOpen(false)} className="rounded-xl border px-4 py-2 text-xs font-bold">Cancel</button><button className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Save Stock</button></div></form></div>}
  </div>;
}
