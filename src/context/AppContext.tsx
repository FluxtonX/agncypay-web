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

interface AppState {
  user: {
    fullName: string;
    email: string;
    accountType: "individual" | "agency" | "brand";
    isLoggedIn: boolean;
    emailVerified: boolean;
  } | null;
  businessSetup: Partial<BusinessProfile> & {
    industry?: string;
    address?: string;
    city?: string;
    businessState?: string;
    zipCode?: string;
    companyDescription?: string;
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
  businessSetup: {
    legalName: "Adidas AG",
    brandName: "Adidas",
    businessType: "Public Company",
    country: "Germany",
    website: "https://www.adidas.com",
    email: "compliance@adidas-group.com",
    phone: "+49 9132 84-0",
    verificationStatus: "draft",
    industry: "Sportswear / Apparel",
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
    owners: [
      {
        fullName: "Bjørn Gulden",
        role: "CEO / Director",
        ownership: 0.1,
        country: "Norway",
        email: "bjorn.gulden@adidas.com",
        idRequired: true,
      }
    ],
  },
  documents: INITIAL_DOCUMENTS,
  brand: {
    id: "brand-adidas-001",
    brandName: "Adidas",
    officialWebsite: "https://www.adidas.com",
    officialEmail: "",
    domainVerified: false,
    trademarkNumber: "US-TM-89429402",
    status: "draft",
    brandCategory: "Sportswear & Footwear",
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
    accountHolderName: "Adidas AG",
    bankName: "Deutsche Bank",
    country: "Germany",
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
  loginUser: (email: string, fullName: string, accountType: "individual" | "agency" | "brand") => void;
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
  resetState: () => void;
  setVerificationStatusDirectly: (status: AppState["verificationStatus"]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("agncypay_state");
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load local storage state:", e);
    }
    setIsLoaded(true);
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

  const loginUser = (email: string, fullName: string, accountType: "individual" | "agency" | "brand") => {
    setState((prev) => ({
      ...prev,
      user: {
        fullName,
        email,
        accountType,
        isLoggedIn: true,
        emailVerified: false,
      },
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
    const isEnterprise = email.endsWith("@adidas.com") || email.endsWith("@adidas-group.com");
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

  const resetState = () => {
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
