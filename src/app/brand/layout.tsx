"use client";

import { FileText, Receipt, UserRound } from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Splash } from "@/components/ui";
import { useRequire } from "@/lib/session";

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  const profile = useRequire("brand");
  if (!profile) return <Splash />;
  return (
    <PortalShell
      section="Brand"
      orgName={profile.workspaceName || profile.fullName}
      user={{ name: profile.fullName, email: profile.email }}
      addresses={[profile.email]}
      items={[
        { href: "/brand", label: "To pay", icon: FileText, exact: true },
        { href: "/brand/history", label: "Payments", icon: Receipt },
        { href: "/brand/account", label: "Account", icon: UserRound },
      ]}
    >
      {children}
    </PortalShell>
  );
}
