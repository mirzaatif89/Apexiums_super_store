# Apexiums_super_store

React + Node.js + Express + MySQL admin panel for Apexiums ecommerce store.

## Hostinger deployment

- Runtime: Node.js 20.19 or newer
- Build command: `npm run build`
- Start command: `npm start`
- Entry file: `app.js`
- The application listens on Hostinger's `PORT` and binds to `0.0.0.0`.
- Add all variables from `.env.example` in hPanel, using the real Hostinger MySQL host, database, user, password, and a strong admin password.
- Do not set a custom `PORT` in hPanel unless Hostinger explicitly requires it; the platform-provided port takes precedence.

This is a Node.js/React application, not a PHP/Laravel site. Do not deploy it as a PHP site directly into `public_html` and do not add a Laravel `.htaccess` rewrite. In Hostinger, create a Node.js application, set the application root to the repository root, set the startup file to `app.js`, and use `npm install` followed by `npm run build`. The app serves the built React frontend and API from the Node.js process.

## Setup

```bash
npm install
```

Create local `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apexiums-ecommerce
DB_USER=root
DB_PASSWORD=your_password_here
PORT=5000
```

## Run

Full app with one command:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

The React frontend calls backend APIs through Vite proxy, for example `/api/banners`.

Backend only:

```bash
npm run server
```

Frontend only:

```bash
npm run client
```

Production style run:

```bash
npm run build
npm start
```

Production URL: `http://localhost:5000`

Backend health check: `http://localhost:5000/api/health`

Database check: `http://localhost:5000/api/db-check`

## Admin Modules

Dashboard, Banners, Adds, Categories, Stock, Orders, Returns, Staff, Customers, Product Listing, Expense, Whole Sellers, Revenue, and Notifications are included with reusable tables, filters, stats, modals, pagination, loading states, empty states, status badges, and toast notifications.

The backend auto-creates the MySQL database/tables on startup when the configured MySQL user has permission.
