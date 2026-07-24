# Apexiums_super_store

React + Node.js admin panel for Apexiums ecommerce store.

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

Frontend only:

```bash
npm run dev
```

Backend only:

```bash
npm run server
```

Frontend + backend together:

```bash
npm run dev:all
```

Frontend URL: `http://localhost:5173`

Backend health check: `http://localhost:5000/api/health`

Database check: `http://localhost:5000/api/db-check`
