# Apexiums_super_store

React + Node.js + Express + MySQL admin panel for Apexiums ecommerce store.

## Project structure

```
app.js                 Hostinger production entry point
backend/server.js      Express API, database setup, and uploaded assets
backend/uploads/       Runtime uploads (not application source)
frontend/src/          React storefront and admin UI source
frontend/dist/         Generated Vite output (ignored; run npm run build)
```

The React application is the source of truth for storefront and admin routes.
The legacy standalone build/archive directories are intentionally ignored and
should not be committed. Local mock data is a development fallback only; set
the MySQL environment variables to use the production database.

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

Create local `.env` (do not commit it; use `.env.example` as the template):

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=apexiums-ecommerce
DB_USER=root
DB_PASSWORD=your_password_here
PORT=5000
```

For Hostinger, set these variables in the Node.js application's environment settings. The production values must not be pushed to GitHub.

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

## Investor mobile API

Investor login returns a signed bearer token. Store it securely in the mobile app
and send it in the `Authorization` header; do not send an investor ID from the
client to choose the account.

```http
POST /api/auth/login
Content-Type: application/json

{ "username": "Investor", "password": "your-password" }
```

```http
GET /api/investor/me/dashboard
Authorization: Bearer <token>
```

The dashboard response includes the authenticated investor's `profile`,
`summary`, assigned `products`, `stock`, and `orders`. A product-only endpoint
is also available at `GET /api/investor/me/products` with the same bearer token.
The backend derives the investor and business scopes from the signed token.

## Admin Modules

Dashboard, Banners, Adds, Categories, Stock, Orders, Returns, Staff, Customers, Product Listing, Expense, Whole Sellers, Revenue, and Notifications are included with reusable tables, filters, stats, modals, pagination, loading states, empty states, status badges, and toast notifications.

The backend auto-creates the MySQL database/tables on startup when the configured MySQL user has permission.
