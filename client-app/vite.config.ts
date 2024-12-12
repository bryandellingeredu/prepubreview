import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: '/prepubreview',
  build:{
    outDir: '../API/wwwroot'
  },
  server:{
   port: 3000
  },
  plugins: [react()],
})
