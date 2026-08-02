import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeDollarSign,
  Bell,
  Boxes,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Edit3,
  Eye,
  Image,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Package,
  PackageCheck,
  PackageOpen,
  Plus,
  ReceiptText,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Tag,
  TicketPercent,
  Trash2,
  Upload,
  Users,
  WalletCards,
  X
} from 'lucide-react';
import './styles.css';

const STORAGE_KEY = 'apexiums-session';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-PK')}`;

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveSession(session) {
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function buildHeaders(session, businessId, extra = {}) {
  return {
    'Content-Type': 'application/json',
    ...(session ? { 'x-user-role': session.role || '', 'x-business-id': businessId ? String(businessId) : '' } : {}),
    ...extra
  };
}

async function apiFetch(path, { session, businessId, headers, ...options } = {}) {
  return fetch(path, {
    ...options,
    headers: buildHeaders(session, businessId, headers)
  });
}

const navByRole = {
  SuperAdmin: [
    {
      heading: 'Overview',
      items: [{ label: 'Dashboard', icon: LayoutDashboard }]
    },
    {
      heading: 'Catalog',
      items: [
        { label: 'Product Listing', icon: Package },
        { label: 'Categories', icon: Tag },
        { label: 'Stock', icon: Boxes },
        { label: 'Coupons', icon: TicketPercent }
      ]
    },
    {
      heading: 'Sales',
      items: [
        { label: 'Orders', icon: ClipboardList },
        { label: 'Returns', icon: RefreshCcw },
        { label: 'Customers', icon: Users },
        { label: 'Whole Sellers', icon: Store }
      ]
    },
    {
      heading: 'Marketplace',
      items: [{ label: 'Stores', target: 'Businesses', icon: Building2 }]
    },
    {
      heading: 'Marketing',
      items: [{ label: 'Banners', icon: Package }, { label: 'Ads', icon: Sparkles }]
    },
    {
      heading: 'Finance',
      items: [
        { label: 'Revenue', icon: ChartNoAxesCombined },
        { label: 'Expense', icon: ReceiptText }
      ]
    },
    {
      heading: 'Team',
      items: [
        { label: 'Staff', icon: ShieldCheck },
        { label: 'Notifications', icon: Bell }
      ]
    }
  ],
  BusinessAdmin: [
    {
      heading: 'Overview',
      items: [{ label: 'Dashboard', icon: LayoutDashboard }]
    },
    {
      heading: 'Catalog',
      items: [
        { label: 'Product Listing', icon: Package },
        { label: 'Categories', icon: Tag },
        { label: 'Stock', icon: Boxes },
        { label: 'Coupons', icon: TicketPercent }
      ]
    },
    {
      heading: 'Sales',
      items: [
        { label: 'Orders', icon: ClipboardList },
        { label: 'Returns', icon: RefreshCcw },
        { label: 'Customers', icon: Users }
      ]
    },
    {
      heading: 'Marketplace',
      items: [{ label: 'Stores', target: 'Businesses', icon: Building2 }]
    },
    {
      heading: 'Finance',
      items: [{ label: 'Revenue', icon: ChartNoAxesCombined }]
    },
    {
      heading: 'Team',
      items: [{ label: 'Notifications', icon: Bell }]
    }
  ]
};

function getNavItems(role) {
  return navByRole[role] || navByRole.BusinessAdmin;
}

const pageConfigs = {
  'Product Listing': {
    api: '/api/products',
    title: 'Product Listing',
    description: 'Create products with images, category, pricing and product details.',
    addLabel: 'Add Product',
    stats: [
      ['Active Products', 'active'],
      ['Total Stock', 'stock'],
      ['Low Products', 'low'],
      ['Catalog Value', 'value']
    ],
    columns: [
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'id', label: 'Product ID', prefix: '#PRD-' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'actual_price', label: 'Actual Price', type: 'money' },
      { key: 'discounted_price', label: 'Discounted Price', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['product_images', 'Upload Images', 'images'],
      ['id', 'Product ID', 'readonly'],
      ['name', 'Name', 'text'],
      ['description', 'Description', 'textarea'],
      ['product_detail', 'Product Detail', 'textarea'],
      ['actual_price', 'Actual Price', 'number'],
      ['discounted_price', 'Discounted Price', 'number'],
      ['category', 'Category', 'select'],
      ['status', 'Live', 'toggle']
    ]
  },
  Banners: {
    api: '/api/banners',
    title: 'Banners',
    description: 'Upload website banners and control visibility.',
    addLabel: 'Add Banner',
    stats: [
      ['Total Banners', 'total'],
      ['Active Banners', 'active'],
      ['Clicks', 'click_count'],
      ['Scheduled', 'scheduled']
    ],
    columns: [
      { key: 'image_url', label: 'Banner', type: 'image' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' }
    ],
    fields: [
      ['image_url', 'Upload Banner', 'image'],
      ['status', 'Active', 'toggle']
    ]
  },
  Ads: {
    api: '/api/promotions',
    title: 'Ads',
    description: 'Upload ads, set visibility window and show them on the website.',
    addLabel: 'Add Ad',
    stats: [
      ['Total Ads', 'total'],
      ['Active Ads', 'active'],
      ['Usage Count', 'used'],
      ['Running Now', 'running']
    ],
    columns: [
      { key: 'image_url', label: 'Ad', type: 'image' },
      { key: 'valid_from', label: 'Valid From', type: 'date' },
      { key: 'valid_till', label: 'Valid To', type: 'date' },
      { key: 'show_on_website', label: 'Show on Website' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['image_url', 'Upload Ad', 'image'],
      ['valid_from', 'Valid From', 'date'],
      ['valid_till', 'Valid To', 'date'],
      ['show_on_website', 'Show on Website', 'select', ['Yes', 'No']],
      ['status', 'Active', 'toggle']
    ]
  },
  Categories: {
    api: '/api/categories',
    title: 'Categories',
    description: 'Add categories with a name and upload image.',
    addLabel: 'Add Category',
    stats: [
      ['Total Categories', 'total'],
      ['Active Categories', 'active'],
      ['Top Selling Category', 'Hoodies'],
      ['Empty Categories', '0']
    ],
    columns: [
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['image_url', 'Upload Image', 'image'],
      ['name', 'Name', 'text'],
      ['status', 'Active', 'toggle']
    ]
  },
  Stock: {
    api: '/api/stock',
    title: 'Stock',
    description: 'Track SKU levels, warehouse stock and inventory adjustments.',
    addLabel: 'Adjust Stock',
    special: 'stock',
    stats: [
      ['Total SKUs', 'total'],
      ['Low Stock Items', 'low'],
      ['Out of Stock', 'out'],
      ['Stock Value', 'value']
    ],
    columns: [
      { key: 'product_name', label: 'Product Name' },
      { key: 'sku', label: 'SKU' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Current Stock' },
      { key: 'reorder_level', label: 'Reorder Level' },
      { key: 'warehouse', label: 'Warehouse' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'updated_at', label: 'Last Updated', type: 'date' }
    ],
    fields: [
      ['product_id', 'Product ID', 'number'],
      ['adjustment_type', 'Adjustment Type', 'select', ['Add', 'Remove']],
      ['quantity', 'Quantity', 'number'],
      ['reason', 'Reason', 'select', ['Purchase', 'Return', 'Damage', 'Correction']],
      ['notes', 'Notes', 'textarea']
    ]
  },
  Coupons: {
    api: '/api/coupons',
    title: 'Coupons',
    description: 'Create discount codes with validity, order minimums and usage targets.',
    addLabel: 'Add Coupon',
    stats: [
      ['Total Coupons', 'total'],
      ['Active Coupons', 'active'],
      ['Usage Count', 'used'],
      ['Expiring Soon', 'soon']
    ],
    columns: [
      { key: 'code', label: 'Coupon Code' },
      { key: 'title', label: 'Title' },
      { key: 'discount_type', label: 'Type' },
      { key: 'discount_value', label: 'Discount', type: 'money' },
      { key: 'usage_limit', label: 'Limit' },
      { key: 'used_count', label: 'Used' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['code', 'Coupon Code', 'text'],
      ['title', 'Title', 'text'],
      ['description', 'Description', 'textarea'],
      ['min_order_amount', 'Minimum Order Amount', 'number'],
      ['valid_from', 'Valid From', 'date'],
      ['valid_till', 'Valid Till', 'date'],
      ['use_for', 'Use For', 'select', ['Free delivery', 'Product discount']],
      ['status', 'Active', 'toggle']
    ]
  },
  Orders: {
    api: '/api/orders',
    title: 'Orders',
    description: 'Process pending, packed, shipped, delivered and cancelled orders.',
    readonly: true,
    stats: [
      ['Today Orders', 'total'],
      ['Pending Orders', 'pending'],
      ['Total Revenue Today', 'revenue'],
      ['Cancelled Orders', 'cancelled']
    ],
    columns: [
      { key: 'id', label: 'Order ID', prefix: '#ORD-' },
      { key: 'customer_name', label: 'Customer Name' },
      { key: 'items_count', label: 'Items Count' },
      { key: 'total_amount', label: 'Total Amount', type: 'money' },
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'payment_status', label: 'Payment Status', type: 'status' },
      { key: 'order_status', label: 'Order Status', type: 'status' },
      { key: 'created_at', label: 'Date', type: 'date' }
    ]
  },
  Returns: {
    api: '/api/returns',
    title: 'Returns',
    description: 'Approve, reject, refund and review return requests.',
    readonly: true,
    stats: [
      ['Total Returns', 'total'],
      ['Pending Approval', 'pending'],
      ['Refunded Amount', 'refund'],
      ['Return Rate %', '3.4%']
    ],
    columns: [
      { key: 'id', label: 'Return ID', prefix: '#RET-' },
      { key: 'order_id', label: 'Order ID', prefix: '#ORD-' },
      { key: 'customer', label: 'Customer' },
      { key: 'product', label: 'Product' },
      { key: 'reason', label: 'Reason' },
      { key: 'status', label: 'Return Status', type: 'status' },
      { key: 'refund_amount', label: 'Refund Amount', type: 'money' },
      { key: 'created_at', label: 'Date', type: 'date' }
    ]
  },
  Staff: {
    api: '/api/staff',
    title: 'Staff',
    description: 'Manage staff roles, module permissions and account status.',
    addLabel: 'Add Staff',
    stats: [
      ['Total Staff', 'total'],
      ['Active Now', 'active'],
      ['Admins', 'admins'],
      ['Pending Invites', '0']
    ],
    columns: [
      { key: 'photo_url', label: 'Photo', type: 'avatar' },
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'last_login', label: 'Last Login', type: 'date' }
    ],
    fields: [
      ['photo_url', 'Photo URL', 'url'],
      ['name', 'Name', 'text'],
      ['email', 'Email', 'email'],
      ['phone', 'Phone', 'text'],
      ['role', 'Role', 'select', ['Admin', 'Manager', 'Support', 'Delivery']],
      ['password_hash', 'Password', 'password'],
      ['status', 'Active', 'toggle']
    ]
  },
  Customers: {
    api: '/api/customers',
    title: 'Customers',
    description: 'View customer profiles, spend, orders and account status.',
    readonly: true,
    stats: [
      ['Total Customers', 'total'],
      ['New This Month', 'new'],
      ['Repeat Customers', 'repeat'],
      ['Avg Order Value', 'aov']
    ],
    columns: [
      { key: 'avatar_url', label: 'Photo', type: 'avatar' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_orders', label: 'Total Orders' },
      { key: 'total_spent', label: 'Total Spent', type: 'money' },
      { key: 'created_at', label: 'Joined Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' }
    ]
  },
  'Product Listing': {
    api: '/api/products',
    title: 'Product Listing',
    description: 'Create products with images, category, pricing and product details.',
    addLabel: 'Add Product',
    stats: [
      ['Active Products', 'active'],
      ['Total Stock', 'stock'],
      ['Low Products', 'low'],
      ['Catalog Value', 'value']
    ],
    columns: [
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'id', label: 'Product ID', prefix: '#PRD-' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'actual_price', label: 'Actual Price', type: 'money' },
      { key: 'discounted_price', label: 'Discounted Price', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['product_images', 'Upload Images', 'images'],
      ['id', 'Product ID', 'readonly'],
      ['name', 'Name', 'text'],
      ['description', 'Description', 'textarea'],
      ['product_detail', 'Product Detail', 'textarea'],
      ['actual_price', 'Actual Price', 'number'],
      ['discounted_price', 'Discounted Price', 'number'],
      ['category', 'Category', 'select'],
      ['status', 'Live', 'toggle']
    ]
  },
  Expense: {
    api: '/api/expenses',
    title: 'Expense',
    description: 'Record rent, salary, marketing, utilities and notes.',
    addLabel: 'Add Expense',
    stats: [
      ['Total Expense This Month', 'expense'],
      ['Highest Category', 'Marketing'],
      ['Pending Payments', '0'],
      ['Compared to Last Month', '+8%']
    ],
    columns: [
      { key: 'title', label: 'Expense Title' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', type: 'money' },
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'added_by', label: 'Added By' }
    ],
    fields: [
      ['title', 'Title', 'text'],
      ['category', 'Category', 'select', ['Rent', 'Salary', 'Marketing', 'Utilities', 'Other']],
      ['amount', 'Amount', 'number'],
      ['date', 'Date', 'date'],
      ['payment_method', 'Payment Method', 'select', ['Cash', 'Bank', 'Easypaisa', 'JazzCash']],
      ['receipt_url', 'Receipt Image URL', 'url'],
      ['added_by', 'Added By', 'text'],
      ['notes', 'Notes', 'textarea']
    ]
  },
  'Whole Sellers': {
    api: '/api/wholesellers',
    title: 'Whole Sellers',
    description: 'Manage suppliers, purchase value and due payments.',
    addLabel: 'Add Wholesaler',
    stats: [
      ['Total Wholesalers', 'total'],
      ['Total Purchase Value', 'purchases'],
      ['Payment Due', 'due'],
      ['Active Suppliers', 'active']
    ],
    columns: [
      { key: 'business_name', label: 'Wholesaler Name' },
      { key: 'contact_person', label: 'Contact Person' },
      { key: 'phone', label: 'Phone' },
      { key: 'products_supplied', label: 'Products Supplied' },
      { key: 'total_purchases', label: 'Total Purchases', type: 'money' },
      { key: 'payment_due', label: 'Payment Due', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['business_name', 'Business Name', 'text'],
      ['contact_person', 'Contact Person', 'text'],
      ['phone', 'Phone', 'text'],
      ['email', 'Email', 'email'],
      ['address', 'Address', 'textarea'],
      ['products_supplied', 'Products They Supply', 'text'],
      ['total_purchases', 'Total Purchases', 'number'],
      ['payment_due', 'Payment Due', 'number'],
      ['status', 'Active', 'toggle']
    ]
  }
};

function computeStats(page, rows, summary = {}) {
  const total = rows.length;
  const sum = (key) => rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
  const active = rows.filter((row) => ['Active', 'Live', 'In Stock'].includes(String(row.status))).length;
  const low = rows.filter((row) => String(row.status) === 'Low' || Number(row.quantity || row.stock_qty || 99) <= Number(row.reorder_level || 10)).length;
  const values = {
    total,
    active,
    clicks: sum('click_count').toLocaleString('en-PK'),
    soon: rows.filter((row) => row.end_date && new Date(row.end_date) < new Date(Date.now() + 7 * 86400000)).length,
    discount: `${sum('discount_value')}%`,
    used: sum('used_count'),
    today: rows.filter((row) => String(row.valid_till || '').slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
    low,
    out: rows.filter((row) => String(row.status) === 'Out' || Number(row.quantity || 1) <= 0).length,
    value: money(sum('quantity') * 5000 || sum('stock_qty') * 5000),
    pending: rows.filter((row) => ['Pending', 'Requested'].includes(row.order_status || row.status)).length,
    revenue: money(sum('total_amount')),
    cancelled: rows.filter((row) => row.order_status === 'Cancelled').length,
    refund: money(sum('refund_amount')),
    admins: rows.filter((row) => row.role === 'Admin').length,
    new: rows.filter((row) => String(row.created_at || '').startsWith(new Date().toISOString().slice(0, 7))).length,
    repeat: rows.filter((row) => Number(row.total_orders || 0) > 1).length,
    aov: money(sum('total_spent') / Math.max(sum('total_orders'), 1)),
    stock: sum('stock_qty'),
    expense: money(sum('amount')),
    purchases: money(sum('total_purchases')),
    due: money(sum('payment_due'))
  };
  if (page.title === 'Coupons') {
    values.used = rows.reduce((acc, row) => acc + Number(row.used_count || 0), 0);
    values.active = rows.filter((row) => String(row.status) === 'Active').length;
    values.soon = rows.filter((row) => row.valid_till && new Date(row.valid_till) < new Date(Date.now() + 7 * 86400000)).length;
  }
  if (page.title === 'Ads') {
    values.running = rows.filter((row) => {
      const show = String(row.show_on_website || '').toLowerCase();
      const fromOk = !row.valid_from || new Date(row.valid_from) <= new Date();
      const tillOk = !row.valid_till || new Date(row.valid_till) >= new Date();
      return ['yes', 'active', 'true', '1'].includes(show) && fromOk && tillOk;
    }).length;
  }
  return (page.stats || []).map(([label, key]) => ({ label, value: values[key] ?? key }));
}

function StatusBadge({ value }) {
  const text = String(value ?? 'Active');
  const warn = ['Low', 'Out', 'Cancelled', 'Rejected', 'Suspended', 'Inactive', 'Pending', 'Requested', 'Unread'].includes(text);
  return <mark className={warn ? 'low' : ''}>{text}</mark>;
}

function StatCard({ label, value, icon: Icon = BadgeDollarSign }) {
  return (
    <article className="metric-card">
      <div className="metric-icon"><Icon size={20} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <em>Live</em>
    </article>
  );
}

function Toast({ toast, onClose }) {
  React.useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 2400);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return toast ? <div className={`toast ${toast.type}`}>{toast.message}</div> : null;
}

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, index) => (
    <tr key={index}>
      <td colSpan="9"><div className="skeleton-line" /></td>
    </tr>
  ));
}

function formatCell(row, column) {
  const value = row[column.key];
  if (column.type === 'money') return money(value);
  if (column.type === 'date') return value ? new Date(value).toLocaleDateString() : '-';
  if (column.prefix) return `${column.prefix}${value}`;
  return value ?? '-';
}

function firstImageSource(value) {
  if (!value) return '';
  if (Array.isArray(value)) return value.find(Boolean) || '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.find(Boolean) || '';
    } catch {
      return trimmed;
    }
  }
  return '';
}

function DataTable({ columns, rows, loading, sort, onSort, onEdit, onDelete, onView, readonly }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                <button className="sort-btn" onClick={() => onSort(column.key)}>
                  {column.label}
                  {sort.key === column.key ? (sort.order === 'ASC' ? ' ↑' : ' ↓') : ''}
                </button>
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? <SkeletonRows /> : null}
          {!loading && rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1}>
                <div className="empty-state">
                  <PackageOpen size={36} />
                  <strong>No records found</strong>
                  <span>Use filters or add a new record to get started.</span>
                </div>
              </td>
            </tr>
          ) : null}
          {!loading && rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.type === 'status' ? <StatusBadge value={row[column.key]} /> : null}
                  {column.type === 'image' ? (firstImageSource(row[column.key] || row.image_url || row.product_images) ? <img className="table-image" src={firstImageSource(row[column.key] || row.image_url || row.product_images)} alt="" /> : <span className="product-thumb"><Upload size={14} /></span>) : null}
                  {column.type === 'avatar' ? <span className="admin-avatar mini">{String(row.name || row.business_name || 'A').slice(0, 2).toUpperCase()}</span> : null}
                  {!['status', 'image', 'avatar'].includes(column.type) ? formatCell(row, column) : null}
                </td>
              ))}
              <td>
                <div className="row-actions">
                  <button className="icon-btn small" onClick={() => onView(row)} aria-label="View"><Eye size={15} /></button>
                  {!readonly ? <button className="icon-btn small" onClick={() => onEdit(row)} aria-label="Edit"><Edit3 size={15} /></button> : null}
                  {!readonly ? <button className="icon-btn small danger" onClick={() => onDelete(row)} aria-label="Delete"><Trash2 size={15} /></button> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterBar({ search, setSearch, filter, setFilter, dateFrom, setDateFrom, dateTo, setDateTo }) {
  return (
    <div className="filter-bar">
      <div className="search-box">
        <Search size={18} />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records..." />
      </div>
      <select value={filter} onChange={(event) => setFilter(event.target.value)}>
        <option value="">All Status</option>
        <option>Active</option>
        <option>Live</option>
        <option>Pending</option>
        <option>Low</option>
        <option>Inactive</option>
      </select>
      <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
      <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
    </div>
  );
}

function Modal({ title, fields = [], initial, onClose, onSubmit, viewOnly = false, optionMap = {} }) {
  const [form, setForm] = React.useState(() => ({ status: 'Active', ...initial }));

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function updateImageField(key, files, multiple = false) {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    if (multiple) {
      const dataUrls = await Promise.all(selectedFiles.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      })));
      setField(key, JSON.stringify(dataUrls.filter(Boolean)));
      return;
    }
    const file = selectedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setField(key, String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  function previewImages(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        return value ? [value] : [];
      }
      return [];
    }
    return [];
  }

  const details = viewOnly ? Object.entries(initial || {}).filter(([key]) => !['password_hash', 'viewOnly'].includes(key)) : [];

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <div className="panel-head">
          <div>
            <h2>{title}</h2>
            <p>{viewOnly ? 'Record details' : 'Fill the required details and save changes.'}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {viewOnly ? (
          <div className="view-grid">
            {details.map(([key, value]) => <div key={key}><span>{key}</span><strong>{String(value ?? '-')}</strong></div>)}
          </div>
        ) : (
          <div className="form-grid">
            {fields.map(([key, label, type, options]) => (
              <label key={key} className={type === 'textarea' ? 'wide' : ''}>
                <span>{label}</span>
                {type === 'select' ? (
                  <select value={form[key] || (Array.isArray(options) ? options[0] : optionMap[key]?.[0] || '')} onChange={(event) => setField(key, event.target.value)}>
                    {(Array.isArray(options) ? options : optionMap[key] || []).map((option) => <option key={option}>{option}</option>)}
                  </select>
                ) : null}
                {type === 'textarea' ? (
                  <textarea value={form[key] || ''} onChange={(event) => setField(key, event.target.value)} />
                ) : null}
                {type === 'toggle' ? (
                  <input type="checkbox" checked={['Active', 'Live'].includes(String(form[key]))} onChange={(event) => setField(key, event.target.checked ? 'Active' : 'Inactive')} />
                ) : null}
                {type === 'image' ? (
                  <>
                    <input type="file" accept="image/*" onChange={(event) => updateImageField(key, event.target.files)} />
                    {firstImageSource(form[key]) ? <img className="field-image-preview" src={firstImageSource(form[key])} alt="" /> : null}
                  </>
                ) : null}
                {type === 'images' ? (
                  <>
                    <input type="file" accept="image/*" multiple onChange={(event) => updateImageField(key, event.target.files, true)} />
                    <div className="field-gallery">
                      {previewImages(form[key]).map((src, index) => <img key={`${src}-${index}`} className="field-image-preview" src={src} alt="" />)}
                    </div>
                  </>
                ) : null}
                {type === 'readonly' ? (
                  <input type="text" value={form[key] || ''} readOnly />
                ) : null}
                {!['select', 'textarea', 'toggle', 'image', 'images', 'readonly'].includes(type) ? (
                  <input type={type} value={form[key] || ''} onChange={(event) => setField(key, event.target.value)} />
                ) : null}
              </label>
            ))}
          </div>
        )}
        {!viewOnly ? (
          <div className="modal-actions">
            <button type="button" className="filter-btn" onClick={onClose}>Cancel</button>
            <button className="primary-btn" type="submit">Save</button>
          </div>
        ) : (
          <div className="modal-actions">
            <button type="button" className="primary-btn" onClick={onClose}>Close</button>
          </div>
        )}
      </form>
    </div>
  );
}

function Dashboard({ session, businessId, businessName, role, onToast }) {
  const [summary, setSummary] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch('/api/dashboard/summary', { session, businessId })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setSummary(data);
      })
      .catch((error) => onToast({ type: 'error', message: error.message }))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [session, businessId, onToast]);

  const cards = [
    { label: 'Revenue', value: money(summary?.orders?.revenue), icon: CircleDollarSign },
    { label: 'Orders', value: Number(summary?.orders?.total || 0).toLocaleString('en-PK'), icon: ShoppingBag },
    { label: 'Active Products', value: Number(summary?.products?.active || 0).toLocaleString('en-PK'), icon: PackageCheck },
    { label: 'Low Stock', value: Number(summary?.stock?.low || 0).toLocaleString('en-PK'), icon: PackageOpen },
    { label: 'Unread Alerts', value: Number(summary?.notifications?.unread || 0).toLocaleString('en-PK'), icon: Bell },
    { label: 'Coupons', value: Number(summary?.coupons?.active || 0).toLocaleString('en-PK'), icon: TicketPercent }
  ];

  if (role === 'SuperAdmin') {
    cards.push({ label: 'Businesses', value: Number(summary?.businesses?.total || 0).toLocaleString('en-PK'), icon: Building2 });
  }

  return (
    <>
      <section className="hero-band">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{businessName || 'Store Overview'}</h1>
          <p>{role === 'SuperAdmin' ? 'Superadmin can create business accounts, manage stock alerts, coupons and switch between tenants.' : 'Business dashboard with stock, coupons, orders and alerts for your own store.'}</p>
        </div>
        <div className="hero-product">
          <span>{loading ? 'Loading' : 'Live Summary'}</span>
          <div className="hoodie-art"><div className="hoodie-body" /><div className="hoodie-sleeve left" /><div className="hoodie-sleeve right" /><div className="hoodie-pocket" /></div>
          <strong>{loading ? '...' : money(summary?.orders?.revenue || 0)}</strong>
        </div>
      </section>

      <section className="metric-grid">
        {cards.map((card) => <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />)}
      </section>

      <section className="content-grid dashboard-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Low Stock Alerts</h2>
              <p>These items are already near reorder level.</p>
            </div>
          </div>
          <div className="order-list">
            {(summary?.lowStockItems || []).length ? summary.lowStockItems.map((item) => (
              <div className="order-row" key={`${item.product_name}-${item.sku}`}>
                <div>
                  <strong>{item.product_name}</strong>
                  <span>{item.sku} · {item.warehouse}</span>
                </div>
                <b>{item.quantity} / {item.reorder_level}</b>
              </div>
            )) : (
              <div className="empty-state">
                <Sparkles size={34} />
                <strong>No low stock alerts</strong>
                <span>Once an item drops below reorder level, it will appear here and in notifications.</span>
              </div>
            )}
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Quick Status</h2>
              <p>Current tenant context and live metrics.</p>
            </div>
          </div>
          <div className="order-list">
            <div className="order-row"><strong>Business</strong><b>{businessName || 'All'}</b></div>
            <div className="order-row"><strong>Products</strong><b>{Number(summary?.products?.total || 0).toLocaleString('en-PK')}</b></div>
            <div className="order-row"><strong>Coupons</strong><b>{Number(summary?.coupons?.total || 0).toLocaleString('en-PK')}</b></div>
            <div className="order-row"><strong>Unread Notifications</strong><b>{Number(summary?.notifications?.unread || 0).toLocaleString('en-PK')}</b></div>
          </div>
        </div>
      </section>
    </>
  );
}

function RevenuePage({ session, businessId, onToast }) {
  const [summary, setSummary] = React.useState(null);
  const [chart, setChart] = React.useState([]);

  React.useEffect(() => {
    Promise.all([
      apiFetch('/api/revenue/summary', { session, businessId }).then((res) => res.json()),
      apiFetch('/api/revenue/chart', { session, businessId }).then((res) => res.json())
    ])
      .then(([summaryData, chartData]) => {
        setSummary(summaryData);
        setChart(chartData.rows || []);
      })
      .catch((error) => onToast({ type: 'error', message: error.message }));
  }, [session, businessId, onToast]);

  const chartBars = chart.length ? chart : [{ revenue: 40000 }, { revenue: 65000 }, { revenue: 83000 }, { revenue: 52000 }];

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Revenue</p>
          <h1>Revenue</h1>
          <p>Revenue, net profit, payment split and trend chart for the selected business.</p>
        </div>
      </section>
      <section className="metric-grid">
        <StatCard label="Total Revenue" value={money(summary?.totalRevenue)} icon={CircleDollarSign} />
        <StatCard label="Net Profit" value={money(summary?.netProfit)} icon={BadgeDollarSign} />
        <StatCard label="Avg Order Value" value={money(summary?.avgOrderValue)} icon={PackageCheck} />
        <StatCard label="Growth" value={`${summary?.growth || 0}%`} icon={ChartNoAxesCombined} />
      </section>
      <section className="content-grid revenue-layout">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Revenue Over Time</h2>
              <p>Daily, weekly and monthly reporting base.</p>
            </div>
            <button className="primary-btn">Export Report</button>
          </div>
          <div className="chart-bars">
            {chartBars.map((bar, index) => (
              <span key={index} style={{ height: `${Math.max(Number(bar.revenue) / 1200, 18)}px` }} />
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Payment Breakdown</h2>
          {(summary?.payments || []).map((payment) => (
            <div className="order-row" key={payment.payment_method}>
              <strong>{payment.payment_method}</strong>
              <b>{money(payment.amount)}</b>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function NotificationsPage({ session, businessId, onToast }) {
  const [items, setItems] = React.useState([]);
  const [tab, setTab] = React.useState('All');

  const load = React.useCallback(() => {
    apiFetch('/api/notifications?limit=100', { session, businessId })
      .then((res) => res.json())
      .then((data) => setItems(data.rows || []))
      .catch((error) => onToast({ type: 'error', message: error.message }));
  }, [session, businessId, onToast]);

  React.useEffect(() => { load(); }, [load]);

  const visible = tab === 'All' ? items : items.filter((item) => item.type === tab);

  async function markAllRead() {
    const response = await apiFetch('/api/notifications/mark-all-read', { method: 'PUT', session, businessId });
    const data = await response.json();
    if (!response.ok) return onToast({ type: 'error', message: data.message || 'Failed to update notifications' });
    onToast({ type: 'success', message: 'All notifications marked as read' });
    load();
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Notifications</p>
          <h1>Notifications</h1>
          <p>Order alerts, stock warnings, customer updates and system messages.</p>
        </div>
        <button className="primary-btn" onClick={markAllRead}>Mark All Read</button>
      </section>
      <div className="tabs">{['All', 'Orders', 'Stock Alerts', 'Customers', 'System'].map((item) => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
      <section className="notification-list">
        {visible.map((item) => (
          <article className={`notification-item ${item.is_read ? '' : 'unread'}`} key={item.id}>
            <Bell size={20} />
            <div>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
              <span>{item.created_at ? new Date(item.created_at).toLocaleString() : '-'}</span>
            </div>
            <StatusBadge value={item.is_read ? 'Read' : 'Unread'} />
          </article>
        ))}
        {!visible.length ? (
          <div className="empty-state">
            <Bell size={34} />
            <strong>No notifications</strong>
            <span>Stock alerts and order updates will appear here.</span>
          </div>
        ) : null}
      </section>
    </>
  );
}

function BusinessesPage({ session, businessId, onToast }) {
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState(null);

  const load = React.useCallback(() => {
    setLoading(true);
    apiFetch('/api/business-accounts', { session, businessId })
      .then((res) => res.json())
      .then((data) => setRows(data.rows || []))
      .catch((error) => onToast({ type: 'error', message: error.message }))
      .finally(() => setLoading(false));
  }, [session, businessId, onToast]);

  React.useEffect(() => { load(); }, [load]);

  async function submit(form) {
    const isEdit = Boolean(form.id);
    const payload = {
      business_name: form.business_name,
      username: form.username,
      owner_name: form.owner_name,
      cnic: form.cnic,
      address: form.address,
      email: form.email,
      phone: form.phone,
      agreement_image: form.agreement_image,
      role: form.role || 'BusinessAdmin',
      status: form.status || 'Active'
    };
    if (form.password) payload.password = form.password;
    const response = await apiFetch(`/api/business-accounts${isEdit ? `/${form.id}` : ''}`, {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(payload),
      session,
      businessId
    });
    const data = await response.json();
    if (!response.ok) return onToast({ type: 'error', message: data.message || 'Unable to save account' });
    onToast({ type: 'success', message: isEdit ? 'Business account updated' : 'Business account created' });
    setModal(null);
    load();
  }

  async function remove(row) {
    if (!window.confirm(`Delete ${row.business_name}?`)) return;
    const response = await apiFetch(`/api/business-accounts/${row.id}`, { method: 'DELETE', session, businessId });
    const data = await response.json();
    if (!response.ok) return onToast({ type: 'error', message: data.message || 'Delete failed' });
    onToast({ type: 'success', message: 'Business account deleted' });
    load();
  }

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Stores</p>
          <h1>Stores</h1>
          <p>Create a store login with owner, CNIC, contact and agreement image.</p>
        </div>
        <button className="primary-btn" onClick={() => setModal({})}><Plus size={17} />Add Store</button>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Store Accounts</h2>
            <p>Each store gets its own username, password and dashboard context.</p>
          </div>
        </div>
        <DataTable
          columns={[
            { key: 'business_name', label: 'Business Name' },
            { key: 'username', label: 'Username' },
            { key: 'owner_name', label: 'Owner' },
            { key: 'cnic', label: 'CNIC' },
            { key: 'phone', label: 'Contact No' },
            { key: 'email', label: 'Email' },
            { key: 'agreement_image', label: 'Agreement', type: 'image' },
            { key: 'role', label: 'Role' },
            { key: 'status', label: 'Status', type: 'status' },
            { key: 'last_login', label: 'Last Login', type: 'date' }
          ]}
          rows={rows}
          loading={loading}
          sort={{ key: 'id', order: 'DESC' }}
          onSort={() => {}}
          onView={(row) => setModal({ ...row, viewOnly: true })}
          onEdit={(row) => setModal(row)}
          onDelete={remove}
          readonly={false}
        />
      </section>

      {modal ? (
        <Modal
          title={`${modal.id ? modal.viewOnly ? 'View' : 'Edit' : 'Add'} Store`}
          initial={modal}
          viewOnly={Boolean(modal.viewOnly)}
      fields={modal.viewOnly ? [] : [
            ['business_name', 'Name', 'text'],
            ['username', 'Username', 'text'],
            ['password', 'Password', 'password'],
            ['owner_name', 'Owner Name', 'text'],
            ['cnic', 'CNIC', 'text'],
            ['phone', 'Contact No', 'text'],
            ['email', 'Email', 'email'],
            ['address', 'Address', 'textarea'],
            ['agreement_image', 'Agreement Image', 'image'],
            ['role', 'Role', 'select', ['BusinessAdmin', 'Manager']],
            ['status', 'Active', 'toggle']
          ]}
          onClose={() => setModal(null)}
          onSubmit={submit}
        />
      ) : null}
    </>
  );
}

function AdminPage({ config, session, businessId, onToast }) {
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [sort, setSort] = React.useState({ key: 'id', order: 'DESC' });
  const [loading, setLoading] = React.useState(true);
  const [modal, setModal] = React.useState(null);
  const [categoryOptions, setCategoryOptions] = React.useState([]);
  const pageSize = 8;

  const loadRows = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: pageSize, search, sort: sort.key, order: sort.order });
      const response = await apiFetch(`${config.api}?${params}`, { session, businessId });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load records');
      let loaded = data.rows || [];
      if (filter) loaded = loaded.filter((row) => [row.status, row.order_status, row.payment_status].includes(filter));
      if (dateFrom) loaded = loaded.filter((row) => new Date(row.created_at || row.date || row.start_date) >= new Date(dateFrom));
      if (dateTo) loaded = loaded.filter((row) => new Date(row.created_at || row.date || row.end_date) <= new Date(dateTo));
      setRows(loaded);
      setTotal(data.total || loaded.length);
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, [config.api, dateFrom, dateTo, filter, page, search, session, sort, businessId, onToast]);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  React.useEffect(() => {
    if (config.api !== '/api/products') return undefined;
    let mounted = true;
    apiFetch('/api/categories?limit=200&sort=name&order=ASC', { session, businessId })
      .then((response) => response.json())
      .then((data) => {
        if (!mounted) return;
        setCategoryOptions((data.rows || []).map((row) => row.name).filter(Boolean));
      })
      .catch(() => {
        if (mounted) setCategoryOptions([]);
      });
    return () => { mounted = false; };
  }, [businessId, config.api, session]);

  async function saveRecord(form) {
    try {
      const isEdit = Boolean(form.id);
      const url = config.special === 'stock' ? '/api/stock/adjust' : `${config.api}${isEdit ? `/${form.id}` : ''}`;
      const payload = { ...form };
      if (config.api === '/api/products') {
        const images = firstImageSource(payload.product_images) ? (Array.isArray(payload.product_images) ? payload.product_images : (() => {
          try {
            const parsed = JSON.parse(payload.product_images);
            return Array.isArray(parsed) ? parsed : [payload.product_images];
          } catch {
            return [payload.product_images];
          }
        })()) : [];
        if (images.length) payload.image_url = images[0];
      }
      const response = await apiFetch(url, {
        method: config.special === 'stock' ? 'POST' : isEdit ? 'PUT' : 'POST',
        session,
        businessId,
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Save failed');
      onToast({ type: 'success', message: 'Record saved successfully' });
      setModal(null);
      loadRows();
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    }
  }

  async function deleteRecord(row) {
    try {
      const response = await apiFetch(`${config.api}/${row.id}`, { method: 'DELETE', session, businessId });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Delete failed');
      onToast({ type: 'success', message: 'Record deleted' });
      loadRows();
    } catch (error) {
      onToast({ type: 'error', message: error.message });
    }
  }

  function changeSort(key) {
    setSort((current) => ({ key, order: current.key === key && current.order === 'ASC' ? 'DESC' : 'ASC' }));
  }

  const stats = computeStats(config, rows);
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">{config.title}</p>
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        {!config.readonly ? <button className="primary-btn" onClick={() => setModal({})}><Plus size={17} />{config.addLabel}</button> : null}
      </section>
      <FilterBar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo} />
      <section className="metric-grid">
        {stats.map((stat, index) => <StatCard key={stat.label} label={stat.label} value={stat.value} icon={[ShoppingBag, CircleDollarSign, PackageCheck, PackageOpen][index]} />)}
      </section>
      {config.title === 'Revenue' ? <RevenuePage session={session} businessId={businessId} onToast={onToast} /> : null}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>{config.title} Records</h2>
            <p>Search, sort, paginate and manage records from one place.</p>
          </div>
          {config.title === 'Stock' ? <button className="filter-btn">CSV Import</button> : null}
        </div>
        <DataTable
          columns={config.columns}
          rows={rows}
          loading={loading}
          sort={sort}
          onSort={changeSort}
          onView={(row) => setModal({ ...row, viewOnly: true })}
          onEdit={(row) => setModal(row)}
          onDelete={deleteRecord}
          readonly={config.readonly}
        />
        <div className="pagination">
          <button className="filter-btn" disabled={page === 1} onClick={() => setPage((value) => Math.max(value - 1, 1))}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button className="filter-btn" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(value + 1, totalPages))}>Next</button>
        </div>
      </section>
      {modal ? <Modal title={`${modal.id ? modal.viewOnly ? 'View' : 'Edit' : 'Add'} ${config.title}`} fields={modal.viewOnly ? [] : config.fields} initial={modal} viewOnly={Boolean(modal.viewOnly)} optionMap={config.api === '/api/products' ? { category: categoryOptions } : {}} onClose={() => setModal(null)} onSubmit={saveRecord} /> : null}
    </>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = React.useState('admin');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const formData = new FormData(event.currentTarget);
    const loginUsername = String(formData.get('username') || username || '').trim();
    const loginPassword = String(formData.get('password') || password || '');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login failed');
      onLogin(data.user, data.businessId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-shell">
      <section className="login-panel">
        <div className="brand-row">
          <div className="brand-mark">A</div>
          <div><strong>APEXIUMS</strong><span>Super Store</span></div>
        </div>
        <h1>Multi business ecommerce admin</h1>
        <p>Superadmin can create business accounts, assign login credentials and manage stock alerts from one dashboard.</p>
        <div className="login-feature">
          <Sparkles size={18} />
          <span>Low stock notifications are generated automatically.</span>
        </div>
        <div className="login-feature">
          <Building2 size={18} />
          <span>Each seller gets a separate dashboard context.</span>
        </div>
      </section>
      <section className="login-card">
        <form onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">Sign In</p>
            <h2>Access your dashboard</h2>
            <p>Use your username and password to continue.</p>
          </div>
          <label>
            <span>Username</span>
            <input name="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            <span>Password</span>
            <input name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="login-error">{error}</p> : null}
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? <Loader2 className="spin" size={17} /> : <LogIn size={17} />}
            {loading ? 'Signing in...' : 'Login'}
          </button>
          <div className="login-hint">
            <strong>Superadmin access</strong>
            <span>Use your assigned username and password.</span>
          </div>
        </form>
      </section>
    </div>
  );
}

function App() {
  const [session, setSession] = React.useState(() => readSession());
  const [businesses, setBusinesses] = React.useState([]);
  const [activePage, setActivePage] = React.useState('Dashboard');
  const [open, setOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const [apiStatus, setApiStatus] = React.useState('Checking API...');
  const [activeBusinessId, setActiveBusinessId] = React.useState(() => {
    const stored = readSession();
    return stored?.role === 'SuperAdmin' ? null : (stored?.businessId || stored?.id || null);
  });

  React.useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((data) => setApiStatus(data.ok ? `API connected: ${data.database}` : 'API not ready'))
      .catch(() => setApiStatus('API offline'));
  }, []);

  React.useEffect(() => {
    if (!session) return;
    const defaultBusinessId = session.role === 'SuperAdmin' ? null : (session.businessId || session.id);
    setActiveBusinessId(defaultBusinessId);
  }, [session]);

  const navItems = getNavItems(session?.role);

  React.useEffect(() => {
    if (!session) return undefined;
    apiFetch('/api/business-accounts', { session, businessId: activeBusinessId })
      .then((res) => res.json())
      .then((data) => setBusinesses(data.rows || []))
      .catch(() => setBusinesses([]));
    return undefined;
  }, [session, activeBusinessId]);

  function handleLogin(user, businessId) {
    const stored = { ...user, businessId };
    saveSession(stored);
    setSession(stored);
    setActiveBusinessId(stored.role === 'SuperAdmin' ? 1 : stored.businessId || stored.id);
    setActivePage('Dashboard');
  }

  function logout() {
    saveSession(null);
    setSession(null);
    setBusinesses([]);
    setActivePage('Dashboard');
  }

  const activeBusiness = activeBusinessId ? businesses.find((item) => Number(item.id) === Number(activeBusinessId)) : null;

  if (!session) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark">A</div>
          <div><strong>APEXIUMS</strong><span>Super Store</span></div>
          <button className="icon-btn close-mobile" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="nav-list" aria-label="Admin modules">
          {navItems.map((section) => (
            <div className="nav-section" key={section.heading}>
              <div className="nav-heading">{section.heading}</div>
              <div className="nav-section-items">
                {section.items.map(({ label, target, icon: Icon }) => {
                  const pageKey = target || label;
                  return (
                    <button
                      key={label}
                      className={`nav-item ${activePage === pageKey ? 'active' : ''}`}
                      onClick={() => { setActivePage(pageKey); setOpen(false); }}
                    >
                      <Icon size={18} />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="sidebar-card">
          <WalletCards size={20} />
          <strong>{activeBusiness?.business_name || 'Business context'}</strong>
          <span>Business ID {activeBusinessId}</span>
          <div className="progress"><i /></div>
        </div>
        <div className="sidebar-card api-card">
          <BadgeDollarSign size={20} />
          <strong>Backend</strong>
          <span>{apiStatus}</span>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <div className="search-box"><Search size={18} /><input placeholder="Search orders, products, customers..." /></div>
        {session.role === 'SuperAdmin' ? (
          <select className="business-switcher" value={activeBusinessId ?? ''} onChange={(event) => setActiveBusinessId(event.target.value ? Number(event.target.value) : null)}>
              <option value="">All Businesses</option>
              {businesses.map((business) => <option key={business.id} value={business.id}>{business.business_name}</option>)}
            </select>
          ) : (
            <button className="filter-btn"><span>{activeBusiness?.business_name || 'Business'}</span></button>
          )}
          <button className="icon-btn" aria-label="Notifications"><Bell size={19} /></button>
          <button className="icon-btn" aria-label="Logout" onClick={logout}><LogOut size={18} /></button>
        </header>

        {activePage === 'Dashboard' ? <Dashboard session={session} businessId={activeBusinessId} businessName={activeBusiness?.business_name} role={session.role} onToast={setToast} /> : null}
        {activePage === 'Revenue' ? <RevenuePage session={session} businessId={activeBusinessId} onToast={setToast} /> : null}
        {activePage === 'Notifications' ? <NotificationsPage session={session} businessId={activeBusinessId} onToast={setToast} /> : null}
        {activePage === 'Businesses' && session.role === 'SuperAdmin' ? <BusinessesPage session={session} businessId={activeBusinessId} onToast={setToast} /> : null}
        {pageConfigs[activePage] && activePage !== 'Revenue' && activePage !== 'Notifications' && activePage !== 'Businesses' ? (
          <AdminPage config={pageConfigs[activePage]} session={session} businessId={activeBusinessId} onToast={setToast} />
        ) : null}
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
