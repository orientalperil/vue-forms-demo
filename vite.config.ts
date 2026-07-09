import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

// Vite 8 (Rolldown-based). Node 20.19+ / 22.12+ required.
export default defineConfig({
  plugins: [
    vue(),
    // Treeshakes Vuetify components and auto-imports the styles for the ones used.
    vuetify({ autoImport: true }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Example proxy if you later point the app at a real Django/DRF server.
    // Comment the mock client in src/shared/api.js and use this instead.
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:8000',
    //     changeOrigin: true,
    //   },
    // },
  },
})
