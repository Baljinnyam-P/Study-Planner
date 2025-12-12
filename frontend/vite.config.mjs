// -------------------------------------------------------------
// Why: This file configures Vite as the frontend build tool and dev server.
//   - Centralizes build and plugin settings for maintainability.
//   - Supports modern JavaScript and React features out of the box.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  css: {
    postcss: './postcss.config.js',
  },
})
