import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import ActionMenu from '../common/ActionMenu';
import { Radio, Plus, Trash2, Eye, MousePointer, DollarSign, X } from 'lucide-react';

export const AdsView = () => {
  const { ads, addAd, deleteAd } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadPreview, setUploadPreview] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    placement: 'Social Media Feed',
    targetUrl: 'https://apexiums.com/promo',
    budget: 1000,
    startDate: '2026-08-15',
    endDate: '2026-09-15',
    status: 'Pending',
    image: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addAd({ ...formData, image: formData.image || uploadPreview || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80' });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">APP Banner</h2>
          <p className="text-xs text-slate-500 font-medium">Track paid acquisition campaigns across Google, Meta, TikTok, and Affiliate channels.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 cursor-pointer"
        >
          <Plus size={16} /> Launch Ad Campaign
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Campaign Name</th>
                <th className="p-3.5">Placement</th>
                <th className="p-3.5">Budget</th>
                <th className="p-3.5">Spent</th>
                <th className="p-3.5">Impressions</th>
                <th className="p-3.5">Clicks</th>
                <th className="p-3.5">CTR</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {ads.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={a.image} alt={a.name} className="w-9 h-9 rounded-lg object-cover border shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900">{a.name}</p>
                        <p className="text-[10px] text-slate-400">{a.targetUrl}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-700">{a.placement}</td>
                  <td className="p-3.5 font-bold text-slate-900">Rs {a.budget.toLocaleString('en-PK')}</td>
                  <td className="p-3.5 font-bold text-rose-600">Rs {a.spent.toLocaleString('en-PK')}</td>
                  <td className="p-3.5 font-bold text-slate-800">{a.impressions.toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-slate-800">{a.clicks.toLocaleString()}</td>
                  <td className="p-3.5 font-black text-emerald-600">{a.ctr}</td>
                  <td className="p-3.5">
                    <Badge status={a.status}>{a.status}</Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <ActionMenu
                      buttonTitle="Ad actions"
                      actions={[
                        { label: 'Delete campaign', icon: Trash2, variant: 'danger', onClick: () => deleteAd(a.id) }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Ad Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">New Ad Campaign</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ad Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                  placeholder="e.g. Google Search Summer Sale"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Placement Platform</label>
                <select
                  value={formData.placement}
                  onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                >
                  <option value="Social Media Feed">Social Media Feed (Meta)</option>
                  <option value="Google Search Top">Google Search Top</option>
                  <option value="TikTok Feed">TikTok Video Feed</option>
                  <option value="Affiliate Network">Affiliate Network</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ad Image Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      const result = String(reader.result || '');
                      setUploadPreview(result);
                      setFormData({ ...formData, image: result });
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full rounded-xl border px-3 py-2 font-semibold"
                />
                {(uploadPreview || formData.image) && (
                  <img
                    src={uploadPreview || formData.image}
                    alt="Ad preview"
                    className="mt-2 h-28 w-full rounded-xl border object-cover"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total Budget ($)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl border text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsView;
