import React, { createContext, useContext, useEffect, useState } from "react";
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
  initialSettings,
} from "../data/mockAdminData";
import { isSuperAdminRole, roleKey } from "../utils/roles";

const AdminContext = createContext();

const defaultChats = [];

const pageBySlug = {
  dashboard: "dashboard",
  products: "products",
  categories: "categories",
  stock: "stock",
  suppliers: "suppliers",
  coupons: "coupons",
  banners: "banners",
  "website-banner": "banners",
  "app-banner": "banners",
  orders: "orders",
  returns: "returns",
  customers: "customers",
  investors: "investors",
  staff: "staff",
  sellers: "sellers",
  permissions: "permissions",
  "business-accounts": "business-accounts",
  revenue: "revenue",
  expenses: "expenses",
  "software-fees": "software-fees",
  "staff-salaries": "staff-salaries",
  "delivery-expenses": "delivery-expenses",
  notifications: "notifications",
  chats: "chats",
  settings: "settings",
  profile: "profile",
};

function getInitialAdminPage() {
  if (typeof window === "undefined") return "dashboard";
  const slug = window.location.pathname.replace(/^\/+|\/+$/g, "");
  return pageBySlug[slug] || "dashboard";
}

function loadRegisteredCustomers() {
  if (typeof localStorage === "undefined") return [];
  try {
    return JSON.parse(
      localStorage.getItem("apexiums-registered-users") || "[]",
    ).map((user, index) => ({
      id: user.id || `CUST-REG-${index + 1}`,
      name: user.name || user.username || "Customer",
      username: user.username || user.email || "",
      password: user.password || "",
      email: user.email || "",
      phone: user.phone || "",
      totalOrders: 0,
      totalSpent: 0,
      lastOrderDate: "No orders yet",
      status: "Active",
      avatar:
        user.avatar ||
        "https://ui-avatars.com/api/?background=fee2e2&color=dc2626&name=Customer",
      city: user.city || "",
      joinDate: user.joinDate || new Date().toISOString().split("T")[0],
    }));
  } catch {
    return [];
  }
}

export const AdminProvider = ({ children, session }) => {
  // Navigation & Active View State
  const [activeTab, setActiveTab] = useState(getInitialAdminPage);
  const [activeSubTab, setActiveSubTab] = useState("");

  // Date Range Filter State (Today, Last 7 Days, Last 30 Days, This Year, Custom)
  const [dateRange, setDateRange] = useState("Last 30 Days");

  // Global Search Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
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
  const [staffSalaries, setStaffSalaries] = useState([]);
  const [deliveryCompanies, setDeliveryCompanies] = useState([]);
  const [sellerApplications, setSellerApplications] = useState([]);
  const [investorApplications, setInvestorApplications] = useState([]);
  const [rolesPermissions, setRolesPermissions] = useState(() => {
    if (typeof localStorage === "undefined") return initialRolesPermissions;
    try {
      return (
        JSON.parse(
          localStorage.getItem("apexiums-role-permissions") || "null",
        ) || initialRolesPermissions
      );
    } catch {
      return initialRolesPermissions;
    }
  });
  const [finance, setFinance] = useState({
    summary: {
      totalRevenue: 0,
      commissionEarnings: 0,
      netProfit: 0,
      totalExpenses: 0,
    },
    transactions: [],
    revenueTrend: [],
  });
  const [notifications, setNotifications] = useState([]);
  const [stockRecords, setStockRecords] = useState([]);
  const [chats, setChats] = useState(() => {
    if (typeof localStorage === "undefined") return defaultChats;
    try {
      return [
        ...JSON.parse(localStorage.getItem("apexiums-support-chats") || "[]"),
        ...defaultChats,
      ];
    } catch {
      return defaultChats;
    }
  });
  const [settings, setSettings] = useState(initialSettings);

  useEffect(() => {
    let active = true;
    fetch("/api/investors?limit=500", { headers: apiHeaders() })
      .then((response) => (response.ok ? response.json() : { rows: [] }))
      .then((data) => {
        if (!active) return;
        setInvestors(
          (data.rows || []).map((row) => ({
            ...row,
            investmentAmount: Number(row.investment_amount || 0),
            totalReturnsPaid: Number(row.total_returns_paid || 0),
            contactPerson: row.contact_person || row.name || "",
            returnRate: Number(row.return_rate || 0),
            equityShare: row.equity_share || "0%",
          })),
        );
      })
      .catch(() => {
        if (active) setInvestors([]);
      });
    return () => {
      active = false;
    };
  }, [session]);

  useEffect(() => {
    let active = true;
    fetch("/api/staff?limit=500", { headers: apiHeaders() })
      .then((response) => (response.ok ? response.json() : { rows: [] }))
      .then((data) => {
        if (!active) return;
        setStaff(
          (data.rows || []).map((row) => ({
            ...row,
            joinedDate: row.created_at
              ? String(row.created_at).slice(0, 10)
              : "-",
            department: row.department || "General Operations",
          })),
        );
      })
      .catch(() => {
        if (active) setStaff([]);
      });
    return () => {
      active = false;
    };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    fetch("/api/staff_salaries?limit=1000", { headers: apiHeaders() })
      .then((response) => (response.ok ? response.json() : { rows: [] }))
      .then((data) => {
        if (!active) return;
        setStaffSalaries(
          (data.rows || []).map((row) => ({
            ...row,
            base_salary: Number(row.base_salary || 0),
            bonus: Number(row.bonus || 0),
            deductions: Number(row.deductions || 0),
          })),
        );
      })
      .catch(() => {
        if (active) setStaffSalaries([]);
      });
    return () => {
      active = false;
    };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    fetch("/api/delivery_expenses?limit=500", { headers: apiHeaders() })
      .then((response) => (response.ok ? response.json() : { rows: [] }))
      .then((data) => {
        if (active)
          setDeliveryCompanies(
            (data.rows || []).map((row) => ({
              ...row,
              amount: Number(row.amount || 0),
            })),
          );
      })
      .catch(() => {
        if (active) setDeliveryCompanies([]);
      });
    return () => {
      active = false;
    };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/seller_applications?limit=500", { headers: apiHeaders() }),
      fetch("/api/investor_applications?limit=500", { headers: apiHeaders() }),
    ])
      .then(async ([sellerResponse, investorResponse]) => [
        sellerResponse.ok ? sellerResponse.json() : { rows: [] },
        investorResponse.ok ? investorResponse.json() : { rows: [] },
      ])
      .then(async ([sellerData, investorData]) => {
        if (active) {
          setSellerApplications((await sellerData).rows || []);
          setInvestorApplications((await investorData).rows || []);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    const loadFinance = async () => {
      try {
        const headers = apiHeaders();
        const [
          ordersResponse,
          expensesResponse,
          ledgerResponse,
          chartResponse,
        ] = await Promise.all([
          fetch("/api/orders?limit=500", { headers }),
          fetch("/api/expenses?limit=500", { headers }),
          fetch("/api/finance_transactions?limit=500", { headers }),
          fetch("/api/revenue/chart", { headers }),
        ]);
        const [ordersData, expensesData, ledgerData, chartData] =
          await Promise.all([
            ordersResponse.ok ? ordersResponse.json() : { rows: [] },
            expensesResponse.ok ? expensesResponse.json() : { rows: [] },
            ledgerResponse.ok ? ledgerResponse.json() : { rows: [] },
            chartResponse.ok ? chartResponse.json() : { rows: [] },
          ]);
        if (!active) return;
        const orderRevenue = (ordersData.rows || [])
          .filter((order) =>
            ["Shipped", "Delivered", "Received"].includes(order.order_status),
          )
          .reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
        const expenseRows = (expensesData.rows || []).map((row) => ({
          id: `expense-${row.id}`,
          title: row.title,
          type: "Expense",
          category: row.category || "General",
          amount: Number(row.amount || 0),
          date: row.date || row.created_at?.slice(0, 10),
          status: "Completed",
        }));
        const ledgerRows = (ledgerData.rows || []).map((row) => ({
          id: `ledger-${row.id}`,
          title: row.title,
          type: row.type,
          category: row.category || "General",
          amount: Number(row.amount || 0),
          date: row.transaction_date || row.created_at?.slice(0, 10),
          status: row.status || "Completed",
        }));
        const manualRevenue = ledgerRows
          .filter((row) => row.type === "Revenue")
          .reduce((sum, row) => sum + row.amount, 0);
        const totalExpenses = [
          ...expenseRows,
          ...ledgerRows.filter((row) => row.type === "Expense"),
        ].reduce((sum, row) => sum + row.amount, 0);
        const totalRevenue = orderRevenue + manualRevenue;
        setFinance({
          summary: {
            totalRevenue,
            commissionEarnings: orderRevenue * 0.1,
            netProfit: totalRevenue - totalExpenses,
            totalExpenses,
          },
          transactions: [...ledgerRows, ...expenseRows].sort((a, b) =>
            String(b.date || "").localeCompare(String(a.date || "")),
          ),
          revenueTrend: (chartData.rows || []).map((row) => ({
            month: row.date,
            grossSales: Number(row.revenue || 0),
            commissions: Number(row.revenue || 0) * 0.1,
          })),
        });
      } catch {
        if (active) setFinance((current) => current);
      }
    };
    loadFinance();
    return () => {
      active = false;
    };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    const syncChats = () => {
      try {
        const stored = JSON.parse(
          localStorage.getItem("apexiums-support-chats") || "[]",
        );
        setChats((current) => [
          ...stored,
          ...current.filter(
            (chat) => !stored.some((item) => item.id === chat.id),
          ),
        ]);
      } catch {
        /* Ignore invalid local support data. */
      }
    };
    window.addEventListener("storage", syncChats);
    window.addEventListener("apexiums-chat-created", syncChats);
    return () => {
      window.removeEventListener("storage", syncChats);
      window.removeEventListener("apexiums-chat-created", syncChats);
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadNotifications = async () => {
      try {
        const headers = { "x-user-role": session?.role || "" };
        if (session?.businessId)
          headers["x-business-id"] = String(session.businessId);
        const response = await fetch("/api/notifications?limit=100", {
          headers,
        });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.rows)) return;
        const rows = data.rows.map((row) => ({
          id: `api-${row.id}`,
          title: row.title,
          message: row.message,
          type: row.type,
          date: row.created_at || "",
          time: row.created_at || "",
          read: Boolean(row.is_read),
          actionUrl:
            row.entity_type === "order"
              ? "orders"
              : row.entity_type === "return"
                ? "returns"
                : "notifications",
        }));
        setNotifications((current) => [
          ...rows,
          ...current.filter((item) => !rows.some((row) => row.id === item.id)),
        ]);
      } catch {
        /* Keep local notifications when the API is unavailable. */
      }
    };
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    const loadOrders = async () => {
      try {
        const headers = { "x-user-role": session?.role || "" };
        if (session?.businessId)
          headers["x-business-id"] = String(session.businessId);
        const response = await fetch("/api/orders?limit=200", { headers });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.rows)) return;
        const detailedRows = await Promise.all(
          data.rows.map(async (row) => {
            try {
              const detailResponse = await fetch(`/api/orders/${row.id}`, {
                headers,
              });
              return detailResponse.ok ? await detailResponse.json() : row;
            } catch {
              return row;
            }
          }),
        );
        if (!active) return;
        const apiOrders = detailedRows.map((row) => ({
          id: `ORD-${row.id}`,
          customerName: row.customer_name || "Customer",
          customerEmail: row.customer_email || "",
          customerPhone: row.customer_phone || "",
          products: (row.items || []).map((item) => ({
            id: item.product_id,
            name: item.product_name,
            qty: Number(item.qty || 1),
            price: Number(item.price || 0),
            image: item.image_url || "",
          })),
          sellerName: "Marketplace",
          totalAmount: Number(row.total_amount || 0),
          paymentStatus: row.payment_status || "Pending",
          orderStatus: row.order_status || "Pending",
          orderDate: row.created_at
            ? new Date(row.created_at).toLocaleDateString()
            : "",
          shippingAddress: row.shipping_address || "",
          paymentMethod: row.payment_method || "",
          deliveryCourier: "Unassigned",
          timeline: [
            { title: "Order Placed", time: row.created_at || "", done: true },
            {
              title: row.order_status || "Pending",
              time: "Current status",
              done: false,
            },
          ],
        }));
        setOrders((current) => [
          ...apiOrders,
          ...current.filter(
            (item) => !apiOrders.some((api) => api.id === item.id),
          ),
        ]);
      } catch {
        /* Keep local order data when API is unavailable. */
      }
    };
    loadOrders();
    const interval = window.setInterval(loadOrders, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    const loadChats = async () => {
      try {
        const headers = { "x-user-role": session?.role || "" };
        if (session?.businessId)
          headers["x-business-id"] = String(session.businessId);
        const response = await fetch("/api/chats?limit=200", { headers });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.rows)) return;
        const apiChats = data.rows.map((row) => ({
          id: `api-${row.id}`,
          customerName: row.sender_name,
          customerEmail: row.sender_type || "Customer",
          message: row.message,
          reply: row.reply_message || "",
          status: row.status || "Open",
          date: row.created_at || "",
        }));
        setChats((current) => [
          ...apiChats,
          ...current.filter(
            (item) => !apiChats.some((api) => api.id === item.id),
          ),
        ]);
      } catch {
        /* Keep local chats when API is unavailable. */
      }
    };
    loadChats();
    const interval = window.setInterval(loadChats, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    const loadReturns = async () => {
      try {
        const response = await fetch("/api/returns?limit=200", { headers: apiHeaders() });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.rows)) return;
        const apiReturns = data.rows.map((row) => ({
          id: `RET-${row.id}`,
          orderId: row.order_id ? `ORD-${row.order_id}` : "",
          customerName: row.customer || "Customer",
          customerEmail: "",
          productName: row.product || "Order items",
          sellerName: "Marketplace",
          reason: row.reason || "Order returned",
          amount: Number(row.refund_amount || 0),
          status: row.status || "Requested",
          date: row.created_at ? String(row.created_at).slice(0, 10) : "",
          images: [],
        }));
        setReturns(apiReturns);
      } catch {
        /* Keep current return data when the API is unavailable. */
      }
    };
    loadReturns();
    const interval = window.setInterval(loadReturns, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [session?.role, session?.businessId]);

  useEffect(() => {
    let active = true;
    const loadCustomers = async () => {
      try {
        const headers = { "x-user-role": session?.role || "" };
        if (session?.businessId)
          headers["x-business-id"] = String(session.businessId);
        const response = await fetch("/api/customers?limit=500", { headers });
        if (!response.ok) return;
        const data = await response.json();
        if (!active || !Array.isArray(data.rows)) return;
        const apiCustomers = data.rows.map((row) => ({
          id: row.id,
          name: row.name,
          username: row.username,
          password: row.plain_password,
          email: row.email || "",
          phone: row.phone || "",
          totalOrders: Number(row.total_orders || 0),
          totalSpent: Number(row.total_spent || 0),
          lastOrderDate: row.last_order_date || "No orders yet",
          status: row.status || "Active",
          avatar:
            row.avatar_url ||
            "https://ui-avatars.com/api/?background=fee2e2&color=dc2626&name=Customer",
          city: row.city || "",
          joinDate: row.created_at || "",
        }));
        setCustomers(apiCustomers);
      } catch {
        /* Keep local customer data when API is unavailable. */
      }
    };
    loadCustomers();
    const interval = window.setInterval(loadCustomers, 30000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [session?.role, session?.businessId]);

  // User Profile
  const [currentUser, setCurrentUser] = useState(() => ({
    name:
      session?.name ||
      session?.owner_name ||
      session?.username ||
      "Administrator",
    email: session?.email || "",
    role: isSuperAdminRole(session?.role)
      ? "Super Admin"
      : session?.role || "Admin",
    avatar: session?.avatar || "",
    department:
      session?.department ||
      (isSuperAdminRole(session?.role) ? "Executive Board" : "Administration"),
  }));
  const hasPermission = (permission) => {
    const normalizedCurrentRole = roleKey(session?.role || currentUser.role);
    if (
      ["superadmin", "businessadmin", "admin", "manager"].includes(
        normalizedCurrentRole,
      )
    )
      return true;
    const role = rolesPermissions.find(
      (item) => roleKey(item.role) === normalizedCurrentRole,
    );
    return Boolean(role?.permissions?.[permission]);
  };
  const apiHeaders = () => {
    const headers = {
      "Content-Type": "application/json",
      "x-user-role": session?.role || "",
    };
    if (session?.businessId)
      headers["x-business-id"] = String(session.businessId);
    return headers;
  };

  // The database is the source of truth for the admin catalog. Empty states are
  // intentional until the administrator creates real records.
  useEffect(() => {
    let active = true;
    const loadCatalog = async () => {
      try {
        const headers = apiHeaders();
        const [productResponse, categoryResponse, stockResponse] =
          await Promise.all([
            fetch("/api/products?limit=500", { headers }),
            fetch("/api/categories?limit=500", { headers }),
            fetch("/api/stock?limit=500", { headers }),
          ]);
        const [productData, categoryData, stockData] = await Promise.all([
          productResponse.ok ? productResponse.json() : { rows: [] },
          categoryResponse.ok ? categoryResponse.json() : { rows: [] },
          stockResponse.ok ? stockResponse.json() : { rows: [] },
        ]);
        if (!active) return;
        const rows = Array.isArray(productData.rows) ? productData.rows : [];
        const stockRows = Array.isArray(stockData.rows) ? stockData.rows : [];
        setProducts(
          rows.map((row) => ({
            ...row,
            id: row.id,
            name: row.name || "",
            price: Number(
              row.discounted_price ?? row.base_price ?? row.actual_price ?? 0,
            ),
            realPrice: Number(row.actual_price ?? row.base_price ?? 0),
            discountedPrice: Number(
              row.discounted_price ?? row.base_price ?? 0,
            ),
            costPrice: Number(row.cost_price ?? 0),
            stock: Number(
              row.stock_qty ??
                stockRows.find(
                  (stock) => String(stock.product_id) === String(row.id),
                )?.quantity ??
                0,
            ),
            minStock: Number(row.min_stock ?? 10),
            status:
              Number(
                row.stock_qty ??
                  stockRows.find(
                    (stock) => String(stock.product_id) === String(row.id),
                  )?.quantity ??
                  0,
              ) === 0
                ? "Out of Stock"
                : row.status || "Active",
            image: row.image_url || "",
            subcategory: row.subcategory || "",
            investorId: row.investor_id ?? row.investorId ?? "",
            images: (() => {
              try {
                return row.product_images ? JSON.parse(row.product_images) : [];
              } catch {
                return [];
              }
            })(),
            colors: (() => {
              try {
                return JSON.parse(row.product_detail || "{}").colors || "";
              } catch {
                return "";
              }
            })(),
            sizes: (() => {
              try {
                return JSON.parse(row.product_detail || "{}").sizes || "";
              } catch {
                return "";
              }
            })(),
          })),
        );
        setCategories(
          (Array.isArray(categoryData.rows) ? categoryData.rows : []).map(
            (row) => ({
              ...row,
              image: row.image_url || row.image || "",
              slug:
                row.slug ||
                (row.name || "").toLowerCase().trim().replace(/\s+/g, "-"),
              parent: row.parent || row.parent_name || "",
              subcategories: Array.isArray(row.subcategories)
                ? row.subcategories
                : (() => {
                    try {
                      return row.subcategories
                        ? JSON.parse(row.subcategories)
                        : [];
                    } catch {
                      return [];
                    }
                  })(),
            }),
          ),
        );
        setStockRecords(
          stockRows.map((row) => ({
            ...row,
            id: row.id,
            productId: row.product_id,
            productName: row.product_name || "",
            totalItems: Number(row.total_items || 0),
            stockBelongTo: row.stock_belong_to || "",
            quantity: Number(row.quantity || 0),
            description: row.description || "",
          })),
        );
      } catch {
        /* Keep empty state when the API is unavailable. */
      }
    };
    loadCatalog();
    return () => {
      active = false;
    };
  }, [session?.role, session?.businessId]);

  // --- CRUD Handlers ---

  // Products
  const addProduct = async (newProd) => {
    const effectiveStatus =
      Number(newProd.stock) === 0 ? "Out of Stock" : newProd.status || "Active";
    const product = {
      ...newProd,
      status: effectiveStatus,
      id: `p-${Date.now()}`,
      dateAdded: new Date().toISOString().split("T")[0],
      stock: Number(newProd.stock) || 0,
      price: Number(newProd.price) || 0,
      discount: Number(newProd.discount) || 0,
    };
    const response = await fetch("/api/products", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        name: product.name,
        sku: product.sku || null,
        category: product.category || null,
        subcategory: product.subcategory || null,
        investor_id: product.investorId ? Number(product.investorId) : null,
        product_images: JSON.stringify(product.images || []),
        product_detail: JSON.stringify({
          colors: product.colors || "",
          sizes: product.sizes || "",
        }),
        description: product.description || null,
        actual_price: Number(product.realPrice || product.price) || 0,
        base_price: Number(product.realPrice || product.price) || 0,
        discounted_price: Number(product.discountedPrice || product.price) || 0,
        cost_price: Number(product.costPrice) || 0,
        stock_qty: Number(product.stock) || 0,
        image_url: product.image || null,
        status: product.status || "Active",
        slug: product.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-"),
      }),
    });
    if (!response.ok)
      throw new Error(
        (await response.json().catch(() => ({}))).message ||
          "Product could not be saved to the database.",
      );
    const saved = await response.json();
    setProducts((prev) => [
      {
        ...product,
        ...saved,
        id: saved.id,
        dateAdded: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ]);
    addToast(`Product "${product.name}" saved in database.`, "success");
  };

  const updateProduct = async (id, updatedFields) => {
    const existing = products.find((p) => String(p.id) === String(id)) || {};
    const mergedFields = { ...existing, ...updatedFields };
    const effectiveStatus =
      Number(mergedFields.stock) === 0
        ? "Out of Stock"
        : mergedFields.status || "Active";
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...mergedFields, status: effectiveStatus } : p,
      ),
    );
    if (!String(id).startsWith("p-")) {
      const response = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({
          name: mergedFields.name,
          sku: mergedFields.sku || null,
          category: mergedFields.category || null,
          subcategory: mergedFields.subcategory || null,
          description: mergedFields.description || null,
          investor_id: mergedFields.investorId
            ? Number(mergedFields.investorId)
            : null,
          product_images: JSON.stringify(mergedFields.images || []),
          product_detail: JSON.stringify({
            colors: mergedFields.colors || "",
            sizes: mergedFields.sizes || "",
          }),
          actual_price:
            Number(mergedFields.realPrice ?? mergedFields.price) || 0,
          base_price: Number(mergedFields.realPrice ?? mergedFields.price) || 0,
          discounted_price:
            Number(mergedFields.discountedPrice ?? mergedFields.price) || 0,
          cost_price: Number(mergedFields.costPrice) || 0,
          stock_qty: Number(mergedFields.stock) || 0,
          image_url: mergedFields.image || null,
          status: effectiveStatus,
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => ({}))).message ||
            "Product could not be updated in the database.",
        );
    }
    addToast("Product details updated successfully!", "success");
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (!String(id).startsWith("p-"))
      fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: apiHeaders(),
      }).catch(() => {});
    addToast("Product deleted from inventory.", "info");
  };

  const duplicateProduct = (id) => {
    const source = products.find((p) => p.id === id);
    if (source) {
      const copy = {
        ...source,
        id: `p-${Date.now()}`,
        name: `${source.name} (Copy)`,
        sku: `${source.sku}-COPY`,
        dateAdded: new Date().toISOString().split("T")[0],
      };
      setProducts((prev) => [copy, ...prev]);
      addToast(`Product duplicated as "${copy.name}".`, "success");
    }
  };

  const updateProductStock = (id, newStock) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const numStock = Number(newStock) || 0;
          let status = p.status;
          if (numStock === 0) status = "Out of Stock";
          else if (status === "Out of Stock") status = "Active";
          return { ...p, stock: numStock, status };
        }
        return p;
      }),
    );
    addToast("Stock quantity updated.", "success");
  };

  const bulkDeleteProducts = (ids) => {
    setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
    addToast(`${ids.length} products deleted in bulk.`, "info");
  };

  const bulkUpdateProductStatus = (ids, newStatus) => {
    setProducts((prev) =>
      prev.map((p) => (ids.includes(p.id) ? { ...p, status: newStatus } : p)),
    );
    addToast(
      `Updated status to "${newStatus}" for ${ids.length} products.`,
      "success",
    );
  };

  const addStockRecord = (record) => {
    const product = products.find(
      (item) => String(item.id) === String(record.productId),
    );
    const quantity = Number(record.quantity) || 0;
    setStockRecords((current) => [
      {
        ...record,
        id: `STK-${Date.now()}`,
        productName: product?.name || `Product ${record.productId}`,
        totalItems: Number(record.totalItems) || quantity,
        quantity,
      },
      ...current,
    ]);
    if (product) updateProductStock(product.id, product.stock + quantity);
    fetch("/api/stock", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        product_id: record.productId,
        product_name: product?.name || "",
        total_items: Number(record.totalItems) || quantity,
        stock_belong_to: record.stockBelongTo,
        investor_id: record.investorId || null,
        quantity,
        description: record.description,
      }),
    }).catch(() => {});
    addToast("Stock entry added successfully.", "success");
  };
  const deleteStockRecord = (record) => {
    setStockRecords((current) =>
      current.filter((item) => item.id !== record.id),
    );
    if (record.productId) updateProductStock(record.productId, 0);
    addToast("Stock removed successfully.", "info");
  };

  // Categories
  const addCategory = async (cat) => {
    const newCat = {
      ...cat,
      id: `cat-${Date.now()}`,
      productCount: 0,
      subcategories: cat.subcategories || [],
    };
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        name: cat.name,
        parent_id: cat.parent || null,
        image_url: cat.image || null,
        description: cat.description || null,
        subcategories: JSON.stringify(cat.subcategories || []),
        status: cat.status || "Active",
      }),
    });
    if (!response.ok)
      throw new Error("Category could not be saved to the database.");
    const saved = await response.json();
    setCategories((prev) => [
      {
        ...newCat,
        ...saved,
        id: saved.id,
        subcategories: cat.subcategories || [],
      },
      ...prev,
    ]);
    addToast(`Category "${newCat.name}" added.`, "success");
  };

  const updateCategory = async (id, catData) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...catData } : c)),
    );
    if (!String(id).startsWith("cat-")) {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({
          name: catData.name,
          parent_id: catData.parent || null,
          image_url: catData.image || null,
          description: catData.description || null,
          subcategories: JSON.stringify(catData.subcategories || []),
          status: catData.status || "Active",
        }),
      });
      if (!response.ok)
        throw new Error(
          "Category image/details could not be saved to the database.",
        );
    }
    addToast("Category updated.", "success");
  };

  const deleteCategory = (id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    if (!String(id).startsWith("cat-"))
      fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: apiHeaders(),
      }).catch(() => {});
    addToast("Category removed.", "info");
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
      }),
    );
    if (String(id).startsWith("ORD-") && /^ORD-\d+$/.test(String(id))) {
      fetch(`/api/orders/${String(id).replace("ORD-", "")}/status`, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({ order_status: newStatus }),
      }).catch(() => {});
    }
    addToast(`Order ${id} status changed to ${newStatus}.`, "success");
  };

  const deleteOrder = async (id) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
    const numericId = String(id).replace("ORD-", "");
    if (/^\d+$/.test(numericId))
      await fetch(`/api/orders/${numericId}`, {
        method: "DELETE",
        headers: apiHeaders(),
      }).catch(() => {});
    addToast(`Order ${id} deleted.`, "info");
  };

  const createReturnFromOrder = (order) => {
    if (returns.some((item) => item.orderId === order.id)) {
      updateOrderStatus(order.id, "Return");
      addToast(`${order.id} is already available in Returns.`, "info");
      return;
    }
    const item = order.products?.[0] || {};
    const newReturn = {
      id: `RET-${Date.now()}`,
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail || "",
      productName: item.name || "Order items",
      sellerName: order.sellerName || "",
      reason: "Return created from order actions",
      amount: Number(order.totalAmount) || 0,
      status: "Requested",
      date: new Date().toISOString().split("T")[0],
      images: [],
    };
    setReturns((current) =>
      current.some((item) => item.orderId === order.id)
        ? current
        : [newReturn, ...current],
    );
    updateOrderStatus(order.id, "Return");
    (order.products || []).forEach((product) => {
      const quantity = Number(product.qty || 1);
      if (product.id)
        addStockRecord({
          productId: product.id,
          totalItems: quantity,
          stockBelongTo: order.sellerName || "Returned customer stock",
          quantity,
          description: `Returned from order ${order.id}`,
        });
    });
    addToast("Returned items added back to stock.", "success");
    setNotifications((current) => [
      {
        id: `notif-${Date.now()}`,
        title: `Return created (${order.id})`,
        message: `${order.customerName}'s order was moved to Returns.`,
        type: "Return Request",
        date: new Date().toLocaleString(),
        read: false,
        actionUrl: "returns",
      },
      ...current,
    ]);
    fetch("/api/returns", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        order_id: Number(String(order.id).replace(/\D/g, "")) || null,
        product_id: item.id || null,
        customer: order.customerName,
        product: item.name || "Order items",
        reason: newReturn.reason,
        status: "Requested",
        refund_amount: newReturn.amount,
      }),
    }).catch(() => {});
    addToast(`${order.id} moved to Returns.`, "success");
  };

  // Returns
  const updateReturnStatus = (id, newStatus) => {
    setReturns((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)),
    );
    if (/^RET-\d+$/.test(String(id)))
      fetch(`/api/returns/${String(id).replace("RET-", "")}/status`, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});
    addToast(`Return ${id} set to ${newStatus}.`, "success");
  };

  const addReturn = (returnData) => {
    setReturns((current) => [
      {
        ...returnData,
        id: `RET-${Date.now()}`,
        status: returnData.status || "Requested",
        date: returnData.date || new Date().toISOString().split("T")[0],
        images: [],
      },
      ...current,
    ]);
    fetch("/api/returns", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        order_id: Number(String(returnData.orderId).replace(/\D/g, "")) || null,
        customer: returnData.customerName,
        product: returnData.productName,
        reason: returnData.reason,
        status: returnData.status || "Requested",
        refund_amount: Number(returnData.amount) || 0,
      }),
    }).catch(() => {});
    addToast("Manual return added successfully.", "success");
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
      }),
    );
    addToast(
      `Seller account status updated to ${newStatus || newVerification}.`,
      "success",
    );
  };

  const addSeller = (sellerData) => {
    const newSeller = {
      ...sellerData,
      id: `v-${Date.now()}`,
      productsCount: 0,
      ordersCount: 0,
      revenue: 0,
      ratings: 5.0,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    setSellers((prev) => [newSeller, ...prev]);
    fetch("/api/wholesellers", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        name: sellerData.sellerName,
        business_name: sellerData.storeName || sellerData.stockSellerSell,
        contact_person: sellerData.contact,
        phone: sellerData.phone,
        email: sellerData.email,
        address: sellerData.address,
        description: sellerData.description,
        seller_image: sellerData.sellerImage,
        stock_seller_sell: sellerData.stockSellerSell,
        username: sellerData.username,
        password: sellerData.password,
        status: sellerData.status || "Pending",
      }),
    }).catch(() => {});
    addToast(`New seller "${newSeller.storeName}" registered!`, "success");
  };

  // Investors
  const addInvestor = (invData) => {
    const newInv = {
      ...invData,
      id: `inv-${Date.now()}`,
      totalReturnsPaid: 0,
      investmentDate: new Date().toISOString().split("T")[0],
    };
    setInvestors((prev) => [newInv, ...prev]);
    fetch("/api/investors", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        name: invData.name,
        email: invData.email,
        phone: invData.phone,
        address: invData.address,
        investment_amount: Number(invData.investmentAmount) || 0,
        investment_date: invData.investmentDate,
        description: invData.description,
        username: invData.username,
        password: invData.password,
        status: invData.status || "Pending",
      }),
    }).catch(() => {});
    addToast(`Investor "${newInv.name}" added to registry.`, "success");
  };

  const updateInvestorStatus = (id, newStatus) => {
    setInvestors((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv)),
    );
    addToast(`Investor status updated to ${newStatus}.`, "success");
  };

  const reviewSellerApplication = async (application, decision) => {
    if (decision === "Approved") {
      const username =
        String(
          application.email ||
            application.business_name ||
            `seller${application.id}`,
        )
          .split("@")[0]
          .replace(/[^a-z0-9]/gi, "")
          .toLowerCase() || `seller${application.id}`;
      const response = await fetch("/api/wholesellers", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          name: application.applicant_name,
          business_name: application.business_name,
          contact_person: application.applicant_name,
          phone: application.phone,
          email: application.email,
          address: application.address,
          description: [
            application.leopard_courier_nearby
              ? `Leopard Courier nearby: ${application.leopard_courier_nearby}`
              : "",
            application.message || "",
          ]
            .filter(Boolean)
            .join("\n"),
          seller_image: application.product_image_url,
          stock_seller_sell: application.category,
          username,
          password: `Seller@${application.id}2026`,
          status: "Active",
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => ({}))).message ||
            "Seller registration failed.",
        );
      const saved = await response.json();
      setSellers((previous) => [
        {
          ...saved,
          id: saved.id,
          sellerName: saved.name,
          storeName: saved.business_name,
          contact: saved.contact_person,
          stockSellerSell: saved.stock_seller_sell,
          productsCount: 0,
          ordersCount: 0,
          revenue: 0,
          ratings: 5,
          commissionRate: 10,
          verificationStatus: "Verified",
          status: "Active",
        },
        ...previous,
      ]);
    }
    const updateResponse = await fetch(
      `/api/seller_applications/${application.id}`,
      {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({ ...application, status: decision }),
      },
    );
    if (!updateResponse.ok)
      throw new Error("Application status could not be updated.");
    setSellerApplications((previous) =>
      previous.map((item) =>
        item.id === application.id ? { ...item, status: decision } : item,
      ),
    );
    addToast(`Seller application ${decision.toLowerCase()}.`, "success");
  };

  const reviewInvestorApplication = async (application, decision) => {
    if (decision === "Approved") {
      const username =
        String(application.email || `investor${application.id}`)
          .split("@")[0]
          .replace(/[^a-z0-9]/gi, "")
          .toLowerCase() || `investor${application.id}`;
      const response = await fetch("/api/investors", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          name: application.applicant_name,
          email: application.email,
          phone: application.phone,
          address: application.address,
          username,
          password: `Investor@${application.id}2026`,
          investment_amount: Number(application.proposed_amount || 0),
          investment_date: new Date().toISOString().slice(0, 10),
          status: "Active",
          description: [
            application.investment_product
              ? `Investment product: ${application.investment_product}`
              : "",
            application.message || "",
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });
      if (!response.ok)
        throw new Error(
          (await response.json().catch(() => ({}))).message ||
            "Investor registration failed.",
        );
      const saved = await response.json();
      setInvestors((previous) => [
        {
          ...saved,
          investmentAmount: Number(saved.investment_amount || 0),
          totalReturnsPaid: 0,
          contactPerson: saved.name,
          returnRate: 0,
          equityShare: "0%",
        },
        ...previous,
      ]);
    }
    const updateResponse = await fetch(
      `/api/investor_applications/${application.id}`,
      {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({ ...application, status: decision }),
      },
    );
    if (!updateResponse.ok)
      throw new Error("Application status could not be updated.");
    setInvestorApplications((previous) =>
      previous.map((item) =>
        item.id === application.id ? { ...item, status: decision } : item,
      ),
    );
    addToast(`Investor application ${decision.toLowerCase()}.`, "success");
  };

  // Staff
  const addStaffMember = async (staffData) => {
    const newStaff = {
      ...staffData,
      id: `st-${Date.now()}`,
      joinedDate: new Date().toISOString().split("T")[0],
    };
    const response = await fetch("/api/staff", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone || null,
        role: staffData.role,
        department: staffData.department || null,
        photo_url: staffData.photoUrl || null,
        password_hash: staffData.password || null,
        status: staffData.status || "Active",
      }),
    });
    if (!response.ok)
      throw new Error(
        (await response.json().catch(() => ({}))).message ||
          "Staff member could not be saved.",
      );
    const saved = await response.json();
    const salaryResponse = await fetch("/api/staff_salaries", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        staff_id: saved.id,
        staff_name: saved.name || staffData.name,
        salary_month: new Date().toISOString().slice(0, 7),
        base_salary: Number(staffData.salary || 0),
        bonus: 0,
        deductions: 0,
        payment_status: "Pending",
        paid_date: null,
        notes: staffData.department || null,
      }),
    });
    if (!salaryResponse.ok)
      throw new Error(
        (await salaryResponse.json().catch(() => ({}))).message ||
          "Staff salary could not be saved.",
      );
    const savedSalary = await salaryResponse.json();
    setStaffSalaries((previous) => [
      {
        ...savedSalary,
        base_salary: Number(savedSalary.base_salary || 0),
        bonus: Number(savedSalary.bonus || 0),
        deductions: Number(savedSalary.deductions || 0),
      },
      ...previous,
    ]);
    setStaff((prev) => [
      {
        ...newStaff,
        ...saved,
        id: saved.id,
        joinedDate: saved.created_at
          ? String(saved.created_at).slice(0, 10)
          : newStaff.joinedDate,
      },
      ...prev,
    ]);
    addToast(`Staff member "${newStaff.name}" created.`, "success");
  };

  const updateStaffMember = async (id, staffData) => {
    const response = await fetch(`/api/staff/${id}`, {
      method: "PUT",
      headers: apiHeaders(),
      body: JSON.stringify({
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone || null,
        role: staffData.role,
        department: staffData.department || null,
        photo_url: staffData.photoUrl || null,
        password_hash: staffData.password || undefined,
        status: staffData.status || "Active",
      }),
    });
    if (!response.ok)
      throw new Error(
        (await response.json().catch(() => ({}))).message ||
          "Staff member could not be updated.",
      );
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...staffData } : s)),
    );
    addToast("Staff details updated.", "success");
  };

  const deleteStaffMember = async (id) => {
    const response = await fetch(`/api/staff/${id}`, {
      method: "DELETE",
      headers: apiHeaders(),
    });
    if (!response.ok) throw new Error("Staff member could not be deleted.");
    setStaff((prev) => prev.filter((s) => s.id !== id));
    addToast("Staff member deleted.", "info");
  };

  const markStaffSalaryPaid = async (salaryId, paidDate) => {
    const current = staffSalaries.find(
      (salary) => String(salary.id) === String(salaryId),
    );
    if (!current) throw new Error("Salary record was not found.");
    const response = await fetch(`/api/staff_salaries/${salaryId}`, {
      method: "PUT",
      headers: apiHeaders(),
      body: JSON.stringify({
        ...current,
        payment_status: "Paid",
        paid_date: paidDate || new Date().toISOString().slice(0, 10),
      }),
    });
    if (!response.ok)
      throw new Error(
        (await response.json().catch(() => ({}))).message ||
          "Salary payment could not be updated.",
      );
    const updated = await response.json();
    setStaffSalaries((previous) =>
      previous.map((salary) =>
        String(salary.id) === String(salaryId)
          ? {
              ...salary,
              ...updated,
              payment_status: "Paid",
              paid_date: updated.paid_date || paidDate,
            }
          : salary,
      ),
    );
    addToast(`${current.staff_name} salary marked as paid.`, "success");
  };

  const saveDeliveryCompany = async (company, id = null) => {
    const payload = {
      courier: company.courier,
      tracking_number: company.service_level || null,
      amount: Number(company.amount || 0),
      expense_date:
        company.effective_date || new Date().toISOString().slice(0, 10),
      payment_status: company.status || "Active",
      notes: company.notes || null,
    };
    const response = await fetch(
      id ? `/api/delivery_expenses/${id}` : "/api/delivery_expenses",
      {
        method: id ? "PUT" : "POST",
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok)
      throw new Error(
        (await response.json().catch(() => ({}))).message ||
          "Delivery expense could not be saved.",
      );
    const saved = await response.json();
    const normalized = { ...saved, amount: Number(saved.amount || 0) };
    setDeliveryCompanies((previous) =>
      id
        ? previous.map((item) =>
            String(item.id) === String(id) ? normalized : item,
          )
        : [normalized, ...previous],
    );
    addToast("Delivery expense saved.", "success");
  };

  const deleteDeliveryCompany = async (id) => {
    const response = await fetch(`/api/delivery_expenses/${id}`, {
      method: "DELETE",
      headers: apiHeaders(),
    });
    if (!response.ok) throw new Error("Delivery expense could not be deleted.");
    setDeliveryCompanies((previous) =>
      previous.filter((item) => String(item.id) !== String(id)),
    );
    addToast("Delivery expense removed.", "info");
  };

  // Permissions
  const updateRolePermission = (roleName, permissionKey, value) => {
    if (isSuperAdminRole(roleName) && !value) {
      addToast("Super Admin always has full system access.", "info");
      return;
    }
    setRolesPermissions((prev) => {
      const next = prev.map((r) => {
        if (r.role === roleName) {
          return {
            ...r,
            permissions: {
              ...r.permissions,
              [permissionKey]: value,
            },
          };
        }
        return r;
      });
      if (typeof localStorage !== "undefined")
        localStorage.setItem("apexiums-role-permissions", JSON.stringify(next));
      return next;
    });
    addToast(`Permission updated for role: ${roleName}`, "success");
  };

  // Banners & Ads
  const addBanner = (bannerData) => {
    const newBan = {
      ...bannerData,
      id: `ban-${Date.now()}`,
      visible: bannerData.visible !== false,
      device: "desktop",
    };
    setBanners((prev) => [newBan, ...prev]);
    addToast("New marketing banner published.", "success");
  };

  const deleteBanner = (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    addToast("Banner removed.", "info");
  };
  const toggleBanner = (id) =>
    setBanners((prev) =>
      prev.map((banner) =>
        banner.id === id
          ? { ...banner, visible: banner.visible === false }
          : banner,
      ),
    );

  const addAd = (adData) => {
    const newAd = {
      ...adData,
      id: `ad-${Date.now()}`,
      visible: adData.visible !== false,
      device: "mobile",
      spent: 0,
      impressions: 0,
      clicks: 0,
      ctr: "0.00%",
    };
    setAds((prev) => [newAd, ...prev]);
    addToast("New ad campaign initialized.", "success");
  };

  const deleteAd = (id) => {
    setAds((prev) => prev.filter((a) => a.id !== id));
    addToast("Ad campaign deleted.", "info");
  };
  const toggleAd = (id) =>
    setAds((prev) =>
      prev.map((ad) =>
        ad.id === id ? { ...ad, visible: ad.visible === false } : ad,
      ),
    );

  // Finance
  const addTransaction = async (transaction) => {
    const response = await fetch("/api/finance_transactions", {
      method: "POST",
      headers: apiHeaders(),
      body: JSON.stringify({
        title: transaction.title,
        type: transaction.type,
        category: transaction.category,
        amount: Number(transaction.amount || 0),
        transaction_date:
          transaction.date || new Date().toISOString().slice(0, 10),
        status: transaction.status || "Completed",
      }),
    });
    if (!response.ok)
      throw new Error(
        (await response.json().catch(() => ({}))).message ||
          "Transaction could not be saved.",
      );
    const saved = await response.json();
    const entry = {
      id: `ledger-${saved.id}`,
      title: saved.title,
      type: saved.type,
      category: saved.category,
      amount: Number(saved.amount || 0),
      date: saved.transaction_date,
      status: saved.status || "Completed",
    };
    setFinance((previous) => {
      const transactions = [entry, ...previous.transactions];
      const revenue = transactions
        .filter((item) => item.type === "Revenue")
        .reduce((sum, item) => sum + item.amount, 0);
      const expenses = transactions
        .filter((item) => item.type === "Expense")
        .reduce((sum, item) => sum + item.amount, 0);
      return {
        ...previous,
        transactions,
        summary: {
          ...previous.summary,
          totalRevenue:
            previous.summary.totalRevenue +
            (entry.type === "Revenue" ? entry.amount : 0),
          totalExpenses:
            previous.summary.totalExpenses +
            (entry.type === "Expense" ? entry.amount : 0),
          netProfit:
            previous.summary.netProfit +
            (entry.type === "Revenue" ? entry.amount : -entry.amount),
        },
      };
    });
    addToast(`${transaction.type} entry saved.`, "success");
  };

  const addExpense = (expData) => {
    const newExp = {
      ...expData,
      id: `exp-${Date.now()}`,
      amount: Number(expData.amount) || 0,
      date: expData.date || new Date().toISOString().split("T")[0],
    };
    setFinance((prev) => ({
      ...prev,
      expensesList: [newExp, ...prev.expensesList],
    }));
    addToast(`Expense of $${newExp.amount} logged.`, "success");
  };

  // Notifications
  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast("All notifications marked as read.", "success");
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => setNotifications([]);

  const replyToChat = (id, reply) => {
    setChats((current) =>
      current.map((chat) =>
        chat.id === id ? { ...chat, reply, status: "Replied" } : chat,
      ),
    );
    if (String(id).startsWith("api-")) {
      const headers = {
        "Content-Type": "application/json",
        "x-user-role": session?.role || "",
      };
      if (session?.businessId)
        headers["x-business-id"] = String(session.businessId);
      fetch(`/api/chats/${String(id).replace("api-", "")}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ reply_message: reply, status: "Replied" }),
      }).catch(() => {});
    }
    addToast("Reply sent to customer.", "success");
  };

  // Settings
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast("Marketplace settings updated successfully.", "success");
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
        staffSalaries,
        deliveryCompanies,
        sellerApplications,
        investorApplications,
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
        markStaffSalaryPaid,
        saveDeliveryCompany,
        deleteDeliveryCompany,
        reviewSellerApplication,
        reviewInvestorApplication,
        updateRolePermission,
        addTransaction,
        addBanner,
        toggleBanner,
        deleteBanner,
        addAd,
        toggleAd,
        deleteAd,
        addExpense,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
        replyToChat,
        updateSettings,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context)
    throw new Error("useAdmin must be used within an AdminProvider");
  return context;
};
