"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { C, col, useLive, where } from "@/lib/db";
import { markNoticesRead } from "@/lib/actions";
import { relTime } from "@/lib/format";
import type { Notice } from "@/lib/types";
import { cx } from "./ui";

/** Live notices addressed to any of `addresses` (an org id and/or lower-cased emails). */
export function useNotices(addresses: string[]) {
  const list = useMemo(() => [...new Set(addresses.filter(Boolean))].slice(0, 30), [addresses]);
  const key = list.length ? `notices:${list.join(",")}` : null;
  const live = useLive<Notice>(key, () => col(C.notices, where("to", "in", list)));
  const sorted = useMemo(() => [...live.data].sort((a, b) => b.at - a.at).slice(0, 40), [live.data]);
  return { notices: sorted, unread: sorted.filter((n) => !n.read).length, loading: live.loading };
}

export function NotificationsBell({ addresses, tone = "light" }: { addresses: string[]; tone?: "light" | "dark" }) {
  const { notices, unread } = useNotices(addresses);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markAll = () => markNoticesRead(notices.filter((n) => !n.read).map((n) => n.id)).catch(() => {});

  return (
    <div ref={box} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className={cx(
          "relative flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          tone === "dark" ? "text-white/80 hover:bg-white/10" : "text-ink/70 hover:bg-ink/5 hover:text-ink"
        )}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="tabular absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 z-40 mt-2 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-line bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold text-ink">Notifications</p>
              {unread > 0 && (
                <button onClick={markAll} className="text-xs font-medium text-ink/60 hover:text-ink">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-[420px] overflow-y-auto">
              {notices.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted">You&apos;re all caught up.</p>
              ) : (
                notices.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href || "#"}
                    onClick={() => {
                      setOpen(false);
                      if (!n.read) markNoticesRead([n.id]).catch(() => {});
                    }}
                    className="flex gap-3 border-b border-line/70 px-4 py-3 last:border-0 hover:bg-paper"
                  >
                    <span className={cx("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-emerald-500")} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{n.title}</span>
                      {n.body && <span className="mt-0.5 block text-[13px] text-muted">{n.body}</span>}
                      <span className="mt-1 block text-[11px] text-ink/40">{relTime(n.at)}</span>
                    </span>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
