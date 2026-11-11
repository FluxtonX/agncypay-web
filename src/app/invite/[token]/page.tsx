"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Building2, MailX, Sparkles, Users } from "lucide-react";
import { Banner, Button, Card, EmptyState, LinkButton, Splash } from "@/components/ui";
import { PublicFrame } from "@/components/PublicFrame";
import { acceptTeamInvite, getInvite } from "@/lib/actions";
import { logoutWithFirebase } from "@/lib/firebaseAuth";
import { money } from "@/lib/format";
import { homeFor, useSession } from "@/lib/session";
import type { Invite } from "@/lib/types";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const { user, profile, loading } = useSession();
  const router = useRouter();
  const [invite, setInvite] = useState<Invite | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getInvite(token)
      .then((i) => alive && setInvite(i))
      .catch(() => alive && setInvite(null));
    return () => {
      alive = false;
    };
  }, [token]);

  if (invite === undefined || loading) return <Splash />;
  if (!invite || invite.status === "revoked") {
    return (
      <PublicFrame>
        <Card className="mx-auto mt-10 max-w-lg">
          <EmptyState icon={<MailX className="h-5 w-5" />} title="This invitation is no longer valid" body="It may have been cancelled. Ask whoever invited you to send a new one." />
        </Card>
      </PublicFrame>
    );
  }

  const here = `/invite/${token}`;
  const type = invite.kind === "talent" ? "individual" : "agency";
  const registerHref = `/auth/register?type=${type}&email=${encodeURIComponent(invite.email)}&lock=1&next=${encodeURIComponent(
    invite.kind === "team" ? here : invite.kind === "agency" && invite.payoutId ? "/agency/settings?tab=banks" : homeFor(type)
  )}${invite.kind === "team" ? `&org=${encodeURIComponent(invite.orgName)}` : ""}`;
  const loginHref = `/auth/login?email=${encodeURIComponent(invite.email)}&next=${encodeURIComponent(invite.kind === "team" ? here : homeFor(type))}`;
  const wrongAccount = !!profile && profile.email !== invite.email;

  const heading =
    invite.kind === "team"
      ? `${invite.invitedBy} invited you to join ${invite.orgName}`
      : invite.payoutId && invite.amount
        ? `${invite.orgName} sent you ${money(invite.amount)}`
        : invite.kind === "agency"
          ? `${invite.invitedBy} wants to get paid through AGNCY`
          : `You're invited to AGNCY`;
  const body =
    invite.kind === "team"
      ? "You'll have full access to the agency's invoices, payouts and settings."
      : invite.payoutId
        ? invite.kind === "talent"
          ? "The payment is already authorised. Create your free account and it lands in your AGNCY balance straight away — then withdraw to your bank whenever you like."
          : "The payment is already authorised. Create your agency account and connect a bank account — it's released to you automatically."
        : "Agencies on AGNCY send brand payment requests from their CRM and pay talent in a couple of clicks.";
  const Icon = invite.kind === "team" ? Users : invite.kind === "talent" ? Sparkles : Building2;

  const join = async () => {
    if (!profile) return;
    setBusy(true);
    setError(null);
    try {
      await acceptTeamInvite(invite, profile);
      router.replace("/agency");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't join.");
      setBusy(false);
    }
  };

  let action: React.ReactNode;
  if (invite.status === "accepted" && invite.kind !== "team") {
    action = profile ? <LinkButton href={homeFor(profile.accountType)} size="lg">Open AGNCY</LinkButton> : <LinkButton href={loginHref} size="lg">Sign in</LinkButton>;
  } else if (!user) {
    action = (
      <div className="flex flex-col gap-3 sm:flex-row">
        <LinkButton href={registerHref} size="lg">
          {invite.payoutId ? "Create account & collect" : "Create account"}
        </LinkButton>
        <LinkButton href={loginHref} size="lg" variant="secondary">
          I already have an account
        </LinkButton>
      </div>
    );
  } else if (wrongAccount) {
    action = (
      <Banner tone="warn" title={`You're signed in as ${profile?.email}`} action={<Button size="sm" variant="secondary" onClick={() => logoutWithFirebase()}>Sign out</Button>}>
        This invitation is for {invite.email}. Sign out and continue with that address.
      </Banner>
    );
  } else if (invite.kind === "team") {
    action =
      invite.status === "accepted" ? (
        <LinkButton href="/agency" size="lg">Open {invite.orgName}</LinkButton>
      ) : profile?.accountType !== "agency" ? (
        <Banner tone="warn">This email is registered as a {profile?.accountType} account, which can&apos;t join an agency team.</Banner>
      ) : (
        <Button size="lg" loading={busy} onClick={join}>
          Join {invite.orgName}
        </Button>
      );
  } else {
    action = <LinkButton href={homeFor(profile!.accountType)} size="lg">Continue</LinkButton>;
  }

  return (
    <PublicFrame>
      <Card className="mx-auto mt-6 max-w-xl p-8 text-center sm:p-10">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white">
          <Icon className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-[26px] font-semibold leading-tight tracking-tight text-ink">{heading}</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted">{body}</p>
        <p className="mt-2 text-sm text-ink/50">For {invite.email}</p>
        <div className="mt-8 flex justify-center">{action}</div>
        {error && (
          <Banner tone="danger" className="mt-6 text-left">
            {error}
          </Banner>
        )}
        <p className="mt-8 text-xs text-muted">
          By continuing you agree to AGNCY&apos;s beta terms. <Link href="/" className="underline">About AGNCY</Link>
        </p>
      </Card>
    </PublicFrame>
  );
}
