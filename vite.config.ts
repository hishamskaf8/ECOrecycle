import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // يضمن هذا السطر أن Vite سيبحث عن المفتاح في متغيرات البيئة أثناء البناء
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    port: 3000
  }
});