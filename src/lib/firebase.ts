import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Default configuration with environment variable override support
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCQdalJmiKWLxYFUQr_brJZOqY8_FcsOIc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'resonant-anagram-5zp2g.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resonant-anagram-5zp2g',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'resonant-anagram-5zp2g.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1068026986772',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1068026986772:web:1d36241bbb608a25ff0201'
};

const firestoreDbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-5ba0fae2-6fe9-4bee-be86-0ae4612e16b0';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Initialize firestore with specific database ID if supported
  try {
    db = getFirestore(app, firestoreDbId);
  } catch {
    db = getFirestore(app);
  }
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.warn('Firebase initialization notice (running with safe local storage fallback):', err);
}

export { app, auth, db, googleProvider };
