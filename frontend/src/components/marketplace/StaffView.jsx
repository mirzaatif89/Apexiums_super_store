import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import ActionMenu from '../common/ActionMenu';
import { UserCheck, Plus, Trash2, Edit2, X, UserRound, Mail, Phone, BriefcaseBusiness, LockKeyhole } from 'lucide-react';

export const StaffView = () => {
  const { staff, addStaffMember, updateStaffMember, deleteStaffMember } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'Staff',
    department: 'Customer Support & Returns',
    salary: '',
    status: 'Active'
  });

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormError('');
    setFormData({
      name: '',
      email: '',
      phone: '', password: '',
      role: 'Staff',
      department: 'Customer Support & Returns',
      salary: '',
      status: 'Active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingStaff(s);
    setFormError('');
    setFormData({
      name: s.name,
      email: s.email,
      phone: s.phone || '', password: '',
      role: 'Staff',
      department: s.department,
      salary: '',
      status: s.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return setFormError('Full name and email are required.');
    if (!editingStaff && !formData.password) return setFormError('Set a temporary password for the new staff member.');
    if (!editingStaff && Number(formData.salary) <= 0) return setFormError('Enter a valid monthly salary.');
    setIsSaving(true); setFormError('');
    try {
      const staffData = { ...formData, role: 'Staff' };
      if (editingStaff) await updateStaffMember(editingStaff.id, staffData);
      else await addStaffMember(staffData);
      setIsModalOpen(false);
    } catch (error) { setFormError(error.message || 'Unable to save staff member.'); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff & Team Management</h2>
          <p className="text-xs text-slate-500 font-medium">Manage marketplace operations team, roles, departments, and system access.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus size={16} /> Add Staff Member
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Name & Email</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {!staff.length ? <tr><td colSpan={6} className="p-10 text-center text-slate-400">No staff members added yet. Click <strong>Add Staff Member</strong> to create your first team account.</td></tr> : staff.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <p className="font-bold text-slate-900">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.email}</p>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{s.role}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{s.department}</td>
                  <td className="p-3.5 font-medium text-slate-500">{s.joinedDate}</td>
                  <td className="p-3.5">
                    <Badge status={s.status}>{s.status}</Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <ActionMenu
                      buttonTitle="Staff actions"
                      actions={[
                        { label: 'Edit staff', icon: Edit2, onClick: () => handleOpenEdit(s) },
                        { label: 'Delete staff', icon: Trash2, variant: 'danger', onClick: () => deleteStaffMember(s.id) }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-red-100 max-w-xl w-full overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
              <div><h3 className="text-base font-black text-slate-900">{editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}</h3><p className="text-[11px] mt-1 text-slate-500">Create a team profile and control their access.</p></div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 font-semibold">{formError}</div>}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative"><UserRound size={15} className="absolute left-3 top-2.5 text-slate-400"/><input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-red-500"
                /></div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative"><Mail size={15} className="absolute left-3 top-2.5 text-slate-400"/><input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-red-500"
                /></div>
              </div>

              <div className="grid grid-cols-2 gap-3"><div><label className="block font-bold text-slate-700 mb-1">Phone Number</label><div className="relative"><Phone size={15} className="absolute left-3 top-2.5 text-slate-400"/><input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="0300 0000000" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-red-500"/></div></div><div><label className="block font-bold text-slate-700 mb-1">{editingStaff ? 'New Password' : 'Temporary Password *'}</label><div className="relative"><LockKeyhole size={15} className="absolute left-3 top-2.5 text-slate-400"/><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder={editingStaff ? 'Leave blank to keep current' : 'Set password'} className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-red-500"/></div></div></div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                  <input
                    value="Staff"
                    readOnly
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-100 text-slate-600 font-semibold cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <div className="relative"><BriefcaseBusiness size={15} className="absolute left-3 top-2.5 text-slate-400"/><input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-red-500"
                  /></div>
                </div>
              </div>

              <div><label className="block font-bold text-slate-700 mb-1">Account Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-red-500"><option>Active</option><option>Inactive</option></select></div>

              {!editingStaff ? <div><label className="block font-bold text-slate-700 mb-1">Monthly Salary (Rs) *</label><input type="number" min="1" step="0.01" required value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} placeholder="Enter monthly salary" className="w-full px-3 py-2 border border-slate-200 rounded-xl font-semibold focus:outline-none focus:border-red-500"/></div> : null}

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
                  disabled={isSaving} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Saving...' : 'Save Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffView;
