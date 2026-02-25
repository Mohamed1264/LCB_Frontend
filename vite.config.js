import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  theme: {
    extend: {
      fontFamily: {
        // اختر خط عربي مناسب مثل Tajawal أو Cairo
        sans: ['Tajawal', 'sans-serif'],
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
        proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})
