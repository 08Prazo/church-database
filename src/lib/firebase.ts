import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import appletConfig from '../../firebase-applet-config.json';

// Default embedded project config ensures zero-config builds on Netlify or custom hosts
const fallbackConfig = {
  projectId: 'resonant-anagram-5zp2g',
  appId: '1:1068026986772:web:1d36241bbb608a25ff0201',
  apiKey: 'AIzaSyCQdalJmiKWLxYFUQr_brJZOqY8_FcsOIc',
  authDomain: 'resonant-anagram-5zp2g.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-5ba0fae2-6fe9-4bee-be86-0ae4612e16b0',
  storageBucket: 'resonant-anagram-5zp2g.firebasestorage.app',
  messagingSenderId: '1068026986772',
};

// Safe lookup for environment variables in both browser and bundler environments
const getEnvVar = (viteKey: string, processKey?: string): string => {
  const viteVal = (import.meta.env as any)?.[viteKey];
  if (viteVal && typeof viteVal === 'string' && viteVal.trim() !== '') {
    return viteVal.trim();
  }
  if (processKey && typeof process !== 'undefined' && process.env) {
    const procVal = process.env[processKey];
    if (procVal && typeof procVal === 'string' && procVal.trim() !== '') {
      return procVal.trim();
    }
  }
  return '';
};

// Flexible API key resolution supporting standard Netlify environment variables:
// - VITE_FIREBASE_API_KEY
// - FIREBASE_API_KEY
// - VITE_API_KEY
// - API_KEY
const resolvedApiKey =
  getEnvVar('VITE_FIREBASE_API_KEY', 'FIREBASE_API_KEY') ||
  getEnvVar('VITE_API_KEY', 'API_KEY') ||
  appletConfig?.apiKey ||
  fallbackConfig.apiKey;

const firebaseConfig = {
  apiKey: resolvedApiKey,
  authDomain:
    getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'FIREBASE_AUTH_DOMAIN') ||
    appletConfig?.authDomain ||
    fallbackConfig.authDomain,
  projectId:
    getEnvVar('VITE_FIREBASE_PROJECT_ID', 'FIREBASE_PROJECT_ID') ||
    appletConfig?.projectId ||
    fallbackConfig.projectId,
  storageBucket:
    getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'FIREBASE_STORAGE_BUCKET') ||
    appletConfig?.storageBucket ||
    fallbackConfig.storageBucket,
  messagingSenderId:
    getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_MESSAGING_SENDER_ID') ||
    appletConfig?.messagingSenderId ||
    fallbackConfig.messagingSenderId,
  appId:
    getEnvVar('VITE_FIREBASE_APP_ID', 'FIREBASE_APP_ID') ||
    appletConfig?.appId ||
    fallbackConfig.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

const databaseId =
  getEnvVar('VITE_FIREBASE_DATABASE_ID', 'FIREBASE_DATABASE_ID') ||
  appletConfig?.firestoreDatabaseId ||
  fallbackConfig.firestoreDatabaseId ||
  '(default)';

export const db = getFirestore(app, databaseId);
