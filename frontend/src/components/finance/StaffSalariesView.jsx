import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { Users, DollarSign, CheckCircle2, Play } from 'lucide-react';

export const StaffSalariesView = () => {
  const { staff } = useAdmin();
  const [payrollStatus, setPayrollStatus] = useState('Disbursed');

  const totalMonthlyPayroll = staff.length * 4500;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Payroll & Salary Disbursements</h2>
          <p className="text-xs text-slate-500 font-medium">Monthly staff payroll distribution, departmental salaries, and tax withholding tracking.</p>
        </div>
        <button
          onClick={() => alert('Payroll disbursement batch processed successfully!')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
        >
          <Play size={14} /> Process Monthly Payroll
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Active Team Members</p>
          <p className="text-xl font-black text-slate-900">{staff.length} Employees</p>
          <p className="text-[10px] text-emerald-600 font-bold">100% Payroll Covered</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Payroll Obligation</p>
          <p className="text-xl font-black text-slate-900">${totalMonthlyPayroll.toLocaleString()}</p>
          <p className="text-[10px] text-blue-600 font-bold">Auto-disbursed on 1st</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
          <p className="text-[10px] uppercase font-bold text-slate-400">Payroll Cycle Status</p>
          <p className="text-xl font-black text-emerald-600">Disbursed (Aug 2026)</p>
          <p className="text-[10px] text-slate-400 font-bold">Next Run: Sep 01, 2026</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Monthly Base Salary</th>
                <th className="p-3.5">Disbursement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {staff.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <p className="font-extrabold text-slate-900">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.email}</p>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{s.role}</td>
                  <td className="p-3.5 font-semibold text-slate-700">{s.department}</td>
                  <td className="p-3.5 font-black text-slate-900">${(4000 + (idx + 1) * 500).toLocaleString()}</td>
                  <td className="p-3.5">
                    <Badge status="Active">Paid / Disbursed</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffSalariesView;
