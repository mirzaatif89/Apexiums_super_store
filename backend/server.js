import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import crypto from 'crypto';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({ quiet: true });

const app = express();
const port = process.env.PORT || 5000;
const host = process.env.HOST || '0.0.0.0';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '../frontend');
const distPath = path.join(frontendPath, 'dist');
const uploadsPath = path.join(__dirname, 'uploads');
mkdirSync(path.join(uploadsPath, 'categories'), { recursive: true });

const dbName = process.env.DB_NAME || 'apexiums-ecommerce';
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 10000)
};

let pool;
const DEFAULT_BUSINESS_ID = 1;
const businessScopedTables = new Set([
  'banners',
  'categories',
  'coupons',
  'expenses',
  'investors',
  'permissions',
  'software_fees',
  'staff_salaries',
  'delivery_expenses',
  'chats',
  'seller_applications',
  'investor_applications',
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
app.use('/uploads', express.static(uploadsPath));

class MockPool {
  constructor() {
    this.tables = new Map();
    this.autoIncrement = new Map();
  }

  getTable(name) {
    if (!this.tables.has(name)) {
      this.tables.set(name, []);
      this.autoIncrement.set(name, 1);
    }
    return this.tables.get(name);
  }

  async end() {
    return undefined;
  }

  async query(sql, params = []) {
    const queryStr = String(sql || '').trim();
    const upper = queryStr.toUpperCase();

    if (upper.startsWith('SHOW COLUMNS FROM')) {
      return [[]];
    }

    if (upper.startsWith('ALTER TABLE')) {
      return [{ affectedRows: 0 }];
    }

    if (upper.startsWith('CREATE DATABASE') || upper.startsWith('CREATE TABLE')) {
      const match = queryStr.match(/CREATE TABLE (?:IF NOT EXISTS )?`?([a-zA-Z0-9_]+)`?/i);
      if (match && match[1]) {
        this.getTable(match[1]);
      }
      return [{ affectedRows: 0 }];
    }

    if (upper.includes('SELECT DATABASE()')) {
      return [[{ database_name: dbName, server_time: new Date().toISOString() }]];
    }

    if (upper.startsWith('INSERT INTO')) {
      const match = queryStr.match(/INSERT INTO `?([a-zA-Z0-9_]+)`?\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
      if (match) {
        const tableName = match[1];
        const cols = match[2].split(',').map(c => c.trim().replace(/`/g, ''));
        const rows = this.getTable(tableName);
        const nextId = this.autoIncrement.get(tableName) || 1;

        const newRow = { id: nextId, created_at: new Date().toISOString() };
        cols.forEach((col, idx) => {
          newRow[col] = params[idx] !== undefined ? params[idx] : null;
        });

        if (newRow.id && typeof newRow.id === 'number' && newRow.id >= nextId) {
          this.autoIncrement.set(tableName, newRow.id + 1);
        } else {
          newRow.id = nextId;
          this.autoIncrement.set(tableName, nextId + 1);
        }

        rows.push(newRow);
        return [{ insertId: newRow.id, affectedRows: 1 }];
      }
    }

    if (upper.startsWith('UPDATE')) {
      const match = queryStr.match(/UPDATE `?([a-zA-Z0-9_]+)`?\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      if (match) {
        const tableName = match[1];
        const setClause = match[2];
        const whereClause = match[3] || '';
        const rows = this.getTable(tableName);

        const setAssignments = setClause.split(',').map(s => {
          const parts = s.split('=');
          return parts[0].trim().replace(/`/g, '');
        });

        const setParamCount = setAssignments.length;
        const setParams = params.slice(0, setParamCount);
        const whereParams = params.slice(setParamCount);

        let updatedCount = 0;
        rows.forEach(row => {
          let matches = true;
          if (whereClause) {
            if (whereClause.includes('id = ?')) {
              matches = matches && row.id == whereParams[0];
            }
            if (whereClause.includes('alert_key = ?')) {
              matches = matches && row.alert_key == whereParams[whereParams.length - 1];
            }
          }
          if (matches) {
            setAssignments.forEach((col, idx) => {
              if (col !== 'id') {
                row[col] = setParams[idx];
              }
            });
            updatedCount++;
          }
        });
        return [{ affectedRows: updatedCount }];
      }
    }

    if (upper.startsWith('DELETE FROM')) {
      const match = queryStr.match(/DELETE FROM `?([a-zA-Z0-9_]+)`?(?:\s+WHERE\s+(.+))?$/i);
      if (match) {
        const tableName = match[1];
        let rows = this.getTable(tableName);
        const initialLength = rows.length;

        if (params.length > 0) {
          const targetId = params[0];
          rows = rows.filter(r => r.id != targetId);
          this.tables.set(tableName, rows);
        } else {
          this.tables.set(tableName, []);
        }
        return [{ affectedRows: initialLength - rows.length }];
      }
    }

    if (upper.startsWith('SELECT')) {
      const fromMatch = queryStr.match(/FROM `?([a-zA-Z0-9_]+)`?/i);
      if (fromMatch) {
        const tableName = fromMatch[1];
        let rows = [...this.getTable(tableName)];

        if (upper.includes('WHERE')) {
          let paramIdx = 0;
          if (queryStr.includes('id = ?')) {
            const targetId = params[paramIdx++];
            rows = rows.filter(r => r.id == targetId);
          }
          if (queryStr.includes('username = ?')) {
            const targetUsername = params[paramIdx++];
            rows = rows.filter(r => r.username === targetUsername);
          }
          if (queryStr.includes('alert_key = ?')) {
            const targetAlertKey = params[paramIdx++];
            rows = rows.filter(r => r.alert_key === targetAlertKey);
          }
          if (queryStr.includes('product_id = ?')) {
            const targetProdId = params[paramIdx++];
            rows = rows.filter(r => r.product_id == targetProdId);
          }
          if (queryStr.includes('customer_id = ?')) {
            const targetCustId = params[paramIdx++];
            rows = rows.filter(r => r.customer_id == targetCustId);
          }
          if (queryStr.includes('business_id = ?')) {
            const targetBusId = params[paramIdx++];
            rows = rows.filter(r => r.business_id == targetBusId || !r.business_id);
          }
        }

        if (upper.includes('COUNT(') || upper.includes('SUM(') || upper.includes('AVG(')) {
          const total = rows.length;
          const revenue = rows.reduce((acc, r) => acc + Number(r.total_amount || 0), 0);
          const active = rows.filter(r => r.status === 'Live' || r.status === 'Active').length;
          const pending = rows.filter(r => r.order_status === 'Pending').length;
          const low = rows.filter(r => Number(r.quantity) <= Number(r.reorder_level) && Number(r.quantity) > 0).length;
          const out_of_stock = rows.filter(r => Number(r.quantity) <= 0).length;
          const unread = rows.filter(r => !r.is_read).length;

          return [[{
            total,
            count: total,
            revenue,
            active,
            pending,
            low,
            out_of_stock,
            unread,
            total_revenue: revenue,
            total_expense: rows.reduce((acc, r) => acc + Number(r.amount || 0), 0),
            avg_order_value: total ? revenue / total : 0
          }]];
        }

        rows = rows.map(r => ({
          ...r,
          status: r.status || (r.quantity !== undefined
            ? (r.quantity <= 0 ? 'Out' : r.quantity <= (r.reorder_level || 10) ? 'Low' : 'In Stock')
            : 'Active')
        }));

        if (upper.includes('ORDER BY')) {
          if (upper.includes('CREATED_AT DESC') || upper.includes('ID DESC') || upper.includes('UPDATED_AT DESC')) {
            rows.sort((a, b) => (b.id || 0) - (a.id || 0));
          } else if (upper.includes('CREATED_AT ASC') || upper.includes('ID ASC')) {
            rows.sort((a, b) => (a.id || 0) - (b.id || 0));
          }
        }

        if (upper.includes('LIMIT')) {
          const limit = params[params.length - 2] || params[params.length - 1] || 50;
          const offset = upper.includes('OFFSET') ? params[params.length - 1] : 0;
          if (typeof limit === 'number') {
            rows = rows.slice(offset, offset + limit);
          }
        }

        return [rows];
      }
    }

    return [[]];
  }
}

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
    subcategories LONGTEXT,
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
    subcategory VARCHAR(160),
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
    total_items INT DEFAULT 0,
    stock_belong_to VARCHAR(180),
    sku VARCHAR(80),
    category VARCHAR(120),
    quantity INT DEFAULT 0,
    reorder_level INT DEFAULT 10,
    description TEXT,
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
    name VARCHAR(180),
    business_name VARCHAR(180) NOT NULL,
    contact_person VARCHAR(160),
    phone VARCHAR(60),
    email VARCHAR(180),
    address TEXT,
    description TEXT,
    seller_image VARCHAR(500),
    stock_seller_sell VARCHAR(180),
    username VARCHAR(120),
    password VARCHAR(255),
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
  `CREATE TABLE IF NOT EXISTS investors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    name VARCHAR(160) NOT NULL,
    email VARCHAR(180),
    phone VARCHAR(60),
    address TEXT,
    username VARCHAR(120),
    password VARCHAR(255),
    investment_amount DECIMAL(12,2) DEFAULT 0,
    investment_date DATE,
    agreement_url VARCHAR(500),
    status VARCHAR(40) DEFAULT 'Active',
    description TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    role VARCHAR(40) DEFAULT 'Staff',
    staff_id INT NOT NULL,
    module VARCHAR(80) NOT NULL,
    can_view VARCHAR(10) DEFAULT 'Yes',
    can_create VARCHAR(10) DEFAULT 'No',
    can_edit VARCHAR(10) DEFAULT 'No',
    can_delete VARCHAR(10) DEFAULT 'No',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS software_fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    service_name VARCHAR(180) NOT NULL,
    provider VARCHAR(160),
    amount DECIMAL(12,2) DEFAULT 0,
    billing_cycle VARCHAR(40) DEFAULT 'Monthly',
    due_date DATE,
    payment_status VARCHAR(40) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS staff_salaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    staff_id INT,
    staff_name VARCHAR(160) NOT NULL,
    salary_month VARCHAR(20),
    base_salary DECIMAL(12,2) DEFAULT 0,
    bonus DECIMAL(12,2) DEFAULT 0,
    deductions DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(40) DEFAULT 'Pending',
    paid_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS delivery_expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    order_id INT,
    courier VARCHAR(160) NOT NULL,
    tracking_number VARCHAR(120),
    amount DECIMAL(12,2) DEFAULT 0,
    expense_date DATE,
    payment_status VARCHAR(40) DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS chats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    sender_name VARCHAR(160) NOT NULL,
    sender_type VARCHAR(60) DEFAULT 'Customer',
    subject VARCHAR(180),
    message TEXT NOT NULL,
    reply_message TEXT,
    status VARCHAR(40) DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS seller_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    applicant_name VARCHAR(160) NOT NULL,
    business_name VARCHAR(180),
    email VARCHAR(180),
    phone VARCHAR(60),
    category VARCHAR(120),
    message TEXT,
    status VARCHAR(40) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS investor_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    applicant_name VARCHAR(160) NOT NULL,
    email VARCHAR(180),
    phone VARCHAR(60),
    proposed_amount DECIMAL(12,2) DEFAULT 0,
    message TEXT,
    status VARCHAR(40) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS business_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_name VARCHAR(180) NOT NULL,
    username VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    plain_password VARCHAR(255),
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
const resources = {
  banners: ['image_url', 'title', 'link', 'position', 'status', 'start_date', 'end_date', 'click_count'],
  promotions: ['name', 'image_url', 'valid_from', 'valid_till', 'show_on_website', 'status', 'created_at'],
  categories: ['name', 'parent_id', 'image_url', 'description', 'subcategories', 'status'],
  products: ['image_url', 'product_images', 'name', 'description', 'product_detail', 'category', 'subcategory', 'actual_price', 'base_price', 'discounted_price', 'sku', 'stock_qty', 'slug', 'meta_title', 'meta_desc', 'status'],
  stock: ['product_id', 'product_name', 'total_items', 'stock_belong_to', 'sku', 'category', 'quantity', 'reorder_level', 'description', 'warehouse'],
  orders: ['customer_id', 'customer_name', 'customer_email', 'customer_phone', 'items_count', 'total_amount', 'payment_method', 'payment_status', 'order_status', 'shipping_address', 'created_at'],
  returns: ['order_id', 'product_id', 'customer_id', 'customer', 'product', 'reason', 'status', 'refund_amount', 'refund_method', 'created_at'],
  expenses: ['title', 'category', 'amount', 'payment_method', 'date', 'receipt_url', 'added_by', 'notes'],
  wholesellers: ['name', 'business_name', 'contact_person', 'phone', 'email', 'address', 'description', 'seller_image', 'stock_seller_sell', 'username', 'password', 'products_supplied', 'total_purchases', 'payment_due', 'status'],
  staff: ['photo_url', 'name', 'email', 'phone', 'role', 'password_hash', 'status', 'last_login'],
  customers: ['avatar_url', 'name', 'username', 'password_hash', 'plain_password', 'email', 'phone', 'total_orders', 'total_spent', 'status', 'created_at'],
  notifications: ['type', 'title', 'message', 'is_read', 'created_at'],
  coupons: ['code', 'title', 'description', 'discount_type', 'discount_value', 'min_order_amount', 'use_for', 'usage_limit', 'used_count', 'valid_from', 'valid_till', 'status'],
  investors: ['name', 'email', 'phone', 'address', 'username', 'password', 'investment_amount', 'investment_date', 'agreement_url', 'status', 'description', 'notes', 'created_at'],
  permissions: ['role', 'staff_id', 'module', 'can_view', 'can_create', 'can_edit', 'can_delete', 'created_at'],
  software_fees: ['service_name', 'provider', 'amount', 'billing_cycle', 'due_date', 'payment_status', 'notes', 'created_at'],
  staff_salaries: ['staff_id', 'staff_name', 'salary_month', 'base_salary', 'bonus', 'deductions', 'payment_status', 'paid_date', 'notes', 'created_at'],
  delivery_expenses: ['order_id', 'courier', 'tracking_number', 'amount', 'expense_date', 'payment_status', 'notes', 'created_at'],
  chats: ['sender_name', 'sender_type', 'subject', 'message', 'reply_message', 'status', 'created_at'],
  seller_applications: ['applicant_name', 'business_name', 'email', 'phone', 'category', 'message', 'status', 'created_at'],
  investor_applications: ['applicant_name', 'email', 'phone', 'proposed_amount', 'message', 'status', 'created_at']
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
  const rawRole = String(req.headers['x-user-role'] || '').trim();
  const normalizedRole = rawRole.replace(/[\s_-]+/g, '').toLowerCase();
  const role = normalizedRole === 'superadmin'
    ? 'SuperAdmin'
    : normalizedRole === 'businessadmin'
      ? 'BusinessAdmin'
      : rawRole;
  const businessId = Number(req.headers['x-business-id'] || 0) || null;
  return { role, businessId };
}

function persistImageDataUrl(dataUrl, folder = 'categories') {
  if (!String(dataUrl || '').startsWith('data:image/')) return dataUrl || null;
  const match = String(dataUrl).match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,(.+)$/);
  if (!match) return null;
  const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
  const filename = `${folder}-${Date.now()}-${crypto.randomBytes(5).toString('hex')}.${extension}`;
  const folderPath = path.join(uploadsPath, folder);
  mkdirSync(folderPath, { recursive: true });
  writeFileSync(path.join(folderPath, filename), Buffer.from(match[2], 'base64'));
  return `/uploads/${folder}/${filename}`;
}

function businessScope(table, req, alias = '') {
  const { businessId, role } = getContext(req);
  const investorId = Number(req.headers['x-investor-id'] || 0) || null;
  if (String(role || '').replace(/[\s_-]+/g, '').toLowerCase() === 'investor' && investorId && ['stock', 'orders'].includes(table)) {
    const column = `${alias ? `${alias}.` : ''}investor_id`;
    return { clause: `${column} = ?`, params: [investorId] };
  }
  if (!businessScopedTables.has(table) || !businessId) {
    return { clause: '', params: [] };
  }
  const column = `${alias ? `${alias}.` : ''}business_id`;
  return { clause: `${column} = ?`, params: [businessId] };
}

async function ensureColumn(table, columnName, columnDefinition, afterInsertUpdate = null) {
  const [rows] = await pool.query(`SHOW COLUMNS FROM ${backtick(table)} LIKE ?`, [columnName]);
  if (rows && rows.length) return;
  await pool.query(`ALTER TABLE ${backtick(table)} ADD COLUMN ${backtick(columnName)} ${columnDefinition}`);
  if (afterInsertUpdate) await pool.query(afterInsertUpdate);
}

async function ensureAdminAccount() {
  const adminUsername = String(process.env.ADMIN_USERNAME || 'superadmin').trim() || 'superadmin';
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');
  if (!adminPassword) throw new Error('ADMIN_PASSWORD must be configured in .env');
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

  for (const row of rows || []) {
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
  try {
    if (!process.env.DB_HOST) {
      throw new Error('No DB_HOST configured');
    }
    const server = await mysql.createConnection({ ...dbConfig, connectTimeout: 1000 });
    await server.query(`CREATE DATABASE IF NOT EXISTS ${backtick(dbName)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await server.end();

    pool = mysql.createPool({ ...dbConfig, database: dbName, waitForConnections: true, connectionLimit: 10 });
    for (const schema of schemas) await pool.query(schema);
    console.log('[AI Studio] Connected to MySQL database successfully.');
  } catch (err) {
    console.log('[AI Studio] Using in-memory database pool.');
    pool = new MockPool();
    for (const schema of schemas) await pool.query(schema);
  }

  const businessTables = ['banners', 'promotions', 'coupons', 'categories', 'products', 'product_variants', 'stock', 'stock_history', 'orders', 'order_items', 'returns', 'staff', 'customers', 'expenses', 'wholesellers', 'notifications', 'investors', 'permissions', 'software_fees', 'staff_salaries', 'delivery_expenses', 'chats', 'seller_applications', 'investor_applications'];
  for (const table of businessTables) {
    await ensureColumn(table, 'business_id', 'INT DEFAULT 1');
    await pool.query(`UPDATE ${backtick(table)} SET business_id = ${DEFAULT_BUSINESS_ID} WHERE business_id IS NULL`);
  }
  await ensureColumn('banners', 'title', "VARCHAR(180) DEFAULT 'Banner'");
  await ensureColumn('promotions', 'image_url', 'VARCHAR(500)');
  await ensureColumn('promotions', 'show_on_website', "VARCHAR(30) DEFAULT 'Yes'");
  await ensureColumn('promotions', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  await ensureColumn('categories', 'subcategories', 'LONGTEXT');
  await ensureColumn('coupons', 'description', 'TEXT');
  await ensureColumn('coupons', 'use_for', "VARCHAR(80) DEFAULT 'Product discount'");
  await ensureColumn('products', 'product_images', 'LONGTEXT');
  // Product uploads can be data URLs or long persisted paths. Keep this column
  // large enough for either format, including records created before this migration.
  await pool.query(`ALTER TABLE ${backtick('products')} MODIFY COLUMN ${backtick('image_url')} LONGTEXT`);
  await ensureColumn('products', 'product_detail', 'TEXT');
  await ensureColumn('products', 'actual_price', 'DECIMAL(12,2) DEFAULT 0');
  await ensureColumn('products', 'subcategory', 'VARCHAR(160)');
  await ensureColumn('orders', 'customer_email', 'VARCHAR(180)');
  await ensureColumn('orders', 'customer_phone', 'VARCHAR(60)');
  await ensureColumn('customers', 'username', 'VARCHAR(120)');
  await ensureColumn('customers', 'password_hash', 'VARCHAR(255)');
  await ensureColumn('customers', 'plain_password', 'VARCHAR(255)');
  await ensureColumn('stock', 'total_items', 'INT DEFAULT 0');
  await ensureColumn('stock', 'stock_belong_to', 'VARCHAR(180)');
  await ensureColumn('stock', 'description', 'TEXT');
  await ensureColumn('wholesellers', 'name', 'VARCHAR(180)');
  await ensureColumn('wholesellers', 'description', 'TEXT');
  await ensureColumn('wholesellers', 'seller_image', 'VARCHAR(500)');
  await ensureColumn('wholesellers', 'stock_seller_sell', 'VARCHAR(180)');
  await ensureColumn('wholesellers', 'username', 'VARCHAR(120)');
  await ensureColumn('wholesellers', 'password', 'VARCHAR(255)');
  await ensureColumn('investors', 'address', 'TEXT');
  await ensureColumn('investors', 'username', 'VARCHAR(120)');
  await ensureColumn('investors', 'password', 'VARCHAR(255)');
  await ensureColumn('investors', 'password_hash', 'VARCHAR(255)');
  await ensureColumn('investors', 'return_rate', 'DECIMAL(8,2) DEFAULT 0');
  await ensureColumn('investors', 'equity_share', 'VARCHAR(40)');
  await ensureColumn('stock', 'investor_id', 'INT NULL');
  await ensureColumn('orders', 'investor_id', 'INT NULL');
  await ensureColumn('investors', 'description', 'TEXT');
  await ensureColumn('permissions', 'role', "VARCHAR(40) DEFAULT 'Staff'");
  await ensureColumn('permissions', 'can_create', "VARCHAR(10) DEFAULT 'No'");
  await ensureColumn('permissions', 'can_delete', "VARCHAR(10) DEFAULT 'No'");
  await ensureColumn('chats', 'reply_message', 'TEXT');
  await ensureColumn('business_accounts', 'cnic', 'VARCHAR(60)');
  await ensureColumn('business_accounts', 'address', 'TEXT');
  await ensureColumn('business_accounts', 'agreement_image', 'VARCHAR(500)');
  await ensureColumn('business_accounts', 'plain_password', 'VARCHAR(255)');
  await ensureColumn('notifications', 'entity_type', 'VARCHAR(80) NULL');
  await ensureColumn('notifications', 'entity_id', 'INT NULL');
  await ensureColumn('notifications', 'alert_key', 'VARCHAR(180) NULL');
  await ensureColumn('notifications', 'severity', "VARCHAR(30) DEFAULT 'Info'");

  await ensureAdminAccount();
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

async function listRows(table, req, res, queryOverride = null) {
  const query = queryOverride || req.query;
  const search = String(query.search || '').trim();
  const sort = resources[table]?.includes(query.sort) ? query.sort : 'id';
  const order = String(query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const offset = (page - 1) * limit;
  const searchable = (resources[table] || []).filter((field) => !field.includes('date') && !field.includes('count') && !field.includes('amount') && !field.includes('value') && !field.includes('limit'));
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
  if (table === 'staff') rows.forEach((row) => delete row.password_hash);
  if (table === 'customers') rows.forEach((row) => delete row.password_hash);
  if (table === 'categories') rows.forEach((row) => {
    try { row.subcategories = row.subcategories ? JSON.parse(row.subcategories) : []; } catch { row.subcategories = []; }
  });
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
      if (resource === 'categories' && Object.prototype.hasOwnProperty.call(data, 'subcategories')) {
        data.subcategories = JSON.stringify(Array.isArray(req.body.subcategories) ? req.body.subcategories : (() => { try { return JSON.parse(req.body.subcategories || '[]'); } catch { return []; } })());
      }
      if ((resource === 'categories' || resource === 'products') && data.image_url) data.image_url = persistImageDataUrl(data.image_url, resource === 'products' ? 'products' : 'categories');
      if (resource === 'staff' && data.password_hash) data.password_hash = hashPassword(data.password_hash);
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
      if (resource === 'products') {
        await pool.query(
          'INSERT INTO stock (business_id, product_id, product_name, sku, category, quantity, reorder_level, warehouse) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [data.business_id || DEFAULT_BUSINESS_ID, result.insertId, data.name, data.sku || null, data.category || null, Number(data.stock_qty || 0), 10, 'Main Warehouse']
        );
      }
      if (resource === 'orders') {
        const items = Array.isArray(req.body.items) ? req.body.items : [];
        for (const item of items) {
          await pool.query(
            'INSERT INTO order_items (business_id, order_id, product_id, product_name, image_url, qty, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [data.business_id || DEFAULT_BUSINESS_ID, result.insertId, item.id || null, item.title || item.name || 'Product', item.image || null, Number(item.qty || 1), Number(item.price || 0)]
          );
        }
        if (data.customer_email || data.customer_phone) {
          await pool.query(
            'UPDATE customers SET total_orders = total_orders + 1, total_spent = total_spent + ? WHERE business_id = ? AND (email = ? OR phone = ?)',
            [Number(data.total_amount || 0), data.business_id || DEFAULT_BUSINESS_ID, data.customer_email || '', data.customer_phone || '']
          );
        }
        await pool.query(
          'INSERT INTO notifications (business_id, type, title, message, entity_type, entity_id, severity, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
          [
            data.business_id || DEFAULT_BUSINESS_ID,
            'Order',
            `New order #ORD-${result.insertId}`,
            `${data.customer_name || 'Customer'} placed an order worth Rs ${Number(data.total_amount || 0).toLocaleString('en-PK')}.`,
            'order',
            result.insertId,
            'Info'
          ]
        );
      }
      if (resource === 'returns') {
        await pool.query(
          'INSERT INTO notifications (business_id, type, title, message, entity_type, entity_id, severity, is_read) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
          [
            data.business_id || DEFAULT_BUSINESS_ID,
            'Return',
            `Return requested #RET-${result.insertId}`,
            `${data.customer || 'Customer'} submitted a return request for ${data.product || 'an item'}.`,
            'return',
            result.insertId,
            'Warning'
          ]
        );
      }
      const responseData = { id: result.insertId, ...data };
      if (resource === 'orders') responseData.order = { id: result.insertId, ...data };
      if (resource === 'staff') delete responseData.password_hash;
      res.status(201).json(responseData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put(`/api/${resource}/:id`, async (req, res) => {
    try {
      const data = cleanPayload(req.body, fields);
      if (resource === 'categories' && Object.prototype.hasOwnProperty.call(data, 'subcategories')) {
        data.subcategories = JSON.stringify(Array.isArray(req.body.subcategories) ? req.body.subcategories : (() => { try { return JSON.parse(req.body.subcategories || '[]'); } catch { return []; } })());
      }
      if ((resource === 'categories' || resource === 'products') && data.image_url) data.image_url = persistImageDataUrl(data.image_url, resource === 'products' ? 'products' : 'categories');
      if (resource === 'staff' && data.password_hash) data.password_hash = hashPassword(data.password_hash);
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
      if (resource === 'products') {
        await pool.query(
          'UPDATE stock SET product_name = COALESCE(?, product_name), sku = COALESCE(?, sku), category = COALESCE(?, category) WHERE product_id = ? AND business_id = ?',
          [data.name || null, data.sku || null, data.category || null, req.params.id, data.business_id || DEFAULT_BUSINESS_ID]
        );
      }
      const responseData = { id: Number(req.params.id), ...data };
      if (resource === 'staff') delete responseData.password_hash;
      res.json(responseData);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete(`/api/${resource}/:id`, async (req, res) => {
    try {
      const scope = businessScope(resource, req);
      const where = scope.clause ? `AND ${scope.clause}` : '';
      await pool.query(`DELETE FROM ${backtick(resource)} WHERE id = ? ${where}`, [req.params.id, ...scope.params]);
      if (resource === 'products') {
        const { businessId } = getContext(req);
        await pool.query('DELETE FROM stock WHERE product_id = ? AND business_id = ?', [req.params.id, businessId || DEFAULT_BUSINESS_ID]);
      }
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
  const { password_hash, plain_password, ...safe } = account;
  return safe;
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    const [[account]] = await pool.query('SELECT * FROM business_accounts WHERE username = ? LIMIT 1', [username]);
    if (!account) {
      const [[investor]] = await pool.query('SELECT * FROM investors WHERE username = ? LIMIT 1', [username]);
      if (!investor || investor.status === 'Inactive' || investor.status === 'Pending Approval') return res.status(401).json({ message: 'Invalid credentials or account is awaiting approval' });
      const validInvestorPassword = investor.password_hash
        ? verifyPassword(password, investor.password_hash)
        : String(investor.password || '') === password;
      if (!validInvestorPassword) return res.status(401).json({ message: 'Invalid credentials' });
      const { password: _password, password_hash: _hash, ...safeInvestor } = investor;
      return res.json({ user: { ...safeInvestor, role: 'Investor', name: investor.name, businessId: investor.business_id }, businessId: investor.business_id || DEFAULT_BUSINESS_ID, role: 'Investor', token: `investor-${investor.id}` });
    }
    if (account.status === 'Inactive') return res.status(401).json({ message: 'Invalid credentials' });
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
    const columns = 'id, business_name, username, plain_password, owner_name, cnic, address, email, phone, agreement_image, role, status, created_at, last_login';
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
      'INSERT INTO business_accounts (business_name, username, password_hash, plain_password, owner_name, cnic, address, email, phone, agreement_image, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        req.body.business_name,
        username,
        passwordHash,
        req.body.password || null,
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
    if (req.body.password) {
      data.password_hash = hashPassword(req.body.password);
      data.plain_password = req.body.password;
    }
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
      products: products[0] || {},
      orders: orders[0] || {},
      stock: stock[0] || {},
      coupons: coupons[0] || {},
      notifications: notifications[0] || {},
      businesses: businessAccounts[0] || {},
      lowStockItems: lowStockItems || []
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
  stock: ['product_id', 'stock_belong_to', 'quantity'],
  orders: ['customer_name', 'total_amount'],
  returns: ['order_id', 'customer', 'product'],
  expenses: ['title'],
  wholesellers: ['business_name'],
  staff: ['name'],
  coupons: ['code'],
  investors: ['name'],
  permissions: ['staff_id', 'module'],
  software_fees: ['service_name'],
  staff_salaries: ['staff_name', 'salary_month'],
  delivery_expenses: ['courier'],
  chats: ['sender_name', 'message'],
  seller_applications: ['applicant_name'],
  investor_applications: ['applicant_name']
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
    await listRows('orders', req, res, { ...req.query, sort: req.query.sort || 'created_at' });
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
    await listRows('returns', req, res, { ...req.query, sort: req.query.sort || 'created_at' });
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
    await listRows('customers', req, res, { ...req.query, sort: req.query.sort || 'created_at' });
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
    const scopeClause = orderScope.clause ? `${orderScope.clause} AND ` : '';
    const [monthlyRows] = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN created_at >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN total_amount ELSE 0 END), 0) AS current_month,
        COALESCE(SUM(CASE WHEN created_at >= DATE_FORMAT(CURRENT_DATE - INTERVAL 1 MONTH, '%Y-%m-01') AND created_at < DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') THEN total_amount ELSE 0 END), 0) AS previous_month
       FROM orders WHERE ${scopeClause}order_status != 'Cancelled'`,
      orderScope.params
    );
    const currentMonth = Number(monthlyRows[0].current_month);
    const previousMonth = Number(monthlyRows[0].previous_month);
    const growth = previousMonth ? ((currentMonth - previousMonth) / previousMonth) * 100 : (currentMonth ? 100 : 0);
    res.json({
      totalRevenue: Number(ordersSummaryRows[0].total_revenue),
      netProfit: Number(ordersSummaryRows[0].total_revenue) - Number(expenseSummaryRows[0].total_expense),
      avgOrderValue: Number(ordersSummaryRows[0].avg_order_value),
      growth: Number(growth.toFixed(1)),
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
    res.json({ rows: rows || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    await syncLowStockAlerts(getContext(req).businessId);
    await listRows('notifications', req, res, { ...req.query, sort: req.query.sort || 'created_at' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const scope = businessScope('notifications', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    const isRead = req.body.is_read === true || req.body.is_read === 1 || String(req.body.is_read).toLowerCase() === 'yes';
    await pool.query(`UPDATE notifications SET is_read = ? WHERE id = ? ${where}`, [isRead, req.params.id, ...scope.params]);
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

let httpServer;

async function startServer() {
  // Vite dev middleware or static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      root: frontendPath,
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else if (existsSync(path.join(distPath, 'index.html'))) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
      return res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // A missing build should produce a useful deployment error instead of a
    // misleading browser-level "Not Found" response.
    app.get('/', (_req, res) => {
      res.status(503).send('Frontend build is missing. Run npm run build before starting the production app.');
    });
  }

  httpServer = app.listen(port, host, () => {
    console.log(`API server running on http://${host}:${port}`);
  });

  // Start accepting requests immediately. A database outage must not make
  // Passenger consider the whole Node application dead or hang health checks.
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Database initialization failed:', error.message);
  }
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

app.post('/api/customers/register', async (req, res) => {
  try {
    const required = requireFields(req.body, ['name', 'username', 'password']);
    if (required) return res.status(400).json({ message: required });
    const username = String(req.body.username).trim();
    const [existing] = await pool.query('SELECT id FROM customers WHERE username = ? OR email = ? LIMIT 1', [username, req.body.email || username]);
    if (existing.length) return res.status(409).json({ message: 'Customer account already exists' });
    const [result] = await pool.query(
      'INSERT INTO customers (business_id, name, username, password_hash, plain_password, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [DEFAULT_BUSINESS_ID, req.body.name, username, hashPassword(req.body.password), req.body.password, req.body.email || null, req.body.phone || null, 'Active']
    );
    res.status(201).json({ id: result.insertId, name: req.body.name, username, email: req.body.email || null, phone: req.body.phone || null, status: 'Active' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down gracefully.`);
  if (!httpServer) return process.exit(0);
  httpServer.close(async () => {
    if (pool) await pool.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
