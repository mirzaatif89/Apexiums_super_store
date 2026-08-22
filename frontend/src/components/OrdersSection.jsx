import React, { useState } from 'react';
import {
  PackageSearch,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Download,
  RefreshCw,
  Search,
  ChevronRight,
  MapPin,
  CreditCard,
  ShoppingBag,
  Printer,
  MessageCircle,
  FileText,
  RotateCcw,
  Calendar,
  ShieldCheck,
  User,
  Phone,
  ArrowLeft,
  Trash2,
  HelpCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-PK')}`;

export default function OrdersSection({
  orders = [],
  setOrders,
  session,
  storeName = 'Apexiums Super Store',
  logoSrc
}) {
  const [orderFilter, setOrderFilter] = useState('All'); // 'All' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned'
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null); // Detailed view / invoice
  const [trackingOrder, setTrackingOrder] = useState(null); // Track order modal
  const [cancellingOrder, setCancellingOrder] = useState(null); // Cancel modal
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [returningOrder, setReturningOrder] = useState(null); // Return/Refund modal
  const [returnReason, setReturnReason] = useState('Defective or not working');
  const [returnNote, setReturnNote] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const status = (order.order_status || 'Processing').toLowerCase();
    const filter = orderFilter.toLowerCase();

    let matchesStatus = true;
    if (filter !== 'all') {
      matchesStatus = status === filter;
    }

    const query = searchQuery.trim().toLowerCase();
    let matchesSearch = true;
    if (query) {
      const matchId = String(order.id).toLowerCase().includes(query);
      const matchCust = (order.customer_name || '').toLowerCase().includes(query);
      const matchItem = order.items?.some((i) => i.title?.toLowerCase().includes(query));
      matchesSearch = matchId || matchCust || matchItem;
    }

    return matchesStatus && matchesSearch;
  });

  // Calculate Order Statistics
  const stats = {
    total: orders.length,
    processing: orders.filter((o) => (o.order_status || '').toLowerCase() === 'processing').length,
    shipped: orders.filter((o) => (o.order_status || '').toLowerCase() === 'shipped').length,
    delivered: orders.filter((o) => (o.order_status || '').toLowerCase() === 'delivered').length,
    cancelled: orders.filter((o) => (o.order_status || '').toLowerCase() === 'cancelled').length,
  };

  // Handle Cancel Submit
  const handleConfirmCancel = () => {
    if (!cancellingOrder) return;
    const updated = orders.map((o) => {
      if (o.id === cancellingOrder.id) {
        return { ...o, order_status: 'Cancelled', cancel_reason: cancelReason };
      }
      return o;
    });
    setOrders(updated);
    setCancellingOrder(null);
    showToast(`Order #ORD-${cancellingOrder.id} has been cancelled.`);
  };

  // Handle Return Submit
  const handleConfirmReturn = () => {
    if (!returningOrder) return;
    const updated = orders.map((o) => {
      if (o.id === returningOrder.id) {
        return { ...o, order_status: 'Return Requested', return_reason: returnReason, return_note: returnNote };
      }
      return o;
    });
    setOrders(updated);
    setReturningOrder(null);
    setReturnNote('');
    showToast(`Return request for Order #ORD-${returningOrder.id} submitted successfully.`);
  };

  // Handle Print/Download Invoice
  const handleDownloadInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Please allow popups to download/print the invoice.');
      return;
    }

    const itemsHtml = (order.items || [
      { title: 'Standard Order Package', qty: 1, price: order.total_amount }
    ]).map(
      (item, i) => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee;">${i + 1}</td>
        <td style="padding:10px; border-bottom:1px solid #eee;"><strong>${item.title}</strong></td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">${item.qty || 1}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">Rs ${(item.price || 0).toLocaleString()}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">Rs ${((item.price || 0) * (item.qty || 1)).toLocaleString()}</td>
      </tr>
    `
    ).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #INV-${order.id} - ${storeName}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #059669; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: 900; color: #059669; }
          .badge { background: #d1fae5; color: #065f46; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; font-size: 12px; }
          .total-box { margin-top: 20px; text-align: right; font-size: 14px; }
          .total-amount { font-size: 20px; font-weight: 900; color: #059669; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">${storeName}</div>
            <p style="margin:4px 0 0; font-size:12px; color:#64748b;">Official Purchase Invoice</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0; font-size:16px; font-weight:bold;">INVOICE #INV-${order.id}</p>
            <p style="margin:4px 0 0; font-size:12px; color:#64748b;">Date: ${order.created_at ? new Date(order.created_at).toLocaleDateString('en-PK') : 'Recent'}</p>
          </div>
        </div>

        <div class="grid">
          <div>
            <p style="margin:0 0 5px; font-weight:bold; color:#059669;">SHIPPED TO:</p>
            <p style="margin:0; font-weight:bold;">${order.customer_name || session?.name || 'Valued Customer'}</p>
            <p style="margin:2px 0 0; color:#475569;">${order.shipping_address || 'House #42, Block B, Johar Town, Lahore'}</p>
          </div>
          <div style="text-align:right;">
            <p style="margin:0 0 5px; font-weight:bold; color:#059669;">PAYMENT INFO:</p>
            <p style="margin:0;">Method: <strong>${order.payment_method || 'Cash on Delivery (COD)'}</strong></p>
            <p style="margin:2px 0 0; color:#059669; font-weight:bold;">Status: PAID / COD AUTHORIZED</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item Description</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Unit Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <p style="margin:4px 0;">Subtotal: <strong>Rs ${(order.total_amount || 0).toLocaleString()}</strong></p>
          <p style="margin:4px 0;">Shipping Fee: <strong>Rs 0 (FREE)</strong></p>
          <p style="margin:10px 0 0;" class="total-amount">Grand Total: Rs ${(order.total_amount || 0).toLocaleString()}</p>
        </div>

        <div class="footer">
          <p>Thank you for shopping at ${storeName}! For inquiries, contact us on WhatsApp: 0339-1717571</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 font-sans">

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-bounce">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. SECTION HEADER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
            {storeName} Order Portal
          </span>
          <h2 className="mt-1 text-xl font-black text-slate-900 tracking-tight">
            My Orders & Purchase History
          </h2>
          <p className="text-xs text-slate-500">
            Track express delivery, view invoices, manage returns and reorder items seamlessly.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order ID or Product..."
            className="w-full h-10 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-full outline-none focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 transition shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 2. STATUS FILTER PILLS & METRICS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { label: 'All', count: stats.total },
          { label: 'Processing', count: stats.processing },
          { label: 'Shipped', count: stats.shipped },
          { label: 'Delivered', count: stats.delivered },
          { label: 'Cancelled', count: stats.cancelled }
        ].map((tab) => {
          const isActive = orderFilter.toLowerCase() === tab.label.toLowerCase();
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => setOrderFilter(tab.label)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/10'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-700 shadow-2xs'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. ORDER CARDS LIST */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-3 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            <PackageSearch size={42} className="mx-auto text-slate-300" />
            <h3 className="text-sm font-bold text-slate-800">No Orders Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any orders matching "{orderFilter}". Try searching for another Order ID or filter category.
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const status = order.order_status || 'Processing';
            const isDelivered = status.toLowerCase() === 'delivered';
            const isShipped = status.toLowerCase() === 'shipped';
            const isProcessing = status.toLowerCase() === 'processing';
            const isCancelled = status.toLowerCase() === 'cancelled';
            const isReturned = status.toLowerCase().includes('return');

            return (
              <div
                key={order.id}
                className="group rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition-all duration-300 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/5 space-y-4"
              >
                {/* Order Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-black text-slate-900 text-sm tracking-tight">
                      #ORD-{order.id}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })
                        : 'Recent Order'}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
                      {order.payment_method || 'Cash on Delivery (COD)'}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        isDelivered
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isShipped
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : isReturned
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isDelivered && <CheckCircle2 size={12} />}
                      {isShipped && <Truck size={12} />}
                      {isProcessing && <Clock size={12} />}
                      {isCancelled && <AlertCircle size={12} />}
                      {status}
                    </span>
                  </div>
                </div>

                {/* Progress Mini Progress Bar on Card */}
                {!isCancelled && (
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck size={15} className="text-emerald-600 shrink-0" />
                      <span className="text-slate-600 font-medium">Estimated Delivery:</span>
                      <span className="font-extrabold text-slate-900">
                        {order.estimated_delivery || '2 – 4 Working Days'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTrackingOrder(order)}
                      className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline text-[11px] cursor-pointer"
                    >
                      <span>Track Shipment Progress</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}

                {/* Product List Items inside Card */}
                <div className="space-y-2.5">
                  {(order.items || [
                    {
                      title: 'Standard Apexiums Order Package',
                      qty: 1,
                      price: order.total_amount,
                      image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80'
                    }
                  ]).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/50 border border-slate-100"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80'}
                          alt={item.title}
                          className="h-12 w-12 rounded-lg object-cover border border-slate-200/80 bg-white shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>Qty: <strong className="text-slate-800">{item.qty || 1}</strong></span>
                            <span>•</span>
                            <span>Unit Price: <strong>Rs {(item.price || 0).toLocaleString('en-PK')}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900">
                          Rs {((item.price || 0) * (item.qty || 1)).toLocaleString('en-PK')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer: Summary & Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Total Amount:</span>
                    <span className="text-base font-black text-emerald-700">
                      {money(order.total_amount)}
                    </span>
                    <span className="text-[10px] text-slate-400">(Inclusive of Taxes & Delivery)</span>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Invoice Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                    >
                      <FileText size={14} className="text-slate-500" />
                      <span>Details & Invoice</span>
                    </button>

                    {/* Track Button */}
                    <button
                      type="button"
                      onClick={() => setTrackingOrder(order)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <Truck size={14} className="text-emerald-600" />
                      <span>Track Order</span>
                    </button>

                    {/* Buy Again Button */}
                    <button
                      type="button"
                      onClick={() => showToast(`Items from Order #ORD-${order.id} added to cart!`)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-2xs transition cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      <span>Buy Again</span>
                    </button>

                    {/* Cancel Order Button (Only if processing) */}
                    {isProcessing && (
                      <button
                        type="button"
                        onClick={() => setCancellingOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Cancel Order</span>
                      </button>
                    )}

                    {/* Return/Refund Request Button (If delivered and not already returned) */}
                    {isDelivered && !isReturned && (
                      <button
                        type="button"
                        onClick={() => setReturningOrder(order)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-200 bg-purple-50 text-xs font-bold text-purple-800 hover:bg-purple-100 transition cursor-pointer"
                      >
                        <RotateCcw size={14} />
                        <span>Return / Refund</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: DETAILED ORDER VIEW & INVOICE */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:px-6 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-emerald-400" />
                <div>
                  <h3 className="text-sm font-black tracking-tight">Order Details & Invoice</h3>
                  <p className="text-[11px] text-slate-300">#ORD-{selectedOrder.id} • {storeName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
              {/* Order Status Ribbon */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div>
                  <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Current Status</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">{selectedOrder.order_status || 'Processing'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print / Download Invoice</span>
                </button>
              </div>

              {/* Shipping & Payment Grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-600" />
                    <span>Shipping Address</span>
                  </p>
                  <p className="text-slate-800 font-bold">{selectedOrder.customer_name || session?.name || 'Valued Customer'}</p>
                  <p className="text-slate-600 leading-relaxed">{selectedOrder.shipping_address || 'House #42, Block B, Johar Town, Lahore'}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <CreditCard size={14} className="text-emerald-600" />
                    <span>Payment Summary</span>
                  </p>
                  <p className="text-slate-700">Method: <strong>{selectedOrder.payment_method || 'Cash on Delivery (COD)'}</strong></p>
                  <p className="text-emerald-700 font-extrabold">Total Paid: {money(selectedOrder.total_amount)}</p>
                </div>
              </div>

              {/* Purchased Items List */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                  Ordered Items ({selectedOrder.items?.length || 1})
                </h4>

                <div className="space-y-2">
                  {(selectedOrder.items || [
                    { title: 'Standard Apexiums Product', qty: 1, price: selectedOrder.total_amount }
                  ]).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 bg-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80'}
                          alt={item.title}
                          className="h-10 w-10 rounded-lg object-cover border"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{item.title}</p>
                          <p className="text-[11px] text-slate-500">Qty: {item.qty || 1} x Rs {(item.price || 0).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="font-black text-emerald-800">
                        Rs {((item.price || 0) * (item.qty || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-bold">Rs {(selectedOrder.total_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Express Shipping:</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between text-slate-900 text-sm font-black pt-1 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="text-emerald-700">{money(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EXPRESS ORDER TRACKING TIMELINE */}
      {/* ======================================================== */}
      {trackingOrder && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:px-6 bg-emerald-700 text-white">
              <div className="flex items-center gap-2">
                <Truck size={20} />
                <div>
                  <h3 className="text-sm font-black tracking-tight">Express Shipment Tracking</h3>
                  <p className="text-[11px] text-emerald-100">Tracking ID: APX-982341-{trackingOrder.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Courier Header Card */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                    APX
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Apexiums Logistics Express</p>
                    <p className="text-[11px] text-slate-500">Estimated Delivery: {trackingOrder.estimated_delivery || '2-3 Days'}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Active Transit
                </span>
              </div>

              {/* Progress Steps Visual Timeline */}
              <div className="relative pl-6 space-y-6 border-l-2 border-emerald-500 ml-2">
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white shadow-2xs">
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Order Placed & Confirmed</p>
                    <p className="text-[11px] text-slate-500">Order received at {storeName} warehouse</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[31px] top-0 h-6 w-6 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-4 ring-white shadow-2xs">
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Quality Checked & Packed</p>
                    <p className="text-[11px] text-slate-500">Item verified for quality and standard packaging</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs ${
                    ['Shipped', 'Delivered'].includes(trackingOrder.order_status)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Truck size={13} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Dispatched with Courier Partner</p>
                    <p className="text-[11px] text-slate-500">In transit to destination city facility</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0 h-6 w-6 rounded-full flex items-center justify-center ring-4 ring-white shadow-2xs ${
                    trackingOrder.order_status === 'Delivered'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    <PackageSearch size={13} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Out for Final Delivery</p>
                    <p className="text-[11px] text-slate-500">Courier rider assigned to deliver to address</p>
                  </div>
                </div>
              </div>

              {/* Courier Contact Card */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-900">Assigned Express Rider</p>
                  <p className="text-[11px] text-emerald-700">Ali Raza (Apexiums Delivery Hub Lahore)</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Calling Apexiums Delivery Rider: 0300-8881234')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition cursor-pointer"
                >
                  <Phone size={13} />
                  <span>Call Rider</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 transition cursor-pointer"
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: CANCEL ORDER MODAL */}
      {/* ======================================================== */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <AlertCircle size={18} className="text-rose-600" />
                Cancel Order #ORD-{cancellingOrder.id}
              </h3>
              <button type="button" onClick={() => setCancellingOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel this order? Once cancelled, the items will not be dispatched.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-rose-500"
              >
                <option value="Changed my mind">Changed my mind</option>
                <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                <option value="Ordered by mistake">Ordered by mistake</option>
                <option value="Delivery time is too long">Delivery time is too long</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition cursor-pointer shadow-sm"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: RETURN / REFUND REQUEST MODAL */}
      {/* ======================================================== */}
      {returningOrder && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <RotateCcw size={18} className="text-purple-600" />
                Return Request #ORD-{returningOrder.id}
              </h3>
              <button type="button" onClick={() => setReturningOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Submit a 7-day easy return request under {storeName} Buyer Protection Guarantee.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Reason</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-purple-600"
                >
                  <option value="Defective or not working">Defective or not working</option>
                  <option value="Wrong item delivered">Wrong item delivered</option>
                  <option value="Damaged during shipping">Damaged during shipping</option>
                  <option value="Size / Variant mismatch">Size / Variant mismatch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Additional Notes</label>
                <textarea
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl h-20 outline-none focus:bg-white focus:border-purple-600"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReturningOrder(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl hover:bg-purple-700 transition cursor-pointer shadow-sm"
              >
                Submit Return Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
