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
  Image,
  LayoutDashboard,
  Megaphone,
  Menu,
  Package,
  PackageCheck,
  PackageOpen,
  ReceiptText,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tag,
  Truck,
  Users,
  WalletCards,
  X
} from 'lucide-react';
import './styles.css';

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

const metrics = [
  { label: 'Today Orders', value: '248', trend: '+18%', icon: ShoppingBag },
  { label: 'Revenue', value: 'Rs 684K', trend: '+12%', icon: CircleDollarSign },
  { label: 'Active Products', value: '1,482', trend: '+34', icon: PackageCheck },
  { label: 'Low Stock', value: '26', trend: 'Check', icon: PackageOpen }
];

const products = [
  { name: 'Men Pullover Hoodie', category: 'Hoodies', stock: 84, price: 'Rs 8,950', status: 'Live' },
  { name: 'Oversized Cotton Tee', category: 'Shirts', stock: 132, price: 'Rs 3,450', status: 'Live' },
  { name: 'Classic Travel Bag', category: 'Bags', stock: 21, price: 'Rs 12,500', status: 'Low' },
  { name: 'Soft Runner Shoes', category: 'Shoes', stock: 58, price: 'Rs 15,200', status: 'Live' }
];

const orders = [
  { id: '#ORD-8732', customer: 'Tavorian Ali', total: 'Rs 18,400', stage: 'Packed', time: '12 min ago' },
  { id: '#ORD-8731', customer: 'Sana Mir', total: 'Rs 7,950', stage: 'Pending', time: '26 min ago' },
  { id: '#ORD-8728', customer: 'Hamza Noor', total: 'Rs 24,700', stage: 'Shipped', time: '1 hr ago' },
  { id: '#ORD-8726', customer: 'Maira Khan', total: 'Rs 5,400', stage: 'Returned', time: '3 hr ago' }
];

const panels = {
  Dashboard: {
    title: 'Store Overview',
    subtitle: 'Sales, stock, orders, and daily activity in one place.',
    accent: 'Rs 684K'
  },
  Banners: {
    title: 'Banners',
    subtitle: 'Manage app hero banners, seasonal campaigns, and offer visuals.',
    accent: '6 Active'
  },
  Adds: {
    title: 'Adds',
    subtitle: 'Create promotional ad slots for homepage, category, and cart screens.',
    accent: '14 Slots'
  },
  Categories: {
    title: 'Categories',
    subtitle: 'Organize fashion items by hoodies, shirts, shoes, bags, and collections.',
    accent: '22 Groups'
  },
  Stock: {
    title: 'Stock',
    subtitle: 'Track inventory alerts, warehouse levels, and incoming purchase batches.',
    accent: '26 Low'
  },
  Orders: {
    title: 'Orders',
    subtitle: 'Process pending, packed, shipped, delivered, and cancelled orders.',
    accent: '248 Today'
  },
  Returns: {
    title: 'Returns',
    subtitle: 'Handle return requests, quality checks, refunds, and replacements.',
    accent: '17 Open'
  },
  Staff: {
    title: 'Staff',
    subtitle: 'Control roles for admins, packers, riders, support, and managers.',
    accent: '12 Users'
  },
  Customers: {
    title: 'Customers',
    subtitle: 'View customer profiles, purchase history, loyalty, and support status.',
    accent: '8.4K'
  },
  'Product Listing': {
    title: 'Product Listing',
    subtitle: 'Create and publish products with size, color, price, and images.',
    accent: '1,482 Items'
  },
  Expense: {
    title: 'Expense',
    subtitle: 'Record rent, salaries, packaging, ads, rider fuel, and supplier costs.',
    accent: 'Rs 91K'
  },
  'Whole Sellers': {
    title: 'Whole Sellers',
    subtitle: 'Manage supplier contacts, invoices, bulk rates, and purchase orders.',
    accent: '38 Vendors'
  },
  Revenue: {
    title: 'Revenue',
    subtitle: 'Analyze daily cash, online payments, profit margins, and refunds.',
    accent: '+12%'
  },
  Notifications: {
    title: 'Notifications',
    subtitle: 'Send order, promo, stock, and customer reactivation notifications.',
    accent: '3.2K Sent'
  }
};

function App() {
  const [active, setActive] = React.useState('Dashboard');
  const [open, setOpen] = React.useState(false);
  const activePanel = panels[active];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark">A</div>
          <div>
            <strong>APEXIUMS</strong>
            <span>Super Store</span>
          </div>
          <button className="icon-btn close-mobile" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="nav-list" aria-label="Admin modules">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? 'active' : ''}`}
              onClick={() => {
                setActive(label);
                setOpen(false);
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-card">
          <WalletCards size={20} />
          <strong>Monthly Target</strong>
          <span>Rs 2.8M / Rs 4M</span>
          <div className="progress"><i /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="search-box">
            <Search size={18} />
            <input placeholder="Search orders, products, customers..." />
          </div>
          <button className="filter-btn">
            <span>Today</span>
            <ChevronDown size={16} />
          </button>
          <button className="icon-btn" aria-label="Notifications">
            <Bell size={19} />
          </button>
          <div className="admin-avatar">AM</div>
        </header>

        <section className="hero-band">
          <div>
            <p className="eyebrow">{active}</p>
            <h1>{activePanel.title}</h1>
            <p>{activePanel.subtitle}</p>
          </div>
          <div className="hero-product">
            <span>Featured</span>
            <div className="hoodie-art">
              <div className="hoodie-body" />
              <div className="hoodie-sleeve left" />
              <div className="hoodie-sleeve right" />
              <div className="hoodie-pocket" />
            </div>
            <strong>{activePanel.accent}</strong>
          </div>
        </section>

        <section className="metric-grid">
          {metrics.map(({ label, value, trend, icon: Icon }) => (
            <article className="metric-card" key={label}>
              <div className="metric-icon"><Icon size={20} /></div>
              <span>{label}</span>
              <strong>{value}</strong>
              <em>{trend}</em>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel large-panel">
            <div className="panel-head">
              <div>
                <h2>{active === 'Dashboard' ? 'Product Listing' : activePanel.title}</h2>
                <p>Latest records and quick management view</p>
              </div>
              <button className="primary-btn">Add New</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.name}>
                      <td>
                        <span className="product-cell">
                          <span className="product-thumb" />
                          {product.name}
                        </span>
                      </td>
                      <td>{product.category}</td>
                      <td>{product.stock}</td>
                      <td>{product.price}</td>
                      <td><mark className={product.status === 'Low' ? 'low' : ''}>{product.status}</mark></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head compact">
              <div>
                <h2>Orders</h2>
                <p>Recent activity</p>
              </div>
            </div>
            <div className="order-list">
              {orders.map((order) => (
                <div className="order-row" key={order.id}>
                  <div>
                    <strong>{order.id}</strong>
                    <span>{order.customer}</span>
                  </div>
                  <div>
                    <b>{order.total}</b>
                    <mark className={order.stage === 'Returned' ? 'low' : ''}>{order.stage}</mark>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="module-grid">
          {navItems.slice(1).map(({ label, icon: Icon }) => (
            <button
              className={`module-tile ${active === label ? 'selected' : ''}`}
              key={label}
              onClick={() => setActive(label)}
            >
              <Icon size={21} />
              <span>{label}</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
