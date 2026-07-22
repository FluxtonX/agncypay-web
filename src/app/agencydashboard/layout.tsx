"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../../context/AppContext";
import { AccountingProvider } from "../../modules/accounting/store/AccountingContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function AgencyDashboardLayout({ children }: LayoutProps) {
  const router = useRouter();
  const { state } = useApp();

  const accountType = (state.user?.accountType || "").toLowerCase();
  const isTalent = ["talent", "individual", "talent_independent", "talent_agency", "creator", "model"].includes(accountType);

  useEffect(() => {
    if (isTalent) {
      router.replace("/dashboard");
    }
  }, [isTalent, router]);

  if (isTalent) {
    return null;
  }

  return <AccountingProvider>{children}</AccountingProvider>;
}
