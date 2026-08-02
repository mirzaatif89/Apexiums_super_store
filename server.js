import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { existsSync } from 'fs';
import crypto from 'crypto';
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
const DEFAULT_BUSINESS_ID = 1;
const businessScopedTables = new Set([
  'banners',
  'categories',
  'coupons',
  'expenses',
  'notifications',
  'orders',
  'order_items',
  'products',
  'promotions',
  'product_variants',
  'staff',
  'customers',
  'returns',
  'stock',
  'stock_history',
  'wholesellers'
]);

app.use(cors());
app.use(express.json({ limit: '25mb' }));

const schemas = [
  `CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    image_url VARCHAR(500),
    title VARCHAR(180) DEFAULT 'Banner',
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
    business_id INT DEFAULT 1,
    name VARCHAR(180) DEFAULT 'Ad',
    image_url VARCHAR(500),
    valid_from DATE,
    valid_till DATE,
    show_on_website VARCHAR(30) DEFAULT 'Yes',
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS coupons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    code VARCHAR(80) NOT NULL,
    title VARCHAR(180),
    description TEXT,
    discount_type VARCHAR(40) DEFAULT 'Percentage',
    discount_value DECIMAL(10,2) DEFAULT 0,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    use_for VARCHAR(80) DEFAULT 'Product discount',
    usage_limit INT DEFAULT 0,
    used_count INT DEFAULT 0,
    valid_from DATE,
    valid_till DATE,
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    name VARCHAR(160) NOT NULL,
    parent_id INT NULL,
    image_url VARCHAR(500),
    description TEXT,
    status VARCHAR(30) DEFAULT 'Active'
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    image_url VARCHAR(500),
    product_images LONGTEXT,
    name VARCHAR(180) NOT NULL,
    description TEXT,
    product_detail TEXT,
    category VARCHAR(120),
    actual_price DECIMAL(12,2) DEFAULT 0,
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
    business_id INT DEFAULT 1,
    product_id INT,
    size VARCHAR(40),
    color VARCHAR(60),
    price DECIMAL(12,2) DEFAULT 0,
    stock INT DEFAULT 0,
    sku VARCHAR(80)
  )`,
  `CREATE TABLE IF NOT EXISTS stock (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
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
    business_id INT DEFAULT 1,
    product_id INT,
    change_qty INT,
    reason VARCHAR(120),
    notes TEXT,
    created_by VARCHAR(120),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
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
    business_id INT DEFAULT 1,
    order_id INT,
    product_id INT,
    product_name VARCHAR(180),
    image_url VARCHAR(500),
    qty INT DEFAULT 1,
    price DECIMAL(12,2) DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS returns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
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
    business_id INT DEFAULT 1,
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
    business_id INT DEFAULT 1,
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
    business_id INT DEFAULT 1,
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
    business_id INT DEFAULT 1,
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
    business_id INT DEFAULT 1,
    type VARCHAR(80),
    title VARCHAR(180) NOT NULL,
    message TEXT,
    entity_type VARCHAR(80),
    entity_id INT,
    alert_key VARCHAR(180),
    severity VARCHAR(30) DEFAULT 'Info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS business_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(180) NOT NULL,
    username VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    owner_name VARCHAR(160),
    cnic VARCHAR(60),
    address TEXT,
    email VARCHAR(180),
    phone VARCHAR(60),
    agreement_image VARCHAR(500),
    role VARCHAR(40) DEFAULT 'BusinessAdmin',
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )`
];

const seeds = {};

const resources = {
  banners: ['image_url', 'title', 'link', 'position', 'status', 'start_date', 'end_date', 'click_count'],
  promotions: ['name', 'image_url', 'valid_from', 'valid_till', 'show_on_website', 'status', 'created_at'],
  categories: ['name', 'parent_id', 'image_url', 'description', 'status'],
  products: ['image_url', 'product_images', 'name', 'description', 'product_detail', 'category', 'actual_price', 'base_price', 'discounted_price', 'sku', 'stock_qty', 'slug', 'meta_title', 'meta_desc', 'status'],
  orders: ['customer_id', 'customer_name', 'items_count', 'total_amount', 'payment_method', 'payment_status', 'order_status', 'shipping_address', 'created_at'],
  returns: ['order_id', 'product_id', 'customer_id', 'customer', 'product', 'reason', 'status', 'refund_amount', 'refund_method', 'created_at'],
  expenses: ['title', 'category', 'amount', 'payment_method', 'date', 'receipt_url', 'added_by', 'notes'],
  wholesellers: ['business_name', 'contact_person', 'phone', 'email', 'address', 'products_supplied', 'total_purchases', 'payment_due', 'status'],
  staff: ['photo_url', 'name', 'email', 'phone', 'role', 'password_hash', 'status', 'last_login'],
  customers: ['avatar_url', 'name', 'email', 'phone', 'total_orders', 'total_spent', 'status', 'created_at'],
  notifications: ['type', 'title', 'message', 'is_read', 'created_at'],
  coupons: ['code', 'title', 'description', 'discount_type', 'discount_value', 'min_order_amount', 'use_for', 'usage_limit', 'used_count', 'valid_from', 'valid_till', 'status']
};

function backtick(identifier) {
  return `\`${identifier}\``;
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const derived = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password, stored) {
  if (!stored || !String(stored).includes(':')) return false;
  const [salt, hash] = String(stored).split(':');
  return hashPassword(password, salt) === `${salt}:${hash}`;
}

function getContext(req) {
  const role = String(req.headers['x-user-role'] || '').trim();
  const businessId = Number(req.headers['x-business-id'] || 0) || null;
  return { role, businessId };
}

function businessScope(table, req, alias = '') {
  const { businessId } = getContext(req);
  if (!businessScopedTables.has(table) || !businessId) {
    return { clause: '', params: [] };
  }
  const column = `${alias ? `${alias}.` : ''}business_id`;
  return { clause: `${column} = ?`, params: [businessId] };
}

async function ensureColumn(table, columnName, columnDefinition, afterInsertUpdate = null) {
  const [rows] = await pool.query(`SHOW COLUMNS FROM ${backtick(table)} LIKE ?`, [columnName]);
  if (rows.length) return;
  await pool.query(`ALTER TABLE ${backtick(table)} ADD COLUMN ${backtick(columnName)} ${columnDefinition}`);
  if (afterInsertUpdate) await pool.query(afterInsertUpdate);
}

async function seedAuthData() {
  const adminUsername = String(process.env.ADMIN_USERNAME || 'superadmin').trim() || 'superadmin';
  const adminPassword = String(process.env.ADMIN_PASSWORD || 'Admin@12345');
  const passwordHash = hashPassword(adminPassword);
  const [[existing]] = await pool.query('SELECT id FROM business_accounts WHERE id = 1 LIMIT 1');
  if (existing) {
    await pool.query(
      `UPDATE business_accounts
       SET business_name = ?, username = ?, password_hash = ?, owner_name = ?, email = ?, phone = ?, role = ?, status = ?
       WHERE id = 1`,
      ['Apexiums HQ', adminUsername, passwordHash, 'Super Admin', 'admin@apexiums.com', '03000000000', 'SuperAdmin', 'Active']
    );
    return;
  }
  await pool.query(
    'INSERT INTO business_accounts (id, business_name, username, password_hash, owner_name, email, phone, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [1, 'Apexiums HQ', adminUsername, passwordHash, 'Super Admin', 'admin@apexiums.com', '03000000000', 'SuperAdmin', 'Active']
  );
}

async function syncLowStockAlerts(businessId = null) {
  if (!pool) return;
  const filters = ['quantity <= reorder_level'];
  const params = [];
  if (businessId) {
    filters.unshift('business_id = ?');
    params.push(businessId);
  }
  const [rows] = await pool.query(
    `SELECT id, business_id, product_name, sku, quantity, reorder_level
     FROM stock
     WHERE ${filters.join(' AND ')}`,
    params
  );

  for (const row of rows) {
    const alertKey = `stock-${row.business_id || DEFAULT_BUSINESS_ID}-${row.id}`;
    const title = `Low stock: ${row.product_name}`;
    const message = `${row.product_name} (${row.sku || 'SKU'}) is at ${row.quantity} units. Reorder level is ${row.reorder_level}.`;
    const [[existing]] = await pool.query('SELECT id FROM notifications WHERE alert_key = ?', [alertKey]);
    if (existing) {
      await pool.query(
        'UPDATE notifications SET title = ?, message = ?, severity = ?, is_read = 0, business_id = ? WHERE id = ?',
        [title, message, 'Warning', row.business_id || DEFAULT_BUSINESS_ID, existing.id]
      );
      continue;
    }
    await pool.query(
      'INSERT INTO notifications (business_id, type, title, message, entity_type, entity_id, alert_key, severity, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [row.business_id || DEFAULT_BUSINESS_ID, 'Stock Alerts', title, message, 'stock', row.id, alertKey, 'Warning']
    );
  }
}

async function initializeDatabase() {
  const server = await mysql.createConnection(dbConfig);
  await server.query(`CREATE DATABASE IF NOT EXISTS ${backtick(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await server.end();

  pool = mysql.createPool({ ...dbConfig, database: dbName, waitForConnections: true, connectionLimit: 10 });
  for (const schema of schemas) await pool.query(schema);

  const businessTables = ['banners', 'promotions', 'coupons', 'categories', 'products', 'product_variants', 'stock', 'stock_history', 'orders', 'order_items', 'returns', 'staff', 'customers', 'expenses', 'wholesellers', 'notifications'];
  for (const table of businessTables) {
    await ensureColumn(table, 'business_id', 'INT DEFAULT 1');
    await pool.query(`UPDATE ${backtick(table)} SET business_id = ${DEFAULT_BUSINESS_ID} WHERE business_id IS NULL`);
  }
  await ensureColumn('banners', 'title', "VARCHAR(180) DEFAULT 'Banner'");
  await ensureColumn('promotions', 'image_url', 'VARCHAR(500)');
  await ensureColumn('promotions', 'show_on_website', "VARCHAR(30) DEFAULT 'Yes'");
  await ensureColumn('promotions', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  await ensureColumn('coupons', 'description', 'TEXT');
  await ensureColumn('coupons', 'use_for', "VARCHAR(80) DEFAULT 'Product discount'");
  await ensureColumn('products', 'product_images', 'LONGTEXT');
  await ensureColumn('products', 'product_detail', 'TEXT');
  await ensureColumn('products', 'actual_price', 'DECIMAL(12,2) DEFAULT 0');
  await ensureColumn('business_accounts', 'cnic', 'VARCHAR(60)');
  await ensureColumn('business_accounts', 'address', 'TEXT');
  await ensureColumn('business_accounts', 'agreement_image', 'VARCHAR(500)');
  await ensureColumn('notifications', 'entity_type', 'VARCHAR(80) NULL');
  await ensureColumn('notifications', 'entity_id', 'INT NULL');
  await ensureColumn('notifications', 'alert_key', 'VARCHAR(180) NULL');
  await ensureColumn('notifications', 'severity', "VARCHAR(30) DEFAULT 'Info'");

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

  await seedAuthData();
  await syncLowStockAlerts(DEFAULT_BUSINESS_ID);
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
  const clauses = [];
  const params = [];
  const scope = businessScope(table, req);
  if (scope.clause) {
    clauses.push(scope.clause);
    params.push(...scope.params);
  }
  if (search) {
    clauses.push(`(${searchable.map((field) => `${backtick(field)} LIKE ?`).join(' OR ')})`);
    params.push(...searchable.map(() => `%${search}%`));
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
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
      const { role, businessId } = getContext(req);
      if (businessScopedTables.has(resource) && !Object.prototype.hasOwnProperty.call(data, 'business_id')) {
        data.business_id = role === 'SuperAdmin' && businessId ? businessId : businessId || DEFAULT_BUSINESS_ID;
      }
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
      const { businessId } = getContext(req);
      if (businessScopedTables.has(resource) && !Object.prototype.hasOwnProperty.call(data, 'business_id')) {
        data.business_id = businessId || DEFAULT_BUSINESS_ID;
        columns.push('business_id');
      }
      const scope = businessScope(resource, req);
      const where = scope.clause ? `AND ${scope.clause}` : '';
      await pool.query(
        `UPDATE ${backtick(resource)} SET ${columns.map((column) => `${backtick(column)} = ?`).join(', ')} WHERE id = ? ${where}`,
        [...columns.map((column) => data[column]), req.params.id, ...scope.params]
      );
      res.json({ id: Number(req.params.id), ...data });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete(`/api/${resource}/:id`, async (req, res) => {
    try {
      const scope = businessScope(resource, req);
      const where = scope.clause ? `AND ${scope.clause}` : '';
      await pool.query(`DELETE FROM ${backtick(resource)} WHERE id = ? ${where}`, [req.params.id, ...scope.params]);
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

function safeBusinessAccount(account) {
  if (!account) return null;
  const { password_hash, ...safe } = account;
  return safe;
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    const [[account]] = await pool.query('SELECT * FROM business_accounts WHERE username = ? LIMIT 1', [username]);
    if (!account || account.status === 'Inactive') return res.status(401).json({ message: 'Invalid credentials' });
    if (!verifyPassword(password, account.password_hash)) return res.status(401).json({ message: 'Invalid credentials' });
    await pool.query('UPDATE business_accounts SET last_login = NOW() WHERE id = ?', [account.id]);
    res.json({
      user: safeBusinessAccount(account),
      businessId: account.id,
      role: account.role,
      token: `business-${account.id}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/business-accounts', async (req, res) => {
  try {
    const { role, businessId } = getContext(req);
    const columns = 'id, business_name, username, owner_name, cnic, address, email, phone, agreement_image, role, status, created_at, last_login';
    const params = [];
    let where = '';
    if (role !== 'SuperAdmin' && businessId) {
      where = 'WHERE id = ?';
      params.push(businessId);
    }
    const [rows] = await pool.query(`SELECT ${columns} FROM business_accounts ${where} ORDER BY created_at DESC`, params);
    res.json({ rows, total: rows.length, page: 1, limit: rows.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/business-accounts', async (req, res) => {
  try {
    const { role } = getContext(req);
    if (role !== 'SuperAdmin') return res.status(403).json({ message: 'Only superadmin can create business accounts' });
    const required = requireFields(req.body, ['business_name', 'username', 'password']);
    if (required) return res.status(400).json({ message: required });
    const username = String(req.body.username || '').trim();
    const [existing] = await pool.query('SELECT id FROM business_accounts WHERE username = ? LIMIT 1', [username]);
    if (existing.length) return res.status(409).json({ message: 'Username already exists' });
    const passwordHash = hashPassword(req.body.password);
    const [result] = await pool.query(
      'INSERT INTO business_accounts (business_name, username, password_hash, owner_name, cnic, address, email, phone, agreement_image, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.body.business_name,
        username,
        passwordHash,
        req.body.owner_name || null,
        req.body.cnic || null,
        req.body.address || null,
        req.body.email || null,
        req.body.phone || null,
        req.body.agreement_image || null,
        req.body.role || 'BusinessAdmin',
        req.body.status || 'Active'
      ]
    );
    res.status(201).json({
      id: result.insertId,
      business_name: req.body.business_name,
      username,
      owner_name: req.body.owner_name || null,
      cnic: req.body.cnic || null,
      address: req.body.address || null,
      email: req.body.email || null,
      phone: req.body.phone || null,
      agreement_image: req.body.agreement_image || null,
      role: req.body.role || 'BusinessAdmin',
      status: req.body.status || 'Active'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/business-accounts/:id', async (req, res) => {
  try {
    const { role, businessId } = getContext(req);
    if (role !== 'SuperAdmin' && Number(req.params.id) !== businessId) {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const data = {};
    ['business_name', 'owner_name', 'cnic', 'address', 'email', 'phone', 'agreement_image', 'role', 'status'].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) data[key] = req.body[key] || null;
    });
    if (req.body.password) data.password_hash = hashPassword(req.body.password);
    const columns = Object.keys(data);
    if (!columns.length) return res.status(400).json({ message: 'No valid fields supplied' });
    await pool.query(
      `UPDATE business_accounts SET ${columns.map((column) => `${backtick(column)} = ?`).join(', ')} WHERE id = ?`,
      [...columns.map((column) => data[column]), req.params.id]
    );
    res.json({ id: Number(req.params.id), ...data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/business-accounts/:id', async (req, res) => {
  try {
    const { role } = getContext(req);
    if (role !== 'SuperAdmin') return res.status(403).json({ message: 'Only superadmin can delete business accounts' });
    await pool.query('DELETE FROM business_accounts WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const scopeProducts = businessScope('products', req);
    const scopeOrders = businessScope('orders', req);
    const scopeStock = businessScope('stock', req);
    const scopeCoupons = businessScope('coupons', req);
    const scopeNotifications = businessScope('notifications', req);
    const productWhere = scopeProducts.clause ? `WHERE ${scopeProducts.clause}` : '';
    const orderWhere = scopeOrders.clause ? `WHERE ${scopeOrders.clause}` : '';
    const stockWhere = scopeStock.clause ? `WHERE ${scopeStock.clause}` : '';
    const couponWhere = scopeCoupons.clause ? `WHERE ${scopeCoupons.clause}` : '';
    const notificationWhere = scopeNotifications.clause ? `WHERE ${scopeNotifications.clause}` : '';
    const [products] = await pool.query(`SELECT COUNT(*) AS total, SUM(status = 'Live') AS active FROM products ${productWhere}`, scopeProducts.params);
    const [orders] = await pool.query(`SELECT COUNT(*) AS total, COALESCE(SUM(total_amount), 0) AS revenue, SUM(order_status = 'Pending') AS pending FROM orders ${orderWhere}`, scopeOrders.params);
    const [stock] = await pool.query(`SELECT COUNT(*) AS total, SUM(quantity <= reorder_level AND quantity > 0) AS low, SUM(quantity <= 0) AS out_of_stock FROM stock ${stockWhere}`, scopeStock.params);
    const [coupons] = await pool.query(`SELECT COUNT(*) AS total, SUM(status = 'Active') AS active FROM coupons ${couponWhere}`, scopeCoupons.params);
    const [notifications] = await pool.query(`SELECT COUNT(*) AS total, SUM(is_read = 0) AS unread FROM notifications ${notificationWhere}`, scopeNotifications.params);
    const [businessAccounts] = await pool.query('SELECT COUNT(*) AS total FROM business_accounts');
    const lowStockWhere = scopeStock.clause ? `${stockWhere} AND quantity <= reorder_level` : 'WHERE quantity <= reorder_level';
    const [lowStockItems] = await pool.query(
      `SELECT product_name, sku, quantity, reorder_level, warehouse FROM stock ${lowStockWhere} ORDER BY quantity ASC LIMIT 5`,
      scopeStock.params
    );
    res.json({
      products: products[0],
      orders: orders[0],
      stock: stock[0],
      coupons: coupons[0],
      notifications: notifications[0],
      businesses: businessAccounts[0],
      lowStockItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

Object.entries({
  banners: ['image_url'],
  promotions: ['image_url'],
  categories: ['name'],
  products: ['name'],
  expenses: ['title'],
  wholesellers: ['business_name'],
  staff: ['name'],
  coupons: ['code']
}).forEach(([resource, required]) => crudRoutes(resource, required));

app.get('/api/stock', async (req, res) => {
  try {
    const scope = businessScope('stock', req);
    const where = scope.clause ? `WHERE ${scope.clause}` : '';
    const [rows] = await pool.query(`SELECT *, CASE WHEN quantity <= 0 THEN 'Out' WHEN quantity <= reorder_level THEN 'Low' ELSE 'In Stock' END AS status FROM stock ${where} ORDER BY updated_at DESC`, scope.params);
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
    const { businessId } = getContext(req);
    const tenantId = businessId || DEFAULT_BUSINESS_ID;
    await pool.query('UPDATE stock SET quantity = GREATEST(quantity + ?, 0) WHERE product_id = ? AND business_id = ?', [change, product_id, tenantId]);
    await pool.query(
      'INSERT INTO stock_history (business_id, product_id, change_qty, reason, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [tenantId, product_id, change, reason, notes || null, created_by || 'Admin']
    );
    await syncLowStockAlerts(tenantId);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/stock/history/:productId', async (req, res) => {
  try {
    const scope = businessScope('stock_history', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    const [rows] = await pool.query(`SELECT * FROM stock_history WHERE product_id = ? ${where} ORDER BY created_at DESC`, [req.params.productId, ...scope.params]);
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
    const scope = businessScope('orders', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    const [[order]] = await pool.query(`SELECT * FROM orders WHERE id = ? ${where}`, [req.params.id, ...scope.params]);
    const itemScope = businessScope('order_items', req);
    const itemWhere = itemScope.clause ? `AND ${itemScope.clause}` : '';
    const [items] = await pool.query(`SELECT * FROM order_items WHERE order_id = ? ${itemWhere}`, [req.params.id, ...itemScope.params]);
    res.json({ ...order, items });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const scope = businessScope('orders', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    await pool.query(`UPDATE orders SET order_status = ? WHERE id = ? ${where}`, [req.body.order_status, req.params.id, ...scope.params]);
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
    const scope = businessScope('returns', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    await pool.query(`UPDATE returns SET status = ?, refund_method = ? WHERE id = ? ${where}`, [req.body.status, req.body.refund_method || null, req.params.id, ...scope.params]);
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
    const customerScope = businessScope('customers', req);
    const customerWhere = customerScope.clause ? `AND ${customerScope.clause}` : '';
    const [[customer]] = await pool.query(`SELECT * FROM customers WHERE id = ? ${customerWhere}`, [req.params.id, ...customerScope.params]);
    const orderScope = businessScope('orders', req);
    const orderWhere = orderScope.clause ? `AND ${orderScope.clause}` : '';
    const [orders] = await pool.query(`SELECT * FROM orders WHERE customer_id = ? ${orderWhere} ORDER BY created_at DESC`, [req.params.id, ...orderScope.params]);
    res.json({ ...customer, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/customers/:id/status', async (req, res) => {
  try {
    const scope = businessScope('customers', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    await pool.query(`UPDATE customers SET status = ? WHERE id = ? ${where}`, [req.body.status, req.params.id, ...scope.params]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/revenue/summary', async (req, res) => {
  try {
    const orderScope = businessScope('orders', req);
    const expenseScope = businessScope('expenses', req);
    const orderWhere = orderScope.clause ? `WHERE ${orderScope.clause} AND order_status != 'Cancelled'` : "WHERE order_status != 'Cancelled'";
    const expenseWhere = expenseScope.clause ? `WHERE ${expenseScope.clause}` : '';
    const [ordersSummaryRows] = await pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS total_revenue, COALESCE(AVG(total_amount), 0) AS avg_order_value FROM orders ${orderWhere}`, orderScope.params);
    const [expenseSummaryRows] = await pool.query(`SELECT COALESCE(SUM(amount), 0) AS total_expense FROM expenses ${expenseWhere}`, expenseScope.params);
    const [payments] = await pool.query(`SELECT payment_method, SUM(total_amount) AS amount FROM orders ${orderWhere} GROUP BY payment_method`, orderScope.params);
    res.json({
      totalRevenue: Number(ordersSummaryRows[0].total_revenue),
      netProfit: Number(ordersSummaryRows[0].total_revenue) - Number(expenseSummaryRows[0].total_expense),
      avgOrderValue: Number(ordersSummaryRows[0].avg_order_value),
      growth: 12,
      payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/revenue/chart', async (req, res) => {
  try {
    const orderScope = businessScope('orders', req);
    const where = orderScope.clause ? `WHERE ${orderScope.clause} AND order_status != 'Cancelled'` : "WHERE order_status != 'Cancelled'";
    const [rows] = await pool.query(`SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue FROM orders ${where} GROUP BY DATE(created_at) ORDER BY date ASC LIMIT 30`, orderScope.params);
    res.json({ rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    await syncLowStockAlerts(getContext(req).businessId);
    await listRows('notifications', { ...req, query: { ...req.query, sort: req.query.sort || 'created_at' } }, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const scope = businessScope('notifications', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    await pool.query(`UPDATE notifications SET is_read = ? WHERE id = ? ${where}`, [Boolean(req.body.is_read), req.params.id, ...scope.params]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const scope = businessScope('notifications', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    await pool.query(`DELETE FROM notifications WHERE id = ? ${where}`, [req.params.id, ...scope.params]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/mark-all-read', async (req, res) => {
  try {
    const scope = businessScope('notifications', req);
    const where = scope.clause ? `WHERE ${scope.clause}` : '';
    await pool.query(`UPDATE notifications SET is_read = 1 ${where}`, scope.params);
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
