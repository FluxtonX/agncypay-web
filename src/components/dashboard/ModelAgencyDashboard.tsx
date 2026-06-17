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
  const [uploadState, setUploadState] = useState<"idle" | "analyzing" | "file_selected" | "preparing" | "parsing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Restore cached upload state on mount
  useEffect(() => {
    try {
      const savedUploadId = localStorage.getItem("uploadedUploadId");
      const savedFileName = localStorage.getItem("uploadedFileName");
      const savedSize = localStorage.getItem("uploadedFileSize");
      
      if (savedUploadId && savedFileName) {
        setUploadState("file_selected");
        setSelectedFiles([{
          name: savedFileName,
          size: savedSize ? parseInt(savedSize) : 0,
        } as File]);
      }
    } catch {}
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleFilesSelected = async (files: File[]) => {
    setIsDragActive(false);
    const file = files[0];
    if (!file) return;

    // Check if it's an Excel file
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    if (!isExcel) {
      setUploadState("error");
      setErrorMessage("Please upload an Excel file (.xlsx or .xls) only.");
      setTimeout(() => {
        setUploadState("idle");
        setErrorMessage("");
      }, 4000);
      return;
    }

    setSelectedFiles([file]);
    setUploadState("analyzing");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://agencypay-website-backend.onrender.com";
      
      const startTime = Date.now();
      const response = await fetch(`${apiBaseUrl}/api/excel/uploads`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 1500 - elapsedTime);
      await new Promise((resolve) => setTimeout(resolve, remainingTime));

      if (response.ok && data?.success && data?.data?.uploadId) {
        localStorage.setItem("uploadedUploadId", data.data.uploadId);
        localStorage.setItem("uploadedFileName", file.name);
        localStorage.setItem("uploadedFileSize", file.size.toString());
        
        // Save the summary totals and vendor list in localStorage
        localStorage.setItem("uploadedTotals", JSON.stringify(data.data.totals || {}));
        localStorage.setItem("uploadedOriginalName", data.data.originalName || file.name);
        localStorage.setItem("uploadedRowCount", (data.data.rowCount ?? 0).toString());
        localStorage.setItem("uploadedVendors", JSON.stringify(data.data.vendors || []));

        // Add to recent income lists in dashboard
        const vendors = data.data.vendors || [];
        if (vendors.length > 0) {
          const newIncomes = vendors.map((v: any, index: number) => {
            const vName = v.vendor || "Unknown Vendor";
            const vRowCount = typeof v.rowCount === "number" ? v.rowCount : 0;
            const vNetIncome = typeof v.totalNetIncome === "number" ? v.totalNetIncome : 0;
            return {
              slug: `api-vendor-${Date.now()}-${index}`,
              name: vName,
              detail: `${vRowCount.toLocaleString()} transactions parsed`,
              date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
              amount: `$${vNetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${vName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&size=128`,
              fallback: vName.substring(0, 2).toUpperCase(),
              className: "bg-[#111]",
              imageClassName: "scale-[1]",
            };
          });
          
          const existingIncomes = JSON.parse(localStorage.getItem("uploadedIncomes") || "[]");
          const updatedIncomes = [...newIncomes, ...existingIncomes];
          localStorage.setItem("uploadedIncomes", JSON.stringify(updatedIncomes));
          window.dispatchEvent(new Event("incomesUpdated"));
        }

        setUploadState("file_selected");
      } else {
        setUploadState("error");
        setErrorMessage(data?.message || data?.error || "Failed to upload and analyze Excel file.");
        setTimeout(() => {
          setUploadState("idle");
          setSelectedFiles([]);
          setErrorMessage("");
        }, 5000);
      }
    } catch (error: any) {
      setUploadState("error");
      setErrorMessage(error.message || "Network error occurred while connecting to backend.");
      setTimeout(() => {
        setUploadState("idle");
        setSelectedFiles([]);
        setErrorMessage("");
      }, 5000);
    }
  };

  const handleContinue = () => {
    setUploadState("preparing");
    setTimeout(() => {
      window.location.href = "/dashboard/incomes/preview";
    }, 1500);
  };

  const handleRemoveFile = () => {
    setSelectedFiles([]);
    setUploadState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    // Clear localStorage upload cache
    localStorage.removeItem("uploadedUploadId");
    localStorage.removeItem("uploadedFileName");
    localStorage.removeItem("uploadedFileSize");
    localStorage.removeItem("uploadedTotals");
    localStorage.removeItem("uploadedOriginalName");
    localStorage.removeItem("uploadedRowCount");
    localStorage.removeItem("uploadedVendors");
    localStorage.removeItem("uploadedIncomes");
    window.dispatchEvent(new Event("incomesUpdated"));
  };

  // --- GROQ/OPENAI API CALL (COMMENTED OUT) ---
  // const uploadFiles = async (files: File[]) => {
  //   setIsDragActive(false);
  //   setUploadState("parsing");
  //   setErrorMessage("");
  //
  //   try {
  //     let accumulatedIncomes: any[] = [];
  //     let hasError = false;
  //
  //     for (const file of files) {
  //       const formData = new FormData();
  //       formData.append("file", file);
  //
  //       const response = await fetch("/api/extract-income", {
  //         method: "POST",
  //         body: formData,
  //       });
  //
  //       let data;
  //       try {
  //         data = await response.json();
  //       } catch (err) {
  //         data = null;
  //       }
  //
  //       if (response.ok && data?.success) {
  //         const aiIncomes = data.data || [];
  //         
  //         const newIncomes = aiIncomes.map((v: any, index: number) => ({
  //           slug: `ai-vendor-${Date.now()}-${index}`,
  //           name: v.name,
  //           detail: v.detail || "AI Extracted Data",
  //           date: v.date || new Date().toLocaleDateString(),
  //           amount: v.amount,
  //           src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${v.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com&size=128`,
  //           fallback: v.name.substring(0, 2).toUpperCase(),
  //           className: "bg-[#111]",
  //           imageClassName: "scale-[1]",
  //         }));
  //
  //         accumulatedIncomes = [...accumulatedIncomes, ...newIncomes];
  //       } else {
  //         hasError = true;
  //         setErrorMessage(data?.error || `Failed to parse ${file.name}`);
  //       }
  //     }
  //
  //     if (accumulatedIncomes.length > 0) {
  //       const existingIncomes = JSON.parse(localStorage.getItem("uploadedIncomes") || "[]");
  //       const updatedIncomes = [...accumulatedIncomes, ...existingIncomes];
  //       localStorage.setItem("uploadedIncomes", JSON.stringify(updatedIncomes));
  //       
  //       // Dispatch event to update the UI
  //       window.dispatchEvent(new Event("incomesUpdated"));
  //
  //       setUploadState("success");
  //       setTimeout(() => setUploadState("idle"), 4000);
  //     } else if (hasError) {
  //       setUploadState("error");
  //       setTimeout(() => setUploadState("idle"), 5000);
  //     } else {
  //       setUploadState("error");
  //       setErrorMessage("No income data found in the provided files.");
  //       setTimeout(() => setUploadState("idle"), 5000);
  //     }
  //   } catch (error: any) {
  //     setUploadState("error");
  //     setErrorMessage(error.message || "Network error occurred");
  //     setTimeout(() => setUploadState("idle"), 5000);
  //   }
  // };
  // --- END GROQ/OPENAI API CALL ---

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
  };

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div 
      className={cn(
        "rounded-[13px] bg-[#050505]",
        "px-6 py-10 flex flex-col items-center justify-center border-2 border-dashed transition-all duration-300 mb-5 relative overflow-hidden",
        uploadState === "file_selected" ? "border-[#3a3a3a] cursor-default" : "cursor-pointer group",
        isDragActive ? "border-[#13d463] bg-[#13d463]/10" : "border-[#3a3a3a] hover:border-[#777] hover:bg-[#0a0a0a]"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (uploadState === "idle") fileInputRef.current?.click();
      }}
    >
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange}
        accept=".xlsx,.xls" 
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
            Drag & Drop your Digital Sales Excel file (.xlsx, .xls) here to parse automatically.
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

      {uploadState === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-6 w-full">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#333] border-t-[#13d463] mb-4"></div>
          <h3 className="text-[16px] font-semibold text-white">Analyzing File...</h3>
          <p className="mt-2 text-[13px] text-[#8f8f8f]">Reading and validating your document</p>
        </div>
      )}

      {uploadState === "preparing" && (
        <div className="flex flex-col items-center justify-center py-6 w-full">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#333] border-t-[#13d463] mb-4"></div>
          <h3 className="text-[16px] font-semibold text-white">Preparing Preview...</h3>
          <p className="mt-2 text-[13px] text-[#8f8f8f]">Extracting income data from your file</p>
        </div>
      )}

      {uploadState === "file_selected" && (
        <div className="flex flex-col items-center justify-center py-4 w-full animate-in fade-in zoom-in duration-300">
          {/* File card */}
          <div className="w-full max-w-[320px] rounded-[10px] border border-[#303030] bg-[#0a0a0a] p-4">
            {selectedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#303030] bg-[#111]">
                  <FileText className="h-5 w-5 text-[#13d463]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-white">{file.name}</p>
                  <p className="text-[11px] text-[#777]">{formatSize(file.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[#666] hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleContinue();
            }}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#13d463] px-8 text-[14px] font-bold text-black transition-all hover:bg-[#0fba54] hover:shadow-[0_0_20px_rgba(19,212,99,0.3)] active:scale-[0.98]"
          >
            Continue
            <ArrowUpRight className="h-4 w-4" />
          </button>
          <p className="mt-3 text-[12px] text-[#666]">Preview extracted income data</p>
        </div>
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
