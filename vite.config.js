import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {},
    // Thêm dòng này để cho phép ngrok
    allowedHosts: ['.ngrok-free.dev'],
  },
  base: '/ui',
})