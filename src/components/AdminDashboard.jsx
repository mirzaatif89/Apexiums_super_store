import React from 'react';
import { AdminProvider, useAdmin } from '../context/AdminContext';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import ToastContainer from './layout/ToastContainer';
import GlobalSearchModal from './layout/GlobalSearchModal';

// Views
import DashboardView from './dashboard/DashboardView';
import ProductListing from './catalog/ProductListing';
import CategoriesView from './catalog/CategoriesView';
import StockManagement from './catalog/StockManagement';
import OrdersView from './sales/OrdersView';
import ReturnsView from './sales/ReturnsView';
import CustomersView from './sales/CustomersView';
import BannersView from './marketing/BannersView';
import AdsView from './marketing/AdsView';
import InvestorsView from './marketplace/InvestorsView';
import StaffView from './marketplace/StaffView';
import SellersView from './marketplace/SellersView';
import PermissionsView from './marketplace/PermissionsView';
import BusinessAccountsView from './marketplace/BusinessAccountsView';
import RevenueView from './finance/RevenueView';
import ExpensesView from './finance/ExpensesView';
import SoftwareFeesView from './finance/SoftwareFeesView';
import StaffSalariesView from './finance/StaffSalariesView';
import DeliveryExpensesView from './finance/DeliveryExpensesView';
import NotificationsView from './common/NotificationsView';
import ChatsView from './common/ChatsView';
import SettingsView from './common/SettingsView';
import { isSuperAdminRole } from '../utils/roles';

const AdminDashboardContent = ({ session, storeName, logoSrc, onLogout }) => {
  const { activeTab, hasPermission } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const renderActiveView = () => {
    const tabPermissions = { dashboard: 'viewDashboard', products: 'manageProducts', categories: 'manageCategories', stock: 'manageStock', orders: 'manageOrders', returns: 'manageReturns', customers: 'manageCustomers', banners: 'manageMarketing', ads: 'manageMarketing', investors: 'manageInvestors', staff: 'manageStaff', sellers: 'manageSellers', revenue: 'manageFinance', expenses: 'manageFinance', 'software-fees': 'manageFinance', 'staff-salaries': 'manageFinance', 'delivery-expenses': 'manageFinance', chats: 'manageChats', notifications: 'viewNotifications', settings: 'manageSettings' };
    if (['permissions', 'business-accounts'].includes(activeTab) && !isSuperAdminRole(session?.role)) {
      return <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"><h2 className="text-lg font-black text-red-800">SuperAdmin access required</h2><p className="mt-1 text-xs text-red-600">You do not have permission to open this module.</p></div>;
    }
    if (tabPermissions[activeTab] && !hasPermission(tabPermissions[activeTab])) {
      return <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center"><h2 className="text-lg font-black text-amber-800">Access denied</h2><p className="mt-1 text-xs text-amber-700">Ask SuperAdmin to enable this permission for your role.</p></div>;
    }
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'products':
        return <ProductListing />;
      case 'categories':
        return <CategoriesView />;
      case 'stock':
        return <StockManagement />;
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
        {/* Top Header */}
        <Header
          session={session}
          onLogout={onLogout}
          onToggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />

        {/* Scrollable View Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
