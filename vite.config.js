import { defineConfig } from 'vite'

export default defineConfig({
  root: 'frontend',
  server: {
    port: 5173,
    host: true,
  proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: '../dist',
  },
  optimizeDeps: {
    exclude: ['@supabase/supabase-js'],
  },
})
