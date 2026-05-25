import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Configuration personnalisée du rechargement à chaud (HMR)
      hmr: process.env.DISABLE_HMR !== 'true',
      // Optimisation des ressources système pour l'écoute des fichiers
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
