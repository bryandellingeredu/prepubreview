import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  base: '/prepubreview',
  build:{
    outDir: '../API/wwwroot'
  },
  server:{
    https: {
      key: fs.readFileSync('./localhost+2-key.pem'),
      cert: fs.readFileSync('./localhost+2.pem'),
    },
   port: 3000
  },
  plugins: [react()],
})
