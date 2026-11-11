"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, FileX2, Printer } from "lucide-react";
import { Button, Card, EmptyState, Logo, Row, Splash } from "@/components/ui";
import { PublicFrame } from "@/components/PublicFrame";
import { C, useLiveDoc } from "@/lib/db";
import { dateTime, moneyExact } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Payment } from "@/lib/types";

export default function ReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useSession();
  const { data: p, loading } = useLiveDoc<Payment>(C.payments, id);

  if (loading) return <Splash />;
  if (!p) {
    return (
      <PublicFrame>
        <Card className="mx-auto mt-10 max-w-lg">
          <EmptyState icon={<FileX2 className="h-5 w-5" />} title="Receipt not found" />
        </Card>
      </PublicFrame>
    );
  }

  return (
    <PublicFrame right={profile?.accountType === "brand" ? <Link href="/brand/history" className="ml-2 text-sm font-medium text-ink/70 hover:text-ink">My payments</Link> : undefined}>
      <div className="mx-auto max-w-xl pt-4">
        <div className="no-print mb-6 flex flex-col items-center text-center">
          <svg viewBox="0 0 52 52" className="h-14 w-14" aria-hidden>
            <circle cx="26" cy="26" r="25" fill="#ecfdf5" />
            <path className="check-draw" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" d="M15 27l7 7 15-16" />
          </svg>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">Payment received</h1>
          <p className="mt-1 text-sm text-muted">A copy has been emailed to {p.payerEmail}.</p>
        </div>

        <Card className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <Logo />
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider text-muted">Receipt</p>
              <p className="text-sm font-semibold text-ink">{p.receiptNo}</p>
            </div>
          </div>
          <p className="font-display tabular mt-8 text-4xl font-semibold tracking-tight text-ink">{moneyExact(p.total, p.currency)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Paid {dateTime(p.createdAt)}
          </p>

          <div className="mt-6 border-t border-line pt-4">
            {p.items.map((i) => (
              <Row key={i.invoiceId} label={`${i.orgName} · ${i.number} · ${i.description}`}>
                {moneyExact(i.amount, p.currency)}
              </Row>
            ))}
            <div className="mt-1 border-t border-line pt-1.5">
              <Row label="Total" strong>
                {moneyExact(p.total, p.currency)}
              </Row>
            </div>
          </div>
          <div className="mt-4 border-t border-line pt-4">
            <Row label="Paid by">{p.payerName || p.payerEmail}</Row>
            <Row label="Email">{p.payerEmail}</Row>
            <Row label="Method">{p.methodLabel}</Row>
          </div>
          <p className="mt-6 rounded-xl bg-amber-50 px-3 py-2 text-center text-xs text-amber-800">Test mode receipt — no money was moved.</p>
        </Card>
        <div className="no-print mt-6 flex justify-center gap-2">
          <Button variant="secondary" icon={<Printer className="h-4 w-4" />} onClick={() => window.print()}>
            Print or save PDF
          </Button>
          {profile?.accountType === "brand" && (
            <Link href="/brand" className="inline-flex h-10 items-center rounded-full bg-ink px-4 text-sm font-medium text-white hover:bg-black/80">
              Back to invoices
            </Link>
          )}
        </div>
      </div>
    </PublicFrame>
  );
}
