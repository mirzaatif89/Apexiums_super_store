import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Badge from '../common/Badge';
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

export const NotificationsView = () => {
  const { notifications, markNotificationRead, clearAllNotifications } = useAdmin();
  const [filterType, setFilterType] = useState('All');

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'Unread') return !n.read;
    if (filterType === 'Alerts') return n.type === 'alert' || n.type === 'warning';
    return true;
  });

  const getIcon = (type) => {
    if (type === 'warning' || type === 'alert') return <AlertTriangle size={16} className="text-amber-500 shrink-0" />;
    if (type === 'success') return <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />;
    return <Info size={16} className="text-blue-500 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Notification Center & System Alerts</h2>
          <p className="text-xs text-slate-500 font-medium">Real-time marketplace webhooks, low stock alerts, vendor requests, and dispute logs.</p>
        </div>
        <button
          onClick={clearAllNotifications}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
        >
          <Trash2 size={14} /> Clear All Alerts
        </button>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 text-xs font-bold">
        {['All', 'Unread', 'Alerts'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              filterType === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center text-slate-400 text-xs">
            No notification logs found.
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                !n.read ? 'bg-red-50/30 border-red-200/80 shadow-xs' : 'bg-white border-slate-200/80'
              }`}
            >
              <div className="flex items-start gap-3">
                {getIcon(n.type)}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900">{n.title}</h4>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-red-600" />}
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">{n.time || n.date}</p>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => markNotificationRead(n.id)}
                  className="px-2.5 py-1 rounded-lg bg-white border text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
                >
                  Mark Read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
