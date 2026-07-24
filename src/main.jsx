import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeDollarSign,
  Bell,
  Boxes,
  ChartNoAxesCombined,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Edit3,
  Eye,
  Image,
  LayoutDashboard,
  Megaphone,
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
  Store,
  Tag,
  Trash2,
  Truck,
  Upload,
  Users,
  WalletCards,
  X
} from 'lucide-react';
import './styles.css';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-PK')}`;

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Banners', icon: Image },
  { label: 'Adds', icon: Megaphone },
  { label: 'Categories', icon: Tag },
  { label: 'Stock', icon: Boxes },
  { label: 'Orders', icon: ClipboardList },
  { label: 'Returns', icon: RefreshCcw },
  { label: 'Staff', icon: ShieldCheck },
  { label: 'Customers', icon: Users },
  { label: 'Product Listing', icon: Package },
  { label: 'Expense', icon: ReceiptText },
  { label: 'Whole Sellers', icon: Store },
  { label: 'Revenue', icon: ChartNoAxesCombined },
  { label: 'Notifications', icon: Bell }
];

const pageConfigs = {
  Banners: {
    api: '/api/banners',
    title: 'Banners',
    description: 'Manage home, category, and popup campaign banners.',
    addLabel: 'Add Banner',
    stats: [
      ['Total Banners', 'total'],
      ['Active Banners', 'active'],
      ['Total Clicks', 'clicks'],
      ['Expiring Soon', 'soon']
    ],
    columns: [
      { key: 'image_url', label: 'Banner Image', type: 'image' },
      { key: 'title', label: 'Title' },
      { key: 'position', label: 'Position' },
      { key: 'link', label: 'Link URL' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'start_date', label: 'Start Date', type: 'date' },
      { key: 'end_date', label: 'End Date', type: 'date' }
    ],
    fields: [
      ['image_url', 'Image URL', 'url'],
      ['title', 'Title', 'text'],
      ['link', 'Link URL', 'url'],
      ['position', 'Position', 'select', ['Home Top', 'Category', 'Popup']],
      ['start_date', 'Start Date', 'date'],
      ['end_date', 'End Date', 'date'],
      ['status', 'Active', 'toggle']
    ]
  },
  Adds: {
    api: '/api/promotions',
    title: 'Adds',
    description: 'Create ads, flash sales, discount campaigns, and coupons.',
    addLabel: 'Add Ad',
    stats: [
      ['Active Ads', 'active'],
      ['Total Discount Given', 'discount'],
      ['Coupon Redemptions', 'used'],
      ['Expiring Today', 'today']
    ],
    columns: [
      { key: 'name', label: 'Ad Name' },
      { key: 'type', label: 'Type' },
      { key: 'discount_value', label: 'Discount %' },
      { key: 'apply_scope', label: 'Applicable Products/Category' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'valid_till', label: 'Valid Till', type: 'date' }
    ],
    fields: [
      ['name', 'Ad Name', 'text'],
      ['type', 'Type', 'select', ['Flash Sale', 'Discount', 'Coupon']],
      ['discount_value', 'Discount Value', 'number'],
      ['apply_scope', 'Apply To', 'select', ['All Products', 'Category', 'Specific Products']],
      ['coupon_code', 'Coupon Code', 'text'],
      ['usage_limit', 'Usage Limit', 'number'],
      ['valid_from', 'Valid From', 'date'],
      ['valid_till', 'Valid Till', 'date'],
      ['status', 'Active', 'toggle']
    ]
  },
  Categories: {
    api: '/api/categories',
    title: 'Categories',
    description: 'Organize products with parent and subcategory structure.',
    addLabel: 'Add Category',
    stats: [
      ['Total Categories', 'total'],
      ['Active Categories', 'active'],
      ['Top Selling Category', 'Hoodies'],
      ['Empty Categories', '0']
    ],
    columns: [
      { key: 'image_url', label: 'Category Image', type: 'image' },
      { key: 'name', label: 'Name' },
      { key: 'parent_id', label: 'Parent Category' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['name', 'Name', 'text'],
      ['parent_id', 'Parent Category ID', 'number'],
      ['image_url', 'Icon/Image URL', 'url'],
      ['description', 'Description', 'textarea'],
      ['status', 'Active', 'toggle']
    ]
  },
  Stock: {
    api: '/api/stock',
    title: 'Stock',
    description: 'Track SKU levels, warehouse stock, and inventory adjustments.',
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
      { key: 'warehouse', label: 'Warehouse/Location' },
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
  Orders: {
    api: '/api/orders',
    title: 'Orders',
    description: 'Process pending, packed, shipped, delivered, and cancelled orders.',
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
    description: 'Approve, reject, refund, and review return requests.',
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
    description: 'Manage staff roles, module-wise permissions, and account status.',
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
    description: 'View customer profiles, spend, orders, and account status.',
    readonly: true,
    stats: [
      ['Total Customers', 'total'],
      ['New This Month', 'new'],
      ['Repeat Customers', 'repeat'],
      ['Avg Order Value', 'aov']
    ],
    columns: [
      { key: 'avatar_url', label: 'Photo/Avatar', type: 'avatar' },
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
    description: 'Create products with images, category, variants, stock, SEO, and status.',
    addLabel: 'Add Product',
    stats: [
      ['Active Products', 'active'],
      ['Total Stock', 'stock'],
      ['Low Products', 'low'],
      ['Catalog Value', 'value']
    ],
    columns: [
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'sku', label: 'Size/Color Variants' },
      { key: 'stock_qty', label: 'Stock' },
      { key: 'base_price', label: 'Price', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['image_url', 'Image URL', 'url'],
      ['name', 'Name', 'text'],
      ['description', 'Description', 'textarea'],
      ['category', 'Category', 'text'],
      ['base_price', 'Base Price', 'number'],
      ['discounted_price', 'Discounted Price', 'number'],
      ['sku', 'SKU', 'text'],
      ['stock_qty', 'Stock Qty', 'number'],
      ['slug', 'SEO Slug', 'text'],
      ['meta_title', 'Meta Title', 'text'],
      ['meta_desc', 'Meta Description', 'textarea'],
      ['status', 'Live', 'toggle']
    ]
  },
  Expense: {
    api: '/api/expenses',
    title: 'Expense',
    description: 'Record rent, salary, marketing, utilities, receipts, and notes.',
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
    description: 'Manage suppliers, purchase value, due payments, and purchase history.',
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

function computeStats(page, rows) {
  const active = rows.filter((row) => ['Active', 'Live', 'In Stock'].includes(row.status)).length;
  const total = rows.length;
  const sum = (key) => rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
  const low = rows.filter((row) => row.status === 'Low' || Number(row.quantity || row.stock_qty || 99) <= Number(row.reorder_level || 10)).length;
  const values = {
    total,
    active,
    clicks: sum('click_count').toLocaleString('en-PK'),
    soon: rows.filter((row) => row.end_date && new Date(row.end_date) < new Date(Date.now() + 7 * 86400000)).length,
    discount: `${sum('discount_value')}%`,
    used: sum('used_count'),
    today: rows.filter((row) => String(row.valid_till || '').slice(0, 10) === new Date().toISOString().slice(0, 10)).length,
    low,
    out: rows.filter((row) => row.status === 'Out' || Number(row.quantity || 1) <= 0).length,
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
  return (page.stats || []).map(([label, key]) => ({ label, value: values[key] ?? key }));
}

function StatusBadge({ value }) {
  const text = String(value ?? 'Active');
  const type = ['Low', 'Out', 'Cancelled', 'Rejected', 'Suspended', 'Inactive', 'Pending', 'Requested'].includes(text) ? 'warn' : 'ok';
  return <mark className={type === 'warn' ? 'low' : ''}>{text}</mark>;
}

function StatCard({ label, value, icon: Icon = BadgeDollarSign }) {
  return (
    <article className="metric-card">
      <div className="metric-icon"><Icon size={20} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
      <em>+12%</em>
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
                  {column.type === 'image' ? <span className="product-thumb"><Upload size={14} /></span> : null}
                  {column.type === 'avatar' ? <span className="admin-avatar mini">{String(row.name || 'A').slice(0, 2).toUpperCase()}</span> : null}
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

function Modal({ title, fields = [], initial, onClose, onSubmit }) {
  const [form, setForm] = React.useState(() => ({ status: 'Active', ...initial }));

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
        <div className="panel-head">
          <div>
            <h2>{title}</h2>
            <p>Fill the required details and save changes.</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="form-grid">
          {fields.map(([key, label, type, options]) => (
            <label key={key} className={type === 'textarea' ? 'wide' : ''}>
              <span>{label}</span>
              {type === 'select' ? (
                <select value={form[key] || options[0]} onChange={(event) => setField(key, event.target.value)}>
                  {options.map((option) => <option key={option}>{option}</option>)}
                </select>
              ) : null}
              {type === 'textarea' ? (
                <textarea value={form[key] || ''} onChange={(event) => setField(key, event.target.value)} />
              ) : null}
              {type === 'toggle' ? (
                <input type="checkbox" checked={['Active', 'Live'].includes(form[key])} onChange={(event) => setField(key, event.target.checked ? label : 'Inactive')} />
              ) : null}
              {!['select', 'textarea', 'toggle'].includes(type) ? (
                <input type={type} value={form[key] || ''} onChange={(event) => setField(key, event.target.value)} />
              ) : null}
            </label>
          ))}
        </div>
        <div className="permission-grid">
          {title.includes('Staff') ? navItems.map((item) => (
            <label key={item.label}>
              <input type="checkbox" defaultChecked />
              <span>{item.label}</span>
            </label>
          )) : null}
        </div>
        <div className="modal-actions">
          <button type="button" className="filter-btn" onClick={onClose}>Cancel</button>
          <button className="primary-btn" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}

function AdminPage({ config }) {
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
  const [toast, setToast] = React.useState(null);
  const pageSize = 8;

  const loadRows = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: pageSize, search, sort: sort.key, order: sort.order });
      const response = await fetch(`${config.api}?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load records');
      let loaded = data.rows || [];
      if (filter) loaded = loaded.filter((row) => [row.status, row.order_status, row.payment_status].includes(filter));
      if (dateFrom) loaded = loaded.filter((row) => new Date(row.created_at || row.date || row.start_date) >= new Date(dateFrom));
      if (dateTo) loaded = loaded.filter((row) => new Date(row.created_at || row.date || row.end_date) <= new Date(dateTo));
      setRows(loaded);
      setTotal(data.total || loaded.length);
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  }, [config.api, dateFrom, dateTo, filter, page, search, sort]);

  React.useEffect(() => { loadRows(); }, [loadRows]);

  async function saveRecord(form) {
    try {
      const isEdit = Boolean(form.id);
      const url = config.special === 'stock' ? '/api/stock/adjust' : `${config.api}${isEdit ? `/${form.id}` : ''}`;
      const response = await fetch(url, {
        method: config.special === 'stock' ? 'POST' : isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Save failed');
      setToast({ type: 'success', message: 'Record saved successfully' });
      setModal(null);
      loadRows();
    } catch (error) {
      setToast({ type: 'error', message: error.message });
    }
  }

  async function deleteRecord(row) {
    try {
      const response = await fetch(`${config.api}/${row.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Delete failed');
      setToast({ type: 'success', message: 'Record deleted' });
      loadRows();
    } catch (error) {
      setToast({ type: 'error', message: error.message });
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
      {config.title === 'Revenue' ? <RevenuePanel /> : null}
      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>{config.title} Records</h2>
            <p>Search, sort, paginate, and manage records from one place.</p>
          </div>
          {config.title === 'Product Listing' ? <button className="filter-btn">Bulk Actions</button> : null}
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
      {modal ? <Modal title={`${modal.id ? modal.viewOnly ? 'View' : 'Edit' : 'Add'} ${config.title}`} fields={modal.viewOnly ? [] : config.fields} initial={modal} onClose={() => setModal(null)} onSubmit={saveRecord} /> : null}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}

function Dashboard() {
  return (
    <>
      <section className="hero-band">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Store Overview</h1>
          <p>Sales, stock, orders, returns, customers, and operations for Apexiums Super Store.</p>
        </div>
        <div className="hero-product">
          <span>Featured</span>
          <div className="hoodie-art"><div className="hoodie-body" /><div className="hoodie-sleeve left" /><div className="hoodie-sleeve right" /><div className="hoodie-pocket" /></div>
          <strong>Rs 684K</strong>
        </div>
      </section>
      <section className="metric-grid">
        <StatCard label="Today Orders" value="248" icon={ShoppingBag} />
        <StatCard label="Revenue" value="Rs 684K" icon={CircleDollarSign} />
        <StatCard label="Active Products" value="1,482" icon={PackageCheck} />
        <StatCard label="Low Stock" value="26" icon={PackageOpen} />
      </section>
      <section className="module-grid">
        {navItems.slice(1).map(({ label, icon: Icon }) => <div className="module-tile" key={label}><Icon size={21} /><span>{label}</span></div>)}
      </section>
    </>
  );
}

function RevenuePanel() {
  const [summary, setSummary] = React.useState(null);
  const [chart, setChart] = React.useState([]);

  React.useEffect(() => {
    Promise.all([fetch('/api/revenue/summary').then((res) => res.json()), fetch('/api/revenue/chart').then((res) => res.json())])
      .then(([summaryData, chartData]) => {
        setSummary(summaryData);
        setChart(chartData.rows || []);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="content-grid revenue-layout">
      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Revenue Over Time</h2>
            <p>Daily, weekly, and monthly reporting base.</p>
          </div>
          <button className="primary-btn">Export Report</button>
        </div>
        <div className="chart-bars">
          {(chart.length ? chart : [{ revenue: 40000 }, { revenue: 65000 }, { revenue: 83000 }, { revenue: 52000 }]).map((bar, index) => (
            <span key={index} style={{ height: `${Math.max(Number(bar.revenue) / 1200, 18)}px` }} />
          ))}
        </div>
      </div>
      <div className="panel">
        <h2>Payment Breakdown</h2>
        {(summary?.payments || [{ payment_method: 'COD', amount: 18400 }, { payment_method: 'JazzCash', amount: 7950 }]).map((payment) => (
          <div className="order-row" key={payment.payment_method}>
            <strong>{payment.payment_method}</strong>
            <b>{money(payment.amount)}</b>
          </div>
        ))}
      </div>
    </section>
  );
}

function NotificationsPage() {
  const config = {
    api: '/api/notifications',
    title: 'Notifications',
    description: 'Order alerts, stock warnings, customer updates, and system messages.',
    readonly: true,
    stats: [['All', 'total'], ['Unread', 'pending'], ['Orders', 'Orders'], ['System', 'System']],
    columns: []
  };
  const [items, setItems] = React.useState([]);
  const [tab, setTab] = React.useState('All');

  React.useEffect(() => {
    fetch('/api/notifications').then((res) => res.json()).then((data) => setItems(data.rows || []));
  }, []);

  const visible = tab === 'All' ? items : items.filter((item) => item.type === tab);

  return (
    <>
      <section className="page-head">
        <div>
          <p className="eyebrow">Notifications</p>
          <h1>Notifications</h1>
          <p>{config.description}</p>
        </div>
        <button className="primary-btn">Mark All Read</button>
      </section>
      <div className="tabs">{['All', 'Orders', 'Stock Alerts', 'Customers', 'System'].map((item) => <button className={tab === item ? 'active' : ''} onClick={() => setTab(item)} key={item}>{item}</button>)}</div>
      <section className="notification-list">
        {visible.map((item) => (
          <article className={`notification-item ${item.is_read ? '' : 'unread'}`} key={item.id}>
            <Bell size={20} />
            <div>
              <strong>{item.title}</strong>
              <p>{item.message}</p>
              <span>{new Date(item.created_at).toLocaleString()}</span>
            </div>
            <StatusBadge value={item.is_read ? 'Read' : 'Unread'} />
          </article>
        ))}
      </section>
    </>
  );
}

function App() {
  const [active, setActive] = React.useState('Dashboard');
  const [open, setOpen] = React.useState(false);
  const [apiStatus, setApiStatus] = React.useState('Checking API...');

  React.useEffect(() => {
    fetch('/api/health')
      .then((response) => response.json())
      .then((data) => setApiStatus(data.ok ? `API connected: ${data.database}` : 'API not ready'))
      .catch(() => setApiStatus('API offline'));
  }, []);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark">A</div>
          <div><strong>APEXIUMS</strong><span>Super Store</span></div>
          <button className="icon-btn close-mobile" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="nav-list" aria-label="Admin modules">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); setOpen(false); }}>
              <Icon size={18} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <WalletCards size={20} />
          <strong>Monthly Target</strong>
          <span>Rs 2.8M / Rs 4M</span>
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
          <button className="filter-btn"><span>Today</span><ChevronDown size={16} /></button>
          <button className="icon-btn" aria-label="Notifications"><Bell size={19} /></button>
          <div className="admin-avatar">AM</div>
        </header>
        {active === 'Dashboard' ? <Dashboard /> : null}
        {active === 'Revenue' ? <AdminPage config={{ ...pageConfigs.Orders, title: 'Revenue', description: 'Revenue, net profit, charts, payment split, and report export.', stats: [['Total Revenue', 'revenue'], ['Net Profit', 'revenue'], ['Avg Order Value', 'aov'], ['Growth %', '+12%']] }} /> : null}
        {active === 'Notifications' ? <NotificationsPage /> : null}
        {pageConfigs[active] && active !== 'Revenue' && active !== 'Notifications' ? <AdminPage config={pageConfigs[active]} /> : null}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
