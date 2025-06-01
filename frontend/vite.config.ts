import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({mode}) => {
  const config = loadEnv(mode,'./')
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      cors: true
    }
  }
});
