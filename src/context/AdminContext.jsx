import React, { createContext, useContext, useState } from 'react';
import {
  initialCategories,
  initialSellers,
  initialProducts,
  initialOrders,
  initialReturns,
  initialCustomers,
  initialBanners,
  initialAds,
  initialInvestors,
  initialStaff,
  initialRolesPermissions,
  initialFinanceData,
  initialNotifications,
  initialSettings
} from '../data/mockAdminData';
import { isSuperAdminRole } from '../utils/roles';

const AdminContext = createContext();

export const AdminProvider = ({ children, session }) => {
  // Navigation & Active View State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('');

  // Date Range Filter State (Today, Last 7 Days, Last 30 Days, This Year, Custom)
  const [dateRange, setDateRange] = useState('Last 30 Days');

  // Global Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Main Data States
  const [categories, setCategories] = useState(initialCategories);
  const [sellers, setSellers] = useState(initialSellers);
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [returns, setReturns] = useState(initialReturns);
  const [customers, setCustomers] = useState(initialCustomers);
  const [banners, setBanners] = useState(initialBanners);
  const [ads, setAds] = useState(initialAds);
  const [investors, setInvestors] = useState(initialInvestors);
  const [staff, setStaff] = useState(initialStaff);
  const [rolesPermissions, setRolesPermissions] = useState(initialRolesPermissions);
  const [finance, setFinance] = useState(initialFinanceData);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [settings, setSettings] = useState(initialSettings);

  // User Profile
  const [currentUser, setCurrentUser] = useState(() => ({
    name: session?.name || session?.owner_name || session?.username || 'Administrator',
    email: session?.email || '',
    role: isSuperAdminRole(session?.role) ? 'Super Admin' : session?.role || 'Admin',
    avatar: session?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    department: session?.department || (isSuperAdminRole(session?.role) ? 'Executive Board' : 'Administration')
  }));

  // --- CRUD Handlers ---

  // Products
  const addProduct = (newProd) => {
    const product = {
      ...newProd,
      id: `p-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
      stock: Number(newProd.stock) || 0,
      price: Number(newProd.price) || 0,
      discount: Number(newProd.discount) || 0
    };
    setProducts((prev) => [product, ...prev]);
    addToast(`Product "${product.name}" created successfully!`, 'success');
  };

  const updateProduct = (id, updatedFields) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p))
    );
    addToast('Product details updated successfully!', 'success');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addToast('Product deleted from inventory.', 'info');
  };

  const duplicateProduct = (id) => {
    const source = products.find((p) => p.id === id);
    if (source) {
      const copy = {
        ...source,
        id: `p-${Date.now()}`,
        name: `${source.name} (Copy)`,
        sku: `${source.sku}-COPY`,
        dateAdded: new Date().toISOString().split('T')[0]
      };
      setProducts((prev) => [copy, ...prev]);
      addToast(`Product duplicated as "${copy.name}".`, 'success');
    }
  };

  const updateProductStock = (id, newStock) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const numStock = Number(newStock) || 0;
          let status = p.status;
          if (numStock === 0) status = 'Out of Stock';
          else if (status === 'Out of Stock') status = 'Active';
          return { ...p, stock: numStock, status };
        }
        return p;
      })
    );
    addToast('Stock quantity updated.', 'success');
  };

  const bulkDeleteProducts = (ids) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    addToast(`${ids.length} products deleted in bulk.`, 'info');
  };

  const bulkUpdateProductStatus = (ids, newStatus) => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status: newStatus } : p))
    );
    addToast(`Updated status to "${newStatus}" for ${ids.length} products.`, 'success');
  };

  // Categories
  const addCategory = (cat) => {
    const newCat = {
      ...cat,
      id: `cat-${Date.now()}`,
      productCount: 0,
      subcategories: cat.subcategories || []
    };
    setCategories((prev) => [newCat, ...prev]);
    addToast(`Category "${newCat.name}" added.`, 'success');
  };

  const updateCategory = (id, catData) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...catData } : c))
    );
    addToast('Category updated.', 'success');
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addToast('Category removed.', 'info');
  };

  // Orders
  const updateOrderStatus = (id, newStatus, newPaymentStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updated = { ...o, orderStatus: newStatus };
          if (newPaymentStatus) updated.paymentStatus = newPaymentStatus;
          return updated;
        }
        return o;
      })
    );
    addToast(`Order ${id} status changed to ${newStatus}.`, 'success');
  };

  // Returns
  const updateReturnStatus = (id, newStatus) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    addToast(`Return ${id} set to ${newStatus}.`, 'success');
  };

  // Sellers
  const updateSellerStatus = (id, newStatus, newVerification) => {
    setSellers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s };
          if (newStatus) updated.status = newStatus;
          if (newVerification) updated.verificationStatus = newVerification;
          return updated;
        }
        return s;
      })
    );
    addToast(`Seller account status updated to ${newStatus || newVerification}.`, 'success');
  };

  const addSeller = (sellerData) => {
    const newSeller = {
      ...sellerData,
      id: `v-${Date.now()}`,
      productsCount: 0,
      ordersCount: 0,
      revenue: 0,
      ratings: 5.0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setSellers((prev) => [newSeller, ...prev]);
    addToast(`New seller "${newSeller.storeName}" registered!`, 'success');
  };

  // Investors
  const addInvestor = (invData) => {
    const newInv = {
      ...invData,
      id: `inv-${Date.now()}`,
      totalReturnsPaid: 0,
      investmentDate: new Date().toISOString().split('T')[0]
    };
    setInvestors((prev) => [newInv, ...prev]);
    addToast(`Investor "${newInv.name}" added to registry.`, 'success');
  };

  const updateInvestorStatus = (id, newStatus) => {
    setInvestors((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
    );
    addToast(`Investor status updated to ${newStatus}.`, 'success');
  };

  // Staff
  const addStaffMember = (staffData) => {
    const newStaff = {
      ...staffData,
      id: `st-${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setStaff((prev) => [newStaff, ...prev]);
    addToast(`Staff member "${newStaff.name}" created.`, 'success');
  };

  const updateStaffMember = (id, staffData) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...staffData } : s))
    );
    addToast('Staff details updated.', 'success');
  };

  const deleteStaffMember = (id) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    addToast('Staff member deleted.', 'info');
  };

  // Permissions
  const updateRolePermission = (roleName, permissionKey, value) => {
    if (isSuperAdminRole(roleName) && !value) {
      addToast('Super Admin always has full system access.', 'info');
      return;
    }
    setRolesPermissions((prev) =>
      prev.map((r) => {
        if (r.role === roleName) {
          return {
            ...r,
            permissions: {
              ...r.permissions,
              [permissionKey]: value
            }
          };
        }
        return r;
      })
    );
    addToast(`Permission updated for role: ${roleName}`, 'success');
  };

  // Banners & Ads
  const addBanner = (bannerData) => {
    const newBan = { ...bannerData, id: `ban-${Date.now()}` };
    setBanners((prev) => [newBan, ...prev]);
    addToast('New marketing banner published.', 'success');
  };

  const deleteBanner = (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    addToast('Banner removed.', 'info');
  };

  const addAd = (adData) => {
    const newAd = { ...adData, id: `ad-${Date.now()}`, spent: 0, impressions: 0, clicks: 0, ctr: '0.00%' };
    setAds((prev) => [newAd, ...prev]);
    addToast('New ad campaign initialized.', 'success');
  };

  const deleteAd = (id) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
    addToast('Ad campaign deleted.', 'info');
  };

  // Finance
  const addExpense = (expData) => {
    const newExp = {
      ...expData,
      id: `exp-${Date.now()}`,
      amount: Number(expData.amount) || 0,
      date: expData.date || new Date().toISOString().split('T')[0]
    };
    setFinance((prev) => ({
      ...prev,
      expensesList: [newExp, ...prev.expensesList]
    }));
    addToast(`Expense of $${newExp.amount} logged.`, 'success');
  };

  // Notifications
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast('All notifications marked as read.', 'success');
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Marketplace settings updated successfully.', 'success');
  };

  return (
    <AdminContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeSubTab,
        setActiveSubTab,
        dateRange,
        setDateRange,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        toasts,
        addToast,
        removeToast,
        currentUser,
        setCurrentUser,
        categories,
        sellers,
        products,
        orders,
        returns,
        customers,
        banners,
        ads,
        investors,
        staff,
        rolesPermissions,
        finance,
        notifications,
        settings,
        // Methods
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateProductStock,
        bulkDeleteProducts,
        bulkUpdateProductStatus,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        updateReturnStatus,
        updateSellerStatus,
        addSeller,
        addInvestor,
        updateInvestorStatus,
        addStaffMember,
        updateStaffMember,
        deleteStaffMember,
        updateRolePermission,
        addBanner,
        deleteBanner,
        addAd,
        deleteAd,
        addExpense,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        updateSettings
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
