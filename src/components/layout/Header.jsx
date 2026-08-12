import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Menu,
  Search,
  Calendar,
  Bell,
  CheckCheck,
  User,
  Settings,
  Store,
  TrendingUp,
  ChevronDown,
  Sparkles,
  X
} from 'lucide-react';

export const Header = ({ onToggleSidebar }) => {
  const {
    dateRange,
    setDateRange,
    setIsSearchOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveTab,
    currentUser
  } = useAdmin();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.read);

  const dateOptions = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Year', 'Custom Range'];

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left Side: Mobile Menu Toggle & Global Search Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <Menu size={22} />
          </button>

          {/* Quick Search Bar Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 text-xs font-semibold transition-all cursor-pointer w-48 sm:w-72 border border-slate-200/60"
          >
            <Search size={16} className="text-slate-400 shrink-0" />
            <span className="truncate">Search products, orders, sellers...</span>
            <span className="hidden sm:inline-block ml-auto px-1.5 py-0.5 rounded bg-white text-[10px] font-mono font-bold text-slate-400 border border-slate-200 shadow-2xs">
              Ctrl+K
            </span>
          </button>
        </div>

        {/* Right Side: Quick Action CTAs, Date Range Picker, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Become a Seller Quick Button */}
          <button
            onClick={() => setActiveTab('sellers')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200/80 cursor-pointer transition-colors"
          >
            <Store size={14} />
            <span>+ Become Seller</span>
          </button>

          {/* Become an Investor Quick Button */}
          <button
            onClick={() => setActiveTab('investors')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200/80 cursor-pointer transition-colors"
          >
            <TrendingUp size={14} />
            <span>+ Investor Portal</span>
          </button>

          {/* Date Range Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateOpen(!isDateOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer transition-colors"
            >
              <Calendar size={14} className="text-slate-500" />
              <span className="hidden sm:inline">{dateRange}</span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {isDateOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Filter Analytics
                </div>
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRange(opt);
                      setIsDateOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                      dateRange === opt
                        ? 'bg-red-50 text-red-600 font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <Bell size={20} />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-600 text-white text-[9px] font-black px-1 ring-2 ring-white">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-red-400" />
                    <span className="text-xs font-bold">Notifications</span>
                    {unreadNotifs.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-600 text-[10px] font-extrabold">
                        {unreadNotifs.length} new
                      </span>
                    )}
                  </div>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] font-semibold text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={14} /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications present
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          if (n.actionUrl) setActiveTab(n.actionUrl);
                          setIsNotifOpen(false);
                        }}
                        className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                          !n.read ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 leading-snug">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                            {n.message}
                          </p>
                          <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                            {n.date}
                          </span>
                        </div>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-red-600 shrink-0 mt-1.5" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setActiveTab('notifications');
                      setIsNotifOpen(false);
                    }}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Quick Pill */}
          <div
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 pl-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-300"
            />
            <span className="hidden xl:inline text-xs font-bold text-slate-800">
              {currentUser.name}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
