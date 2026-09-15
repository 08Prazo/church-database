import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables from process.env and .env files
  const env = loadEnv(mode, process.cwd(), '');

  // Resolve API key and Firebase settings from Netlify environment variables
  const apiKey =
    env.VITE_FIREBASE_API_KEY ||
    env.FIREBASE_API_KEY ||
    env.VITE_API_KEY ||
    env.API_KEY ||
    process.env.VITE_FIREBASE_API_KEY ||
    process.env.FIREBASE_API_KEY ||
    process.env.VITE_API_KEY ||
    process.env.API_KEY ||
    '';

  const authDomain =
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    env.FIREBASE_AUTH_DOMAIN ||
    process.env.VITE_FIREBASE_AUTH_DOMAIN ||
    process.env.FIREBASE_AUTH_DOMAIN ||
    '';

  const projectId =
    env.VITE_FIREBASE_PROJECT_ID ||
    env.FIREBASE_PROJECT_ID ||
    process.env.VITE_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    '';

  const databaseId =
    env.VITE_FIREBASE_DATABASE_ID ||
    env.FIREBASE_DATABASE_ID ||
    process.env.VITE_FIREBASE_DATABASE_ID ||
    process.env.FIREBASE_DATABASE_ID ||
    '';

  const storageBucket =
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    env.FIREBASE_STORAGE_BUCKET ||
    process.env.VITE_FIREBASE_STORAGE_BUCKET ||
    process.env.FIREBASE_STORAGE_BUCKET ||
    '';

  const messagingSenderId =
    env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    env.FIREBASE_MESSAGING_SENDER_ID ||
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
    process.env.FIREBASE_MESSAGING_SENDER_ID ||
    '';

  const appId =
    env.VITE_FIREBASE_APP_ID ||
    env.FIREBASE_APP_ID ||
    process.env.VITE_FIREBASE_APP_ID ||
    process.env.FIREBASE_APP_ID ||
    '';

  return {
    define: {
      ...(apiKey ? { 'process.env.FIREBASE_API_KEY': JSON.stringify(apiKey) } : {}),
      ...(apiKey ? { 'process.env.API_KEY': JSON.stringify(apiKey) } : {}),
      ...(apiKey ? { 'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(apiKey) } : {}),
      ...(authDomain ? { 'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(authDomain) } : {}),
      ...(projectId ? { 'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(projectId) } : {}),
      ...(databaseId ? { 'import.meta.env.VITE_FIREBASE_DATABASE_ID': JSON.stringify(databaseId) } : {}),
      ...(storageBucket ? { 'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(storageBucket) } : {}),
      ...(messagingSenderId ? { 'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(messagingSenderId) } : {}),
      ...(appId ? { 'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(appId) } : {}),
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
