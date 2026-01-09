
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 确保在构建时 process.env 不会导致浏览器崩溃
    'process.env': {}
  }
});
