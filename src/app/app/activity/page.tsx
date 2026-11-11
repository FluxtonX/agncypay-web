"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Splash, Tabs } from "@/components/ui";
import { TxRow } from "@/components/talent";
import { useTalent } from "@/lib/talent";
import type { WalletTx } from "@/lib/types";

type Filter = "all" | "income" | "card" | "transfers";
const KINDS: Record<Exclude<Filter, "all">, WalletTx["kind"][]> = {
  income: ["earning", "reversal"],
  card: ["card"],
  transfers: ["withdrawal", "transfer_in", "transfer_out", "external"],
};

export default function ActivityPage() {
  return (
    <Suspense fallback={<Splash />}>
      <Activity />
    </Suspense>
  );
}

function Activity() {
  const { txs } = useTalent();
  const router = useRouter();
  const raw = useSearchParams().get("filter") as Filter | null;
  const filter: Filter = raw && (raw === "all" || raw in KINDS) ? raw : "all";
  const shown = filter === "all" ? txs : txs.filter((t) => KINDS[filter].includes(t.kind));

  return (
    <div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Activity</h1>
      <p className="mt-1 text-sm text-muted">Every transaction on your account. Card spending is kept apart from creative income.</p>
      <Tabs
        className="mt-5"
        value={filter}
        onChange={(id) => router.replace(id === "all" ? "/app/activity" : `/app/activity?filter=${id}`, { scroll: false })}
        tabs={[
          { id: "all", label: "All" },
          { id: "income", label: "Income" },
          { id: "card", label: "Card" },
          { id: "transfers", label: "Transfers" },
        ]}
      />
      {shown.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-line px-4 py-10 text-center text-sm text-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white px-4">
          {shown.map((t) => (
            <TxRow key={t.id} tx={t} />
          ))}
        </ul>
      )}
    </div>
  );
}
