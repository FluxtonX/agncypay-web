"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import {
  Building2,
  Users,
  Search,
  Sun,
  Moon,
  Wallet as WalletIcon,
  ChevronRight,
  Mail,
  Star,
  Briefcase,
  User,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Loader2,
  X
} from "lucide-react";
import { getRegisteredBrands, getRegisteredTalents } from "../../../lib/firebaseInvoices";
import { FirestoreUser } from "../../../lib/firebaseAuth";

export default function AgencyContactsPage() {
  const router = useRouter();
  const { state } = useApp();

  const [isLightTheme, setIsLightTheme] = useState(true);
  const [activeSection, setActiveSection] = useState<"brands" | "talent">("brands");
  const [searchQuery, setSearchQuery] = useState("");
  const [brands, setBrands] = useState<FirestoreUser[]>([]);
  const [talents, setTalents] = useState<FirestoreUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [inviteModalType, setInviteModalType] = useState<"brand" | "talent" | null>(null);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("agncypay_theme_agency");
      if (savedTheme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        setIsLightTheme(true);
      } else if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        setIsLightTheme(false);
      } else {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
        setIsLightTheme(true);
      }
    }
  }, []);

  useEffect(() => {
    async function loadContacts() {
      setIsLoading(true);
      try {
        const [brandsData, talentsData] = await Promise.all([
          getRegisteredBrands(),
          getRegisteredTalents()
        ]);

        const MOCK_BRANDS: FirestoreUser[] = [
          { uid: "b-1", email: "billing@nike.com", fullName: "Nike Brand Team", workspaceName: "Nike Global", accountType: "brand", agencyId: "AG-10001", createdAt: new Date().toISOString() },
          { uid: "b-2", email: "finance@adidas.com", fullName: "Adidas North America", workspaceName: "Adidas Corp", accountType: "brand", agencyId: "AG-10002", createdAt: new Date().toISOString() },
          { uid: "b-3", email: "ap@redbull.com", fullName: "Red Bull Media House", workspaceName: "Red Bull Media", accountType: "brand", agencyId: "AG-10003", createdAt: new Date().toISOString() },
          { uid: "b-4", email: "accounts@apple.com", fullName: "Apple Marketing", workspaceName: "Apple Inc.", accountType: "brand", agencyId: "AG-10004", createdAt: new Date().toISOString() },
        ];

        const MOCK_TALENTS: FirestoreUser[] = [
          { uid: "t-1", email: "alex.rivas@creator.co", fullName: "Alex Rivas", workspaceName: "Alex Studio", accountType: "talent_independent", agencyId: "AG-20001", createdAt: new Date().toISOString() },
          { uid: "t-2", email: "elena.rostova@talent.io", fullName: "Elena Rostova", workspaceName: "Elena Vlog", accountType: "talent_independent", agencyId: "AG-20002", createdAt: new Date().toISOString() },
          { uid: "t-3", email: "marcus.chen@studio.com", fullName: "Marcus Chen", workspaceName: "Marcus Media", accountType: "talent_independent", agencyId: "AG-20003", createdAt: new Date().toISOString() },
          { uid: "t-4", email: "sarah.jenkins@vlog.tv", fullName: "Sarah Jenkins", workspaceName: "Sarah Vlog", accountType: "talent_independent", agencyId: "AG-20004", createdAt: new Date().toISOString() },
        ];

        setBrands(brandsData && brandsData.length > 0 ? brandsData : MOCK_BRANDS);
        setTalents(talentsData && talentsData.length > 0 ? talentsData : MOCK_TALENTS);
      } catch (e) {
        console.error("Error loading contacts:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadContacts();
  }, [state.user]);

  const toggleTheme = () => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.toggle("light");
      if (isLight) document.documentElement.classList.remove("dark");
      else document.documentElement.classList.add("dark");
      setIsLightTheme(isLight);
      localStorage.setItem("agncypay_theme_agency", isLight ? "light" : "dark");
    }
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;
    setIsSendingInvite(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (inviteModalType === "brand") {
        setBrands(prev => [{
          uid: `b-${Date.now()}`,
          email: inviteEmail,
          fullName: inviteName,
          workspaceName: inviteName,
          accountType: "brand",
          agencyId: state.user?.agncyId || "AG-1000",
          createdAt: new Date().toISOString()
        }, ...prev]);
      } else if (inviteModalType === "talent") {
        setTalents(prev => [{
          uid: `t-${Date.now()}`,
          email: inviteEmail,
          fullName: inviteName,
          workspaceName: `${inviteName} Studio`,
          accountType: "talent_independent",
          agencyId: state.user?.agncyId || "AG-2000",
          createdAt: new Date().toISOString()
        }, ...prev]);
      }
      setIsSendingInvite(false);
      setInviteModalType(null);
      setInviteName("");
      setInviteEmail("");
    }, 1000);
  };

  const filteredBrands = brands.filter(b =>
    (b.workspaceName || b.fullName || b.email).toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTalents = talents.filter(t =>
    (t.fullName || t.email).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className={`min-h-screen flex flex-col font-sans antialiased relative transition-colors duration-200 ${isLightTheme ? "bg-[#F8FAFC] text-[#0F172A]" : "bg-black text-white"}`}>
      <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none ${isLightTheme ? "bg-violet-500/[0.06]" : "bg-violet-500/[0.03]"}`} />

      {/* Header */}
      <header className={`border-b sticky top-0 z-40 px-6 py-4 backdrop-blur-md transition-colors ${isLightTheme ? "border-black/10 bg-white/80" : "border-white/10 bg-black/60"}`}>
        <div className="max-w-[1520px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/agencydashboard" className="flex items-center cursor-pointer">
              <img src="/agncypaybrand.png" alt="AgncyPay" className="h-10 w-auto object-contain scale-[1.3] origin-left" />
            </Link>
            <span className={`h-4 w-[1px] hidden md:block ${isLightTheme ? "bg-black/20" : "bg-white/20"}`} />
            <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${isLightTheme ? "bg-black/5 border-black/10 text-[#0F172A]" : "bg-white/10 border-white/20 text-white"}`}>
              <Building2 className="h-3 w-3" />
              Agency Portal
            </div>
          </div>

          {/* 4-Tab Nav */}
          <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-full border ${isLightTheme ? "bg-black/[0.05] border-black/10" : "bg-white/[0.05] border-white/20"}`}>
            <button onClick={() => router.push("/agencydashboard")} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isLightTheme ? "text-[#475569] hover:text-[#0F172A] hover:bg-black/5" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"}`}>Home</button>
            <button onClick={() => router.push("/agencydashboard/invoices")} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${isLightTheme ? "text-[#475569] hover:text-[#0F172A] hover:bg-black/5" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"}`}>Payments</button>
            <button onClick={() => router.push("/agencydashboard/wallet")} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${isLightTheme ? "text-[#475569] hover:text-[#0F172A] hover:bg-black/5" : "text-[#8f8f8f] hover:text-white hover:bg-white/5"}`}>
              <WalletIcon className="w-3.5 h-3.5" />
              Wallet
            </button>
            <button onClick={() => router.push("/agencydashboard/contacts")} className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm border transition-all cursor-pointer flex items-center gap-1.5 ${isLightTheme ? "bg-[#0F172A] text-white border-black/10 force-white-text" : "bg-white text-black border-white/20"}`}>
              <Users className="w-3.5 h-3.5" />
              Contacts
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className={`p-2 rounded-full transition-colors cursor-pointer ${isLightTheme ? "text-[#0F172A] hover:bg-black/5" : "text-neutral-400 hover:text-white hover:bg-white/5"}`}>
              {isLightTheme ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs ${isLightTheme ? "bg-black/5 border-black/10 text-black" : "bg-white/[0.05] border-white/20 text-white"}`}>
                {state.user?.fullName ? state.user.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "AG"}
              </div>
              <span className={`text-xs font-bold hidden sm:inline ${isLightTheme ? "text-black" : "text-white"}`}>
                {state.workspaces.find((w: any) => w.id === state.activeWorkspaceId)?.name || state.user?.fullName || "Agency"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Page Hero */}
      <section className={`border-b py-8 px-6 transition-colors ${isLightTheme ? "bg-white border-black/10" : "bg-[#050505] border-white/10"}`}>
        <div className="max-w-[1520px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${isLightTheme ? "bg-black/5 border-black/15 text-[#0F172A]" : "bg-white/10 border-white/20 text-white"}`}>
                Agency Network
              </span>
            </div>
            <h1 className={`text-2xl font-black tracking-tight ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>Contacts</h1>
            <p className={`text-xs mt-1 ${isLightTheme ? "text-[#475569]" : "text-neutral-400"}`}>Brands you bill and talent you manage — all in one place.</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2.5 rounded-xl border text-center ${isLightTheme ? "bg-white border-black/10" : "bg-white/5 border-white/10"}`}>
              <p className={`text-lg font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>{brands.length}</p>
              <p className={`text-[10px] font-bold ${isLightTheme ? "text-[#475569]" : "text-neutral-400"}`}>Brands</p>
            </div>
            <div className={`px-4 py-2.5 rounded-xl border text-center ${isLightTheme ? "bg-white border-black/10" : "bg-white/5 border-white/10"}`}>
              <p className={`text-lg font-black ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>{talents.length}</p>
              <p className={`text-[10px] font-bold ${isLightTheme ? "text-[#475569]" : "text-neutral-400"}`}>Talent</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-[1520px] mx-auto px-6 py-8 flex-1 w-full">

        {/* Search + Section Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
          {/* Toggle */}
          <div className={`p-1 rounded-full flex items-center gap-1 border ${isLightTheme ? "bg-white border-black/10 shadow-sm" : "bg-white/5 border-white/10"}`}>
            <button
              onClick={() => setActiveSection("brands")}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === "brands"
                  ? isLightTheme ? "bg-[#0F172A] text-white shadow-md" : "bg-white text-black shadow-md"
                  : isLightTheme ? "text-[#475569] hover:text-[#0F172A]" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Brands ({brands.length})
            </button>
            <button
              onClick={() => setActiveSection("talent")}
              className={`px-5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeSection === "talent"
                  ? isLightTheme ? "bg-[#0F172A] text-white shadow-md" : "bg-white text-black shadow-md"
                  : isLightTheme ? "text-[#475569] hover:text-[#0F172A]" : "text-neutral-400 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Talent Roster ({talents.length})
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isLightTheme ? "text-slate-400" : "text-neutral-500"}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeSection === "brands" ? "brands" : "talent"}...`}
                className={`w-full h-9 rounded-xl pl-9 pr-4 text-xs border outline-none transition-colors ${
                  isLightTheme
                    ? "bg-white border-black/10 text-[#0F172A] placeholder:text-slate-400 focus:border-black/20"
                    : "bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus:border-white/20"
                }`}
              />
            </div>

            {activeSection === "talent" ? (
              <button 
                onClick={() => setInviteModalType("talent")}
                className={`shrink-0 h-9 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${isLightTheme ? "bg-[#0F172A] text-white hover:bg-[#1E293B]" : "bg-white text-black hover:bg-neutral-200"}`}
              >
                + Invite Talent
              </button>
            ) : (
              <button 
                onClick={() => setInviteModalType("brand")}
                className={`shrink-0 h-9 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 ${isLightTheme ? "bg-[#0F172A] text-white hover:bg-[#1E293B]" : "bg-white text-black hover:bg-neutral-200"}`}
              >
                + Invite Brand
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className={`w-8 h-8 animate-spin ${isLightTheme ? "text-slate-300" : "text-white/20"}`} />
          </div>
        ) : activeSection === "brands" ? (
          <>
            {filteredBrands.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed ${isLightTheme ? "border-black/10 text-slate-400" : "border-white/10 text-neutral-500"}`}>
                <Briefcase className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm font-bold">No brands found</p>
                <p className="text-xs mt-1 opacity-60">Brands will appear here once they sign up and receive invoices from your agency.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredBrands.map((brand) => {
                  const initials = (brand.workspaceName || brand.fullName || brand.email || "B").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <div
                      key={brand.uid || brand.email}
                      className={`group rounded-2xl border p-5 flex flex-col gap-4 transition-all hover:shadow-lg cursor-pointer ${
                        isLightTheme
                          ? "bg-white border-black/10 hover:border-black/20 hover:shadow-black/5"
                          : "bg-[#0A0A0A] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm ${
                          isLightTheme ? "bg-[#0F172A] text-white border-black" : "bg-white text-black border-white"
                        }`}>
                          {initials}
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          isLightTheme ? "bg-black/5 border-black/15 text-[#0F172A]" : "bg-white/10 border-white/20 text-white"
                        }`}>
                          Active
                        </span>
                      </div>
                      <div>
                        <h3 className={`text-sm font-black leading-tight truncate ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                          {brand.workspaceName || brand.fullName || "Brand"}
                        </h3>
                        <p className={`text-[11px] mt-0.5 flex items-center gap-1 truncate ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{brand.email}</span>
                        </p>
                      </div>
                      <div className={`pt-3 border-t flex items-center justify-between ${isLightTheme ? "border-black/5" : "border-white/5"}`}>
                        <span className={`text-[10px] font-semibold ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>Brand Account</span>
                        <ArrowUpRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {filteredTalents.length === 0 ? (
              <div className={`flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed ${isLightTheme ? "border-black/10 text-slate-400" : "border-white/10 text-neutral-500"}`}>
                <Users className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm font-bold">No talent found</p>
                <p className="text-xs mt-1 opacity-60">Talent will appear here once they register under your agency and receive payouts.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTalents.map((talent) => {
                  const initials = (talent.fullName || talent.email || "T").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                  return (
                    <div
                      key={talent.uid || talent.email}
                      className={`group rounded-2xl border p-5 flex flex-col gap-4 transition-all hover:shadow-lg cursor-pointer ${
                        isLightTheme
                          ? "bg-white border-black/10 hover:border-black/20 hover:shadow-black/5"
                          : "bg-[#0A0A0A] border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm border shadow-sm ${
                          isLightTheme ? "bg-[#0F172A] text-white border-black" : "bg-white text-black border-white"
                        }`}>
                          {initials}
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          isLightTheme ? "bg-black/5 border-black/15 text-[#0F172A]" : "bg-white/10 border-white/20 text-white"
                        }`}>
                          Talent
                        </span>
                      </div>
                      <div>
                        <h3 className={`text-sm font-black leading-tight truncate ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
                          {talent.fullName || "Talent"}
                        </h3>
                        <p className={`text-[11px] mt-0.5 flex items-center gap-1 truncate ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{talent.email}</span>
                        </p>
                      </div>
                      <div className={`pt-3 border-t flex items-center justify-between ${isLightTheme ? "border-black/5" : "border-white/5"}`}>
                        <span className={`text-[10px] font-semibold flex items-center gap-1 ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
                          <CheckCircle2 className={`w-3 h-3 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`} />
                          Verified Talent
                        </span>
                        <ArrowUpRight className={`w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className={`border-t py-10 px-6 mt-16 text-xs transition-colors ${isLightTheme ? "border-black/10 bg-white text-slate-600" : "border-white/10 bg-black text-neutral-500"}`}>
        <div className="max-w-[1520px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className={`font-black tracking-widest text-sm ${isLightTheme ? "text-black" : "text-white"}`}>AGNCYPAY</div>
            <p className="text-[11px]">© 2026 AgncyPay Technologies, Inc. All rights reserved.</p>
          </div>
          <div className={`flex flex-wrap gap-6 text-xs font-semibold ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>
            <a href="#" className={`transition-colors ${isLightTheme ? "hover:text-black" : "hover:text-white"}`}>Legal & Privacy</a>
            <a href="#" className={`transition-colors ${isLightTheme ? "hover:text-black" : "hover:text-white"}`}>Support & Help</a>
            <a href="#" className={`transition-colors ${isLightTheme ? "hover:text-black" : "hover:text-white"}`}>Security Hub</a>
          </div>
        </div>
      </footer>

      {/* Invite Modal */}
      {inviteModalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`relative w-full max-w-md rounded-2xl shadow-2xl p-6 border ${isLightTheme ? "bg-white border-black/10" : "bg-[#0A0A0A] border-white/10"}`}>
            <button
              onClick={() => {
                setInviteModalType(null);
                setInviteName("");
                setInviteEmail("");
              }}
              className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${isLightTheme ? "hover:bg-black/5 text-slate-500" : "hover:bg-white/10 text-neutral-400"}`}
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className={`text-xl font-black tracking-tight mb-1 ${isLightTheme ? "text-[#0F172A]" : "text-white"}`}>
              Invite {inviteModalType === "brand" ? "Brand" : "Talent"}
            </h2>
            <p className={`text-xs mb-6 ${isLightTheme ? "text-slate-500" : "text-neutral-400"}`}>
              Send an email invitation for them to join your network.
            </p>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div className="space-y-1.5">
                <label className={`block text-[11px] font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>Full Name or Company</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  placeholder={`e.g. ${inviteModalType === "brand" ? "Acme Corp" : "John Doe"}`}
                  className={`w-full h-11 px-4 rounded-xl text-sm border outline-none transition-colors ${
                    isLightTheme
                      ? "bg-white border-black/10 text-[#0F172A] placeholder:text-slate-400 focus:border-black/20 focus:ring-1 focus:ring-black/10"
                      : "bg-[#111] border-white/10 text-white placeholder:text-neutral-600 focus:border-white/20 focus:ring-1 focus:ring-white/10"
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <label className={`block text-[11px] font-bold uppercase tracking-wider ${isLightTheme ? "text-slate-600" : "text-neutral-400"}`}>Email Address</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  className={`w-full h-11 px-4 rounded-xl text-sm border outline-none transition-colors ${
                    isLightTheme
                      ? "bg-white border-black/10 text-[#0F172A] placeholder:text-slate-400 focus:border-black/20 focus:ring-1 focus:ring-black/10"
                      : "bg-[#111] border-white/10 text-white placeholder:text-neutral-600 focus:border-white/20 focus:ring-1 focus:ring-white/10"
                  }`}
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setInviteModalType(null);
                    setInviteName("");
                    setInviteEmail("");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${isLightTheme ? "text-slate-600 hover:bg-black/5" : "text-neutral-400 hover:bg-white/5"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingInvite || !inviteName || !inviteEmail}
                  className={`h-10 px-6 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                    isLightTheme 
                      ? "bg-[#0F172A] text-white hover:bg-[#1E293B] disabled:bg-slate-200 disabled:text-slate-400" 
                      : "bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-500"
                  }`}
                >
                  {isSendingInvite ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
