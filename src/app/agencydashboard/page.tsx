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
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [linkedCards, setLinkedCards] = useState<any[]>([]);
  const [isPayingAll, setIsPayingAll] = useState(false);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [payoutingInvoiceId, setPayoutingInvoiceId] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [registeredBrands, setRegisteredBrands] = useState<FirestoreUser[]>([]);
  const [registeredTalents, setRegisteredTalents] = useState<FirestoreUser[]>([]);
  const [selectedBrandEmail, setSelectedBrandEmail] = useState("");
  const [selectedTalentEmail, setSelectedTalentEmail] = useState("");



  useEffect(() => {
    setMounted(true);
    async function loadData() {
      const brands = await getRegisteredBrands();
      const userEmail = state.user?.email || "";
      const accountType = state.user?.accountType || "agency";
      
      let talents: FirestoreUser[] = [];
      if (accountType === "agency" && userEmail) {
        talents = await getRegisteredTalentsByAgency(userEmail);
      } else {
        talents = await getRegisteredTalents();
      }
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
  const [showAllPaid, setShowAllPaid] = useState(false);
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

  const handlePayInvoice = (id: string) => {
    const userEmail = state.user?.email || "";
    setPayingInvoiceId(id);
    setTimeout(() => {
      setWidgetInvoices((prev) => {
        const next = prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv));
        localStorage.setItem(`brand_widget_invoices_${userEmail}`, JSON.stringify(next));
        
        const paidInvoice = prev.find((inv) => inv.id === id);
        if (paidInvoice) {
          const amt = paidInvoice.amount;
          setLivePaidVolume((v) => {
            const nv = v + amt;
            localStorage.setItem(`brand_stats_paid_volume_${userEmail}`, nv.toString());
            return nv;
          });
          setLiveAutosplitSavings((v) => {
            const nv = v + amt * 0.015;
            localStorage.setItem(`brand_stats_autosplit_savings_${userEmail}`, nv.toString());
            return nv;
          });

          // Add notification
          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `Brand paid invoice to ${paidInvoice.agency} ($${paidInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${paidInvoice.campaign}`,
            timestamp: "Just now",
            unread: true,
          };
          setNotifications((notifs) => {
            const updated = [newNotif, ...notifs];
            localStorage.setItem(`agency_notifications_${userEmail}`, JSON.stringify(updated));
            return updated;
          });
        }
        return next;
      });
      setPayingInvoiceId(null);
      window.dispatchEvent(new Event("syncAgencyDashboard"));
    }, 1500);
  };

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

  const handlePayAll = async () => {
    const userEmail = state.user?.email || "";
    setIsPayingAll(true);
    setProcessingStage("verifying");

    setTimeout(async () => {
      setProcessingStage("routing");
      try {
        const unpaid = widgetInvoices.filter((inv) => inv.status === "pending");
        const totalPaid = unpaid.reduce((sum, inv) => sum + inv.amount, 0);

        // Perform updates in Firestore
        for (const inv of unpaid) {
          await updateInvoiceStatus(inv.id, "paid", "pending");
        }

        if (totalPaid > 0) {
          setLivePaidVolume((v) => {
            const nv = v + totalPaid;
            localStorage.setItem(`brand_stats_paid_volume_${userEmail}`, nv.toString());
            return nv;
          });
          setLiveAutosplitSavings((v) => {
            const nv = v + totalPaid * 0.015;
            localStorage.setItem(`brand_stats_autosplit_savings_${userEmail}`, nv.toString());
            return nv;
          });

          // Add notifications to localStorage
          const localNotifs = localStorage.getItem(`agency_notifications_${userEmail}`);
          const notifs = localNotifs ? JSON.parse(localNotifs) : [];
          const newNotifs = unpaid.map((inv, idx) => ({
            id: `notif-${Date.now()}-${idx}`,
            message: `Brand paid invoice to ${inv.agency} ($${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${inv.campaign}`,
            timestamp: "Just now",
            unread: true,
          }));
          localStorage.setItem(`agency_notifications_${userEmail}`, JSON.stringify([...newNotifs, ...notifs]));
        }

        // Show success state
        setProcessingStage("success");
        setTimeout(() => {
          setIsPayingAll(false);
          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncAgencyDashboard"));
        }, 1800);
      } catch (e) {
        console.error("Error paying all invoices in Firestore:", e);
        setIsPayingAll(false);
        setProcessingStage("idle");
      }
    }, 1200);
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

  // Derived Pending and Paid invoice lists
  const pendingInvoices = combinedAllInvoices.filter((inv) => inv.status === "pending");
  const paidInvoices = combinedAllInvoices.filter((inv) => inv.status === "paid");

  const pendingTotal = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingTotalWithFee = pendingTotal + (pendingTotal * 0.015);

  const selectedPendingInvoices = pendingInvoices.filter((inv) => selectedPendingIds.includes(inv.id));
  const selectedPendingTotal = selectedPendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const selectedTotalWithFee = selectedPendingTotal + (selectedPendingTotal * 0.015);

  const paidTotal = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const handleSelectAllPending = () => {
    if (selectedPendingIds.length === pendingInvoices.length) {
      setSelectedPendingIds([]);
    } else {
      setSelectedPendingIds(pendingInvoices.map((i) => i.id));
    }
  };

  const handleTogglePendingSelect = (id: string) => {
    setSelectedPendingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBatchPaySelected = async () => {
    if (selectedPendingIds.length === 0) return;
    const userEmail = state.user?.email || "";
    setIsPayingAll(true);
    setProcessingStage("verifying");

    setTimeout(async () => {
      setProcessingStage("routing");
      try {
        const selectedInvoices = pendingInvoices.filter((inv) => selectedPendingIds.includes(inv.id));
        const totalPaid = selectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        for (const inv of selectedInvoices) {
          await updateInvoiceStatus(inv.id, "paid", "pending");
        }

        if (totalPaid > 0) {
          setLivePaidVolume((v) => {
            const nv = v + totalPaid;
            localStorage.setItem(`brand_stats_paid_volume_${userEmail}`, nv.toString());
            return nv;
          });
          setLiveAutosplitSavings((v) => {
            const nv = v + totalPaid * 0.015;
            localStorage.setItem(`brand_stats_autosplit_savings_${userEmail}`, nv.toString());
            return nv;
          });

          const localNotifs = localStorage.getItem(`agency_notifications_${userEmail}`);
          const notifs = localNotifs ? JSON.parse(localNotifs) : [];
          const newNotifs = selectedInvoices.map((inv, idx) => ({
            id: `notif-${Date.now()}-${idx}`,
            message: `Brand paid invoice to ${inv.agency} ($${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${inv.campaign}`,
            timestamp: "Just now",
            unread: true,
          }));
          localStorage.setItem(`agency_notifications_${userEmail}`, JSON.stringify([...newNotifs, ...notifs]));
        }

        setSelectedPendingIds([]);
        setProcessingStage("success");
        setTimeout(() => {
          setIsPayingAll(false);
          setProcessingStage("idle");
          window.dispatchEvent(new Event("syncAgencyDashboard"));
        }, 1500);
      } catch (e) {
        console.error("Error batch paying selected invoices:", e);
        setIsPayingAll(false);
        setProcessingStage("idle");
      }
    }, 1200);
  };

  const handlePayoutTalent = (id: string) => {
    setPayoutingInvoiceId(id);
    setTimeout(() => {
      setWidgetInvoices((prev) => {
        const next = prev.map((inv) => (inv.id === id ? { ...inv, talentPayoutStatus: "disbursed" } : inv));
        localStorage.setItem("brand_widget_invoices", JSON.stringify(next));

        const targetInvoice = prev.find((inv) => inv.id === id);
        if (targetInvoice) {
          const totalAmount = targetInvoice.amount;
          const agencyFee = totalAmount * 0.15;
          const talentPayout = totalAmount - agencyFee;

          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `${targetInvoice.agency} paid talent ${targetInvoice.talent} ($${talentPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}) after deducting 15% agency fee ($${agencyFee.toLocaleString(undefined, { minimumFractionDigits: 2 })})`,
            timestamp: "Just now",
            unread: true,
          };
          setNotifications((notifs) => {
            const updated = [newNotif, ...notifs];
            localStorage.setItem("agency_notifications", JSON.stringify(updated));
            return updated;
          });
        }
        return next;
      });
      setPayoutingInvoiceId(null);
      window.dispatchEvent(new Event("syncAgencyDashboard"));
    }, 1500);
  };

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
              {workspaceType === "brand" ? "Invoice Queue" : "Invoice History"}
            </button>
            
            
          </nav>
 
          <div className="flex items-center gap-3">
            {workspaceType === "agency" && (
              <>
                <button
                  onClick={() => router.push("/agencydashboard/agencybanking")}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white light:bg-[#0F172A] text-black light:text-white hover:bg-neutral-200 light:hover:bg-[#1E293B] border border-white/20 light:border-black/10 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Landmark className="h-3.5 w-3.5" />
                  Switch to Agency Banking
                </button>
                <div className="h-4 w-[1px] bg-white/20" />
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-xs font-semibold text-[#8f8f8f] hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Talent View
                </button>
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
          </div>          {/* TABLE 1: PENDING INVOICES (PLATFORM & MANUAL WITH BATCH PAY) */}
          <div className={`rounded-[13px] border p-4 sm:p-5 shadow-sm flex flex-col min-h-[280px] mt-6 ${
            isLightTheme ? "bg-white border-black/10 text-[#0F172A]" : "bg-[#0D0D0D] border-[#3a3a3a] text-white"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-white/10 light:border-black/10 gap-3">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-1.5 shadow-sm border ${
                  isLightTheme ? "bg-black/5 border-black/15 text-[#0F172A]" : "bg-[#082315] border-[#10b95f]/30 text-[#70ff9e]"
                }`}>
                  <FileText className={`h-4 w-4 ${isLightTheme ? "text-[#0F172A]" : "text-[#70ff9e]"}`} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                      Pending Invoices ({pendingInvoices.length})
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/25">
                      Awaiting Payment
                    </span>
                  </div>
                  <p className={`text-[10px] ${isLightTheme ? "text-[#475569]" : "text-neutral-500"} mt-0.5`}>
                    {workspaceType === "brand" ? "Pending approval & settlement" : "Awaiting payer settlement"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {pendingInvoices.length > 0 && workspaceType === "brand" && (
                  <>
                    <button
                      type="button"
                      onClick={handleSelectAllPending}
                      className={`h-7 px-3 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                        isLightTheme ? "bg-black/5 border-black/15 text-[#0F172A] hover:bg-black/10" : "bg-neutral-900 border-[#3a3a3a] text-neutral-300 hover:text-white"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPendingIds.length === pendingInvoices.length && pendingInvoices.length > 0}
                        onChange={handleSelectAllPending}
                        className="rounded border-neutral-700 bg-black text-[#70ff9e] focus:ring-0 cursor-pointer"
                      />
                      <span>Select All ({pendingInvoices.length})</span>
                    </button>

                    {selectedPendingIds.length > 0 ? (
                      <button
                        onClick={handleBatchPaySelected}
                        disabled={isPayingAll || payingInvoiceId !== null}
                        className="h-7 px-3.5 bg-white light:bg-[#0F172A] text-black light:text-white hover:bg-neutral-200 text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow active:scale-[0.98]"
                      >
                        {isPayingAll ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3" />
                            Pay Selected ({selectedPendingIds.length}) · ${selectedTotalWithFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handlePayAll}
                        disabled={isPayingAll || payingInvoiceId !== null}
                        className="h-7 px-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white light:text-[#0F172A] text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        Pay All · ${pendingTotalWithFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </button>
                    )}
                  </>
                )}

                <Link
                  href="/agencydashboard/invoices"
                  className={`h-7 px-3 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
                    isLightTheme
                      ? "bg-black/5 border-black/15 text-[#0F172A] hover:bg-black/10"
                      : "bg-neutral-900 border-[#3a3a3a] text-neutral-300 hover:text-white"
                  }`}
                >
                  <span>View All</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {isFetchingInvoices ? (
              <InvoiceFetchingLoader title="Loading Pending Invoices" subtitle="Fetching platform and manual ledgers..." count={2} />
            ) : pendingInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-grow py-8 text-xs text-neutral-500 text-center font-semibold">
                <CheckCircle2 className="h-7 w-7 text-[#10b95f] mx-auto mb-2 opacity-80" />
                No pending invoices awaiting payment.
              </div>
            ) : (
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse text-xs select-text">
                  <thead>
                    <tr className="border-b border-[#222] text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                      {workspaceType === "brand" && <th className="pb-2 pl-2 w-8"></th>}
                      <th className="pb-2">Invoice #</th>
                      <th className="pb-2">{workspaceType === "brand" ? "Agency / Issuer" : "Payer"}</th>
                      <th className="pb-2">Campaign & Talent</th>
                      <th className="pb-2">Due Date</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {pendingInvoices.map((inv) => {
                      const isSelected = selectedPendingIds.includes(inv.id);

                      return (
                        <tr key={inv.id} className={`hover:bg-white/[0.02] transition-colors group ${isSelected ? "bg-white/[0.03]" : ""}`}>
                          {workspaceType === "brand" && (
                            <td className="py-2.5 pl-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleTogglePendingSelect(inv.id)}
                                className="h-3.5 w-3.5 rounded border-neutral-700 bg-black text-emerald-400 focus:ring-0 cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="py-2.5 font-mono font-bold text-neutral-300 flex items-center gap-1.5">
                            {inv.isCrmSynced && inv.providerLogo && (
                              <img src={inv.providerLogo} alt="CRM" className="h-3.5 w-3.5 object-contain shrink-0" title="CRM Synced Invoice" />
                            )}
                            <span>#{inv.id.substring(0, 8)}</span>
                          </td>
                          <td className="py-2.5 font-bold text-white max-w-[130px] truncate" title={inv.agency}>
                            {inv.agency}
                          </td>
                          <td className="py-2.5">
                            <span className="font-bold text-white block">{inv.campaign}</span>
                            <span className="text-[10px] text-neutral-400">Talent: {inv.talent}</span>
                          </td>
                          <td className="py-2.5 text-neutral-400">{inv.dueDate}</td>
                          <td className="py-2.5 font-mono font-bold text-white">
                            ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/25">
                              Pending Payer
                            </span>
                          </td>
                          <td className="py-2.5 text-right pr-2">
                            {workspaceType === "brand" ? (
                              <button
                                type="button"
                                onClick={() => router.push(`/pay/${inv.id}?mode=logged_in&returnTo=dashboard`)}
                                className="h-6 px-2.5 bg-white text-black hover:bg-neutral-200 font-bold rounded text-[9px] transition-all cursor-pointer inline-flex items-center justify-center active:scale-[0.98]"
                              >
                                Pay Now
                              </button>
                            ) : (
                              <span className="text-[9px] font-bold text-neutral-500">Awaiting Payer</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* TABLE 2: PAID INVOICES (PLATFORM & MANUAL PAYOUTS) */}
          <div className={`rounded-[13px] border p-4 sm:p-5 shadow-sm flex flex-col min-h-[280px] mt-6 ${
            isLightTheme ? "bg-white border-black/10 text-[#0F172A]" : "bg-[#0D0D0D] border-[#3a3a3a] text-white"
          }`}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10 light:border-black/10">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-1.5 shadow-sm border ${
                  isLightTheme ? "bg-black/5 border-black/15 text-[#0F172A]" : "bg-[#082315] border-[#10b95f]/30 text-[#70ff9e]"
                }`}>
                  <Check className={`h-4 w-4 ${isLightTheme ? "text-[#0F172A]" : "text-[#70ff9e]"}`} />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                      Paid Invoices ({paidInvoices.length})
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-[#082315] text-[#70ff9e] border border-[#10b95f]/30">
                      Paid & Settled
                    </span>
                  </div>
                  <p className={`text-[10px] ${isLightTheme ? "text-[#475569]" : "text-neutral-500"} mt-0.5`}>Disbursement ledger for settled campaigns</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold ${isLightTheme ? "text-[#475569]" : "text-neutral-400"}`}>
                  Total Settled: <span className={`font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>${paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </span>
                <Link
                  href="/agencydashboard/invoices"
                  className={`h-7 px-3 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer border ${
                    isLightTheme
                      ? "bg-black/5 border-black/15 text-[#0F172A] hover:bg-black/10"
                      : "bg-neutral-900 border-[#3a3a3a] text-neutral-300 hover:text-white"
                  }`}
                >
                  <span>View All ({paidInvoices.length})</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {isFetchingInvoices ? (
              <InvoiceFetchingLoader title="Loading Paid Invoices" subtitle="Fetching settled disbursement ledger..." count={2} />
            ) : paidInvoices.length === 0 ? (
              <div className={`flex flex-col items-center justify-center flex-grow py-8 text-xs ${isLightTheme ? "text-[#475569]" : "text-neutral-500"} text-center font-semibold`}>
                No paid invoices in ledger yet.
              </div>
            ) : (
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse text-xs select-text">
                  <thead>
                    <tr className={`border-b border-white/10 light:border-black/10 ${isLightTheme ? "text-[#475569]" : "text-neutral-500"} font-bold uppercase tracking-wider text-[10px]`}>
                      <th className="pb-2">Invoice #</th>
                      <th className="pb-2">{workspaceType === "brand" ? "Agency / Issuer" : "Payer"}</th>
                      <th className="pb-2">Campaign & Talent</th>
                      <th className="pb-2">Due Date</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2 text-right pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 light:divide-black/10">
                    {(showAllPaid ? paidInvoices : paidInvoices.slice(0, 3)).map((inv) => {
                      const isDisbursed = inv.talentPayoutStatus === "disbursed";

                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.01] light:hover:bg-black/[0.02] transition-colors group">
                          <td className={`py-2.5 font-mono font-bold ${isLightTheme ? "text-[#0F172A]" : "text-neutral-300"} flex items-center gap-1.5`}>
                            {inv.isCrmSynced && inv.providerLogo && (
                              <img src={inv.providerLogo} alt="CRM" className="h-3.5 w-3.5 object-contain shrink-0" title="CRM Synced Invoice" />
                            )}
                            <span>#{inv.id.substring(0, 8)}</span>
                          </td>
                          <td className={`py-2.5 font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"} max-w-[130px] truncate`} title={inv.agency}>
                            {inv.agency}
                          </td>
                          <td className="py-2.5">
                            <span className={`font-bold block ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>{inv.campaign}</span>
                            <span className={`text-[10px] ${isLightTheme ? "text-[#475569]" : "text-neutral-400"}`}>Talent: {inv.talent}</span>
                          </td>
                          <td className={`py-2.5 ${isLightTheme ? "text-[#475569]" : "text-neutral-400"}`}>{inv.dueDate}</td>
                          <td className={`py-2.5 font-mono font-bold ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                            ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/25">
                              Paid
                            </span>
                          </td>
                          <td className="py-2.5 text-right pr-2">
                            {workspaceType === "brand" ? (
                              <span className="text-[9px] font-bold text-emerald-400">Settled</span>
                            ) : isDisbursed ? (
                              <span className={`text-[9px] font-bold ${isLightTheme ? "text-[#475569]" : "text-neutral-400"}`}>Talent Paid (85%)</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => router.push(`/payout/${inv.id}?returnTo=dashboard`)}
                                className={`h-6 px-2.5 font-bold rounded text-[9px] transition-all cursor-pointer inline-flex items-center justify-center active:scale-[0.98] ${
                                  isLightTheme ? "bg-[#0F172A] text-white hover:bg-[#1E293B]" : "bg-emerald-500 text-black hover:bg-emerald-600"
                                }`}
                              >
                                Payout Talent (85%)
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Agency Notifications Banners */}
          {workspaceType === "agency" && notifications.length > 0 && (
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm mt-6">
              <h4 className="text-[11px] font-bold text-[#8f8f8f] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Agency Payout Notifications
              </h4>
              <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className="p-3 bg-[#082315]/40 border border-[#10b95f]/20 rounded-xl flex items-center justify-between gap-4 text-[11px] shadow-sm hover:border-[#10b95f]/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-5 w-5 rounded-full bg-[#082315] border border-[#10b95f]/30 flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-[#70ff9e]" />
                      </div>
                      <span className="text-[#e1e1e6] font-medium truncate">{n.message}</span>
                    </div>
                    <span className="text-[9px] text-neutral-500 shrink-0 font-semibold">{n.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State for Agency */}
          {workspaceType === "agency" && !activeInvoice && (
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-8 text-center shadow-sm mt-6">
              <CheckCircle2 className="h-8 w-8 text-[#10b95f] mx-auto mb-3 animate-pulse" />
              <h3 className="text-sm font-bold text-white">No Invoices Found</h3>
              <p className="text-xs text-neutral-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                You haven't created any invoices yet. Click the "+ New Invoice" button to issue your first split campaign invoice.
              </p>
            </div>
          )}          {/* Agency Notifications Banners */}
          {workspaceType === "agency" && notifications.length > 0 && (
            <div className="bg-[#050505] light:bg-white rounded-2xl border border-white/20 light:border-black/10 p-5 shadow-sm mt-6">
              <h4 className="text-[11px] font-bold text-[#8f8f8f] light:text-[#475569] uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Agency Payout Notifications
              </h4>
              <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className="p-3 bg-[#082315]/40 light:bg-emerald-500/10 border border-[#10b95f]/20 rounded-xl flex items-center justify-between gap-4 text-[11px] shadow-sm hover:border-[#10b95f]/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-5 w-5 rounded-full bg-[#082315] border border-[#10b95f]/30 flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-[#70ff9e]" />
                      </div>
                      <span className="text-[#e1e1e6] light:text-[#0F172A] font-medium truncate">{n.message}</span>
                    </div>
                    <span className="text-[9px] text-neutral-500 light:text-[#475569] shrink-0 font-semibold">{n.timestamp}</span>
                  </div>
                ))}
              </div>
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

          {/* Banks and Cards */}
          <BanksAndCardsPanel />

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

      {/* Page-level payment processing loader overlay */}
      {isPayingAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-[2px]">
          <section className="w-full max-w-[300px] rounded-[10px] border border-[#2f2f2f] bg-[#202020] p-6 text-center shadow-2xl">
            {(processingStage === "idle" || processingStage === "verifying") && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#555] bg-[#151515]">
                  <Lock className="h-7 w-7 animate-pulse text-white" />
                </div>
                <h2 className="mt-5 text-[23px] font-bold tracking-[-0.03em] text-white">verifying</h2>
                <p className="mt-2 text-[11px] leading-5 text-[#bdbdbd]">Securing the payment session.</p>
              </>
            )}
            {processingStage === "routing" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#555] bg-[#151515]">
                  <Loader2 className="h-7 w-7 animate-spin text-white" />
                </div>
                <h2 className="mt-5 text-[23px] font-bold tracking-[-0.03em] text-white">processing</h2>
                <p className="mt-2 text-[11px] leading-5 text-[#bdbdbd]">Routing funds to nodes.</p>
              </>
            )}
            {processingStage === "success" && (
              <>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#16c95f] text-white shadow-[0_0_28px_rgba(22,201,95,0.3)]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h2 className="mt-5 text-[23px] font-bold tracking-[-0.03em] text-[#69f39b]">Success</h2>
                <p className="mt-2 text-[11px] leading-5 text-[#c8f5d5]">Invoices successfully paid.</p>
              </>
            )}
          </section>
        </div>
      )}

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


    </main>
  );
}
