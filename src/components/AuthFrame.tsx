import Link from "next/link";
import { Logo } from "./ui";

const SPLIT = [
  { who: "Amara Okafor", what: "Talent fee", amount: "$23,750", width: "49%", color: "#34d399" },
  { who: "Parallel Talent Group", what: "Co-booking", amount: "$6,000", width: "13%", color: "#fbbf24" },
  { who: "Your agency", what: "Retained", amount: "$18,250", width: "38%", color: "rgba(255,255,255,.28)" },
];

/** Shared two-panel frame for sign-in, sign-up, password reset and invitations. */
export function AuthFrame({ title, subtitle, children, footer }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-1 bg-paper">
      <div className="flex w-full flex-col px-6 py-8 sm:px-10 lg:w-[54%] lg:px-16">
        <Link href="/" aria-label="AGNCY home" className="w-fit">
          <Logo />
        </Link>
        <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col justify-center py-10">
          <h1 className="text-[32px] font-semibold leading-[1.1] tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-3 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-sm text-muted">{footer}</div>}
        </div>
        <p className="text-xs text-ink/40">Controlled beta · test mode — no real money moves.</p>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-14">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }}
        />
        <p className="relative text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Payments for the creative economy</p>

        <div className="relative">
          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span>INV-2041 · Lumen &amp; Lark Skincare</span>
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 font-medium text-emerald-300">Paid</span>
            </div>
            <p className="font-display tabular mt-3 text-[40px] font-semibold leading-none tracking-tight">$48,000</p>
            <p className="mt-1.5 text-sm text-white/50">Spring campaign — stills and social</p>
            <div className="mt-6 flex h-2 gap-0.5 overflow-hidden rounded-full">
              {SPLIT.map((s) => (
                <span key={s.who} style={{ width: s.width, backgroundColor: s.color }} />
              ))}
            </div>
            <ul className="mt-5 space-y-3">
              {SPLIT.map((s) => (
                <li key={s.who} className="flex items-center gap-3 text-sm">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="flex-1">
                    {s.who} <span className="text-white/40">· {s.what}</span>
                  </span>
                  <span className="tabular font-medium">{s.amount}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-8 max-w-sm text-[22px] font-medium leading-snug tracking-tight">
            One invoice in. Every allocation out. Everyone sees exactly what they were paid for.
          </p>
        </div>

        <p className="relative text-xs text-white/40">Brands · Agencies · Talent</p>
      </aside>
    </div>
  );
}

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "That email and password don't match. Try again or reset your password.",
  "auth/wrong-password": "That email and password don't match. Try again or reset your password.",
  "auth/user-not-found": "That email and password don't match. Try again or reset your password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/email-already-in-use": "An account already exists for this email. Sign in instead.",
  "auth/weak-password": "Choose a password with at least 8 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "We couldn't reach the server. Check your connection and try again.",
  "auth/user-disabled": "This account has been disabled.",
};

export function authErrorMessage(err: unknown): string {
  const code = typeof err === "object" && err && "code" in err ? String((err as { code: unknown }).code) : "";
  return AUTH_ERRORS[code] ?? "Something went wrong. Please try again.";
}
