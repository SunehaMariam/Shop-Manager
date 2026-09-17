import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev me /api calls seedha backend par chali jati hain
      '/api': { target: 'http://localhost:5000', changeOrigin: true }
    }
  }
});
