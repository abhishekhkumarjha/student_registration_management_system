import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    server: {
      proxy: {
        '/api': {
          target: process.env.VITE_PHP_API_TARGET || 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
      },
    },
  };
});
