import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/prompts': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api\/prompts/, '/prompts'),
        changeOrigin: true,
      },
      '/api/reviews': {
        target: 'http://localhost:8001',
        rewrite: (path) => path.replace(/^\/api\/reviews/, '/reviews'),
        changeOrigin: true,
      },
    },
  },
})