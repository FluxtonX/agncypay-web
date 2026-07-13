import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
  type User,
  type UserCredential,
  type Unsubscribe,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

/**
 * Create a new user with email and password.
 * Optionally sets the user's display name via updateProfile.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");

  const credential = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName && credential.user) {
    await updateProfile(credential.user, { displayName });
  }

  return credential;
}

/**
 * Sign in an existing user with email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");

  return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Sign out the current user.
 */
export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) return;

  return signOut(auth);
}

/**
 * Send a password reset email to the specified address.
 */
export async function sendPasswordReset(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");

  return sendPasswordResetEmail(auth, email);
}

/**
 * Send an email verification link to the currently signed-in user.
 */
export async function sendVerificationEmail(): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Firebase is not configured.");

  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user to verify.");
  }
  return sendEmailVerification(user);
}

/**
 * Subscribe to Firebase auth state changes.
 * Returns an unsubscribe function.
 * If Firebase is not configured, calls the callback with null immediately.
 */
export function onAuthChange(
  callback: (user: User | null) => void
): Unsubscribe {
  const auth = getFirebaseAuth();

  if (!auth) {
    // Firebase not configured — call back with null and return no-op unsubscribe
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
}

/**
 * Get the current Firebase user synchronously (may be null if not yet resolved).
 */
export function getCurrentUser(): User | null {
  const auth = getFirebaseAuth();
  return auth?.currentUser ?? null;
}

/**
 * Check if Firebase authentication is available.
 */
export function isAuthAvailable(): boolean {
  return isFirebaseConfigured();
}

/**
 * Translate Firebase auth error codes into user-friendly messages.
 */
export function getFirebaseAuthErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    "auth/email-already-in-use": "This email is already registered. Please sign in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled. Please contact support.",
    "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/user-not-found": "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid credentials. Please check your email and password.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection and try again.",
  };

  return errorMessages[errorCode] || "An unexpected error occurred. Please try again.";
}
