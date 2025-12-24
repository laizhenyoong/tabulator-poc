import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: process.env.NODE_ENV === 'development' ? 'demo' : '.',
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'AdvancedDataTable',
      fileName: (format) => `advanced-data-table.${format}.js`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})