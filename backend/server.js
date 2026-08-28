import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';
import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';
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
const mockDatabasePath = path.join(__dirname, 'data', 'mock-database.json');
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
  'finance_transactions',
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
  'reviews',
  'promotions',
  'product_variants',
  'purchase_orders',
  'staff',
  'customers',
  'returns',
  'stock',
  'stock_history',
  'wholesellers'
]);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use('/uploads', express.static(uploadsPath));

class MockPool {
  constructor() {
    this.tables = new Map();
    this.autoIncrement = new Map();
    try {
      if (existsSync(mockDatabasePath)) {
        const saved = JSON.parse(readFileSync(mockDatabasePath, 'utf8'));
        Object.entries(saved.tables || {}).forEach(([name, rows]) => this.tables.set(name, rows));
        Object.entries(saved.autoIncrement || {}).forEach(([name, value]) => this.autoIncrement.set(name, value));
      }
    } catch (error) {
      console.warn('[AI Studio] Could not read the local fallback database:', error.message);
    }
  }

  persist() {
    mkdirSync(path.dirname(mockDatabasePath), { recursive: true });
    writeFileSync(mockDatabasePath, JSON.stringify({
      tables: Object.fromEntries(this.tables),
      autoIncrement: Object.fromEntries(this.autoIncrement)
    }, null, 2));
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
        this.persist();
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
        if (updatedCount) this.persist();
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
          if (String(match[2] || '').includes('token_hash = ?')) {
            rows = rows.filter(r => r.token_hash !== targetId);
          } else {
            rows = rows.filter(r => r.id != targetId);
          }
          this.tables.set(tableName, rows);
        } else {
          this.tables.set(tableName, []);
        }
        if (initialLength !== rows.length) this.persist();
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
          if (queryStr.includes('email = ?')) {
            const targetEmail = params[paramIdx++];
            rows = rows.filter(r => r.email === targetEmail);
          }
          if (queryStr.includes('token_hash = ?')) {
            const targetTokenHash = params[paramIdx++];
            rows = rows.filter(r => r.token_hash === targetTokenHash);
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
          if (queryStr.includes('investor_id = ?')) {
            const targetInvestorId = params[paramIdx++];
            rows = rows.filter(r => r.investor_id == targetInvestorId);
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
    cost_price DECIMAL(12,2) DEFAULT 0,
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
    department VARCHAR(120),
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
  `CREATE TABLE IF NOT EXISTS customer_email_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(180) NOT NULL UNIQUE,
    name VARCHAR(160) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    attempts INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS customer_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    user_agent VARCHAR(500),
    ip_address VARCHAR(64),
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_sessions_customer (customer_id),
    INDEX idx_customer_sessions_expiry (expires_at)
  )`,
  `CREATE TABLE IF NOT EXISTS customer_login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    email VARCHAR(180),
    user_agent VARCHAR(500),
    ip_address VARCHAR(64),
    logged_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_customer_login_customer (customer_id),
    INDEX idx_customer_login_date (logged_in_at)
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    product_id INT NOT NULL,
    reviewer_name VARCHAR(180) NOT NULL,
    rating DECIMAL(3,1) NOT NULL,
    comment TEXT,
    source VARCHAR(30) DEFAULT 'manual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS finance_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    title VARCHAR(180) NOT NULL,
    type VARCHAR(20) NOT NULL,
    category VARCHAR(100),
    amount DECIMAL(12,2) DEFAULT 0,
    transaction_date DATE,
    status VARCHAR(40) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    contact_date DATE,
    supplier_payment_amount DECIMAL(12,2) DEFAULT 0,
    supplier_payment_date DATE,
    total_purchases DECIMAL(12,2) DEFAULT 0,
    payment_due DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(40) DEFAULT 'Active'
  )`,
  `CREATE TABLE IF NOT EXISTS purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_id INT DEFAULT 1,
    wholeseller_id INT,
    items_json JSON,
    total_amount DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    payment_method VARCHAR(60),
    payment_status VARCHAR(40) DEFAULT 'Pending',
    delivery_status VARCHAR(40) DEFAULT 'Not Delivered',
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
    address TEXT,
    category VARCHAR(120),
    leopard_courier_nearby VARCHAR(10),
    product_image_url VARCHAR(500),
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
    address TEXT,
    proposed_amount DECIMAL(12,2) DEFAULT 0,
    investment_product VARCHAR(180),
    document_url VARCHAR(500),
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
    seller_categories TEXT,
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
  products: ['image_url', 'product_images', 'name', 'description', 'product_detail', 'category', 'subcategory', 'actual_price', 'base_price', 'discounted_price', 'cost_price', 'sku', 'stock_qty', 'slug', 'meta_title', 'meta_desc', 'status', 'investor_id'],
  reviews: ['product_id', 'reviewer_name', 'rating', 'comment', 'source', 'created_at'],
  stock: ['product_id', 'product_name', 'total_items', 'stock_belong_to', 'investor_id', 'sku', 'category', 'quantity', 'reorder_level', 'description', 'warehouse'],
  orders: ['customer_id', 'customer_name', 'customer_email', 'customer_phone', 'items_count', 'total_amount', 'payment_method', 'payment_status', 'order_status', 'shipping_address', 'created_at'],
  returns: ['order_id', 'product_id', 'customer_id', 'customer', 'product', 'reason', 'status', 'refund_amount', 'refund_method', 'created_at'],
  expenses: ['title', 'category', 'amount', 'payment_method', 'date', 'receipt_url', 'added_by', 'notes'],
  finance_transactions: ['title', 'type', 'category', 'amount', 'transaction_date', 'status', 'created_at'],
  wholesellers: ['name', 'business_name', 'contact_person', 'phone', 'email', 'address', 'description', 'contact_date', 'supplier_payment_amount', 'supplier_payment_date', 'seller_image', 'stock_seller_sell', 'username', 'password', 'products_supplied', 'total_purchases', 'payment_due', 'status'],
  purchase_orders: ['wholeseller_id', 'items_json', 'total_amount', 'paid_amount', 'payment_method', 'payment_status', 'delivery_status', 'status', 'date'],
  staff: ['photo_url', 'name', 'email', 'phone', 'role', 'department', 'password_hash', 'status', 'last_login'],
  customers: ['avatar_url', 'name', 'username', 'password_hash', 'plain_password', 'email', 'phone', 'total_orders', 'total_spent', 'status', 'created_at'],
  notifications: ['type', 'title', 'message', 'is_read', 'created_at'],
  coupons: ['code', 'title', 'description', 'discount_type', 'discount_value', 'min_order_amount', 'use_for', 'usage_limit', 'used_count', 'valid_from', 'valid_till', 'status'],
  investors: ['name', 'email', 'phone', 'address', 'username', 'password', 'investment_amount', 'investment_date', 'agreement_url', 'status', 'description', 'notes', 'created_at'],
  permissions: ['role', 'staff_id', 'module', 'can_view', 'can_create', 'can_edit', 'can_delete', 'created_at'],
  software_fees: ['service_name', 'provider', 'amount', 'billing_cycle', 'due_date', 'payment_status', 'notes', 'created_at'],
  staff_salaries: ['staff_id', 'staff_name', 'salary_month', 'base_salary', 'bonus', 'deductions', 'payment_status', 'paid_date', 'notes', 'created_at'],
  delivery_expenses: ['order_id', 'courier', 'tracking_number', 'amount', 'expense_date', 'payment_status', 'notes', 'created_at'],
  chats: ['sender_name', 'sender_type', 'subject', 'message', 'reply_message', 'status', 'created_at'],
  seller_applications: ['applicant_name', 'business_name', 'email', 'phone', 'address', 'category', 'leopard_courier_nearby', 'product_image_url', 'message', 'status', 'created_at'],
  investor_applications: ['applicant_name', 'email', 'phone', 'address', 'proposed_amount', 'investment_product', 'document_url', 'message', 'status', 'created_at']
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

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function getCookies(req) {
  return Object.fromEntries(String(req.headers.cookie || '').split(';').map(part => part.trim().split(/=(.*)/s)).filter(([key]) => key));
}

function sessionTokenHash(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function getCustomerToken(req) {
  const authorization = String(req.headers.authorization || '');
  const bearer = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  return bearer || getCookies(req).apexiums_customer_session || '';
}

async function createCustomerSession(req, res, customer) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  const userAgent = String(req.headers['user-agent'] || '').slice(0, 500) || null;
  const ipAddress = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim().slice(0, 64) || null;
  await pool.query('INSERT INTO customer_sessions (customer_id, token_hash, user_agent, ip_address, expires_at) VALUES (?, ?, ?, ?, ?)', [customer.id, sessionTokenHash(token), userAgent, ipAddress, expiresAt]);
  await pool.query('INSERT INTO customer_login_history (customer_id, email, user_agent, ip_address) VALUES (?, ?, ?, ?)', [customer.id, normalizeEmail(customer.email || customer.username), userAgent, ipAddress]);
  res.setHeader('Set-Cookie', `apexiums_customer_session=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 14}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  return token;
}

async function getCurrentCustomer(req) {
  const token = getCustomerToken(req);
  if (!token) return null;
  const [[session]] = await pool.query('SELECT * FROM customer_sessions WHERE token_hash = ? LIMIT 1', [sessionTokenHash(token)]);
  if (!session || new Date(session.expires_at).getTime() < Date.now()) {
    if (session) await pool.query('DELETE FROM customer_sessions WHERE id = ?', [session.id]);
    return null;
  }
  await pool.query('UPDATE customer_sessions SET last_used_at = NOW() WHERE id = ?', [session.id]);
  const [[customer]] = await pool.query('SELECT * FROM customers WHERE id = ? LIMIT 1', [session.customer_id]);
  return customer || null;
}

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function createOtpEmail({ name, otp }) {
  const safeName = String(name || 'Customer').replace(/[<>&"']/g, '');
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a">
    <div style="max-width:560px;margin:32px auto;background:#fff;border:1px solid #e2e8f0;border-radius:18px;overflow:hidden">
      <div style="padding:28px 32px;background:linear-gradient(135deg,#e8262a,#be123c);color:#fff"><div style="font-size:22px;font-weight:800">Apexiums</div><div style="margin-top:6px;font-size:14px;opacity:.9">Confirm your email address</div></div>
      <div style="padding:30px 32px"><p style="margin:0 0 16px;font-size:16px">Hi ${safeName},</p><p style="margin:0 0 22px;line-height:1.6;color:#475569">Welcome to Apexiums. Use this one-time code to complete your registration and start shopping.</p>
      <div style="margin:0 0 22px;padding:18px;text-align:center;border-radius:12px;background:#fff1f2;border:1px dashed #fda4af;color:#be123c;font-size:30px;font-weight:800;letter-spacing:8px">${otp}</div>
      <p style="margin:0;line-height:1.6;font-size:13px;color:#64748b">This code expires in 10 minutes. Do not share it with anyone. If you did not create an Apexiums account, you can safely ignore this email.</p></div>
      <div style="padding:18px 32px;background:#f8fafc;text-align:center;font-size:12px;color:#94a3b8">© ${new Date().getFullYear()} Apexiums. Shop with confidence.</div>
    </div></body></html>`;
}

function createElistinOtpEmail({ name, otp }) {
  const safeName = String(name || 'Customer').replace(/[<>&"']/g, '');
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#172033">
    <div style="padding:28px 12px"><div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e5eaf2;border-radius:20px;overflow:hidden;box-shadow:0 8px 28px rgba(15,23,42,.08)">
      <div style="padding:28px 32px 26px;text-align:center;background:linear-gradient(135deg,#ed1c3a 0%,#c70f34 100%);color:#ffffff">
        <img src="cid:elistin-logo" width="106" alt="Elistin" style="display:block;width:106px;max-width:106px;height:auto;margin:0 auto 14px;border:0;border-radius:10px;background:#ffffff" />
        <div style="font-size:24px;font-weight:800;letter-spacing:.2px">Verify your email</div>
        <div style="margin-top:7px;font-size:14px;line-height:20px;color:#ffe8ed">One quick step to secure your Elistin account</div>
      </div>
      <div style="padding:32px"><p style="margin:0 0 14px;font-size:17px;font-weight:700">Hi ${safeName},</p><p style="margin:0 0 25px;line-height:24px;font-size:15px;color:#526075">Welcome to Elistin. Enter the verification code below to complete your registration and start shopping.</p>
      <div style="margin:0 0 24px;padding:19px 16px;text-align:center;border-radius:14px;background:#fff4f6;border:1px dashed #f38aa0;color:#c70f34;font-size:32px;font-weight:800;letter-spacing:9px">${otp}</div>
      <p style="margin:0;padding:14px 16px;border-radius:10px;background:#f8fafc;line-height:21px;font-size:13px;color:#64748b"><strong style="color:#334155">For your security:</strong> this code expires in 10 minutes. Never share it with anyone. If you did not create an Elistin account, you can safely ignore this email.</p></div>
      <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #edf1f6;text-align:center;font-size:12px;color:#94a3b8">&copy; ${new Date().getFullYear()} Elistin. Shop with confidence.</div>
    </div></div></body></html>`;
}

function getMailTransport() {
  // Environment-variable editors sometimes preserve an invisible leading or
  // trailing space. Gmail treats that as a different username/password.
  const user = String(process.env.SMTP_USER || '').trim();
  const host = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const rawPass = String(process.env.SMTP_PASS || '');
  // Google displays App Passwords in four groups. Accept either the displayed
  // `xxxx xxxx xxxx xxxx` form or the compact 16-character form. Do not alter
  // meaningful internal spaces for non-Gmail SMTP providers.
  const pass = /(^|\.)smtp\.gmail\.com$/i.test(host)
    ? rawPass.replace(/\s+/g, '')
    : rawPass.trim();
  if (!user || !pass) throw new Error('Email service is not configured. Set SMTP_USER and SMTP_PASS in .env.');
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true',
    auth: { user, pass },
    // Some shared hosts intercept outbound SMTP and present their own TLS
    // certificate. Allow this only when explicitly enabled in environment.
    tls: { rejectUnauthorized: String(process.env.SMTP_REJECT_UNAUTHORIZED || 'false') === 'true' }
  });
}

function smtpCredentialTag() {
  // This is deliberately a one-way, short identifier—not the password. It
  // lets us compare the credential used by a running server with the intended
  // one when cPanel/Passenger keeps an old environment in memory.
  const host = String(process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const rawPass = String(process.env.SMTP_PASS || '');
  const pass = /(^|\.)smtp\.gmail\.com$/i.test(host) ? rawPass.replace(/\s+/g, '') : rawPass.trim();
  return crypto.createHash('sha256').update(pass).digest('hex').slice(0, 12);
}

async function sendRegistrationOtp({ email, name, otp }) {
  const configuredFrom = String(process.env.SMTP_FROM || '').trim();
  // cPanel's variable editor can accidentally save only the display name.
  // Always fall back to the authenticated Gmail address if no email is present.
  const from = configuredFrom.includes('@') ? configuredFrom : `Elistin <${process.env.SMTP_USER}>`;
  try {
    await getMailTransport().sendMail({
      from,
      to: email,
      subject: `${otp} is your Elistin verification code`,
      html: createElistinOtpEmail({ name, otp }),
      attachments: [{ filename: 'elistin-logo.jpg', path: path.join(frontendPath, 'images', 'logo.jpg'), cid: 'elistin-logo' }]
    });
  } catch (error) {
    // Gmail's 535 is an authentication rejection, not an issue with the
    // recipient or OTP. Keep the provider response out of the public UI and
    // show the administrator the exact remediation.
    if (error?.code === 'EAUTH' || Number(error?.responseCode) === 535) {
      throw new Error(`Gmail rejected SMTP authentication (server credential tag: ${smtpCredentialTag()}). The server is not using the intended App Password; stop and start the Node.js app after saving SMTP_PASS.`);
    }
    throw error;
  }
}

const TOKEN_SECRET = process.env.JWT_SECRET || 'local-development-secret-change-me';
const INVESTOR_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

function createInvestorToken(investor) {
  const payload = Buffer.from(JSON.stringify({
    sub: Number(investor.id), role: 'Investor', businessId: Number(investor.business_id || DEFAULT_BUSINESS_ID), exp: Date.now() + INVESTOR_TOKEN_TTL_MS
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function readInvestorToken(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.role === 'Investor' && Number(data.sub) && Number(data.exp) > Date.now() ? data : null;
  } catch { return null; }
}

function requireInvestor(req, res, next) {
  const investor = readInvestorToken(req);
  if (!investor) return res.status(401).json({ message: 'A valid investor bearer token is required.' });
  req.investorAuth = investor;
  next();
}

function createSellerToken(account) {
  const payload = Buffer.from(JSON.stringify({ sub: Number(account.id), role: 'Seller', businessId: Number(account.id), exp: Date.now() + INVESTOR_TOKEN_TTL_MS })).toString('base64url');
  const signature = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function requireSeller(req, res, next) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return res.status(401).json({ message: 'A valid seller session is required.' });
  const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('base64url');
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).json({ message: 'A valid seller session is required.' });
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (data.role !== 'Seller' || !Number(data.sub) || Number(data.exp) <= Date.now()) throw new Error('Invalid seller token');
    req.sellerAuth = data;
    next();
  } catch { return res.status(401).json({ message: 'A valid seller session is required.' }); }
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

function persistProductGallery(value) {
  let images = [];
  try { images = Array.isArray(value) ? value : JSON.parse(value || '[]'); } catch { images = []; }
  return JSON.stringify(images.slice(0, 4).map((image) => {
    if (typeof image === 'string') return persistImageDataUrl(image, 'products');
    return { ...image, url: persistImageDataUrl(image?.url, 'products') };
  }).filter((image) => typeof image === 'string' ? image : image?.url));
}

function businessScope(table, req, alias = '') {
  const { businessId, role } = getContext(req);
  const investorId = Number(req.headers['x-investor-id'] || 0) || null;
  if (String(role || '').replace(/[\s_-]+/g, '').toLowerCase() === 'investor' && investorId && ['stock', 'orders', 'products'].includes(table)) {
    const column = `${alias ? `${alias}.` : ''}investor_id`;
    return { clause: `${column} = ?`, params: [investorId] };
  }
  if (!businessScopedTables.has(table) || !businessId) {
    return { clause: '', params: [] };
  }
  const column = `${alias ? `${alias}.` : ''}business_id`;
  return { clause: `${column} = ?`, params: [businessId] };
}

async function normalizeProductInvestor(data, businessId) {
  if (!Object.prototype.hasOwnProperty.call(data, 'investor_id')) return;
  const investorId = Number(data.investor_id || 0);
  if (!investorId) {
    data.investor_id = null;
    return;
  }
  const [investors] = await pool.query(
    'SELECT id FROM investors WHERE id = ? AND business_id = ? LIMIT 1',
    [investorId, businessId || DEFAULT_BUSINESS_ID]
  );
  if (!investors.length) throw new Error('Selected investor was not found for this business.');
  data.investor_id = investorId;
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
       SET business_name = ?, username = ?, owner_name = ?, email = ?, phone = ?, role = ?, status = ?
       WHERE id = 1`,
      ['Apexiums HQ', adminUsername, 'Super Admin', 'admin@apexiums.com', '03000000000', 'SuperAdmin', 'Active']
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

async function seedDefaultMarketingBanners() {
  const [existingBanners] = await pool.query('SELECT id FROM banners LIMIT 1');
  if (!existingBanners.length) {
    for (const [title, imageUrl, position] of [
      ['Big Summer Electronics Sale', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1400&q=80', 1],
      ['Fashion That Feels Premium', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=80', 2],
      ['Home Deals You Cannot Miss', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80', 3]
    ]) await pool.query('INSERT INTO banners (business_id, title, image_url, link, position, status) VALUES (?, ?, ?, ?, ?, ?)', [DEFAULT_BUSINESS_ID, title, imageUrl, '/catalog', position, 'Active']);
  }
  const [existingPromotions] = await pool.query('SELECT id FROM promotions LIMIT 1');
  if (!existingPromotions.length) {
    for (const [name, imageUrl] of [['Fast Delivery', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=900&q=80'], ['Cash on Delivery', 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=900&q=80']]) await pool.query('INSERT INTO promotions (business_id, name, image_url, show_on_website, status) VALUES (?, ?, ?, ?, ?)', [DEFAULT_BUSINESS_ID, name, imageUrl, 'Yes', 'Active']);
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

  await pool.query(`CREATE TABLE IF NOT EXISTS site_visits (id INT AUTO_INCREMENT PRIMARY KEY, visitor_key VARCHAR(180) NOT NULL, visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
  const businessTables = ['banners', 'promotions', 'coupons', 'categories', 'products', 'reviews', 'product_variants', 'stock', 'stock_history', 'orders', 'order_items', 'returns', 'staff', 'customers', 'expenses', 'finance_transactions', 'wholesellers', 'purchase_orders', 'notifications', 'investors', 'permissions', 'software_fees', 'staff_salaries', 'delivery_expenses', 'chats', 'seller_applications', 'investor_applications'];
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
  await ensureColumn('products', 'investor_id', 'INT NULL');
  await pool.query(`ALTER TABLE ${backtick('reviews')} MODIFY COLUMN ${backtick('rating')} DECIMAL(3,1) NOT NULL`);
  await pool.query('CREATE INDEX IF NOT EXISTS idx_reviews_product_created ON reviews (product_id, created_at)');
  await ensureColumn('orders', 'customer_email', 'VARCHAR(180)');
  await ensureColumn('orders', 'customer_phone', 'VARCHAR(60)');
  await ensureColumn('customers', 'username', 'VARCHAR(120)');
  await ensureColumn('customers', 'password_hash', 'VARCHAR(255)');
  await ensureColumn('customers', 'plain_password', 'VARCHAR(255)');
  await seedDefaultMarketingBanners();
  await ensureColumn('stock', 'total_items', 'INT DEFAULT 0');
  await ensureColumn('stock', 'stock_belong_to', 'VARCHAR(180)');
  await ensureColumn('stock', 'description', 'TEXT');
  await ensureColumn('wholesellers', 'name', 'VARCHAR(180)');
  await ensureColumn('wholesellers', 'description', 'TEXT');
  await ensureColumn('wholesellers', 'seller_image', 'VARCHAR(500)');
  await ensureColumn('wholesellers', 'stock_seller_sell', 'VARCHAR(180)');
  await ensureColumn('wholesellers', 'username', 'VARCHAR(120)');
  await ensureColumn('wholesellers', 'password', 'VARCHAR(255)');
  await ensureColumn('wholesellers', 'contact_date', 'DATE');
  await ensureColumn('wholesellers', 'supplier_payment_amount', 'DECIMAL(12,2) DEFAULT 0');
  await ensureColumn('wholesellers', 'supplier_payment_date', 'DATE');
  await ensureColumn('products', 'cost_price', 'DECIMAL(12,2) DEFAULT 0');
  await ensureColumn('purchase_orders', 'paid_amount', 'DECIMAL(12,2) DEFAULT 0');
  await ensureColumn('purchase_orders', 'payment_method', 'VARCHAR(60)');
  await ensureColumn('purchase_orders', 'payment_status', "VARCHAR(40) DEFAULT 'Pending'");
  await ensureColumn('purchase_orders', 'delivery_status', "VARCHAR(40) DEFAULT 'Not Delivered'");
  await ensureColumn('investors', 'address', 'TEXT');
  await ensureColumn('investors', 'username', 'VARCHAR(120)');
  await ensureColumn('investors', 'password', 'VARCHAR(255)');
  await ensureColumn('investors', 'password_hash', 'VARCHAR(255)');
  await ensureColumn('investors', 'return_rate', 'DECIMAL(8,2) DEFAULT 0');
  await ensureColumn('investors', 'equity_share', 'VARCHAR(40)');
  await ensureColumn('stock', 'investor_id', 'INT NULL');
  await ensureColumn('orders', 'investor_id', 'INT NULL');
  await ensureColumn('investors', 'description', 'TEXT');
  await ensureColumn('staff', 'department', 'VARCHAR(120)');
  await ensureColumn('permissions', 'role', "VARCHAR(40) DEFAULT 'Staff'");
  await ensureColumn('permissions', 'can_create', "VARCHAR(10) DEFAULT 'No'");
  await ensureColumn('permissions', 'can_delete', "VARCHAR(10) DEFAULT 'No'");
  await ensureColumn('chats', 'reply_message', 'TEXT');
  await ensureColumn('business_accounts', 'cnic', 'VARCHAR(60)');
  await ensureColumn('business_accounts', 'address', 'TEXT');
  await ensureColumn('business_accounts', 'agreement_image', 'VARCHAR(500)');
  await ensureColumn('business_accounts', 'plain_password', 'VARCHAR(255)');
  await ensureColumn('business_accounts', 'seller_categories', 'TEXT');
  await ensureColumn('seller_applications', 'address', 'TEXT');
  await ensureColumn('seller_applications', 'leopard_courier_nearby', 'VARCHAR(10)');
  await ensureColumn('seller_applications', 'product_image_url', 'VARCHAR(500)');
  await ensureColumn('investor_applications', 'address', 'TEXT');
  await ensureColumn('investor_applications', 'investment_product', 'VARCHAR(180)');
  await ensureColumn('investor_applications', 'document_url', 'VARCHAR(500)');
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
  if (table === 'products') {
    const { role } = getContext(req);
    if (!['Admin', 'BusinessAdmin', 'SuperAdmin'].includes(role)) rows.forEach((row) => delete row.cost_price);
  }
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
      if (resource === 'reviews') {
        const rating = Number(req.body.rating);
        if (!Number.isFinite(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be between 1.0 and 5.0.' });
      }
      const data = cleanPayload(req.body, fields);
      if (resource === 'categories' && Object.prototype.hasOwnProperty.call(data, 'subcategories')) {
        data.subcategories = JSON.stringify(Array.isArray(req.body.subcategories) ? req.body.subcategories : (() => { try { return JSON.parse(req.body.subcategories || '[]'); } catch { return []; } })());
      }
      if ((resource === 'categories' || resource === 'products') && data.image_url) data.image_url = persistImageDataUrl(data.image_url, resource === 'products' ? 'products' : 'categories');
      if ((resource === 'banners' || resource === 'promotions') && data.image_url) data.image_url = persistImageDataUrl(data.image_url, 'banners');
      if (resource === 'products' && Object.prototype.hasOwnProperty.call(data, 'product_images')) data.product_images = persistProductGallery(data.product_images);
      if (resource === 'investor_applications' && data.document_url) data.document_url = persistImageDataUrl(data.document_url, 'investor-documents');
      if (resource === 'seller_applications' && data.product_image_url) data.product_image_url = persistImageDataUrl(data.product_image_url, 'seller-products');
      if (resource === 'staff' && data.password_hash) data.password_hash = hashPassword(data.password_hash);
      const { role, businessId } = getContext(req);
      if (businessScopedTables.has(resource) && !Object.prototype.hasOwnProperty.call(data, 'business_id')) {
        data.business_id = role === 'SuperAdmin' && businessId ? businessId : businessId || DEFAULT_BUSINESS_ID;
      }
      if (resource === 'products') await normalizeProductInvestor(data, data.business_id);
      const columns = Object.keys(data);
      const placeholders = columns.map(() => '?').join(', ');
      const [result] = await pool.query(
        `INSERT INTO ${backtick(resource)} (${columns.map(backtick).join(', ')}) VALUES (${placeholders})`,
        columns.map((column) => data[column])
      );
      if (resource === 'products') {
        await pool.query(
          'INSERT INTO stock (business_id, product_id, product_name, sku, category, quantity, reorder_level, warehouse, investor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [data.business_id || DEFAULT_BUSINESS_ID, result.insertId, data.name, data.sku || null, data.category || null, Number(data.stock_qty || 0), 10, 'Main Warehouse', data.investor_id || null]
        );
      }
      if (resource === 'stock' && data.product_id) {
        await pool.query(
          'UPDATE products SET stock_qty = stock_qty + ?, status = ? WHERE id = ? AND business_id = ?',
          [Number(data.quantity || 0), Number(data.quantity || 0) > 0 ? 'Active' : 'Out of Stock', data.product_id, data.business_id || DEFAULT_BUSINESS_ID]
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
      if ((resource === 'banners' || resource === 'promotions') && data.image_url) data.image_url = persistImageDataUrl(data.image_url, 'banners');
      if (resource === 'products' && Object.prototype.hasOwnProperty.call(data, 'product_images')) data.product_images = persistProductGallery(data.product_images);
      if (resource === 'staff' && data.password_hash) data.password_hash = hashPassword(data.password_hash);
      const columns = Object.keys(data);
      if (!columns.length) return res.status(400).json({ message: 'No valid fields supplied' });
      const { businessId } = getContext(req);
      if (businessScopedTables.has(resource) && !Object.prototype.hasOwnProperty.call(data, 'business_id')) {
        data.business_id = businessId || DEFAULT_BUSINESS_ID;
        columns.push('business_id');
      }
      if (resource === 'products') await normalizeProductInvestor(data, data.business_id);
      const scope = businessScope(resource, req);
      const where = scope.clause ? `AND ${scope.clause}` : '';
      await pool.query(
        `UPDATE ${backtick(resource)} SET ${columns.map((column) => `${backtick(column)} = ?`).join(', ')} WHERE id = ? ${where}`,
        [...columns.map((column) => data[column]), req.params.id, ...scope.params]
      );
      if (resource === 'products') {
        await pool.query(
          'UPDATE stock SET product_name = COALESCE(?, product_name), sku = COALESCE(?, sku), category = COALESCE(?, category), investor_id = CASE WHEN ? THEN ? ELSE investor_id END WHERE product_id = ? AND business_id = ?',
          [data.name || null, data.sku || null, data.category || null, Object.prototype.hasOwnProperty.call(data, 'investor_id'), data.investor_id, req.params.id, data.business_id || DEFAULT_BUSINESS_ID]
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

app.post('/api/analytics/visit', async (req, res) => {
  try {
    const visitorKey = String(req.body?.visitorKey || '').trim();
    if (!visitorKey) return res.status(400).json({ message: 'visitorKey required' });
    const [[existing]] = await pool.query('SELECT id FROM site_visits WHERE visitor_key = ? LIMIT 1', [visitorKey]);
    if (!existing) await pool.query('INSERT INTO site_visits (visitor_key) VALUES (?)', [visitorKey]);
    res.json({ ok: true });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/analytics/visitors', async (_req, res) => {
  try { const [[row]] = await pool.query('SELECT COUNT(*) AS total FROM site_visits'); res.json({ total: Number(row?.total || 0) }); }
  catch (error) { res.status(500).json({ message: error.message }); }
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

app.post('/api/auth/customer-registration/start', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const identifier = String(req.body.identifier || req.body.email || req.body.phone || '').trim();
    const isEmail = /^\S+@\S+\.\S+$/.test(identifier);
    const isPhone = /^[+\d][\d\s()-]{6,19}$/.test(identifier);
    const email = isEmail ? normalizeEmail(identifier) : null;
    const phone = isPhone ? identifier : null;
    const username = email || phone;
    const password = String(req.body.password || '');
    if (!name || !identifier || !password) return res.status(400).json({ message: 'Name, email or contact number, and password are required.' });
    if (!isEmail && !isPhone) return res.status(400).json({ message: 'Please enter a valid email address or contact number.' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must contain at least 6 characters.' });
    const [[existingCustomer]] = isEmail
      ? await pool.query('SELECT id FROM customers WHERE username = ? OR email = ? LIMIT 1', [username, email])
      : await pool.query('SELECT id FROM customers WHERE username = ? OR phone = ? LIMIT 1', [username, phone]);
    if (existingCustomer) return res.status(409).json({ message: 'An account with this email or contact number already exists. Please sign in.' });
    const [result] = await pool.query('INSERT INTO customers (business_id, name, username, password_hash, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [DEFAULT_BUSINESS_ID, name, username, hashPassword(password), email, phone, 'Active']);
    const user = { id: result.insertId, name, username, email, phone, role: 'User', loginType: 'user' };
    const token = await createCustomerSession(req, res, user);
    res.status(201).json({ message: 'Account created successfully.', user, role: 'User', token });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    console.error('Customer registration error:', error.message);
    res.status(500).json({ message: 'Unable to create your account. Please try again.' });
  }
});

app.post('/api/auth/customer-registration/verify', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').replace(/\s/g, '');
    if (!email || !/^\d{6}$/.test(otp)) return res.status(400).json({ message: 'Enter the 6-digit verification code.' });
    const [[pending]] = await pool.query('SELECT * FROM customer_email_verifications WHERE email = ? LIMIT 1', [email]);
    if (!pending) return res.status(400).json({ message: 'No active verification was found. Please register again.' });
    if (Number(pending.attempts || 0) >= 5) return res.status(429).json({ message: 'Too many incorrect attempts. Please request a new code.' });
    if (new Date(pending.expires_at).getTime() < Date.now()) return res.status(400).json({ message: 'This code has expired. Please request a new code.' });
    if (!verifyPassword(otp, pending.otp_hash)) {
      await pool.query('UPDATE customer_email_verifications SET attempts = ? WHERE id = ?', [Number(pending.attempts || 0) + 1, pending.id]);
      return res.status(400).json({ message: 'That verification code is incorrect.' });
    }
    const [result] = await pool.query('INSERT INTO customers (business_id, name, username, password_hash, email, status) VALUES (?, ?, ?, ?, ?, ?)', [DEFAULT_BUSINESS_ID, pending.name, email, pending.password_hash, email, 'Active']);
    await pool.query('DELETE FROM customer_email_verifications WHERE id = ?', [pending.id]);
    const token = await createCustomerSession(req, res, { id: result.insertId, email, username: email });
    res.status(201).json({ user: { id: result.insertId, name: pending.name, username: email, email, role: 'User', loginType: 'user' }, role: 'User', token });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'An account with this email already exists. Please sign in.' });
    console.error('Registration verification error:', error.message);
    res.status(500).json({ message: 'Unable to verify your code. Please try again.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');
    if (!username || !password) return res.status(400).json({ message: 'Username and password required' });
    const normalizedUsername = normalizeEmail(username);
    const isEmailLogin = username.includes('@');
    const [[customer]] = isEmailLogin
      ? await pool.query('SELECT * FROM customers WHERE username = ? OR email = ? LIMIT 1', [normalizedUsername, normalizedUsername])
      : await pool.query('SELECT * FROM customers WHERE username = ? OR phone = ? LIMIT 1', [username, username]);
    if (customer) {
      const validCustomerPassword = customer.password_hash
        ? verifyPassword(password, customer.password_hash)
        : String(customer.plain_password || '') === password;
      if (customer.status === 'Inactive' || !validCustomerPassword) return res.status(401).json({ message: 'Invalid username or password' });
      if (!customer.password_hash && customer.plain_password) {
        await pool.query('UPDATE customers SET password_hash = ?, plain_password = NULL WHERE id = ?', [hashPassword(password), customer.id]);
      }
      const { password_hash, plain_password, ...safeCustomer } = customer;
      const token = await createCustomerSession(req, res, customer);
      return res.json({ user: { ...safeCustomer, role: 'User', loginType: 'user' }, role: 'User', token });
    }
    const [[account]] = await pool.query('SELECT * FROM business_accounts WHERE username = ? LIMIT 1', [username]);
    if (!account) {
      const [[investor]] = await pool.query('SELECT * FROM investors WHERE username = ? LIMIT 1', [username]);
      if (!investor || investor.status === 'Inactive' || investor.status === 'Pending Approval') return res.status(401).json({ message: 'Invalid credentials or account is awaiting approval' });
      const validInvestorPassword = investor.password_hash
        ? verifyPassword(password, investor.password_hash)
        : String(investor.password || '') === password;
      if (!validInvestorPassword) return res.status(401).json({ message: 'Invalid credentials' });
      const { password: _password, password_hash: _hash, ...safeInvestor } = investor;
      return res.json({ user: { ...safeInvestor, role: 'Investor', name: investor.name, businessId: investor.business_id, investorId: investor.id }, businessId: investor.business_id || DEFAULT_BUSINESS_ID, role: 'Investor', token: createInvestorToken(investor) });
    }
    if (account.status === 'Inactive') return res.status(401).json({ message: 'Invalid credentials' });
    if (!verifyPassword(password, account.password_hash)) return res.status(401).json({ message: 'Invalid credentials' });
    await pool.query('UPDATE business_accounts SET last_login = NOW() WHERE id = ?', [account.id]);
    if (String(account.role || '').replace(/[\s_-]+/g, '').toLowerCase() === 'seller') {
      return res.json({
        user: { ...safeBusinessAccount(account), role: 'Seller', businessId: account.id, sellerId: account.id },
        businessId: account.id,
        role: 'Seller',
        token: createSellerToken(account)
      });
    }
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

app.get('/api/seller/me/dashboard', requireSeller, async (req, res) => {
  try {
    const sellerId = Number(req.sellerAuth.sub);
    const [[seller]] = await pool.query('SELECT id, business_name, username, owner_name, email, phone, status, created_at FROM business_accounts WHERE id = ? AND role = ? AND status = ? LIMIT 1', [sellerId, 'Seller', 'Active']);
    if (!seller) return res.status(404).json({ message: 'Seller account is not active.' });
    const [orders] = await pool.query('SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC LIMIT 100', [sellerId]);
    const [returns] = await pool.query('SELECT * FROM returns WHERE business_id = ? ORDER BY created_at DESC LIMIT 100', [sellerId]);
    const [stock] = await pool.query("SELECT *, CASE WHEN quantity <= 0 THEN 'Out of stock' WHEN quantity <= reorder_level THEN 'Low stock' ELSE 'In stock' END AS stock_status FROM stock WHERE business_id = ? ORDER BY product_name ASC", [sellerId]);
    const revenue = orders.filter((order) => !['Cancelled', 'Canceled'].includes(String(order.order_status || order.status || ''))).reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    res.json({ profile: seller, summary: { orders: orders.length, returns: returns.length, stockUnits: stock.reduce((sum, row) => sum + Number(row.quantity || 0), 0), revenue }, orders, returns, stock });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/auth/session', async (req, res) => {
  try {
    const customer = await getCurrentCustomer(req);
    if (!customer) return res.status(401).json({ message: 'No active customer session.' });
    const { password_hash, plain_password, ...safeCustomer } = customer;
    res.json({ user: { ...safeCustomer, avatar: safeCustomer.avatar_url || null, role: 'User', loginType: 'user' } });
  } catch (error) { res.status(500).json({ message: 'Unable to restore session.' }); }
});

app.post('/api/auth/logout', async (req, res) => {
  const token = getCustomerToken(req);
  if (token) await pool.query('DELETE FROM customer_sessions WHERE token_hash = ?', [sessionTokenHash(token)]);
  res.setHeader('Set-Cookie', 'apexiums_customer_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  res.status(204).end();
});

app.put('/api/customers/me', async (req, res) => {
  try {
    const customer = await getCurrentCustomer(req);
    if (!customer) return res.status(401).json({ message: 'Please sign in to update your profile.' });
    const name = String(req.body.name || customer.name).trim();
    const phone = String(req.body.phone || '').trim();
    const avatarUrl = String(req.body.avatar_url || '').trim() || null;
    if (!name) return res.status(400).json({ message: 'Name is required.' });
    await pool.query('UPDATE customers SET name = ?, phone = ?, avatar_url = ? WHERE id = ?', [name, phone || null, avatarUrl, customer.id]);
    res.json({ user: { id: customer.id, name, username: customer.username, email: customer.email, phone: phone || null, avatar: avatarUrl, role: 'User', loginType: 'user' } });
  } catch (error) { res.status(500).json({ message: 'Unable to save profile.' }); }
});

app.put('/api/auth/change-password', async (req, res) => {
  try {
    const accountId = Number(req.headers['x-account-id'] || req.headers['x-business-id'] || 0);
    const currentPassword = String(req.body.currentPassword || '');
    const newPassword = String(req.body.newPassword || '');
    if (!accountId || !currentPassword || !newPassword) return res.status(400).json({ message: 'Current and new passwords are required.' });
    if (newPassword.length < 8) return res.status(400).json({ message: 'New password must contain at least 8 characters.' });

    const [[account]] = await pool.query('SELECT id, password_hash FROM business_accounts WHERE id = ? LIMIT 1', [accountId]);
    if (!account || !verifyPassword(currentPassword, account.password_hash)) return res.status(401).json({ message: 'Current password is incorrect.' });
    if (verifyPassword(newPassword, account.password_hash)) return res.status(400).json({ message: 'New password must be different from the current password.' });

    await pool.query('UPDATE business_accounts SET password_hash = ?, plain_password = NULL WHERE id = ?', [hashPassword(newPassword), accountId]);
    res.json({ message: 'Password changed successfully.' });
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
    'INSERT INTO business_accounts (business_name, username, password_hash, plain_password, owner_name, cnic, address, email, phone, seller_categories, agreement_image, role, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        req.body.seller_categories || null,
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
      phone: req.body.phone || null, seller_categories: req.body.seller_categories || null,
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
    ['business_name', 'owner_name', 'cnic', 'address', 'email', 'phone', 'seller_categories', 'agreement_image', 'role', 'status'].forEach((key) => {
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
    const scopeOrderItems = businessScope('order_items', req);
    const scopeCustomers = businessScope('customers', req);
    const productWhere = scopeProducts.clause ? `WHERE ${scopeProducts.clause}` : '';
    const orderWhere = scopeOrders.clause ? `WHERE ${scopeOrders.clause}` : '';
    const stockWhere = scopeStock.clause ? `WHERE ${scopeStock.clause}` : '';
    const couponWhere = scopeCoupons.clause ? `WHERE ${scopeCoupons.clause}` : '';
    const notificationWhere = scopeNotifications.clause ? `WHERE ${scopeNotifications.clause}` : '';
    const orderItemWhere = scopeOrderItems.clause ? `WHERE ${scopeOrderItems.clause}` : '';
    const customerWhere = scopeCustomers.clause ? `WHERE ${scopeCustomers.clause}` : '';
    const [products] = await pool.query(`SELECT COUNT(*) AS total, SUM(status = 'Live') AS active FROM products ${productWhere}`, scopeProducts.params);
    const [productCosts] = await pool.query(`SELECT id, cost_price FROM products ${productWhere}`, scopeProducts.params);
    const [orderItems] = await pool.query(`SELECT order_id, product_id, qty FROM order_items ${orderItemWhere}`, scopeOrderItems.params);
    const [orderRows] = await pool.query(`SELECT id, total_amount, order_status FROM orders ${orderWhere}`, scopeOrders.params);
    const [orders] = await pool.query(`SELECT COUNT(*) AS total, COALESCE(SUM(total_amount), 0) AS revenue, SUM(order_status = 'Pending') AS pending FROM orders ${orderWhere}`, scopeOrders.params);
    const [customers] = await pool.query(`SELECT COUNT(*) AS total FROM customers ${customerWhere}`, scopeCustomers.params);
    const [stock] = await pool.query(`SELECT COUNT(*) AS total, SUM(quantity <= reorder_level AND quantity > 0) AS low, SUM(quantity <= 0) AS out_of_stock FROM stock ${stockWhere}`, scopeStock.params);
    const [coupons] = await pool.query(`SELECT COUNT(*) AS total, SUM(status = 'Active') AS active FROM coupons ${couponWhere}`, scopeCoupons.params);
    const [notifications] = await pool.query(`SELECT COUNT(*) AS total, SUM(is_read = 0) AS unread FROM notifications ${notificationWhere}`, scopeNotifications.params);
    const [businessAccounts] = await pool.query('SELECT COUNT(*) AS total FROM business_accounts');
    const lowStockWhere = scopeStock.clause ? `${stockWhere} AND quantity <= reorder_level` : 'WHERE quantity <= reorder_level';
    const [lowStockItems] = await pool.query(
      `SELECT product_name, sku, quantity, reorder_level, warehouse FROM stock ${lowStockWhere} ORDER BY quantity ASC LIMIT 5`,
      scopeStock.params
    );
    const activeOrderIds = new Set((orderRows || []).filter((order) => !['Cancelled', 'Canceled', 'Returned'].includes(order.order_status)).map((order) => String(order.id)));
    const productCostMap = new Map((productCosts || []).map((product) => [String(product.id), Number(product.cost_price || 0)]));
    const costOfGoodsSold = (orderItems || []).filter((item) => activeOrderIds.has(String(item.order_id))).reduce((total, item) => total + Number(productCostMap.get(String(item.product_id)) || 0) * Number(item.qty || 1), 0);
    const dashboardRevenue = (orderRows || []).filter((order) => !['Cancelled', 'Canceled', 'Returned'].includes(order.order_status)).reduce((total, order) => total + Number(order.total_amount || 0), 0);
    if (orders[0]) { orders[0].revenue = dashboardRevenue; orders[0].costOfGoodsSold = costOfGoodsSold; orders[0].netProfit = dashboardRevenue - costOfGoodsSold; }
    res.json({
      products: products[0] || {},
      orders: orders[0] || {},
      customers: customers[0] || {},
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
  purchase_orders: ['wholeseller_id', 'total_amount'],
  staff: ['name'],
  finance_transactions: ['title'],
  coupons: ['code'],
  reviews: ['product_id', 'reviewer_name', 'rating'],
  investors: ['name'],
  permissions: ['staff_id', 'module'],
  software_fees: ['service_name'],
  staff_salaries: ['staff_name', 'salary_month'],
  delivery_expenses: ['courier'],
  chats: ['sender_name', 'message'],
  seller_applications: ['applicant_name'],
  investor_applications: ['applicant_name']
}).forEach(([resource, required]) => crudRoutes(resource, required));


app.post('/api/coupons/validate', async (req, res) => {
  try {
    const code = String(req.body?.code || '').trim().toUpperCase();
    const orderAmount = Number(req.body?.orderAmount || 0);
    if (!code) return res.status(400).json({ message: 'Coupon code required' });
    const scope = businessScope('coupons', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    const [[coupon]] = await pool.query(`SELECT * FROM coupons WHERE UPPER(code) = ? ${where} LIMIT 1`, [code, ...scope.params]);
    if (!coupon || String(coupon.status).toLowerCase() !== 'active') return res.status(404).json({ message: 'Coupon code is invalid or inactive.' });
    const today = new Date().toISOString().slice(0, 10);
    if (coupon.valid_from && String(coupon.valid_from).slice(0, 10) > today) return res.status(400).json({ message: 'This coupon is not active yet.' });
    if (coupon.valid_till && String(coupon.valid_till).slice(0, 10) < today) return res.status(400).json({ message: 'This coupon has expired.' });
    if (Number(coupon.usage_limit || 0) > 0 && Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) return res.status(400).json({ message: 'Coupon usage limit has been reached.' });
    if (orderAmount < Number(coupon.min_order_amount || 0)) return res.status(400).json({ message: `Minimum order amount is Rs ${Number(coupon.min_order_amount).toLocaleString('en-PK')}.` });
    const freeDelivery = String(coupon.discount_type).toLowerCase() === 'free delivery';
    const rawDiscount = freeDelivery ? 0 : String(coupon.discount_type).toLowerCase() === 'percentage'
      ? orderAmount * Number(coupon.discount_value || 0) / 100
      : Number(coupon.discount_value || 0);
    const discount = Math.max(0, Math.min(orderAmount, Math.round(rawDiscount)));
    res.json({ coupon, discount, freeDelivery });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/coupons/redeem', async (req, res) => {
  try {
    const id = Number(req.body?.id || 0);
    if (!id) return res.status(400).json({ message: 'Coupon id required' });
    const scope = businessScope('coupons', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    await pool.query(`UPDATE coupons SET used_count = used_count + 1 WHERE id = ? ${where}`, [id, ...scope.params]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
    const ledgerScope = businessScope('finance_transactions', req);
    const productScope = businessScope('products', req);
    const itemScope = businessScope('order_items', req);
    const orderWhere = orderScope.clause ? `WHERE ${orderScope.clause}` : '';
    const expenseWhere = expenseScope.clause ? `WHERE ${expenseScope.clause}` : '';
    const ledgerWhere = ledgerScope.clause ? `WHERE ${ledgerScope.clause}` : '';
    const productWhere = productScope.clause ? `WHERE ${productScope.clause}` : '';
    const itemWhere = itemScope.clause ? `WHERE ${itemScope.clause}` : '';
    const [[orderResult], [expenseResult], [ledgerResult], [productResult], [orderItemResult]] = await Promise.all([
      pool.query(`SELECT * FROM orders ${orderWhere}`, orderScope.params),
      pool.query(`SELECT * FROM expenses ${expenseWhere}`, expenseScope.params),
      pool.query(`SELECT * FROM finance_transactions ${ledgerWhere}`, ledgerScope.params),
      pool.query(`SELECT id, cost_price FROM products ${productWhere}`, productScope.params),
      pool.query(`SELECT order_id, product_id, qty FROM order_items ${itemWhere}`, itemScope.params)
    ]);
    const completedOrders = orderResult.filter((order) => ['Shipped', 'Delivered', 'Received'].includes(order.order_status));
    const orderRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);
    const manualRevenue = ledgerResult.filter((row) => row.type === 'Revenue').reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const totalExpense = expenseResult.reduce((sum, row) => sum + Number(row.amount || 0), 0) + ledgerResult.filter((row) => row.type === 'Expense').reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const completedOrderIds = new Set(completedOrders.map((order) => String(order.id)));
    const costByProduct = new Map(productResult.map((product) => [String(product.id), Number(product.cost_price || 0)]));
    const costOfGoodsSold = orderItemResult.filter((item) => completedOrderIds.has(String(item.order_id))).reduce((sum, item) => sum + Number(costByProduct.get(String(item.product_id)) || 0) * Number(item.qty || 1), 0);
    const paymentTotals = completedOrders.reduce((groups, order) => { const method = order.payment_method || 'Other'; groups[method] = (groups[method] || 0) + Number(order.total_amount || 0); return groups; }, {});
    const payments = Object.entries(paymentTotals).map(([payment_method, amount]) => ({ payment_method, amount }));
    const totalRevenue = orderRevenue + manualRevenue;
    res.json({
      totalRevenue, orderRevenue, manualRevenue, totalExpense,
      costOfGoodsSold, netProfit: totalRevenue - totalExpense - costOfGoodsSold,
      avgOrderValue: completedOrders.length ? orderRevenue / completedOrders.length : 0,
      growth: 0, payments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/revenue/chart', async (req, res) => {
  try {
    const orderScope = businessScope('orders', req);
    const where = orderScope.clause ? `WHERE ${orderScope.clause} AND order_status IN ('Shipped', 'Delivered', 'Received')` : "WHERE order_status IN ('Shipped', 'Delivered', 'Received')";
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
      res.status(503).send('Frontend build is missing. Build locally with npm run build, upload frontend/dist to this server, then restart the Node.js application.');
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

app.put('/api/products/:id/investor', async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const investorId = req.body.investor_id ? Number(req.body.investor_id) : null;
    if (!productId) return res.status(400).json({ message: 'Product ID required' });
    await pool.query('UPDATE products SET investor_id = ? WHERE id = ?', [investorId, productId]);
    res.json({ ok: true, investor_id: investorId });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/investors/:id', async (req, res) => {
  try {
    const investorId = Number(req.params.id);
    if (!investorId) return res.status(400).json({ message: 'Investor ID required' });
    const scope = businessScope('investors', req);
    const where = scope.clause ? `AND ${scope.clause}` : '';
    const [rows] = await pool.query(`SELECT * FROM investors WHERE id = ? ${where} LIMIT 1`, [investorId, ...scope.params]);
    if (!rows.length) return res.status(404).json({ message: 'Investor not found' });
    const { password, password_hash, ...safeInvestor } = rows[0];
    res.json(safeInvestor);
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/investors/:id/products', async (req, res) => {
  try {
    const investorId = Number(req.params.id);
    if (!investorId) return res.status(400).json({ message: 'Investor ID required' });
    const scope = businessScope('products', req);
    const filters = ['investor_id = ?'];
    const params = [investorId];
    if (scope.clause) { filters.push(scope.clause); params.push(...scope.params); }
    const [rows] = await pool.query(`SELECT * FROM products WHERE ${filters.join(' AND ')} ORDER BY created_at DESC`, params);
    res.json({ rows, total: rows.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

// Mobile-app ready investor API. The signed token, rather than a client-supplied
// investor id, decides which records can be accessed.
app.get('/api/investor/me/dashboard', requireInvestor, async (req, res) => {
  try {
    const investorId = req.investorAuth.sub;
    const businessId = req.investorAuth.businessId || DEFAULT_BUSINESS_ID;
    const [[investor]] = await pool.query('SELECT * FROM investors WHERE id = ? AND business_id = ? LIMIT 1', [investorId, businessId]);
    if (!investor) return res.status(404).json({ message: 'Investor account not found.' });
    const [products] = await pool.query('SELECT * FROM products WHERE investor_id = ? AND business_id = ? ORDER BY created_at DESC', [investorId, businessId]);
    const [stock] = await pool.query("SELECT *, CASE WHEN quantity <= 0 THEN 'Out' WHEN quantity <= reorder_level THEN 'Low' ELSE 'In Stock' END AS status FROM stock WHERE investor_id = ? AND business_id = ? ORDER BY product_name ASC", [investorId, businessId]);
    const [orders] = await pool.query('SELECT * FROM orders WHERE investor_id = ? AND business_id = ? ORDER BY created_at DESC LIMIT 100', [investorId, businessId]);
    const stockUnits = stock.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
    const sales = orders.reduce((sum, row) => sum + Number(row.total_amount || 0), 0);
    const { password, password_hash, ...profile } = investor;
    res.json({
      profile,
      summary: {
        assignedProducts: products.length,
        stockUnits,
        sales,
        investment: Number(investor.investment_amount || 0),
        profitLoss: sales - Number(investor.investment_amount || 0)
      },
      products,
      stock,
      orders
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/investor/me/products', requireInvestor, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE investor_id = ? AND business_id = ? ORDER BY created_at DESC', [req.investorAuth.sub, req.investorAuth.businessId || DEFAULT_BUSINESS_ID]);
    res.json({ rows, total: rows.length });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/customers/register', async (req, res) => {
  try {
    const required = requireFields(req.body, ['name', 'username', 'password']);
    if (required) return res.status(400).json({ message: required });
    const username = String(req.body.username).trim();
    const email = req.body.email ? normalizeEmail(req.body.email) : null;
    const phone = req.body.phone ? String(req.body.phone).trim() : null;
    const isEmail = /^\S+@\S+\.\S+$/.test(username);
    const isPhone = /^[+\d][\d\s()-]{6,19}$/.test(username);
    if (!isEmail && !isPhone) return res.status(400).json({ message: 'Please enter a valid email address or contact number.' });
    if (String(req.body.password).length < 6) return res.status(400).json({ message: 'Password must contain at least 6 characters.' });
    const [existing] = isEmail
      ? await pool.query('SELECT id FROM customers WHERE username = ? OR email = ? LIMIT 1', [username.toLowerCase(), email || username.toLowerCase()])
      : await pool.query('SELECT id FROM customers WHERE username = ? OR phone = ? LIMIT 1', [username, phone || username]);
    if (existing.length) return res.status(409).json({ message: 'Customer account already exists' });
    const [result] = await pool.query(
      'INSERT INTO customers (business_id, name, username, password_hash, email, phone, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [DEFAULT_BUSINESS_ID, req.body.name, isEmail ? username.toLowerCase() : username, hashPassword(req.body.password), email, phone, 'Active']
    );
    res.status(201).json({ id: result.insertId, name: req.body.name, username, email, phone, status: 'Active' });
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
