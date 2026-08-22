import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { isSuperAdminRole } from '../../utils/roles';
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
  MessageSquare,
  User,
  Settings,
  BadgePercent,
  LogOut,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose, storeName = 'Apexiums', logoSrc, onLogout, session }) => {
  const { activeTab, setActiveTab, activeSubTab, setActiveSubTab, notifications, currentUser, hasPermission } = useAdmin();
  const isSuperAdmin = isSuperAdminRole(session?.role || currentUser.role);

  // Collapsible accordion sub-menus
  const [openSections, setOpenSections] = useState(() =>
    isSuperAdmin ? ['catalog', 'sales', 'marketing', 'marketplace', 'finance', 'notifications'] : ['catalog']
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleSection = (section) => {
    setOpenSections((sections) =>
      sections.includes(section)
        ? sections.filter((item) => item !== section)
        : [...sections, section]
    );
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
      type: 'single',
      permission: 'viewDashboard'
    },
    {
      id: 'catalog',
      label: 'Catalog',
      icon: Package,
      type: 'group',
      children: [
        { id: 'products', label: 'Product Listing', icon: Package, permission: 'manageProducts' },
        { id: 'categories', label: 'Categories', icon: Layers, permission: 'manageCategories' },
        { id: 'stock', label: 'Stock', icon: Boxes, permission: 'manageStock' },
        { id: 'suppliers', label: 'Suppliers', icon: Truck, permission: 'manageStock' }
      ]
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: ShoppingCart,
      type: 'group',
      children: [
        { id: 'orders', label: 'Orders', icon: ShoppingCart, permission: 'manageOrders' },
        { id: 'returns', label: 'Returns', icon: RotateCcw, permission: 'manageReturns' },
        { id: 'customers', label: 'Customers', icon: Users, permission: 'manageCustomers' }
      ]
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      type: 'group',
      children: [
        { id: 'banners', label: 'Website Banner', icon: Megaphone, permission: 'manageMarketing' },
        { id: 'ads', label: 'APP Banner', icon: Radio, permission: 'manageMarketing' },
        { id: 'coupons', label: 'Coupons', icon: BadgePercent, permission: 'manageMarketing' }
      ]
    },
    {
      id: 'marketplace',
      label: 'Marketplace',
      icon: Store,
      type: 'group',
      children: [
        { id: 'investors', label: 'Investors', icon: TrendingUp, permission: 'manageInvestors' },
        { id: 'staff', label: 'Staff', icon: UserCheck, permission: 'manageStaff' },
        { id: 'sellers', label: 'Sellers', icon: Store, permission: 'manageSellers' },
        ...(isSuperAdmin ? [{ id: 'permissions', label: 'Permissions', icon: ShieldCheck }] : [])
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: DollarSign,
      type: 'group',
      children: [
        { id: 'revenue', label: 'Revenue', icon: DollarSign, permission: 'manageFinance' },
        { id: 'expenses', label: 'Expense', icon: Receipt, permission: 'manageFinance' },
        { id: 'software-fees', label: 'Software Fees', icon: Server, permission: 'manageFinance' },
        { id: 'staff-salaries', label: 'Staff Salaries', icon: UsersRound, permission: 'manageFinance' },
        { id: 'delivery-expenses', label: 'Delivery Expenses', icon: Truck, permission: 'manageFinance' }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      type: 'group',
      children: [
        { id: 'chats', label: 'Chats', icon: MessageSquare, permission: 'manageChats' },
        { id: 'sellers', label: 'Become a Seller', icon: Store, permission: 'manageSellers' },
        { id: 'investors', label: 'Become an Investor', icon: TrendingUp, permission: 'manageInvestors' },
        { id: 'notifications', label: 'All Notifications', icon: Bell, permission: 'viewNotifications', badge: unreadCount > 0 ? unreadCount : null }
      ]
    }
  ];
  const visibleMenuItems = menuItems
    .map((item) => item.type === 'group' ? { ...item, children: item.children.filter((child) => !child.permission || hasPermission(child.permission)) } : item)
    .filter((item) => item.type === 'group' ? item.children.length > 0 : !item.permission || hasPermission(item.permission));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white text-slate-700 border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo & Mobile Close */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <img src={logoSrc} alt={storeName} className="w-10 h-10 rounded-xl bg-white object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 font-black text-xl">
                A
              </div>
            )}
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900 leading-tight">
                {storeName}
              </h1>
              <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase">
                Admin Marketplace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-red-50 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Menu
          </div>

          {visibleMenuItems.map((item) => {
            const Icon = item.icon;

            if (item.type === 'single') {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-900/30'
                      : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
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
            const isExpanded = openSections.includes(item.id) || isGroupActive;

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => toggleSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
                    isGroupActive
                      ? 'bg-red-50 text-red-700'
                      : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
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
                              ? 'bg-red-500/15 text-red-300 font-bold border-l-2 border-red-400'
                              : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                        >
                          <ChildIcon size={14} className={isChildActive ? 'text-red-400' : 'text-slate-500'} />
                          <span className="flex-1 text-left">{child.label}</span>
                          {child.badge && (
                            <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white">
                              {child.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            System & Account
          </div>

          {/* Profile */}
          <button
            onClick={() => handleNav('profile')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <User size={18} />
            <span>Profile</span>
          </button>

          {/* Settings */}
          {(isSuperAdmin || hasPermission('manageSettings')) && <button
            onClick={() => handleNav('settings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-lg shadow-red-900/30'
                : 'text-slate-600 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>}
        </div>

        {/* Footer User Avatar Profile */}
        <div className="p-4 border-t border-slate-200 bg-red-50/40 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" />
              ) : (
                <div className="flex w-9 h-9 items-center justify-center rounded-full border border-slate-700 bg-red-600 text-xs font-black text-white shrink-0">
                  {(currentUser.name || 'A').trim().charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
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
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
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
