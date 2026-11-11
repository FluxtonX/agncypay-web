"use client";

import { useMemo } from "react";
import { ArrowLeftRight, Building2, FileText, Inbox, LayoutGrid, LogOut, Send, Settings, Users } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/PortalShell";
import { Button, Logo, Splash } from "@/components/ui";
import { AgencyProvider, useAgencyGate } from "@/lib/agency";
import { attentionOf } from "@/lib/attention";
import { useNow } from "@/lib/db";
import { logoutWithFirebase } from "@/lib/firebaseAuth";
import { useRequire } from "@/lib/session";
import type { Profile } from "@/lib/types";

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  const profile = useRequire("agency");
  if (!profile) return <Splash />;
  return <Gate profile={profile}>{children}</Gate>;
}

function Gate({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const gate = useAgencyGate(profile);
  const now = useNow();
  const data = gate.state === "ready" ? gate.data : null;

  const items = useMemo<NavItem[]>(() => {
    const a = data ? attentionOf({ ...data, now }) : null;
    return [
      { href: "/agency", label: "Overview", icon: LayoutGrid, exact: true },
      { href: "/agency/invoices", label: "Invoices", icon: FileText, badge: a?.invoiceBadge },
      { href: "/agency/payouts", label: "Payouts", icon: Send, badge: a?.payoutBadge },
      { href: "/agency/requests", label: "Requests", icon: Inbox, badge: a?.requestBadge },
      { href: "/agency/contacts", label: "Contacts", icon: Users },
      { href: "/agency/track", label: "Track", icon: ArrowLeftRight },
      { href: "/agency/settings", label: "Settings", icon: Settings },
    ];
  }, [data, now]);

  if (gate.state === "loading") return <Splash />;
  if (gate.state === "error" || gate.state === "removed") {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center gap-5 bg-paper px-6 text-center">
        <Logo />
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink/60">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-lg font-semibold text-ink">{gate.state === "removed" ? `You no longer have access to ${gate.orgName}` : "We couldn't open your agency"}</p>
          <p className="mt-1 max-w-sm text-sm text-muted">{gate.state === "removed" ? "The account owner removed you from the team. Ask them to invite you again if this is a mistake." : gate.message}</p>
        </div>
        <Button
          variant="secondary"
          icon={<LogOut className="h-4 w-4" />}
          onClick={async () => {
            await logoutWithFirebase().catch(() => {});
            window.location.assign("/auth/login");
          }}
        >
          Sign out
        </Button>
      </div>
    );
  }

  const { org } = gate.data;
  return (
    <AgencyProvider value={gate.data}>
      <PortalShell section="Agency" items={items} user={{ name: profile.fullName, email: profile.email }} orgName={org.name} addresses={[org.id, ...org.emails]}>
        {children}
      </PortalShell>
    </AgencyProvider>
  );
}
