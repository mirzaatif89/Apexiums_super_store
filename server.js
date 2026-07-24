import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { existsSync } from 'fs';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

const dbName = process.env.DB_NAME || 'apexiums-ecommerce';
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || ''
};

let pool;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const schemas = [
  `CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500),
    title VARCHAR(180) NOT NULL,
    link VARCHAR(500),
    position VARCHAR(80),
    status VARCHAR(30) DEFAULT 'Active',
    start_date DATE,
    end_date DATE,
    click_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    type VARCHAR(80),
    discount_value DECIMAL(10,2) DEFAULT 0,
    apply_scope VARCHAR(180),
    coupon_code VARCHAR(80),
    usage_limit INT DEFAULT 0,
    used_count INT DEFAULT 0,
    valid_from DATE,
    valid_till DATE,
    status VARCHAR(30) DEFAULT 'Active'
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(160) NOT NULL,
    parent_id INT NULL,
    image_url VARCHAR(500),
    description TEXT,
    status VARCHAR(30) DEFAULT 'Active'
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500),
    name VARCHAR(180) NOT NULL,
    description TEXT,
    category VARCHAR(120),
    base_price DECIMAL(12,2) DEFAULT 0,
    discounted_price DECIMAL(12,2) DEFAULT 0,
    sku VARCHAR(80),
    stock_qty INT DEFAULT 0,
    slug VARCHAR(180),
    meta_title VARCHAR(180),
    meta_desc TEXT,
    status VARCHAR(30) DEFAULT 'Live',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS product_variants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    size VARCHAR(40),
    color VARCHAR(60),
    price DECIMAL(12,2) DEFAULT 0,
    stock INT DEFAULT 0,
    sku VARCHAR(80)
  )`,
  `CREATE TABLE IF NOT EXISTS stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    product_name VARCHAR(180),
    sku VARCHAR(80),
    category VARCHAR(120),
    quantity INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    warehouse VARCHAR(120),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS stock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    change_qty INT,
    reason VARCHAR(120),
    notes TEXT,
    created_by VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    customer_name VARCHAR(180),
    items_count INT DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(80),
    payment_status VARCHAR(40),
    order_status VARCHAR(40),
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    product_name VARCHAR(180),
    image_url VARCHAR(500),
    qty INT DEFAULT 1,
    price DECIMAL(12,2) DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    customer_id INT,
    customer VARCHAR(180),
    product VARCHAR(180),
    reason TEXT,
    status VARCHAR(40) DEFAULT 'Requested',
    refund_amount DECIMAL(12,2) DEFAULT 0,
    refund_method VARCHAR(80),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    photo_url VARCHAR(500),
    name VARCHAR(160) NOT NULL,
    email VARCHAR(180),
    phone VARCHAR(60),
    role VARCHAR(80),
    password_hash VARCHAR(255),
    status VARCHAR(40) DEFAULT 'Active',
    last_login DATETIME
  )`,
  `CREATE TABLE IF NOT EXISTS staff_permissions (
    staff_id INT,
    module VARCHAR(80),
    can_view BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT FALSE
  )`,
  `CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    avatar_url VARCHAR(500),
    name VARCHAR(160) NOT NULL,
    email VARCHAR(180),
    phone VARCHAR(60),
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(40) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    category VARCHAR(80),
    amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(80),
    date DATE,
    receipt_url VARCHAR(500),
    added_by VARCHAR(120),
    notes TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS wholesellers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(180) NOT NULL,
    contact_person VARCHAR(160),
    phone VARCHAR(60),
    email VARCHAR(180),
    address TEXT,
    products_supplied TEXT,
    total_purchases DECIMAL(12,2) DEFAULT 0,
    payment_due DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(40) DEFAULT 'Active'
  )`,
  `CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wholeseller_id INT,
    items_json JSON,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(40),
    date DATE
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(80),
    title VARCHAR(180) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
];

const seeds = {
  banners: [
    { image_url: '/banner-hoodie.jpg', title: 'Winter Hoodie Drop', link: '/hoodies', position: 'Home Top', status: 'Active', start_date: '2026-01-01', end_date: '2026-12-31', click_count: 1840 },
    { image_url: '/banner-sale.jpg', title: 'Flat 20% Weekend Sale', link: '/sale', position: 'Popup', status: 'Active', start_date: '2026-07-01', end_date: '2026-07-31', click_count: 932 }
  ],
  promotions: [
    { name: 'Flash Hoodie Sale', type: 'Flash Sale', discount_value: 20, apply_scope: 'Hoodies', coupon_code: 'HOODIE20', usage_limit: 500, used_count: 142, valid_from: '2026-07-01', valid_till: '2026-07-31', status: 'Active' }
  ],
  categories: [
    { name: 'Hoodies', parent_id: null, image_url: '/cat-hoodies.jpg', description: 'Premium pullovers and hoodies', status: 'Active' },
    { name: 'Shoes', parent_id: null, image_url: '/cat-shoes.jpg', description: 'Daily wear and fashion shoes', status: 'Active' }
  ],
  products: [
    { image_url: '/product-hoodie.jpg', name: 'Men Pullover Hoodie', description: 'Warm gradient pullover hoodie', category: 'Hoodies', base_price: 8950, discounted_price: 7990, sku: 'HD-MEN-001', stock_qty: 84, slug: 'men-pullover-hoodie', meta_title: 'Men Pullover Hoodie', meta_desc: 'Premium hoodie', status: 'Live' },
    { image_url: '/product-bag.jpg', name: 'Classic Travel Bag', description: 'Soft travel bag', category: 'Bags', base_price: 12500, discounted_price: 0, sku: 'BAG-001', stock_qty: 21, slug: 'classic-travel-bag', meta_title: 'Classic Travel Bag', meta_desc: 'Travel bag', status: 'Live' }
  ],
  stock: [
    { product_id: 1, product_name: 'Men Pullover Hoodie', sku: 'HD-MEN-001', category: 'Hoodies', quantity: 84, reorder_level: 20, warehouse: 'Main Warehouse' },
    { product_id: 2, product_name: 'Classic Travel Bag', sku: 'BAG-001', category: 'Bags', quantity: 8, reorder_level: 15, warehouse: 'Main Warehouse' }
  ],
  orders: [
    { customer_id: 1, customer_name: 'Tavorian Ali', items_count: 2, total_amount: 18400, payment_method: 'COD', payment_status: 'Pending', order_status: 'Packed', shipping_address: 'Jand, Attock' },
    { customer_id: 2, customer_name: 'Sana Mir', items_count: 1, total_amount: 7950, payment_method: 'JazzCash', payment_status: 'Paid', order_status: 'Pending', shipping_address: 'Rawalpindi' }
  ],
  returns: [
    { order_id: 1, product_id: 1, customer_id: 1, customer: 'Tavorian Ali', product: 'Men Pullover Hoodie', reason: 'Size issue', status: 'Requested', refund_amount: 7990, refund_method: 'Original Payment' }
  ],
  staff: [
    { photo_url: '', name: 'Atif Mirza', email: 'admin@apexiums.com', phone: '03000000000', role: 'Admin', password_hash: '', status: 'Active', last_login: '2026-07-24 09:30:00' }
  ],
  customers: [
    { avatar_url: '', name: 'Tavorian Ali', email: 'tavorian@example.com', phone: '03001112223', total_orders: 7, total_spent: 84500, status: 'Active' },
    { avatar_url: '', name: 'Sana Mir', email: 'sana@example.com', phone: '03004445556', total_orders: 3, total_spent: 28700, status: 'Active' }
  ],
  expenses: [
    { title: 'Instagram Ads', category: 'Marketing', amount: 35000, payment_method: 'Bank', date: '2026-07-15', receipt_url: '', added_by: 'Atif', notes: 'Monthly campaign' },
    { title: 'Shop Rent', category: 'Rent', amount: 56000, payment_method: 'Cash', date: '2026-07-01', receipt_url: '', added_by: 'Atif', notes: 'July rent' }
  ],
  wholesellers: [
    { business_name: 'Urban Wear Wholesale', contact_person: 'Bilal Khan', phone: '03112223334', email: 'sales@urbanwear.pk', address: 'Lahore', products_supplied: 'Hoodies, Shirts', total_purchases: 420000, payment_due: 55000, status: 'Active' }
  ],
  notifications: [
    { type: 'Orders', title: 'New order received', message: 'Order #ORD-8732 is ready for packing.', is_read: false },
    { type: 'Stock Alerts', title: 'Low stock alert', message: 'Classic Travel Bag stock is below reorder level.', is_read: false }
  ]
};

const resources = {
  banners: ['image_url', 'title', 'link', 'position', 'status', 'start_date', 'end_date', 'click_count'],
  promotions: ['name', 'type', 'discount_value', 'apply_scope', 'coupon_code', 'usage_limit', 'used_count', 'valid_from', 'valid_till', 'status'],
  categories: ['name', 'parent_id', 'image_url', 'description', 'status'],
  products: ['image_url', 'name', 'description', 'category', 'base_price', 'discounted_price', 'sku', 'stock_qty', 'slug', 'meta_title', 'meta_desc', 'status'],
  orders: ['customer_id', 'customer_name', 'items_count', 'total_amount', 'payment_method', 'payment_status', 'order_status', 'shipping_address', 'created_at'],
  returns: ['order_id', 'product_id', 'customer_id', 'customer', 'product', 'reason', 'status', 'refund_amount', 'refund_method', 'created_at'],
  expenses: ['title', 'category', 'amount', 'payment_method', 'date', 'receipt_url', 'added_by', 'notes'],
  wholesellers: ['business_name', 'contact_person', 'phone', 'email', 'address', 'products_supplied', 'total_purchases', 'payment_due', 'status'],
  staff: ['photo_url', 'name', 'email', 'phone', 'role', 'password_hash', 'status', 'last_login'],
  customers: ['avatar_url', 'name', 'email', 'phone', 'total_orders', 'total_spent', 'status', 'created_at'],
  notifications: ['type', 'title', 'message', 'is_read', 'created_at']
};

function backtick(identifier) {
  return `\`${identifier}\``;
}

async function initializeDatabase() {
  const server = await mysql.createConnection(dbConfig);
  await server.query(`CREATE DATABASE IF NOT EXISTS ${backtick(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await server.end();

  pool = mysql.createPool({ ...dbConfig, database: dbName, waitForConnections: true, connectionLimit: 10 });
  for (const schema of schemas) await pool.query(schema);

  for (const [table, rows] of Object.entries(seeds)) {
    const [[{ count }]] = await pool.query(`SELECT COUNT(*) AS count FROM ${backtick(table)}`);
    if (count) continue;

    for (const row of rows) {
      const columns = Object.keys(row);
      const placeholders = columns.map(() => '?').join(', ');
      await pool.query(
        `INSERT INTO ${backtick(table)} (${columns.map(backtick).join(', ')}) VALUES (${placeholders})`,
        columns.map((column) => row[column])
      );
    }
  }
}

function cleanPayload(payload, allowed) {
  return Object.fromEntries(
    allowed
      .filter((field) => Object.prototype.hasOwnProperty.call(payload, field))
      .map((field) => [field, payload[field] === '' ? null : payload[field]])
  );
}

function requireFields(payload, fields) {
  const missing = fields.filter((field) => !String(payload[field] ?? '').trim());
  return missing.length ? `${missing.join(', ')} required` : null;
}

async function listRows(table, req, res) {
  const search = String(req.query.search || '').trim();
  const sort = resources[table]?.includes(req.query.sort) ? req.query.sort : 'id';
  const order = String(req.query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const page = Math.max(Number(req.query.page || 1), 1);
  const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;
  const searchable = resources[table].filter((field) => !field.includes('date') && !field.includes('count') && !field.includes('amount') && !field.includes('value') && !field.includes('limit'));

  const where = search
    ? `WHERE ${searchable.map((field) => `${backtick(field)} LIKE ?`).join(' OR ')}`
    : '';
  const params = search ? searchable.map(() => `%${search}%`) : [];
  const [rows] = await pool.query(
    `SELECT * FROM ${backtick(table)} ${where} ORDER BY ${backtick(sort)} ${order} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM ${backtick(table)} ${where}`, params);
  res.json({ rows, total, page, limit });
}

function crudRoutes(resource, required = []) {
  const fields = resources[resource];

  app.get(`/api/${resource}`, async (req, res) => {
    try {
      await listRows(resource, req, res);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(`/api/${resource}`, async (req, res) => {
    try {
      const validation = requireFields(req.body, required);
      if (validation) return res.status(400).json({ message: validation });
      const data = cleanPayload(req.body, fields);
      const columns = Object.keys(data);
      const placeholders = columns.map(() => '?').join(', ');
      const [result] = await pool.query(
        `INSERT INTO ${backtick(resource)} (${columns.map(backtick).join(', ')}) VALUES (${placeholders})`,
        columns.map((column) => data[column])
      );
      res.status(201).json({ id: result.insertId, ...data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put(`/api/${resource}/:id`, async (req, res) => {
    try {
      const data = cleanPayload(req.body, fields);
      const columns = Object.keys(data);
      if (!columns.length) return res.status(400).json({ message: 'No valid fields supplied' });
      await pool.query(
        `UPDATE ${backtick(resource)} SET ${columns.map((column) => `${backtick(column)} = ?`).join(', ')} WHERE id = ?`,
        [...columns.map((column) => data[column]), req.params.id]
      );
      res.json({ id: Number(req.params.id), ...data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete(`/api/${resource}/:id`, async (req, res) => {
    try {
      await pool.query(`DELETE FROM ${backtick(resource)} WHERE id = ?`, [req.params.id]);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, app: 'Apexiums Super Store Admin', database: dbName });
});

app.get('/api/db-check', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS database_name, NOW() AS server_time');
    res.json({ ok: true, database: rows[0].database_name, serverTime: rows[0].server_time });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Database connection failed', error: error.message });
  }
});

Object.entries({
  banners: ['title'],
  promotions: ['name'],
  categories: ['name'],
  products: ['name'],
  expenses: ['title'],
  wholesellers: ['business_name'],
  staff: ['name']
}).forEach(([resource, required]) => crudRoutes(resource, required));

app.get('/api/stock', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT *, CASE WHEN quantity <= 0 THEN 'Out' WHEN quantity <= reorder_level THEN 'Low' ELSE 'In Stock' END AS status FROM stock ORDER BY updated_at DESC`);
    res.json({ rows, total: rows.length, page: 1, limit: rows.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/stock/adjust', async (req, res) => {
  const { product_id, adjustment_type, quantity, reason, notes, created_by } = req.body;
  const qty = Number(quantity || 0);
  if (!product_id || !qty || !reason) return res.status(400).json({ message: 'product_id, quantity and reason required' });
  const change = adjustment_type === 'Remove' ? -Math.abs(qty) : Math.abs(qty);
  try {
    await pool.query('UPDATE stock SET quantity = GREATEST(quantity + ?, 0) WHERE product_id = ?', [change, product_id]);
    await pool.query(
      'INSERT INTO stock_history (product_id, change_qty, reason, notes, created_by) VALUES (?, ?, ?, ?, ?)',
      [product_id, change, reason, notes || null, created_by || 'Admin']
    );
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/stock/history/:productId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM stock_history WHERE product_id = ? ORDER BY created_at DESC', [req.params.productId]);
    res.json({ rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    await listRows('orders', { ...req, query: { ...req.query, sort: req.query.sort || 'created_at' } }, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const [[order]] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    res.json({ ...order, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    await pool.query('UPDATE orders SET order_status = ? WHERE id = ?', [req.body.order_status, req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/returns', async (req, res) => {
  try {
    await listRows('returns', { ...req, query: { ...req.query, sort: req.query.sort || 'created_at' } }, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/returns/:id/status', async (req, res) => {
  try {
    await pool.query('UPDATE returns SET status = ?, refund_method = ? WHERE id = ?', [req.body.status, req.body.refund_method || null, req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    await listRows('customers', { ...req, query: { ...req.query, sort: req.query.sort || 'created_at' } }, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    const [orders] = await pool.query('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json({ ...customer, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/customers/:id/status', async (req, res) => {
  try {
    await pool.query('UPDATE customers SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/revenue/summary', async (req, res) => {
  try {
    const [[ordersSummary]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue, COALESCE(AVG(total_amount), 0) AS avg_order_value FROM orders WHERE order_status != 'Cancelled'");
    const [[expenseSummary]] = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total_expense FROM expenses');
    const [payments] = await pool.query("SELECT payment_method, SUM(total_amount) AS amount FROM orders WHERE order_status != 'Cancelled' GROUP BY payment_method");
    res.json({
      totalRevenue: Number(ordersSummary.total_revenue),
      netProfit: Number(ordersSummary.total_revenue) - Number(expenseSummary.total_expense),
      avgOrderValue: Number(ordersSummary.avg_order_value),
      growth: 12,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/revenue/chart', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue FROM orders WHERE order_status != 'Cancelled' GROUP BY DATE(created_at) ORDER BY date ASC LIMIT 30");
    res.json({ rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    await listRows('notifications', { ...req, query: { ...req.query, sort: req.query.sort || 'created_at' } }, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = ? WHERE id = ?', [Boolean(req.body.is_read), req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API server running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Database initialization failed:', error.message);
    process.exit(1);
  });
