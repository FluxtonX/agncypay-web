"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, FileX2, Layers } from "lucide-react";
import { Avatar, Banner, Card, EmptyState, Row, Splash } from "@/components/ui";
import { PublicFrame } from "@/components/PublicFrame";
import { Checkout } from "@/components/Checkout";
import { DeclineModal } from "@/components/DeclineModal";
import { markViewed } from "@/lib/actions";
import { C, col, useLive, useNow, where } from "@/lib/db";
import { viewInvoice } from "@/lib/domain";
import { dateLong, money } from "@/lib/format";
import { useSession } from "@/lib/session";
import type { Invoice } from "@/lib/types";

export default function PayLink() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { profile } = useSession();
  const now = useNow();
  const live = useLive<Invoice>(`pay:${token}`, () => col(C.invoices, where("token", "==", token)));
  const inv = live.data[0];
  const [declining, setDeclining] = useState(false);
  const viewed = useRef(false);

  useEffect(() => {
    if (!inv || viewed.current || inv.status !== "sent") return;
    viewed.current = true;
    markViewed(inv).catch(() => {});
  }, [inv]);

  if (live.loading) return <Splash />;
  if (!inv) {
    return (
      <PublicFrame>
        <Card className="mx-auto mt-10 max-w-lg">
          <EmptyState icon={<FileX2 className="h-5 w-5" />} title="This payment link isn't valid" body="It may have been mistyped or replaced. Ask the agency to resend the request." />
        </Card>
      </PublicFrame>
    );
  }

  const v = viewInvoice(inv, now);
  const isBrand = profile?.accountType === "brand";
  const signedInMatch = isBrand && profile.email === inv.brandEmail;

  return (
    <PublicFrame>
      <div className="grid gap-6 pt-4 lg:grid-cols-[1fr_420px]">
        <div>
          <div className="flex items-center gap-3">
            <Avatar name={inv.orgName} size={44} tone="ink" />
            <div>
              <p className="text-sm text-muted">Payment request from</p>
              <p className="text-lg font-semibold text-ink">{inv.orgName}</p>
            </div>
          </div>
          <h1 className="font-display tabular mt-8 text-[44px] font-semibold leading-none tracking-tight text-ink">{money(inv.amount, inv.currency)}</h1>
          <p className={v.daysOverdue ? "mt-2 text-sm font-medium text-rose-600" : "mt-2 text-sm text-muted"}>
            {inv.status === "paid" ? `Paid ${dateLong(inv.paidAt)}` : v.daysOverdue ? `${v.daysOverdue} days overdue · was due ${dateLong(inv.dueDate)}` : `Due ${dateLong(inv.dueDate)}`}
          </p>

          <Card className="mt-8">
            <div className="border-b border-line px-5 py-4">
              <p className="text-sm font-semibold text-ink">
                {inv.number} · {inv.description}
              </p>
              <p className="text-xs text-muted">
                Billed to {inv.brandName} · issued {dateLong(inv.issueDate)}
              </p>
            </div>
            <div className="px-5 py-3">
              {inv.lines.map((l, i) => (
                <Row key={i} label={l.description}>
                  {money(l.amount, inv.currency)}
                </Row>
              ))}
              <div className="mt-1 border-t border-line pt-1.5">
                <Row label="Total" strong>
                  {money(inv.amount, inv.currency)}
                </Row>
              </div>
            </div>
          </Card>

          {v.payable && (
            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <button onClick={() => setDeclining(true)} className="font-medium text-ink/60 underline-offset-4 hover:text-ink hover:underline">
                Something wrong? Decline this request
              </button>
            </div>
          )}
        </div>

        <div>
          {v.payable ? (
            <Card className="p-5 sm:p-6">
              {signedInMatch ? (
                <Banner tone="info" title="You're signed in" className="mb-5">
                  <Link href="/brand" className="font-medium underline underline-offset-4">
                    Open your portal
                  </Link>{" "}
                  to pay this together with other invoices.
                </Banner>
              ) : !profile ? (
                <div className="mb-5 flex items-start gap-3 rounded-2xl bg-paper px-4 py-3 text-sm">
                  <Layers className="mt-0.5 h-4 w-4 shrink-0 text-ink/50" />
                  <p className="text-ink/70">
                    Paying several agencies?{" "}
                    <Link href={`/auth/login?next=/brand`} className="font-medium text-ink underline underline-offset-4">
                      Sign in
                    </Link>{" "}
                    or{" "}
                    <Link href={`/auth/register?type=brand&email=${encodeURIComponent(inv.brandEmail)}&next=/brand`} className="font-medium text-ink underline underline-offset-4">
                      create a free account
                    </Link>{" "}
                    to pay them all at once and keep receipts. Or just pay this one below.
                  </p>
                </div>
              ) : null}
              <Checkout
                invoices={[inv]}
                payer={signedInMatch ? { name: profile.fullName, email: profile.email, uid: profile.uid } : { name: "", email: inv.brandEmail, uid: null }}
                onPaid={(id) => router.push(`/receipt/${id}`)}
              />
            </Card>
          ) : (
            <Card className="p-6 text-center">
              {inv.status === "paid" ? (
                <>
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                  <p className="mt-3 text-lg font-semibold text-ink">This invoice is paid</p>
                  {inv.paymentId ? (
                    <Link href={`/receipt/${inv.paymentId}`} className="mt-2 inline-block text-sm font-medium underline underline-offset-4">
                      View receipt
                    </Link>
                  ) : (
                    <p className="mt-1 text-sm text-muted">Recorded as paid by {inv.orgName}.</p>
                  )}
                </>
              ) : inv.status === "declined" ? (
                <>
                  <p className="text-lg font-semibold text-ink">You declined this request</p>
                  <p className="mt-1 text-sm text-muted">{inv.orgName} has been notified. A corrected request will come to {inv.brandEmail}.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-ink">This request is no longer open</p>
                  <p className="mt-1 text-sm text-muted">Contact {inv.orgName} if you think this is a mistake.</p>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
      <DeclineModal invoice={declining ? inv : null} by={profile?.accountType === "brand" ? profile.workspaceName || profile.fullName : inv.brandName} onClose={() => setDeclining(false)} />
    </PublicFrame>
  );
}
