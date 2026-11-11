"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, HandCoins, Landmark, Send, Smartphone } from "lucide-react";
import { CopyButton, Skeleton } from "@/components/ui";
import { Section, TxRow } from "@/components/talent";
import { useTalent } from "@/lib/talent";
import { canRequestPayment, stageOf } from "@/lib/domain";
import { money, plural } from "@/lib/format";

export default function TalentHome() {
  const { profile, balance, allocations, txs, payouts, loading } = useTalent();
  const ready = allocations.filter((a) => canRequestPayment(a));
  const outstanding = allocations.filter((a) => stageOf(a) !== "paid");
  const waiting = payouts.filter((p) => p.status === "pending_recipient");
  const recent = txs.filter((t) => t.kind === "earning").slice(0, 4);

  return (
    <div>
      <p className="mt-2 text-sm text-muted">Hi {profile.fullName.split(" ")[0]}</p>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative mt-3 overflow-hidden rounded-[28px] bg-ink p-6 text-white">
        <div aria-hidden className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-400/20 blur-2xl" />
        <p className="relative text-xs uppercase tracking-[0.18em] text-white/50">Available balance</p>
        {loading ? <Skeleton className="relative mt-3 h-11 w-40 !bg-white/10" /> : <p className="font-display tabular relative mt-2 text-[44px] font-semibold leading-none tracking-tight">{money(balance)}</p>}
        <div className="relative mt-4 flex items-center gap-2 text-sm text-white/60">
          <span>{profile.handle ? `@${profile.handle}` : "Creating your Wallet ID…"}</span>
          {profile.handle && (
            <span className="[&_button]:h-7 [&_button]:border-white/15 [&_button]:bg-white/10 [&_button]:text-white [&_button:hover]:bg-white/20">
              <CopyButton value={`@${profile.handle}`} label="Copy" />
            </span>
          )}
        </div>
        <div className="relative mt-6 grid grid-cols-3 gap-2">
          {[
            { href: "/app/move?do=withdraw", label: "Withdraw", icon: Landmark },
            { href: "/app/move?do=send", label: "Send", icon: Send },
            { href: "/app/move?do=pay", label: "Pay a contact", icon: Smartphone },
          ].map((b) => (
            <Link key={b.href} href={b.href} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 py-3 text-xs font-medium text-white transition-colors hover:bg-white/15">
              <b.icon className="h-4 w-4" />
              {b.label}
            </Link>
          ))}
        </div>
      </motion.div>

      {ready.length > 0 && (
        <Link href="/app/earnings" className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
          <HandCoins className="h-5 w-5 text-emerald-700" />
          <span className="flex-1 text-sm">
            <span className="block font-semibold text-emerald-900">{money(ready.reduce((s, a) => s + a.net, 0))} ready to request</span>
            <span className="block text-emerald-800/80">Brands have paid {plural(ready.length, "job")} — ask your agency to pay out.</span>
          </span>
          <ArrowRight className="h-4 w-4 text-emerald-700" />
        </Link>
      )}

      {waiting.length > 0 && (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Collecting {plural(waiting.length, "payout")} sent before you joined…</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link href="/app/earnings" className="rounded-2xl border border-line bg-white p-4">
          <p className="text-xs text-muted">Outstanding</p>
          <p className="font-display tabular mt-1 text-xl font-semibold text-ink">{money(outstanding.reduce((s, a) => s + a.net, 0))}</p>
          <p className="mt-0.5 text-xs text-muted">{plural(outstanding.length, "job")}</p>
        </Link>
        <Link href="/app/earnings?tab=paid" className="rounded-2xl border border-line bg-white p-4">
          <p className="text-xs text-muted">Earned on AGNCY</p>
          <p className="font-display tabular mt-1 text-xl font-semibold text-ink">{money(allocations.filter((a) => a.status === "paid").reduce((s, a) => s + a.net, 0))}</p>
          <p className="mt-0.5 text-xs text-muted">{plural(new Set(allocations.map((a) => a.orgId)).size, "agency", "agencies")}</p>
        </Link>
      </div>

      <Section
        title="Latest earnings"
        action={
          <Link href="/app/activity?filter=income" className="text-xs font-medium text-ink/60 hover:text-ink">
            See all
          </Link>
        }
      >
        {recent.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">When an agency pays you, it shows up here instantly.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white px-4">
            {recent.map((t) => (
              <TxRow key={t.id} tx={t} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
