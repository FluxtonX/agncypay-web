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
  Check
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { subscribeInvoicesByBrand, subscribeInvoicesByAgency, updateInvoiceStatus, createFirestoreInvoice, getRegisteredBrands, getRegisteredTalents } from "../../lib/firebaseInvoices";
import { FirestoreUser } from "../../lib/firebaseAuth";

// Using real Firebase data - no mock interfaces needed

export default function BrandDashboardPage() {
  const router = useRouter();
  const { state, resetState } = useApp();
  const workspaceType = "brand"; // Fixed to brand - agency has separate route

  const [livePaidVolume, setLivePaidVolume] = useState(0);
  const [liveNet0Funded, setLiveNet0Funded] = useState(0);
  const [liveAutosplitSavings, setLiveAutosplitSavings] = useState(0);

  // Widget invoices state
  const [widgetInvoices, setWidgetInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
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
      const talents = await getRegisteredTalents();
      setRegisteredBrands(brands);
      setRegisteredTalents(talents);
      if (brands.length > 0) setSelectedBrandEmail(brands[0].email);
    }
    loadData();
  }, []);


  // New invoice state hooks
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState("");
  const [newTalent, setNewTalent] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newDue, setNewDue] = useState("");
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);

  useEffect(() => {
    const userEmail = state.user?.email || "";
    
    const savedVolume = localStorage.getItem("brand_stats_paid_volume");
    if (savedVolume) setLivePaidVolume(parseFloat(savedVolume));
    
    const savedSavings = localStorage.getItem("brand_stats_autosplit_savings");
    if (savedSavings) setLiveAutosplitSavings(parseFloat(savedSavings));

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
    };

    let unsubscribe = () => {};
    unsubscribe = subscribeInvoicesByBrand(userEmail, handleInvoicesUpdate);

    const localNotifs = localStorage.getItem("agency_notifications");
    if (localNotifs) {
      setNotifications(JSON.parse(localNotifs));
    }

    // Start with empty invoices — they come from Firestore now
    setInvoices([]);

    // Set up a listener for storage events to sync across tabs/logins
    const syncStates = () => {
      const savedVolume = localStorage.getItem("brand_stats_paid_volume");
      if (savedVolume) setLivePaidVolume(parseFloat(savedVolume));
      const savedSavings = localStorage.getItem("brand_stats_autosplit_savings");
      if (savedSavings) setLiveAutosplitSavings(parseFloat(savedSavings));
      const localNotifs = localStorage.getItem("agency_notifications");
      if (localNotifs) setNotifications(JSON.parse(localNotifs));
    };

    window.addEventListener("storage", syncStates);
    window.addEventListener("syncBrandDashboard", syncStates);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", syncStates);
      window.removeEventListener("syncBrandDashboard", syncStates);
    };
  }, [state.user]);

  const handlePayInvoice = async (id: string) => {
    setPayingInvoiceId(id);
    try {
      await updateInvoiceStatus(id, "paid", "pending");
      
      // Update local state for immediate UI feedback
      setWidgetInvoices((prev) => {
        const next = prev.map((inv) => (inv.id === id ? { ...inv, status: "paid" } : inv));
        
        const paidInvoice = prev.find((inv) => inv.id === id);
        if (paidInvoice) {
          const amt = paidInvoice.amount;
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

          // Add notification
          const newNotif = {
            id: `notif-${Date.now()}`,
            message: `Brand paid invoice to ${paidInvoice.agency} ($${paidInvoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${paidInvoice.campaign}`,
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
      
      window.dispatchEvent(new Event("syncBrandDashboard"));
    } catch (error) {
      console.error("Error paying invoice:", error);
    } finally {
      setPayingInvoiceId(null);
    }
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
      const talentName = talentUser ? talentUser.fullName : selectedTalentEmail.split('@')[0];

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
        talent: talentName,
        talentEmail: selectedTalentEmail,
        brandName: brandName,
        brandEmail: selectedBrandEmail,
        amount: parseFloat(newAmount),
        due: formattedDue
      });
      
      // Close and Reset Form
      setIsNewInvoiceOpen(false);
      setNewCampaign("");
      setNewAmount("");
      setNewDue("");
    } catch (error) {
      console.error("Error creating invoice in Firestore:", error);
    } finally {
      setIsCreatingInvoice(false);
    }
  };

  const handlePayAll = async () => {
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
            localStorage.setItem("brand_stats_paid_volume", nv.toString());
            return nv;
          });
          setLiveAutosplitSavings((v) => {
            const nv = v + totalPaid * 0.015;
            localStorage.setItem("brand_stats_autosplit_savings", nv.toString());
            return nv;
          });

          // Add notifications to localStorage
          const localNotifs = localStorage.getItem("agency_notifications");
          const notifs = localNotifs ? JSON.parse(localNotifs) : [];
          const newNotifs = unpaid.map((inv, idx) => ({
            id: `notif-${Date.now()}-${idx}`,
            message: `Brand paid invoice to ${inv.agency} ($${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}) for ${inv.campaign}`,
            timestamp: "Just now",
            unread: true,
          }));
          localStorage.setItem("agency_notifications", JSON.stringify([...newNotifs, ...notifs]));
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

  // Invoices state (using Firestore data)
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("W-INV-001");
  const [selectedTerm, setSelectedTerm] = useState<string>("Net-30");
  const [instantPayoutEnabled, setInstantPayoutEnabled] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Filter widgetInvoices by role-scoped email
  const userFilteredWidgetInvoices = widgetInvoices.filter((inv) => {
    const userEmail = state.user?.email || "";
    return inv.payerEmail === userEmail;
  });

  // Map functional widget invoices into the full UI shape
  const liveFunctionalInvoices: any[] = userFilteredWidgetInvoices.map(inv => {
    // Determine the status equivalent for the UI logic
    let uiStatus: string = "awaiting_approval";
    if (inv.status === "paid") {
      uiStatus = inv.talentPayoutStatus === "disbursed" ? "talent_disbursed" : "settled";
    }

    // Get talent user from registered talents for dynamic data
    const talentUser = registeredTalents.find(t => t.email === inv.talentEmail);
    const talentName = talentUser ? talentUser.fullName : inv.talent || "No talent assigned";
    const talentWalletId = talentUser ? `@${talentUser.fullName.toLowerCase().replace(/\s+/g, '')}` : "@pending-talent";
    const talentAvatar = talentUser?.profileImage || ""; // Empty string if no profile image

    const agencyName = inv.agency || "Agency";
    const agencyWalletId = `@${agencyName.toLowerCase().replace(/\s+/g, '')}`;

    return {
      id: inv.id,
      campaignName: inv.campaign,
      brandName: inv.brandName,
      createdDate: inv.createdDate,
      dueDate: inv.due,
      amount: inv.amount,
      defaultTerm: "Net-30",
      status: uiStatus,
      vendorFee: {
        name: "Processing Fee",
        role: "Vendor",
        amount: inv.amount * 0.015, // 1.5% AgncyPay fee
        walletId: "@agncypay",
        avatar: "" // No hardcoded avatar
      },
      splitPool: {
        total: inv.amount * 0.985, // After 1.5% fee
        splits: [
          { 
            name: talentName, 
            role: "Talent", 
            percentage: 85, 
            amount: inv.amount * 0.985 * 0.85, 
            walletId: talentWalletId, 
            avatar: talentAvatar 
          },
          { 
            name: agencyName, 
            role: "Agency", 
            percentage: 15, 
            amount: inv.amount * 0.985 * 0.15, 
            walletId: agencyWalletId, 
            avatar: "" 
          }
        ]
      }
    };
  });

  // Combine static fallback and live functional data
  const allInvoices = liveFunctionalInvoices;

  // queueInvoices: role-based filtered list used in the Right Column queue panel
  // We ONLY show live functional invoices in the queue (or all if you want, but functional is preferred)
  const queueInvoices = liveFunctionalInvoices.filter(inv =>
    inv.status === "awaiting_approval"
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
        setTimeout(() => {
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
              const talentSplit = targetInvoice.splitPool.splits.find((s: { role: string; }) => s.role === "Talent");
              const agencySplit = targetInvoice.splitPool.splits.find((s: { role: string; }) => s.role === "Agency");
              
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
    <main className="min-h-screen bg-[#000000] text-white flex flex-col font-sans antialiased selection:bg-white selection:text-black relative">
      {/* Background radial gradient decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[100px] pointer-events-none" />

      {/* Header - Unified Dark Theme */}
      <header className="border-b border-white/20 bg-black/90 sticky top-0 z-50 shadow-sm backdrop-blur">
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
              Brand Portal
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
              Invoice Queue
            </button>
            <button 
              onClick={() => router.push("/branddashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              Settlement Nodes
            </button>
            <button 
              onClick={() => router.push("/branddashboard")}
              className="px-4 py-1.5 rounded-full text-xs font-semibold text-[#8f8f8f] hover:text-white transition-all cursor-pointer"
            >
              Analytics
            </button>
          </nav>
 
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/20 flex items-center justify-center font-bold text-xs text-white">
                {state.user?.fullName ? state.user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "AD"}
              </div>
              <span className="text-xs font-bold text-[#E5E5EA] hidden sm:inline">
                {state.workspaces.find(w => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Adidas Corporate"}
              </span>
            </div>

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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4B6BFB] bg-[#4B6BFB]/10 px-2 py-0.5 rounded">Active Campaign</span>
              <span className="text-xs text-neutral-400 font-mono">ID: ADIDAS-2026-Q3</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1 tracking-tight">Adidas Executive Billing</h1>
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-[1520px] w-full mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Core Approval and Splits (Wider) */}
        <div className="lg:col-span-8 space-y-6">
          


          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const paidInvoices = liveFunctionalInvoices.filter(i => 
                i.status === "settled" || i.status === "talent_disbursed"
              );
              const dynamicPaidVolume = paidInvoices.reduce((acc, curr) => acc + curr.amount, 0);

              const displayPaidVolume = dynamicPaidVolume;
              const disbursedVolume = liveFunctionalInvoices.filter(i => i.status === "talent_disbursed").reduce((acc, curr) => acc + curr.amount * 0.85, 0);
              const displayNet0Funded = disbursedVolume * 0.85;
              const displayAutosplitSavings = dynamicPaidVolume * 0.015;

              const awaitingItems = liveFunctionalInvoices.filter(i => i.status === "awaiting_approval");
              const awaitingTotal = awaitingItems.reduce((acc, curr) => acc + curr.amount, 0);
              const awaitingCount = awaitingItems.length;

              const stats = [
                { label: "Total Paid Volume", value: `$${displayPaidVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, trend: "+12.4%", icon: TrendingUp },
                {
                  label: "Awaiting Approval",
                  value: `$${awaitingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  count: `${awaitingCount} invoice${awaitingCount !== 1 ? "s" : ""}`,
                  icon: Clock
                },
                { label: "Instant Net-0 Funded", value: `$${displayNet0Funded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, detail: "AgncyPay liquidity", icon: Coins },
                { label: "Autosplit Fee Savings", value: `$${displayAutosplitSavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, detail: "Single payment rail", icon: ShieldCheck }
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
          </div>

          {/* CRM Invoices Widget */}
          <div className="bg-[#050505] rounded-2xl border border-white/20 shadow-sm overflow-hidden mt-6">
            {/* Header */}
            <div className="p-6 border-b border-white/20 bg-white/[0.01] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight">agncypay</span>
                <span className="text-neutral-500 font-medium text-xs">•</span>
                <span className="text-neutral-400 font-semibold text-xs">
                  Invoices for your brand
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-white/10 px-2.5 py-0.5 rounded border border-white/20">
                  CRM Widget
                </span>
              </div>
            </div>

            {/* Total Outstanding & Pay Button */}
            {(() => {
              const activeWidgetInvoices = widgetInvoices.filter(i => i.status === "pending");

              const outstandingSum = activeWidgetInvoices.reduce((sum, i) => sum + i.amount, 0);
              const platformFee = outstandingSum * 0.015;
              const totalWithFee = outstandingSum + platformFee;

              return (
                <>
                  <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/20">
                    <div>
                      <span className="text-xs font-semibold text-[#8f8f8f] uppercase tracking-wider">
                        Total outstanding
                      </span>
                      <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-white tracking-tight">
                          ${outstandingSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      {outstandingSum > 0 && (
                        <p className="text-[11px] text-[#8f8f8f] mt-1 font-semibold">
                          + ${platformFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} platform fee = <span className="text-white font-bold">${totalWithFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {outstandingSum > 0 ? (
                          <button
                            onClick={handlePayAll}
                            disabled={isPayingAll || payingInvoiceId !== null}
                            className="w-full md:w-auto h-11 px-6 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                          >
                            {isPayingAll ? (
                              <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Processing Payment...
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-3.5 w-3.5" />
                                Pay all {activeWidgetInvoices.length} invoices · ${totalWithFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs font-semibold text-[#10b95f] bg-[#082315] border border-[#10b95f]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" />
                            All invoices paid
                          </span>
                        )}
                    </div>
                  </div>

                  {/* Invoices List */}
                  <div className="divide-y divide-white/15">
                    {widgetInvoices.map((inv) => {
                      const isPaid = inv.status === "paid";
                      const isDisbursed = inv.talentPayoutStatus === "disbursed";
                      const isPayingThis = payingInvoiceId === inv.id;
                      const isPayoutingThis = payoutingInvoiceId === inv.id;
                      const initial = inv.agency.charAt(0).toUpperCase();

                      return (
                        <div key={inv.id} className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/[0.01] transition-all">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-[#111] border border-white/20 flex items-center justify-center font-bold text-sm text-neutral-400 shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0 text-left">
                              <p className="text-xs font-bold text-white truncate">{inv.agency}</p>
                              <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">{inv.campaign}</p>
                              <p className="text-[9px] text-[#8f8f8f] mt-1">
                                Talent: <span className="text-[#c1c1c7] font-semibold">{inv.talent}</span> • Due {inv.dueDate}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                            <span className="text-sm font-bold text-white">
                              ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>

                            {workspaceType === "brand" ? (
                              isPaid ? (
                                <span className="text-[10px] font-bold text-[#10b95f] bg-[#082315] border border-[#10b95f]/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  Paid
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    router.push(`/pay/${inv.id}?mode=logged_in&returnTo=dashboard`);
                                  }}
                                  className="h-8 px-4 rounded-lg bg-white/5 border border-white/20 text-[11px] font-bold text-white hover:bg-white/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  Pay now
                                </button>
                              )
                            ) : (
                              <div className="flex items-center gap-2">
                                {isPaid ? (
                                   <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-[#10b95f] bg-[#082315] border border-[#10b95f]/20">
                                     Paid
                                   </span>
                                 ) : (
                                   <span
                                      className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-[#ff8a00] bg-[#261603] border border-[#ff8a00]/20 cursor-default"
                                      title="Awaiting client payment settlement"
                                    >
                                      Pending Payer
                                    </span>
                                 )}
                                
                                {isPaid && (
                                   isDisbursed ? (
                                     <span className="text-[10px] font-bold text-white bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-1">
                                       <Check className="h-3 w-3" />
                                       Talent Paid
                                     </span>
                                   ) : (
                                     <button
                                       onClick={() => router.push(`/payout/${inv.id}?returnTo=dashboard`)}
                                       className="h-8 px-4 rounded-lg bg-white hover:bg-neutral-200 text-black text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                     >
                                       Payout Talent (85%)
                                     </button>
                                   )
                                 )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Footer */}
            <div className="p-4 border-t border-white/20 bg-white/[0.01] flex justify-between items-center text-[10px] text-neutral-500">
              <span>Powered by agncypay • Secure payment processing</span>
              <span>1.5% platform fee</span>
            </div>
          </div>


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
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-white/20">
                
                {/* Left pane - Amount and Action */}
                <div className="flex flex-col justify-between">
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

                {/* Right pane - Payout Terms selector */}
                <div className="rounded-xl border border-white/20 bg-white/[0.01] p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">Your Corporate Payout Terms</span>
                      <HelpCircle className="h-3.5 w-3.5 text-neutral-400" />
                    </div>
                    <p className="text-[11px] text-[#8f8f8f] mt-1 leading-relaxed">
                      Set your treasury disbursement timeline. Invoices will automatically clear according to this date.
                    </p>

                    {/* Term Buttons */}
                    <div className="mt-4 grid grid-cols-3 gap-2 bg-black p-1 rounded-lg border border-white/20">
                      {(["Net-30", "Net-60", "Net-90"] as const).map(term => (
                        <button
                          key={term}
                          onClick={() => setSelectedTerm(term)}
                          className={`py-2 rounded-md text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                            selectedTerm === term
                              ? "bg-white text-black shadow-sm font-bold"
                              : "text-[#8f8f8f] hover:text-white"
                          }`}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Toggle for Instant Payout for recipient */}
                  <div className="mt-6 pt-4 border-t border-white/20 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white">Allow instant Net-0</span>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded-full uppercase tracking-wider">AgncyPay Liquidity</span>
                      </div>
                      <p className="text-[10px] text-[#8f8f8f] mt-1 leading-tight">
                        Talent/agencies can claim funds on day 0. AgncyPay funds the advance, keeping your terms unchanged.
                      </p>
                    </div>
                    <button
                      onClick={() => setInstantPayoutEnabled(!instantPayoutEnabled)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                        instantPayoutEnabled ? "bg-[#4B6BFB]" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          instantPayoutEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
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
                          {activeInvoice.vendorFee.avatar ? (
                            <img
                              src={activeInvoice.vendorFee.avatar}
                              alt={activeInvoice.vendorFee.name}
                              className="h-10 w-10 rounded-lg object-cover border border-white/20 bg-[#111] shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg border border-white/20 bg-[#111] shrink-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-white">AP</span>
                            </div>
                          )}
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

                {/* Split Pool */}
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
                      {activeInvoice.splitPool.splits.map((split: {
                        name: string;
                        role: string;
                        percentage: number;
                        amount: number;
                        walletId: string;
                        avatar: string;
                      }) => (
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
                              {split.avatar ? (
                                <img
                                  src={split.avatar}
                                  alt={split.name}
                                  className="h-10 w-10 rounded-lg object-cover border border-white/20 bg-[#111] shrink-0"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg border border-white/20 bg-[#111] shrink-0 flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">
                                    {split.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </span>
                                </div>
                              )}
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
                </div>

              </div>
          )}

          {/* Payment Status Timeline */}
          {activeInvoice && (
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
                    No pending approvals
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

            {/* Recent Transactions Ledger */}
            <div className="bg-[#050505] rounded-2xl border border-white/20 p-5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#8f8f8f] pb-3 border-b border-white/20">
                Recent Transactions
              </h3>

              <div className="mt-4 space-y-4">
                {(() => {
                  const realTxs = widgetInvoices.filter(inv =>
                    inv.status === "paid"
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
                          <span>Net-30</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-white">${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <span className="text-[10px] text-white font-bold block mt-0.5">ACH Direct</span>
                      </div>
                    </div>
                  ));
                })()}
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
                      className="mt-2 h-11 w-full border border-white/20 bg-black rounded-lg px-4 text-xs font-semibold text-white outline-none focus:border-white transition-all cursor-pointer"
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
                      placeholder="e.g. 14999.98"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="mt-2 h-11 w-full border border-white/20 bg-black rounded-lg px-4 text-xs font-semibold text-white outline-none focus:border-white transition-all"
                    />
                  </div>
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
