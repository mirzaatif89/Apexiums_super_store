import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import ActionMenu from '../common/ActionMenu';
import {
  ShoppingCart,
  Search,
  Eye,
  CheckCircle2,
  Truck,
  XCircle,
  X,
  MapPin,
  CreditCard,
  PackageCheck,
  User,
  RotateCcw,
  Printer,
  CalendarDays
} from 'lucide-react';

export const OrdersView = () => {
  const { orders, updateOrderStatus, deleteOrder, createReturnFromOrder, setActiveTab } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orderDateKey = (value) => {
    const raw = String(value || '').trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
    const dayFirst = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (dayFirst) return `${dayFirst[3]}-${dayFirst[2].padStart(2, '0')}-${dayFirst[1].padStart(2, '0')}`;
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return '';
    return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
  };

  const printReceipt = (order) => {
    const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
    const itemRows = (order.products || []).map((item) => `
      <tr><td>${escapeHtml(item.name)}</td><td>${Number(item.qty || 0)}</td><td>Rs ${Number(item.price || 0).toLocaleString('en-PK')}</td><td>Rs ${(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString('en-PK')}</td></tr>
    `).join('');
    const receiptWindow = window.open('', '_blank', 'width=820,height=900');
    if (!receiptWindow) return;
    receiptWindow.document.write(`<!doctype html><html><head><title>Receipt ${escapeHtml(order.id)}</title><style>
      *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#172033;margin:0;padding:28px}.receipt{max-width:760px;margin:auto;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden}.head{background:#F62C40;color:#fff;padding:22px 26px;display:flex;justify-content:space-between}.head h1{font-size:22px;margin:0}.head p{font-size:12px;margin:5px 0 0}.section{padding:20px 26px;border-bottom:1px solid #e2e8f0}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.label{font-size:10px;text-transform:uppercase;color:#64748b;font-weight:700;margin-bottom:5px}.value{font-size:13px;font-weight:700;margin:3px 0}table{width:100%;border-collapse:collapse;font-size:12px}th,td{text-align:left;padding:10px;border-bottom:1px solid #e2e8f0}th{background:#f8fafc;text-transform:uppercase;font-size:10px;color:#64748b}.total{display:flex;justify-content:space-between;align-items:center;background:#fff1f2;padding:20px 26px}.total strong{font-size:22px;color:#F62C40}.foot{text-align:center;padding:18px;color:#64748b;font-size:11px}@media print{body{padding:0}.receipt{border:0}.no-print{display:none}}
    </style></head><body><div class="receipt"><div class="head"><div><h1>Elistin</h1><p>Official Order Receipt</p></div><div style="text-align:right"><strong>Order #${escapeHtml(order.id)}</strong><p>${escapeHtml(order.orderDate)}</p></div></div><div class="section grid"><div><div class="label">Customer</div><div class="value">${escapeHtml(order.customerName)}</div><div>${escapeHtml(order.customerEmail)}</div><div>${escapeHtml(order.customerPhone)}</div></div><div><div class="label">Shipping Address</div><div class="value">${escapeHtml(order.shippingAddress)}</div><div>Courier: ${escapeHtml(order.deliveryCourier || 'Unassigned')}</div></div></div><div class="section"><div class="label">Purchased Items</div><table><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${itemRows}</tbody></table></div><div class="total"><div><div class="label">Payment Method</div><div class="value">${escapeHtml(order.paymentMethod)}</div></div><div style="text-align:right"><div class="label">Grand Total Paid</div><strong>Rs ${Number(order.totalAmount || 0).toLocaleString('en-PK')}</strong></div></div><div class="foot">Thank you for shopping with Elistin.</div></div></body></html>`);
    receiptWindow.document.close();
    receiptWindow.focus();
    window.setTimeout(() => receiptWindow.print(), 250);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? o.orderStatus === statusFilter : true;
    const matchesDate = dateFilter ? orderDateKey(o.orderDate || o.created_at || o.date) === dateFilter : true;
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Fulfillment & Sales</h2>
        <p className="text-xs text-slate-500 font-medium">Track customer purchases, vendor order fulfillment, shipping timeline, and payment statuses.</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search Order ID, customer, vendor store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none"
          />
        </div>
        <label className="relative min-w-[185px]">
          <CalendarDays size={16} className="pointer-events-none absolute left-3 top-3 text-[#E8262A]" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter orders by date"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-semibold text-slate-700 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="">All Order Statuses</option>
          <option value="Packed">Packed</option>
          <option value="Shipped">Shipped</option>
          <option value="Received">Received</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Return">Return</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-visible">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Vendor Store</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Payment</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No orders match the selected search, status, or date.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">{o.id}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{o.customerName}</p>
                      <p className="text-[10px] text-slate-400">{o.customerEmail}</p>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{o.sellerName}</td>
                    <td className="p-3.5 font-black text-slate-900">Rs {o.totalAmount}</td>
                    <td className="p-3.5">
                      <Badge status={o.paymentStatus}>{o.paymentStatus}</Badge>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.orderStatus === 'Returned' ? 'Return' : ['Packed', 'Shipped', 'Received', 'Cancelled', 'Return'].includes(o.orderStatus) ? o.orderStatus : ''}
                        onChange={(e) => {
                          if (e.target.value === 'Return') createReturnFromOrder(o);
                          else updateOrderStatus(o.id, e.target.value);
                        }}
                        className="px-2 py-1 bg-slate-100 border rounded-lg text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option value="" disabled>Select status</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Received">Received</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Return">Return</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-slate-500 font-medium">{o.orderDate}</td>
                    <td className="p-3.5 text-right">
                      <ActionMenu
                        buttonTitle="Order actions"
                        actions={[
                          { label: 'View details', icon: Eye, onClick: () => setSelectedOrder(o) },
                          { label: 'Move to Returns', icon: RotateCcw, variant: 'danger', onClick: () => { createReturnFromOrder(o); setActiveTab('returns'); } }
                          ,{ label: 'Delete order', icon: XCircle, variant: 'danger', onClick: () => deleteOrder(o.id) }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 bg-[#E8262A] text-white">
              <div>
                <h3 className="text-sm font-extrabold">Order Details #{selectedOrder.id}</h3>
                <p className="text-[10px] text-red-100">Placed on {selectedOrder.orderDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => printReceipt(selectedOrder)} className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[11px] font-bold text-[#E8262A] shadow-sm hover:bg-red-50"><Printer size={15}/> Print Receipt</button>
                <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-1.5 text-red-100 hover:bg-white/15 hover:text-white"><X size={18} /></button>
              </div>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Order Timeline */}
              <div>
                <h4 className="font-extrabold text-slate-800 mb-2 flex items-center gap-1.5">
                  <PackageCheck size={16} className="text-red-600" /> Order Fulfillment Status Timeline
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-red-50/60 p-3 rounded-xl border border-red-100">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        {step.done ? (
                          <CheckCircle2 size={14} className="text-[#E8262A] shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                        )}
                        <span className="truncate">{step.title}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">{step.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Shipping */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-red-50/40 rounded-xl border border-red-100 space-y-1">
                  <p className="font-extrabold text-slate-800 flex items-center gap-1"><User size={14} /> Customer Information</p>
                  <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                  <p className="text-slate-500">{selectedOrder.customerEmail}</p>
                  <p className="text-slate-500">{selectedOrder.customerPhone}</p>
                </div>
                <div className="p-3 bg-red-50/40 rounded-xl border border-red-100 space-y-1">
                  <p className="font-extrabold text-slate-800 flex items-center gap-1"><MapPin size={14} /> Shipping Address</p>
                  <p className="text-slate-700 font-medium">{selectedOrder.shippingAddress}</p>
                  <p className="text-slate-500 font-bold mt-1">Courier: {selectedOrder.deliveryCourier}</p>
                </div>
              </div>

              {/* Products Breakdown */}
              <div>
                <h4 className="font-extrabold text-slate-800 mb-2">Purchased Items ({selectedOrder.products.length})</h4>
                <div className="space-y-2">
                  {selectedOrder.products.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-red-100 bg-white">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">Qty: {item.qty} x Rs {item.price}</p>
                        </div>
                      </div>
                          <span className="font-black text-slate-900">Rs {(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-3 bg-[#E8262A] text-white rounded-xl flex items-center justify-between shadow-md shadow-red-900/15">
                <div>
                  <p className="text-[10px] text-red-100 uppercase font-bold">Payment Method</p>
                  <p className="font-bold text-xs">{selectedOrder.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-red-100 uppercase font-bold">Grand Total Paid</p>
                  <p className="text-lg font-black text-white">Rs {selectedOrder.totalAmount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersView;
