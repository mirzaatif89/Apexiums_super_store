import React from 'react';
import {
  BadgeDollarSign,
  Bell,
  Boxes,
  Building2,
  ChartNoAxesCombined,
  ClipboardList,
  DollarSign,
  Edit3,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  RefreshCcw,
  Search,
  ShieldCheck,
  Store,
  Tag,
  TicketPercent,
  Trash2,
  Users,
  X
} from 'lucide-react';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-PK')}`;

const sidebarSections = (isSuperAdmin) => [
  {
    heading: 'Overview',
    items: [{ label: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard }]
  },
  {
    heading: 'Catalog',
    items: [
      { label: 'Product Listing', page: 'Product Listing', icon: Package },
      { label: 'Banners', page: 'Banners', icon: ImageIcon },
      { label: 'Ads', page: 'Ads', icon: TicketPercent },
      { label: 'Categories', page: 'Categories', icon: Tag },
      { label: 'Stock', page: 'Stock', icon: Boxes },
      { label: 'Coupons', page: 'Coupons', icon: TicketPercent }
    ]
  },
  {
    heading: 'Sales',
    items: [
      { label: 'Orders', page: 'Orders', icon: ClipboardList },
      { label: 'Returns', page: 'Returns', icon: RefreshCcw },
      { label: 'Customers', page: 'Customers', icon: Users },
      { label: 'Whole Sellers', page: 'Whole Sellers', icon: Store }
    ]
  },
  {
    heading: 'Marketplace',
    items: isSuperAdmin ? [{ label: 'Businesses', page: 'Businesses', icon: Building2 }] : []
  },
  {
    heading: 'Marketing',
    items: [{ label: 'Notifications', page: 'Notifications', icon: Bell }]
  },
  {
    heading: 'Finance',
    items: [
      { label: 'Revenue', page: 'Revenue', icon: ChartNoAxesCombined },
      { label: 'Expense', page: 'Expense', icon: DollarSign }
    ]
  },
  {
    heading: 'Team',
    items: [{ label: 'Staff', page: 'Staff', icon: ShieldCheck }]
  }
];

const pageConfigs = {
  'Product Listing': {
    api: '/api/products',
    title: 'Product Listing',
    description: 'Create and manage products, variants and pricing.',
    addLabel: 'Add Product',
    columns: [
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category' },
      { key: 'actual_price', label: 'Actual Price', type: 'money' },
      { key: 'discounted_price', label: 'Discounted Price', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['name', 'Name', 'text'],
      ['description', 'Description', 'textarea'],
      ['product_detail', 'Product Detail', 'textarea'],
      ['image_url', 'Main Image URL', 'url'],
      ['product_images', 'Gallery Image URLs', 'textarea'],
      ['category', 'Category', 'text'],
      ['actual_price', 'Actual Price', 'number'],
      ['discounted_price', 'Discounted Price', 'number'],
      ['status', 'Status', 'select', ['Live', 'Inactive']]
    ]
  },
  Banners: {
    api: '/api/banners',
    title: 'Banners',
    description: 'Manage banners for the home and category sections.',
    addLabel: 'Add Banner',
    columns: [
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'title', label: 'Title' },
      { key: 'position', label: 'Position' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['image_url', 'Image URL', 'url'],
      ['title', 'Title', 'text'],
      ['link', 'Link', 'url'],
      ['position', 'Position', 'text'],
      ['status', 'Status', 'select', ['Active', 'Inactive']]
    ]
  },
  Ads: {
    api: '/api/promotions',
    title: 'Ads',
    description: 'Manage ads, flash offers and promo creatives.',
    addLabel: 'Add Ad',
    columns: [
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'name', label: 'Name' },
      { key: 'valid_from', label: 'Valid From', type: 'date' },
      { key: 'valid_till', label: 'Valid Till', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['name', 'Name', 'text'],
      ['image_url', 'Image URL', 'url'],
      ['valid_from', 'Valid From', 'date'],
      ['valid_till', 'Valid Till', 'date'],
      ['show_on_website', 'Show on Website', 'select', ['Yes', 'No']],
      ['status', 'Status', 'select', ['Active', 'Inactive']]
    ]
  },
  Categories: {
    api: '/api/categories',
    title: 'Categories',
    description: 'Manage product categories and images.',
    addLabel: 'Add Category',
    columns: [
      { key: 'image_url', label: 'Image', type: 'image' },
      { key: 'name', label: 'Name' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['image_url', 'Image URL', 'url'],
      ['name', 'Name', 'text'],
      ['description', 'Description', 'textarea'],
      ['status', 'Status', 'select', ['Active', 'Inactive']]
    ]
  },
  Stock: {
    api: '/api/stock',
    special: 'stock',
    title: 'Stock',
    description: 'Adjust stock and view inventory health.',
    addLabel: 'Adjust Stock',
    columns: [
      { key: 'product_name', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'quantity', label: 'Qty' },
      { key: 'reorder_level', label: 'Reorder' },
      { key: 'warehouse', label: 'Warehouse' },
      { key: 'status', label: 'Status', type: 'status' }
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
    description: 'Create discount coupons and track usage.',
    addLabel: 'Add Coupon',
    columns: [
      { key: 'code', label: 'Code' },
      { key: 'title', label: 'Title' },
      { key: 'discount_type', label: 'Type' },
      { key: 'discount_value', label: 'Value', type: 'money' },
      { key: 'used_count', label: 'Used' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['code', 'Code', 'text'],
      ['title', 'Title', 'text'],
      ['description', 'Description', 'textarea'],
      ['discount_type', 'Discount Type', 'select', ['Percentage', 'Fixed']],
      ['discount_value', 'Discount Value', 'number'],
      ['min_order_amount', 'Min Order Amount', 'number'],
      ['use_for', 'Use For', 'select', ['Free delivery', 'Product discount']],
      ['usage_limit', 'Usage Limit', 'number'],
      ['valid_from', 'Valid From', 'date'],
      ['valid_till', 'Valid Till', 'date'],
      ['status', 'Status', 'select', ['Active', 'Inactive']]
    ]
  },
  Orders: {
    api: '/api/orders',
    title: 'Orders',
    description: 'View and manage customer orders.',
    readonly: true,
    columns: [
      { key: 'id', label: 'Order ID', prefix: '#ORD-' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'items_count', label: 'Items' },
      { key: 'total_amount', label: 'Amount', type: 'money' },
      { key: 'payment_status', label: 'Payment' },
      { key: 'order_status', label: 'Status', type: 'status' }
    ]
  },
  Returns: {
    api: '/api/returns',
    title: 'Returns',
    description: 'Review and manage return requests.',
    readonly: true,
    columns: [
      { key: 'id', label: 'Return ID', prefix: '#RET-' },
      { key: 'order_id', label: 'Order ID', prefix: '#ORD-' },
      { key: 'customer', label: 'Customer' },
      { key: 'product', label: 'Product' },
      { key: 'status', label: 'Status', type: 'status' }
    ]
  },
  Customers: {
    api: '/api/customers',
    title: 'Customers',
    description: 'Customer profiles and order history.',
    readonly: true,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_orders', label: 'Orders' },
      { key: 'total_spent', label: 'Spent', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ]
  },
  'Whole Sellers': {
    api: '/api/wholesellers',
    title: 'Whole Sellers',
    description: 'Suppliers and purchase dues.',
    addLabel: 'Add Wholesaler',
    columns: [
      { key: 'business_name', label: 'Business' },
      { key: 'contact_person', label: 'Contact' },
      { key: 'phone', label: 'Phone' },
      { key: 'products_supplied', label: 'Products' },
      { key: 'payment_due', label: 'Due', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['business_name', 'Business Name', 'text'],
      ['contact_person', 'Contact Person', 'text'],
      ['phone', 'Phone', 'text'],
      ['email', 'Email', 'email'],
      ['address', 'Address', 'textarea'],
      ['products_supplied', 'Products Supplied', 'text'],
      ['total_purchases', 'Total Purchases', 'number'],
      ['payment_due', 'Payment Due', 'number'],
      ['status', 'Status', 'select', ['Active', 'Inactive']]
    ]
  },
  Businesses: {
    api: '/api/business-accounts',
    title: 'Businesses',
    description: 'Create and manage business login accounts.',
    addLabel: 'Add Business',
    columns: [
      { key: 'business_name', label: 'Business' },
      { key: 'username', label: 'Username' },
      { key: 'owner_name', label: 'Owner' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['business_name', 'Business Name', 'text'],
      ['username', 'Username', 'text'],
      ['password', 'Password', 'password'],
      ['owner_name', 'Owner Name', 'text'],
      ['cnic', 'CNIC', 'text'],
      ['address', 'Address', 'textarea'],
      ['email', 'Email', 'email'],
      ['phone', 'Phone', 'text'],
      ['agreement_image', 'Agreement Image URL', 'url'],
      ['role', 'Role', 'select', ['BusinessAdmin', 'Manager']],
      ['status', 'Status', 'select', ['Active', 'Inactive']]
    ]
  },
  Expense: {
    api: '/api/expenses',
    title: 'Expense',
    description: 'Record business expenses.',
    addLabel: 'Add Expense',
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount', type: 'money' },
      { key: 'payment_method', label: 'Payment' },
      { key: 'date', label: 'Date', type: 'date' }
    ],
    fields: [
      ['title', 'Title', 'text'],
      ['category', 'Category', 'select', ['Rent', 'Salary', 'Marketing', 'Utilities', 'Other']],
      ['amount', 'Amount', 'number'],
      ['payment_method', 'Payment Method', 'select', ['Cash', 'Bank', 'Easypaisa', 'JazzCash']],
      ['date', 'Date', 'date'],
      ['receipt_url', 'Receipt URL', 'url'],
      ['added_by', 'Added By', 'text'],
      ['notes', 'Notes', 'textarea']
    ]
  },
  Staff: {
    api: '/api/staff',
    title: 'Staff',
    description: 'Manage staff members and roles.',
    addLabel: 'Add Staff',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'role', label: 'Role' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['photo_url', 'Photo URL', 'url'],
      ['name', 'Name', 'text'],
      ['email', 'Email', 'email'],
      ['phone', 'Phone', 'text'],
      ['role', 'Role', 'select', ['Admin', 'Manager', 'Support', 'Delivery']],
      ['password_hash', 'Password', 'password'],
      ['status', 'Status', 'select', ['Active', 'Inactive']]
    ]
  },
  Notifications: {
    api: '/api/notifications',
    title: 'Notifications',
    description: 'System messages, orders and stock alerts.',
    readonly: true,
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'severity', label: 'Severity' },
      { key: 'is_read', label: 'Read' },
      { key: 'created_at', label: 'Date', type: 'date' }
    ]
  },
  Revenue: {
    custom: true,
    title: 'Revenue',
    description: 'Revenue, profit and payment split.'
  },
  Dashboard: {
    custom: true,
    title: 'Dashboard',
    description: 'Store overview and quick stats.'
  }
};

function apiFetch(path, session, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.role ? { 'x-user-role': session.role } : {}),
    ...(session?.businessId ? { 'x-business-id': String(session.businessId) } : {})
  };
  return fetch(path, { ...options, headers: { ...headers, ...(options.headers || {}) } });
}

function Badge({ value }) {
  const text = String(value ?? '');
  const warn = ['Low', 'Out', 'Cancelled', 'Inactive', 'Pending', 'Requested', 'Warning'].includes(text);
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${warn ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700'}`}>{text}</span>;
}

function FieldInput({ field, value, onChange }) {
  const [name, label, type, options] = field;
  if (type === 'select') {
    return (
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <select
          value={value || ''}
          onChange={(event) => onChange(name, event.target.value)}
          className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (type === 'textarea') {
    return (
      <label className="grid gap-2 sm:col-span-2">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <textarea
          value={value || ''}
          onChange={(event) => onChange(name, event.target.value)}
          className="min-h-24 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
      </label>
    );
  }

  const inputType = type === 'number' ? 'number' : type === 'password' ? 'password' : type === 'email' ? 'email' : type === 'date' ? 'date' : 'text';
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        value={value || ''}
        onChange={(event) => onChange(name, event.target.value)}
        type={inputType}
        className="min-h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}

function RecordModal({ open, title, fields, initial, onClose, onSubmit, loading }) {
  const [form, setForm] = React.useState(initial || {});

  React.useEffect(() => {
    setForm(initial || {});
  }, [initial, open]);

  if (!open) return null;

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 p-4">
      <button type="button" className="absolute inset-0 h-full w-full" aria-label="Close modal" onClick={onClose} />
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit(form);
        }}
        className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Edit Panel</p>
            <h3 className="mt-1 text-2xl font-black text-slate-950">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <FieldInput key={field[0]} field={field} value={form[field[0]]} onChange={update} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="min-h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700">
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

function DataTable({ columns, rows, loading, onEdit, onDelete, readonly }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3">{column.label}</th>
            ))}
            {!readonly ? <th className="px-4 py-3">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-t border-slate-200">
                  <td colSpan={columns.length + (readonly ? 0 : 1)} className="px-4 py-4">
                    <div className="h-4 rounded-full bg-slate-100" />
                  </td>
                </tr>
              ))
            : rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  {columns.map((column) => {
                    const value = row[column.key];
                    let display = value;
                    if (column.type === 'money') display = money(value);
                    if (column.type === 'date') display = value ? String(value).slice(0, 10) : '-';
                    if (column.type === 'status') display = <Badge value={value} />;
                    if (column.type === 'image') {
                      display = value ? <img src={value} alt={row.name || row.title || column.key} className="h-12 w-12 rounded-2xl object-cover" /> : '-';
                    }
                    return (
                      <td key={column.key} className="px-4 py-3 align-top text-slate-700">
                        {column.prefix ? `${column.prefix}${value || ''}` : display || '-'}
                      </td>
                    );
                  })}
                  {!readonly ? (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button type="button" onClick={() => onEdit(row)} className="inline-flex min-h-9 items-center justify-center rounded-xl bg-teal-50 px-3 text-teal-700">
                          <Edit3 size={16} />
                        </button>
                        <button type="button" onClick={() => onDelete(row)} className="inline-flex min-h-9 items-center justify-center rounded-xl bg-rose-50 px-3 text-rose-700">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

function OverviewCard({ label, value, icon: Icon, hint }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">{label}</p>
          <strong className="mt-2 block text-2xl font-black text-slate-950">{value}</strong>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <Icon size={20} />
        </span>
      </div>
      {hint ? <p className="mt-4 text-sm text-slate-500">{hint}</p> : null}
    </article>
  );
}

export default function AdminDashboard({ session, storeName, logoSrc, onLogout }) {
  const isSuperAdmin = session.role === 'SuperAdmin';
  const sidebar = sidebarSections(isSuperAdmin);
  const [activePage, setActivePage] = React.useState('Dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState({ key: 'id', order: 'DESC' });
  const [summary, setSummary] = React.useState(null);
  const [chartRows, setChartRows] = React.useState([]);
  const [modal, setModal] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const config = pageConfigs[activePage] || pageConfigs.Dashboard;

  React.useEffect(() => {
    document.body.style.overflow = mobileSidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  React.useEffect(() => {
    setPage(1);
    setSearch('');
    setSort({ key: 'id', order: 'DESC' });
    setModal(null);
  }, [activePage]);

  const loadPage = React.useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (activePage === 'Dashboard') {
        const [summaryRes, productRes, orderRes, stockRes, noteRes] = await Promise.all([
          apiFetch('/api/dashboard/summary', session),
          apiFetch('/api/products?limit=5', session),
          apiFetch('/api/orders?limit=5', session),
          apiFetch('/api/stock?limit=5', session),
          apiFetch('/api/notifications?limit=5', session)
        ]);
        const [summaryData, productData, orderData, stockData, noteData] = await Promise.all([
          summaryRes.json(),
          productRes.json(),
          orderRes.json(),
          stockRes.json(),
          noteRes.json()
        ]);
        setSummary(summaryData);
        setRows(productData.rows || []);
        setTotal(productData.total || (productData.rows || []).length);
        setChartRows([
          { label: 'Orders', value: summaryData?.orders?.total || 0 },
          { label: 'Products', value: summaryData?.products?.total || 0 },
          { label: 'Stock', value: summaryData?.stock?.total || 0 },
          { label: 'Unread', value: summaryData?.notifications?.unread || 0 }
        ]);
        setModal({
          title: 'Dashboard',
          products: productData.rows || [],
          orders: orderData.rows || [],
          stock: stockData.rows || [],
          notifications: noteData.rows || []
        });
        return;
      }

      if (activePage === 'Revenue') {
        const [summaryRes, chartRes] = await Promise.all([
          apiFetch('/api/revenue/summary', session),
          apiFetch('/api/revenue/chart', session)
        ]);
        const [summaryData, chartData] = await Promise.all([summaryRes.json(), chartRes.json()]);
        setSummary(summaryData);
        setChartRows(chartData.rows || []);
        setRows([]);
        setTotal(0);
        return;
      }

      const params = new URLSearchParams({
        page,
        limit: '8',
        search,
        sort: sort.key,
        order: sort.order
      });
      const response = await apiFetch(`${config.api}?${params}`, session);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to load records');
      setRows(data.rows || []);
      setTotal(data.total || (data.rows || []).length);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activePage, config.api, page, search, session, sort.key, sort.order]);

  React.useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function submitRecord(form) {
    setSaving(true);
    setError('');
    try {
      if (activePage === 'Revenue' || activePage === 'Dashboard') return;
      if (config.special === 'stock') {
        const response = await apiFetch('/api/stock/adjust', session, {
          method: 'POST',
          body: JSON.stringify(form)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to adjust stock');
      } else {
        const isEdit = Boolean(form.id);
        const response = await apiFetch(`${config.api}${isEdit ? `/${form.id}` : ''}`, session, {
          method: isEdit ? 'PUT' : 'POST',
          body: JSON.stringify(form)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to save record');
      }
      setModal(null);
      await loadPage();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(row) {
    if (!window.confirm(`Delete ${row.name || row.title || row.business_name || row.code}?`)) return;
    try {
      const response = await apiFetch(`${config.api}/${row.id}`, session, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to delete');
      await loadPage();
    } catch (err) {
      setError(err.message);
    }
  }

  const currentFields = config.fields || [];
  const stats = activePage === 'Dashboard'
    ? [
        { label: 'Products', value: summary?.products?.total || 0, icon: Package, hint: 'Live catalog items' },
        { label: 'Orders', value: summary?.orders?.total || 0, icon: ClipboardList, hint: 'Active orders' },
        { label: 'Revenue', value: money(summary?.orders?.revenue || 0), icon: BadgeDollarSign, hint: 'Sales total' },
        { label: 'Unread', value: summary?.notifications?.unread || 0, icon: Bell, hint: 'Alerts' }
      ]
    : activePage === 'Revenue'
      ? [
          { label: 'Total Revenue', value: money(summary?.totalRevenue || 0), icon: BadgeDollarSign, hint: 'From orders' },
          { label: 'Net Profit', value: money(summary?.netProfit || 0), icon: ChartNoAxesCombined, hint: 'Revenue - expense' },
          { label: 'Avg Order', value: money(summary?.avgOrderValue || 0), icon: ClipboardList, hint: 'Average basket' },
          { label: 'Growth', value: `${summary?.growth || 0}%`, icon: ShieldCheck, hint: 'Month over month' }
        ]
      : [];

  const totalPages = Math.max(Math.ceil(total / 8), 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>
            <img src={logoSrc} alt={storeName} className="h-12 w-auto object-contain" />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Admin Dashboard</p>
              <h1 className="text-lg font-black text-slate-950">{config.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 lg:flex">
              <Search size={16} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search records..."
                className="min-w-0 bg-transparent text-sm outline-none"
              />
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr]">
        <aside className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-2xl transition lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'}`}>
          <div className="flex items-center justify-between lg:hidden">
            <img src={logoSrc} alt={storeName} className="h-10 w-auto object-contain" />
            <button type="button" onClick={() => setMobileSidebarOpen(false)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200">
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Panel</p>
            <h2 className="mt-1 text-lg font-black">{session.role}</h2>
            <p className="mt-2 text-sm text-slate-300">{session.business_name || session.name || 'Signed in user'}</p>
          </div>

          <nav className="mt-4 grid gap-4">
            {sidebar.map((section) => (
              <div key={section.heading}>
                <p className="px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{section.heading}</p>
                <div className="mt-2 grid gap-1">
                  {section.items.map((item) => (
                    <button
                      key={item.page}
                      type="button"
                      onClick={() => {
                        setActivePage(item.page);
                        setMobileSidebarOpen(false);
                      }}
                      className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 text-left text-sm font-semibold transition ${activePage === item.page ? 'bg-teal-600 text-white' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'}`}
                    >
                      <item.icon size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {mobileSidebarOpen ? <button type="button" aria-label="Close sidebar overlay" className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden" onClick={() => setMobileSidebarOpen(false)} /> : null}

        <section className="min-w-0 grid gap-6">
          {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div> : null}

          {activePage === 'Dashboard' || activePage === 'Revenue' ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => (
                  <OverviewCard key={stat.label} {...stat} />
                ))}
              </div>

              {activePage === 'Dashboard' ? (
                <div className="grid gap-6 xl:grid-cols-2">
                  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Recent Products</p>
                        <h2 className="mt-1 text-xl font-black text-slate-950">Live catalog</h2>
                      </div>
                      <Package className="text-teal-600" />
                    </div>
                    <div className="mt-4 grid gap-3">
                      {(loading ? Array.from({ length: 4 }) : rows).map((row, index) => (
                        <div key={row?.id || index} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                          {loading ? <div className="h-14 w-14 rounded-2xl bg-slate-100" /> : <img src={row.image_url} alt={row.name} className="h-14 w-14 rounded-2xl object-cover" />}
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-slate-950">{loading ? 'Loading...' : row.name}</h3>
                            <p className="text-sm text-slate-500">{loading ? '' : row.category}</p>
                          </div>
                          {!loading ? <strong>{money(row.actual_price || row.discounted_price)}</strong> : null}
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Low Stock</p>
                        <h2 className="mt-1 text-xl font-black text-slate-950">Inventory warnings</h2>
                      </div>
                      <Boxes className="text-teal-600" />
                    </div>
                    <div className="mt-4 grid gap-3">
                      {(summary?.lowStockItems || []).map((item) => (
                        <div key={item.sku || item.product_name} className="rounded-2xl bg-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-semibold text-slate-950">{item.product_name}</h3>
                              <p className="text-sm text-slate-500">{item.sku || 'SKU'}</p>
                            </div>
                            <Badge value={item.quantity <= 0 ? 'Out' : 'Low'} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Latest Orders</p>
                        <h2 className="mt-1 text-xl font-black text-slate-950">Order stream</h2>
                      </div>
                      <ClipboardList className="text-teal-600" />
                    </div>
                    <div className="mt-4 grid gap-3">
                      {(loading ? Array.from({ length: 4 }) : summary?.orders ? [] : rows).map((row, index) => (
                        <div key={row?.id || index} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                          <div>
                            <h3 className="font-semibold text-slate-950">{loading ? 'Loading...' : row.customer_name}</h3>
                            <p className="text-sm text-slate-500">{loading ? '' : `#ORD-${row.id} • ${row.order_status}`}</p>
                          </div>
                          {!loading ? <strong>{money(row.total_amount)}</strong> : null}
                        </div>
                      ))}
                    </div>
                  </article>
                </div>
              ) : (
                <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Revenue Summary</p>
                      <h2 className="mt-1 text-xl font-black text-slate-950">Payment split</h2>
                    </div>
                    <ChartNoAxesCombined className="text-teal-600" />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {(chartRows || []).map((row) => (
                      <div key={row.payment_method || row.label} className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">{row.payment_method || row.label}</p>
                        <p className="mt-2 text-lg font-black text-slate-950">{money(row.amount || row.value)}</p>
                      </div>
                    ))}
                  </div>
                </article>
              )}
            </>
          ) : (
            <>
              <section className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">{config.title}</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">{config.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">{config.description}</p>
                </div>
                {!config.readonly ? (
                  <button type="button" onClick={() => setModal({})} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white">
                    <Edit3 size={16} />
                    {config.addLabel}
                  </button>
                ) : null}
              </section>

              <DataTable
                columns={config.columns}
                rows={rows}
                loading={loading}
                onEdit={(row) => setModal(row)}
                onDelete={deleteRecord}
                readonly={config.readonly}
              />

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage((value) => Math.max(value - 1, 1))}
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  disabled={page === totalPages}
                  onClick={() => setPage((value) => Math.min(value + 1, totalPages))}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {config.fields && modal && activePage !== 'Dashboard' && activePage !== 'Revenue' ? (
        <RecordModal
          open={Boolean(modal)}
          title={config.title}
          fields={currentFields}
          initial={modal}
          onClose={() => setModal(null)}
          onSubmit={submitRecord}
          loading={saving}
        />
      ) : null}

      {mobileSidebarOpen ? <button type="button" aria-label="Close sidebar overlay" className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden" onClick={() => setMobileSidebarOpen(false)} /> : null}
    </div>
  );
}
