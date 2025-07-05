import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), visualizer({ open: true })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './setupTests.ts',
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Agrupa TODO lo relacionado con React (react, react-dom, framer-motion, router, lucide, heroicons)
            const reactLibs = ['react', 'react-dom', 'react-router-dom', 'framer-motion', 'lucide-react', '@heroicons', '@headlessui']
            if (reactLibs.some((lib) => id.includes(lib))) return 'vendor-react'

            if (id.includes('redux') || id.includes('@reduxjs/toolkit')) return 'vendor-redux'
            if (id.includes('zod')) return 'vendor-zod'
            if (id.includes('lodash')) return 'vendor-lodash'
            if (id.includes('crypto-js')) return 'vendor-crypto'

            if (id.includes('pdfkit')) return 'vendor-pdfkit'
            if (id.includes('fontkit')) return 'vendor-fontkit'
            if (id.includes('react-pdf')) return 'vendor-react-pdf'

            if (id.includes('chart.js') || id.includes('react-chartjs-2')) return 'vendor-charts'
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('@heroui')) return 'vendor-heroui'

            const compressionLibs = ['pako', 'base64-js', 'fflate', 'brotli', 'inflate', 'deflate', 'stream']
            if (compressionLibs.some((lib) => id.includes(lib))) return 'vendor-compression'

            return 'vendor' // Todo lo demás
          }
        }
      }
    }
  }
})
