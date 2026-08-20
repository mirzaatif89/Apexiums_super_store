import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initialCategories,
  initialSellers,
  initialProducts,
  initialOrders,
  initialReturns,
  initialCustomers,
  initialBanners,
  initialAds,
  initialStaff,
  initialRolesPermissions,
  initialFinanceData,
  initialNotifications,
  initialSettings
} from '../data/mockAdminData';
import { isSuperAdminRole, roleKey } from '../utils/roles';

const AdminContext = createContext();

const defaultChats = [];

const pageBySlug = {
  dashboard: 'dashboard', products: 'products', categories: 'categories', stock: 'stock',
  'website-banner': 'banners', 'app-banner': 'ads', orders: 'orders', returns: 'returns', customers: 'customers',
  investors: 'investors', staff: 'staff', sellers: 'sellers', permissions: 'permissions',
  'business-accounts': 'business-accounts', revenue: 'revenue', expenses: 'expenses',
  'software-fees': 'software-fees', 'staff-salaries': 'staff-salaries', 'delivery-expenses': 'delivery-expenses',
  notifications: 'notifications', chats: 'chats', settings: 'settings', profile: 'profile'
};

function getInitialAdminPage() {
  if (typeof window === 'undefined') return 'dashboard';
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, '');
  return pageBySlug[slug] || 'dashboard';
}

function loadRegisteredCustomers() {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('apexiums-registered-users') || '[]').map((user, index) => ({
      id: user.id || `CUST-REG-${index + 1}`,
      name: user.name || user.username || 'Customer',
      username: user.username || user.email || '',
      password: user.password || '',
      email: user.email || '',
      phone: user.phone || '',
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: 'No orders yet',
      status: 'Active',
      avatar: user.avatar || 'https://ui-avatars.com/api/?background=fee2e2&color=dc2626&name=Customer',
      city: user.city || '',
      joinDate: user.joinDate || new Date().toISOString().split('T')[0]
    }));
  } catch {
    return [];
  }
}

export const AdminProvider = ({ children, session }) => {
  // Navigation & Active View State
  const [activeTab, setActiveTab] = useState(getInitialAdminPage);
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
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [ads, setAds] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [staff, setStaff] = useState([]);
  const [rolesPermissions, setRolesPermissions] = useState(() => {
    if (typeof localStorage === 'undefined') return initialRolesPermissions;
    try {
      return JSON.parse(localStorage.getItem('apexiums-role-permissions') || 'null') || initialRolesPermissions;
    } catch {
      return initialRolesPermissions;
    }
  });
  const [finance, setFinance] = useState({ summary: { totalRevenue: 0, grossSales: 0, sellerRevenue: 0, platformCommission: 0, netRevenue: 0 }, expensesList: [], softwareFees: [], staffSalaries: [], deliveryExpenses: [] });
  const [notifications, setNotifications] = useState([]);
  const [stockRecords, setStockRecords] = useState([]);
  const [chats, setChats] = useState(() => {
    if (typeof localStorage === 'undefined') return defaultChats;
    try { return [...JSON.parse(localStorage.getItem('apexiums-support-chats') || '[]'), ...defaultChats]; } catch { return defaultChats; }
  });
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    let active = true;
    fetch('/api/investors?limit=500', { headers: apiHeaders() })
      .then((response) => response.ok ? response.json() : { rows: [] })
      .then((data) => {
        if (!active) return;
        setInvestors((data.rows || []).map((row) => ({
          ...row,
          investmentAmount: Number(row.investment_amount || 0),
          totalReturnsPaid: Number(row.total_returns_paid || 0),
          contactPerson: row.contact_person || row.name || '',
          returnRate: Number(row.return_rate || 0),
          equityShare: row.equity_share || '0%'
        })));
      })
      .catch(() => { if (active) setInvestors([]); });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    const syncChats = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('apexiums-support-chats') || '[]');
        setChats((current) => [...stored, ...current.filter((chat) => !stored.some((item) => item.id === chat.id))]);
      } catch { /* Ignore invalid local support data. */ }
    };
    window.addEventListener('storage', syncChats);
    window.addEventListener('apexiums-chat-created', syncChats);
    return () => { window.removeEventListener('storage', syncChats); window.removeEventListener('apexiums-chat-created', syncChats); };
  }, []);

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const headers = { 'x-user-role': session?.role || '' };
        if (session?.businessId) headers['x-business-id'] = String(session.businessId);
        const response = await fetch('/api/notifications?limit=100', { headers });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.rows)) return;
        const rows = data.rows.map((row) => ({ id: `api-${row.id}`, title: row.title, message: row.message, type: row.type, date: row.created_at || '', time: row.created_at || '', read: Boolean(row.is_read), actionUrl: row.entity_type === 'order' ? 'orders' : row.entity_type === 'return' ? 'returns' : 'notifications' }));
        setNotifications((current) => [...rows, ...current.filter((item) => !rows.some((row) => row.id === item.id))]);
      } catch { /* Keep local notifications when the API is unavailable. */ }
    };
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      try {
        const headers = { 'x-user-role': session?.role || '' };
        if (session?.businessId) headers['x-business-id'] = String(session.businessId);
        const response = await fetch('/api/orders?limit=200', { headers });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.rows)) return;
        const detailedRows = await Promise.all(data.rows.map(async (row) => {
          try { const detailResponse = await fetch(`/api/orders/${row.id}`, { headers }); return detailResponse.ok ? await detailResponse.json() : row; } catch { return row; }
        }));
        if (!active) return;
        const apiOrders = detailedRows.map((row) => ({ id: `ORD-${row.id}`, customerName: row.customer_name || 'Customer', customerEmail: row.customer_email || '', customerPhone: row.customer_phone || '', products: (row.items || []).map((item) => ({ id: item.product_id, name: item.product_name, qty: Number(item.qty || 1), price: Number(item.price || 0), image: item.image_url || '' })), sellerName: 'Marketplace', totalAmount: Number(row.total_amount || 0), paymentStatus: row.payment_status || 'Pending', orderStatus: row.order_status || 'Pending', orderDate: row.created_at ? new Date(row.created_at).toLocaleDateString() : '', shippingAddress: row.shipping_address || '', paymentMethod: row.payment_method || '', deliveryCourier: 'Unassigned', timeline: [{ title: 'Order Placed', time: row.created_at || '', done: true }, { title: row.order_status || 'Pending', time: 'Current status', done: false }] }));
        setOrders((current) => [...apiOrders, ...current.filter((item) => !apiOrders.some((api) => api.id === item.id))]);
      } catch { /* Keep local order data when API is unavailable. */ }
    };
    loadOrders();
    const interval = window.setInterval(loadOrders, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    const loadChats = async () => {
      try {
        const headers = { 'x-user-role': session?.role || '' };
        if (session?.businessId) headers['x-business-id'] = String(session.businessId);
        const response = await fetch('/api/chats?limit=200', { headers });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.rows)) return;
        const apiChats = data.rows.map((row) => ({ id: `api-${row.id}`, customerName: row.sender_name, customerEmail: row.sender_type || 'Customer', message: row.message, reply: row.reply_message || '', status: row.status || 'Open', date: row.created_at || '' }));
        setChats((current) => [...apiChats, ...current.filter((item) => !apiChats.some((api) => api.id === item.id))]);
      } catch { /* Keep local chats when API is unavailable. */ }
    };
    loadChats();
    const interval = window.setInterval(loadChats, 15000);
    return () => { active = false; window.clearInterval(interval); };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    const loadCustomers = async () => {
      try {
        const headers = { 'x-user-role': session?.role || '' };
        if (session?.businessId) headers['x-business-id'] = String(session.businessId);
        const response = await fetch('/api/customers?limit=500', { headers });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.rows)) return;
        const apiCustomers = data.rows.map((row) => ({ id: row.id, name: row.name, username: row.username, password: row.plain_password, email: row.email || '', phone: row.phone || '', totalOrders: Number(row.total_orders || 0), totalSpent: Number(row.total_spent || 0), lastOrderDate: row.last_order_date || 'No orders yet', status: row.status || 'Active', avatar: row.avatar_url || 'https://ui-avatars.com/api/?background=fee2e2&color=dc2626&name=Customer', city: row.city || '', joinDate: row.created_at || '' }));
        setCustomers((current) => [...apiCustomers, ...current.filter((item) => !apiCustomers.some((api) => String(api.id) === String(item.id) || (api.email && api.email === item.email)))]);
      } catch { /* Keep local customer data when API is unavailable. */ }
    };
    loadCustomers();
    const interval = window.setInterval(loadCustomers, 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [session?.role, session?.businessId]);

  // User Profile
  const [currentUser, setCurrentUser] = useState(() => ({
    name: session?.name || session?.owner_name || session?.username || 'Administrator',
    email: session?.email || '',
    role: isSuperAdminRole(session?.role) ? 'Super Admin' : session?.role || 'Admin',
    avatar: session?.avatar || '',
    department: session?.department || (isSuperAdminRole(session?.role) ? 'Executive Board' : 'Administration')
  }));
  const hasPermission = (permission) => {
    const normalizedCurrentRole = roleKey(session?.role || currentUser.role);
    if (['superadmin', 'businessadmin', 'admin', 'manager'].includes(normalizedCurrentRole)) return true;
    const role = rolesPermissions.find((item) => roleKey(item.role) === normalizedCurrentRole);
    return Boolean(role?.permissions?.[permission]);
  };
  const apiHeaders = () => {
    const headers = { 'Content-Type': 'application/json', 'x-user-role': session?.role || '' };
    if (session?.businessId) headers['x-business-id'] = String(session.businessId);
    return headers;
  };

  // The database is the source of truth for the admin catalog. Empty states are
  // intentional until the administrator creates real records.
  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        const headers = apiHeaders();
        const [productResponse, categoryResponse, stockResponse] = await Promise.all([
          fetch('/api/products?limit=500', { headers }),
          fetch('/api/categories?limit=500', { headers }),
          fetch('/api/stock?limit=500', { headers })
        ]);
        const [productData, categoryData, stockData] = await Promise.all([
          productResponse.ok ? productResponse.json() : { rows: [] },
          categoryResponse.ok ? categoryResponse.json() : { rows: [] },
          stockResponse.ok ? stockResponse.json() : { rows: [] }
        ]);
        if (!active) return;
        const rows = Array.isArray(productData.rows) ? productData.rows : [];
        const stockRows = Array.isArray(stockData.rows) ? stockData.rows : [];
        setProducts(rows.map((row) => ({
          ...row,
          id: row.id,
          name: row.name || '',
          price: Number(row.discounted_price ?? row.base_price ?? row.actual_price ?? 0),
          realPrice: Number(row.actual_price ?? row.base_price ?? 0),
          discountedPrice: Number(row.discounted_price ?? row.base_price ?? 0),
          stock: Number(row.stock_qty ?? stockRows.find((stock) => String(stock.product_id) === String(row.id))?.quantity ?? 0),
          minStock: Number(row.min_stock ?? 10),
          status: Number(row.stock_qty ?? stockRows.find((stock) => String(stock.product_id) === String(row.id))?.quantity ?? 0) === 0 ? 'Out of Stock' : (row.status || 'Active'),
          image: row.image_url || '',
          subcategory: row.subcategory || '',
          images: (() => { try { return row.product_images ? JSON.parse(row.product_images) : []; } catch { return []; } })()
          ,colors: (() => { try { return JSON.parse(row.product_detail || '{}').colors || ''; } catch { return ''; } })()
          ,sizes: (() => { try { return JSON.parse(row.product_detail || '{}').sizes || ''; } catch { return ''; } })()
        })));
        setCategories((Array.isArray(categoryData.rows) ? categoryData.rows : []).map((row) => ({
          ...row,
          image: row.image_url || row.image || '',
          slug: row.slug || (row.name || '').toLowerCase().trim().replace(/\s+/g, '-'),
          parent: row.parent || row.parent_name || '',
          subcategories: Array.isArray(row.subcategories) ? row.subcategories : (() => { try { return row.subcategories ? JSON.parse(row.subcategories) : []; } catch { return []; } })()
        })));
        setStockRecords(stockRows.map((row) => ({
          ...row,
          id: row.id,
          productId: row.product_id,
          productName: row.product_name || '',
          totalItems: Number(row.total_items || 0),
          stockBelongTo: row.stock_belong_to || '',
          quantity: Number(row.quantity || 0),
          description: row.description || ''
        })));
      } catch { /* Keep empty state when the API is unavailable. */ }
    };
    loadCatalog();
    return () => { active = false; };
  }, [session?.role, session?.businessId]);

  // --- CRUD Handlers ---

  // Products
  const addProduct = async (newProd) => {
    const effectiveStatus = Number(newProd.stock) === 0 ? 'Out of Stock' : (newProd.status || 'Active');
    const product = {
      ...newProd,
      status: effectiveStatus,
      id: `p-${Date.now()}`,
      dateAdded: new Date().toISOString().split('T')[0],
      stock: Number(newProd.stock) || 0,
      price: Number(newProd.price) || 0,
      discount: Number(newProd.discount) || 0
    };
    const response = await fetch('/api/products', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ name: product.name, sku: product.sku || null, category: product.category || null, subcategory: product.subcategory || null, product_images: JSON.stringify(product.images || []), product_detail: JSON.stringify({ colors: product.colors || '', sizes: product.sizes || '' }), description: product.description || null, actual_price: Number(product.realPrice || product.price) || 0, base_price: Number(product.realPrice || product.price) || 0, discounted_price: Number(product.discountedPrice || product.price) || 0, stock_qty: Number(product.stock) || 0, image_url: product.image || null, status: product.status || 'Active', slug: product.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') }) });
    if (!response.ok) throw new Error((await response.json().catch(() => ({}))).message || 'Product could not be saved to the database.');
    const saved = await response.json();
    setProducts((prev) => [{ ...product, ...saved, id: saved.id, dateAdded: new Date().toISOString().split('T')[0] }, ...prev]);
    addToast(`Product "${product.name}" saved in database.`, 'success');
  };

  const updateProduct = async (id, updatedFields) => {
    const existing = products.find((p) => String(p.id) === String(id)) || {};
    const mergedFields = { ...existing, ...updatedFields };
    const effectiveStatus = Number(mergedFields.stock) === 0 ? 'Out of Stock' : (mergedFields.status || 'Active');
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...mergedFields, status: effectiveStatus } : p))
    );
    if (!String(id).startsWith('p-')) await fetch(`/api/products/${id}`, { method: 'PUT', headers: apiHeaders(), body: JSON.stringify({ name: mergedFields.name, sku: mergedFields.sku || null, category: mergedFields.category || null, description: mergedFields.description || null, actual_price: Number(mergedFields.realPrice ?? mergedFields.price) || 0, base_price: Number(mergedFields.realPrice ?? mergedFields.price) || 0, discounted_price: Number(mergedFields.discountedPrice ?? mergedFields.price) || 0, stock_qty: Number(mergedFields.stock) || 0, image_url: mergedFields.image || null, status: effectiveStatus }) });
    addToast('Product details updated successfully!', 'success');
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (!String(id).startsWith('p-')) fetch(`/api/products/${id}`, { method: 'DELETE', headers: apiHeaders() }).catch(() => {});
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

  const addStockRecord = (record) => {
    const product = products.find((item) => String(item.id) === String(record.productId));
    const quantity = Number(record.quantity) || 0;
    setStockRecords((current) => [{
      ...record,
      id: `STK-${Date.now()}`,
      productName: product?.name || `Product ${record.productId}`,
      totalItems: Number(record.totalItems) || quantity,
      quantity
    }, ...current]);
    if (product) updateProductStock(product.id, product.stock + quantity);
    fetch('/api/stock', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ product_id: record.productId, product_name: product?.name || '', total_items: Number(record.totalItems) || quantity, stock_belong_to: record.stockBelongTo, quantity, description: record.description }) }).catch(() => {});
    addToast('Stock entry added successfully.', 'success');
  };
  const deleteStockRecord = (record) => {
    setStockRecords((current) => current.filter((item) => item.id !== record.id));
    if (record.productId) updateProductStock(record.productId, 0);
    addToast('Stock removed successfully.', 'info');
  };

  // Categories
  const addCategory = async (cat) => {
    const newCat = {
      ...cat,
      id: `cat-${Date.now()}`,
      productCount: 0,
      subcategories: cat.subcategories || []
    };
    const response = await fetch('/api/categories', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ name: cat.name, parent_id: cat.parent || null, image_url: cat.image || null, description: cat.description || null, subcategories: JSON.stringify(cat.subcategories || []), status: cat.status || 'Active' }) });
    if (!response.ok) throw new Error('Category could not be saved to the database.');
    const saved = await response.json();
    setCategories((prev) => [{ ...newCat, ...saved, id: saved.id, subcategories: cat.subcategories || [] }, ...prev]);
    addToast(`Category "${newCat.name}" added.`, 'success');
  };

  const updateCategory = async (id, catData) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...catData } : c))
    );
    if (!String(id).startsWith('cat-')) {
      const response = await fetch(`/api/categories/${id}`, { method: 'PUT', headers: apiHeaders(), body: JSON.stringify({ name: catData.name, parent_id: catData.parent || null, image_url: catData.image || null, description: catData.description || null, subcategories: JSON.stringify(catData.subcategories || []), status: catData.status || 'Active' }) });
      if (!response.ok) throw new Error('Category image/details could not be saved to the database.');
    }
    addToast('Category updated.', 'success');
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (!String(id).startsWith('cat-')) fetch(`/api/categories/${id}`, { method: 'DELETE', headers: apiHeaders() }).catch(() => {});
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
    if (String(id).startsWith('ORD-') && /^ORD-\d+$/.test(String(id))) {
      fetch(`/api/orders/${String(id).replace('ORD-', '')}/status`, { method: 'PUT', headers: apiHeaders(), body: JSON.stringify({ order_status: newStatus }) }).catch(() => {});
    }
    addToast(`Order ${id} status changed to ${newStatus}.`, 'success');
  };

  const deleteOrder = async (id) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    const numericId = String(id).replace('ORD-', '');
    if (/^\d+$/.test(numericId)) await fetch(`/api/orders/${numericId}`, { method: 'DELETE', headers: apiHeaders() }).catch(() => {});
    addToast(`Order ${id} deleted.`, 'info');
  };

  const createReturnFromOrder = (order) => {
    const item = order.products?.[0] || {};
    const newReturn = {
      id: `RET-${Date.now()}`,
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail || '',
      productName: item.name || 'Order items',
      sellerName: order.sellerName || '',
      reason: 'Return created from order actions',
      amount: Number(order.totalAmount) || 0,
      status: 'Requested',
      date: new Date().toISOString().split('T')[0],
      images: []
    };
    setReturns((current) => current.some((item) => item.orderId === order.id) ? current : [newReturn, ...current]);
    updateOrderStatus(order.id, 'Returned');
    setNotifications((current) => [{ id: `notif-${Date.now()}`, title: `Return created (${order.id})`, message: `${order.customerName}'s order was moved to Returns.`, type: 'Return Request', date: new Date().toLocaleString(), read: false, actionUrl: 'returns' }, ...current]);
    fetch('/api/returns', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ order_id: Number(String(order.id).replace(/\D/g, '')) || null, product_id: item.id || null, customer: order.customerName, product: item.name || 'Order items', reason: newReturn.reason, status: 'Requested', refund_amount: newReturn.amount }) }).catch(() => {});
    addToast(`${order.id} moved to Returns.`, 'success');
  };

  // Returns
  const updateReturnStatus = (id, newStatus) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
    if (/^RET-\d+$/.test(String(id))) fetch(`/api/returns/${String(id).replace('RET-', '')}/status`, { method: 'PUT', headers: apiHeaders(), body: JSON.stringify({ status: newStatus }) }).catch(() => {});
    addToast(`Return ${id} set to ${newStatus}.`, 'success');
  };

  const addReturn = (returnData) => {
    setReturns((current) => [{ ...returnData, id: `RET-${Date.now()}`, status: returnData.status || 'Requested', date: returnData.date || new Date().toISOString().split('T')[0], images: [] }, ...current]);
    fetch('/api/returns', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ order_id: Number(String(returnData.orderId).replace(/\D/g, '')) || null, customer: returnData.customerName, product: returnData.productName, reason: returnData.reason, status: returnData.status || 'Requested', refund_amount: Number(returnData.amount) || 0 }) }).catch(() => {});
    addToast('Manual return added successfully.', 'success');
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
    fetch('/api/wholesellers', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ name: sellerData.sellerName, business_name: sellerData.storeName || sellerData.stockSellerSell, contact_person: sellerData.contact, phone: sellerData.phone, email: sellerData.email, address: sellerData.address, description: sellerData.description, seller_image: sellerData.sellerImage, stock_seller_sell: sellerData.stockSellerSell, username: sellerData.username, password: sellerData.password, status: sellerData.status || 'Pending' }) }).catch(() => {});
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
    fetch('/api/investors', { method: 'POST', headers: apiHeaders(), body: JSON.stringify({ name: invData.name, email: invData.email, phone: invData.phone, address: invData.address, investment_amount: Number(invData.investmentAmount) || 0, investment_date: invData.investmentDate, description: invData.description, username: invData.username, password: invData.password, status: invData.status || 'Pending' }) }).catch(() => {});
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
    setRolesPermissions((prev) => {
      const next = prev.map((r) => {
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
      });
      if (typeof localStorage !== 'undefined') localStorage.setItem('apexiums-role-permissions', JSON.stringify(next));
      return next;
    });
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

  const clearAllNotifications = () => setNotifications([]);

  const replyToChat = (id, reply) => {
    setChats((current) => current.map((chat) => chat.id === id ? { ...chat, reply, status: 'Replied' } : chat));
    if (String(id).startsWith('api-')) {
      const headers = { 'Content-Type': 'application/json', 'x-user-role': session?.role || '' };
      if (session?.businessId) headers['x-business-id'] = String(session.businessId);
      fetch(`/api/chats/${String(id).replace('api-', '')}`, { method: 'PUT', headers, body: JSON.stringify({ reply_message: reply, status: 'Replied' }) }).catch(() => {});
    }
    addToast('Reply sent to customer.', 'success');
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
        hasPermission,
        setCurrentUser,
        categories,
        sellers,
        products,
        stockRecords,
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
        chats,
        settings,
        // Methods
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        updateProductStock,
        bulkDeleteProducts,
        bulkUpdateProductStatus,
        addStockRecord,
        deleteStockRecord,
        addCategory,
        updateCategory,
        deleteCategory,
        updateOrderStatus,
        deleteOrder,
        createReturnFromOrder,
        updateReturnStatus,
        addReturn,
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
        clearAllNotifications,
        replyToChat,
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
