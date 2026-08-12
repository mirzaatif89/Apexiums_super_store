import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { Users, Search, ShoppingBag, DollarSign, Calendar, MapPin, X, Star } from 'lucide-react';

export const CustomersView = () => {
  const { customers } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customer Database & CRM</h2>
        <p className="text-xs text-slate-500 font-medium">Customer activity metrics, total spending histories, and membership tiers.</p>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search customer name, email, city..."
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
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Contact & City</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Total Spent</th>
                <th className="p-3.5">Last Order</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={c.avatar} alt={c.name} className="w-9 h-9 rounded-full object-cover border shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[10px] text-slate-400">ID: {c.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{c.email}</p>
                    <p className="text-[10px] text-slate-400">{c.city}</p>
                  </td>
                  <td className="p-3.5 font-extrabold text-slate-900">{c.totalOrders} purchases</td>
                  <td className="p-3.5 font-black text-emerald-600">${c.totalSpent.toLocaleString()}</td>
                  <td className="p-3.5 font-medium text-slate-500">{c.lastOrderDate}</td>
                  <td className="p-3.5">
                    <Badge status={c.status}>{c.status}</Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                    >
                      View CRM Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Drawer Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="w-10 h-10 rounded-full object-cover border" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-[10px] text-slate-400">{selectedCustomer.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border">
              <div><p className="text-slate-400">Total Spent:</p><p className="text-base font-black text-emerald-600">${selectedCustomer.totalSpent}</p></div>
              <div><p className="text-slate-400">Total Orders:</p><p className="text-base font-black text-slate-900">{selectedCustomer.totalOrders}</p></div>
              <div><p className="text-slate-400">City:</p><p className="font-bold text-slate-800">{selectedCustomer.city}</p></div>
              <div><p className="text-slate-400">Joined Date:</p><p className="font-bold text-slate-800">{selectedCustomer.joinDate}</p></div>
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Customer File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;
