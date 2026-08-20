import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import StatCard from '../common/StatCard';
import Badge from '../common/Badge';
import ActionMenu from '../common/ActionMenu';
import { TrendingUp, Plus, DollarSign, Users, CheckCircle2, X } from 'lucide-react';

export const InvestorsView = () => {
  const { investors, addInvestor, updateInvestorStatus } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState(null);

  const totalInvestment = investors.reduce((sum, i) => sum + i.investmentAmount, 0);
  const totalReturns = investors.reduce((sum, i) => sum + i.totalReturnsPaid, 0);
  const activeInvestorsCount = investors.filter((i) => i.status === 'Active').length;
  const pendingInvestorsCount = investors.filter((i) => i.status === 'Pending' || i.status === 'Pending Approval').length;

  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    investmentAmount: 100000,
    investmentDate: new Date().toISOString().split('T')[0],
    description: '',
    username: '',
    password: '',
    returnRate: 12.0,
    equityShare: '5%',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    addInvestor({
      ...formData,
      contactPerson: formData.name,
      notes: formData.description,
      status: 'Active'
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Investor Portfolio & Capital Registry</h2>
          <p className="text-xs text-slate-500 font-medium">Manage equity holdings, angel syndicate participations, and return distributions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus size={16} /> Register Investor
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Capital Raised"
          value={`Rs ${totalInvestment.toLocaleString('en-PK')}`}
          trend="up"
          description="Equity & convertible notes"
          icon={DollarSign}
          accentColor="purple"
        />
        <StatCard
          title="Active Investors"
          value={activeInvestorsCount.toString()}
          trend="up"
          description="Institutional & Syndicate"
          icon={Users}
          accentColor="blue"
        />
        <StatCard
          title="Returns Distributed"
          value={`Rs ${totalReturns.toLocaleString('en-PK')}`}
          trend="up"
          description="Quarterly payouts"
          icon={TrendingUp}
          accentColor="emerald"
        />
        <StatCard
          title="Pending Applications"
          value={`${pendingInvestorsCount} Pending`}
          trend="down"
          description="Awaiting board review"
          icon={CheckCircle2}
          accentColor="amber"
        />
      </div>

      {/* Investors Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Investor Entity</th>
                <th className="p-3.5">Contact Person</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Password</th>
                <th className="p-3.5">Investment Amount</th>
                <th className="p-3.5">Total Returns Paid</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {investors.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-extrabold text-slate-900">{inv.name}</td>
                  <td className="p-3.5">
                    <p className="font-bold text-slate-800">{inv.contactPerson}</p>
                    <p className="text-[10px] text-slate-400">{inv.email}</p>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-slate-800">{inv.username || '—'}</td>
                  <td className="p-3.5 font-mono font-bold text-slate-800">{inv.password || '—'}</td>
                  <td className="p-3.5 font-black text-purple-700">Rs {inv.investmentAmount.toLocaleString('en-PK')}</td>
                  <td className="p-3.5 font-black text-slate-900">Rs {inv.totalReturnsPaid.toLocaleString('en-PK')}</td>
                  <td className="p-3.5">
                    <Badge status={inv.status}>{inv.status}</Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <ActionMenu
                      buttonTitle="Investor actions"
                      actions={[
                        { label: 'Portfolio file', icon: TrendingUp, onClick: () => setSelectedInvestor(inv) },
                        {
                          label: inv.status === 'Pending Approval' ? 'Approve investment' : 'Mark active',
                          icon: CheckCircle2,
                          onClick: () => {
                            updateInvestorStatus(inv.id, 'Active');
                            setSelectedInvestor(inv);
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

      {/* Register Investor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl max-h-[90vh] overflow-y-auto w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Register New Investor</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Investor / Firm Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                  placeholder="e.g. Apexium Venture Fund"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl font-semibold"
                  placeholder="Email Address"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div><label className="block font-bold text-slate-700 mb-1">Phone *</label><input required value={formData.phone} onChange={(e)=>setFormData({...formData,phone:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Investment Date *</label><input required type="date" value={formData.investmentDate} onChange={(e)=>setFormData({...formData,investmentDate:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div>
              </div>
              <div><label className="block font-bold text-slate-700 mb-1">Address *</label><textarea required value={formData.address} onChange={(e)=>setFormData({...formData,address:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div>
              <div><label className="block font-bold text-slate-700 mb-1">Description</label><textarea value={formData.description} onChange={(e)=>setFormData({...formData,description:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div>
              <div className="grid grid-cols-2 gap-2"><div><label className="block font-bold text-slate-700 mb-1">Username *</label><input required value={formData.username} onChange={(e)=>setFormData({...formData,username:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div><div><label className="block font-bold text-slate-700 mb-1">Password *</label><input required type="password" value={formData.password} onChange={(e)=>setFormData({...formData,password:e.target.value})} className="w-full px-3 py-2 border rounded-xl font-semibold" /></div></div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Investment Amount (PKR)</label>
                  <input
                    type="number"
                    value={formData.investmentAmount}
                    onChange={(e) => setFormData({ ...formData, investmentAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl font-semibold"
                  />
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
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Investor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Investor Detail File Modal */}
      {selectedInvestor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Investor Profile: {selectedInvestor.name}</h3>
              <button onClick={() => setSelectedInvestor(null)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border">
              <p><span className="text-slate-400">Contact:</span> <strong>{selectedInvestor.contactPerson} ({selectedInvestor.email})</strong></p>
              <p><span className="text-slate-400">Total Investment:</span> <strong className="text-purple-700">Rs {selectedInvestor.investmentAmount.toLocaleString('en-PK')}</strong></p>
              <p><span className="text-slate-400">Notes:</span> <strong>{selectedInvestor.notes || 'N/A'}</strong></p>
            </div>

            {selectedInvestor.status === 'Pending Approval' && (
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => {
                    updateInvestorStatus(selectedInvestor.id, 'Active');
                    setSelectedInvestor(null);
                  }}
                  className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Approve Investment Proposal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorsView;
