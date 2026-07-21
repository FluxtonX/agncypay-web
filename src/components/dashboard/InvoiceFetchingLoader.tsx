"use client";

import React from "react";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

export interface InvoiceFetchingLoaderProps {
  title?: string;
  subtitle?: string;
  count?: number;
}

export function InvoiceFetchingLoader({
  title = "Synchronizing Invoices",
  subtitle = "Connecting to CRM & Firestore real-time ledgers...",
  count = 3,
}: InvoiceFetchingLoaderProps) {
  return (
    <div className="bg-[#050505] rounded-2xl border border-white/20 p-6 md:p-8 shadow-2xl relative overflow-hidden animate-fade-in">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-[#4B6BFB]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-[#10b95f]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with pulsing logo and loader status */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-black border border-white/20 flex items-center justify-center relative overflow-hidden shadow-inner">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#4B6BFB]/20 to-[#10b95f]/20 animate-pulse" />
            <RefreshCw className="h-4.5 w-4.5 text-white animate-spin relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-tight">{title}</h3>
              <span className="text-[9px] font-bold text-[#10b95f] bg-[#082315] border border-[#10b95f]/30 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10b95f] animate-ping" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/10">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#4B6BFB]" />
          <span>Fetching ledgers...</span>
        </div>
      </div>

      {/* Shimmer skeleton list */}
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group"
          >
            {/* Shimmer overlay animation */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none" />

            {/* Left side: Avatar + Title skeleton */}
            <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
              <div className="h-10 w-10 rounded-xl bg-neutral-900 border border-white/10 shrink-0 animate-pulse" />
              <div className="space-y-2 min-w-0 flex-1">
                <div className="h-3.5 w-36 bg-neutral-800 rounded animate-pulse" />
                <div className="h-2.5 w-24 bg-neutral-900 rounded animate-pulse" />
                <div className="h-2 w-44 bg-neutral-900/60 rounded animate-pulse" />
              </div>
            </div>

            {/* Right side: Amount + Status pill skeleton */}
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end shrink-0">
              <div className="space-y-1.5 text-right">
                <div className="h-4 w-20 bg-neutral-800 rounded animate-pulse ml-auto" />
                <div className="h-2 w-14 bg-neutral-900 rounded animate-pulse ml-auto" />
              </div>
              <div className="h-8 w-24 bg-neutral-900 border border-white/10 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
