import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: 'public',
  server: {
    port: 5173,
    host: 'localhost',
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})