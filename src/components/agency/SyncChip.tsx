"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Pill } from "@/components/ui";
import { useAgency } from "@/lib/agency";
import { providerName } from "@/lib/actions";
import { useNow } from "@/lib/db";
import { relTime } from "@/lib/format";

/** CRM sync is automatic; this only reports when it last ran. */
export function SyncChip() {
  const { org, crmNotConnectedHere } = useAgency();
  const now = useNow(30_000);
  if (!org.crm.provider) {
    return (
      <Link href="/agency/settings?tab=crm" className="inline-flex items-center gap-2 rounded-full border border-dashed border-ink/25 px-3 py-1.5 text-xs font-medium text-ink/60 hover:border-ink/50 hover:text-ink">
        No CRM connected
      </Link>
    );
  }
  if (crmNotConnectedHere) {
    return (
      <Pill tone="amber" className="!py-1.5">
        <RefreshCw className="h-3 w-3" />
        {providerName(org.crm.provider)} · not connected in this browser
      </Pill>
    );
  }
  return (
    <Pill tone={org.crm.lastSyncError ? "amber" : "neutral"} className="!py-1.5">
      <RefreshCw className="h-3 w-3" />
      {providerName(org.crm.provider)} · {org.crm.lastSyncAt ? `synced ${relTime(org.crm.lastSyncAt, now)}` : "syncing…"}
    </Pill>
  );
}
