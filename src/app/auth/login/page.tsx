"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthFrame, authErrorMessage } from "@/components/AuthFrame";
import { Banner, Button, Field, Input, Splash } from "@/components/ui";
import { loginWithFirebase } from "@/lib/firebaseAuth";
import { homeFor, safeNext, useSession } from "@/lib/session";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { user, profile, loading } = useSession();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Already signed in (or just signed in): go where they were headed. An account whose profile was
  // never finished goes to the register page to complete it.
  useEffect(() => {
    if (loading) return;
    if (profile) router.replace(next ?? homeFor(profile.accountType));
    else if (user?.email) {
      const q = new URLSearchParams({ email: user.email, lock: "1", ...(next ? { next } : {}) });
      router.replace(`/auth/register?${q}`);
    }
  }, [loading, user, profile, next, router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await loginWithFirebase(email.trim(), password);
    } catch (err) {
      setError(authErrorMessage(err));
      setBusy(false);
    }
  };

  const registerHref = `/auth/register${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in once on this device and you stay signed in — no emailed codes every time."
      footer={
        <>
          New to AGNCY?{" "}
          <Link href={registerHref} className="font-medium text-ink underline underline-offset-4">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <Banner tone="danger">{error}</Banner>}
        <Field label="Email">
          <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </Field>
        <Field label="Password">
          <Input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        <div className="flex justify-end">
          <Link href="/auth/forgot-password" className="text-[13px] font-medium text-ink/70 underline-offset-4 hover:text-ink hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!email.trim() || !password}>
          Sign in
        </Button>
      </form>
    </AuthFrame>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Splash />}>
      <LoginForm />
    </Suspense>
  );
}
