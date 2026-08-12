import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  RotateCcw,
  Users,
  Megaphone,
  Radio,
  TrendingUp,
  UserCheck,
  Store,
  ShieldCheck,
  DollarSign,
  Receipt,
  Server,
  UsersRound,
  Truck,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Store as StoreIcon,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, storeName = 'Apexiums', logoSrc, onLogout }) => {
  const { activeTab, setActiveTab, activeSubTab, setActiveSubTab, notifications, currentUser } = useAdmin();

  // Collapsible accordion sub-menus
  const [openSection, setOpenSection] = useState('catalog');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? '' : section);
  };

  const handleNav = (tab, subTab = '') => {
    setActiveTab(tab);
    if (subTab) setActiveSubTab(subTab);
    if (onClose) onClose();
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      type: 'single'
    },
    {
      id: 'catalog',
      label: 'Catalog',
      icon: Package,
      type: 'group',
      children: [
        { id: 'categories', label: 'Categories', icon: Layers },
        { id: 'stock', label: 'Stock / Inventory', icon: Boxes },
        { id: 'products', label: 'Product Listing', icon: Package }
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingCart,
      type: 'group',
      children: [
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'returns', label: 'Returns', icon: RotateCcw },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'expenses', label: 'Expense', icon: Receipt }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      type: 'group',
      children: [
        { id: 'banners', label: 'Banners', icon: Megaphone },
        { id: 'ads', label: 'Ads Campaigns', icon: Radio }
      ]
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: Store,
      type: 'group',
      children: [
        { id: 'investors', label: 'Investors', icon: TrendingUp },
        { id: 'staff', label: 'Staff Management', icon: UserCheck },
        { id: 'sellers', label: 'Sellers / Vendors', icon: Store },
        { id: 'permissions', label: 'Permissions & Roles', icon: ShieldCheck }
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: DollarSign,
      type: 'group',
      children: [
        { id: 'revenue', label: 'Revenue', icon: DollarSign },
        { id: 'software-fees', label: 'Software Fees', icon: Server },
        { id: 'staff-salaries', label: 'Staff Salaries', icon: UsersRound },
        { id: 'delivery-expenses', label: 'Delivery Expenses', icon: Truck }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      type: 'single',
      badge: unreadCount > 0 ? unreadCount : null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo & Mobile Close */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <img src={logoSrc} alt={storeName} className="w-10 h-10 rounded-xl bg-white object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 font-black text-xl">
                A
              </div>
            )}
            <div>
              <h1 className="text-base font-black tracking-tight text-white leading-tight">
                {storeName}
              </h1>
              <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase">
                Admin Marketplace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Main Menu
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;

            if (item.type === 'single') {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            }

            // Group Accordion
            const isGroupActive =
              activeTab === item.id ||
              item.children.some((c) => c.id === activeTab || c.id === activeSubTab);
            const isExpanded = openSection === item.id || isGroupActive;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => toggleSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
                    isGroupActive
                      ? 'bg-slate-800/90 text-white'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isGroupActive ? 'text-red-500' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={14} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={14} className="text-slate-400" />
                  )}
                </button>

                {/* Children Items */}
                {isExpanded && (
                  <div className="pl-9 pr-1 space-y-1 py-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = activeTab === child.id || activeSubTab === child.id;

                      return (
                        <button
                          key={child.id}
                          onClick={() => handleNav(child.id, child.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-[11px] transition-colors cursor-pointer ${
                            isChildActive
                              ? 'bg-red-600/15 text-red-400 font-bold border-l-2 border-red-500'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          }`}
                        >
                          <ChildIcon size={14} className={isChildActive ? 'text-red-400' : 'text-slate-500'} />
                          <span>{child.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            System & Account
          </div>

          {/* Profile */}
          <button
            onClick={() => handleNav('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <User size={18} />
            <span>Profile</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNav('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </div>

        {/* Footer User Avatar Profile */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate">
                  {currentUser.role}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
