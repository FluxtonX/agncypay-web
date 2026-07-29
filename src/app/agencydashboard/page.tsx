"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Sparkles,
  ArrowLeft,
  Coins,
  Layers,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  DollarSign,
  ChevronRight,
  Eye,
  User,
  LogOut,
  Calendar,
  Lock,
  ArrowUpRight,
  MapPin,
  RefreshCw,
  Search,
  Loader2,
  Check,
  X,
  Sun,
  Moon,
  Plus,
  Wallet,
  CreditCard,
  Landmark
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { 
  subscribeInvoicesByBrand, 
  subscribeInvoicesByAgency, 
  updateInvoiceStatus, 
  createFirestoreInvoice, 
  getRegisteredBrands, 
  getRegisteredTalents, 
  getRegisteredTalentsByAgency,
  recordFirestoreDeposit,
  subscribeFirestoreDepositBalance
} from "../../lib/firebaseInvoices";
import { FirestoreUser } from "../../lib/firebaseAuth";
import { useAccounting } from "../../modules/accounting/hooks/useAccounting";
import { ProviderType } from "../../modules/accounting/types";
import { BanksAndCardsPanel } from "../../components/dashboard/BanksAndCardsPanel";
import { IntegrationsPanel } from "../../components/dashboard/IntegrationsPanel";
import { SyncedInvoicesTable } from "../../components/dashboard/SyncedInvoicesTable";
import { CorporatePayoutTermsCard } from "../../components/dashboard/CorporatePayoutTermsCard";
import { InvoiceFetchingLoader } from "../../components/dashboard/InvoiceFetchingLoader";

// Refactored Data Models
interface SplitItem {
  name: string;
  role: "Talent" | "Agency";
  percentage: number;
  amount: number;
  walletId: string;
  avatar: string;
}

interface VendorItem {
  name: string;
  role: "Vendor";
  amount: number;
  walletId: string;
  avatar: string;
}

interface InvoiceMock {
  id: string;
  campaignName: string;
  brandName: string;
  createdDate: string;
  dueDate: string;
  amount: number;
  vendorFee: VendorItem;
  splitPool: {
    total: number;
    splits: SplitItem[];
  };
  status: "awaiting_approval" | "processing" | "settled" | "rejected" | "talent_disbursed";
  defaultTerm: "Net-30" | "Net-60" | "Net-90";
}

const INITIAL_INVOICES: InvoiceMock[] = [];

const RECENT_TRANSACTIONS: any[] = [];

const getCardImage = (institutionName: string) => {
  const norm = institutionName.toLowerCase();
  if (norm.includes("chase")) return "/chase-ink-business-unlimited.png";
  if (norm.includes("mercury")) return "/mercurycard.png";
  if (norm.includes("bank of america")) return "https://business.bankofamerica.com/content/dam/consumer/business/deposits/checking-accounts/debit-cards/bofa_busdbtcm_v.png";
  return undefined;
};

interface PlaidAccount {
  id: string;
  name: string;
  mask: string;
  institutionName: string;
  type: string;
  subtype: string;
  availableBalance: number;
}

export default function AgencyDashboardPage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const { currentProvider, connectionStatuses, invoices: crmSyncedInvoices, loading: crmLoading } = useAccounting();
  const workspaceType = state.user ? state.user.accountType : "brand";

  const [livePaidVolume, setLivePaidVolume] = useState(0);
  const [liveNet0Funded, setLiveNet0Funded] = useState(0);
  const [liveAutosplitSavings, setLiveAutosplitSavings] = useState(0);

  // Widget invoices state
  const [widgetInvoices, setWidgetInvoices] = useState<any[]>([]);
  const [isFetchingInvoices, setIsFetchingInvoices] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [linkedCards, setLinkedCards] = useState<any[]>([]);

  const [mounted, setMounted] = useState(false);
  const [registeredBrands, setRegisteredBrands] = useState<FirestoreUser[]>([]);
  const [registeredTalents, setRegisteredTalents] = useState<FirestoreUser[]>([]);
  const [selectedBrandEmail, setSelectedBrandEmail] = useState("");
  const [selectedTalentEmail, setSelectedTalentEmail] = useState("");

  // Plaid Connection State & Handlers
  const [plaidAccounts, setPlaidAccounts] = useState<PlaidAccount[]>([]);
  const [isPlaidLoading, setIsPlaidLoading] = useState(false);
  const [plaidError, setPlaidError] = useState<string | null>(null);
  const [isPlaidModalOpen, setIsPlaidModalOpen] = useState(false);
  const [connectingBankName, setConnectingBankName] = useState<string | null>(null);

  const availablePlaidBanks = [
    { institutionName: "Bank of America", name: "Corporate Commercial Checking", mask: "3910", balance: 310000.00 },
    { institutionName: "Wells Fargo", name: "Business Treasury Account", mask: "7421", balance: 195400.00 },
    { institutionName: "Silicon Valley Bank", name: "Venture Operating Account", mask: "9912", balance: 450000.00 },
    { institutionName: "Citibank", name: "Commercial Operating Feed", mask: "5521", balance: 220000.00 },
    { institutionName: "Brex Treasury", name: "Corporate Cash Feed", mask: "1184", balance: 380000.00 },
    { institutionName: "Ramp Business", name: "Operating Settlement Account", mask: "6620", balance: 150000.00 },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlaid = localStorage.getItem("agency_plaid_accounts_v3");
      if (savedPlaid) {
        try {
          setPlaidAccounts(JSON.parse(savedPlaid));
        } catch (e) {
          console.error("Error loading saved Plaid accounts", e);
        }
      } else {
        const defaultAccounts: PlaidAccount[] = [
          {
            id: "plaid-default-chase-ink",
            name: "Chase Business Checking",
            mask: "9402",
            institutionName: "Chase",
            type: "depository",
            subtype: "checking",
            availableBalance: 84320.50
          },
          {
            id: "plaid-default-mercury-io",
            name: "Mercury Treasury",
            mask: "8821",
            institutionName: "Mercury",
            type: "depository",
            subtype: "checking",
            availableBalance: 1250000.00
          }
        ];
        setPlaidAccounts(defaultAccounts);
        localStorage.setItem("agency_plaid_accounts_v3", JSON.stringify(defaultAccounts));
      }
    }
  }, []);

  const handleConnectPlaid = () => {
    setIsPlaidModalOpen(true);
  };

  const handleSelectPlaidBank = (bank: typeof availablePlaidBanks[0]) => {
    setConnectingBankName(bank.institutionName);
    setTimeout(() => {
      const newAcc: PlaidAccount = {
        id: `plaid-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: bank.name,
        mask: bank.mask,
        institutionName: bank.institutionName,
        type: "depository",
        subtype: "checking",
        availableBalance: bank.balance
      };

      setPlaidAccounts(prev => {
        const updated = [...prev, newAcc];
        if (typeof window !== "undefined") {
          localStorage.setItem("agency_plaid_accounts_v3", JSON.stringify(updated));
        }
        return updated;
      });
      setConnectingBankName(null);
      setIsPlaidModalOpen(false);
    }, 2000);
  };

  const handleDisconnectPlaidAccount = (id: string) => {
    setPlaidAccounts((prev) => {
      const updated = prev.filter((acc) => acc.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("agency_plaid_accounts_v3", JSON.stringify(updated));
      }
      return updated;
    });
  };  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const brandsData = await getRegisteredBrands();
      const talentsData = await getRegisteredTalents();
      
      const MOCK_BRANDS: FirestoreUser[] = [
        { uid: "b-1", email: "billing@nike.com", fullName: "Nike Brand Team", workspaceName: "Nike Global", accountType: "brand", agencyId: "AG-10001", createdAt: new Date().toISOString() },
        { uid: "b-2", email: "finance@adidas.com", fullName: "Adidas North America", workspaceName: "Adidas Corp", accountType: "brand", agencyId: "AG-10002", createdAt: new Date().toISOString() },
        { uid: "b-3", email: "ap@redbull.com", fullName: "Red Bull Media House", workspaceName: "Red Bull Media", accountType: "brand", agencyId: "AG-10003", createdAt: new Date().toISOString() },
      ];
      const MOCK_TALENTS: FirestoreUser[] = [
        { uid: "t-1", email: "alex.rivas@creator.co", fullName: "Alex Rivas", workspaceName: "Alex Studio", accountType: "talent_independent", agencyId: "AG-20001", createdAt: new Date().toISOString() },
        { uid: "t-2", email: "elena.rostova@talent.io", fullName: "Elena Rostova", workspaceName: "Elena Vlog", accountType: "talent_independent", agencyId: "AG-20002", createdAt: new Date().toISOString() },
        { uid: "t-3", email: "marcus.chen@studio.com", fullName: "Marcus Chen", workspaceName: "Marcus Media", accountType: "talent_independent", agencyId: "AG-20003", createdAt: new Date().toISOString() },
      ];

      const brands = brandsData && brandsData.length > 0 ? brandsData : MOCK_BRANDS;
      const talents = talentsData && talentsData.length > 0 ? talentsData : MOCK_TALENTS;

      setRegisteredBrands(brands);
      setRegisteredTalents(talents);
      if (brands.length > 0) setSelectedBrandEmail(brands[0].email);
      if (talents.length > 0) setSelectedTalentEmail(talents[0].email);
    }
    loadData();
  }, [state.user]);


  const [isLightTheme, setIsLightTheme] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme_agency");
      if (savedTheme) {
        if (savedTheme === "light") {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
      } else {
        if (true) {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
          setIsLightTheme(true);
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
          setIsLightTheme(false);
        }
      }
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.toggle("light");
      if (isLight) {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
      setIsLightTheme(isLight);
      localStorage.setItem("agncypay_theme_agency", isLight ? "light" : "dark");
    }
  };

  // New invoice state hooks
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState("");
  const [newTalent, setNewTalent] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDue, setNewDue] = useState("");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [newSplits, setNewSplits] = useState<{ talentName: string; talentEmail: string; amount: number; status: "pending" | "disbursed" }[]>([]);
  const [splitTalentEmail, setSplitTalentEmail] = useState("");
  const [splitAmount, setSplitAmount] = useState("");

  // Role Guard: Redirect Brand users to /branddashboard
  useEffect(() => {
    if (state.user && state.user.accountType === "brand") {
      router.push("/branddashboard");
    }
  }, [state.user, router]);

  useEffect(() => {
    const userEmail = state.user?.email || "";
    if (!userEmail) return;
    
    const savedVolume = localStorage.getItem(`brand_stats_paid_volume_${userEmail}`);
    if (savedVolume) setLivePaidVolume(parseFloat(savedVolume));
    
    const savedSavings = localStorage.getItem(`brand_stats_autosplit_savings_${userEmail}`);
    if (savedSavings) setLiveAutosplitSavings(parseFloat(savedSavings));

    setIsFetchingInvoices(true);

    // Real-time listener for Firestore invoices scoped to the current user's role
    const handleInvoicesUpdate = (invoicesList: any[]) => {
      const mappedList = invoicesList.map((inv) => ({
        id: inv.id,
        agency: inv.agency,
        agencyEmail: inv.agencyEmail || "",
        campaign: inv.campaign,
        talent: inv.talent,
        talentEmail: inv.talentEmail || "",
        brandName: inv.brandName || "",
        dueDate: inv.due,
        amount: inv.amount,
        status: inv.status,
        talentPayoutStatus: inv.talentPayoutStatus,
        payerEmail: inv.payerEmail || "",
        createdDate: inv.createdDate || "",
        createdAt: inv.createdAt
      }));
      setWidgetInvoices(mappedList);
      setIsFetchingInvoices(false);
    };

    // Safety fallback timer to prevent infinite spinner if Firestore array is empty
    const loaderFallbackTimer = setTimeout(() => {
      setIsFetchingInvoices(false);
    }, 1200);

    let unsubscribe = () => {};
    if (workspaceType === "brand") {
      unsubscribe = subscribeInvoicesByBrand(userEmail, handleInvoicesUpdate);
    } else {
      unsubscribe = subscribeInvoicesByAgency(userEmail, handleInvoicesUpdate);
    }

    const savedCards = localStorage.getItem(`agncypay_user_cards_${userEmail}`);
    if (savedCards) {
      try {
        setLinkedCards(JSON.parse(savedCards));
      } catch (e) {
        console.error("Error loading user cards:", e);
      }
    }



    const localNotifs = localStorage.getItem(`agency_notifications_${userEmail}`);
    if (localNotifs) {
      setNotifications(JSON.parse(localNotifs));
    }

    // Start with empty invoices — they come from Firestore now
    setInvoices([]);

    // Set up a listener for storage events to sync across tabs/logins
    const syncStates = () => {
      const savedVolume = localStorage.getItem(`brand_stats_paid_volume_${userEmail}`);
      if (savedVolume) setLivePaidVolume(parseFloat(savedVolume));
      const savedSavings = localStorage.getItem(`brand_stats_autosplit_savings_${userEmail}`);
      if (savedSavings) setLiveAutosplitSavings(parseFloat(savedSavings));

      const localNotifs = localStorage.getItem(`agency_notifications_${userEmail}`);
      if (localNotifs) setNotifications(JSON.parse(localNotifs));
    };

    window.addEventListener("storage", syncStates);
    window.addEventListener("syncAgencyDashboard", syncStates);

    return () => {
      clearTimeout(loaderFallbackTimer);
      unsubscribe();

      window.removeEventListener("storage", syncStates);
      window.removeEventListener("syncAgencyDashboard", syncStates);
    };
  }, [state.user]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign || !selectedBrandEmail || !newAmount || !newDue) return;

    setIsCreatingInvoice(true);
    try {
      const activeAgencyName = state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Elite model agency";
      const agencyEmail = state.user?.email || "agency@elite.com";

      const brandUser = registeredBrands.find(b => b.email === selectedBrandEmail);
      const brandName = brandUser ? brandUser.workspaceName : "Adidas Corporate";

      const talentUser = registeredTalents.find(t => t.email === selectedTalentEmail);
      const talentName = talentUser ? talentUser.fullName : "sarah";

      // Build splits array
      let finalSplits = [...newSplits];
      let primaryTalentName = talentName;
      let primaryTalentEmail = selectedTalentEmail;

      if (finalSplits.length === 0) {
        // Fallback for single talent split (85%)
        finalSplits = [{
          talentName: primaryTalentName,
          talentEmail: primaryTalentEmail,
          amount: parseFloat(newAmount) * 0.85,
          status: "pending"
        }];
      } else {
        // Multi-talent splits already populated. Set primary talent as the first split talent.
        primaryTalentName = finalSplits[0].talentName;
        primaryTalentEmail = finalSplits[0].talentEmail;
      }

      // Format YYYY-MM-DD date picker string to "MMM DD, YYYY" for visual uniformity
      let formattedDue = newDue;
      if (newDue.includes("-")) {
        const dateParts = newDue.split("-");
        if (dateParts.length === 3) {
          const dateObj = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
          formattedDue = dateObj.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric"
          });
        }
      }

      await createFirestoreInvoice({
        campaign: newCampaign,
        agency: activeAgencyName,
        agencyEmail: agencyEmail,
        talent: primaryTalentName,
        talentEmail: primaryTalentEmail,
        brandName: brandName,
        brandEmail: selectedBrandEmail,
        amount: parseFloat(newAmount),
        due: formattedDue,
        splits: finalSplits
      });
      
      // Close and Reset Form
      setIsNewInvoiceOpen(false);
      setNewCampaign("");
      setNewAmount("");
      setNewDue("");
      setNewSplits([]);
      setSplitTalentEmail("");
      setSplitAmount("");
    } catch (error) {
      console.error("Error creating invoice in Firestore:", error);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const masterIntegrations = [
    { label: "QuickBooks", src: "/quickbook.png" },
    { label: "Xero", src: "/xero.png" },
    { label: "Sage", src: "/sage.png" },
    { label: "NetSuite", src: "/netsuite.png" },
    { label: "Mercury", src: "/mercuryLogo.png" },
  ];

  // Map CRM Synced Invoices into unified invoice model
  const crmMappedInvoices = crmSyncedInvoices.map((inv: any) => {
    const isPaid = inv.status?.toUpperCase() === "PAID" || inv.status?.toUpperCase() === "SETTLED";
    const pLogo = masterIntegrations.find(
      (m) => m.label.toLowerCase() === (inv.providerType || currentProvider || "").toLowerCase()
    )?.src || "/quickbook.png";

    return {
      id: inv.docNumber || inv.id,
      agency: inv.name || "CRM Synced Client",
      agencyEmail: "",
      campaign: inv.detail || `CRM Synced Invoice (${inv.providerType || currentProvider})`,
      talent: "CRM Synced",
      talentEmail: "",
      brandName: inv.name || "Brand Account",
      dueDate: inv.date || "Net-30",
      amount: inv.amount,
      status: isPaid ? "paid" : "pending",
      talentPayoutStatus: isPaid ? "disbursed" : "pending",
      payerEmail: state.user?.email || "",
      isCrmSynced: true,
      providerLogo: pLogo
    };
  });

  // Combined Manual and CRM Synced Invoices
  const combinedAllInvoices = [...widgetInvoices, ...crmMappedInvoices];

  // Derived Pending invoice list
  const pendingInvoices = combinedAllInvoices.filter((inv) => inv.status === "pending");

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceMock[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("W-INV-001");
  const [selectedTerm, setSelectedTerm] = useState<"Net-30" | "Net-60" | "Net-90">("Net-30");
  const [instantPayoutEnabled, setInstantPayoutEnabled] = useState<boolean>(true);
  const [transactions, setTransactions] = useState(RECENT_TRANSACTIONS);

  // Filter widgetInvoices by role-scoped email
  const userFilteredWidgetInvoices = widgetInvoices.filter((inv) => {
    const userEmail = state.user?.email || "";
    if (workspaceType === "brand") {
      return inv.payerEmail === userEmail;
    } else {
      return inv.agencyEmail === userEmail;
    }
  });

  // Map functional widget invoices into the full UI shape
  const liveFunctionalInvoices: InvoiceMock[] = userFilteredWidgetInvoices.map(inv => {
    // Determine the status equivalent for the UI logic
    let uiStatus: "awaiting_approval" | "settled" | "talent_disbursed" = "awaiting_approval";
    if (inv.status === "paid") {
      uiStatus = inv.talentPayoutStatus === "disbursed" ? "talent_disbursed" : "settled";
    }

    return {
      id: inv.id,
      campaignName: inv.campaign,
      brandName: inv.brandName || "Adidas Corporate",
      createdDate: inv.createdDate || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      dueDate: inv.dueDate,
      amount: inv.amount,
      defaultTerm: "Net-30",
      status: uiStatus,
      vendorFee: {
        name: "Processing Fee",
        role: "Vendor",
        amount: inv.amount * 0.1, // Example 10%
        walletId: "@agncypay",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&auto=format&fit=crop&q=80"
      },
      splitPool: {
        total: inv.amount * 0.9,
        splits: [
          { name: inv.talent, role: "Talent", percentage: 85, amount: inv.amount * 0.9 * 0.85, walletId: "@talent", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80" },
          { name: inv.agency, role: "Agency", percentage: 15, amount: inv.amount * 0.9 * 0.15, walletId: "@agency", avatar: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=80&auto=format&fit=crop&q=80" }
        ]
      }
    };
  });

  // Combine static fallback and live functional data
  const allInvoices = liveFunctionalInvoices;

  // queueInvoices: role-based filtered list used in the Right Column queue panel
  // We ONLY show live functional invoices in the queue (or all if you want, but functional is preferred)
  const queueInvoices = liveFunctionalInvoices.filter(inv =>
    workspaceType === "brand"
      ? inv.status === "awaiting_approval"
      : inv.status === "settled"
  );

  // Active invoice helper
  // Falls back to first invoice in queue or first overall
  const activeInvoice = allInvoices.find(inv => inv.id === selectedInvoiceId) || queueInvoices[0] || allInvoices[0] || null;

  // Set default term when active invoice changes
  useEffect(() => {
    if (activeInvoice) {
      setSelectedTerm(activeInvoice.defaultTerm);
    }
  }, [selectedInvoiceId, activeInvoice]);

  // Handle Approve & Pay Simulation
  const [processingStage, setProcessingStage] = useState<"idle" | "verifying" | "routing" | "success">("idle");

  const handleApproveAndPay = () => {
    if (!activeInvoice || activeInvoice.status !== "awaiting_approval") return;
    
    setProcessingStage("verifying");
    
    // Stage 1: Verify & Authorize
    setTimeout(() => {
      setProcessingStage("routing");
      
      // Stage 2: Split and Route across nodes
      setTimeout(() => {
        setProcessingStage("success");
        
        // Finalize status update
        setTimeout(async () => {
          try {
            await updateInvoiceStatus(activeInvoice.id, "paid", "pending");
          } catch (err) {
            console.error("Firestore invoice status update error:", err);
          }

          setInvoices(prev => {
            const next = prev.map(inv => 
              inv.id === activeInvoice.id ? { ...inv, status: "settled" as const } : inv
            );
            localStorage.setItem("brand_queue_invoices", JSON.stringify(next));
            return next;
          });

          // Add to dynamic paid stats
          const amt = activeInvoice.amount;
          setLivePaidVolume((v) => {
            const nv = v + amt;
            localStorage.setItem("brand_stats_paid_volume", nv.toString());
            return nv;
          });
          setLiveAutosplitSavings((v) => {
            const nv = v + amt * 0.015;
            localStorage.setItem("brand_stats_autosplit_savings", nv.toString());
            return nv;
          });

          // Generate notification
          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `Brand approved & paid main invoice for ${activeInvoice.campaignName} ($${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
            timestamp: "Just now",
            unread: true,
          };
          setNotifications((notifs) => {
            const updated = [newNotif, ...notifs];
            localStorage.setItem("agency_notifications", JSON.stringify(updated));
            return updated;
          });

          // Add to transaction ledger
          const newTx = {
            id: `AP-TX-${Math.floor(1000 + Math.random() * 9000)}`,
            invoiceId: activeInvoice.id,
            campaign: activeInvoice.campaignName,
            date: "Just now",
            total: `$${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: "settled",
            termSelected: instantPayoutEnabled ? "Net-0 (Instant)" : selectedTerm,
            method: "AgncyPay Network"
          };
          setTransactions(prev => [newTx, ...prev]);
          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncAgencyDashboard"));
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const handlePayoutQueueTalent = (id: string) => {
    setProcessingStage("verifying");
    setTimeout(() => {
      setProcessingStage("routing");
      setTimeout(() => {
        setProcessingStage("success");
        setTimeout(() => {
          setInvoices((prev) => {
            const next = prev.map((inv) => (inv.id === id ? { ...inv, status: "talent_disbursed" as any } : inv));
            localStorage.setItem("brand_queue_invoices", JSON.stringify(next));

            const targetInvoice = prev.find((inv) => inv.id === id);
            if (targetInvoice) {
              const talentSplit = targetInvoice.splitPool.splits.find((s) => s.role === "Talent");
              const agencySplit = targetInvoice.splitPool.splits.find((s) => s.role === "Agency");
              
              if (talentSplit && agencySplit) {
                const newNotif = {
                  id: `notif-${Date.now()}`,
                  message: `${agencySplit.name} paid talent ${talentSplit.name} ($${talentSplit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) after deducting agency fee ($${agencySplit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
                  timestamp: "Just now",
                  unread: true,
                };
                setNotifications((notifs) => {
                  const updated = [newNotif, ...notifs];
                  localStorage.setItem("agency_notifications", JSON.stringify(updated));
                  return updated;
                });
              }
            }
            return next;
          });
          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncAgencyDashboard"));
        }, 1200);
      }, 1500);
    }, 1200);
  };

  const handleLogout = () => {
    resetState();
    router.push("/auth/login");
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased relative transition-colors duration-200">
      {/* Background radial gradient decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

      {/* Header - Adaptive Theme */}
      <header className="border-b border-white/25 light:border-black/15 bg-background/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/agencydashboard" className="flex items-center cursor-pointer z-50 hover:opacity-80 transition-opacity" aria-label="AgncyPay home">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-12 w-auto object-contain scale-[1.56] origin-left transition-transform"
                />
              </Link>
            </div>
            <span className="h-4 w-[1px] bg-white/20 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 light:bg-black/5 border border-white/20 light:border-black/10 text-[11px] font-bold uppercase tracking-wider text-white light:text-[#0F172A]">
              <Building2 className="h-3 w-3 text-white light:text-[#0F172A]" />
              {workspaceType === "brand" 
                ? "Brand Portal" 
                : workspaceType === "agency" 
                ? "Agency Portal" 
                : "Talent Portal"}
            </div>
          </div>

          {/* Center Navigation Tabs (Bilt Style) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button 
              onClick={() => router.push("/agencydashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white shadow-sm border border-white/20 light:border-black/10 transition-all cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer"
            >
              Payments
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/wallet")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              Wallet
            </button>
            <button 
              onClick={() => router.push("/agencydashboard/contacts")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] light:text-[#475569] hover:text-white light:hover:text-[#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              Contacts
            </button>
          </nav>
 
          <div className="flex items-center gap-3">
            {workspaceType === "agency" && (
              <>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/40 light:bg-[#0F172A]/40 text-black/40 light:text-white/40 border border-white/10 light:border-black/5 shadow-sm transition-all flex items-center gap-1.5 cursor-not-allowed blur-[0.6px]"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Switch to Agency Banking
                  </button>
                  <button 
                    onClick={() => alert("Agency Banking is currently locked. Complete your compliance verification to unlock this feature.")}
                    className="p-1 text-neutral-400 hover:text-white transition-colors"
                    title="Why is this locked?"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </div>
                <div className="h-4 w-[1px] bg-white/20" />

              </>
            )}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                {state.user?.fullName ? state.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <span className="text-xs font-bold text-[#E5E5EA] hidden sm:inline">
                {state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Adidas Corporate"}
              </span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {isLightTheme ? <Moon className="h-4 w-4 text-neutral-400 hover:text-white" /> : <Sun className="h-4 w-4 text-neutral-400 hover:text-white" />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 text-neutral-400 hover:text-white transition-colors"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Header Space */}
      <section className="bg-[#000000] border-b border-white/20 py-6 shadow-sm">
        <div className="max-w-[1520px] mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            {workspaceType === "brand" ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">Active Campaign</span>
                  <span className="text-xs text-neutral-400 font-mono">ID: ADIDAS-2026-Q3</span>
                </div>
                <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Adidas Executive Billing</h1>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">Agency Account</span>
                  <span className="text-xs text-neutral-400 font-mono">ID: {state.user?.agncyId || "AGNCY-9024"}</span>
                </div>
                <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">
                  {state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Agency"} Revenue Portal
                </h1>
              </>
            )}
          </div>

          {/* "+ New Invoice" Button in the top right corner of the header section */}
          {workspaceType === "agency" && (
            <button
              onClick={() => setIsNewInvoiceOpen(true)}
              className="h-10 px-5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shrink-0 animate-fade-in"
            >
              <Sparkles className="h-4 w-4 text-black" />
              + New Invoice
            </button>
          )}
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-[1520px] w-full mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Core Approval and Splits (Wider) */}
        <div className="lg:col-span-8 space-y-6">
          


          {/* Analytics Cards Grid */}
          <div className={`grid gap-4 ${workspaceType === "brand" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"}`}>
            {(() => {
              const paidInvoices = liveFunctionalInvoices.filter(i => 
                workspaceType === "brand" 
                  ? (i.status === "settled" || i.status === "talent_disbursed")
                  : i.status === "talent_disbursed"
              );
              const dynamicPaidVolume = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

              const displayPaidVolume = dynamicPaidVolume;
              const displayAutosplitSavings = dynamicPaidVolume * 0.015;

              const awaitingItems = workspaceType === "brand"
                ? liveFunctionalInvoices.filter(i => i.status === "awaiting_approval")
                : liveFunctionalInvoices.filter(i => i.status === "settled");
              const awaitingTotal = awaitingItems.reduce((acc, curr) => acc + curr.amount, 0);
              const awaitingCount = awaitingItems.length;

              const stats = workspaceType === "brand"
                ? [
                    { label: "Total Paid Volume", value: `$${displayPaidVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: "+12.4%", icon: TrendingUp },
                    {
                      label: "Awaiting Approval",
                      value: `$${awaitingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      count: `${awaitingCount} invoice${awaitingCount !== 1 ? "s" : ""}`,
                      icon: Clock
                    },
                    { label: "Autosplit Fee Savings", value: `$${displayAutosplitSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, detail: "Single payment rail", icon: ShieldCheck }
                  ]
                : [
                    { label: "Total Billed", value: `$${liveFunctionalInvoices.reduce((a, b) => a + b.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: "+15.2%", icon: TrendingUp },
                    {
                      label: "Pending Revenue",
                      value: `$${awaitingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                      count: `${awaitingCount} invoice${awaitingCount !== 1 ? "s" : ""}`,
                      icon: Clock
                    }
                  ];

              return stats.map((stat, idx) => {
                const isAwaitingApproval = stat.label === "Awaiting Approval";
              return (
                <div 
                  key={idx} 
                  className="bg-[#050505] rounded-xl border border-white/20 p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-[#8f8f8f] uppercase tracking-wider flex items-center gap-1">
                      {stat.label}
                    </span>
                    <stat.icon className="h-4 w-4 text-[#8f8f8f]" />
                  </div>
                  <div className="mt-2.5">
                    <p className="text-lg font-bold text-white tracking-tight">{stat.value}</p>
                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1 font-semibold">
                      {stat.trend && <span className="text-emerald-500 font-bold">{stat.trend}</span>}
                      {stat.count || stat.detail}
                    </p>
                  </div>
                </div>
              );
              });
            })()}
          </div>          {/* Pending Invoices Table */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 shadow-sm overflow-hidden mt-6">
            <div className="p-6 border-b border-white/20 bg-white/[0.01] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight">agncypay</span>
                <span className="text-neutral-500 font-medium text-xs">•</span>
                <span className="text-neutral-400 font-semibold text-xs">
                  Pending Invoices (Unpaid)
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {isFetchingInvoices ? (
                <InvoiceFetchingLoader title="Loading Pending Invoices" subtitle="Fetching platform and manual ledgers..." count={2} />
              ) : pendingInvoices.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center bg-black/40">
                  <CheckCircle2 className="h-8 w-8 text-[#10b95f] mx-auto mb-3 opacity-80" />
                  <p className="text-sm font-bold text-white">No pending invoices</p>
                  <p className="text-xs text-neutral-400 mt-1">All campaign ledgers are currently settled.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/20 bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-[#8f8f8f]">
                      <th className="py-4 pl-6 font-semibold">Invoice</th>
                      <th className="py-4 font-semibold">Payer</th>
                      <th className="py-4 font-semibold">Job</th>
                      <th className="py-4 font-semibold">Total</th>
                      <th className="py-4 pr-6 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {pendingInvoices.slice(0, 4).map((inv) => (
                      <tr key={inv.id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="py-4 pl-6 text-xs font-mono text-[#8f8f8f]">
                          <div className="flex items-center gap-1.5">
                            {inv.isCrmSynced && inv.providerLogo && (
                              <img src={inv.providerLogo} alt="CRM" className="h-3.5 w-3.5 object-contain shrink-0" title="CRM Synced Invoice" />
                            )}
                            <span>#{inv.id.substring(0, 8).toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="py-4 font-bold text-white max-w-[140px] truncate" title={inv.agency}>
                          {inv.agency}
                        </td>
                        <td className="py-4">
                          <p className="text-white font-medium">{inv.campaign}</p>
                          <p className="text-[10px] text-[#8f8f8f]">Due {inv.dueDate}</p>
                        </td>
                        <td className="py-4 font-bold text-white">
                          ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => router.push(`/agencydashboard/invoices`)}
                              className="p-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-white transition-all cursor-pointer flex items-center justify-center"
                              title="View Invoice Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-[10px] font-bold text-neutral-500">Awaiting Payer</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {pendingInvoices.length > 4 && (
              <div className="p-4 bg-white/[0.01] border-t border-white/10 flex justify-center items-center">
                <button
                  type="button"
                  onClick={() => router.push("/agencydashboard/invoices")}
                  className="px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <span>View All ({pendingInvoices.length}) Invoices</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Open an Account Banner under Pending Invoices */}
          <div className="mt-6 w-full h-[300px] md:h-[360px] rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-[1.005] duration-300 relative">
            <img 
              src="/models/homepagebottomimage1.png" 
              alt="Open an Account" 
              className="w-full h-full object-cover block"
            />
          </div>

          {/* Empty State for Agency */}
          {workspaceType === "agency" && !activeInvoice && (
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-8 text-center shadow-sm mt-6">
              <CheckCircle2 className="h-8 w-8 text-[#10b95f] mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-white">No Invoices Found</h3>
              <p className="text-xs text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                You haven't created any invoices yet. Click the "+ New Invoice" button to issue your first split campaign invoice.
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Integrations and Ledger */}
        <div id="integrations-ledger-section" className="lg:col-span-4 space-y-6">
          
          {/* Integrations Panel */}
          <IntegrationsPanel />

            {/* Recent Transactions Ledger */}
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/20">
                Recent Transactions
              </h3>

              <div className="mt-4 space-y-4">
                {(() => {
                  const realTxs = widgetInvoices.filter(inv =>
                    workspaceType === "brand" ? inv.status === "paid" : inv.talentPayoutStatus === "disbursed"
                  );
                  
                  if (realTxs.length === 0) {
                    return (
                      <div className="py-6 text-center text-xs text-neutral-500 font-semibold">
                        No recent transactions found
                      </div>
                    );
                  }

                  return realTxs.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-start gap-4 text-xs">
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate leading-tight">{tx.campaign}</p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-[#8f8f8f] font-semibold">
                          <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span>•</span>
                          <span>{workspaceType === "brand" ? "Net-30" : "Net-0 (Instant)"}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-white">${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <span className="text-[10px] text-white font-bold block mt-0.5">{workspaceType === "brand" ? "ACH Direct" : "AgncyPay Wallet"}</span>
                      </div>
                    </div>
                  ));
                })()}
              </div>
          </div>

          {/* Connected Banking Feeds */}
          <div className="bg-[#0A0A0A] light:bg-white rounded-xl border border-white/10 light:border-black/10 overflow-hidden shadow-sm flex flex-col">
            <div className="p-5 border-b border-white/10 light:border-black/10 bg-white/[0.01] light:bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#8f8f8f] light:text-[#475569]">CONNECTED BANKING FEEDS</h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">Real-time commercial balances verified via Plaid</p>
              </div>
              <button
                type="button"
                onClick={handleConnectPlaid}
                disabled={isPlaidLoading}
                className="px-3.5 py-1.5 rounded-lg bg-white light:bg-black border border-white light:border-black text-black light:text-white text-[11px] font-bold hover:bg-neutral-200 light:hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isPlaidLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-black light:text-white" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5 text-black light:text-white" />
                    + Connect Bank (Plaid)
                  </>
                )}
              </button>
            </div>

            {plaidError && (
              <div className="p-3 bg-white/10 light:bg-slate-100 border-b border-white/20 light:border-black/20 text-white light:text-black text-xs font-semibold flex items-center justify-between px-5">
                <span>{plaidError}</span>
                <button onClick={() => setPlaidError(null)} className="text-white light:text-black hover:opacity-75 cursor-pointer">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            
            <div className="p-5 flex flex-col gap-3 bg-white/[0.01] light:bg-white">
              {plaidAccounts.length > 0 ? (
                plaidAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-white/15 light:border-black/15 bg-white/[0.03] light:bg-slate-50 hover:border-white/30 light:hover:border-black/30 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-12 rounded-lg border border-white/15 light:border-black/15 bg-black flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                        {getCardImage(acc.institutionName) ? (
                          <img src={getCardImage(acc.institutionName)!} alt={acc.name} className="h-full w-full object-cover bg-white" />
                        ) : (
                          <Building2 className="h-6 w-6 text-white light:text-black" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[13px] font-bold text-white light:text-black">{acc.institutionName} — {acc.name}</h4>
                        </div>
                        <p className="text-[11px] font-medium text-neutral-400 mt-0.5 font-mono">
                          {acc.subtype?.toUpperCase()} ••••{acc.mask}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[14px] font-bold text-white light:text-black font-mono block">
                          ${acc.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">Available Balance</span>
                      </div>
                      <button
                        onClick={() => handleDisconnectPlaidAccount(acc.id)}
                        title="Disconnect Bank Feed"
                        className="p-1.5 rounded-lg border border-white/10 light:border-black/10 bg-white/5 light:bg-white text-neutral-400 light:text-neutral-500 hover:text-white light:hover:text-black hover:border-white/30 light:hover:border-black/30 transition-all cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs font-medium text-neutral-500">
                  No bank feeds connected. Click &quot;+ Connect Bank (Plaid)&quot; above to link your commercial checking or treasury account.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-black py-8 text-xs text-neutral-400 mt-12">
        <div className="max-w-[1520px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/agncypaybrand.png" alt="AgncyPay" className="h-8 w-auto filter contrast-125" />
            <p>© 2026 AgncyPay. All rights reserved.</p>
          </div>
          <div className="flex gap-6 font-semibold">
            <a href="#" className="hover:text-white transition-colors">Integration Help</a>
            <a href="#" className="hover:text-white transition-colors">ERP Integration API</a>
            <a href="#" className="hover:text-white transition-colors">Security Rules</a>
          </div>
        </div>
      </footer>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {isNewInvoiceOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[480px] max-h-[85vh] overflow-y-auto rounded-3xl border border-white/20 light:border-black/15 bg-[#0A0A0A] light:bg-white p-6 sm:p-7 shadow-2xl relative text-left my-auto text-white light:text-[#0F172A]"
            >
              <div className="pb-4 border-b border-white/20 light:border-black/15 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white light:text-[#0F172A] tracking-tight">
                    Create New Invoice
                  </h2>
                  <p className="text-[11px] text-neutral-400 light:text-[#475569] mt-1">
                    Issue a campaign split invoice. Payout structures (15% agency, 85% talent) will auto-generate.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="p-2 rounded-xl text-neutral-400 light:text-[#475569] hover:bg-white/10 light:hover:bg-black/5 hover:text-white light:hover:text-[#0F172A] transition-colors cursor-pointer shrink-0"
                  title="Close Modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="mt-6 space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Autumn Brand Socials"
                    value={newCampaign}
                    onChange={(e) => setNewCampaign(e.target.value)}
                    className="mt-2 h-11 w-full border border-white/20 bg-black rounded-lg px-4 text-xs font-semibold text-white outline-none focus:border-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Select Brand Client
                  </label>
                  <select
                    required
                    value={selectedBrandEmail}
                    onChange={(e) => setSelectedBrandEmail(e.target.value)}
                    className="mt-2 h-11 w-full border border-white/20 bg-black rounded-lg px-4 text-xs font-semibold text-white outline-none focus:border-white transition-all cursor-pointer"
                  >
                    {registeredBrands.length === 0 ? (
                      <option value="" disabled>No registered brands found</option>
                    ) : (
                      registeredBrands.map((b) => (
                        <option key={b.uid} value={b.email} className="bg-[#0A0A0A] text-white">
                          {b.workspaceName} ({b.email})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Select Talent
                    </label>
                    <select
                      value={selectedTalentEmail}
                      onChange={(e) => setSelectedTalentEmail(e.target.value)}
                      disabled={newSplits.length > 0}
                      className={`mt-2 h-11 w-full border border-white/20 bg-black rounded-lg px-4 text-xs font-semibold text-white outline-none focus:border-white transition-all cursor-pointer ${newSplits.length > 0 ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <option value="">Select Talent (Optional)</option>
                      {registeredTalents.map((t) => (
                        <option key={t.uid} value={t.email} className="bg-[#0A0A0A] text-white">
                          {t.fullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                      Invoice Total ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      readOnly={newSplits.length > 0}
                      placeholder="e.g. 14999.98"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className={`mt-2 h-11 w-full border border-white/20 bg-black rounded-lg px-4 text-xs font-semibold text-white outline-none focus:border-white transition-all ${newSplits.length > 0 ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                  </div>
                </div>

                {/* Multi-Talent Splits Builder Section */}
                <div className="border border-white/10 rounded-xl p-3 bg-white/[0.01] space-y-3">
                  <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    Campaign splits (Multi-Talent Payouts)
                  </span>

                  {newSplits.length > 0 && (
                    <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
                      {newSplits.map((split, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-[11px]">{split.talentName}</span>
                            <span className="text-[9px] text-neutral-400 font-mono">{split.talentEmail}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#13d463] font-semibold">${split.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const next = newSplits.filter((_, i) => i !== idx);
                                setNewSplits(next);
                                const sum = next.reduce((acc, cur) => acc + cur.amount, 0);
                                if (sum > 0) {
                                  setNewAmount((sum / 0.85).toFixed(2));
                                } else {
                                  setNewAmount("");
                                  setSelectedTalentEmail("");
                                }
                              }}
                              className="text-red-400 hover:text-red-300 font-bold px-1 text-sm cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <select
                        value={splitTalentEmail}
                        onChange={(e) => setSplitTalentEmail(e.target.value)}
                        className="h-9 w-full border border-white/10 bg-black rounded-lg px-2 text-[11px] font-semibold text-white outline-none focus:border-white transition-all cursor-pointer"
                      >
                        <option value="">Choose Talent</option>
                        {registeredTalents
                          .filter(t => !newSplits.some(s => s.talentEmail === t.email))
                          .map((t) => (
                            <option key={t.uid} value={t.email} className="bg-[#0A0A0A] text-white">
                              {t.fullName}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <div className="w-[85px]">
                      <input
                        type="number"
                        placeholder="USD ($)"
                        value={splitAmount}
                        onChange={(e) => setSplitAmount(e.target.value)}
                        className="h-9 w-full border border-white/10 bg-black rounded-lg px-2 text-[11px] font-semibold text-white outline-none focus:border-white transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!splitTalentEmail || !splitAmount) return;
                        const talentUser = registeredTalents.find(t => t.email === splitTalentEmail);
                        if (!talentUser) return;
                        const amt = parseFloat(splitAmount);
                        if (isNaN(amt) || amt <= 0) return;

                        const next = [...newSplits, {
                          talentName: talentUser.fullName,
                          talentEmail: splitTalentEmail,
                          amount: amt,
                          status: "pending" as const
                        }];
                        setNewSplits(next);
                        
                        const sum = next.reduce((acc, cur) => acc + cur.amount, 0);
                        setNewAmount((sum / 0.85).toFixed(2));

                        if (next.length === 1) {
                          setSelectedTalentEmail(splitTalentEmail);
                        }

                        setSplitTalentEmail("");
                        setSplitAmount("");
                      }}
                      className="h-9 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-all cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>

                  {newSplits.length > 0 && (
                    <div className="text-[10px] text-neutral-400 space-y-0.5 pt-1 border-t border-white/5 font-medium leading-4">
                      <div className="flex justify-between">
                        <span>Total Talent Payout (85%):</span>
                        <span className="font-semibold text-white">${newSplits.reduce((acc, cur) => acc + cur.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Agency Commission (15%):</span>
                        <span className="font-semibold text-white">${(newSplits.reduce((acc, cur) => acc + cur.amount, 0) * 0.15 / 0.85).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                    className="mt-2 h-11 w-full border border-white/20 bg-black rounded-lg px-4 text-xs font-semibold text-white outline-none focus:border-white transition-all [color-scheme:dark]"
                  />
                </div>

                <div className="pt-4 border-t border-white/20 flex gap-3 justify-end text-xs">
                  <button
                    type="button"
                    onClick={() => setIsNewInvoiceOpen(false)}
                    className="h-10 px-4 rounded-lg border border-white/20 bg-[#050505] font-bold text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingInvoice}
                    className="h-10 px-5 rounded-lg bg-white hover:bg-neutral-200 text-black font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 animate-pulse"
                  >
                    {isCreatingInvoice ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-black" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 text-black" />
                        Create Invoice
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Plaid Institution Link Sandbox Modal */}
      {isPlaidModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] light:bg-white border border-white/20 light:border-black/15 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/10 light:border-black/10 flex items-center justify-between bg-white/[0.02] light:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 light:bg-slate-200 border border-white/20 light:border-black/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5 text-white light:text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white light:text-black">Link Bank Account</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 light:bg-slate-200 text-white light:text-black border border-white/20 light:border-black/20">
                      Verified by Plaid
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 light:text-neutral-500 mt-0.5">Select an institution to connect your commercial banking feed</p>
                </div>
              </div>
              <button
                onClick={() => !connectingBankName && setIsPlaidModalOpen(false)}
                className="p-1.5 rounded-lg border border-white/10 light:border-black/10 text-neutral-400 hover:text-white light:hover:text-black hover:bg-white/5 light:hover:bg-slate-200 transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p className="text-xs font-semibold text-neutral-400 light:text-neutral-500 uppercase tracking-wider">Major Commercial Institutions</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePlaidBanks.map((bank) => {
                  const isConnected = plaidAccounts.some(acc => acc.institutionName === bank.institutionName);
                  const isThisConnecting = connectingBankName === bank.institutionName;

                  return (
                    <button
                      key={bank.institutionName}
                      onClick={() => !isConnected && !connectingBankName && handleSelectPlaidBank(bank)}
                      disabled={isConnected || !!connectingBankName}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all relative overflow-hidden ${
                        isConnected 
                          ? "bg-white/[0.02] light:bg-slate-100 border-white/10 light:border-black/10 opacity-50 cursor-not-allowed"
                          : isThisConnecting
                          ? "bg-white/10 light:bg-slate-200 border-white/40 light:border-black/40 cursor-wait"
                          : "bg-white/[0.03] light:bg-slate-50 border-white/15 light:border-black/15 hover:border-white/40 light:hover:border-black/40 hover:bg-white/[0.06] light:hover:bg-slate-100 cursor-pointer shadow-sm hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-white/10 light:bg-white border border-white/15 light:border-black/15 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-white light:text-black" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white light:text-black leading-tight">{bank.institutionName}</p>
                            <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">••••{bank.mask}</p>
                          </div>
                        </div>
                        {isConnected && (
                          <span className="text-[10px] font-extrabold text-white light:text-black px-2 py-0.5 bg-white/10 light:bg-slate-200 rounded-full border border-white/20 light:border-black/20">
                            Linked
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 light:border-black/10 pt-2.5 mt-1">
                        <span className="text-[10px] text-neutral-400 font-medium">{bank.name}</span>
                        {isThisConnecting ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white light:text-black">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Linking...</span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold font-mono text-white light:text-black">
                            ${bank.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-white/[0.01] light:bg-slate-50 border-t border-white/10 light:border-black/10 flex items-center justify-between text-xs text-neutral-500 px-6">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-white light:text-black" />
                256-bit AES end-to-end encryption via Plaid
              </span>
              <button 
                onClick={() => !connectingBankName && setIsPlaidModalOpen(false)}
                className="font-bold text-white light:text-black hover:underline cursor-pointer"
              >
                Close Sandbox
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
