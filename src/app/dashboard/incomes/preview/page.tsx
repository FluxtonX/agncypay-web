"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ChevronUp, Download, FileText, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "../../../../lib/utils";

// ─── Static Platform Data (Fallback) ──────────────────────────────────────────

const getFavicon = (domain: string) =>
  `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;

interface Transaction {
  artist: string;
  desc: string;
  date: string;
  status: "Paid" | "Pending" | "Processing";
  amount: string;
  rawAmount: number;
}

interface Platform {
  name: string;
  icon: string;
  color: string;
  accentBg: string;
  transactions: Transaction[];
}

const platformData: Record<string, Platform> = {
  youtube: {
    name: "YouTube",
    icon: getFavicon("youtube.com"),
    color: "#FF0000",
    accentBg: "rgba(255,0,0,0.08)",
    transactions: [
      { artist: "Ad Revenue", desc: "Channel Monetization — June 2026", date: "15 Jun, 2026", status: "Paid", amount: "$4,250.00", rawAmount: 4250 },
      { artist: "Super Chat", desc: "Live Stream Tips — Week 23", date: "12 Jun, 2026", status: "Paid", amount: "$1,820.50", rawAmount: 1820.5 },
      { artist: "Channel Memberships", desc: "Monthly Subscriptions", date: "10 Jun, 2026", status: "Paid", amount: "$3,100.00", rawAmount: 3100 },
      { artist: "YouTube Shorts", desc: "Shorts Fund Bonus", date: "08 Jun, 2026", status: "Processing", amount: "$950.00", rawAmount: 950 },
      { artist: "Brand Sponsorship", desc: "Nike Campaign Integration", date: "05 Jun, 2026", status: "Paid", amount: "$12,000.00", rawAmount: 12000 },
      { artist: "Merchandise Shelf", desc: "Product Sales Revenue", date: "03 Jun, 2026", status: "Paid", amount: "$2,340.00", rawAmount: 2340 },
      { artist: "YouTube Premium", desc: "Premium Watch Revenue", date: "01 Jun, 2026", status: "Paid", amount: "$1,675.25", rawAmount: 1675.25 },
      { artist: "Ad Revenue", desc: "Channel Monetization — May 2026", date: "28 May, 2026", status: "Paid", amount: "$3,890.00", rawAmount: 3890 },
      { artist: "Super Thanks", desc: "Video Appreciation Tips", date: "25 May, 2026", status: "Pending", amount: "$420.75", rawAmount: 420.75 },
      { artist: "Content Licensing", desc: "Third-party Usage License", date: "20 May, 2026", status: "Paid", amount: "$5,500.00", rawAmount: 5500 },
    ],
  },
  apple_music: {
    name: "Apple Music",
    icon: getFavicon("music.apple.com"),
    color: "#FA2D48",
    accentBg: "rgba(250,45,72,0.08)",
    transactions: [
      { artist: "Drake", desc: "Streaming Royalties — Q2 2026", date: "14 Jun, 2026", status: "Paid", amount: "$8,420.00", rawAmount: 8420 },
      { artist: "The Weeknd", desc: "Album: After Hours Deluxe", date: "12 Jun, 2026", status: "Paid", amount: "$6,750.30", rawAmount: 6750.3 },
      { artist: "Billie Eilish", desc: "Single: Ocean Eyes Remix", date: "10 Jun, 2026", status: "Processing", amount: "$3,200.00", rawAmount: 3200 },
      { artist: "Taylor Swift", desc: "Album: Midnights Vault", date: "08 Jun, 2026", status: "Paid", amount: "$15,800.00", rawAmount: 15800 },
      { artist: "Bad Bunny", desc: "Latin Streaming Revenue", date: "05 Jun, 2026", status: "Paid", amount: "$4,100.50", rawAmount: 4100.5 },
      { artist: "SZA", desc: "Album: SOS Extended", date: "02 Jun, 2026", status: "Paid", amount: "$5,620.00", rawAmount: 5620 },
      { artist: "Doja Cat", desc: "Streaming Royalties — May", date: "28 May, 2026", status: "Paid", amount: "$2,980.75", rawAmount: 2980.75 },
      { artist: "Post Malone", desc: "Feature Splits Revenue", date: "25 May, 2026", status: "Pending", amount: "$1,450.00", rawAmount: 1450 },
    ],
  },
  amazon_music: {
    name: "Amazon Music",
    icon: getFavicon("music.amazon.com"),
    color: "#25D1DA",
    accentBg: "rgba(37,209,218,0.08)",
    transactions: [
      { artist: "Compilation Mix", desc: "Unlimited Tier Streams — June", date: "13 Jun, 2026", status: "Paid", amount: "$2,180.00", rawAmount: 2180 },
      { artist: "Podcast Revenue", desc: "Exclusive Podcast Distribution", date: "11 Jun, 2026", status: "Paid", amount: "$1,540.25", rawAmount: 1540.25 },
      { artist: "HD Audio Bonus", desc: "Ultra HD Quality Premium", date: "09 Jun, 2026", status: "Processing", amount: "$890.00", rawAmount: 890 },
      { artist: "Prime Music", desc: "Prime Member Streams", date: "06 Jun, 2026", status: "Paid", amount: "$3,450.00", rawAmount: 3450 },
      { artist: "Alexa Plays", desc: "Voice-activated Streaming", date: "04 Jun, 2026", status: "Paid", amount: "$1,220.50", rawAmount: 1220.5 },
      { artist: "Twitch Integration", desc: "Cross-platform Subscribers", date: "01 Jun, 2026", status: "Paid", amount: "$2,800.00", rawAmount: 2800 },
      { artist: "Artist Merch", desc: "Amazon Store Product Sales", date: "28 May, 2026", status: "Pending", amount: "$760.00", rawAmount: 760 },
      { artist: "Compilation Mix", desc: "Unlimited Tier Streams — May", date: "25 May, 2026", status: "Paid", amount: "$2,050.75", rawAmount: 2050.75 },
      { artist: "Live Events", desc: "Concert Streaming Revenue", date: "22 May, 2026", status: "Paid", amount: "$4,600.00", rawAmount: 4600 },
    ],
  },
  spotify: {
    name: "Spotify",
    icon: getFavicon("spotify.com"),
    color: "#1DB954",
    accentBg: "rgba(29,185,84,0.08)",
    transactions: [
      { artist: "Top Hits Playlist", desc: "Editorial Placement Revenue", date: "14 Jun, 2026", status: "Paid", amount: "$6,320.00", rawAmount: 6320 },
      { artist: "Discover Weekly", desc: "Algorithm-driven Streams", date: "12 Jun, 2026", status: "Paid", amount: "$2,840.50", rawAmount: 2840.5 },
      { artist: "Premium Streams", desc: "Ad-free Listener Revenue", date: "10 Jun, 2026", status: "Paid", amount: "$4,100.00", rawAmount: 4100 },
      { artist: "Release Radar", desc: "New Release First-week", date: "07 Jun, 2026", status: "Processing", amount: "$1,950.25", rawAmount: 1950.25 },
      { artist: "Podcast Hosting", desc: "Anchor Distribution Revenue", date: "05 Jun, 2026", status: "Paid", amount: "$3,200.00", rawAmount: 3200 },
      { artist: "Fan Support", desc: "Artist Pick Donations", date: "02 Jun, 2026", status: "Paid", amount: "$580.00", rawAmount: 580 },
      { artist: "Wrapped Campaign", desc: "Yearly Recap Engagement", date: "30 May, 2026", status: "Paid", amount: "$1,200.00", rawAmount: 1200 },
      { artist: "Free Tier Ads", desc: "Ad-supported Streams", date: "27 May, 2026", status: "Pending", amount: "$890.75", rawAmount: 890.75 },
      { artist: "Canvas Loops", desc: "Visual Content Revenue", date: "24 May, 2026", status: "Paid", amount: "$340.00", rawAmount: 340 },
    ],
  },
  soundcloud: {
    name: "SoundCloud",
    icon: getFavicon("soundcloud.com"),
    color: "#FF5500",
    accentBg: "rgba(255,85,0,0.08)",
    transactions: [
      { artist: "Fan-Powered", desc: "Direct Fan Royalties — June", date: "13 Jun, 2026", status: "Paid", amount: "$1,840.00", rawAmount: 1840 },
      { artist: "SoundCloud Go+", desc: "Premium Subscription Streams", date: "11 Jun, 2026", status: "Paid", amount: "$920.50", rawAmount: 920.5 },
      { artist: "Repost Network", desc: "Distribution Revenue Share", date: "09 Jun, 2026", status: "Processing", amount: "$2,100.00", rawAmount: 2100 },
      { artist: "Promoted Tracks", desc: "Paid Promotion Revenue", date: "06 Jun, 2026", status: "Paid", amount: "$650.25", rawAmount: 650.25 },
      { artist: "Next Pro", desc: "Pro Plan Artist Features", date: "03 Jun, 2026", status: "Paid", amount: "$1,380.00", rawAmount: 1380 },
      { artist: "Fan-Powered", desc: "Direct Fan Royalties — May", date: "28 May, 2026", status: "Paid", amount: "$1,560.00", rawAmount: 1560 },
      { artist: "Sync Licensing", desc: "Content Licensing Revenue", date: "25 May, 2026", status: "Pending", amount: "$3,200.00", rawAmount: 3200 },
      { artist: "Buzz Charts", desc: "Trending Chart Bonus", date: "22 May, 2026", status: "Paid", amount: "$480.00", rawAmount: 480 },
    ],
  },
};

const platformMetaData = {
  youtube: { name: "YouTube", icon: getFavicon("youtube.com"), color: "#FF0000", accentBg: "rgba(255,0,0,0.08)" },
  apple_music: { name: "Apple Music", icon: getFavicon("music.apple.com"), color: "#FA2D48", accentBg: "rgba(250,45,72,0.08)" },
  amazon_music: { name: "Amazon Music", icon: getFavicon("music.amazon.com"), color: "#25D1DA", accentBg: "rgba(37,209,218,0.08)" },
  spotify: { name: "Spotify", icon: getFavicon("spotify.com"), color: "#1DB954", accentBg: "rgba(29,185,84,0.08)" },
  soundcloud: { name: "SoundCloud", icon: getFavicon("soundcloud.com"), color: "#FF5500", accentBg: "rgba(255,85,0,0.08)" },
};

const platformKeys = Object.keys(platformMetaData);

function formatCurrency(value: number) {
  const val = typeof value === "number" && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(val);
}

// ─── Status Badge Component ─────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Transaction["status"] }) {
  const styles = {
    Paid: "bg-[#13d463]/15 text-[#13d463] border-[#13d463]/20",
    Pending: "bg-[#F5A623]/15 text-[#F5A623] border-[#F5A623]/20",
    Processing: "bg-[#5B8DEF]/15 text-[#5B8DEF] border-[#5B8DEF]/20",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", styles[status])}>
      {status === "Processing" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#5B8DEF] animate-pulse" />
      )}
      {status}
    </span>
  );
}

// ─── Map Vendor Names to Favicon Domains and Colors dynamically ─────────────────

const getVendorFavicon = (vendorName: string) => {
  const lower = vendorName.toLowerCase();
  if (lower.includes("youtube") || lower.includes("google") || lower.includes("red")) return getFavicon("youtube.com");
  if (lower.includes("apple") || lower.includes("itunes")) return getFavicon("music.apple.com");
  if (lower.includes("amazon")) return getFavicon("music.amazon.com");
  if (lower.includes("spotify")) return getFavicon("spotify.com");
  if (lower.includes("soundcloud")) return getFavicon("soundcloud.com");
  
  // Dynamic domain query fallback
  const cleanName = lower.replace(/[^a-z0-9]/g, "");
  return getFavicon(`${cleanName || "globe"}.com`);
};

const getVendorColor = (vendorName: string) => {
  const lower = vendorName.toLowerCase();
  if (lower.includes("youtube") || lower.includes("google") || lower.includes("red")) return "#FF0000";
  if (lower.includes("apple") || lower.includes("itunes")) return "#FA2D48";
  if (lower.includes("amazon")) return "#25D1DA";
  if (lower.includes("spotify")) return "#1DB954";
  if (lower.includes("soundcloud")) return "#FF5500";
  
  // List of premium neon accent colors for custom platforms
  const colors = ["#FA2D48", "#25D1DA", "#1DB954", "#FF5500", "#FFC107", "#9C27B0", "#00BCD4", "#E91E63"];
  const charCode = vendorName.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

// ─── Main Preview Page ──────────────────────────────────────────────────────────

export default function IncomePreviewPage() {
  const router = useRouter();
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [isPageLoading, setIsPageLoading] = useState(true);
  
  // Backend API state
  const [apiSummary, setApiSummary] = useState<any>(null);
  const [useFallbackStatic, setUseFallbackStatic] = useState(false);

  // Fetch API summary on load
  useEffect(() => {
    const fetchSummary = async () => {
      setIsPageLoading(true);
      let uploadId = "";
      let fileName = "";
      
      try {
        uploadId = localStorage.getItem("uploadedUploadId") || "";
        fileName = localStorage.getItem("uploadedFileName") || "Digital Sales Excel";
        setUploadedFileName(fileName);
      } catch {}

      if (!uploadId) {
        setUseFallbackStatic(true);
        setIsPageLoading(false);
        return;
      }

      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://agencypay-website-backend.onrender.com";
        const response = await fetch(`${apiBaseUrl}/api/excel/uploads/${uploadId}/summary`);
        const data = await response.json();

        if (response.ok && data?.success && data?.data) {
          setApiSummary(data.data);
          setUseFallbackStatic(false);
        } else {
          console.warn("API summary response unsuccessful, using fallback static data.");
          setUseFallbackStatic(true);
        }
      } catch (err) {
        console.error("Failed to fetch API summary, falling back to static:", err);
        setUseFallbackStatic(true);
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Handle Accordion Toggle with Simulated Loading Effect
  const handleTogglePlatform = (key: string) => {
    if (expandedPlatform === key) {
      setExpandedPlatform(null);
      return;
    }
    setLoadingPlatform(key);
    setTimeout(() => {
      setExpandedPlatform(key);
      setLoadingPlatform(null);
    }, 800);
  };

  // Calculate Overall Totals defensively
  let overallNetIncome = 0;
  let overallDistribution = 0;
  let overallNetPayable = 0;
  let overallRowCount = 0;

  if (useFallbackStatic) {
    Object.values(platformData).forEach((p) => {
      p.transactions.forEach((t) => {
        overallNetIncome += t.rawAmount;
        overallDistribution += t.rawAmount * 0.10; // Mock 10% agency fee
        overallNetPayable += t.rawAmount * 0.90;
        overallRowCount += 1;
      });
    });
  } else if (apiSummary) {
    overallNetIncome = apiSummary.totals?.totalNetIncome ?? 0;
    overallDistribution = Math.abs(apiSummary.totals?.totalDistribution ?? 0);
    overallNetPayable = apiSummary.totals?.totalNetPayable ?? 0;
    overallRowCount = apiSummary.rowCount ?? 0;
  }

  // Pre-process platform list calculations dynamically (No "Other Platforms" sub-grouping)
  const platformSummaryList = useFallbackStatic
    ? platformKeys.map((key) => {
        const meta = platformMetaData[key as keyof typeof platformMetaData];
        const staticPlat = platformData[key];
        const platformIncome = staticPlat?.transactions.reduce((acc, t) => acc + t.rawAmount, 0) || 0;
        return {
          key,
          name: meta?.name || key,
          icon: meta?.icon || getFavicon("globe.com"),
          color: meta?.color || "#888888",
          accentBg: meta?.accentBg || "rgba(136,136,136,0.08)",
          income: platformIncome,
          payable: platformIncome * 0.90,
          distribution: platformIncome * 0.10,
          rows: staticPlat?.transactions.length || 0,
          percentage: overallNetIncome > 0 ? (platformIncome / overallNetIncome) * 100 : 0,
          detailsList: staticPlat?.transactions || [],
        };
      })
    : (apiSummary?.vendors || []).map((v: any, index: number) => {
        const vName = v.vendor || "Unknown Platform";
        const key = `api-${index}-${vName.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
        const icon = getVendorFavicon(vName);
        const color = getVendorColor(vName);
        const income = v.totalNetIncome ?? 0;
        const distribution = Math.abs(v.totalDistribution ?? 0);
        const payable = v.totalNetPayable ?? 0;
        const rows = v.rowCount ?? 0;
        const percentage = overallNetIncome > 0 ? (income / overallNetIncome) * 100 : 0;
        
        return {
          key,
          name: vName,
          icon,
          color,
          accentBg: `rgba(255, 255, 255, 0.04)`,
          income,
          payable,
          distribution,
          rows,
          percentage,
          detailsList: [v], // Holds the vendor summary data itself
        };
      });

  // Sort platforms by total income descending
  platformSummaryList.sort((a: any, b: any) => b.income - a.income);

  // Loading Screen for initial data fetch
  if (isPageLoading) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#222] border-t-[#13d463] mb-4"></div>
        <p className="text-[14px] text-[#8f8f8f]">Fetching digital sales summaries...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Back Button + Header ── */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="group mb-5 inline-flex items-center gap-2 text-[13px] font-medium text-[#8d8d8d] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </button>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[32px] font-semibold leading-none text-white">Income Preview</h1>
            <div className="mt-3 flex items-center gap-2 text-[14px] text-[#8d8d8d]">
              <FileText className="h-4 w-4 text-[#555]" />
              <span>Source: <span className="font-medium text-[#c8c8c8]">{uploadedFileName}</span></span>
            </div>
          </div>
          <button className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[8px] border border-[#3a3a3a] bg-[#0a0a0a] px-4 text-[13px] font-semibold text-white transition-colors hover:border-[#555] hover:bg-[#111]">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* ── Summary Stats Header Card ── */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[#222] bg-[#060606] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#777]">Total Gross Income</p>
          <p className="mt-2 text-[26px] font-black tracking-tight text-[#13d463]">{formatCurrency(overallNetIncome)}</p>
          <p className="mt-1 text-[11px] text-[#555]">{overallRowCount.toLocaleString()} total transactions parsed</p>
        </div>
        <div className="rounded-[12px] border border-[#222] bg-[#060606] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#777]">Agency Distribution (Cut)</p>
          <p className="mt-2 text-[26px] font-black tracking-tight text-[#ff5f5f]">{formatCurrency(overallDistribution)}</p>
          <p className="mt-1 text-[11px] text-[#555]">Calculated platform fees / splits</p>
        </div>
        <div className="rounded-[12px] border border-[#222] bg-[#060606] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#777]">Net Payable to Talent</p>
          <p className="mt-2 text-[26px] font-black tracking-tight text-white">{formatCurrency(overallNetPayable)}</p>
          <p className="mt-1 text-[11px] text-[#555]">Final amount after distribution split</p>
        </div>
      </div>

      {/* ── Platforms Feed (Accordion) ── */}
      <h2 className="text-[18px] font-semibold text-white mb-4">Platform Breakdown</h2>
      
      <div className="space-y-4">
        {platformSummaryList.map((plat: any) => {
          const isExpanded = expandedPlatform === plat.key;
          const isLoading = loadingPlatform === plat.key;
          
          return (
            <div 
              key={plat.key}
              className={cn(
                "rounded-[12px] border border-[#1e1e1e] bg-[#060606] overflow-hidden transition-all duration-300",
                isExpanded ? "border-[#333] shadow-[0_4px_20px_rgba(0,0,0,0.5)]" : "hover:border-[#2a2a2a]"
              )}
            >
              {/* Accordion Trigger Header */}
              <button
                onClick={() => handleTogglePlatform(plat.key)}
                className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-white/[0.01]"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#252525] bg-[#111] p-1.5">
                    <img
                      src={plat.icon}
                      alt={plat.name}
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[15px] font-bold text-white block">{plat.name}</span>
                    <span className="text-[11px] text-[#555] block mt-0.5">{plat.rows.toLocaleString()} transactions</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Aggregated Total */}
                  <div className="text-right">
                    <span className="text-[16px] font-black text-[#13d463] block">{formatCurrency(plat.income)}</span>
                    <span className="inline-flex items-center rounded bg-[#13d463]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#13d463] mt-0.5">
                      {plat.percentage.toFixed(1)}% share
                    </span>
                  </div>
                  
                  {/* Chevron indicator */}
                  <div className="text-[#8d8d8d]">
                    {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </button>

              {/* Progress bar below header when collapsed */}
              {!isExpanded && plat.income > 0 && (
                <div className="px-6 pb-2">
                  <div className="h-1 w-full rounded-full bg-[#111] overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${plat.percentage}%`, 
                        backgroundColor: plat.color 
                      }} 
                    />
                  </div>
                </div>
              )}

              {/* Loader Inline */}
              {isLoading && (
                <div className="border-t border-[#1a1a1a] flex flex-col items-center justify-center py-10 bg-black/20">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#333] border-t-[#13d463] mb-3"></div>
                  <p className="text-[12px] text-[#555]">Structuring {plat.name} details...</p>
                </div>
              )}

              {/* Expandable Detailed Data Table */}
              {isExpanded && !isLoading && (
                <div className="border-t border-[#1a1a1a] bg-black/40 px-6 py-5 animate-in fade-in duration-200">
                  {plat.detailsList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <AlertTriangle className="h-6 w-6 text-yellow-500 mb-2 opacity-60" />
                      <p className="text-[13px] text-[#777]">No earnings records available for this platform.</p>
                    </div>
                  ) : useFallbackStatic ? (
                    /* Fallback Static mock transactions table */
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[13px]">
                        <thead>
                          <tr className="border-b border-[#222] text-[11px] font-semibold uppercase tracking-wider text-[#555]">
                            <th className="py-2.5">Artist / Track</th>
                            <th className="py-2.5">Description</th>
                            <th className="py-2.5">Date</th>
                            <th className="py-2.5">Status</th>
                            <th className="py-2.5 text-right">Gross Income</th>
                          </tr>
                        </thead>
                        <tbody>
                          {plat.detailsList.map((tx: any, idx: number) => (
                            <tr key={idx} className="border-b border-[#111] last:border-b-0 hover:bg-white/[0.01]">
                              <td className="py-3 font-medium text-white">{tx.artist}</td>
                              <td className="py-3 text-[#777]">{tx.desc}</td>
                              <td className="py-3 text-[#666]">{tx.date}</td>
                              <td className="py-3"><StatusBadge status={tx.status} /></td>
                              <td className="py-3 text-right font-semibold text-[#13d463]">{tx.amount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    /* Real API vendor details (Grid layout for platform metrics) */
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 py-2 animate-in fade-in duration-300">
                      <div className="rounded-lg border border-[#222] bg-[#090909] p-4 text-left">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777] block">Gross Income</span>
                        <span className="text-[16px] font-black text-[#13d463] block mt-1">{formatCurrency(plat.income)}</span>
                      </div>
                      <div className="rounded-lg border border-[#222] bg-[#090909] p-4 text-left">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777] block">Distribution Cut</span>
                        <span className="text-[16px] font-black text-[#ff5f5f] block mt-1">-{formatCurrency(plat.distribution)}</span>
                      </div>
                      <div className="rounded-lg border border-[#222] bg-[#090909] p-4 text-left">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777] block">Net Payable to Model</span>
                        <span className="text-[16px] font-black text-white block mt-1">{formatCurrency(plat.payable)}</span>
                      </div>
                      <div className="rounded-lg border border-[#222] bg-[#090909] p-4 text-left">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777] block">Transactions Parsed</span>
                        <span className="text-[16px] font-black text-[#c8c8c8] block mt-1">{plat.rows.toLocaleString()} rows</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
