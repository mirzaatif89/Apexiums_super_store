import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
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
  User
} from 'lucide-react';

export const OrdersView = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? o.orderStatus === statusFilter : true;
    return matchesSearch && matchesStatus;
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="">All Order Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Returned">Returned</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
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
                    No orders match your search criteria.
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
                    <td className="p-3.5 font-black text-slate-900">${o.totalAmount}</td>
                    <td className="p-3.5">
                      <Badge status={o.paymentStatus}>{o.paymentStatus}</Badge>
                    </td>
                    <td className="p-3.5">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                        className="px-2 py-1 bg-slate-100 border rounded-lg text-[11px] font-bold text-slate-800 focus:outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-slate-500 font-medium">{o.orderDate}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye size={14} /> View Order
                      </button>
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
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <div>
                <h3 className="text-sm font-extrabold">Order Details #{selectedOrder.id}</h3>
                <p className="text-[10px] text-slate-300">Placed on {selectedOrder.orderDate}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              {/* Order Timeline */}
              <div>
                <h4 className="font-extrabold text-slate-800 mb-2 flex items-center gap-1.5">
                  <PackageCheck size={16} className="text-red-600" /> Order Fulfillment Status Timeline
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border">
                  {selectedOrder.timeline.map((step, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        {step.done ? (
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
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
                <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                  <p className="font-extrabold text-slate-800 flex items-center gap-1"><User size={14} /> Customer Information</p>
                  <p className="font-bold text-slate-900">{selectedOrder.customerName}</p>
                  <p className="text-slate-500">{selectedOrder.customerEmail}</p>
                  <p className="text-slate-500">{selectedOrder.customerPhone}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
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
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border bg-white">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">Qty: {item.qty} x ${item.price}</p>
                        </div>
                      </div>
                      <span className="font-black text-slate-900">${(item.qty * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Summary */}
              <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Payment Method</p>
                  <p className="font-bold text-xs">{selectedOrder.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Grand Total Paid</p>
                  <p className="text-lg font-black text-emerald-400">${selectedOrder.totalAmount}</p>
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
