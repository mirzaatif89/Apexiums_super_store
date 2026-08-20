import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import ActionMenu from '../common/ActionMenu';
import { RotateCcw, Search, CheckCircle2, XCircle, Eye, X, Plus } from 'lucide-react';

export const ReturnsView = () => {
  const { returns, updateReturnStatus, addReturn, orders } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ orderId: '', customerName: '', customerEmail: '', productName: '', sellerName: '', reason: '', amount: '' });

  const filteredReturns = returns.filter((r) => {
    return (
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.productName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Returns & Refunds Management</h2>
        <p className="text-xs text-slate-500 font-medium">Review customer dispute claims, defect inspects, and refund authorizations.</p>
      </div><button onClick={() => setIsAdding(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white"><Plus size={16}/> Add Return</button></div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search Return ID, Order ID, customer name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Return ID</th>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Seller</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredReturns.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{r.id}</td>
                  <td className="p-3.5 font-bold text-slate-600">{r.orderId}</td>
                  <td className="p-3.5">{r.customerName}</td>
                  <td className="p-3.5 max-w-xs font-semibold truncate">{r.productName}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{r.sellerName}</td>
                  <td className="p-3.5 font-black text-slate-900">Rs {r.amount}</td>
                  <td className="p-3.5">
                    <Badge status={r.status}>{r.status}</Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <ActionMenu
                      buttonTitle="Return actions"
                      actions={[
                        { label: 'Inspect', icon: Eye, onClick: () => setSelectedReturn(r) },
                        {
                          label: 'Approve & Refund',
                          icon: CheckCircle2,
                          onClick: () => {
                            updateReturnStatus(r.id, 'Refunded');
                            setSelectedReturn(null);
                          }
                        },
                        {
                          label: 'Reject Claim',
                          icon: XCircle,
                          variant: 'danger',
                          onClick: () => {
                            updateReturnStatus(r.id, 'Rejected');
                            setSelectedReturn(null);
                          }
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Detail Inspector Modal */}
      {isAdding && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"><form onSubmit={(e)=>{e.preventDefault();addReturn({...form,amount:Number(form.amount)});setIsAdding(false);setForm({ orderId: '', customerName: '', customerEmail: '', productName: '', sellerName: '', reason: '', amount: '' });}} className="w-full max-w-lg rounded-2xl bg-white p-5"><div className="mb-4 flex justify-between"><h3 className="text-lg font-black">Add Manual Return</h3><button type="button" onClick={()=>setIsAdding(false)}><X size={18}/></button></div><div className="grid gap-3 sm:grid-cols-2"><label className="text-xs font-bold">Order ID *<select required value={form.orderId} onChange={(e)=>{const order=orders.find((o)=>o.id===e.target.value);const item=order?.products?.[0];setForm({...form,orderId:e.target.value,customerName:order?.customerName||'',customerEmail:order?.customerEmail||'',productName:item?.name||'',sellerName:order?.sellerName||'',amount:order?.totalAmount||''})}} className="mt-1 w-full rounded-xl border p-2"><option value="">Select or enter below</option>{orders.map((o)=><option key={o.id} value={o.id}>{o.id}</option>)}</select></label>{[['customerName','Customer Name *'],['customerEmail','Customer Email'],['productName','Product *'],['sellerName','Seller'],['amount','Return Amount *']].map(([key,label])=><label key={key} className="text-xs font-bold">{label}<input required={label.includes('*')} type={key==='amount'?'number':'text'} value={form[key]} onChange={(e)=>setForm({...form,[key]:e.target.value})} className="mt-1 w-full rounded-xl border p-2"/></label>)}<label className="text-xs font-bold sm:col-span-2">Return Reason *<textarea required value={form.reason} onChange={(e)=>setForm({...form,reason:e.target.value})} className="mt-1 w-full rounded-xl border p-2"/></label></div><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={()=>setIsAdding(false)} className="rounded-xl border px-4 py-2 text-xs font-bold">Cancel</button><button className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white">Add Return</button></div></form></div>}

      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Return Ticket #{selectedReturn.id}</h3>
              <button onClick={() => setSelectedReturn(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p><span className="text-slate-400">Order ID:</span> <strong>{selectedReturn.orderId}</strong></p>
              <p><span className="text-slate-400">Customer:</span> <strong>{selectedReturn.customerName}</strong></p>
              <p><span className="text-slate-400">Product:</span> <strong>{selectedReturn.productName}</strong></p>
              <p><span className="text-slate-400">Reason:</span> <strong className="text-rose-600">{selectedReturn.reason}</strong></p>
              <p><span className="text-slate-400">Refund Amount:</span> <strong className="text-emerald-600">Rs {selectedReturn.amount}</strong></p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={() => {
                  updateReturnStatus(selectedReturn.id, 'Rejected');
                  setSelectedReturn(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 font-bold text-xs hover:bg-rose-100 cursor-pointer"
              >
                Reject Claim
              </button>
              <button
                onClick={() => {
                  updateReturnStatus(selectedReturn.id, 'Refunded');
                  setSelectedReturn(null);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Approve & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsView;
