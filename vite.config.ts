
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // 将 build 时的环境变量注入到前端
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
