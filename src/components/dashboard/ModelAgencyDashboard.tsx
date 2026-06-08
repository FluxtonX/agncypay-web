import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, EllipsisVertical, Search, UploadCloud, X, ArrowUpRight, FileText, Inbox } from "lucide-react";
import { cn } from "../../lib/utils";

const getFavicon = (domain: string) => `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=128`;

export const modelIncomeItems = [
  {
    slug: "nike",
    name: "Nike",
    detail: "Q3 Campaign revenue",
    date: "Today, 10:24 AM",
    amount: "$3,040.00",
    src: getFavicon("nike.com"),
    fallback: "Nike",
    className: "bg-[#111]",
    imageClassName: "scale-[1]",
  },
  {
    slug: "louis-vuitton",
    name: "Louis Vuitton",
    detail: "Paris Fashion Week",
    date: "Today, 9:42 AM",
    amount: "$9,805.25",
    src: getFavicon("louisvuitton.com"),
    fallback: "LV",
    className: "bg-[#111]",
    imageClassName: "scale-[1]",
  },
  {
    slug: "caa",
    name: "Creative Artists Agency",
    detail: "Talent split",
    date: "Yesterday",
    amount: "$3,500.00",
    src: getFavicon("caa.com"),
    fallback: "CAA",
    className: "bg-[#111]",
    imageClassName: "scale-[1]",
  },
  {
    slug: "elite-models",
    name: "Elite Model Management",
    detail: "Q3 Campaign revenue",
    date: "May 31",
    amount: "$2,600.00",
    src: getFavicon("elitemodelworld.com"),
    fallback: "EM",
    className: "bg-[#111]",
    imageClassName: "scale-[1]",
  },
  {
    slug: "the-north-face",
    name: "The North Face",
    detail: "Winter Editorial",
    date: "May 24",
    amount: "$1,800.00",
    src: getFavicon("thenorthface.com"),
    fallback: "TNF",
    className: "bg-[#111]",
    imageClassName: "scale-[1]",
  },
];

const modelPayoutItems = [
  {
    slug: "kendall-jenner",
    name: "Kendall Jenner",
    detail: "Q3 Campaign split",
    date: "Today, 10:24 AM",
    amount: "$3,040.00",
    src: "/models/kendall.jpg",
    fallback: "KJ",
    imageClassName: "object-cover",
  },
  {
    slug: "gigi-hadid",
    name: "Gigi Hadid",
    detail: "Paris Fashion Week",
    date: "Today, 9:42 AM",
    amount: "$9,805.25",
    src: "/models/gigi.jpg",
    fallback: "GH",
    imageClassName: "object-cover",
  },
  {
    slug: "bella-hadid",
    name: "Bella Hadid",
    detail: "Talent split",
    date: "Yesterday",
    amount: "$3,500.00",
    src: "/models/bella.jpg",
    fallback: "BH",
    imageClassName: "object-cover",
  },
  {
    slug: "img-models",
    name: "IMG Models",
    detail: "Agency cut",
    date: "May 31",
    amount: "$2,600.00",
    src: "https://upload.wikimedia.org/wikipedia/commons/9/91/IMG_Models_logo.svg",
    fallback: "IMG",
    isAgency: true,
  },
  {
    slug: "uta",
    name: "United Talent Agency",
    detail: "Agency cut",
    date: "May 24",
    amount: "$1,800.00",
    src: "https://upload.wikimedia.org/wikipedia/en/2/2d/United_Talent_Agency_logo.png",
    fallback: "UTA",
    isAgency: true,
  },
];

export function RemoteBrandImage({ src, alt, fallback, className, imageClassName }: any) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {failed || !src ? (
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] border border-[#3f3f3f] bg-white px-1 text-center text-[10px] font-semibold leading-[1.05] text-black">
          <span className="block max-w-full truncate">{fallback}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-contain", imageClassName)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-[13px] border border-[#3a3a3a] bg-[#050505]", className)}>{children}</section>;
}

export function useDynamicIncomes() {
  const [dynamicIncomes, setDynamicIncomes] = useState<any[]>([]);

  useEffect(() => {
    const loadIncomes = () => {
      try {
        const stored = localStorage.getItem("uploadedIncomes");
        if (stored) {
          setDynamicIncomes(JSON.parse(stored));
        }
      } catch (e) {
        // ignore
      }
    };
    loadIncomes();
    window.addEventListener("incomesUpdated", loadIncomes);
    return () => window.removeEventListener("incomesUpdated", loadIncomes);
  }, []);

  return dynamicIncomes;
}

export function ModelIncomeList() {
  const dynamicIncomes = useDynamicIncomes();
  const allIncomes = dynamicIncomes.length > 0 ? dynamicIncomes : modelIncomeItems;

  return (
    <Panel className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-white">Recent Income</h2>
          <p className="mt-1 text-[13px] text-[#8f8f8f]">Money received from Brands and other agencies.</p>
        </div>
        <Link
          href="/dashboard/incomes"
          className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white hover:border-[#555]"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {allIncomes.slice(0, 5).map((item) => (
          <div
            key={`${item.name}-${item.date}`}
            className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04]"
          >
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#303030] bg-[#060606] p-[3px]")}>
              <div className={cn("h-full w-full overflow-hidden rounded-[8px]", item.className)}>
                <RemoteBrandImage src={item.src} alt={item.name} fallback={item.fallback} className="h-full w-full" imageClassName={item.imageClassName} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{item.name}</p>
              <p className="truncate text-[11px] text-[#7f7f7f]">{item.detail}</p>
            </div>
            <div className="hidden text-right text-[11px] text-[#7f7f7f] sm:block">{item.date}</div>
            <div className="min-w-[92px] text-right text-[13px] font-semibold text-white">{item.amount}</div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f] hover:text-white">
              <EllipsisVertical className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ModelPayoutsList() {
  return (
    <Panel className="p-4 sm:p-5 mt-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold text-white">Recent Payouts</h2>
          <p className="mt-1 text-[13px] text-[#8f8f8f]">Money sent to talent and agencies you owe a cut.</p>
        </div>
        <Link
          href="/dashboard/payouts"
          className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white hover:border-[#555]"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="mt-4 space-y-2">
        {modelPayoutItems.map((item) => (
          <div
            key={`${item.name}-${item.date}`}
            className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04]"
          >
            <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#303030] bg-[#060606] p-[3px]")}>
              <div className={cn("h-full w-full overflow-hidden rounded-[8px] bg-white")}>
                <RemoteBrandImage src={item.src} alt={item.name} fallback={item.fallback} className="h-full w-full" imageClassName={item.isAgency ? "object-contain p-1" : "object-cover"} />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-white">{item.name}</p>
              <p className="truncate text-[11px] text-[#7f7f7f]">{item.detail}</p>
            </div>
            <div className="hidden text-right text-[11px] text-[#7f7f7f] sm:block">{item.date}</div>
            <div className="min-w-[92px] text-right text-[13px] font-semibold text-white">{item.amount}</div>
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f] hover:text-white">
              <EllipsisVertical className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function CsvDropzonePanel() {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "parsing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const uploadFile = async (file: File) => {
    setIsDragActive(false);
    setUploadState("parsing");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://agencypay-website-backend.onrender.com/api/excel/uploads", {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch (err) {
        data = null;
      }

      if (response.ok && data?.success) {
        const uploadId = data.data.uploadId;
        
        try {
          const summaryRes = await fetch(`https://agencypay-website-backend.onrender.com/api/excel/uploads/${uploadId}/summary`);
          const summaryData = await summaryRes.json().catch(() => null);

          if (summaryRes.ok && summaryData?.success) {
            const vendors = summaryData.data.vendors || [];
            
            const newIncomes = vendors.map((v: any, index: number) => ({
              slug: `vendor-${Date.now()}-${index}`,
              name: v.vendor,
              detail: "Digital Sales CSV Upload",
              date: new Date().toLocaleDateString(),
              amount: `$${v.totalNetIncome.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
              src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${v.vendor.toLowerCase().replace(/[^a-z0-9]/g, '')}.com&size=128`,
              fallback: v.vendor.substring(0, 2).toUpperCase(),
              className: "bg-[#111]",
              imageClassName: "scale-[1]",
            }));

            const existingIncomes = JSON.parse(localStorage.getItem("uploadedIncomes") || "[]");
            const updatedIncomes = [...newIncomes, ...existingIncomes];
            localStorage.setItem("uploadedIncomes", JSON.stringify(updatedIncomes));
            
            // Dispatch event to update the UI
            window.dispatchEvent(new Event("incomesUpdated"));

            setUploadState("success");
            setTimeout(() => setUploadState("idle"), 4000);
          } else {
            setUploadState("error");
            setErrorMessage(summaryData?.error?.message || summaryData?.message || "Failed to fetch summary data");
            setTimeout(() => setUploadState("idle"), 5000);
          }
        } catch (err: any) {
          setUploadState("error");
          setErrorMessage(err.message || "Network error fetching summary");
          setTimeout(() => setUploadState("idle"), 5000);
        }
      } else {
        setUploadState("error");
        setErrorMessage(data?.message || "Failed to upload file");
        setTimeout(() => setUploadState("idle"), 5000);
      }
    } catch (error: any) {
      setUploadState("error");
      setErrorMessage(error.message || "Network error occurred");
      setTimeout(() => setUploadState("idle"), 5000);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };

  return (
    <div 
      className={cn(
        "rounded-[13px] bg-[#050505]",
        "px-6 py-10 flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 mb-5 relative overflow-hidden cursor-pointer group",
        isDragActive ? "border-[#13d463] bg-[#13d463]/10" : "border-[#3a3a3a] hover:border-[#777] hover:bg-[#0a0a0a]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept=".csv,.pdf,.xlsx,.xls" 
      />

      {uploadState === "idle" && (
        <>
          <div className="relative mb-6 flex h-24 w-24 items-center justify-center">
            {/* Outer glowing ring that subtly pings */}
            <div className="absolute inset-0 rounded-full bg-[#13d463]/10 animate-ping" style={{ animationDuration: '3s' }}></div>
            {/* Inner background circle */}
            <div className="absolute inset-2 rounded-full bg-[#13d463]/5"></div>
            
            {/* The Box/Folder that catches it */}
            <div className="absolute bottom-4 flex h-10 w-10 items-center justify-center">
              <Inbox className={cn("h-10 w-10 transition-colors duration-300", isDragActive ? "text-[#13d463]" : "text-[#555]")} />
            </div>

            {/* The File that drops down */}
            <div className={cn(
              "absolute z-10 flex h-10 w-10 items-center justify-center rounded-[4px] bg-[#1A1A1A] border border-[#333] shadow-xl transition-all duration-300",
              isDragActive ? "scale-110 border-[#13d463] bg-[#13d463]/10 text-[#13d463] top-8" : "animate-bounce top-2 text-white"
            )}>
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <h3 className="text-[18px] font-semibold text-white">Manual Data Ingestion</h3>
          <p className="mt-2 text-center text-[13px] leading-5 text-[#8f8f8f] max-w-[280px]">
            Drag & Drop your Paystub, CSV, or PDF file here to parse and split income automatically.
          </p>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-5 h-10 rounded-lg bg-white px-5 text-[13px] font-semibold text-black hover:bg-gray-200"
          >
            Browse Files
          </button>
        </>
      )}

      {uploadState === "parsing" && (
        <div className="flex flex-col items-center justify-center py-6 w-full">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#333] border-t-[#13d463] mb-4"></div>
          <h3 className="text-[16px] font-semibold text-white">Parsing Income Data...</h3>
          <p className="mt-2 text-[13px] text-[#8f8f8f]">Extracting splits from file</p>
        </div>
      )}

      {uploadState === "success" && (
        <div className="flex flex-col items-center justify-center py-6 w-full animate-in fade-in zoom-in duration-300">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#13d463]/20 text-[#13d463] mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-[18px] font-semibold text-white">Successfully Uploaded!</h3>
          <p className="mt-2 text-center text-[13px] leading-5 text-[#13d463]">
            Your file was successfully processed.<br/>Details have been stored locally.
          </p>
        </div>
      )}

      {uploadState === "error" && (
        <div className="flex flex-col items-center justify-center py-6 w-full animate-in fade-in zoom-in duration-300">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-500 mb-4">
            <X className="h-8 w-8" />
          </div>
          <h3 className="text-[18px] font-semibold text-white">Upload Failed</h3>
          <p className="mt-2 text-center text-[13px] leading-5 text-red-400">
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}

export function ModelAgencyDashboard() {
  const [isUploading, setIsUploading] = useState(false);
  const dynamicIncomes = useDynamicIncomes();
  const allIncomes = dynamicIncomes.length > 0 ? dynamicIncomes : modelIncomeItems;
  
  return (
    <div className="w-full max-w-[1520px]">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-none text-white">Model Agency Hub</h1>
          <p className="mt-[10px] text-[16px] leading-6 text-[#939393]">
            Manage brand payments, talent distributions, and manual ingestion.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="space-y-5">
          {/* Recent Income Panel */}
          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-semibold text-white">Recent Income</h2>
                <p className="mt-1 text-[13px] text-[#8f8f8f]">Money received from Brands and other agencies.</p>
              </div>
              <Link
                href="/dashboard/incomes"
                className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white hover:border-[#555]"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {allIncomes.slice(0, 5).map((item) => (
                <div
                  key={`${item.name}-${item.date}`}
                  className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04]"
                >
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#303030] bg-[#060606] p-[3px]")}>
                    <div className={cn("h-full w-full overflow-hidden rounded-[8px]", item.className)}>
                      <RemoteBrandImage src={item.src} alt={item.name} fallback={item.fallback} className="h-full w-full" imageClassName={item.imageClassName} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{item.name}</p>
                    <p className="truncate text-[11px] text-[#7f7f7f]">{item.detail}</p>
                  </div>
                  <div className="hidden text-right text-[11px] text-[#7f7f7f] sm:block">{item.date}</div>
                  <div className="min-w-[92px] text-right text-[13px] font-semibold text-white">{item.amount}</div>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f] hover:text-white">
                    <EllipsisVertical className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Panel>

          {/* Recent Payouts Panel */}
          <Panel className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[18px] font-semibold text-white">Recent Payouts</h2>
                <p className="mt-1 text-[13px] text-[#8f8f8f]">Money sent to talent and agencies you owe a cut.</p>
              </div>
              <Link
                href="/dashboard/payouts"
                className="inline-flex items-center gap-2 rounded-[7px] border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[12px] font-semibold text-white hover:border-[#555]"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-4 space-y-2">
              {modelPayoutItems.map((item) => (
                <div
                  key={`${item.name}-${item.date}`}
                  className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black px-3 py-2 transition-colors hover:border-[#555] hover:bg-white/[0.04]"
                >
                  <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-[#303030] bg-[#060606] p-[3px]")}>
                    <div className={cn("h-full w-full overflow-hidden rounded-[8px] bg-white")}>
                      <RemoteBrandImage src={item.src} alt={item.name} fallback={item.fallback} className="h-full w-full" imageClassName={item.isAgency ? "object-contain p-1" : "object-cover"} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">{item.name}</p>
                    <p className="truncate text-[11px] text-[#7f7f7f]">{item.detail}</p>
                  </div>
                  <div className="hidden text-right text-[11px] text-[#7f7f7f] sm:block">{item.date}</div>
                  <div className="min-w-[92px] text-right text-[13px] font-semibold text-white">{item.amount}</div>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-[#7f7f7f] hover:text-white">
                    <EllipsisVertical className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          {/* CSV Dropzone Panel */}
          <CsvDropzonePanel />

          {/* Analytics Overview Snapshot */}
          <Panel className="p-4 sm:p-5">
            <h2 className="text-[18px] font-semibold text-white">Total Income & Splits</h2>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[8px] border border-[#2f2f2f] bg-black px-4 py-4">
                <p className="text-[11px] font-semibold text-[#777]">Total Received (2026)</p>
                <p className="mt-2 truncate text-[22px] font-black text-[#13d463]">$1,245,000</p>
              </div>
              <div className="rounded-[8px] border border-[#2f2f2f] bg-black px-4 py-4">
                <p className="text-[11px] font-semibold text-[#777]">Agency Cut (10%)</p>
                <p className="mt-2 truncate text-[22px] font-black text-white">$124,500</p>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
