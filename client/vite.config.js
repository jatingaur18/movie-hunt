import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    proxy:{'/api': 'https://movie-hunt-chi.vercel.app',},
  },
  plugins: [react()],
  optimizeDeps: {
    include: ["react-transition-group"],
  },
})

