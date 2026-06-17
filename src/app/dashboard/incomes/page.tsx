"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ArrowLeft } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useDynamicIncomes, modelIncomeItems, RemoteBrandImage } from "../../../components/dashboard/ModelAgencyDashboard";

export default function IncomesPage() {
  const router = useRouter();
  const [dynamicIncomes, setDynamicIncomes] = React.useState<any[]>([]);
  const [isLoadingIncomes, setIsLoadingIncomes] = React.useState(true);
  const [hasUpload, setHasUpload] = React.useState(false);

  React.useEffect(() => {
    const fetchRealData = async () => {
      // 1. Synchronously check and load from localStorage first (Stale-While-Revalidate)
      let uploadId = "";
      let cachedVendors = "";
      try {
        uploadId = localStorage.getItem("uploadedUploadId") || "";
        cachedVendors = localStorage.getItem("uploadedVendors") || "";
      } catch {}
      const userHasUpload = !!(uploadId || cachedVendors);
      setHasUpload(userHasUpload);

      // Load cached data immediately so there is zero delay for the user
      let hasRenderedCache = false;
      if (cachedVendors) {
        try {
          const parsed = JSON.parse(cachedVendors);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map((v: any, index: number) => {
              const vName = v.vendor || "Unknown Vendor";
              const vRowCount = typeof v.rowCount === "number" ? v.rowCount : 0;
              const vNetIncome = typeof v.totalNetIncome === "number" ? v.totalNetIncome : 0;
              return {
                slug: "uploaded-preview",
                name: vName,
                detail: `${vRowCount.toLocaleString()} transactions parsed`,
                date: "Parsed from Excel",
                amount: `$${vNetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                rawAmount: vNetIncome,
                src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${vName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&size=128`,
                fallback: vName.substring(0, 2).toUpperCase(),
                className: "bg-[#111]",
                imageClassName: "scale-[1]",
              };
            });
            mapped.sort((a: any, b: any) => b.rawAmount - a.rawAmount);
            setDynamicIncomes(mapped);
            setIsLoadingIncomes(false);
            hasRenderedCache = true;
          }
        } catch (e) {
          console.error("Error parsing cached vendors on incomes page load:", e);
        }
      }

      // If there was no cached data to show, show the skeleton loader while we fetch
      if (!hasRenderedCache) {
        setIsLoadingIncomes(true);
      }

      // 2. Fetch live data from API in background
      if (uploadId) {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://agencypay-website-backend.onrender.com";
          const response = await fetch(`${apiBaseUrl}/api/excel/uploads/${uploadId}/summary`);
          
          if (response.status === 404) {
            // Upload was not found on the backend (e.g. after container restart or expiration)
            try {
              localStorage.removeItem("uploadedUploadId");
              localStorage.removeItem("uploadedFileName");
              localStorage.removeItem("uploadedFileSize");
              localStorage.removeItem("uploadedTotals");
              localStorage.removeItem("uploadedOriginalName");
              localStorage.removeItem("uploadedRowCount");
              localStorage.removeItem("uploadedVendors");
              localStorage.removeItem("uploadedIncomes");
            } catch {}
            setHasUpload(false);
            setDynamicIncomes([]);
            setIsLoadingIncomes(false);
          } else {
            const data = await response.json();

            if (response.ok && data?.success && data?.data?.vendors) {
              const vendors = data.data.vendors || [];
              localStorage.setItem("uploadedVendors", JSON.stringify(vendors));
              
              // Map the new incomes
              const mapped = vendors.map((v: any, index: number) => {
                const vName = v.vendor || "Unknown Vendor";
                const vRowCount = typeof v.rowCount === "number" ? v.rowCount : 0;
                const vNetIncome = typeof v.totalNetIncome === "number" ? v.totalNetIncome : 0;
                return {
                  slug: "uploaded-preview",
                  name: vName,
                  detail: `${vRowCount.toLocaleString()} transactions parsed`,
                  date: "Parsed from Excel",
                  amount: `$${vNetIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  rawAmount: vNetIncome,
                  src: `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${vName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com&size=128`,
                  fallback: vName.substring(0, 2).toUpperCase(),
                  className: "bg-[#111]",
                  imageClassName: "scale-[1]",
                };
              });

              // Sort descending by rawAmount
              mapped.sort((a: any, b: any) => b.rawAmount - a.rawAmount);
              setDynamicIncomes(mapped);
              setIsLoadingIncomes(false);
              return;
            } else if (data?.success === false && data?.error?.code === "NOT_FOUND") {
              try {
                localStorage.removeItem("uploadedUploadId");
                localStorage.removeItem("uploadedFileName");
                localStorage.removeItem("uploadedFileSize");
                localStorage.removeItem("uploadedTotals");
                localStorage.removeItem("uploadedOriginalName");
                localStorage.removeItem("uploadedRowCount");
                localStorage.removeItem("uploadedVendors");
                localStorage.removeItem("uploadedIncomes");
              } catch {}
              setHasUpload(false);
              setDynamicIncomes([]);
              setIsLoadingIncomes(false);
            }
          }
        } catch (err) {
          console.error("Failed to fetch API summary for incomes history page, falling back to cached state:", err);
          setIsLoadingIncomes(false);
        }
      } else {
        setIsLoadingIncomes(false);
      }
    };

    fetchRealData();
  }, []);

  const allIncomes = (hasUpload || dynamicIncomes.length > 0) ? dynamicIncomes : modelIncomeItems;

  const totalAmount = allIncomes.reduce((acc, item) => {
    const num = Number(item.amount.replace(/[^0-9.-]+/g, ""));
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalAmount);

  return (
    <div className="mx-auto w-full max-w-[1048px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="group mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-[#8d8d8d] transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">
          Recent Incomes
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
          Full history of your income and parsed vendor payouts.
        </p>
      </div>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Income History
            </h2>
          </div>

          <button
            type="button"
            className="inline-flex h-[40px] items-center justify-center gap-[12px] rounded-[7px] border border-[#5a5a5a] bg-[#0c0c0c] px-[16px] text-[16px] font-semibold text-white transition-colors hover:border-[#777]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="mt-[32px] overflow-x-auto">
          <table className="min-w-[900px] table-fixed text-left w-full">
            <colgroup>
              <col className="w-[280px]" />
              <col className="w-[220px]" />
              <col className="w-[180px]" />
              <col className="w-[180px]" />
            </colgroup>
            <thead>
              <tr className="h-[48px] border-b border-[#555] text-[17px] font-semibold leading-none text-[#8d8d8d]">
                <th className="pl-[10px] pr-4">Source / Vendor</th>
                <th>Detail</th>
                <th>Date</th>
                <th className="text-right pr-4">Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingIncomes ? (
                // Skeleton rows while data is loading
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="h-[64px] border-b border-[#303030] last:border-b-0">
                    <td className="pl-[10px] pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-[8px] bg-[#1a1a1a] animate-pulse" />
                        <div className="h-4 w-32 rounded-md bg-[#1a1a1a] animate-pulse" />
                      </div>
                    </td>
                    <td><div className="h-4 w-40 rounded-md bg-[#1a1a1a] animate-pulse" /></td>
                    <td><div className="h-4 w-28 rounded-md bg-[#1a1a1a] animate-pulse" /></td>
                    <td className="text-right pr-4"><div className="ml-auto h-4 w-24 rounded-md bg-[#1a1a1a] animate-pulse" /></td>
                  </tr>
                ))
              ) : allIncomes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-[120px] text-center text-[17px] text-[#8f8f8f]">
                    No income data found. Upload an Excel file to get started.
                  </td>
                </tr>
              ) : (
                allIncomes.map((item, i) => (
                  <tr
                    key={`${item.name}-${i}`}
                    onClick={() => {
                      if (item.slug === "uploaded-preview") {
                        window.location.href = "/dashboard/incomes/preview";
                      }
                    }}
                    className={cn(
                      "h-[64px] border-b border-[#303030] last:border-b-0 text-[17px] leading-none transition-colors hover:bg-white/[0.02]",
                      item.slug === "uploaded-preview" && "cursor-pointer"
                    )}
                  >
                    <td className="pl-[10px] pr-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#303030] bg-[#060606] p-[2px]")}>
                          <div className={cn("h-full w-full overflow-hidden rounded-[6px]", item.className)}>
                            <RemoteBrandImage src={item.src} alt={item.name} fallback={item.fallback} className="h-full w-full" imageClassName={item.imageClassName} />
                          </div>
                        </div>
                        <span className="font-semibold text-white truncate max-w-[200px]">{item.name}</span>
                      </div>
                    </td>
                    <td className="text-[#c8c8c8]">{item.detail}</td>
                    <td className="text-[#b8b8b8]">{item.date}</td>
                    <td className="text-right pr-4 font-semibold text-[#13d463]">{item.amount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {allIncomes.length > 0 && (
          <div className="mt-6 flex justify-end">
            <div className="flex w-full max-w-[320px] items-center justify-between rounded-[9px] border border-[#303030] bg-[#060606] px-5 py-4">
              <span className="text-[17px] font-semibold text-[#8d8d8d]">Total Income</span>
              <span className="text-[24px] font-black tracking-tight text-[#13d463]">
                {formattedTotal}
              </span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
