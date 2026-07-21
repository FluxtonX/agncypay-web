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
  Sun,
  Moon,
  Plus,
  Wallet,
  CreditCard,
  X
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

export default function BrandDashboardPage() {
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
  const [isPayingAll, setIsPayingAll] = useState(false);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [payoutingInvoiceId, setPayoutingInvoiceId] = useState<string | null>(null);

  // Deposit Balance and Cards State
  const [depositedBalance, setDepositedBalance] = useState(25000);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("1000");
  const [selectedCardId, setSelectedCardId] = useState("card-1");
  const [showAddCard, setShowAddCard] = useState(false);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  const [newCardHolder, setNewCardHolder] = useState("");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardCVC, setNewCardCVC] = useState("");
  const [newCardZip, setNewCardZip] = useState("");

  const [linkedCards, setLinkedCards] = useState([
    { id: "card-1", name: "Chase Ink Business Unlimited Visa", detail: "Visa ****86", cardImage: "/chase-ink-business-unlimited.png", fallback: "Chase" },
    { id: "card-2", name: "Mercury Business IO Mastercard", detail: "Mastercard ****57", cardImage: "/mercurycard.png", fallback: "Mercury" },
    { id: "card-3", name: "Bank of America Business Debit", detail: "Debit ****88", cardImage: "https://business.bankofamerica.com/content/dam/consumer/business/deposits/checking-accounts/debit-cards/bofa_busdbtcm_v.png", fallback: "BoFA" }
  ]);

  const [mounted, setMounted] = useState(false);
  const [registeredBrands, setRegisteredBrands] = useState<FirestoreUser[]>([]);
  const [registeredTalents, setRegisteredTalents] = useState<FirestoreUser[]>([]);
  const [selectedBrandEmail, setSelectedBrandEmail] = useState("");
  const [selectedTalentEmail, setSelectedTalentEmail] = useState("");

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmt = parseFloat(depositAmount);
    if (isNaN(numericAmt) || numericAmt <= 0) return;

    setIsProcessingDeposit(true);
    const userEmail = state.user?.email || "";
    const selectedCard = linkedCards.find((c) => c.id === selectedCardId);
    const cardLabel = selectedCard ? selectedCard.detail : "Card ****86";

    try {
      const updatedBalance = await recordFirestoreDeposit(userEmail, numericAmt, cardLabel);
      setDepositedBalance(updatedBalance);
      localStorage.setItem(`brand_deposited_balance_${userEmail}`, updatedBalance.toString());

      window.dispatchEvent(new Event("syncBrandDashboard"));

      setDepositSuccessMsg(
        `Successfully deposited $${numericAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to AGNCYPAY balance via ${cardLabel}!`
      );

      setTimeout(() => {
        setIsDepositModalOpen(false);
        setIsProcessingDeposit(false);
        setDepositSuccessMsg(null);
      }, 1500);
    } catch (err) {
      console.error("Deposit error:", err);
      const nextB = depositedBalance + numericAmt;
      setDepositedBalance(nextB);
      localStorage.setItem(`brand_deposited_balance_${userEmail}`, nextB.toString());
      window.dispatchEvent(new Event("syncBrandDashboard"));

      setDepositSuccessMsg(
        `Deposited $${numericAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to AGNCYPAY!`
      );
      setTimeout(() => {
        setIsDepositModalOpen(false);
        setIsProcessingDeposit(false);
        setDepositSuccessMsg(null);
      }, 1500);
    }
  };

  const handleAddNewCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardHolder.trim() || !newCardNumber.trim()) return;
    const userEmail = state.user?.email || "";
    const last4 = newCardNumber.replace(/\D/g, "").slice(-4) || "9999";
    const newCardObj = {
      id: `card-${Date.now()}`,
      name: `${newCardHolder.trim()}'s Card`,
      detail: `Visa ****${last4}`,
      cardImage: "/chase-ink-business-unlimited.png",
      fallback: "Card"
    };
    setLinkedCards((prev) => {
      const next = [...prev, newCardObj];
      if (userEmail) {
        localStorage.setItem(`agncypay_user_cards_${userEmail}`, JSON.stringify(next));
      }
      return next;
    });
    setSelectedCardId(newCardObj.id);
    setShowAddCard(false);
    setNewCardHolder("");
    setNewCardNumber("");
    setNewCardExpiry("");
    setNewCardCVC("");
    setNewCardZip("");
  };

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
      setIsLightTheme(document.documentElement.classList.contains("light"));
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.toggle("light");
      setIsLightTheme(isLight);
      localStorage.setItem("agncypay_theme", isLight ? "light" : "dark");
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
        payerEmail: inv.payerEmail || ""
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

    const savedDeposit = localStorage.getItem(`brand_deposited_balance_${userEmail}`);
    if (savedDeposit) setDepositedBalance(parseFloat(savedDeposit));

    const unsubscribeDeposit = subscribeFirestoreDepositBalance(userEmail, (newBalance) => {
      setDepositedBalance(newBalance);
      localStorage.setItem(`brand_deposited_balance_${userEmail}`, newBalance.toString());
    });

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
      const savedDep = localStorage.getItem(`brand_deposited_balance_${userEmail}`);
      if (savedDep) setDepositedBalance(parseFloat(savedDep));
      const localNotifs = localStorage.getItem(`agency_notifications_${userEmail}`);
      if (localNotifs) setNotifications(JSON.parse(localNotifs));
    };

    window.addEventListener("storage", syncStates);
    window.addEventListener("syncBrandDashboard", syncStates);

    return () => {
      clearTimeout(loaderFallbackTimer);
      unsubscribe();
      unsubscribeDeposit();
      window.removeEventListener("storage", syncStates);
      window.removeEventListener("syncBrandDashboard", syncStates);
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
      window.dispatchEvent(new Event("syncBrandDashboard"));
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
          window.dispatchEvent(new Event("syncBrandDashboard"));
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
          window.dispatchEvent(new Event("syncBrandDashboard"));
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
      window.dispatchEvent(new Event("syncBrandDashboard"));
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
      createdDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
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
          window.dispatchEvent(new Event("syncBrandDashboard"));
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
          window.dispatchEvent(new Event("syncBrandDashboard"));
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
      <header className="border-b border-border-custom bg-background/90 sticky top-0 z-50 shadow-sm backdrop-blur">
        <div className="max-w-[1520px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative flex items-center mr-12">
              <Link href="/" className="flex items-center" aria-label="AgncyPay home">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-10 w-auto object-contain scale-[1.3] origin-left"
                />
              </Link>
            </div>
            <span className="h-4 w-[1px] bg-white/20 hidden md:block" />
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/20 text-[11px] font-bold uppercase tracking-wider text-[#A3A3A3]">
              <Building2 className="h-3 w-3 text-white" />
              {workspaceType === "brand" 
                ? "Brand Portal" 
                : workspaceType === "agency" 
                ? "Agency Portal" 
                : "Talent Portal"}
            </div>
          </div>

          {/* Center Navigation Tabs (Bilt Style, Dark Theme) */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] p-1 rounded-full border border-white/20">
            <button 
              onClick={() => router.push("/branddashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white text-black shadow-sm transition-all cursor-pointer"
            >
              Home
            </button>
            <button 
              onClick={() => router.push("/branddashboard/invoices")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Invoice Queue" : "Sent Invoices"}
            </button>
            <button 
              onClick={() => router.push("/branddashboard/nodes")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Settlement Nodes" : "Payout Split Nodes"}
            </button>
            <button 
              onClick={() => router.push("/branddashboard/analytics")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              {workspaceType === "brand" ? "Analytics" : "Agency Earnings"}
            </button>
          </nav>
 
          <div className="flex items-center gap-3">
            {workspaceType === "agency" && (
              <>
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
                  <span className="text-xs font-bold text-[#4B6BFB] bg-[#4B6BFB]/10 px-2 py-0.5 rounded">Active Campaign</span>
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
          <div className={`grid gap-4 ${workspaceType === "brand" ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-2 md:grid-cols-4"}`}>
            {(() => {
              const paidInvoices = liveFunctionalInvoices.filter(i => 
                workspaceType === "brand" 
                  ? (i.status === "settled" || i.status === "talent_disbursed")
                  : i.status === "talent_disbursed"
              );
              const dynamicPaidVolume = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

              const displayPaidVolume = dynamicPaidVolume;
              const disbursedVolume = liveFunctionalInvoices.filter(i => i.status === "talent_disbursed").reduce((acc, curr) => acc + curr.amount, 0);
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
                    },
                    { label: "Total Paid", value: `$${displayPaidVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, detail: "Settled to agency", icon: Coins },
                    { label: "Talent Payouts", value: `$${disbursedVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, detail: "Disbursed to talent", icon: Users }
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
          <div className="bg-[#0D0D0D] rounded-[13px] border border-[#3a3a3a] p-4 sm:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.6)] flex flex-col min-h-[280px] mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b border-[#222] gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-[#3a3a3a] p-1.5">
                  <FileText className="h-4 w-4 text-[#4B6BFB]" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Pending Invoices ({pendingInvoices.length})
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/25">
                      Awaiting Payment
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">
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
                      className="h-7 px-3 text-[10px] font-bold text-neutral-300 hover:text-white bg-neutral-900 border border-[#3a3a3a] rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPendingIds.length === pendingInvoices.length && pendingInvoices.length > 0}
                        onChange={handleSelectAllPending}
                        className="rounded border-neutral-700 bg-black text-[#4B6BFB] focus:ring-0 cursor-pointer"
                      />
                      <span>Select All ({pendingInvoices.length})</span>
                    </button>

                    {selectedPendingIds.length > 0 ? (
                      <button
                        onClick={handleBatchPaySelected}
                        disabled={isPayingAll || payingInvoiceId !== null}
                        className="h-7 px-3.5 bg-white text-black hover:bg-neutral-200 text-[10px] font-extrabold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow active:scale-[0.98]"
                      >
                        {isPayingAll ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-black" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-3 w-3 text-black" />
                            Pay Selected ({selectedPendingIds.length}) · ${selectedTotalWithFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={handlePayAll}
                        disabled={isPayingAll || payingInvoiceId !== null}
                        className="h-7 px-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="h-3 w-3" />
                        Pay All · ${pendingTotalWithFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </button>
                    )}
                  </>
                )}

                <Link
                  href="/branddashboard/invoices"
                  className="h-7 px-3 text-[10px] font-bold text-neutral-400 hover:text-white bg-neutral-900 border border-[#3a3a3a] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
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
                                className="h-3.5 w-3.5 rounded border-neutral-700 bg-black text-[#4B6BFB] focus:ring-0 cursor-pointer"
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
          <div className="bg-[#0D0D0D] rounded-[13px] border border-[#3a3a3a] p-4 sm:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.6)] flex flex-col min-h-[280px] mt-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-800/40 p-1.5">
                  <Check className="h-4 w-4 text-[#70ff9e]" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Paid Invoices ({paidInvoices.length})
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/25">
                      Paid & Settled
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-0.5">Disbursement ledger for settled campaigns</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-neutral-400">
                  Total Settled: <span className="text-white font-bold">${paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </span>
                <Link
                  href="/branddashboard/invoices"
                  className="h-7 px-3 text-[10px] font-bold text-neutral-400 hover:text-white bg-neutral-900 border border-[#3a3a3a] rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>View All</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {isFetchingInvoices ? (
              <InvoiceFetchingLoader title="Loading Paid Invoices" subtitle="Fetching settled disbursement ledger..." count={2} />
            ) : paidInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-grow py-8 text-xs text-neutral-500 text-center font-semibold">
                No paid invoices in ledger yet.
              </div>
            ) : (
              <div className="overflow-x-auto flex-grow">
                <table className="w-full text-left border-collapse text-xs select-text">
                  <thead>
                    <tr className="border-b border-[#222] text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
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
                    {paidInvoices.map((inv) => {
                      const isDisbursed = inv.talentPayoutStatus === "disbursed";

                      return (
                        <tr key={inv.id} className="hover:bg-white/[0.01] transition-colors group">
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
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-green-500/10 text-green-500 border border-green-500/25">
                              Paid
                            </span>
                          </td>
                          <td className="py-2.5 text-right pr-2">
                            {workspaceType === "brand" ? (
                              <span className="text-[9px] font-bold text-emerald-400">Settled</span>
                            ) : isDisbursed ? (
                              <span className="text-[9px] font-bold text-neutral-400">Talent Paid (85%)</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => router.push(`/payout/${inv.id}?returnTo=dashboard`)}
                                className="h-6 px-2.5 bg-[#4B6BFB] text-white hover:bg-[#5b7bfb] font-bold rounded text-[9px] transition-all cursor-pointer inline-flex items-center justify-center active:scale-[0.98]"
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
          )}

          {/* Balance Hero Card & Split View */}
          {activeInvoice && (
            <div className="bg-[#050505] rounded-2xl border border-white/20 shadow-sm overflow-hidden mt-6">
              
              {/* Header portion */}
              <div className="p-6 border-b border-white/20 bg-white/[0.01] flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider">Awaiting Settlement</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{activeInvoice.campaignName}</h3>
                </div>
                <span className="text-xs font-mono bg-white/[0.03] px-2 py-1 rounded text-[#8f8f8f] font-semibold border border-white/20">
                  {activeInvoice.id}
                </span>
              </div>

              {/* Core Balance Card Info */}
              <div className="p-6 md:p-8 border-b border-white/20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left pane - Amount and Action */}
                <div className="lg:col-span-6 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider">Balance due</span>
                    <div className="mt-1 flex items-baseline">
                      <span className="text-[38px] font-black text-white tracking-tight">
                        ${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-[#8f8f8f] font-medium">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                        <span>Ingested: {activeInvoice.createdDate}</span>
                      </div>
                    </div>
                  </div>

                   {/* Approve and Pay Button */}
                   <div className="mt-8">
                     <AnimatePresence mode="wait">
                       {processingStage === "idle" && (
                         workspaceType === "brand" ? (
                           activeInvoice.status === "awaiting_approval" ? (
                             <button
                               onClick={() => router.push(`/pay/${activeInvoice.id}?mode=logged_in&returnTo=branddashboard`)}
                               className="w-full h-12 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                             >
                               <Sparkles className="h-4 w-4 text-black" />
                               Approve & Pay Invoice (${activeInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                             </button>
                           ) : (
                             <div className="w-full h-12 rounded-xl bg-[#082315] border border-[#10b95f]/30 text-[#10b95f] text-xs font-bold flex items-center justify-center gap-2">
                               <CheckCircle2 className="h-4 w-4 text-[#10b95f]" />
                               Invoice Settled & Paid
                             </div>
                           )
                         ) : (
                           <button
                             onClick={() => {
                               if (activeInvoice.status === "settled") {
                                 router.push(`/payout/${activeInvoice.id}?returnTo=dashboard`);
                               }
                             }}
                             disabled={activeInvoice.status !== "settled"}
                             className={`w-full h-12 rounded-xl text-sm font-bold shadow-sm flex items-center justify-center gap-2 transition-all ${
                               activeInvoice.status === "awaiting_approval"
                                 ? "bg-white/[0.02] border border-white/20 text-neutral-500 cursor-default"
                                 : activeInvoice.status === "settled"
                                 ? "bg-[#4B6BFB] hover:bg-[#5b7bfb] text-white cursor-pointer"
                                 : "bg-[#4B6BFB]/10 border border-[#4B6BFB]/20 text-[#4B6BFB] cursor-default"
                             }`}
                           >
                             {activeInvoice.status === "awaiting_approval" && (
                               <>
                                 <Clock className="h-4.5 w-4.5 text-neutral-500 animate-pulse" />
                                 Awaiting Payer Approval
                               </>
                             )}
                             {activeInvoice.status === "settled" && (
                               <>
                                 <Sparkles className="h-4.5 w-4.5 text-white" />
                                 Payout Talent (Split)
                               </>
                             )}
                             {activeInvoice.status === "talent_disbursed" && (
                               <>
                                 <CheckCircle2 className="h-4.5 w-4.5 text-[#4B6BFB]" />
                                 Talent Disbursed
                               </>
                             )}
                           </button>
                         )
                       )}

                       {processingStage !== "idle" && (
                         <div className="w-full h-12 rounded-xl border border-white/20 bg-[#0A0A0A] text-xs font-bold text-[#8f8f8f] flex items-center justify-center gap-3 shadow-inner">
                           <RefreshCw className="h-4 w-4 animate-spin text-[#4B6BFB]" />
                           {processingStage === "verifying" && "Verifying corporate treasury clearance..."}
                           {processingStage === "routing" && "Auto-routing splits to Wallet IDs..."}
                           {processingStage === "success" && "Settlement complete!"}
                         </div>
                       )}
                     </AnimatePresence>
                     
                     {activeInvoice.status === "awaiting_approval" && (
                       <p className="text-[10px] text-center text-neutral-400 mt-2">
                         Approving dispatches corporate funds immediately. Backed by AgncyPay's settlement guarantee.
                       </p>
                     )}
                   </div>
                </div>

                {/* Right pane - Your Corporate Payout Terms (Brand Role Only) */}
                {workspaceType === "brand" && (
                  <div className="lg:col-span-6">
                    <CorporatePayoutTermsCard invoiceId={activeInvoice.id} initialTerm={activeInvoice.defaultTerm || "Net-30"} />
                  </div>
                )}
              </div>

              {/* Auto-Split Breakdown Section - Refactored */}
              <div className="p-6 md:p-8 bg-white/[0.01] space-y-6">
                
                {/* Direct Vendor Fee */}
                <div>
                  <div className="flex justify-between items-center border-b border-white/20 pb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider">Direct Vendor Payment</h4>
                      <span className="text-[10px] text-[#8f8f8f]/75 font-semibold">(Direct invoice flat rate)</span>
                    </div>
                    <span className="text-[10px] text-[#8f8f8f] font-bold">1 Destination</span>
                  </div>

                  <div className="mt-3 max-w-sm">
                    <div className="p-4 bg-black border border-white/20 rounded-xl shadow-sm hover:border-[#4B6BFB]/30 transition-all relative overflow-hidden">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={activeInvoice.vendorFee.avatar}
                            alt={activeInvoice.vendorFee.name}
                            className="h-10 w-10 rounded-lg object-cover border border-white/20 bg-[#111] shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{activeInvoice.vendorFee.name}</p>
                            <p className="text-[10px] text-neutral-400 font-semibold">{activeInvoice.vendorFee.walletId}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wider bg-amber-950/60 text-amber-300 border border-amber-800/30">
                          Vendor
                        </span>
                      </div>

                      <div className="mt-4 flex justify-between items-baseline">
                        <span className="text-xs font-semibold text-neutral-400">Direct Production Fee</span>
                        <span className="text-base font-black text-white">
                          ${activeInvoice.vendorFee.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agency & Talent Split Pool */}
                {workspaceType === "agency" && (
                  <div>
                    <div className="flex justify-between items-center border-b border-white/20 pb-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider">Agency & Talent Payout Split</h4>
                        <span className="text-[10px] text-[#8f8f8f]/75 font-semibold">
                          (Split Pool: ${activeInvoice.splitPool.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8f8f8f] font-bold">2 Destinations</span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeInvoice.splitPool.splits.map((split) => (
                        <div
                          key={split.name}
                          className="p-4 bg-black border border-white/20 rounded-xl shadow-sm hover:border-white/30 hover:shadow-md transition-all relative overflow-hidden group"
                        >
                          {/* Tiny visual progress bar back */}
                          <div className="absolute bottom-0 left-0 h-1 bg-white/5 w-full" />
                          {/* Tiny visual progress bar front */}
                          <div 
                            className="absolute bottom-0 left-0 h-1 bg-white transition-all duration-500"
                            style={{ width: activeInvoice.status === "settled" ? `${split.percentage}%` : "0%" }}
                          />

                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={split.avatar}
                                alt={split.name}
                                className="h-10 w-10 rounded-lg object-cover border border-white/20 bg-[#111] shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{split.name}</p>
                                <p className="text-[10px] text-neutral-400 font-semibold">{split.walletId}</p>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 uppercase tracking-wider ${
                              split.role === "Talent" 
                                ? "bg-white/10 text-white border border-white/20" 
                                : "bg-neutral-800 text-neutral-300 border border-neutral-700"
                            }`}>
                              {split.role}
                            </span>
                          </div>

                          <div className="mt-4 flex justify-between items-baseline">
                            <span className="text-xs font-semibold text-neutral-400">
                              {split.percentage}% Pool Share
                            </span>
                            <span className="text-base font-black text-white">
                              ${split.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Node status indicators */}
                          <div className="mt-2.5 pt-2.5 border-t border-white/20 flex items-center justify-between text-[10px] text-neutral-400">
                            <span>Node Status:</span>
                            <span className="flex items-center gap-1 font-bold text-[#E5E5EA]">
                              {activeInvoice.status === "settled" ? (
                                <>
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Routed & Disbursed
                                </>
                              ) : (
                                <>
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                  Queue Verified
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Payment Status Timeline */}
          {workspaceType === "agency" && activeInvoice && (
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm">
              <h4 className="text-xs font-bold text-[#8f8f8f] uppercase tracking-wider mb-4">
                Real-Time Settlement Logs
              </h4>

              {/* Timeline Row */}
              <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 md:px-4">
                {/* Connector line behind */}
                <div className="absolute top-4 left-4 bottom-4 md:bottom-auto md:left-0 md:top-1/2 md:h-[2px] w-[2px] md:w-full bg-white/[0.08] -translate-y-1/2 -z-10" />

                {[
                  { label: "Invoice Ingested", desc: "Ingested via Brand ERP", date: activeInvoice.createdDate, completed: true },
                  { 
                    label: "Brand Approved", 
                    desc: activeInvoice.status === "settled" ? "Authorized successfully" : "Awaiting signature", 
                    date: activeInvoice.status === "settled" ? "Just now" : "Pending", 
                    completed: activeInvoice.status === "settled" 
                  },
                  { 
                    label: "Funds Clearing", 
                    desc: activeInvoice.status === "settled" ? "Settled on AgncyPay" : "Pending Approval", 
                    date: activeInvoice.status === "settled" ? "Just now" : "Pending", 
                    completed: activeInvoice.status === "settled"
                  },
                  { 
                    label: "Disbursed to Wallets", 
                    desc: activeInvoice.status === "settled" ? "Split routed immediately" : "Locked", 
                    date: activeInvoice.status === "settled" ? "Instant (Net-0)" : "Pending", 
                    completed: activeInvoice.status === "settled"
                  }
                ].map((step, idx) => (
                  <div key={idx} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-2 flex-1 relative bg-[#050505]">
                    {/* Dot */}
                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 shadow-sm ${
                      step.completed 
                        ? "bg-emerald-950/40 border-emerald-500 text-emerald-400" 
                        : "bg-black border-white/20 text-[#8f8f8f]"
                    }`}>
                      {step.completed ? (
                        <CheckCircle2 className="h-4.5 w-4.5" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    {/* Text details */}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white">{step.label}</p>
                      <p className="text-[10px] text-[#8f8f8f] leading-tight mt-0.5">{step.desc}</p>
                      <p className="text-[10px] font-bold text-[#4B6BFB] mt-1">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Queue and History Ledger (Narrower) */}
        <div id="approval-queue-section" className="lg:col-span-4 space-y-6">
          
          {/* AGNCYPAY Deposit Balance Section */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f]">AgncyPay Deposit Balance</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold">Active Liquidity Pool</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Real-time
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Total Deposited Balance</p>
              <p className="text-2xl font-black text-white tracking-tight mt-0.5">
                ${depositedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>

              {(() => {
                const awaitingItems = workspaceType === "brand"
                  ? liveFunctionalInvoices.filter(i => i.status === "awaiting_approval")
                  : liveFunctionalInvoices.filter(i => i.status === "settled");
                const awaitingTotal = awaitingItems.reduce((acc, curr) => acc + curr.amount, 0);
                const avail = Math.max(0, depositedBalance - awaitingTotal);

                return (
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
                    <div className="bg-black/60 rounded-xl p-2.5 border border-white/10">
                      <span className="text-[10px] font-bold text-[#8f8f8f] block uppercase">Available Liquidity</span>
                      <span className="text-xs font-bold text-emerald-400">
                        ${avail.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="bg-black/60 rounded-xl p-2.5 border border-white/10">
                      <span className="text-[10px] font-bold text-[#8f8f8f] block uppercase">Locked Reserve</span>
                      <span className="text-xs font-bold text-amber-400">
                        ${awaitingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-200 transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Deposit Funds to AGNCYPAY
            </button>
          </div>

          {/* Invoice Approval Queue */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-white/20">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f]">Approval Queue</h3>
              <span className="text-[10px] font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
                {queueInvoices.length} Pending
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {queueInvoices.length === 0 ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-neutral-500">
                    {workspaceType === "brand" ? "No pending approvals" : "No pending talent payouts"}
                  </p>
                </div>
              ) : (
                queueInvoices.map((inv) => {
                  const isSelected = inv.id === selectedInvoiceId;
                  const isAwaiting = inv.status === "awaiting_approval";

                  return (
                    <button
                      key={inv.id}
                      onClick={() => setSelectedInvoiceId(inv.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center cursor-pointer group ${
                        isSelected
                          ? "border-white bg-white/[0.04] shadow-sm"
                          : "border-white/20 hover:border-white/[0.2] hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-neutral-400 uppercase font-mono">{inv.id}</span>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            isAwaiting ? "bg-amber-400 animate-pulse" : "bg-emerald-500"
                          }`} />
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1 truncate group-hover:text-white">{inv.campaignName}</h4>
                        <p className="text-[10px] text-[#8f8f8f] mt-0.5">Ingested: {inv.createdDate}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-black text-white">
                          ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase block mt-1 tracking-wider text-center ${
                          isAwaiting ? "bg-amber-950/80 text-amber-300" : "bg-emerald-950/80 text-emerald-300"
                        }`}>
                          {isAwaiting ? "Awaiting" : "Settled"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
              </div>
            </div>

            {/* Integrations Panel */}
            <IntegrationsPanel />

            {/* Node Map Panel */}
            {workspaceType !== "brand" && (
              <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/20">
                  Creative Node Network
                </h3>

                {/* Map representation */}
                <div className="mt-4 h-48 rounded-xl border border-white/20 bg-black relative overflow-hidden flex flex-col justify-end p-4 shadow-inner">
                  {/* Dot grid back */}
                  <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] opacity-70" />

                  {/* Glowing active node lines */}
                  <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M 50 50 L 150 100 L 250 60" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_10s_linear_infinite]" />
                    <path d="M 150 100 L 80 150" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 4" className="animate-[dash_8s_linear_infinite]" />
                  </svg>

                  {/* Nodes */}
                  <div className="absolute top-10 left-12 flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-neutral-800 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                      NY
                    </div>
                    <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Brand Node</span>
                  </div>

                  <div className="absolute top-20 right-16 flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-neutral-800 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                      LDN
                    </div>
                    <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Talent Node</span>
                  </div>

                  <div className="absolute bottom-10 left-16 flex flex-col items-center">
                    <div className="h-6 w-6 rounded-full bg-neutral-800 border-2 border-white flex items-center justify-center text-[8px] font-black text-white shadow">
                      PAR
                    </div>
                    <span className="text-[8px] font-bold text-[#8f8f8f] mt-1">Agency Node</span>
                  </div>

                  {/* Map Button indicator */}
                  <div className="relative z-10 bg-[#0A0A0A] border border-white/20 rounded-lg p-2.5 shadow-sm text-[11px]">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-white" />
                        3 Active Nodes Connected
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                  </div>
                </div>

                {/* General Info list */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-[#8f8f8f] font-semibold">Active Campaign</span>
                    <span className="font-bold text-white">Adidas Originals Q3</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/20">
                    <span className="text-[#8f8f8f] font-semibold">Settlement Period</span>
                    <span className="font-bold text-white">Jul 1 - Sep 30, 2026</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#8f8f8f] font-semibold">Tax Documentation</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      All Nodes W-9 Active
                    </span>
                  </div>
                </div>
              </div>
            )}

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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-4 backdrop-blur-[2px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[440px] rounded-2xl border border-white/20 bg-[#0A0A0A] p-6 shadow-2xl relative text-left"
            >
              <div className="pb-4 border-b border-white/20">
                <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-white" />
                  Create New Invoice
                </h2>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Issue a campaign split invoice. Payout structures (15% agency, 85% talent) will auto-generate.
                </p>
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

      {/* Deposit Funds Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-[3px]">
          <div className="w-full max-w-[520px] rounded-2xl border border-white/20 bg-[#0A0A0A] p-6 text-white shadow-2xl relative overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Deposit Balance to AGNCYPAY</h3>
                  <p className="text-xs text-[#8f8f8f]">Fund liquidity pool via attached payment cards</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsDepositModalOpen(false);
                  setShowAddCard(false);
                  setDepositSuccessMsg(null);
                }}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {depositSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h4 className="text-base font-bold text-white">Deposit Confirmed</h4>
                <p className="text-xs text-neutral-300 max-w-sm mx-auto">{depositSuccessMsg}</p>
              </div>
            ) : isProcessingDeposit ? (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="h-8 w-8 text-white animate-spin mx-auto" />
                <div>
                  <p className="text-sm font-bold text-white">Processing Deposit...</p>
                  <p className="text-xs text-neutral-400 mt-1">Encrypting 256-bit transaction & updating Firestore liquidity pool</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmDeposit} className="mt-5 space-y-5">
                
                {/* Attached Cards & Selection */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Select Attached Card</label>
                    <button
                      type="button"
                      onClick={() => setShowAddCard(!showAddCard)}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      {showAddCard ? "Cancel New Card" : "Add New Card"}
                    </button>
                  </div>

                  {showAddCard ? (
                    <div className="p-4 rounded-xl border border-white/20 bg-black/60 space-y-3 text-xs">
                      <p className="font-bold text-white text-xs mb-1">Attach New Debit/Credit Card</p>
                      <div>
                        <label className="text-[10px] text-neutral-400 uppercase font-semibold">Cardholder Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Jenkins"
                          value={newCardHolder}
                          onChange={(e) => setNewCardHolder(e.target.value)}
                          className="w-full mt-1 bg-neutral-900 border border-white/20 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-neutral-400 uppercase font-semibold">Card Number</label>
                        <input
                          type="text"
                          placeholder="4532 •••• •••• 8899"
                          value={newCardNumber}
                          onChange={(e) => setNewCardNumber(e.target.value)}
                          className="w-full mt-1 bg-neutral-900 border border-white/20 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-white"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-neutral-400 uppercase font-semibold">Expiry</label>
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={newCardExpiry}
                            onChange={(e) => setNewCardExpiry(e.target.value)}
                            className="w-full mt-1 bg-neutral-900 border border-white/20 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 uppercase font-semibold">CVC</label>
                          <input
                            type="text"
                            placeholder="123"
                            value={newCardCVC}
                            onChange={(e) => setNewCardCVC(e.target.value)}
                            className="w-full mt-1 bg-neutral-900 border border-white/20 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-neutral-400 uppercase font-semibold">ZIP Code</label>
                          <input
                            type="text"
                            placeholder="10001"
                            value={newCardZip}
                            onChange={(e) => setNewCardZip(e.target.value)}
                            className="w-full mt-1 bg-neutral-900 border border-white/20 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-white"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddNewCard}
                        className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-bold text-white text-xs mt-2 cursor-pointer transition-colors"
                      >
                        Save & Attach Card
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {linkedCards.map((card) => {
                        const isSelected = card.id === selectedCardId;
                        return (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCardId(card.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "border-white bg-white/[0.06] shadow-sm"
                                : "border-white/10 hover:border-white/20 bg-black/40"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-14 shrink-0 rounded-md bg-neutral-900 border border-white/10 overflow-hidden flex items-center justify-center p-0.5">
                                <img
                                  src={card.cardImage}
                                  alt={card.name}
                                  className="h-full w-full object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">{card.name}</p>
                                <p className="text-[10px] text-neutral-400">{card.detail}</p>
                              </div>
                            </div>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                              isSelected ? "border-white bg-white text-black" : "border-white/30"
                            }`}>
                              {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Amount selection */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider block mb-2">Deposit Amount ($USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-neutral-400">$</span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="1000.00"
                      className="w-full pl-8 pr-4 py-3 bg-black border border-white/20 rounded-xl text-lg font-bold text-white focus:outline-none focus:border-white"
                      required
                    />
                  </div>
                  
                  {/* Quick Pills */}
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {["500", "1000", "2500", "5000"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setDepositAmount(preset)}
                        className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          depositAmount === preset
                            ? "border-white bg-white text-black"
                            : "border-white/10 bg-white/[0.02] text-neutral-300 hover:border-white/20"
                        }`}
                      >
                        +${parseInt(preset).toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-white/20 text-xs font-bold text-neutral-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Wallet className="h-4 w-4" />
                    Confirm Deposit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
