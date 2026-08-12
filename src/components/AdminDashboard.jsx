import React from 'react';
import {
  BadgeDollarSign,
  Bell,
  Boxes,
  Building2,
  ChartNoAxesCombined,
  ChevronDown,
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
  Printer,
  MessageSquare,
  Send,
  CircleCheck,
  CircleX,
  ShieldCheck,
  Store,
  Tag,
  TicketPercent,
  Trash2,
  UserPlus,
  Users,
  WalletCards,
  X
} from 'lucide-react';

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-PK')}`;

const sidebarSections = (isSuperAdmin) => [
  {
    heading: null,
    items: [{ label: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard }]
  },
  {
    heading: 'Catalog',
    items: [
      { label: 'Product Listing', page: 'Product Listing', icon: Package },
      { label: 'Website Banner', page: 'Banners', icon: ImageIcon },
      { label: 'App Banner', page: 'Ads', icon: TicketPercent },
      { label: 'Categories', page: 'Categories', icon: Tag },
      { label: 'Stock', page: 'Stock', icon: Boxes }
    ]
  },
  {
    heading: 'Sales',
    items: [
      { label: 'Orders', page: 'Orders', icon: ClipboardList },
      { label: 'Returns', page: 'Returns', icon: RefreshCcw },
      { label: 'Customers', page: 'Customers', icon: Users }
    ]
  },
  {
    heading: 'Marketplace',
    items: [
      ...(isSuperAdmin ? [{ label: 'Investors', page: 'Investors', icon: Building2 }] : []),
      { label: 'Staff', page: 'Staff', icon: ShieldCheck },
      { label: 'Sellers', page: 'Whole Sellers', icon: Store },
      ...(isSuperAdmin ? [{ label: 'Permissions', page: 'Permissions', icon: ShieldCheck }] : [])
    ]
  },
  {
    heading: 'Finance',
    items: [
      { label: 'Revenue', page: 'Revenue', icon: ChartNoAxesCombined },
      { label: 'Expense', page: 'Expense', icon: DollarSign },
      { label: 'Software Fees', page: 'Software Fees', icon: WalletCards },
      { label: 'Staff Salaries', page: 'Staff Salaries', icon: BadgeDollarSign },
      { label: 'Delivery Expense', page: 'Delivery Expense', icon: RefreshCcw }
    ]
  },
  {
    heading: 'Notifications',
    items: [
      { label: 'Chats', page: 'Chats', icon: MessageSquare },
      { label: 'Become a Seller', page: 'Become a Seller', icon: UserPlus },
      { label: 'Become an Investor', page: 'Become an Investor', icon: Building2 },
      { label: 'All Notifications', page: 'Notifications', icon: Bell }
    ]
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
      ['sku', 'SKU', 'text'],
      ['stock_qty', 'Opening Stock', 'number'],
      ['actual_price', 'Actual Price', 'number'],
      ['discounted_price', 'Discounted Price', 'number'],
      ['status', 'Status', 'select', ['Live', 'Inactive']]
    ]
  },
  Banners: {
    api: '/api/banners',
    title: 'Website Banner',
    description: 'Manage homepage and website banners.',
    addLabel: 'Add Website Banner',
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
    title: 'App Banner',
    description: 'Manage app banners and promo creatives.',
    addLabel: 'Add App Banner',
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
    title: 'Stock',
    description: 'Add stock items and manage inventory quickly.',
    addLabel: 'Add Stock',
    columns: [
      { key: 'product_id', label: 'Product ID' },
      { key: 'total_items', label: 'Total Items' },
      { key: 'stock_belong_to', label: 'Stock Belong to' },
      { key: 'sku', label: 'SKU' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'description', label: 'Description' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['product_id', 'Product ID', 'number'],
      ['total_items', 'Total Items', 'number'],
      ['stock_belong_to', 'Stock Belong to', 'text'],
      ['quantity', 'Quantity', 'number'],
      ['description', 'Description', 'textarea'],
      ['sku', 'SKU', 'text'],
      ['category', 'Category', 'text'],
      ['warehouse', 'Warehouse', 'text']
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
    noCreate: true,
    noDelete: true,
    updateApi: (id) => `/api/orders/${id}/status`,
    columns: [
      { key: 'id', label: 'Order ID', prefix: '#ORD-' },
      { key: 'customer_name', label: 'Customer' },
      { key: 'items_count', label: 'Items' },
      { key: 'total_amount', label: 'Amount', type: 'money' },
      { key: 'payment_status', label: 'Payment' },
      { key: 'order_status', label: 'Status', type: 'status' }
    ],
    fields: [['order_status', 'Order Status', 'select', ['Pending', 'To Ship', 'Received']]]
  },
  Returns: {
    api: '/api/returns',
    title: 'Returns',
    description: 'Review, add and manage return requests.',
    noDelete: true,
    updateApi: (id) => `/api/returns/${id}/status`,
    columns: [
      { key: 'id', label: 'Return ID', prefix: '#RET-' },
      { key: 'order_id', label: 'Order ID', prefix: '#ORD-' },
      { key: 'customer', label: 'Customer' },
      { key: 'product', label: 'Product' },
      { key: 'refund_amount', label: 'Refund', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['order_id', 'Order ID', 'number'],
      ['product_id', 'Product ID', 'number'],
      ['customer', 'Customer', 'text'],
      ['product', 'Product', 'text'],
      ['reason', 'Reason', 'textarea'],
      ['refund_amount', 'Refund Amount', 'number'],
      ['refund_method', 'Refund Method', 'select', ['Bank', 'Easypaisa', 'JazzCash', 'Cash']],
      ['status', 'Return Status', 'select', ['Requested', 'Approved', 'Rejected', 'Refunded']]
    ]
  },
  Customers: {
    api: '/api/customers',
    title: 'Customers',
    description: 'Customer profiles, orders and spend summary.',
    readonly: true,
    noCreate: true,
    noDelete: true,
    updateApi: (id) => `/api/customers/${id}/status`,
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'total_orders', label: 'Orders' },
      { key: 'total_spent', label: 'Spent', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [['status', 'Customer Status', 'select', ['Active', 'Inactive', 'Blocked']]]
  },
  'Whole Sellers': {
    api: '/api/wholesellers',
    title: 'Sellers',
    description: 'Manage sellers, login details and sold stock.',
    addLabel: 'Add Seller',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'contact_person', label: 'Contact' },
      { key: 'address', label: 'Address' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'stock_seller_sell', label: 'Stock Seller Sell' },
      { key: 'payment_due', label: 'Due', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['name', 'Name', 'text'],
      ['contact_person', 'Contact', 'text'],
      ['address', 'Address', 'textarea'],
      ['phone', 'Phone', 'text'],
      ['email', 'Email', 'email'],
      ['description', 'Description', 'textarea'],
      ['seller_image', 'Seller Image', 'url'],
      ['stock_seller_sell', 'Which stock seller sell', 'text'],
      ['username', 'Username', 'text'],
      ['password', 'Password', 'password'],
      ['total_purchases', 'Total Purchases', 'number'],
      ['payment_due', 'Payment Due', 'number'],
      ['status', 'Status', 'select', ['Active', 'Inactive']]
    ]
  },
  Businesses: {
    api: '/api/business-accounts',
    title: 'Accounts',
    description: 'Create and manage login accounts for customers and sellers.',
    addLabel: 'Add Account',
    columns: [
      { key: 'business_name', label: 'Business' },
      { key: 'username', label: 'Username' },
      { key: 'plain_password', label: 'Password' },
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
    description: 'Order notifications, stock alerts and system messages.',
    readonly: true,
    noCreate: true,
    updateApi: (id) => `/api/notifications/${id}/read`,
    columns: [
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'severity', label: 'Severity' },
      { key: 'is_read', label: 'Read', type: 'boolean' },
      { key: 'created_at', label: 'Date', type: 'date' }
    ],
    fields: [['is_read', 'Read Status', 'select', ['Yes', 'No']]]
  },
  Revenue: {
    custom: true,
    title: 'Revenue',
    description: 'Revenue, profit and payment split.'
  },
  Investors: {
    api: '/api/investors',
    title: 'Investors',
    description: 'Manage investor profiles, login credentials and investment status.',
    addLabel: 'Add Investor',
    columns: [
      { key: 'name', label: 'Investor' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' },
      { key: 'address', label: 'Address' },
      { key: 'username', label: 'Username' },
      { key: 'investment_amount', label: 'Investment', type: 'money' },
      { key: 'investment_date', label: 'Date', type: 'date' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['name', 'Investor Name', 'text'],
      ['email', 'Email', 'email'],
      ['phone', 'Phone', 'text'],
      ['address', 'Address', 'textarea'],
      ['username', 'Username', 'text'],
      ['password', 'Password', 'password'],
      ['investment_amount', 'Investment Amount', 'number'],
      ['investment_date', 'Investment Date', 'date'],
      ['agreement_url', 'Agreement URL', 'url'],
      ['description', 'Description', 'textarea'],
      ['status', 'Status', 'select', ['Active', 'Pending', 'Inactive']],
      ['notes', 'Notes', 'textarea']
    ]
  },
  Permissions: {
    api: '/api/permissions',
    title: 'Permissions',
    description: 'Control module-level access for Sellers, Staff and Investors.',
    addLabel: 'Add Permission',
    columns: [
      { key: 'role', label: 'Role' },
      { key: 'staff_id', label: 'ID', prefix: '#' },
      { key: 'module', label: 'Module' },
      { key: 'can_view', label: 'View', type: 'status' },
      { key: 'can_create', label: 'Create', type: 'status' },
      { key: 'can_edit', label: 'Edit', type: 'status' }
    ],
    fields: [
      ['role', 'Role', 'select', ['Sellers', 'Staff', 'Investors']],
      ['staff_id', 'Staff ID', 'number'],
      ['module', 'Module', 'select', ['Catalog', 'Sales', 'Marketing', 'Marketplace', 'Finance', 'Notifications', 'Chats']],
      ['can_view', 'Can View', 'select', ['Yes', 'No']],
      ['can_create', 'Can Create', 'select', ['Yes', 'No']],
      ['can_edit', 'Can Edit', 'select', ['Yes', 'No']]
    ]
  },
  'Software Fees': {
    api: '/api/software_fees',
    title: 'Software Fees',
    description: 'Track subscriptions, renewals and service payments.',
    addLabel: 'Add Software Fee',
    columns: [
      { key: 'service_name', label: 'Service' },
      { key: 'provider', label: 'Provider' },
      { key: 'amount', label: 'Amount', type: 'money' },
      { key: 'due_date', label: 'Due Date', type: 'date' },
      { key: 'payment_status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['service_name', 'Service Name', 'text'],
      ['provider', 'Provider', 'text'],
      ['amount', 'Amount', 'number'],
      ['billing_cycle', 'Billing Cycle', 'select', ['Monthly', 'Quarterly', 'Yearly', 'One Time']],
      ['due_date', 'Due Date', 'date'],
      ['payment_status', 'Payment Status', 'select', ['Pending', 'Paid', 'Overdue']],
      ['notes', 'Notes', 'textarea']
    ]
  },
  'Staff Salaries': {
    api: '/api/staff_salaries',
    title: 'Staff Salaries',
    description: 'Maintain monthly payroll, bonuses and deductions.',
    addLabel: 'Add Salary',
    columns: [
      { key: 'staff_name', label: 'Staff Member' },
      { key: 'salary_month', label: 'Month' },
      { key: 'base_salary', label: 'Base Salary', type: 'money' },
      { key: 'bonus', label: 'Bonus', type: 'money' },
      { key: 'payment_status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['staff_id', 'Staff ID', 'number'],
      ['staff_name', 'Staff Name', 'text'],
      ['salary_month', 'Salary Month (YYYY-MM)', 'text'],
      ['base_salary', 'Base Salary', 'number'],
      ['bonus', 'Bonus', 'number'],
      ['deductions', 'Deductions', 'number'],
      ['payment_status', 'Payment Status', 'select', ['Pending', 'Paid', 'Held']],
      ['paid_date', 'Paid Date', 'date'],
      ['notes', 'Notes', 'textarea']
    ]
  },
  'Delivery Expense': {
    api: '/api/delivery_expenses',
    title: 'Delivery Expense',
    description: 'Track courier costs against orders and shipments.',
    addLabel: 'Add Delivery Expense',
    columns: [
      { key: 'order_id', label: 'Order', prefix: '#ORD-' },
      { key: 'courier', label: 'Courier' },
      { key: 'tracking_number', label: 'Tracking No.' },
      { key: 'amount', label: 'Amount', type: 'money' },
      { key: 'payment_status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['order_id', 'Order ID', 'number'],
      ['courier', 'Courier', 'text'],
      ['tracking_number', 'Tracking Number', 'text'],
      ['amount', 'Amount', 'number'],
      ['expense_date', 'Expense Date', 'date'],
      ['payment_status', 'Payment Status', 'select', ['Pending', 'Paid']],
      ['notes', 'Notes', 'textarea']
    ]
  },
  Chats: {
    api: '/api/chats',
    title: 'Chats',
    description: 'Manage customer conversations and admin replies.',
    addLabel: 'New Chat',
    columns: [
      { key: 'sender_name', label: 'Sender' },
      { key: 'sender_type', label: 'Type' },
      { key: 'subject', label: 'Subject' },
      { key: 'reply_message', label: 'Reply' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'created_at', label: 'Received', type: 'date' }
    ],
    fields: [
      ['sender_name', 'Sender Name', 'text'],
      ['sender_type', 'Sender Type', 'select', ['Customer', 'Seller', 'Investor', 'Staff']],
      ['subject', 'Subject', 'text'],
      ['message', 'Message', 'textarea'],
      ['reply_message', 'Reply Message', 'textarea'],
      ['status', 'Status', 'select', ['Open', 'In Progress', 'Closed']]
    ]
  },
  'Become a Seller': {
    api: '/api/seller_applications',
    title: 'Become a Seller',
    description: 'Review and process seller onboarding applications.',
    addLabel: 'Add Application',
    columns: [
      { key: 'applicant_name', label: 'Applicant' },
      { key: 'business_name', label: 'Business' },
      { key: 'phone', label: 'Phone' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Status', type: 'status' }
    ],
    fields: [
      ['applicant_name', 'Applicant Name', 'text'],
      ['business_name', 'Business Name', 'text'],
      ['email', 'Email', 'email'],
      ['phone', 'Phone', 'text'],
      ['category', 'Business Category', 'text'],
      ['message', 'Application Notes', 'textarea'],
      ['status', 'Status', 'select', ['Pending', 'Approved', 'Rejected']]
    ]
  },
  'Become an Investor': {
    api: '/api/investor_applications',
    title: 'Become an Investor',
    description: 'Review and process investor applications.',
    addLabel: 'Add Application',
    columns: [
      { key: 'applicant_name', label: 'Applicant' },
      { key: 'phone', label: 'Phone' },
      { key: 'proposed_amount', label: 'Proposed Amount', type: 'money' },
      { key: 'status', label: 'Status', type: 'status' },
      { key: 'created_at', label: 'Received', type: 'date' }
    ],
    fields: [
      ['applicant_name', 'Applicant Name', 'text'],
      ['email', 'Email', 'email'],
      ['phone', 'Phone', 'text'],
      ['proposed_amount', 'Proposed Amount', 'number'],
      ['message', 'Application Notes', 'textarea'],
      ['status', 'Status', 'select', ['Pending', 'Approved', 'Rejected']]
    ]
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

function DataTable({ columns, rows, loading, onEdit, onDelete, readonly, noDelete, rowActions }) {
  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3">{column.label}</th>
            ))}
            {!readonly || rowActions ? <th className="px-4 py-3">Actions</th> : null}
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
            : rows.length ? rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  {columns.map((column) => {
                    const value = row[column.key];
                    let display = value;
                    if (column.type === 'money') display = money(value);
                    if (column.type === 'date') display = value ? String(value).slice(0, 10) : '-';
                    if (column.type === 'status') display = <Badge value={value} />;
                    if (column.type === 'boolean') display = <Badge value={value === true || value === 1 || value === 'Yes' ? 'Yes' : 'No'} />;
                    if (column.type === 'image') {
                      display = value ? <img src={value} alt={row.name || row.title || column.key} className="h-12 w-12 rounded-2xl object-cover" /> : '-';
                    }
                    return (
                      <td key={column.key} className="px-4 py-3 align-top text-slate-700">
                        {column.prefix ? `${column.prefix}${value || ''}` : display || '-'}
                      </td>
                    );
                  })}
                  {!readonly || rowActions ? (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {!readonly ? <button type="button" onClick={() => onEdit(row)} className="inline-flex min-h-9 items-center justify-center rounded-xl bg-teal-50 px-3 text-teal-700">
                          <Edit3 size={16} />
                        </button> : null}
                        {rowActions ? rowActions(row) : null}
                        {!readonly && !noDelete ? <button type="button" onClick={() => onDelete(row)} className="inline-flex min-h-9 items-center justify-center rounded-xl bg-rose-50 px-3 text-rose-700" aria-label="Delete record">
                          <Trash2 size={16} />
                        </button> : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              )) : (
                <tr className="border-t border-slate-200">
                  <td colSpan={columns.length + (readonly ? 0 : 1)} className="px-6 py-14 text-center">
                    <p className="font-bold text-slate-700">No records found</p>
                    <p className="mt-1 text-sm text-slate-500">Add the first record or adjust your search.</p>
                  </td>
                </tr>
              )}
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
  const [openSections, setOpenSections] = React.useState({});
  const [rows, setRows] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [sort, setSort] = React.useState({ key: 'id', order: 'DESC' });
  const [summary, setSummary] = React.useState(null);
  const [chartRows, setChartRows] = React.useState([]);
  const [dashboardDetails, setDashboardDetails] = React.useState({ products: [], orders: [], stock: [], notifications: [] });
  const [businessRows, setBusinessRows] = React.useState([]);
  const [selectedOrder, setSelectedOrder] = React.useState(null);
  const [selectedReturnDraft, setSelectedReturnDraft] = React.useState(null);
  const [customerView, setCustomerView] = React.useState('customers');
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
    setSelectedOrder(null);
    setSelectedReturnDraft(null);
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
        setDashboardDetails({
          products: productData.rows || [],
          orders: orderData.rows || [],
          stock: stockData.rows || [],
          notifications: noteData.rows || []
        });
        return;
      }

      if (activePage === 'Revenue') {
        const summaryRes = await apiFetch('/api/revenue/summary', session);
        const summaryData = await summaryRes.json();
        if (!summaryRes.ok) throw new Error(summaryData.message || 'Unable to load revenue');
        setSummary(summaryData);
        setChartRows(summaryData.payments || []);
        setRows([]);
        setTotal(0);
        return;
      }

      if (activePage === 'Customers') {
        const [customersRes, accountsRes] = await Promise.all([
          apiFetch('/api/customers?limit=50', session),
          apiFetch('/api/business-accounts', session)
        ]);
        const [customerData, accountData] = await Promise.all([customersRes.json(), accountsRes.json()]);
        if (!customersRes.ok) throw new Error(customerData.message || 'Unable to load customers');
        if (!accountsRes.ok) throw new Error(accountData.message || 'Unable to load accounts');
        setRows(customerData.rows || []);
        setTotal(customerData.total || (customerData.rows || []).length);
        setBusinessRows(accountData.rows || []);
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
      const normalizedRows = activePage === 'Stock'
        ? (data.rows || []).map((row) => ({
            ...row,
            status: row.status || (row.quantity <= 0 ? 'Out' : row.quantity <= (row.reorder_level || 0) ? 'Low' : 'In Stock')
          }))
        : data.rows || [];
      setRows(normalizedRows);
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
      if (config.updateApi && form.id) {
        const response = await apiFetch(config.updateApi(form.id), session, {
          method: 'PUT',
          body: JSON.stringify(form)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Unable to update record');
      } else if (config.special === 'stock') {
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
    if (!window.confirm(`Delete ${row.name || row.title || row.business_name || row.applicant_name || row.service_name || 'this record'}?`)) return;
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
  const accountColumns = [
    { key: 'id', label: 'ID', prefix: '#' },
    { key: 'business_name', label: 'Business' },
    { key: 'username', label: 'Username' },
    { key: 'plain_password', label: 'Password' },
    { key: 'owner_name', label: 'Owner' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'last_login', label: 'Last Login', type: 'date' },
    { key: 'status', label: 'Status', type: 'status' }
  ];

  async function openOrderDetails(order) {
    const response = await apiFetch(`/api/orders/${order.id}`, session);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to load order details');
    setSelectedOrder(data);
  }

  async function changeOrderStatus(order, order_status) {
    const response = await apiFetch(`/api/orders/${order.id}/status`, session, {
      method: 'PUT',
      body: JSON.stringify({ order_status })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to update order status');
    await loadPage();
  }

  async function createReturnFromOrder(order) {
    try {
      const response = await apiFetch(`/api/orders/${order.id}`, session);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to load order');
      const firstItem = (data.items || [])[0] || {};
      setSelectedReturnDraft({
        order_id: data.id,
        product_id: firstItem.product_id || '',
        customer: data.customer_name || '',
        product: firstItem.product_name || firstItem.name || '',
        reason: '',
        refund_amount: firstItem.price || data.total_amount || 0,
        refund_method: 'Cash',
        status: 'Requested'
      });
    } catch (error) {
      setError(error.message);
    }
  }

  async function submitReturnDraft(form) {
    setSaving(true);
    setError('');
    try {
      const response = await apiFetch('/api/returns', session, {
        method: 'POST',
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Unable to create return');
      setSelectedReturnDraft(null);
      await loadPage();
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function updateReturnStatus(row, status) {
    const response = await apiFetch(`/api/returns/${row.id}/status`, session, {
      method: 'PUT',
      body: JSON.stringify({ status, refund_method: row.refund_method || 'Cash' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to update return');
    await loadPage();
  }

  async function toggleNotificationRead(row, is_read) {
    const response = await apiFetch(`/api/notifications/${row.id}/read`, session, {
      method: 'PUT',
      body: JSON.stringify({ is_read })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to update notification');
    await loadPage();
  }

  async function markAllNotifications() {
    const response = await apiFetch('/api/notifications/mark-all-read', session, { method: 'PUT' });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to mark notifications read');
    await loadPage();
  }

  function printMissingContacts() {
    const missing = rows.filter((row) => !String(row.email || '').trim() || !String(row.phone || '').trim());
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`
      <html><head><title>Missing Contacts</title>
      <style>
        body{font-family:Arial,sans-serif;padding:24px}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ddd;padding:10px;text-align:left;font-size:14px}
        th{background:#f4f7fb}
      </style>
      </head><body>
      <h1>Customers with missing email or phone</h1>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Spend</th></tr></thead>
        <tbody>
          ${missing
            .map((row) => `<tr><td>${row.name || '-'}</td><td>${row.email || '-'}</td><td>${row.phone || '-'}</td><td>${row.total_orders || 0}</td><td>${money(row.total_spent || 0)}</td></tr>`)
            .join('')}
        </tbody>
      </table>
      </body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  const orderRowActions = (row) => (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => openOrderDetails(row).catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700">
        Details
      </button>
      <button type="button" onClick={() => changeOrderStatus(row, 'To Ship').catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-amber-50 px-3 text-sm font-semibold text-amber-700">
        <Send size={14} />
        To Ship
      </button>
      <button type="button" onClick={() => changeOrderStatus(row, 'Received').catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
        <CircleCheck size={14} />
        Received
      </button>
      <button type="button" onClick={() => changeOrderStatus(row, 'Pending').catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700">
        <CircleX size={14} />
        Pending
      </button>
      <button type="button" onClick={() => createReturnFromOrder(row)} className="inline-flex min-h-9 items-center gap-1 rounded-xl bg-rose-50 px-3 text-sm font-semibold text-rose-700">
        Return
      </button>
    </div>
  );

  const returnRowActions = (row) => (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => updateReturnStatus(row, 'Requested').catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700">
        Pending
      </button>
      <button type="button" onClick={() => updateReturnStatus(row, 'Approved').catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center rounded-xl bg-emerald-50 px-3 text-sm font-semibold text-emerald-700">
        Approved
      </button>
      <button type="button" onClick={() => updateReturnStatus(row, 'Rejected').catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center rounded-xl bg-rose-50 px-3 text-sm font-semibold text-rose-700">
        Rejected
      </button>
      <button type="button" onClick={() => updateReturnStatus(row, 'Refunded').catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center rounded-xl bg-amber-50 px-3 text-sm font-semibold text-amber-700">
        Refunded
      </button>
    </div>
  );

  const notificationRowActions = (row) => (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={() => toggleNotificationRead(row, true).catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center rounded-xl bg-teal-50 px-3 text-sm font-semibold text-teal-700">
        Mark Read
      </button>
      <button type="button" onClick={() => toggleNotificationRead(row, false).catch((error) => setError(error.message))} className="inline-flex min-h-9 items-center rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700">
        Mark Unread
      </button>
    </div>
  );

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

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className={`fixed inset-y-0 left-0 z-50 w-[85%] max-w-[290px] overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-2xl transition lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:w-auto lg:rounded-3xl lg:border lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-[110%] lg:translate-x-0'}`}>
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

          <nav className="mt-4 grid gap-3">
            {sidebar.map((section, sectionIndex) => {
              const sectionKey = section.heading || `main-${sectionIndex}`;
              const isOpen = !section.heading || openSections[sectionKey] !== false;
              return (
              <div key={sectionKey}>
                {section.heading ? (
                  <button
                    type="button"
                    onClick={() => setOpenSections((current) => ({ ...current, [sectionKey]: current[sectionKey] === false }))}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-bold uppercase tracking-[0.18em] text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                    aria-expanded={isOpen}
                  >
                    {section.heading}
                    <ChevronDown size={15} className={`transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                  </button>
                ) : null}
                <div className={`${section.heading ? 'mt-1' : ''} grid gap-1 overflow-hidden ${isOpen ? '' : 'hidden'}`}>
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
              );
            })}
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
                      {(loading ? Array.from({ length: 4 }) : dashboardDetails.products).map((row, index) => (
                        <div key={row?.id || index} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                          {loading ? <div className="h-14 w-14 rounded-2xl bg-slate-100" /> : row.image_url ? <img src={row.image_url} alt={row.name} className="h-14 w-14 rounded-2xl object-cover" /> : <div className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400"><Package size={20} /></div>}
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate font-semibold text-slate-950">{loading ? 'Loading...' : row.name}</h3>
                            <p className="text-sm text-slate-500">{loading ? '' : row.category}</p>
                          </div>
                          {!loading ? <strong>{money(row.actual_price || row.discounted_price)}</strong> : null}
                        </div>
                      ))}
                      {!loading && !dashboardDetails.products.length ? <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">No products yet.</p> : null}
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
                      {!loading && !(summary?.lowStockItems || []).length ? <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">No low-stock items.</p> : null}
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
                      {(loading ? Array.from({ length: 4 }) : dashboardDetails.orders).map((row, index) => (
                        <div key={row?.id || index} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                          <div>
                            <h3 className="font-semibold text-slate-950">{loading ? 'Loading...' : row.customer_name}</h3>
                            <p className="text-sm text-slate-500">{loading ? '' : `#ORD-${row.id} • ${row.order_status}`}</p>
                          </div>
                          {!loading ? <strong>{money(row.total_amount)}</strong> : null}
                        </div>
                      ))}
                      {!loading && !dashboardDetails.orders.length ? <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-slate-500">No orders yet.</p> : null}
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
                <div className="flex items-center gap-2">
                  {activePage === 'Customers' ? (
                    <button type="button" onClick={printMissingContacts} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700">
                      <Printer size={16} />
                      Print Missing
                    </button>
                  ) : null}
                  {activePage === 'Notifications' ? (
                    <button type="button" onClick={() => markAllNotifications().catch((error) => setError(error.message))} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700">
                      Mark All Read
                    </button>
                  ) : null}
                  {!config.readonly && !config.noCreate ? (
                    <button type="button" onClick={() => setModal({})} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-teal-600 px-4 text-sm font-bold text-white">
                      <Edit3 size={16} />
                      {config.addLabel}
                    </button>
                  ) : null}
                </div>
              </section>

              {activePage === 'Customers' ? (
                <div className="grid gap-6">
                  <DataTable
                    columns={config.columns}
                    rows={rows}
                    loading={loading}
                    onEdit={(row) => setModal(row)}
                    onDelete={deleteRecord}
                    readonly={config.readonly}
                    noDelete={config.noDelete}
                  />

                  <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Accounts</p>
                        <h2 className="mt-1 text-xl font-black text-slate-950">Login accounts</h2>
                      </div>
                      <ShieldCheck className="text-teal-600" />
                    </div>
                    <div className="mt-4">
                      <DataTable columns={accountColumns} rows={businessRows} loading={loading} readonly />
                    </div>
                  </article>
                </div>
              ) : (
                <DataTable
                  columns={config.columns}
                  rows={rows}
                  loading={loading}
                  onEdit={(row) => setModal(row)}
                  onDelete={deleteRecord}
                  readonly={config.readonly}
                  noDelete={config.noDelete}
                  rowActions={activePage === 'Orders' ? orderRowActions : activePage === 'Returns' ? returnRowActions : activePage === 'Notifications' ? notificationRowActions : undefined}
                />
              )}

              {activePage !== 'Customers' ? (
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
              ) : null}
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

      {selectedReturnDraft ? (
        <RecordModal
          open={Boolean(selectedReturnDraft)}
          title="Add Return"
          fields={[
            ['order_id', 'Order ID', 'number'],
            ['product_id', 'Product ID', 'number'],
            ['customer', 'Customer', 'text'],
            ['product', 'Product', 'text'],
            ['reason', 'Reason', 'textarea'],
            ['refund_amount', 'Refund Amount', 'number'],
            ['refund_method', 'Refund Method', 'select', ['Bank', 'Easypaisa', 'JazzCash', 'Cash']],
            ['status', 'Status', 'select', ['Requested', 'Approved', 'Rejected', 'Refunded']]
          ]}
          initial={selectedReturnDraft}
          onClose={() => setSelectedReturnDraft(null)}
          onSubmit={submitReturnDraft}
          loading={saving}
        />
      ) : null}

      {selectedOrder ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/55 p-4">
          <button type="button" className="absolute inset-0 h-full w-full" aria-label="Close order details" onClick={() => setSelectedOrder(null)} />
          <section className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Order Details</p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">#ORD-{selectedOrder.id}</h3>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-semibold">
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Customer</p>
                <p className="mt-2 font-semibold text-slate-950">{selectedOrder.customer_name || '-'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Status</p>
                <p className="mt-2 font-semibold text-slate-950">{selectedOrder.order_status || '-'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Payment</p>
                <p className="mt-2 font-semibold text-slate-950">{selectedOrder.payment_status || '-'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Total</p>
                <p className="mt-2 font-semibold text-slate-950">{money(selectedOrder.total_amount)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Shipping Address</p>
              <p className="mt-2 text-sm text-slate-700">{selectedOrder.shipping_address || '-'}</p>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Items</p>
              <div className="mt-3 grid gap-3">
                {(selectedOrder.items || []).map((item) => (
                  <div key={item.id || item.product_id || item.product_name} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
                    <div>
                      <p className="font-semibold text-slate-950">{item.product_name || item.name || 'Item'}</p>
                      <p className="text-sm text-slate-500">Qty {item.qty || 1}</p>
                    </div>
                    <strong className="text-slate-950">{money((item.price || 0) * (item.qty || 1))}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" onClick={() => changeOrderStatus(selectedOrder, 'To Ship').catch((error) => setError(error.message))} className="inline-flex min-h-11 items-center rounded-2xl bg-amber-50 px-4 text-sm font-bold text-amber-700">
                To Ship
              </button>
              <button type="button" onClick={() => changeOrderStatus(selectedOrder, 'Received').catch((error) => setError(error.message))} className="inline-flex min-h-11 items-center rounded-2xl bg-emerald-50 px-4 text-sm font-bold text-emerald-700">
                Received
              </button>
              <button type="button" onClick={() => changeOrderStatus(selectedOrder, 'Pending').catch((error) => setError(error.message))} className="inline-flex min-h-11 items-center rounded-2xl bg-slate-100 px-4 text-sm font-bold text-slate-700">
                Pending
              </button>
              <button type="button" onClick={() => createReturnFromOrder(selectedOrder)} className="inline-flex min-h-11 items-center rounded-2xl bg-rose-50 px-4 text-sm font-bold text-rose-700">
                Create Return
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {mobileSidebarOpen ? <button type="button" aria-label="Close sidebar overlay" className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden" onClick={() => setMobileSidebarOpen(false)} /> : null}
    </div>
  );
}
