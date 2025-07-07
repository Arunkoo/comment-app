import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/auth': 'http://app:3000',
      '/comments': 'http://app:3000',
      '/notifications': 'http://app:3000',
    },
  },
});
