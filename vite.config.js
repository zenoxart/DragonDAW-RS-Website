import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: './', // relative paths so dist/ can be hosted from any folder or subpath
  build: {
    rollupOptions: {
      // Two pages: the site (/) and the imprint (/impressum/)
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        impressum: resolve(import.meta.dirname, 'impressum/index.html'),
      },
    },
  },
})
