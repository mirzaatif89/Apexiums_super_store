import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { Search, X, Printer } from 'lucide-react';

export const CustomersView = () => {
  const { customers, orders } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const customersWithRevenue = Array.from(new Map(orders.map((order) => {
    const key = order.customerEmail || order.customerName || order.customerPhone || order.id;
    const customerOrders = orders.filter((item) => (item.customerEmail && item.customerEmail === order.customerEmail) || (!item.customerEmail && item.customerName === order.customerName));
    const saved = customers.find((customer) => customer.email === order.customerEmail || customer.name === order.customerName) || {};
    return [key, { ...saved, id: saved.id || `order-customer-${key}`, name: order.customerName || saved.name || 'Customer', email: order.customerEmail || saved.email || 'Email not provided', phone: order.customerPhone || saved.phone || 'Phone not provided', city: saved.city || String(order.shippingAddress || '').split(',').pop()?.trim() || 'Address not provided', address: order.shippingAddress || saved.address || 'Address not provided', avatar: saved.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customerName || 'Customer')}&background=ffe4e6&color=be123c`, totalOrders: customerOrders.length, totalSpent: customerOrders.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0), lastOrderDate: order.orderDate || '—', status: saved.status || 'Active' }];
  }))).map(([, customer]) => customer);
  /*
    const customerOrders = orders.filter(
      (order) => order.customerEmail === customer.email || order.customerName === customer.name
    );

    if (!customerOrders.length) return null;
    const lastOrder = customerOrders[0];
    return {
      ...customer,
      phone: customer.phone || lastOrder.customerPhone || '',
      city: customer.city || String(lastOrder.shippingAddress || '').split(',').pop()?.trim() || '—',
      lastOrderDate: lastOrder.orderDate || customer.lastOrderDate || '—',
      totalOrders: Math.max(Number(customer.totalOrders) || 0, customerOrders.length),
      totalSpent: Math.max(
        Number(customer.totalSpent) || 0,
        customerOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0)
      )
    };
  }).filter(Boolean); */

  const filteredCustomers = customersWithRevenue.filter((customer) =>
    String(customer.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const printMissingContacts = () => {
    const missing = customersWithRevenue.filter((customer) => !customer.email || !customer.phone);
    const popup = window.open('', '_blank', 'width=900,height=650');
    if (!popup) return;

    popup.document.write(`
      <html>
        <head>
          <title>Customers Missing Contact Details</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #111827; color: white; }
          </style>
        </head>
        <body>
          <h2>Customers Missing Email or Phone</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Spent</th>
              </tr>
            </thead>
            <tbody>
              ${missing
                .map(
                  (customer) => `
                    <tr>
                      <td>${customer.id}</td>
                      <td>${customer.name}</td>
                      <td>${customer.email || 'Missing'}</td>
                      <td>${customer.phone || 'Missing'}</td>
                      <td>${customer.totalOrders}</td>
                      <td>Rs ${customer.totalSpent}</td>
                    </tr>
                  `
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Customer Database & CRM</h2>
          <p className="text-xs font-medium text-slate-500">Customer activity metrics, total spending histories, and membership tiers.</p>
        </div>
        <button
          onClick={printMissingContacts}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white"
        >
          <Printer size={16} /> Print Missing Contacts
        </button>
      </div>

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search customer name, email, city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-slate-50">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={customer.avatar} alt={customer.name} className="h-9 w-9 shrink-0 rounded-full border object-cover" />
                      <div>
                        <p className="font-bold text-slate-900">{customer.name}</p>
                        <p className="text-[10px] text-slate-400">ID: {customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{customer.email}</p>
                    <p className="text-[10px] text-slate-400">
                      {customer.phone || 'Phone missing'} · {customer.city}
                    </p>
                  </td>
                  <td className="p-3.5 font-extrabold text-slate-900">{customer.totalOrders} purchases</td>
                  <td className="p-3.5 font-black text-emerald-600">Rs {customer.totalSpent.toLocaleString('en-PK')}</td>
                  <td className="p-3.5 font-medium text-slate-500">{customer.lastOrderDate}</td>
                  <td className="p-3.5">
                    <Badge status={customer.status}>{customer.status}</Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="cursor-pointer rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-200"
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

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <img src={selectedCustomer.avatar} alt={selectedCustomer.name} className="h-10 w-10 rounded-full border object-cover" />
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-[10px] text-slate-400">{selectedCustomer.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border bg-slate-50 p-3 text-xs">
              <div>
                <p className="text-slate-400">Total Spent:</p>
                <p className="text-base font-black text-emerald-600">Rs {selectedCustomer.totalSpent}</p>
              </div>
              <div>
                <p className="text-slate-400">Total Orders:</p>
                <p className="text-base font-black text-slate-900">{selectedCustomer.totalOrders}</p>
              </div>
              <div>
                <p className="text-slate-400">City:</p>
                <p className="font-bold text-slate-800">{selectedCustomer.city}</p>
              </div>
              <div>
                <p className="text-slate-400">Joined Date:</p>
                <p className="font-bold text-slate-800">{selectedCustomer.joinDate}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedCustomer(null)}
              className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white"
            >
              Close Customer File
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersView;
