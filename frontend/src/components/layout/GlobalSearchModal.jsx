import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Search, X, Package, ShoppingCart, Users, Store, TrendingUp, ArrowRight } from 'lucide-react';

export const GlobalSearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, products, orders, customers, sellers, investors, setActiveTab } = useAdmin();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedProducts = q
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.sellerName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedCustomers = q
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedSellers = q
    ? sellers.filter(
        (s) =>
          s.storeName.toLowerCase().includes(q) ||
          s.sellerName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedInvestors = q
    ? investors.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.contactPerson.toLowerCase().includes(q)
      ).slice(0, 2)
    : [];

  const hasResults =
    matchedProducts.length > 0 ||
    matchedOrders.length > 0 ||
    matchedCustomers.length > 0 ||
    matchedSellers.length > 0 ||
    matchedInvestors.length > 0;

  const handleNavigate = (tab) => {
    setActiveTab(tab);
    setIsSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col">
        {/* Search Header Input */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search size={20} className="text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search products, SKUs, orders, sellers, customers, investors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 mr-1"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-semibold cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          {!query && (
            <div className="text-center py-8">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Shortcuts</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => handleNavigate('products')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  <Package size={14} /> Catalog Products
                </button>
                <button
                  onClick={() => handleNavigate('orders')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  <ShoppingCart size={14} /> Orders Management
                </button>
                <button
                  onClick={() => handleNavigate('sellers')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  <Store size={14} /> Multi-Vendors
                </button>
              </div>
            </div>
          )}

          {query && !hasResults && (
            <div className="text-center py-10 text-slate-500 text-sm">
              No matching records found for "{query}"
            </div>
          )}

          {/* Products Results */}
          {matchedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><Package size={14} /> Products</span>
                <button onClick={() => handleNavigate('products')} className="text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer">
                  View all <ArrowRight size={12} />
                </button>
              </div>
              <div className="space-y-1">
                {matchedProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleNavigate('products')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover shrink-0 border" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                        <p className="text-[11px] text-slate-500">SKU: {p.sku} • {p.seller}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">${p.price}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Results */}
          {matchedOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><ShoppingCart size={14} /> Orders</span>
                <button onClick={() => handleNavigate('orders')} className="text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer">
                  View all <ArrowRight size={12} />
                </button>
              </div>
              <div className="space-y-1">
                {matchedOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => handleNavigate('orders')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{o.id} - {o.customerName}</p>
                      <p className="text-[11px] text-slate-500">Seller: {o.sellerName} • Status: {o.orderStatus}</p>
                    </div>
                    <span className="text-xs font-black text-slate-900">${o.totalAmount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sellers Results */}
          {matchedSellers.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><Store size={14} /> Vendors / Sellers</span>
                <button onClick={() => handleNavigate('sellers')} className="text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer">
                  View all <ArrowRight size={12} />
                </button>
              </div>
              <div className="space-y-1">
                {matchedSellers.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleNavigate('sellers')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{s.storeName}</p>
                      <p className="text-[11px] text-slate-500">Owner: {s.sellerName} ({s.status})</p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">${s.revenue.toLocaleString()} Rev</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Results */}
          {matchedCustomers.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5"><Users size={14} /> Customers</span>
                <button onClick={() => handleNavigate('customers')} className="text-red-600 hover:underline flex items-center gap-0.5 cursor-pointer">
                  View all <ArrowRight size={12} />
                </button>
              </div>
              <div className="space-y-1">
                {matchedCustomers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleNavigate('customers')}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-bold text-slate-800">{c.name}</p>
                        <p className="text-[11px] text-slate-500">{c.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{c.totalOrders} orders</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
