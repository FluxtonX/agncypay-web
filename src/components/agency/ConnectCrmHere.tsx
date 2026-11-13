"use client";

import { Plug } from "lucide-react";
import { Banner, Button } from "@/components/ui";
import { useAgency } from "@/lib/agency";
import { providerName } from "@/lib/actions";

/**
 * Shown when the agency's CRM is connected but not in this browser. The CRM login lives in the
 * browser that authorised it, so each browser (localhost, the live site, a teammate's laptop)
 * connects once. One click signs in and comes back to the same page.
 */
export function ConnectCrmHere({ returnTo, className }: { returnTo: string; className?: string }) {
  const { org, crmNotConnectedHere } = useAgency();
  const provider = org.crm.provider;
  if (!crmNotConnectedHere || !provider || provider === "sandbox") return null;
  const name = providerName(provider);
  return (
    <Banner
      tone="warn"
      title={`Connect ${name} in this browser`}
      className={className}
      action={
        <Button size="sm" icon={<Plug className="h-3.5 w-3.5" />} onClick={() => window.location.assign(`/api/auth/${provider}/connect?returnTo=${encodeURIComponent(returnTo)}`)}>
          Connect {name}
        </Button>
      }
    >
      {org.name} uses {name}, but each browser signs in to it once. Connect here so invoices sync and payments are marked paid in {name}.
    </Banner>
  );
}
