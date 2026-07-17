import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  getDoc,
  where
} from "firebase/firestore";
import { db } from "./firebase";
import { FirestoreUser } from "./firebaseAuth";

export interface FirestoreInvoice {
  id: string;
  campaign: string;
  agency: string;
  agencyEmail: string;
  agencyUid?: string;
  talent: string;
  talentEmail: string;
  brandName: string;
  brandEmail: string;
  amount: number;
  due: string;
  status: "pending" | "paid";
  talentPayoutStatus: "pending" | "disbursed";
  createdDate: string;
  createdAt?: any;
  payerId: string;
  payerEmail: string;
  payerAddress: string[];
}

const INVOICES_COLLECTION = "invoices";

// Create a new invoice document
export async function createFirestoreInvoice(data: {
  campaign: string;
  agency: string;
  agencyEmail: string;
  agencyUid?: string;
  talent: string;
  talentEmail: string;
  brandName: string;
  brandEmail: string;
  amount: number;
  due: string;
}) {
  try {
    // Format timestamp dates
    const dateObj = new Date();
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    });
    
    // Generate a unique sequential ID
    const invoicesRef = collection(db, INVOICES_COLLECTION);
    const querySnapshot = await getDocs(invoicesRef);
    const customId = `W-INV-${String(querySnapshot.size + 1).padStart(3, "0")}`;

    const newInvoice: FirestoreInvoice = {
      id: customId,
      campaign: data.campaign,
      agency: data.agency,
      agencyEmail: data.agencyEmail.trim().toLowerCase(),
      agencyUid: data.agencyUid || "",
      talent: data.talent,
      talentEmail: data.talentEmail.trim().toLowerCase(),
      brandName: data.brandName,
      brandEmail: data.brandEmail.trim().toLowerCase(),
      amount: Number(data.amount),
      due: data.due,
      status: "pending",
      talentPayoutStatus: "pending",
      createdDate: formattedDate,
      payerId: `MB-${Math.floor(6000 + Math.random() * 3000)}`,
      payerEmail: data.brandEmail,
      payerAddress: ["Corporate Headquarters", "100 Broadway St", "New York, NY 10005"]
    };

    const docRef = doc(db, INVOICES_COLLECTION, customId);
    await setDoc(docRef, {
      ...newInvoice,
      createdAt: serverTimestamp()
    });

    return newInvoice;
  } catch (error) {
    console.error("Error creating invoice in Firestore:", error);
    throw error;
  }
}

// Subscribe to ALL invoices (no filtering — used only if explicitly needed)
export function subscribeInvoices(callback: (invoices: FirestoreInvoice[]) => void) {
  const q = query(collection(db, INVOICES_COLLECTION), orderBy("createdAt", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const list: FirestoreInvoice[] = [];
    snapshot.forEach((document) => {
      list.push(document.data() as FirestoreInvoice);
    });
    list.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });
    callback(list);
  }, (error) => {
    console.error("Error listening to Firestore updates:", error);
  });
}

// Subscribe to invoices created by a specific agency (by agencyEmail)
export function subscribeInvoicesByAgency(agencyEmail: string, callback: (invoices: FirestoreInvoice[]) => void) {
  if (!agencyEmail) {
    callback([]);
    return () => {};
  }

  const normalizedEmail = agencyEmail.trim().toLowerCase();
  const q = query(
    collection(db, INVOICES_COLLECTION),
    where("agencyEmail", "==", normalizedEmail)
  );
  
  return onSnapshot(q, (snapshot) => {
    const list: FirestoreInvoice[] = [];
    snapshot.forEach((document) => {
      list.push(document.data() as FirestoreInvoice);
    });
    list.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });
    callback(list);
  }, (error) => {
    console.error("Error listening to agency invoices:", error);
    callback([]);
  });
}

// Subscribe to invoices addressed to a specific brand (by brandEmail)
export function subscribeInvoicesByBrand(brandEmail: string, callback: (invoices: FirestoreInvoice[]) => void) {
  if (!brandEmail) {
    callback([]);
    return () => {};
  }

  const normalizedEmail = brandEmail.trim().toLowerCase();
  const q = query(
    collection(db, INVOICES_COLLECTION),
    where("brandEmail", "==", normalizedEmail)
  );
  
  return onSnapshot(q, (snapshot) => {
    const list: FirestoreInvoice[] = [];
    snapshot.forEach((document) => {
      list.push(document.data() as FirestoreInvoice);
    });
    list.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });
    callback(list);
  }, (error) => {
    console.error("Error listening to brand invoices:", error);
    callback([]);
  });
}

// Subscribe to invoices where the user is the talent (by talentEmail)
export function subscribeInvoicesByTalent(talentEmail: string, callback: (invoices: FirestoreInvoice[]) => void) {
  if (!talentEmail) {
    callback([]);
    return () => {};
  }

  const normalizedEmail = talentEmail.trim().toLowerCase();
  const q = query(
    collection(db, INVOICES_COLLECTION),
    where("talentEmail", "==", normalizedEmail)
  );
  
  return onSnapshot(q, (snapshot) => {
    const list: FirestoreInvoice[] = [];
    snapshot.forEach((document) => {
      list.push(document.data() as FirestoreInvoice);
    });
    list.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return aTime - bTime;
    });
    callback(list);
  }, (error) => {
    console.error("Error listening to talent invoices:", error);
    callback([]);
  });
}

// Update specific invoice status
export async function updateInvoiceStatus(
  id: string, 
  status: "pending" | "paid", 
  talentPayoutStatus: "pending" | "disbursed"
) {
  try {
    const docRef = doc(db, INVOICES_COLLECTION, id);
    await updateDoc(docRef, {
      status,
      talentPayoutStatus
    });
  } catch (error) {
    console.error(`Error updating invoice status for ${id}:`, error);
    throw error;
  }
}

// Fetch single invoice
export async function fetchSingleInvoice(id: string): Promise<FirestoreInvoice | null> {
  try {
    const docRef = doc(db, INVOICES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as FirestoreInvoice;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching single invoice ${id}:`, error);
    return null;
  }
}

// Fetch all registered brands from Firestore users collection
export async function getRegisteredBrands(): Promise<FirestoreUser[]> {
  try {
    const q = query(collection(db, "users"), where("accountType", "==", "brand"));
    const querySnapshot = await getDocs(q);
    const brands: FirestoreUser[] = [];
    querySnapshot.forEach((doc) => {
      brands.push(doc.data() as FirestoreUser);
    });
    return brands;
  } catch (error) {
    console.error("Error getting registered brands from Firestore:", error);
    return [];
  }
}

// Fetch all registered talents from Firestore users collection
export async function getRegisteredTalents(): Promise<FirestoreUser[]> {
  try {
    const q = query(collection(db, "users"), where("accountType", "in", ["individual", "talent_independent", "talent", "talent_agency"]));
    const querySnapshot = await getDocs(q);
    const talents: FirestoreUser[] = [];
    querySnapshot.forEach((doc) => {
      talents.push(doc.data() as FirestoreUser);
    });
    return talents;
  } catch (error) {
    console.error("Error getting registered talents from Firestore:", error);
    return [];
  }
}
