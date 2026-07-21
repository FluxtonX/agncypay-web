"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BusinessProfile, BrandVerification } from "../types/business";
import { VerificationDocument } from "../types/document";
import { Invoice } from "../types/invoice";
import { Transaction } from "../types/transaction";
import { INITIAL_BUSINESS_PROFILE } from "../data/verification";
import { INITIAL_DOCUMENTS } from "../data/documents";
import { MOCK_INVOICES } from "../data/invoices";
import { MOCK_TRANSACTIONS } from "../data/transactions";
import {
  AccountType,
  Membership,
  Workspace,
  WorkspaceType,
  getDefaultPermissions,
  getDefaultWorkspaceRole,
  getVerificationTrack,
  normalizeWorkspaceType,
} from "../types/workspace";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

interface AppState {
  user: {
    uid: string;
    agncyId: string;
    fullName: string;
    email: string;
    accountType: AccountType;
    isLoggedIn: boolean;
    emailVerified: boolean;
    activeWorkspaceId?: string;
    parentAgencyEmail?: string;
    parentAgencyUid?: string;
  } | null;
  workspaces: Workspace[];
  memberships: Membership[];
  activeWorkspaceId: string | null;
  businessSetup: Partial<BusinessProfile> & {
    industry?: string;
    address?: string;
    city?: string;
    businessState?: string;
    zipCode?: string;
    companyDescription?: string;
    addressLine1?: string;
    addressLine2?: string;
    stateOrProvince?: string;
    postalCode?: string;
    firstName?: string;
    lastName?: string;
    dob?: string;
    ssnLast4?: string;
  };
  representative: {
    fullName: string;
    jobTitle: string;
    dob: string;
    nationality: string;
    email: string;
    phone: string;
    address: string;
    idType: string;
    idFrontUploaded: boolean;
    idBackUploaded: boolean;
    selfieUploaded: boolean;
    status: "not_started" | "uploaded" | "processing" | "verified" | "rejected";
  };
  authorization: {
    isOwner: boolean | null;
    owns25Percent: boolean | null;
    isAuthorizedForPayments: boolean | null;
    authLetterUploaded: boolean;
    powerOfAttorneyUploaded: boolean;
    signatoryName: string;
    signatoryEmail: string;
    roleInCompany: string;
    formationDate: string;
    incorporationState: string;
    employeeRange: string;
    monthlyPaymentVolume: string;
    owners: {
      fullName: string;
      role: string;
      ownership: number;
      country: string;
      email: string;
      idRequired: boolean;
    }[];
  };
  documents: VerificationDocument[];
  brand: BrandVerification & {
    brandCategory: string;
    logoUploaded: boolean;
    brandProofUploaded: boolean;
    trademarkCertUploaded: boolean;
    distributorContractUploaded: boolean;
    authLetterUploaded: boolean;
    domainVerificationCode: string;
    domainCodeSent: boolean;
    domainCodeAttempts: number;
    emailDomainWarning: boolean;
  };
  bankDetails: {
    accountHolderName: string;
    bankName: string;
    country: string;
    currency: string;
    accountNumber: string;
    routingNumber: string;
    bankAddress: string;
    statementUploaded: boolean;
    holderNameWarning: boolean;
    status: "not_started" | "uploaded" | "processing" | "approved" | "rejected";
  };
  verificationStatus: "draft" | "submitted" | "in_review" | "requires_action" | "approved" | "rejected" | "suspended";
  invoices: Invoice[];
  transactions: Transaction[];
}

const DEFAULT_STATE: AppState = {
  user: null,
  workspaces: [],
  memberships: [],
  activeWorkspaceId: null,
  businessSetup: {
    legalName: "",
    brandName: "",
    businessType: "",
    country: "",
    website: "",
    email: "",
    phone: "",
    verificationStatus: "draft",
    industry: "",
  },
  representative: {
    fullName: "",
    jobTitle: "",
    dob: "",
    nationality: "",
    email: "",
    phone: "",
    address: "",
    idType: "Passport",
    idFrontUploaded: false,
    idBackUploaded: false,
    selfieUploaded: false,
    status: "not_started",
  },
  authorization: {
    isOwner: null,
    owns25Percent: null,
    isAuthorizedForPayments: null,
    authLetterUploaded: false,
    powerOfAttorneyUploaded: false,
    signatoryName: "",
    signatoryEmail: "",
    roleInCompany: "",
    formationDate: "",
    incorporationState: "",
    employeeRange: "",
    monthlyPaymentVolume: "",
    owners: [],
  },
  documents: INITIAL_DOCUMENTS,
  brand: {
    id: "",
    brandName: "",
    officialWebsite: "",
    officialEmail: "",
    domainVerified: false,
    trademarkNumber: "",
    status: "draft",
    brandCategory: "",
    logoUploaded: false,
    brandProofUploaded: false,
    trademarkCertUploaded: false,
    distributorContractUploaded: false,
    authLetterUploaded: false,
    domainVerificationCode: "123456",
    domainCodeSent: false,
    domainCodeAttempts: 0,
    emailDomainWarning: false,
  },
  bankDetails: {
    accountHolderName: "",
    bankName: "",
    country: "",
    currency: "USD",
    accountNumber: "",
    routingNumber: "",
    bankAddress: "",
    statementUploaded: false,
    holderNameWarning: false,
    status: "not_started",
  },
  verificationStatus: "draft",
  invoices: MOCK_INVOICES,
  transactions: MOCK_TRANSACTIONS,
};

interface AppContextType {
  state: AppState;
  loginUser: (
    email: string,
    fullName: string,
    accountType: AccountType,
    workspaceOptions?: {
      workspaceName?: string;
      workspaceType?: WorkspaceType;
      agencyId?: string;
      uid?: string;
      parentAgencyEmail?: string;
      parentAgencyUid?: string;
    }
  ) => void;
  verifyEmail: (code: string) => boolean;
  resendEmailCode: () => void;
  updateBusinessSetup: (data: Partial<AppState["businessSetup"]>) => void;
  updateRepresentative: (data: Partial<AppState["representative"]>) => void;
  updateAuthorization: (data: Partial<AppState["authorization"]>) => void;
  uploadDocument: (docId: string, updates: Partial<VerificationDocument>) => void;
  updateBrand: (data: Partial<AppState["brand"]>) => void;
  sendBrandDomainCode: (email: string) => boolean;
  verifyBrandDomainCode: (code: string) => boolean;
  updateBankDetails: (data: Partial<AppState["bankDetails"]>) => void;
  submitForVerification: () => void;
  payInvoice: (invoiceId: string) => Promise<{ success: boolean; error?: string }>;
  switchWorkspace: (workspaceId: string) => void;
  resetState: () => void;
  setVerificationStatusDirectly: (status: AppState["verificationStatus"]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function createAgncyId(prefix: string) {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

function normalizeStoredState(state: AppState): AppState {
  return {
    ...DEFAULT_STATE,
    ...state,
    workspaces: Array.isArray(state.workspaces) ? state.workspaces : [],
    memberships: Array.isArray(state.memberships) ? state.memberships : [],
    activeWorkspaceId: state.activeWorkspaceId ?? state.user?.activeWorkspaceId ?? null,
    user: state.user
      ? {
          ...state.user,
          uid: state.user.uid ?? "",
          agncyId: state.user.agncyId ?? createAgncyId("USR"),
          activeWorkspaceId: state.user.activeWorkspaceId ?? state.activeWorkspaceId ?? undefined,
          parentAgencyEmail: state.user.parentAgencyEmail,
          parentAgencyUid: state.user.parentAgencyUid,
        }
      : null,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount & listen to Firebase Auth
  useEffect(() => {
    try {
      const stored = localStorage.getItem("agncypay_state");
      if (stored) {
        setState(normalizeStoredState(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
    setIsLoaded(true);

    // Set up Firebase Auth listener


    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: any) => {
      if (firebaseUser) {
        const docRef = doc(db, "users", firebaseUser.uid);
        const unsubDoc = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Sync user data to local context state
            setState((prev) => {
              const workspaceType = data.accountType === "brand" ? "brand" : data.accountType === "agency" ? "agency" : "talent_independent font";
              const normalizedWType = (workspaceType.includes("brand") ? "brand" : workspaceType.includes("agency") ? "agency" : "talent_independent") as WorkspaceType;
              const workspaceId = prev.activeWorkspaceId || `${normalizedWType}-${Date.now()}`;
              
              const existingWorkspace = prev.workspaces.find(w => w.id === workspaceId);
              const workspace = existingWorkspace || {
                id: workspaceId,
                type: normalizedWType,
                name: data.workspaceName || "AgncyPay Workspace",
                agncyId: data.agencyId || `USR-${Math.floor(100000 + Math.random() * 900000)}`,
                verificationTrack: getVerificationTrack(normalizedWType),
                verificationStatus: "draft" as const,
              };

              return {
                ...prev,
                user: {
                  uid: firebaseUser.uid,
                  agncyId: prev.user?.agncyId || data.agencyId || `USR-${Math.floor(100000 + Math.random() * 900000)}`,
                  fullName: data.fullName || data.displayName || firebaseUser.email?.split("@")[0],
                  email: data.email || firebaseUser.email,
                  accountType: data.accountType || "individual",
                  isLoggedIn: true,
                  emailVerified: true,
                  activeWorkspaceId: workspaceId,
                  parentAgencyEmail: data.parentAgencyEmail,
                  parentAgencyUid: data.parentAgencyUid,
                  availableBalance: data.availableBalance ?? 0,
                  liquidityBalance: data.liquidityBalance ?? 0,
                  pendingBalance: data.pendingBalance ?? 0,
                  crystallizedBalance: data.crystallizedBalance ?? 0,
                },
                workspaces: existingWorkspace ? prev.workspaces : [...prev.workspaces, workspace],
                activeWorkspaceId: workspaceId,
              };
            });
          }
        }, (error) => {
          console.error("Error listening to user document:", error);
        });

        return () => unsubDoc();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Save state to localStorage on state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem("agncypay_state", JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save local storage state:", e);
    }
  }, [state, isLoaded]);

  const loginUser = (
    email: string,
    fullName: string,
    accountType: AccountType,
    workspaceOptions?: {
      workspaceName?: string;
      workspaceType?: WorkspaceType;
      agencyId?: string;
      uid?: string;
      parentAgencyEmail?: string;
      parentAgencyUid?: string;
    }
  ) => {
    const normalizedEmail = email.trim().toLowerCase();
    const workspaceType = workspaceOptions?.workspaceType ?? normalizeWorkspaceType(accountType);
    const workspaceName =
      workspaceOptions?.workspaceName?.trim() ||
      (workspaceType === "talent_independent" || workspaceType === "talent_agency"
        ? `${fullName.trim() || "Talent"} Workspace`
        : "AgncyPay Workspace");
    const workspaceId = `${workspaceType}-${Date.now()}`;
    const role = getDefaultWorkspaceRole(workspaceType);
    const workspace: Workspace = {
      id: workspaceId,
      type: workspaceType,
      name: workspaceName,
      agncyId: workspaceOptions?.agencyId || createAgncyId("ORG"),
      externalId: workspaceOptions?.agencyId,
      verificationTrack: getVerificationTrack(workspaceType),
      verificationStatus: "draft",
    };
    const membership: Membership = {
      id: `mem-${Date.now()}`,
      userEmail: normalizedEmail,
      workspaceId,
      role,
      permissions: getDefaultPermissions(role),
      status: "active",
    };

    setState((prev) => ({
      ...prev,
      user: {
        uid: workspaceOptions?.uid || prev.user?.uid || "",
        agncyId: prev.user?.email === normalizedEmail ? prev.user.agncyId : (workspaceOptions?.agencyId || createAgncyId("USR")),
        fullName,
        email: normalizedEmail,
        accountType,
        isLoggedIn: true,
        emailVerified: false,
        activeWorkspaceId: workspaceId,
        parentAgencyEmail: workspaceOptions?.parentAgencyEmail,
        parentAgencyUid: workspaceOptions?.parentAgencyUid,
      },
      workspaces: [
        ...prev.workspaces.filter((existingWorkspace) => existingWorkspace.id !== workspaceId),
        workspace,
      ],
      memberships: [
        ...prev.memberships.filter(
          (existingMembership) =>
            existingMembership.userEmail !== normalizedEmail ||
            existingMembership.workspaceId !== workspaceId
        ),
        membership,
      ],
      activeWorkspaceId: workspaceId,
    }));
  };

  const verifyEmail = (code: string) => {
    if (code === "123456" && state.user) {
      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, emailVerified: true } : null,
      }));
      return true;
    }
    return false;
  };

  const switchWorkspace = (workspaceId: string) => {
    setState((prev) => {
      const workspace = prev.workspaces.find((item) => item.id === workspaceId);

      if (!workspace || !prev.user) return prev;

      return {
        ...prev,
        activeWorkspaceId: workspace.id,
        user: {
          ...prev.user,
          accountType: workspace.type,
          activeWorkspaceId: workspace.id,
        },
      };
    });
  };

  const resendEmailCode = () => {
    console.log("Verification email resent to:", state.user?.email);
  };

  const updateBusinessSetup = (data: Partial<AppState["businessSetup"]>) => {
    setState((prev) => ({
      ...prev,
      businessSetup: { ...prev.businessSetup, ...data },
    }));
  };

  const updateRepresentative = (data: Partial<AppState["representative"]>) => {
    setState((prev) => {
      const newRep = { ...prev.representative, ...data };
      // update status based on uploads
      if (newRep.idFrontUploaded && newRep.selfieUploaded) {
        newRep.status = "uploaded";
      }
      return {
        ...prev,
        representative: newRep,
      };
    });
  };

  const updateAuthorization = (data: Partial<AppState["authorization"]>) => {
    setState((prev) => ({
      ...prev,
      authorization: { ...prev.authorization, ...data },
    }));
  };

  const uploadDocument = (docId: string, updates: Partial<VerificationDocument>) => {
    setState((prev) => {
      const docs = prev.documents.map((doc) => {
        if (doc.id === docId) {
          return {
            ...doc,
            ...updates,
            uploadedAt: updates.status === "uploaded" ? new Date().toISOString() : doc.uploadedAt,
          };
        }
        return doc;
      });
      return { ...prev, documents: docs };
    });
  };

  const updateBrand = (data: Partial<AppState["brand"]>) => {
    setState((prev) => ({
      ...prev,
      brand: { ...prev.brand, ...data },
    }));
  };

  const sendBrandDomainCode = (email: string) => {
    // Check if email uses a professional domain (not generic like gmail, yahoo, etc.)
    const genericDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "aol.com"];
    const emailDomain = email.split("@")[1]?.toLowerCase() || "";
    const isEnterprise = emailDomain.length > 0 && !genericDomains.includes(emailDomain);
    setState((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        officialEmail: email,
        domainCodeSent: true,
        emailDomainWarning: !isEnterprise,
      },
    }));
    return true;
  };

  const verifyBrandDomainCode = (code: string) => {
    if (code === "123456") {
      setState((prev) => ({
        ...prev,
        brand: {
          ...prev.brand,
          domainVerified: true,
          status: "approved",
        },
      }));
      return true;
    }
    setState((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        domainCodeAttempts: prev.brand.domainCodeAttempts + 1,
      },
    }));
    return false;
  };

  const updateBankDetails = (data: Partial<AppState["bankDetails"]>) => {
    setState((prev) => {
      const newBank = { ...prev.bankDetails, ...data };
      
      // Validation warning if holder name doesn't match legal name
      const legalName = prev.businessSetup.legalName || "";
      const holderName = newBank.accountHolderName || "";
      newBank.holderNameWarning = 
        holderName.trim().toLowerCase() !== legalName.trim().toLowerCase();

      return {
        ...prev,
        bankDetails: newBank,
      };
    });
  };

  const submitForVerification = () => {
    setState((prev) => ({
      ...prev,
      verificationStatus: "approved",
      representative: { ...prev.representative, status: "verified" },
      bankDetails: { ...prev.bankDetails, status: "approved", statementUploaded: true },
      documents: prev.documents.map((doc) => ({ ...doc, status: "approved" })),
      brand: {
        ...prev.brand,
        officialEmail: prev.brand.officialEmail || prev.user?.email || "demo@gmail.com",
        domainVerified: true,
        domainCodeSent: true,
        status: "approved",
        trademarkCertUploaded: true,
        logoUploaded: true,
        brandProofUploaded: true,
        authLetterUploaded: true,
      },
    }));
  };

  const payInvoice = async (invoiceId: string): Promise<{ success: boolean; error?: string }> => {
    // Set status to processing
    setState((prev) => ({
      ...prev,
      invoices: prev.invoices.map((inv) =>
        inv.id === invoiceId ? { ...inv, status: "processing" } : inv
      ),
    }));

    // Wait for the simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 3500));

    let isSuccess = true;
    setState((prev) => {
      const selectedInvoice = prev.invoices.find((inv) => inv.id === invoiceId);
      if (!selectedInvoice) return prev;

      // Simulate a small failure chance if invoice amount is exactly $4,720 (INV-AD-1003) to show the failed route
      if (invoiceId === "INV-AD-1003" && Math.random() > 0.5) {
        isSuccess = false;
        return {
          ...prev,
          invoices: prev.invoices.map((inv) =>
            inv.id === invoiceId ? { ...inv, status: "overdue" } : inv
          ),
          transactions: [
            {
              id: `TX-AD-${Math.floor(100000 + Math.random() * 900000)}`,
              invoiceId: invoiceId,
              amount: selectedInvoice.amount,
              currency: "USD",
              timestamp: new Date().toISOString(),
              paymentMethod: "AgncyPay ACH",
              status: "failed",
            },
            ...prev.transactions,
          ],
        };
      }

      // Success
      return {
        ...prev,
        invoices: prev.invoices.map((inv) =>
          inv.id === invoiceId ? { ...inv, status: "paid" } : inv
        ),
        transactions: [
          {
            id: `TX-AD-${Math.floor(100000 + Math.random() * 900000)}`,
            invoiceId: invoiceId,
            amount: selectedInvoice.amount,
            currency: "USD",
            timestamp: new Date().toISOString(),
            paymentMethod: "AgncyPay ACH Secure",
            status: "success",
          },
          ...prev.transactions,
        ],
      };
    });

    return { success: isSuccess, error: isSuccess ? undefined : "Declined: Insufficient Corporate Treasury balance authorization." };
  };

  const setVerificationStatusDirectly = (status: AppState["verificationStatus"]) => {
    setState((prev) => {
      // Helper to instantly approve all dependencies if set to approved
      if (status === "approved") {
        return {
          ...prev,
          verificationStatus: "approved",
          representative: { ...prev.representative, status: "verified" },
          bankDetails: { ...prev.bankDetails, status: "approved" },
          documents: prev.documents.map(doc => ({ ...doc, status: "approved" })),
          brand: { ...prev.brand, status: "approved" },
        };
      }
      return {
        ...prev,
        verificationStatus: status,
      };
    });
  };

  const resetState = async () => {
    try {
      const { logoutWithFirebase } = require("../lib/firebaseAuth");
      await logoutWithFirebase();
    } catch (e) {
      console.error("Firebase logout failed during resetState:", e);
    }
    setState(DEFAULT_STATE);
  };

  return (
    <AppContext.Provider
      value={{
        state,
        loginUser,
        verifyEmail,
        resendEmailCode,
        updateBusinessSetup,
        updateRepresentative,
        updateAuthorization,
        uploadDocument,
        updateBrand,
        sendBrandDomainCode,
        verifyBrandDomainCode,
        updateBankDetails,
        submitForVerification,
        payInvoice,
        switchWorkspace,
        resetState,
        setVerificationStatusDirectly,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
