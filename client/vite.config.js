import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

<reference types="vitest" />

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: [
      'bookwormfront.onrender.com' 
    ]
  },
  test: {
    globals: true,          
    environment: 'jsdom',   
    setupFiles: './src/setupTests.js', 
    coverage: {
      reporter: ['text', 'json', 'html'], 
    },
  },
})
