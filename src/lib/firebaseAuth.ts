import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { AccountType, Profile } from "./types";

/** The `users/{uid}` document. Kept under its original name for existing callers. */
export type FirestoreUser = Profile;

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
  workspaceName: string,
  extra: Partial<Profile> = {}
): Promise<FirestoreUser> {
  try {
    const normalizedEmail = email.trim().toLowerCase();
    // Signed in already but without a profile (an unfinished sign-up): finish it on this login.
    const current = auth.currentUser;
    const uid =
      current && current.email?.toLowerCase() === normalizedEmail
        ? current.uid
        : (await createUserWithEmailAndPassword(auth, email, password)).user.uid;

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
      createdAt: new Date().toISOString(),
      ...extra
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

    // A missing profile is not guessed at (a wrong account type would send the person to the wrong
    // portal). The login page sends them to the register page to finish their profile instead.
    return docSnap.exists() ? (docSnap.data() as FirestoreUser) : null;
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
