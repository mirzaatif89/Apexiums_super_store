import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ShieldCheck, Check, Plus, X } from 'lucide-react';
import { isSuperAdminRole } from '../../utils/roles';

export const PermissionsView = () => {
  const { rolesPermissions, updateRolePermission } = useAdmin();

  const permissionKeys = [
    { key: 'viewDashboard', label: 'View Dashboard & Analytics' },
    { key: 'manageProducts', label: 'Manage Catalog Products' },
    { key: 'manageCategories', label: 'Manage Categories' },
    { key: 'manageStock', label: 'Manage Stock & Inventory' },
    { key: 'manageOrders', label: 'Manage Orders & Fulfillment' },
    { key: 'manageReturns', label: 'Manage Returns & Refunds' },
    { key: 'manageCustomers', label: 'Manage Customer CRM' },
    { key: 'manageSellers', label: 'Manage Vendors & Sellers' },
    { key: 'manageStaff', label: 'Manage Staff & Users' },
    { key: 'manageMarketing', label: 'Manage Banners & Ad Campaigns' },
    { key: 'manageFinance', label: 'Manage Finance & Revenue' },
    { key: 'manageInvestors', label: 'Manage Investors & Equity' },
    { key: 'manageChats', label: 'Reply to Customer Chats' },
    { key: 'viewNotifications', label: 'View Notifications' },
    { key: 'manageSettings', label: 'Manage Store Settings' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Granular Roles & Permission Matrix</h2>
        <p className="text-xs text-slate-500 font-medium">Working access matrix for Sellers, Staff, and Investors. Changes are saved in the browser.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 w-64">Permission Capability</th>
                {rolesPermissions.map((r) => (
                  <th key={r.role} className="p-4 text-center">
                    <span className="block text-xs font-black">{r.role}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {permissionKeys.map((perm) => (
                <tr key={perm.key} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{perm.label}</td>
                  {rolesPermissions.map((r) => {
                    const isProtected = isSuperAdminRole(r.role);
                    const isChecked = isProtected || r.permissions[perm.key] || false;
                    return (
                      <td key={r.role} className="p-4 text-center">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isProtected}
                            title={isProtected ? 'Super Admin always has full access' : undefined}
                            onChange={(e) => updateRolePermission(r.role, perm.key, e.target.checked)}
                            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-80"
                          />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionsView;
