"use client";

import React from "react";
import { Bell, Search } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { normalizeWorkspaceType } from "../../types/workspace";

export function DashboardHeader() {
  const { state } = useApp();
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const placeholderByWorkspace = {
    brand: "Search invoices, payments, agencies...",
    agency: "Search talent, payouts, invoices, clients...",
    talent_independent: "Search payouts, invoices, payment history...",
    talent_agency: "Search assigned invoices, payouts, agency payments...",
    mother_agency: "Search child agencies, vendors, treasury, reports...",
  };

  return (
    <header className="flex h-[78px] shrink-0 items-center justify-between border-b border-[#111] bg-black px-10">
      <label className="relative block w-full max-w-[704px]">
        <Search className="pointer-events-none absolute left-[15px] top-1/2 h-5 w-5 -translate-y-1/2 text-[#8b8b8b]" />
        <input
          aria-label="Search"
          placeholder={placeholderByWorkspace[workspaceType]}
          className="h-11 w-full rounded-[7px] border border-[#5b5b5b] bg-[#111] pl-12 pr-4 text-[17px] font-normal text-white outline-none placeholder:text-[#787878] focus:border-[#8a8a8a]"
        />
      </label>

      <button
        type="button"
        aria-label="Notifications"
        className="relative ml-6 flex h-11 w-11 items-center justify-center text-white"
      >
        <Bell className="h-[21px] w-[21px] stroke-[1.8]" />
        <span className="absolute right-[9px] top-[10px] h-[9px] w-[9px] rounded-full bg-white" />
      </button>
    </header>
  );
}
