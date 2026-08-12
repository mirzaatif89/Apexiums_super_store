import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import { Boxes, AlertTriangle, CheckCircle2, XCircle, DollarSign, Search, Edit3 } from 'lucide-react';

export const StockManagement = () => {
  const { products, updateProductStock } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Stock KPI calculations
  const totalItems = products.length;
  const inStockCount = products.filter((p) => p.stock > p.minStock).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const totalInventoryValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seller.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'in-stock') matchesStatus = p.stock > p.minStock;
    if (statusFilter === 'low-stock') matchesStatus = p.stock > 0 && p.stock <= p.minStock;
    if (statusFilter === 'out-of-stock') matchesStatus = p.stock === 0;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Title */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Real-time Stock & Inventory Control</h2>
        <p className="text-xs text-slate-500 font-medium">Monitor warehouse stock levels, alert thresholds, and total valuation.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="In Stock"
          value={`${inStockCount} Items`}
          trend="up"
          description="Normal inventory"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Low Stock Warning"
          value={`${lowStockCount} Items`}
          trend="down"
          description="Below min threshold"
          icon={AlertTriangle}
          accentColor="amber"
        />
        <StatCard
          title="Out of Stock"
          value={`${outOfStockCount} Items`}
          trend="down"
          description="Requires immediate reorder"
          icon={XCircle}
          accentColor="rose"
        />
        <StatCard
          title="Inventory Valuation"
          value={`$${Math.round(totalInventoryValue).toLocaleString()}`}
          trend="up"
          description="Total asset value"
          icon={DollarSign}
          accentColor="blue"
        />
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search product, SKU, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
        >
          <option value="">All Stock Statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock Warning</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Seller</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Min Alert</th>
                <th className="p-3.5">Stock Value</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.map((p) => {
                const isOut = p.stock === 0;
                const isLow = p.stock <= p.minStock && !isOut;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900 truncate max-w-xs">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px] font-bold text-slate-600">{p.sku}</td>
                    <td className="p-3.5 font-semibold text-slate-800">{p.seller}</td>
                    <td className="p-3.5 font-black text-sm text-slate-900">{p.stock} units</td>
                    <td className="p-3.5 font-semibold text-slate-500">{p.minStock} units</td>
                    <td className="p-3.5 font-black text-slate-900">${(p.price * p.stock).toFixed(2)}</td>
                    <td className="p-3.5">
                      {isOut ? (
                        <Badge status="outstock">Out of Stock</Badge>
                      ) : isLow ? (
                        <Badge status="lowstock">Low Stock</Badge>
                      ) : (
                        <Badge status="active">In Stock</Badge>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1 bg-slate-100 rounded-lg p-1 border">
                        <button
                          onClick={() => updateProductStock(p.id, Math.max(0, p.stock - 5))}
                          className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 text-slate-800 font-black cursor-pointer shadow-2xs"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => updateProductStock(p.id, p.stock + 10)}
                          className="px-2 py-0.5 rounded bg-emerald-600 text-white font-black cursor-pointer shadow-2xs"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
