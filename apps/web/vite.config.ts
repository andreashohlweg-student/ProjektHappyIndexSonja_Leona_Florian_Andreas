import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins:[react()],
  server:{port:5173,strictPort:true,host:'0.0.0.0',
    watch:{usePolling:process.env.CHOKIDAR_USEPOLLING === 'true',interval:300},
    proxy:{'/api':{target:process.env.API_PROXY_TARGET ?? 'http://127.0.0.1:3001',changeOrigin:true}}},
});
