import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Clean environment variables
const cleanVar = (val: any) => {
  if (typeof val !== 'string') return undefined;
  const cleaned = val.trim();
  return (cleaned === '' || cleaned === 'undefined') ? undefined : cleaned;
};

// Handle Database ID cleaning
const cleanDbId = (id: string | undefined) => {
  if (!id) return undefined;
  const cleaned = id.trim();
  return (cleaned === '(default)' || cleaned === 'default' || cleaned === '') ? undefined : cleaned;
};

// Basic Firebase configuration from environment
// We prioritize VITE_ variables as they are injected by Netlify
const firebaseConfig = {
  apiKey: cleanVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: cleanVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: cleanVar(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: cleanVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanVar(import.meta.env.VITE_FIREBASE_APP_ID),
};

const dbId = cleanDbId(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID);

// Singleton Pattern for App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Singleton Pattern for Auth
export const auth = getAuth(app);

// Singleton Pattern for Firestore to prevent "Unexpected state" errors
let firestoreDb: any;
try {
  // Try to get existing instance (works during HMR)
  firestoreDb = getFirestore(app, dbId || undefined);
} catch (e) {
  // If no instance exists or it fails, initialize it
  firestoreDb = initializeFirestore(app, {}, dbId || undefined);
}

export const db = firestoreDb;
export const storage = getStorage(app);

// Debug Log for the user (visible in browser console)
console.log("🚀 Astra Nexus Firebase Status:", {
  projectId: firebaseConfig.projectId || "MISSING",
  databaseId: dbId || "(default)",
  authReady: !!auth,
  dbReady: !!db
});


