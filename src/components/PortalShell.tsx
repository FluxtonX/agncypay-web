"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { logoutWithFirebase } from "@/lib/firebaseAuth";
import { Avatar, Logo, TestModeBadge, cx } from "./ui";
import { NotificationsBell } from "./Notifications";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  /** Match only the exact path (for section roots). */
  exact?: boolean;
}

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function Nav({ items, pathname, onNavigate }: { items: NavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-0.5">
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cx(
              "group flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
              active ? "bg-ink text-white" : "text-ink/65 hover:bg-ink/[0.05] hover:text-ink"
            )}
          >
            <item.icon className={cx("h-[18px] w-[18px]", active ? "text-white" : "text-ink/45 group-hover:text-ink/70")} />
            <span className="flex-1">{item.label}</span>
            {!!item.badge && (
              <span className={cx("tabular rounded-full px-1.5 text-[11px] font-semibold leading-[18px]", active ? "bg-white/20 text-white" : "bg-emerald-600 text-white")}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/** Sidebar layout shared by the agency and brand portals. */
export function PortalShell({
  section,
  items,
  user,
  orgName,
  addresses,
  children,
  sidebarExtra,
}: {
  section: string;
  items: NavItem[];
  user: { name: string; email: string };
  orgName: string;
  addresses: string[];
  children: React.ReactNode;
  sidebarExtra?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await logoutWithFirebase().catch(() => {});
    router.replace("/auth/login");
  };

  const sidebar = (onNavigate?: () => void) => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Logo />
        <span className="rounded-md bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink/60">{section}</span>
      </div>
      <div className="mx-3 mb-4 rounded-2xl border border-line bg-white px-3 py-2.5">
        <p className="truncate text-[13px] font-semibold text-ink">{orgName}</p>
        <p className="truncate text-xs text-muted">{user.email}</p>
      </div>
      <div className="flex-1 overflow-y-auto px-3">
        <Nav items={items} pathname={pathname} onNavigate={onNavigate} />
        {sidebarExtra}
      </div>
      <div className="border-t border-line p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user.name} size={32} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-ink">{user.name}</p>
          </div>
          <button onClick={signOut} aria-label="Sign out" title="Sign out" className="flex h-8 w-8 items-center justify-center rounded-full text-ink/50 hover:bg-ink/5 hover:text-ink">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-1 bg-paper">
      <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 border-r border-line bg-paper lg:block">{sidebar()}</aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 420, damping: 40 }}
              className="relative h-full w-[272px] bg-paper shadow-2xl"
            >
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-3.5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5">
                <X className="h-5 w-5" />
              </button>
              {sidebar(() => setOpen(false))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-paper/85 px-4 backdrop-blur sm:px-6 lg:px-10">
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full text-ink/70 hover:bg-ink/5 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="flex-1" />
          <TestModeBadge />
          <NotificationsBell addresses={addresses} />
        </header>
        <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-7 sm:px-6 lg:px-10 lg:py-9">{children}</main>
      </div>
    </div>
  );
}
