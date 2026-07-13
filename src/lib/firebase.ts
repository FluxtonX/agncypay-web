import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase configuration sourced from environment variables.
 * These must be set in `.env.local` with your Firebase project values.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Check if Firebase config has valid values (not empty).
 * During SSR prerender or when env vars aren't set, we should not attempt initialization.
 */
function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId
  );
}

/**
 * Initialize Firebase app as a singleton.
 * Returns null if Firebase is not configured (env vars not set).
 * Prevents re-initialization during hot-module-reload in development.
 */
let app: FirebaseApp | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured()) {
    return null;
  }

  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }

  return app;
}

/**
 * Firebase Auth instance — used for all authentication operations.
 * Returns null if Firebase is not configured.
 */
export function getFirebaseAuth(): Auth | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  return getAuth(firebaseApp);
}

/**
 * Firestore instance — used for storing user profiles, onboarding state,
 * and future workspace/transaction data.
 * Returns null if Firebase is not configured.
 */
export function getFirebaseDb(): Firestore | null {
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  return getFirestore(firebaseApp);
}

/**
 * Convenience getters that throw if Firebase is not configured.
 * Use these in contexts where Firebase MUST be available (client-side auth flows).
 */
export function requireAuth(): Auth {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error(
      "Firebase is not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables in .env.local"
    );
  }
  return auth;
}

export function requireDb(): Firestore {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error(
      "Firebase is not configured. Please set NEXT_PUBLIC_FIREBASE_* environment variables in .env.local"
    );
  }
  return db;
}

/** Check if Firebase is configured and ready to use. */
export { isFirebaseConfigured };

export default getFirebaseApp;
