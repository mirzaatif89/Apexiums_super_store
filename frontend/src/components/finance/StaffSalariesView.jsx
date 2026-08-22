import React, { useMemo, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { CalendarDays, CheckCircle2, DollarSign, Users } from 'lucide-react';

export const StaffSalariesView = () => {
  const { staff, staffSalaries, markStaffSalaryPaid } = useAdmin();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  const salaryRows = useMemo(() => staffSalaries
    .filter((salary) => !selectedMonth || String(salary.salary_month || '').slice(0, 7) === selectedMonth)
    .filter((salary) => !selectedDate || String(salary.paid_date || '').slice(0, 10) === selectedDate)
    .sort((a, b) => String(b.paid_date || b.created_at || '').localeCompare(String(a.paid_date || a.created_at || ''))), [staffSalaries, selectedMonth, selectedDate]);

  const monthRows = staffSalaries.filter((salary) => String(salary.salary_month || '').slice(0, 7) === selectedMonth);
  const totalMonthlyPayroll = monthRows.reduce((sum, salary) => sum + Number(salary.base_salary || 0) + Number(salary.bonus || 0) - Number(salary.deductions || 0), 0);
  const totalPaid = monthRows.filter((salary) => String(salary.payment_status).toLowerCase() === 'paid').reduce((sum, salary) => sum + Number(salary.base_salary || 0) + Number(salary.bonus || 0) - Number(salary.deductions || 0), 0);

  const handleMarkPaid = async (salary) => {
    setSavingId(salary.id);
    setError('');
    try {
      await markStaffSalaryPaid(salary.id, new Date().toISOString().slice(0, 10));
    } catch (paymentError) {
      setError(paymentError.message || 'Salary could not be marked as paid.');
    } finally {
      setSavingId(null);
    }
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><h2 className="text-2xl font-black tracking-tight text-slate-900">Staff Payroll & Salary Disbursements</h2><p className="text-xs font-medium text-slate-500">Review staff salaries, record payments, and check transfer history by month or date.</p></div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="text-[10px] font-bold uppercase text-slate-500">Salary Month<input type="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"/></label>
        <label className="text-[10px] font-bold uppercase text-slate-500">Paid Date<input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"/></label>
        <button type="button" onClick={() => { setSelectedMonth(currentMonth); setSelectedDate(''); }} className="self-end rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Reset Filters</button>
      </div>
    </div>
    {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div> : null}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4 shadow-xs"><Users className="mb-2 text-blue-600" size={20}/><p className="text-[10px] font-bold uppercase text-slate-400">Active Team Members</p><p className="text-xl font-black text-slate-900">{staff.filter((member) => member.status === 'Active').length} Employees</p></div>
      <div className="rounded-2xl border border-red-100 bg-gradient-to-br from-white to-red-50 p-4 shadow-xs"><DollarSign className="mb-2 text-red-600" size={20}/><p className="text-[10px] font-bold uppercase text-slate-400">Monthly Payroll</p><p className="text-xl font-black text-slate-900">Rs {totalMonthlyPayroll.toLocaleString('en-PK')}</p></div>
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50 p-4 shadow-xs"><CheckCircle2 className="mb-2 text-emerald-600" size={20}/><p className="text-[10px] font-bold uppercase text-slate-400">Paid This Month</p><p className="text-xl font-black text-emerald-600">Rs {totalPaid.toLocaleString('en-PK')}</p></div>
    </div>
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <div className="flex items-center gap-2 border-b p-4"><CalendarDays className="text-red-600" size={18}/><h3 className="text-sm font-extrabold text-slate-900">Salary Payment History</h3></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs">
        <thead><tr className="border-b bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500"><th className="p-3.5">Employee</th><th className="p-3.5">Role / Department</th><th className="p-3.5">Salary Month</th><th className="p-3.5">Net Salary</th><th className="p-3.5">Paid Date</th><th className="p-3.5">Status</th><th className="p-3.5 text-right">Action</th></tr></thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {!salaryRows.length ? <tr><td colSpan={7} className="p-10 text-center text-slate-400">No salary records found for the selected period.</td></tr> : salaryRows.map((salary) => {
            const member = staff.find((item) => String(item.id) === String(salary.staff_id));
            const netSalary = Number(salary.base_salary || 0) + Number(salary.bonus || 0) - Number(salary.deductions || 0);
            const paid = String(salary.payment_status).toLowerCase() === 'paid';
            return <tr key={salary.id} className="hover:bg-slate-50"><td className="p-3.5"><p className="font-extrabold text-slate-900">{salary.staff_name}</p><p className="text-[10px] text-slate-400">{member?.email || `Staff ID: ${salary.staff_id}`}</p></td><td className="p-3.5"><p className="font-bold text-slate-800">{member?.role || 'Staff'}</p><p className="text-[10px] text-slate-400">{member?.department || salary.notes || 'General Operations'}</p></td><td className="p-3.5 font-bold">{salary.salary_month}</td><td className="p-3.5 font-black text-slate-900">Rs {netSalary.toLocaleString('en-PK')}</td><td className="p-3.5 text-slate-500">{salary.paid_date ? String(salary.paid_date).slice(0, 10) : 'Not paid'}</td><td className="p-3.5"><Badge status={paid ? 'Active' : 'Pending'}>{paid ? 'Paid' : 'Pending'}</Badge></td><td className="p-3.5 text-right">{paid ? <span className="font-bold text-emerald-600">Completed</span> : <button type="button" disabled={savingId === salary.id} onClick={() => handleMarkPaid(salary)} className="rounded-lg bg-red-600 px-3 py-2 font-bold text-white hover:bg-red-700 disabled:opacity-60">{savingId === salary.id ? 'Saving...' : 'Mark as Paid'}</button>}</td></tr>;
          })}
        </tbody>
      </table></div>
    </div>
  </div>;
};

export default StaffSalariesView;
