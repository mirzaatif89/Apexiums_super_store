import React from 'react';
import { Building2, Plus, Power, Trash2, X } from 'lucide-react';
import ActionMenu from '../common/ActionMenu';

const emptyForm = {
  business_name: '',
  owner_name: '',
  username: '',
  password: '',
  email: '',
  phone: ''
};

export default function BusinessAccountsView({ session }) {
  const [accounts, setAccounts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [showForm, setShowForm] = React.useState(false);
  const [form, setForm] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);

  const headers = React.useMemo(() => ({
    'Content-Type': 'application/json',
    'x-user-role': session?.role || 'SuperAdmin'
  }), [session?.role]);

  const loadAccounts = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/business-accounts', { headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load business accounts');
      setAccounts(data.rows || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [headers]);

  React.useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  async function createAccount(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/business-accounts', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...form, role: 'BusinessAdmin', status: 'Active' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create business account');
      setForm(emptyForm);
      setShowForm(false);
      await loadAccounts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(account) {
    setError('');
    try {
      const response = await fetch(`/api/business-accounts/${account.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: account.status === 'Active' ? 'Inactive' : 'Active' })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to update account');
      await loadAccounts();
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteAccount(account) {
    if (Number(account.id) === 1 || !window.confirm(`Delete ${account.business_name}?`)) return;
    setError('');
    try {
      const response = await fetch(`/api/business-accounts/${account.id}`, { method: 'DELETE', headers });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to delete account');
      setAccounts((current) => current.filter((item) => item.id !== account.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">Business Accounts</h2>
          <p className="text-xs font-medium text-slate-500">SuperAdmin control for all marketplace business administrators.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700">
          <Plus size={16} /> Add Business Admin
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-white">
              <tr><th className="p-4">Business</th><th className="p-4">Login</th><th className="p-4">Contact</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4 text-right">Controls</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading accounts...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">No business accounts found.</td></tr>
              ) : accounts.map((account) => (
                <tr key={account.id} className="hover:bg-slate-50">
                  <td className="p-4"><div className="flex items-center gap-2"><Building2 size={16} className="text-red-600" /><div><p className="font-bold text-slate-900">{account.business_name}</p><p className="text-[10px] text-slate-500">{account.owner_name || 'No owner name'}</p></div></div></td>
                  <td className="p-4 font-semibold text-slate-700">{account.username}</td>
                  <td className="p-4"><p>{account.email || '—'}</p><p className="text-[10px] text-slate-500">{account.phone || ''}</p></td>
                  <td className="p-4 font-semibold">{account.role}</td>
                  <td className="p-4"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${account.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{account.status}</span></td>
                  <td className="p-4 text-right">
                    <ActionMenu
                      buttonTitle="Business account actions"
                      actions={[
                        { label: account.status === 'Active' ? 'Deactivate account' : 'Activate account', icon: Power, onClick: () => updateStatus(account) },
                        { label: 'Delete account', icon: Trash2, variant: 'danger', onClick: () => deleteAccount(account), disabled: Number(account.id) === 1 }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form onSubmit={createAccount} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-black text-slate-900">Create Business Admin</h3><p className="text-xs text-slate-500">This account can manage its own business data.</p></div><button type="button" onClick={() => setShowForm(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[['business_name', 'Business name *'], ['owner_name', 'Owner name'], ['username', 'Username *'], ['password', 'Password *'], ['email', 'Email'], ['phone', 'Phone']].map(([key, label]) => (
                <label key={key} className="space-y-1 text-xs font-bold text-slate-700"><span>{label}</span><input type={key === 'password' ? 'password' : key === 'email' ? 'email' : 'text'} required={['business_name', 'username', 'password'].includes(key)} value={form[key]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 font-medium outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600">Cancel</button><button disabled={saving} className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-60">{saving ? 'Creating...' : 'Create Account'}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}
