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

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig?.apiKey || fallbackConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig?.authDomain || fallbackConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig?.projectId || fallbackConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig?.storageBucket || fallbackConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig?.messagingSenderId || fallbackConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig?.appId || fallbackConfig.appId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

const databaseId =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  appletConfig?.firestoreDatabaseId ||
  fallbackConfig.firestoreDatabaseId ||
  '(default)';

export const db = getFirestore(app, databaseId);
