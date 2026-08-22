import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, Lock, Save } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const SettingsView = ({ session }) => {
  const { addToast } = useAdmin();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.newPassword.length < 8) return setError('New password must contain at least 8 characters.');
    if (form.newPassword !== form.confirmPassword) return setError('New password and confirmation do not match.');
    if (form.currentPassword === form.newPassword) return setError('New password must be different from the current password.');
    setSaving(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': session?.role || '',
          'x-account-id': String(session?.id || ''),
          ...(session?.businessId ? { 'x-business-id': String(session.businessId) } : {})
        },
        body: JSON.stringify({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Password could not be changed.');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      addToast('Password changed successfully.', 'success');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-slate-900"><KeyRound className="text-red-500" size={24} /> Change Password</h2>
        <p className="mt-1 text-xs font-medium text-slate-500">Update the password used to sign in to your admin account.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">{error}</div>}
        {[
          ['currentPassword', 'Current Password'],
          ['newPassword', 'New Password'],
          ['confirmPassword', 'Confirm New Password']
        ].map(([name, label]) => (
          <label key={name} className="block text-xs font-bold text-slate-700">{label}
            <div className="relative mt-1.5">
              <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
              <input required type={showPasswords ? 'text' : 'password'} autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-11 font-semibold outline-none focus:border-red-400" />
              <button type="button" onClick={() => setShowPasswords((shown) => !shown)} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700" aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}>{showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}</button>
            </div>
          </label>
        ))}
        <p className="text-[11px] text-slate-500">Use at least 8 characters and keep your password private.</p>
        <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3 text-xs font-black text-white shadow-sm hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"><Save size={16} /> {saving ? 'Changing Password...' : 'Change Password'}</button>
      </form>
    </div>
  );
};

export default SettingsView;
