"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Sparkles, Store } from "lucide-react";
import { AuthFrame, authErrorMessage } from "@/components/AuthFrame";
import { Banner, Button, Field, Input, Splash, cx } from "@/components/ui";
import { registerWithFirebase } from "@/lib/firebaseAuth";
import { isEmail } from "@/lib/format";
import { homeFor, safeNext, useSession } from "@/lib/session";
import type { AccountType } from "@/lib/types";

const TYPES: { id: AccountType; label: string; blurb: string; icon: typeof Store }[] = [
  { id: "agency", label: "Agency", blurb: "Get paid by brands, pay out talent", icon: Building2 },
  { id: "brand", label: "Brand", blurb: "Pay agency invoices in one place", icon: Store },
  { id: "individual", label: "Talent", blurb: "Receive and track creative income", icon: Sparkles },
];

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, profile, loading } = useSession();
  // Signed in but the profile was never written: finish it without asking for a password again.
  const finishing = !loading && !!user && !profile;
  const preset = params.get("type");
  const [type, setType] = useState<AccountType>(preset === "brand" || preset === "individual" ? preset : "agency");
  const [fullName, setFullName] = useState("");
  // Invitations prefill (and lock) the email; team invitations also fix the agency name.
  const joining = params.get("org");
  const locked = params.get("lock") === "1" && !!params.get("email");
  const [business, setBusiness] = useState(joining ?? "");
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && profile) router.replace(next ?? homeFor(profile.accountType));
  }, [loading, profile, next, router]);

  const needsBusiness = type !== "individual";
  const showTypes = !preset || !locked;
  const valid = fullName.trim().length > 1 && isEmail(email) && (finishing || password.length >= 8) && (!needsBusiness || business.trim().length > 1);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setError(null);
    setBusy(true);
    try {
      await registerWithFirebase(email.trim(), password, fullName, type, needsBusiness ? business : fullName);
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <AuthFrame
      title={finishing ? "Finish setting up your account" : joining ? `Join ${joining}` : "Create your account"}
      subtitle={joining ? "Create your login to join the team on AGNCY." : "One email, one login. It takes about a minute."}
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-ink underline underline-offset-4">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <Banner tone="danger">{error}</Banner>}
        {showTypes && (
        <div role="radiogroup" aria-label="Account type" className="grid grid-cols-3 gap-2">
          {TYPES.map((t) => {
            const active = t.id === type;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setType(t.id)}
                className={cx(
                  "rounded-2xl border p-3 text-left transition-colors",
                  active ? "border-ink bg-white ring-1 ring-ink" : "border-line bg-white/60 hover:border-ink/30"
                )}
              >
                <t.icon className={cx("h-4 w-4", active ? "text-ink" : "text-ink/45")} />
                <span className="mt-2 block text-sm font-semibold text-ink">{t.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted">{t.blurb}</span>
              </button>
            );
          })}
        </div>
        )}

        <Field label="Your name">
          <Input autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
        </Field>
        {needsBusiness && !joining && (
          <Field
            label={type === "agency" ? "Agency name" : "Business name"}
            hint={type === "brand" ? "Shown on your payment records. This login belongs to you as the billing contact." : "You can prefill the rest from your CRM after sign-up."}
          >
            <Input autoComplete="organization" required value={business} onChange={(e) => setBusiness(e.target.value)} placeholder={type === "agency" ? "Agency name" : "Company name"} />
          </Field>
        )}
        <Field label="Email" hint={type === "individual" ? "Use the address your agency pays you at so your earnings find you." : undefined}>
          <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" disabled={locked} />
        </Field>
        {!finishing && (
          <Field label="Password" hint="At least 8 characters.">
            <Input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
          </Field>
        )}
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!valid}>
          {finishing ? "Finish setup" : "Create account"}
        </Button>
      </form>
    </AuthFrame>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<Splash />}>
      <RegisterForm />
    </Suspense>
  );
}
