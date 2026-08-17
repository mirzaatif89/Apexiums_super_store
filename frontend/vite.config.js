import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: 'frontend',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all'
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        dashboard: 'dashboard.html',
        products: 'products.html',
        categories: 'categories.html',
        orders: 'orders.html',
        customers: 'customers.html',
        settings: 'settings.html'
      }
    }
  }
});
