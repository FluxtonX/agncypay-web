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
  getDoc
} from "firebase/firestore";
import { db } from "./firebase";

export interface FirestoreInvoice {
  id: string;
  campaign: string;
  agency: string;
  talent: string;
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

// Seeding default demo data if invoices collection is empty
export async function seedDefaultInvoices() {
  try {
    const q = query(collection(db, INVOICES_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("Firestore invoices collection is empty. Seeding default demo invoices...");
      
      const defaultInvoices: FirestoreInvoice[] = [
        {
          id: "W-INV-001",
          campaign: "Summer campaign",
          agency: "Elite model agency",
          talent: "sarah",
          amount: 14999.98,
          due: "Jul 13, 2026",
          status: "pending",
          talentPayoutStatus: "pending",
          createdDate: "Jul 05, 2026",
          payerId: "MB-6984",
          payerEmail: "billing@elite.agency",
          payerAddress: ["Elite Models Inc.", "10 Hudson Yards, 24th Fl", "New York, NY 10001"]
        },
        {
          id: "W-INV-002",
          campaign: "Summer campaign",
          agency: "CCA",
          talent: "Dj kivi",
          amount: 4499.98,
          due: "Jul 12, 2026",
          status: "pending",
          talentPayoutStatus: "pending",
          createdDate: "Jul 04, 2026",
          payerId: "MB-7044",
          payerEmail: "finance@cca-artists.com",
          payerAddress: ["Creative Artists Assoc.", "2000 Avenue of the Stars", "Los Angeles, CA 90067"]
        }
      ];

      for (const inv of defaultInvoices) {
        const docRef = doc(db, INVOICES_COLLECTION, inv.id);
        await setDoc(docRef, {
          ...inv,
          createdAt: serverTimestamp()
        });
      }
      
      console.log("Demo invoices seeded successfully!");
    }
  } catch (error) {
    console.error("Error seeding default invoices in Firestore:", error);
  }
}

// Reset/Re-seed Demo database
export async function resetDemoFirestore() {
  try {
    // 1. Get all documents
    const q = query(collection(db, INVOICES_COLLECTION));
    const querySnapshot = await getDocs(q);
    
    // 2. Set status of default ones back to pending
    // and delete any user-created ones so we get back to baseline
    for (const document of querySnapshot.docs) {
      const id = document.id;
      if (id === "W-INV-001" || id === "W-INV-002") {
        const docRef = doc(db, INVOICES_COLLECTION, id);
        await updateDoc(docRef, {
          status: "pending",
          talentPayoutStatus: "pending"
        });
      } else {
        // Delete custom invoice to restore clean demo
        const docRef = doc(db, INVOICES_COLLECTION, id);
        // Instead of hard deleting (which might require permissions), we can just set them to a hidden state
        // or set status/talentPayoutStatus. For a complete reset we delete the document
        // To be safe and clean, we delete:
        const { deleteDoc } = await import("firebase/firestore");
        await deleteDoc(docRef);
      }
    }
    
    // Re-seed if somehow deleted completely
    await seedDefaultInvoices();
  } catch (error) {
    console.error("Error resetting demo database in Firestore:", error);
  }
}

// Create a new invoice document
export async function createFirestoreInvoice(data: Omit<FirestoreInvoice, "id" | "status" | "talentPayoutStatus" | "createdDate" | "payerId" | "payerEmail" | "payerAddress">) {
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
    const customId = `W-INV-00${querySnapshot.size + 1}`;

    const newInvoice: FirestoreInvoice = {
      id: customId,
      campaign: data.campaign,
      agency: data.agency,
      talent: data.talent,
      amount: Number(data.amount),
      due: data.due,
      status: "pending",
      talentPayoutStatus: "pending",
      createdDate: formattedDate,
      payerId: `MB-${Math.floor(6000 + Math.random() * 3000)}`,
      payerEmail: "billing@client.corp",
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

// Subscribe to real-time invoice updates
export function subscribeInvoices(callback: (invoices: FirestoreInvoice[]) => void) {
  // First seed defaults if not already present
  seedDefaultInvoices();

  const q = query(collection(db, INVOICES_COLLECTION), orderBy("createdAt", "asc"));
  
  return onSnapshot(q, (snapshot) => {
    const list: FirestoreInvoice[] = [];
    snapshot.forEach((document) => {
      list.push(document.data() as FirestoreInvoice);
    });
    callback(list);
  }, (error) => {
    console.error("Error listening to Firestore updates:", error);
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
    // If it's a mock checkout ID MB-6984/MB-7044, map to the default invoice
    let mappedId = id;
    if (id === "MB-6984") mappedId = "W-INV-001";
    if (id === "MB-7044") mappedId = "W-INV-002";

    const docRef = doc(db, INVOICES_COLLECTION, mappedId);
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
