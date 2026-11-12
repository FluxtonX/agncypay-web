"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileX2, LogIn, ShieldCheck, Sparkles, UserPlus } from "lucide-react";
import { Avatar, Banner, Card, EmptyState, Row, Splash } from "@/components/ui";
import { PublicFrame } from "@/components/PublicFrame";
import { Checkout } from "@/components/Checkout";
import { DeclineModal } from "@/components/DeclineModal";
import { emailIsRegistered, markViewed } from "@/lib/actions";
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
  // The not-signed-in flow starts on a choice screen; "guest" reveals the checkout.
  const [mode, setMode] = useState<"choose" | "guest">("choose");
  // Does the billing email already have an AGNCY account? Drives sign-in vs. create-account copy.
  const [registered, setRegistered] = useState<boolean | null>(null);
  const viewed = useRef(false);

  useEffect(() => {
    if (!inv || viewed.current || inv.status !== "sent") return;
    viewed.current = true;
    markViewed(inv).catch(() => {});
  }, [inv]);

  const email = inv?.brandEmail;
  useEffect(() => {
    if (!email) return;
    let alive = true;
    emailIsRegistered(email)
      .then((r) => alive && setRegistered(r))
      .catch(() => alive && setRegistered(false));
    return () => {
      alive = false;
    };
  }, [email]);

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
            !profile && mode === "choose" ? (
              <ChooseHowToPay
                inv={inv}
                token={token}
                registered={registered}
                onGuest={() => setMode("guest")}
              />
            ) : (
              <Card className="p-5 sm:p-6">
                {signedInMatch ? (
                  <Banner tone="info" title="You're signed in" className="mb-5">
                    <Link href="/brand" className="font-medium underline underline-offset-4">
                      Open your portal
                    </Link>{" "}
                    to pay this together with other invoices.
                  </Banner>
                ) : !profile ? (
                  <button onClick={() => setMode("choose")} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink/60 hover:text-ink">
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                ) : null}
                <Checkout
                  invoices={[inv]}
                  payer={signedInMatch ? { name: profile.fullName, email: profile.email, uid: profile.uid } : { name: "", email: inv.brandEmail, uid: null }}
                  onPaid={(id) => router.push(`/receipt/${id}`)}
                />
              </Card>
            )
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

/** First screen a not-signed-in brand sees: create an account / sign in, or pay as a guest. */
function ChooseHowToPay({
  inv,
  token,
  registered,
  onGuest,
}: {
  inv: Invoice;
  token: string;
  registered: boolean | null;
  onGuest: () => void;
}) {
  const next = `/pay/${token}`;
  // Lock the email so the brand registers with the address the invoice was billed to — that's how
  // it shows up in their /brand portal (which matches on brandEmail).
  const registerHref = `/auth/register?type=brand&email=${encodeURIComponent(inv.brandEmail)}&lock=1&next=${encodeURIComponent(next)}`;
  const loginHref = `/auth/login?email=${encodeURIComponent(inv.brandEmail)}&next=${encodeURIComponent(next)}`;

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-ink">How would you like to pay?</h2>
      <p className="mt-1 text-sm text-muted">
        {money(inv.amount, inv.currency)} to {inv.orgName}
      </p>

      <div className="mt-5 space-y-3">
        {registered ? (
          <OptionLink
            href={loginHref}
            icon={<LogIn className="h-5 w-5" />}
            title="Sign in to pay"
            body="This email already has an AGNCY account. Sign in to pay and keep your receipts together."
            primary
          />
        ) : (
          <OptionLink
            href={registerHref}
            icon={<UserPlus className="h-5 w-5" />}
            title="Create a free account"
            body="Pay this invoice, then keep every invoice and receipt from all your agencies in one place."
            primary
          />
        )}

        <button onClick={onGuest} className="w-full rounded-2xl border border-line bg-white p-4 text-left transition-colors hover:border-ink/30">
          <OptionInner icon={<ShieldCheck className="h-5 w-5" />} title="Pay as a guest" body="Pay this request now — no account needed." />
        </button>
      </div>

      {registered === false && (
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
          <Sparkles className="h-3.5 w-3.5" />
          Takes about a minute · pay multiple agencies at once
        </p>
      )}
      {!registered && (
        <p className="mt-3 text-center text-xs text-muted">
          Already have an account?{" "}
          <Link href={loginHref} className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </p>
      )}
    </Card>
  );
}

function OptionLink({ href, icon, title, body, primary }: { href: string; icon: React.ReactNode; title: string; body: string; primary?: boolean }) {
  return (
    <Link href={href} className={primary ? "block rounded-2xl bg-ink p-4 text-white transition-opacity hover:opacity-90" : "block rounded-2xl border border-line bg-white p-4 transition-colors hover:border-ink/30"}>
      <OptionInner icon={icon} title={title} body={body} invert={primary} />
    </Link>
  );
}

function OptionInner({ icon, title, body, invert }: { icon: React.ReactNode; title: string; body: string; invert?: boolean }) {
  return (
    <span className="flex items-start gap-3">
      <span className={invert ? "mt-0.5 text-white/80" : "mt-0.5 text-ink/50"}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className={invert ? "block text-sm font-semibold text-white" : "block text-sm font-semibold text-ink"}>{title}</span>
        <span className={invert ? "mt-0.5 block text-xs text-white/70" : "mt-0.5 block text-xs text-muted"}>{body}</span>
      </span>
    </span>
  );
}
