import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    allowedHosts: true,
    proxy: {
      '/api/prompts': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api\/prompts/, '/prompts'),
        changeOrigin: true,
      },
      '/api/chats': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api\/chats/, '/chats'),
        changeOrigin: true,
      },
      '/api/jobs': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api\/jobs/, '/jobs'),
        changeOrigin: true,
      },
      '/api/reviews': {
        target: 'http://localhost:8001',
        rewrite: (path) => path.replace(/^\/api\/reviews/, '/reviews'),
        changeOrigin: true,
      },
      '/api/files': {
        target: 'http://localhost:8003',
        rewrite: (path) => path.replace(/^\/api\/files/, '/files'),
        changeOrigin: true,
      },
    },
  },
})