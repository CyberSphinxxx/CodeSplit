import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Monaco Editor chunk - Large dependency (~3-4MB)
          if (id.includes('node_modules/monaco-editor') || id.includes('node_modules/@monaco-editor')) {
            return 'monaco-editor';
          }

          // Firebase chunk - Database and auth SDK
          if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
            return 'firebase';
          }

          // Vendor chunk - Core React libraries and Framer Motion
          if (
            id.includes('node_modules/react') ||
            id.includes('node_modules/react-dom') ||
            id.includes('node_modules/framer-motion')
          ) {
            return 'vendor';
          }
        },
      },
    },
  },
  // Exclude Monaco from Vite's dependency optimization
  // This allows it to be loaded from CDN instead
  optimizeDeps: {
    exclude: ['monaco-editor']
  }
})
