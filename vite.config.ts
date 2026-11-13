import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
  server: {
    proxy: {
      // Local blog dev server (npm run dev in blog.adamschaal.com)
      '/blog-feed': {
        target: 'http://localhost:8080',
        rewrite: (path) => path.replace(/^\/blog-feed/, ''),
      },
    },
  },
})
