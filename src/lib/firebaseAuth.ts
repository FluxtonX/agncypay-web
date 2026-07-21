import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { AccountType } from "../types/workspace";

export interface FirestoreUser {
  uid: string;
  email: string;
  fullName: string;
  accountType: AccountType;
  workspaceName: string;
  agencyId: string;
  createdAt: string;
  parentAgencyEmail?: string;
  parentAgencyUid?: string;
}

const USERS_COLLECTION = "users";

// Helper to generate a random Agency/Org ID
function generateOrgId(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

// Register user in Firebase Auth and Firestore Users collection
export async function registerWithFirebase(
  email: string,
  password: string,
  fullName: string,
  accountType: AccountType,
  workspaceName: string
): Promise<FirestoreUser> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;
    const normalizedEmail = email.trim().toLowerCase();

    // Generate agencyId/identifier depending on user type
    const prefix = accountType === "brand" ? "BRND" : accountType === "agency" ? "AGY" : "TAL";
    const agencyId = generateOrgId(prefix);

    const userProfile: FirestoreUser = {
      uid,
      email: normalizedEmail,
      fullName: fullName.trim(),
      accountType,
      workspaceName: workspaceName.trim(),
      agencyId,
      createdAt: new Date().toISOString()
    };

    // Save profile to Firestore
    const docRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(docRef, userProfile);

    return userProfile;
  } catch (error) {
    console.error("Error registering user with Firebase:", error);
    throw error;
  }
}

// Log in user and fetch Firestore profile
export async function loginWithFirebase(
  email: string,
  password: string
): Promise<FirestoreUser | null> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Fetch profile from Firestore
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as FirestoreUser;
    }
    
    // In case the Firestore doc is missing, create a basic fallback profile
    const normalizedEmail = email.trim().toLowerCase();
    const fallbackProfile: FirestoreUser = {
      uid,
      email: normalizedEmail,
      fullName: normalizedEmail.split("@")[0].toUpperCase(),
      accountType: "brand",
      workspaceName: "AgncyPay Workspace",
      agencyId: generateOrgId("BRND"),
      createdAt: new Date().toISOString()
    };
    
    await setDoc(docRef, fallbackProfile);
    return fallbackProfile;
  } catch (error) {
    console.error("Error logging in user with Firebase:", error);
    throw error;
  }
}

// Sign out from Firebase Auth
export async function logoutWithFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out with Firebase:", error);
    throw error;
  }
}

// Send password reset email
export async function resetPasswordWithFirebase(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email with Firebase:", error);
    throw error;
  }
}

export interface FormattedAuthError {
  field: "email" | "password" | "role" | "general";
  message: string;
}

/**
 * Formats raw Firebase Auth errors into clear, professional, user-friendly messages.
 */
export function parseAuthError(error: any): FormattedAuthError {
  const code: string = error?.code || "";
  const rawMsg: string = error?.message || "";

  // 1. Password Errors
  if (
    code === "auth/wrong-password" ||
    code === "auth/invalid-password"
  ) {
    return {
      field: "password",
      message: "Incorrect password. Please verify your password and try again."
    };
  }

  // 2. Firebase v10+ invalid-credential (frequently returned for wrong password or invalid auth credentials)
  if (code === "auth/invalid-credential") {
    return {
      field: "password",
      message: "Invalid password or login credentials. Please verify your password and try again."
    };
  }

  if (code === "auth/weak-password") {
    return {
      field: "password",
      message: "Password is too weak. Minimum 6 characters required."
    };
  }

  // 3. Email Errors
  if (
    code === "auth/user-not-found" ||
    code === "auth/email-not-found"
  ) {
    return {
      field: "email",
      message: "No account registered with this email address. Please check your spelling or register."
    };
  }

  if (code === "auth/invalid-email") {
    return {
      field: "email",
      message: "The email address format is invalid. Please enter a valid email address."
    };
  }

  if (
    code === "auth/email-already-in-use" ||
    code === "auth/email-already-exists"
  ) {
    return {
      field: "email",
      message: "An account with this email address already exists. Please log in instead."
    };
  }

  if (code === "auth/user-disabled") {
    return {
      field: "email",
      message: "This account has been disabled. Please contact AgncyPay support."
    };
  }

  // 4. Rate-Limiting & Network Errors
  if (code === "auth/too-many-requests") {
    return {
      field: "general",
      message: "Access temporarily blocked due to multiple failed login attempts. Please reset your password or try again later."
    };
  }

  if (code === "auth/network-request-failed") {
    return {
      field: "general",
      message: "Network connection error. Please check your internet connection and try again."
    };
  }

  // 5. Role mismatch / custom error messages
  if (rawMsg.toLowerCase().includes("role") || rawMsg.toLowerCase().includes("mismatch")) {
    return {
      field: "role",
      message: rawMsg
    };
  }

  // Fallback clean message (stripping raw "Firebase: Error (...)" text)
  const cleanMsg = rawMsg
    .replace(/^Firebase:\s*/i, "")
    .replace(/\s*\(auth\/.*\)\.?$/i, "")
    .trim();

  return {
    field: "general",
    message: cleanMsg || "Authentication failed. Please check your credentials and try again."
  };
}

