import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy cho authentication API
      '/api/auth': {
        target: 'https://ai-api.bitech.vn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, '/api/auth') // Giữ nguyên nếu backend cần prefix
      },
      // Proxy cho user management API
      '/api/manager': {
        target: 'https://ai-api.bitech.vn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/manager/, '/api/manager')
      },
      // Proxy cho agent-list API (cho folders/list)
      '/agent-list/api': {
        target: 'https://ai-api.bitech.vn',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/agent-list\/api/, '/agent-list/api')
      },
      // Proxy cho RAG document API (nếu cần)
      '/api/documents': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/documents/, '/api/documents')
      },
      // Proxy cho RAG vector API (nếu cần)
      '/api/vector': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/vector/, '/api/vector')
      }
    }
  }
})
