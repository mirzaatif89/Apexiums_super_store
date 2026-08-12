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
import RevenueView from './finance/RevenueView';
import ExpensesView from './finance/ExpensesView';
import SoftwareFeesView from './finance/SoftwareFeesView';
import StaffSalariesView from './finance/StaffSalariesView';
import DeliveryExpensesView from './finance/DeliveryExpensesView';
import NotificationsView from './common/NotificationsView';
import SettingsView from './common/SettingsView';

const AdminDashboardContent = ({ session, storeName, logoSrc, onLogout }) => {
  const { activeTab } = useAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const renderActiveView = () => {
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
    <AdminProvider>
      <AdminDashboardContent {...props} />
    </AdminProvider>
  );
}
