"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeftRight, CreditCard, Home, Settings, Wallet } from "lucide-react";
import { NotificationsBell } from "@/components/Notifications";
import { Logo, Splash, TestModeBadge, cx } from "@/components/ui";
import { TalentProvider, useTalentData } from "@/lib/talent";
import { useRequire } from "@/lib/session";
import type { Profile } from "@/lib/types";

const NAV = [
  { href: "/app", label: "Home", icon: Home, exact: true },
  { href: "/app/earnings", label: "Earnings", icon: Wallet },
  { href: "/app/activity", label: "Activity", icon: ArrowLeftRight },
  { href: "/app/card", label: "Card", icon: CreditCard },
  { href: "/app/settings", label: "Settings", icon: Settings },
];

export default function TalentLayout({ children }: { children: React.ReactNode }) {
  const profile = useRequire("individual");
  if (!profile) return <Splash />;
  return <Shell profile={profile}>{children}</Shell>;
}

function Shell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const data = useTalentData(profile);
  const pathname = usePathname();
  const active = (n: (typeof NAV)[number]) => (n.exact ? pathname === n.href : pathname.startsWith(n.href));

  return (
    <TalentProvider value={data}>
      <div className="flex min-h-screen flex-1 justify-center bg-[#ecebe6]">
        <div className="relative flex w-full max-w-[480px] flex-col bg-paper sm:my-6 sm:min-h-[calc(100vh-3rem)] sm:overflow-hidden sm:rounded-[32px] sm:border sm:border-line sm:shadow-xl">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 bg-paper/90 px-5 backdrop-blur">
            <Logo />
            <div className="flex-1" />
            <TestModeBadge />
            <NotificationsBell addresses={[profile.email]} />
          </header>
          <main className="flex-1 px-5 pb-28 pt-2">{children}</main>
          <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-[480px] -translate-x-1/2 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur sm:bottom-6 sm:rounded-b-[32px]">
            <ul className="grid grid-cols-5">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} aria-current={active(n) ? "page" : undefined} className={cx("flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors", active(n) ? "text-ink" : "text-ink/40 hover:text-ink/70")}>
                    <n.icon className="h-5 w-5" strokeWidth={active(n) ? 2.2 : 1.8} />
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </TalentProvider>
  );
}
