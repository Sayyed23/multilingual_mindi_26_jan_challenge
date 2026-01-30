import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

/// <reference types="vitest" />

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Ensure manifest.json and service worker are copied to dist
    rollupOptions: {
      input: {
        main: './index.html',
      }
    },
    // Copy service worker to root of dist
    assetsDir: 'assets',
  },
  server: {
    // Enable HTTPS for PWA testing in development
    // https: true, // Uncomment for HTTPS in development
    port: 3000,
    host: true
  },
  // PWA-related settings
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  // Ensure service worker is served correctly
  publicDir: 'public',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/services/__tests__/setup.ts'],
  }
})
