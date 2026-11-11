"use client";

import Link from "next/link";
import { ArrowUpRight, Receipt } from "lucide-react";
import { Card, EmptyState, PageHeader, Pill, SkeletonRows } from "@/components/ui";
import { C, col, useLive, where } from "@/lib/db";
import { useSession } from "@/lib/session";
import { dateLong, money, plural } from "@/lib/format";
import type { Payment } from "@/lib/types";

export default function BrandHistory() {
  const { profile } = useSession();
  const email = profile?.email ?? "";
  const live = useLive<Payment>(email ? `payments:${email}` : null, () => col(C.payments, where("payerEmail", "==", email)));
  const payments = [...live.data].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div>
      <PageHeader title="Payments" subtitle="Everything you've paid through AGNCY, with receipts. Includes payments made from pay links with this email." />
      <Card>
        {live.loading ? (
          <SkeletonRows />
        ) : payments.length === 0 ? (
          <EmptyState icon={<Receipt className="h-5 w-5" />} title="No payments yet" body="Receipts for the invoices you pay appear here." />
        ) : (
          <ul className="divide-y divide-line">
            {payments.map((p) => (
              <li key={p.id}>
                <Link href={`/receipt/${p.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-paper/60">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-paper text-ink/60">
                    <Receipt className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">
                      {p.items.map((i) => `${i.orgName} ${i.number}`).join(", ")}
                    </span>
                    <span className="block text-xs text-muted">
                      {dateLong(p.createdAt)} · {plural(p.items.length, "invoice")} · {p.methodLabel} · {p.receiptNo}
                    </span>
                  </span>
                  {p.guest && <Pill className="hidden sm:inline-flex">Pay link</Pill>}
                  <span className="tabular text-sm font-semibold text-ink">{money(p.total, p.currency)}</span>
                  <ArrowUpRight className="h-4 w-4 text-ink/30" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
