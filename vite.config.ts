import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'index.html')
    },
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 5173,
    host: 'localhost',
    open: true
  }
})