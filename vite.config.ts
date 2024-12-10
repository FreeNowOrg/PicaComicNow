import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

const PROD = process.env.NODE_ENV === 'production'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  esbuild: {
    drop: PROD ? ['console'] : [],
  },
  server: {
    host: true,
  },
})
