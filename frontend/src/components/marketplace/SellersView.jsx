import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import ActionMenu from '../common/ActionMenu';
import { Store, Search, Plus, CheckCircle2, ShieldAlert, X, Star, Trash2, LoaderCircle } from 'lucide-react';

export const SellersView = () => {
  const { sellers, updateSellerStatus, deleteSeller, addSeller, sellerApplications, reviewSellerApplication, categories } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    sellerName: '',
    storeName: '',
    contact: '',
    address: '',
    email: '',
    phone: '',
    description: '',
    sellerImage: '',
    selectedCategories: [],
    username: '',
    password: '',
    commissionRate: 10,
    ratings: 5,
    verificationStatus: 'Pending',
    status: 'Pending',
    payoutMethod: 'Bank Transfer'
  });

  const filteredSellers = sellers.filter(
    (s) =>
      String(s.storeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.sellerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.storeName || !formData.sellerName || !formData.selectedCategories.length) {
      window.alert('Enter the store name and select at least one product category.');
      return;
    }
    setIsSaving(true);
    try { await addSeller({ ...formData, stockSellerSell: formData.selectedCategories.join(', ') }); setIsModalOpen(false); }
    catch (error) { window.alert(error.message || 'Seller could not be added.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Multi-Vendor & Seller Management</h2>
          <p className="text-xs text-slate-500 font-medium">Approve vendor applications, track store sales, adjust commissions, and manage verification status.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus size={16} /> Add Seller
        </button>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <Search size={16} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search seller store, owner name, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-red-100 bg-white shadow-xs"><div className="border-b bg-red-50/60 p-4"><h3 className="text-sm font-black text-slate-900">Website Seller Applications</h3><p className="text-[11px] text-slate-500">Approve applicants to register them as active sellers.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-xs"><thead><tr className="border-b bg-slate-50 text-[10px] font-bold uppercase text-slate-500"><th className="p-3">Applicant</th><th className="p-3">Business</th><th className="p-3">Category</th><th className="p-3">Contact</th><th className="p-3">Status</th><th className="p-3 text-right">Review</th></tr></thead><tbody className="divide-y">{!sellerApplications.length ? <tr><td colSpan={6} className="p-8 text-center text-slate-400">No seller applications received yet.</td></tr> : sellerApplications.map((application) => <tr key={application.id}><td className="p-3 font-bold">{application.applicant_name}</td><td className="p-3">{application.business_name}</td><td className="p-3">{application.category || '-'}</td><td className="p-3"><p>{application.email}</p><p className="text-slate-400">{application.phone}</p></td><td className="p-3"><Badge status={application.status}>{application.status}</Badge></td><td className="p-3 text-right">{application.status === 'Pending' ? <div className="inline-flex gap-2"><button onClick={() => reviewSellerApplication(application, 'Rejected')} className="rounded-lg border border-red-200 px-3 py-2 font-bold text-red-600">Reject</button><button onClick={() => reviewSellerApplication(application, 'Approved')} className="rounded-lg bg-emerald-600 px-3 py-2 font-bold text-white">Approve & Register</button></div> : <span className="font-bold text-slate-500">Reviewed</span>}</td></tr>)}</tbody></table></div></div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Store & Owner</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Products</th>
                <th className="p-3.5">Revenue</th>
                <th className="p-3.5">Commission</th>
                <th className="p-3.5">Rating</th>
                <th className="p-3.5">Verification</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {!filteredSellers.length ? <tr><td colSpan={9} className="p-10 text-center text-slate-400">No sellers found. Add a seller to create both the store record and portal login.</td></tr> : filteredSellers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">{(s.sellerImage || s.seller_image) && <img src={s.sellerImage || s.seller_image} alt={s.sellerName} className="h-9 w-9 rounded-lg object-cover"/>}<div><p className="font-extrabold text-slate-900">{s.storeName}</p><p className="text-[10px] text-slate-400">Owner: {s.sellerName}</p><p className="mt-0.5 text-[10px] text-slate-500">{s.stock_seller_sell || s.stockSellerSell || 'No categories assigned'}</p></div></div>
                  </td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{s.email}</p>
                    <p className="text-[10px] text-slate-400">{s.phone}</p>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{Number(s.productsCount || 0)} items</td>
                  <td className="p-3.5 font-black text-emerald-600">Rs {Number(s.revenue || 0).toLocaleString('en-PK')}</td>
                  <td className="p-3.5 font-bold text-slate-800">{s.commissionRate ?? s.commission_rate ?? 10}%</td>
                  <td className="p-3.5 font-bold text-amber-600 flex items-center gap-1">
                    <Star size={12} className="fill-amber-400 text-amber-400" /> {s.ratings ?? s.rating ?? 5}
                  </td>
                  <td className="p-3.5">
                    <Badge status={s.verificationStatus}>{s.verificationStatus}</Badge>
                  </td>
                  <td className="p-3.5">
                    <Badge status={s.status}>{s.status}</Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <ActionMenu
                      buttonTitle="Seller actions"
                      actions={[
                        { label: 'Inspect store', icon: Store, onClick: () => setSelectedSeller(s) },
                        {
                          label: s.verificationStatus === 'Pending' ? 'Approve & Verify' : 'Open details',
                          icon: CheckCircle2,
                          onClick: async () => {
                            try { await updateSellerStatus(s.id, 'Active', 'Verified'); } catch (error) { window.alert(error.message); }
                            setSelectedSeller(s);
                          }
                        },
                        {
                          label: s.status === 'Suspended' ? 'Un-suspend store' : 'Suspend store',
                          icon: ShieldAlert,
                          variant: s.status === 'Suspended' ? 'default' : 'danger',
                          onClick: async () => {
                            try { await updateSellerStatus(s.id, s.status === 'Suspended' ? 'Active' : 'Suspended', s.status === 'Suspended' ? 'Verified' : 'Suspended'); } catch (error) { window.alert(error.message); }
                            setSelectedSeller(s);
                          }
                        },
                        {
                          label: 'Delete seller', icon: Trash2, variant: 'danger', onClick: async () => {
                            if (!window.confirm(`Delete ${s.storeName} and its seller login permanently?`)) return;
                            try { await deleteSeller(s.id); if (selectedSeller?.id === s.id) setSelectedSeller(null); } catch (error) { window.alert(error.message); }
                          }
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Become a Seller Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl max-h-[90vh] overflow-y-auto w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Add Seller</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="mb-2 block font-bold text-slate-700">Product categories *</label>
                <div className="grid max-h-36 grid-cols-2 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
                  {categories.filter((category) => String(category.status || 'Active').toLowerCase() === 'active').map((category) => { const label = category.name; const checked = formData.selectedCategories.includes(label); return <label key={category.id || label} className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold ${checked ? 'bg-red-50 text-[#E8262A]' : 'bg-white text-slate-600'}`}><input type="checkbox" checked={checked} onChange={() => setFormData({ ...formData, selectedCategories: checked ? formData.selectedCategories.filter((item) => item !== label) : [...formData.selectedCategories, label] })} className="accent-[#E8262A]" />{label}</label>; })}
                  {!categories.length && <p className="col-span-full text-xs text-slate-400">Create categories in the Categories section first.</p>}
                </div>
                <p className="mt-1 text-[10px] text-slate-500">Select every category this seller is allowed to sell.</p>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700">Store name *</label>
                <input required value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="w-full px-3 py-2 border rounded-xl font-semibold" placeholder="e.g. Atif Books & Watches" />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.sellerName}
                  onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2"><div><label className="block font-bold text-slate-700 mb-1">Contact Person *</label><input required value={formData.contact} onChange={(e)=>setFormData({...formData,contact:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div><div><label className="block font-bold text-slate-700 mb-1">Phone *</label><input required value={formData.phone} onChange={(e)=>setFormData({...formData,phone:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div></div>
              <div><label className="block font-bold text-slate-700 mb-1">Address *</label><textarea required value={formData.address} onChange={(e)=>setFormData({...formData,address:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Seller Image <span className="font-normal text-slate-400">(optional)</span></label><input type="file" accept="image/*" onChange={(e)=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>setFormData({...formData,sellerImage:reader.result});reader.readAsDataURL(file)}} className="w-full px-3 py-2 border rounded-xl font-semibold" />
                </div>
              </div>
              <div><label className="block font-bold text-slate-700 mb-1">Description *</label><textarea required value={formData.description} onChange={(e)=>setFormData({...formData,description:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div>
              <div className="grid grid-cols-2 gap-2"><div><label className="block font-bold text-slate-700 mb-1">Commission %</label><input required min="0" max="100" step="0.5" type="number" value={formData.commissionRate} onChange={(e)=>setFormData({...formData,commissionRate:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div><div><label className="block font-bold text-slate-700 mb-1">Seller Rating (1–5)</label><input required min="1" max="5" step="0.1" type="number" value={formData.ratings} onChange={(e)=>setFormData({...formData,ratings:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div></div>
              <div className="grid grid-cols-2 gap-2"><div><label className="block font-bold text-slate-700 mb-1">Username *</label><input required value={formData.username} onChange={(e)=>setFormData({...formData,username:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div><div><label className="block font-bold text-slate-700 mb-1">Password *</label><input required type="password" value={formData.password} onChange={(e)=>setFormData({...formData,password:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div></div>

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
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-md cursor-pointer disabled:cursor-wait disabled:opacity-70"
                >
                  {isSaving && <LoaderCircle size={14} className="animate-spin" />}{isSaving ? 'Saving securely…' : 'Add Seller'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seller Detail Drawer Modal */}
      {selectedSeller && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Seller Store File: {selectedSeller.storeName}</h3>
              <button onClick={() => setSelectedSeller(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border">
              <p><span className="text-slate-400">Owner Name:</span> <strong>{selectedSeller.sellerName}</strong></p>
              <p><span className="text-slate-400">Email:</span> <strong>{selectedSeller.email}</strong></p>
              <p><span className="text-slate-400">Payout Account:</span> <strong>{selectedSeller.payoutMethod}</strong></p>
              <p><span className="text-slate-400">Categories:</span> <strong>{selectedSeller.stock_seller_sell || selectedSeller.stockSellerSell || '-'}</strong></p>
              <p><span className="text-slate-400">Total Revenue:</span> <strong className="text-emerald-600">Rs {Number(selectedSeller.revenue || 0).toLocaleString('en-PK')}</strong></p>
              <p><span className="text-slate-400">Platform Commission Rate:</span> <strong>{selectedSeller.commissionRate ?? selectedSeller.commission_rate ?? 10}%</strong></p>
              <p><span className="text-slate-400">Admin Rating:</span> <strong className="text-amber-600">★ {selectedSeller.ratings ?? selectedSeller.rating ?? 5}</strong></p>
            </div>

            <div className="flex flex-wrap gap-2 justify-between pt-3 border-t">
              {selectedSeller.verificationStatus === 'Pending' && (
                <button
                  onClick={() => {
                    updateSellerStatus(selectedSeller.id, 'Active', 'Verified');
                    setSelectedSeller(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Approve & Verify Vendor
                </button>
              )}

              {selectedSeller.status !== 'Suspended' ? (
                <button
                  onClick={() => {
                    updateSellerStatus(selectedSeller.id, 'Suspended', 'Suspended');
                    setSelectedSeller(null);
                  }}
                  className="px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 cursor-pointer"
                >
                  Suspend Store
                </button>
              ) : (
                <button
                  onClick={() => {
                    updateSellerStatus(selectedSeller.id, 'Active', 'Verified');
                    setSelectedSeller(null);
                  }}
                  className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Un-suspend Store
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellersView;
