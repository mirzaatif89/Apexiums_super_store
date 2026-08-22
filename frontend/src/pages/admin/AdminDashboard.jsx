import React from 'react';
import { Search } from 'lucide-react';
import { CalendarDays } from 'lucide-react';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import Sidebar from '../../components/layout/Sidebar';
import ToastContainer from '../../components/layout/ToastContainer';
import GlobalSearchModal from '../../components/layout/GlobalSearchModal';

// Views
import DashboardView from '../../components/dashboard/DashboardView';
import ProductListing from '../../components/catalog/ProductListing';
import CategoriesView from '../../components/catalog/CategoriesView';
import StockManagement from '../../components/catalog/StockManagement';
import SuppliersView from '../../components/catalog/SuppliersView';
import OrdersView from '../../components/sales/OrdersView';
import ReturnsView from '../../components/sales/ReturnsView';
import CustomersView from '../../components/sales/CustomersView';
import BannersView from '../../components/marketing/BannersView';
import AdsView from '../../components/marketing/AdsView';
import CouponsView from '../../components/marketing/CouponsView';
import InvestorsView from '../../components/marketplace/InvestorsView';
import StaffView from '../../components/marketplace/StaffView';
import SellersView from '../../components/marketplace/SellersView';
import PermissionsView from '../../components/marketplace/PermissionsView';
import BusinessAccountsView from '../../components/marketplace/BusinessAccountsView';
import RevenueView from '../../components/finance/RevenueView';
import ExpensesView from '../../components/finance/ExpensesView';
import SoftwareFeesView from '../../components/finance/SoftwareFeesView';
import StaffSalariesView from '../../components/finance/StaffSalariesView';
import DeliveryExpensesView from '../../components/finance/DeliveryExpensesView';
import NotificationsView from '../../components/common/NotificationsView';
import ChatsView from '../../components/common/ChatsView';
import SettingsView from '../../components/common/SettingsView';
import { isSuperAdminRole } from '../../utils/roles';

const AdminDashboardContent = ({ session, storeName, logoSrc, onLogout }) => {
  const { activeTab, setActiveTab, hasPermission, setIsSearchOpen } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState('');

  const pageSlugs = {
    dashboard: 'dashboard', products: 'products', categories: 'categories', stock: 'stock', suppliers: 'suppliers',
    orders: 'orders', returns: 'returns', customers: 'customers', banners: 'website-banner', ads: 'app-banner', coupons: 'coupons',
    investors: 'investors', staff: 'staff', sellers: 'sellers', permissions: 'permissions',
    'business-accounts': 'business-accounts', revenue: 'revenue', expenses: 'expenses',
    'software-fees': 'software-fees', 'staff-salaries': 'staff-salaries', 'delivery-expenses': 'delivery-expenses',
    notifications: 'notifications', chats: 'chats', settings: 'settings', profile: 'profile'
  };

  React.useEffect(() => {
    const slugToPage = Object.fromEntries(Object.entries(pageSlugs).map(([page, slug]) => [slug, page]));
    const requestedPage = slugToPage[window.location.pathname.replace(/^\/+|\/+$/g, '')];
    if (requestedPage && requestedPage !== activeTab) setActiveTab(requestedPage);

    const handleBrowserNavigation = () => {
      const page = slugToPage[window.location.pathname.replace(/^\/+|\/+$/g, '')] || 'dashboard';
      setActiveTab(page);
    };
    window.addEventListener('popstate', handleBrowserNavigation);
    return () => window.removeEventListener('popstate', handleBrowserNavigation);
  }, []);

  React.useEffect(() => {
    const nextPath = `/${pageSlugs[activeTab] || 'dashboard'}`;
    if (window.location.pathname !== nextPath) window.history.pushState({ page: activeTab }, '', nextPath);
  }, [activeTab]);

  React.useEffect(() => {
    const pageNames = {
      dashboard: 'Dashboard', products: 'Product Listing', categories: 'Categories', stock: 'Stock', suppliers: 'Suppliers',
      orders: 'Orders', returns: 'Returns', customers: 'Customers', banners: 'Website Banner', ads: 'APP Banner', coupons: 'Coupons',
      investors: 'Investors', staff: 'Staff', sellers: 'Sellers', permissions: 'Permissions',
      'business-accounts': 'Business Accounts', revenue: 'Revenue', expenses: 'Expense',
      'software-fees': 'Software Fees', 'staff-salaries': 'Staff Salaries', 'delivery-expenses': 'Delivery Expenses',
      notifications: 'All Notifications', chats: 'Chats', settings: 'Settings', profile: 'Profile'
    };
    document.title = `${pageNames[activeTab] || 'Admin'} | ${storeName} Admin`;
  }, [activeTab, storeName]);

  const renderActiveView = () => {
    const tabPermissions = { dashboard: 'viewDashboard', products: 'manageProducts', categories: 'manageCategories', stock: 'manageStock', suppliers: 'manageStock', orders: 'manageOrders', returns: 'manageReturns', customers: 'manageCustomers', banners: 'manageMarketing', ads: 'manageMarketing', coupons: 'manageMarketing', investors: 'manageInvestors', staff: 'manageStaff', sellers: 'manageSellers', revenue: 'manageFinance', expenses: 'manageFinance', 'software-fees': 'manageFinance', 'staff-salaries': 'manageFinance', 'delivery-expenses': 'manageFinance', chats: 'manageChats', notifications: 'viewNotifications', settings: 'manageSettings' };
    if (['permissions', 'business-accounts'].includes(activeTab) && !isSuperAdminRole(session?.role)) {
      return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><h2 className="text-lg font-black text-red-800">SuperAdmin access required</h2><p className="mt-1 text-xs text-red-600">You do not have permission to open this module.</p></div>;
    }
    if (tabPermissions[activeTab] && !hasPermission(tabPermissions[activeTab])) {
      return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center"><h2 className="text-lg font-black text-amber-800">Access denied</h2><p className="mt-1 text-xs text-amber-700">Ask SuperAdmin to enable this permission for your role.</p></div>;
    }
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView selectedDate={selectedDate} />;
      case 'products':
        return <ProductListing />;
      case 'categories':
        return <CategoriesView />;
      case 'stock':
        return <StockManagement />;
      case 'suppliers':
        return <SuppliersView />;
      case 'orders':
        return <OrdersView />;
      case 'returns':
        return <ReturnsView />;
      case 'customers':
        return <CustomersView />;
      case 'banners':
        return <BannersView />;
      case 'ads':
        return <AdsView />;
      case 'coupons':
        return <CouponsView />;
      case 'investors':
        return <InvestorsView />;
      case 'staff':
        return <StaffView />;
      case 'sellers':
        return <SellersView />;
      case 'permissions':
        return <PermissionsView />;
      case 'business-accounts':
        return <BusinessAccountsView session={session} />;
      case 'revenue':
        return <RevenueView />;
      case 'expenses':
        return <ExpensesView />;
      case 'software-fees':
        return <SoftwareFeesView />;
      case 'staff-salaries':
        return <StaffSalariesView />;
      case 'delivery-expenses':
        return <DeliveryExpensesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'chats':
        return <ChatsView />;
      case 'settings':
      case 'profile':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 overflow-hidden antialiased">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        storeName={storeName}
        logoSrc={logoSrc}
        onLogout={onLogout}
        session={session}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeTab === 'dashboard' && <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex w-full max-w-xs items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-left text-xs font-semibold text-slate-500 shadow-sm hover:border-slate-300 hover:bg-slate-50"
            >
              <Search size={16} className="shrink-0 text-slate-400" />
              <span>Search products, orders, sellers...</span>
              <span className="ml-auto rounded bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">Ctrl+K</span>
            </button>
            <label title="Filter by date" className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-500 shadow-sm hover:border-slate-300 hover:bg-slate-50">
              <CalendarDays size={18} className="text-slate-500" />
              <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Filter by date" />
            </label>
          </div>}
          {renderActiveView()}
        </main>
      </div>

      {/* Global Utilities */}
      <ToastContainer />
      <GlobalSearchModal />
    </div>
  );
};

export default function AdminDashboard(props) {
  return (
    <AdminProvider session={props.session}>
      <AdminDashboardContent {...props} />
    </AdminProvider>
  );
}
