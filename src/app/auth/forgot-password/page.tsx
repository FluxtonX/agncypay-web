"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthFrame, authErrorMessage } from "@/components/AuthFrame";
import { Banner, Button, Field, Input } from "@/components/ui";
import { resetPasswordWithFirebase } from "@/lib/firebaseAuth";
import { isEmail } from "@/lib/format";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await resetPasswordWithFirebase(email.trim());
      setSent(true);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const back = (
    <Link href="/auth/login" className="font-medium text-ink underline underline-offset-4">
      Back to sign in
    </Link>
  );

  if (sent) {
    return (
      <AuthFrame title="Check your inbox" subtitle={`If an account exists for ${email.trim()}, a reset link is on its way.`} footer={back}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <MailCheck className="h-5 w-5" />
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame title="Reset your password" subtitle="Enter your email and we'll send you a link to choose a new one." footer={back}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {error && <Banner tone="danger">{error}</Banner>}
        <Field label="Email">
          <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!isEmail(email)}>
          Send reset link
        </Button>
      </form>
    </AuthFrame>
  );
}
