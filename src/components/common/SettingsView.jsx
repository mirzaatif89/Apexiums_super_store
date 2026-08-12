import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Settings, Save, Globe, Lock, Shield, Mail, DollarSign, Store } from 'lucide-react';

export const SettingsView = () => {
  const { addToast } = useAdmin();

  const [settings, setSettings] = useState({
    marketplaceName: 'Apexium Marketplace',
    supportEmail: 'support@apexium.com',
    currency: 'USD ($)',
    defaultCommission: 10,
    taxRate: 7.5,
    enableMultiVendor: true,
    enableVendorSelfRegister: true,
    autoApproveProducts: false,
    stripeEnabled: true,
    paypalEnabled: true,
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587'
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Marketplace configuration saved successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Marketplace Settings & Rules</h2>
        <p className="text-xs text-slate-500 font-medium">Configure platform branding, vendor registration, tax policies, and payment integrations.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* General Branding */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Store size={16} className="text-red-600" /> Platform General & Branding
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Marketplace Platform Name</label>
              <input
                type="text"
                value={settings.marketplaceName}
                onChange={(e) => setSettings({ ...settings, marketplaceName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Support Contact Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-semibold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-semibold"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="PKR (Rs)">PKR (Rs)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sales Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => setSettings({ ...settings, taxRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Vendor & Commission Policy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Shield size={16} className="text-purple-600" /> Vendor & Multi-Vendor Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Platform Commission Takeaway (%)</label>
              <input
                type="number"
                value={settings.defaultCommission}
                onChange={(e) => setSettings({ ...settings, defaultCommission: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-xl font-semibold"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableVendorSelfRegister}
                onChange={(e) => setSettings({ ...settings, enableVendorSelfRegister: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-800">Allow Self-Service Vendor Registration Application</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoApproveProducts}
                onChange={(e) => setSettings({ ...settings, autoApproveProducts: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded cursor-pointer"
              />
              <span className="font-bold text-slate-800">Auto-Approve Vendor Product Listings (Disable for manual moderation)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg shadow-red-600/20 cursor-pointer"
          >
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
