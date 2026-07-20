"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAccounting } from "../../../modules/accounting/hooks/useAccounting";
import { ProviderType } from "../../../modules/accounting/types";
import DashboardLayout from "../../dashboard/layout";

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const { provider } = useParams();
  const { setCurrentProvider } = useAccounting();

  useEffect(() => {
    if (provider) {
      setCurrentProvider(provider as ProviderType);
    }
  }, [provider, setCurrentProvider]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
