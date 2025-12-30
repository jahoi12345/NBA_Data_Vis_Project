import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/NBA_Data_Vis_Project/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@arcgis/core']
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        // Ensure assets don't start with underscore (GitHub Pages ignores them)
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
      external: []
    }
  }
})
