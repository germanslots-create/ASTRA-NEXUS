import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Clean environment variables (strip whitespace and handle "undefined" strings from Netlify)
const cleanVar = (val: any) => {
  if (typeof val !== 'string') return undefined;
  const cleaned = val.trim();
  return (cleaned === '' || cleaned === 'undefined') ? undefined : cleaned;
};

// Extra cleaning for IDs to remove common URL suffixes, whitespace, or placeholder strings
const cleanId = (id: string | undefined) => {
  if (!id) return undefined;
  const cleaned = id.replace('.firebaseapp.com', '').replace('.web.app', '').replace('.appspot.com', '').trim();
  // If the user explicitly wrote "(default)", we treat it as undefined for the SDK 
  // to ensure it uses the standard default database properly.
  return (cleaned === '(default)' || cleaned === 'default') ? undefined : cleaned;
};

// Try to load local config if available (AI Studio context)
let localConfig: any = {};
try {
  const localConfigs = import.meta.glob('../../firebase-applet-config.json', { eager: true });
  localConfig = Object.values(localConfigs)[0] ? (Object.values(localConfigs)[0] as any).default : {};
} catch (e) {
  console.warn("Firebase: No local config file found.");
}

// --- CONFIG MERGING STRATEGY ---
const envPid = cleanVar(import.meta.env.VITE_FIREBASE_PROJECT_ID);
const localPid = localConfig.projectId;

// Use Netlify Env Var if present, otherwise fallback to local auto-provisioned file
const finalPid = envPid || localPid;

const firebaseConfig = {
  apiKey: (envPid ? cleanVar(import.meta.env.VITE_FIREBASE_API_KEY) : null) || localConfig.apiKey || cleanVar(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: (envPid ? cleanVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) : null) || localConfig.authDomain || cleanVar(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: finalPid,
  storageBucket: (envPid ? cleanVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) : null) || localConfig.storageBucket || cleanVar(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: (envPid ? cleanVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) : null) || localConfig.messagingSenderId || cleanVar(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: (envPid ? cleanVar(import.meta.env.VITE_FIREBASE_APP_ID) : null) || localConfig.appId || cleanVar(import.meta.env.VITE_FIREBASE_APP_ID),
  firestoreDatabaseId: (envPid ? cleanId(cleanVar(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID)) : null) || cleanId(localConfig.firestoreDatabaseId) || cleanId(cleanVar(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID)),
};

const pid = firebaseConfig.projectId;
const dbId = firebaseConfig.firestoreDatabaseId;

console.log("🔥 Firebase Configuration Source 🔥", {
  isNetlifyEnv: !!envPid,
  isLocalFile: !!localPid,
  finalProjectId: pid,
  finalDatabaseId: dbId || "(default)"
});

if (envPid && localPid && envPid !== localPid) {
  console.warn("⚠️ PROJECT ID CONFLICT: Environment has " + envPid + " but local file has " + localPid + ". USING ENVIRONMENT VARIABLE.");
}

if (!pid) {
  console.error("Firebase: Missing Project ID. Ensure firebase-applet-config.json exists or VITE_FIREBASE_PROJECT_ID is set.");
}

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use specified database ID
// We already have dbId from firebaseConfig.firestoreDatabaseId above
export const db = getFirestore(app, dbId || undefined);

export const storage = getStorage(app);

// Connectivity check
(async () => {
  if (!pid) return;
  try {
    await getDocFromServer(doc(db, '_health_check_', 'ping'));
    console.log("✅ Firebase Connected.");
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.log("ℹ️ Firebase Connected (ACL Secured).");
    } else {
      console.error("❌ Firebase Connection Error:", error.code, error.message);
      if (error.code === 'unavailable') {
        console.warn("Possible Root Causes:");
        console.warn("1. Wrong Database ID? Current:", dbId || "(default)");
        console.warn("2. Database not yet provisioned in Firebase Console?");
        console.warn("3. Project ID / App ID mismatch?");
      }
    }
  }
})();

