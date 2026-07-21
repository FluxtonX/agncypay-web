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
  where,
  deleteDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { FirestoreUser } from "./firebaseAuth";

export interface InvoiceSplit {
  talentName: string;
  talentEmail: string;
  amount: number;
  status: "pending" | "disbursed";
}

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
  splits?: InvoiceSplit[];
  talentEmails?: string[];
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
  splits?: InvoiceSplit[];
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
      payerAddress: ["Corporate Headquarters", "100 Broadway St", "New York, NY 10005"],
      splits: data.splits || [],
      talentEmails: data.splits && data.splits.length > 0
        ? data.splits.map(s => s.talentEmail.trim().toLowerCase())
        : [data.talentEmail.trim().toLowerCase()]
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
    where("talentEmails", "array-contains", normalizedEmail)
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

// Update specific invoice status and execute payout balance increments
export async function updateInvoiceStatus(
  id: string, 
  status: "pending" | "paid", 
  talentPayoutStatus: "pending" | "disbursed"
) {
  try {
    const docRef = doc(db, INVOICES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    const updateData: any = {
      status,
      talentPayoutStatus
    };
    
    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreInvoice;
      if (data.splits && data.splits.length > 0 && talentPayoutStatus === "disbursed") {
        updateData.splits = data.splits.map(s => ({
          ...s,
          status: "disbursed"
        }));
      }

      // Execute payout balance increments on users when paid/disbursed
      if (status === "paid" || talentPayoutStatus === "disbursed") {
        const usersRef = collection(db, "users");
        
        // Payout to talents in splits
        if (data.splits && data.splits.length > 0) {
          for (const split of data.splits) {
            if (split.talentEmail) {
              const q = query(usersRef, where("email", "==", split.talentEmail.trim().toLowerCase()));
              const snap = await getDocs(q);
              snap.forEach(async (uDoc) => {
                const uData = uDoc.data();
                const curCryst = Number(uData.crystallizedBalance || 0);
                const curAvail = Number(uData.availableBalance || 0);
                await updateDoc(doc(db, "users", uDoc.id), {
                  crystallizedBalance: curCryst + split.amount,
                  availableBalance: curAvail + split.amount,
                });
              });
            }
          }
        } else if (data.talentEmail) {
          // Single talent payout
          const q = query(usersRef, where("email", "==", data.talentEmail.trim().toLowerCase()));
          const snap = await getDocs(q);
          snap.forEach(async (uDoc) => {
            const uData = uDoc.data();
            const curCryst = Number(uData.crystallizedBalance || 0);
            const curAvail = Number(uData.availableBalance || 0);
            await updateDoc(doc(db, "users", uDoc.id), {
              crystallizedBalance: curCryst + data.amount,
              availableBalance: curAvail + data.amount,
            });
          });
        }
      }
    }

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error(`Error updating invoice status for ${id}:`, error);
    throw error;
  }
}

// Fetch all talents from Firestore for Invoice Creation dropdowns
export async function getFirestoreTalents(): Promise<{ email: string; name: string }[]> {
  try {
    const q = query(collection(db, "users"));
    const snap = await getDocs(q);
    const results: { email: string; name: string }[] = [];
    snap.forEach((d) => {
      const data = d.data();
      const role = data.role || (data.accountType === "brand" ? "brand" : data.accountType === "agency" ? "agency" : "talent");
      if (role === "talent" || data.accountType === "individual" || data.accountType === "talent_agency" || data.accountType === "talent_independent") {
        results.push({
          email: data.email || "",
          name: data.displayName || data.fullName || data.email?.split("@")[0] || "Talent",
        });
      }
    });
    return results;
  } catch (err) {
    console.error("Error fetching talents from Firestore:", err);
    return [];
  }
}

// Update specific invoice due date
export async function updateInvoiceDueDate(id: string, due: string) {
  try {
    const docRef = doc(db, INVOICES_COLLECTION, id);
    await updateDoc(docRef, { due });
  } catch (error) {
    console.error(`Error updating invoice due date for ${id}:`, error);
    throw error;
  }
}

// Delete specific invoice
export async function deleteFirestoreInvoice(id: string) {
  try {
    const docRef = doc(db, INVOICES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting invoice ${id}:`, error);
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

// Fetch all registered talents represented by a specific agency from Firestore users collection
export async function getRegisteredTalentsByAgency(agencyEmail: string): Promise<FirestoreUser[]> {
  try {
    if (!agencyEmail) return [];
    const normalizedEmail = agencyEmail.trim().toLowerCase();
    const q = query(
      collection(db, "users"),
      where("accountType", "in", ["individual", "talent_independent", "talent", "talent_agency"]),
      where("parentAgencyEmail", "==", normalizedEmail)
    );
    const querySnapshot = await getDocs(q);
    const talents: FirestoreUser[] = [];
    querySnapshot.forEach((doc) => {
      talents.push(doc.data() as FirestoreUser);
    });
    return talents;
  } catch (error) {
    console.error(`Error getting registered talents by agency ${agencyEmail}:`, error);
    return [];
  }
}

// Deposit Balance Helpers & Real-Time Listeners
const DEPOSITS_COLLECTION = "deposits";

export interface FirestoreDepositRecord {
  email: string;
  balance: number;
  lastDepositAmount: number;
  lastDepositCard?: string;
  updatedAt: any;
}

export async function recordFirestoreDeposit(email: string, depositAmount: number, cardDetail?: string): Promise<number> {
  try {
    if (!email) return 0;
    const normalizedEmail = email.trim().toLowerCase();
    const docRef = doc(db, DEPOSITS_COLLECTION, normalizedEmail);
    const snap = await getDoc(docRef);

    const defaultInitial = (normalizedEmail.includes("brand") || normalizedEmail.includes("adidas") || normalizedEmail.includes("nike")) ? 25000 : 0;
    let currentBalance = defaultInitial;
    if (snap.exists()) {
      const data = snap.data() as FirestoreDepositRecord;
      currentBalance = typeof data.balance === "number" ? data.balance : defaultInitial;
    }

    const newBalance = currentBalance + depositAmount;

    await setDoc(docRef, {
      email: normalizedEmail,
      balance: newBalance,
      lastDepositAmount: depositAmount,
      lastDepositCard: cardDetail || "Card ****86",
      updatedAt: serverTimestamp()
    }, { merge: true });

    return newBalance;
  } catch (error) {
    console.error("Error recording deposit in Firestore:", error);
    throw error;
  }
}

export function subscribeFirestoreDepositBalance(email: string, callback: (balance: number) => void): () => void {
  if (!email) {
    callback(0);
    return () => {};
  }

  const normalizedEmail = email.trim().toLowerCase();
  const docRef = doc(db, DEPOSITS_COLLECTION, normalizedEmail);

  const defaultInitial = (normalizedEmail.includes("brand") || normalizedEmail.includes("adidas") || normalizedEmail.includes("nike")) ? 25000 : 0;

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data() as FirestoreDepositRecord;
      if (typeof data.balance === "number") {
        callback(data.balance);
      } else {
        callback(defaultInitial);
      }
    } else {
      callback(defaultInitial);
    }
  }, (error) => {
    console.error("Error subscribing to deposit balance:", error);
    callback(defaultInitial);
  });
}

