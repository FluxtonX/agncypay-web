"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface InvoiceFetchingLoaderProps {
  title?: string;
  subtitle?: string;
  count?: number;
}

export function InvoiceFetchingLoader({ title = "Loading Invoices", subtitle, count = 2 }: InvoiceFetchingLoaderProps) {
  return (
    <div className="p-6 bg-[#0D0D0D] border border-white/20 rounded-2xl shadow-xl space-y-4">
      <div className="flex items-center space-x-3">
        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
        <div>
          <h4 className="font-semibold text-white text-sm">{title}</h4>
          {subtitle && <p className="text-xs text-[#8f8f8f]">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse border border-white/10" />
        ))}
      </div>
    </div>
  );
}

export default InvoiceFetchingLoader;
