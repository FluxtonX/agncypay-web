"use client";

import React, { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { CheckCircle2, RefreshCw, ArrowRight, Database, Server } from "lucide-react";

// Mock User Templates (3 Brands, 5 Agencies, 10 Talents)
const BRANDS = [
  { email: "adidas@brand.com", fullName: "Adidas Corporate", accountType: "brand", workspaceName: "Adidas Corporate HQ", agencyId: "BRND-ADIDAS" },
  { email: "nike@brand.com", fullName: "Nike USA", accountType: "brand", workspaceName: "Nike USA Inc.", agencyId: "BRND-NIKE" },
  { email: "tiktok@brand.com", fullName: "TikTok Global", accountType: "brand", workspaceName: "TikTok Global", agencyId: "BRND-TIKTOK" }
];

const AGENCIES = [
  { email: "elite@agency.com", fullName: "Elite Model Management", accountType: "agency", workspaceName: "Elite Models NYC", agencyId: "AGY-ELITE" },
  { email: "img@agency.com", fullName: "IMG Models", accountType: "agency", workspaceName: "IMG Models World", agencyId: "AGY-IMG" },
  { email: "caa@agency.com", fullName: "Creative Artists Agency", accountType: "agency", workspaceName: "CAA Beverly Hills", agencyId: "AGY-CAA" },
  { email: "uta@agency.com", fullName: "United Talent Agency", accountType: "agency", workspaceName: "UTA Los Angeles", agencyId: "AGY-UTA" },
  { email: "mother@agency.com", fullName: "Mother Agency Hub", accountType: "agency", workspaceName: "Universal Mother Agency", agencyId: "AGY-MOTHER" }
];

const TALENTS = [
  // Elite Models
  { email: "gigi@talent.com", fullName: "Gigi Hadid", accountType: "individual", workspaceName: "Gigi Hadid Studio", agencyId: "TAL-GIGI", parentAgencyEmail: "elite@agency.com" },
  { email: "sarah@talent.com", fullName: "Sarah Connor", accountType: "individual", workspaceName: "Sarah Connor Studio", agencyId: "TAL-SARAH", parentAgencyEmail: "elite@agency.com" },
  // IMG Models
  { email: "kendall@talent.com", fullName: "Kendall Jenner", accountType: "individual", workspaceName: "Kendall Jenner LLC", agencyId: "TAL-KENDALL", parentAgencyEmail: "img@agency.com" },
  { email: "bella@talent.com", fullName: "Bella Hadid", accountType: "individual", workspaceName: "Bella Hadid Inc", agencyId: "TAL-BELLA", parentAgencyEmail: "img@agency.com" },
  // CAA
  { email: "anthea@talent.com", fullName: "Anthea Smith", accountType: "individual", workspaceName: "Anthea Smith Model", agencyId: "TAL-ANTHEA", parentAgencyEmail: "caa@agency.com" },
  // UTA
  { email: "charlie@talent.com", fullName: "Charlie D'Amelio", accountType: "individual", workspaceName: "Charlie D'Amelio Media", agencyId: "TAL-CHARLIE", parentAgencyEmail: "uta@agency.com" },
  { email: "zach@talent.com", fullName: "Zach King", accountType: "individual", workspaceName: "Zach King Visuals", agencyId: "TAL-ZACH", parentAgencyEmail: "uta@agency.com" },
  // Mother Agency
  { email: "alex@talent.com", fullName: "Alex Morgan", accountType: "individual", workspaceName: "Alex Morgan Sports", agencyId: "TAL-ALEX", parentAgencyEmail: "mother@agency.com" },
  // Independent
  { email: "independent@talent.com", fullName: "Independent Creator", accountType: "individual", workspaceName: "Solo Creator Studio", agencyId: "TAL-INDIE", parentAgencyEmail: "" },
  { email: "solo@talent.com", fullName: "Solo Musician", accountType: "individual", workspaceName: "Solo Musician Studio", agencyId: "TAL-SOLO", parentAgencyEmail: "" }
];

export default function SeederPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingComplete, setSeedingComplete] = useState(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const executeSeeding = async () => {
    if (isSeeding) return;
    setIsSeeding(true);
    setSeedingComplete(false);
    setLogs([]);

    addLog("Initializing demo database seed...");
    addLog("Clearing local storage auth states...");
    
    // Clear local storage demo cache
    localStorage.removeItem("agncypay_state");
    localStorage.removeItem("brand_stats_paid_volume");
    localStorage.removeItem("brand_stats_autosplit_savings");
    localStorage.removeItem("brand_widget_invoices");
    localStorage.removeItem("agency_notifications");
    localStorage.removeItem("brand_queue_invoices");

    // Clear user-specific caches for the seeded emails
    const allEmails = [...BRANDS, ...AGENCIES, ...TALENTS].map(u => u.email);
    allEmails.forEach(email => {
      localStorage.removeItem(`talent_withdraw_adjust_${email}`);
      localStorage.removeItem(`talent_net0_advanced_${email}`);
      localStorage.removeItem(`brand_stats_paid_volume_${email}`);
      localStorage.removeItem(`brand_stats_autosplit_savings_${email}`);
      localStorage.removeItem(`brand_widget_invoices_${email}`);
      localStorage.removeItem(`agency_notifications_${email}`);
      localStorage.removeItem(`brand_queue_invoices_${email}`);
      localStorage.removeItem(`uploadedIncomes_${email}`);
    });

    try {
      addLog("Signing out active admin session...");
      await signOut(auth);

      // Map to link Talent with parent Agency UID
      const agencyUidMap: Record<string, string> = {};

      // 1. Seed Brands
      addLog("--- Seeding Brands (3) ---");
      for (const brand of BRANDS) {
        addLog(`Creating Brand: ${brand.fullName} (${brand.email})...`);
        const uid = await registerOrUpdateUser(brand);
        addLog(`✓ Registered ${brand.fullName} (UID: ${uid})`);
      }

      // 2. Seed Agencies
      addLog("--- Seeding Agencies (5) ---");
      for (const agency of AGENCIES) {
        addLog(`Creating Agency: ${agency.fullName} (${agency.email})...`);
        const uid = await registerOrUpdateUser(agency);
        agencyUidMap[agency.email] = uid;
        addLog(`✓ Registered ${agency.fullName} (UID: ${uid})`);
      }

      // 3. Seed Talents
      addLog("--- Seeding Talents (10) ---");
      for (const talent of TALENTS) {
        const parentAgencyUid = talent.parentAgencyEmail ? (agencyUidMap[talent.parentAgencyEmail] || "") : "";
        addLog(`Creating Talent: ${talent.fullName} (${talent.email})...`);
        const uid = await registerOrUpdateUser({
          ...talent,
          parentAgencyUid
        });
        addLog(`✓ Registered ${talent.fullName} (UID: ${uid})`);
      }

      // 4. Seed Linked Invoices
      addLog("--- Seeding Invoices & Splits ---");
      const seededInvoices = [
        {
          id: "W-INV-001",
          campaign: "Winter Editorial 2026",
          agency: "Elite Model Management",
          agencyEmail: "elite@agency.com",
          talent: "Gigi Hadid",
          talentEmail: "gigi@talent.com",
          brandName: "Adidas Corporate HQ",
          brandEmail: "adidas@brand.com",
          amount: 15000,
          due: "Jul 28, 2026",
          status: "pending" as const,
          talentPayoutStatus: "pending" as const
        },
        {
          id: "W-INV-002",
          campaign: "Nike Air Max Launch",
          agency: "Elite Model Management",
          agencyEmail: "elite@agency.com",
          talent: "Sarah Connor",
          talentEmail: "sarah@talent.com",
          brandName: "Nike USA Inc.",
          brandEmail: "nike@brand.com",
          amount: 8500,
          due: "Aug 10, 2026",
          status: "paid" as const,
          talentPayoutStatus: "pending" as const
        },
        {
          id: "W-INV-003",
          campaign: "Adidas Originals",
          agency: "IMG Models",
          agencyEmail: "img@agency.com",
          talent: "Kendall Jenner",
          talentEmail: "kendall@talent.com",
          brandName: "Adidas Corporate HQ",
          brandEmail: "adidas@brand.com",
          amount: 25000,
          due: "Jul 31, 2026",
          status: "pending" as const,
          talentPayoutStatus: "pending" as const
        },
        {
          id: "W-INV-004",
          campaign: "Jordan Series Commercial",
          agency: "IMG Models",
          agencyEmail: "img@agency.com",
          talent: "Bella Hadid",
          talentEmail: "bella@talent.com",
          brandName: "Nike USA Inc.",
          brandEmail: "nike@brand.com",
          amount: 18000,
          due: "Aug 15, 2026",
          status: "paid" as const,
          talentPayoutStatus: "disbursed" as const
        },
        {
          id: "W-INV-005",
          campaign: "TikTok Spark Ads",
          agency: "Creative Artists Agency",
          agencyEmail: "caa@agency.com",
          talent: "Anthea Smith",
          talentEmail: "anthea@talent.com",
          brandName: "TikTok Global",
          brandEmail: "tiktok@brand.com",
          amount: 12500,
          due: "Aug 05, 2026",
          status: "pending" as const,
          talentPayoutStatus: "pending" as const
        }
      ];

      for (const inv of seededInvoices) {
        addLog(`Creating invoice ${inv.id} for ${inv.campaign} ($${inv.amount.toLocaleString()})...`);
        const docRef = doc(db, "invoices", inv.id);
        const dateObj = new Date();
        const formattedDate = dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric"
        });

        await setDoc(docRef, {
          ...inv,
          createdDate: formattedDate,
          createdAt: serverTimestamp(),
          payerId: `MB-${Math.floor(6000 + Math.random() * 3000)}`,
          payerEmail: inv.brandEmail,
          payerAddress: ["Corporate Headquarters", "100 Broadway St", "New York, NY 10005"],
          splits: [
            {
              talentName: inv.talent,
              talentEmail: inv.talentEmail,
              amount: inv.amount * 0.85,
              status: inv.talentPayoutStatus === "disbursed" ? "disbursed" : "pending"
            }
          ],
          talentEmails: [inv.talentEmail.trim().toLowerCase()]
        });
        addLog(`✓ Created invoice ${inv.id}`);
      }

      addLog("Sign out session cleanup...");
      await signOut(auth);
      
      addLog("🎉 Database seeded successfully with 3 Brands, 5 Agencies, 10 Talents, and 5 relationship Invoices!");
      setSeedingComplete(true);
    } catch (e: any) {
      console.error(e);
      addLog(`❌ Seeding failed: ${e.message || e}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const registerOrUpdateUser = async (user: any): Promise<string> => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, user.email, "Asdf1234");
      const uid = cred.user.uid;
      const profile = {
        uid,
        email: user.email,
        fullName: user.fullName,
        accountType: user.accountType,
        workspaceName: user.workspaceName,
        agencyId: user.agencyId,
        createdAt: new Date().toISOString(),
        parentAgencyEmail: user.parentAgencyEmail || "",
        parentAgencyUid: user.parentAgencyUid || ""
      };
      await setDoc(doc(db, "users", uid), profile);
      await signOut(auth);
      return uid;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use" || error.code === "auth/email-already-exists") {
        // Sign in to fetch details and overwrite
        const cred = await signInWithEmailAndPassword(auth, user.email, "Asdf1234");
        const uid = cred.user.uid;
        const profile = {
          uid,
          email: user.email,
          fullName: user.fullName,
          accountType: user.accountType,
          workspaceName: user.workspaceName,
          agencyId: user.agencyId,
          createdAt: new Date().toISOString(),
          parentAgencyEmail: user.parentAgencyEmail || "",
          parentAgencyUid: user.parentAgencyUid || ""
        };
        await setDoc(doc(db, "users", uid), profile);
        await signOut(auth);
        return uid;
      } else {
        throw error;
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden font-sans">
      {/* Background Ambient Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/[0.025] blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-[#13d463]/[0.015] blur-[140px] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative z-10 w-full max-w-[720px] bg-[#0A0A0A]/85 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-[0_0_100px_rgba(255,255,255,0.02)]">
        {/* Glowing Top line */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#13d463]/30 to-transparent"></div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#13d463]/10 border border-[#13d463]/20 flex items-center justify-center mb-5 text-[#13d463]">
            <Database className="h-8 w-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent">
            AgncyPay Demo Seeder
          </h1>
          <p className="mt-2.5 text-sm text-neutral-400 max-w-[480px]">
            Seeding utility for the universal creative payment network demo. Link agencies, talents, and brands with verified split ledgers.
          </p>
        </div>

        {/* Setup Parameters Table */}
        <div className="grid grid-cols-3 gap-4 mb-8 text-center text-xs border border-white/5 rounded-2xl p-4 bg-white/[0.01]">
          <div className="border-r border-white/5 flex flex-col items-center">
            <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">Brands</span>
            <span className="text-xl font-bold text-white mt-1">3 Accounts</span>
          </div>
          <div className="border-r border-white/5 flex flex-col items-center">
            <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">Agencies</span>
            <span className="text-xl font-bold text-white mt-1">5 Accounts</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">Talents</span>
            <span className="text-xl font-bold text-white mt-1">10 Accounts</span>
          </div>
        </div>

        {/* Logs terminal */}
        <div className="h-[260px] bg-black border border-white/10 rounded-2xl p-5 overflow-y-auto font-mono text-[11px] leading-5 text-neutral-400 space-y-1 mb-8 shadow-inner">
          {logs.length === 0 ? (
            <div className="text-neutral-600 italic flex items-center gap-2 h-full justify-center">
              <Server className="h-4 w-4" />
              Terminal idle. Click seed button below to begin.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={log.includes("✓") ? "text-emerald-400" : log.includes("❌") ? "text-red-400" : log.includes("---") ? "text-[#13d463] font-bold mt-2" : "text-neutral-300"}>
                {log}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={executeSeeding}
            disabled={isSeeding}
            className="h-12 px-8 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`h-4.5 w-4.5 ${isSeeding ? "animate-spin" : ""}`} />
            {isSeeding ? "Seeding Database..." : "Reset & Seed Demo Data"}
          </button>
          
          {seedingComplete && (
            <Link
              href="/auth/login"
              className="h-12 px-8 rounded-xl border border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              Go to Sign In
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          )}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2.5 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
          <CheckCircle2 className="h-4 w-4 text-emerald-500/50" />
          Default Password: <span className="text-white bg-white/5 px-2 py-0.5 rounded font-mono">Asdf1234</span>
        </div>
      </div>
    </div>
  );
}
