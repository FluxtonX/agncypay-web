"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  CreditCard,
  FileText,
  Fingerprint,
  Globe2,
  KeyRound,
  Layers,
  Lock,
  Mail,
  Menu,
  Percent,
  ScrollText,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";

/* ─── Shared animation ease ─── */
const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Data ─── */

const NAV_LINKS = [
  { label: "Why AgncyPay", href: "#problem" },
  { label: "Platform", href: "#solution" },
  { label: "How it works", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Security", href: "#security" },
];

const INTEGRATIONS = [
  { label: "QuickBooks", src: "/quickbook.png" },
  { label: "Xero", src: "/xero.png" },
  { label: "Sage", src: "/sage.png" },
  { label: "NetSuite", src: "/netsuite.png" },
  { label: "Plaid", src: "/plaid-logo.svg", wide: true },
];

const COMPARISON = [
  {
    icon: FileText,
    before: "Invoices built across QuickBooks, Mainboard and MediaSlide, then emailed to brands one by one.",
    after: "Invoices created in AgncyPay or synced from your CRM automatically.",
  },
  {
    icon: Mail,
    before: "Brands pay outside the CRM by wire or check, with zero visibility.",
    after: "Brands review, approve and fund from a single pay link or widget.",
  },
  {
    icon: Percent,
    before: "Commission and talent payouts split by hand in spreadsheets.",
    after: "Every payment is split automatically the moment it lands.",
  },
  {
    icon: Wallet,
    before: "Talent has no idea what they've earned, what's pending, or when they'll be paid.",
    after: "Talent sees live balances and requests payouts any time.",
  },
];

const SOLUTIONS = [
  {
    icon: CreditCard,
    tag: "For Brands",
    title: "Pay Widget",
    desc: "A white-label payment widget brands embed in their workflows. Approve an invoice, fund it, done — no emails, no wires.",
    points: ["One-click approval", "Pay links & embeds", "Full payment history"],
  },
  {
    icon: Layers,
    tag: "For Agencies",
    title: "Agency Command Center",
    desc: "One dashboard to manage talent rosters, create invoices, automate commission splits, and track every dollar in or out.",
    points: ["Roster management", "Automated commissions", "CRM invoice sync"],
  },
  {
    icon: Wallet,
    tag: "For Talent",
    title: "Talent Balance & Payouts",
    desc: "Real-time liquidity balance, crystallized earnings, and instant payout requests — finally, full financial clarity for creators.",
    points: ["Live earnings", "On-demand payouts", "Transparent splits"],
  },
];

const WORKFLOW = [
  {
    step: "01",
    icon: FileText,
    title: "Invoice created",
    desc: "Agency creates an invoice inside AgncyPay or syncs from their CRM — talent, amounts, and splits attached.",
  },
  {
    step: "02",
    icon: CreditCard,
    title: "Brand pays via widget",
    desc: "Brand receives a pay link or embeds the AgncyPay widget. One click to review, approve, and fund.",
  },
  {
    step: "03",
    icon: Percent,
    title: "Automatic split",
    desc: "AgncyPay splits the payment: agency commission is deposited, talent earnings crystallize in real time.",
  },
  {
    step: "04",
    icon: Wallet,
    title: "Talent gets paid",
    desc: "Creators see updated balances instantly — request payouts at any time, track every earning.",
  },
];

const SECURITY_ITEMS = [
  { icon: ShieldCheck, title: "SOC 2 Type II", desc: "Certified infrastructure, independently audited." },
  { icon: Lock, title: "AES-256 encryption", desc: "End-to-end encryption for data in transit and at rest." },
  { icon: Fingerprint, title: "Multi-factor auth", desc: "MFA protects every account and every approval." },
  { icon: KeyRound, title: "Role-based access", desc: "Granular permissions for every team member." },
  { icon: ScrollText, title: "Complete audit trails", desc: "Every action logged, timestamped and traceable." },
  { icon: Building2, title: "PCI DSS infrastructure", desc: "Compliant card and payment processing rails." },
];

/* ─── Reveal (scroll-triggered) ─── */

function Reveal({
  children,
  className,
  delay = 0,
  y = 32,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated Counter ─── */

function AnimatedNumber({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 1600;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isInView, target]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {count.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}

/* ─── Section heading ─── */

function SectionHeading({
  eyebrow,
  title,
  desc,
  dark = false,
  align = "center",
}: {
  eyebrow: string;
  title: React.ReactNode;
  desc?: string;
  dark?: boolean;
  align?: "center" | "left";
}) {
  const centered = align === "center";
  return (
    <Reveal className={centered ? "mx-auto max-w-[720px] text-center" : "max-w-[560px]"}>
      <p
        className={`mb-4 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.14em] ${
          dark ? "text-emerald-400" : "text-emerald-700"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-emerald-400" : "bg-emerald-600"}`} />
        {eyebrow}
      </p>
      <h2
        className={`text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[44px] lg:text-[52px] ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>
      {desc && (
        <p
          className={`mt-5 text-[17px] leading-relaxed ${centered ? "mx-auto max-w-[580px]" : ""} ${
            dark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {desc}
        </p>
      )}
    </Reveal>
  );
}

/* ─── Header ─── */

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-slate-200/70 bg-white/80 shadow-[0_1px_0_rgba(15,23,42,0.02)] backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center" aria-label="AgncyPay home">
          <img src="/logo-tiles/agncy-logo.png" alt="Agncy" className="h-7 w-auto object-contain object-left" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-[14px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/auth/login"
            className="hidden rounded-full px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:text-slate-950 sm:inline-flex"
          >
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="group hidden h-10 items-center gap-1.5 rounded-full bg-slate-950 pl-5 pr-4 text-[14px] font-medium text-white shadow-sm transition-colors hover:bg-slate-800 sm:inline-flex"
          >
            Get started
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-800 hover:bg-slate-100 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-slate-200/70 bg-white lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-[15px] font-medium text-slate-700 hover:bg-slate-50"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Link
                  href="/auth/login"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 text-[14px] font-medium text-slate-800"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 text-[14px] font-medium text-white"
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ─── Hero product mockup ─── */

function HeroMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      {/* glow */}
      <div aria-hidden className="absolute -inset-10 -z-10 rounded-[48px] bg-gradient-to-tr from-emerald-200/40 via-sky-100/40 to-transparent blur-3xl" />

      {/* Main invoice card */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, delay: 0.35, ease: EASE }}
        className="relative rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25),0_0_0_1px_rgba(15,23,42,0.02)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-medium text-slate-500">Invoice INV-2041 · Summer Campaign</p>
            <p className="mt-2 text-[34px] font-semibold tracking-[-0.03em] text-slate-950 tabular-nums sm:text-[38px]">
              $48,000<span className="text-slate-400">.00</span>
            </p>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.1, ease: EASE }}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-700 ring-1 ring-emerald-600/15"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Paid
          </motion.span>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-slate-900">Automatic split</p>
            <p className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-500">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Real time
            </p>
          </div>

          {/* split bar */}
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "20%" }}
              transition={{ duration: 1, delay: 1.2, ease: EASE }}
              className="h-full bg-slate-900"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "80%" }}
              transition={{ duration: 1.2, delay: 1.35, ease: EASE }}
              className="h-full bg-emerald-500"
            />
          </div>

          <div className="mt-5 space-y-3">
            <SplitRow color="bg-slate-900" label="Agency commission" pct="20%" amount="$9,600.00" />
            <SplitRow color="bg-emerald-500" label="Talent payout" pct="80%" amount="$38,400.00" />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center">
          {[
            { label: "Invoiced", done: true },
            { label: "Brand paid", done: true },
            { label: "Split & settled", done: true },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.5 + i * 0.12, ease: EASE }}
              className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 px-2 py-3"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[#fff]">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="text-[11.5px] font-medium text-slate-600">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating: payout notification */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 1.9, ease: EASE }}
        className="absolute -right-3 -top-6 hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 py-3 pl-3 pr-5 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)] backdrop-blur sm:flex lg:-right-10"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <ArrowUpRight className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-slate-900">Payout sent</p>
          <p className="text-[11.5px] text-slate-500 tabular-nums">$38,400.00 · just now</p>
        </div>
      </motion.div>

      {/* Floating: brand approved */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 2.1, ease: EASE }}
        className="absolute -bottom-6 -left-3 hidden items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 py-3 pl-3 pr-5 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.25)] backdrop-blur sm:flex lg:-left-10"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
          <ShieldCheck className="h-4.5 w-4.5" />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-slate-900">Brand approved</p>
          <p className="text-[11.5px] text-slate-500">Verified via Pay Widget</p>
        </div>
      </motion.div>
    </div>
  );
}

function SplitRow({ color, label, pct, amount }: { color: string; label: string; pct: string; amount: string }) {
  return (
    <div className="flex items-center justify-between text-[13px]">
      <span className="flex items-center gap-2.5 text-slate-600">
        <span className={`h-2.5 w-2.5 rounded-[3px] ${color}`} />
        {label}
        <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">
          {pct}
        </span>
      </span>
      <span className="font-semibold text-slate-900 tabular-nums">{amount}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="marketing min-h-screen bg-white text-slate-900 antialiased">
      <SiteHeader />

      <main>
        {/* ── HERO ── */}
        <section className="relative overflow-hidden pt-[68px]">
          {/* backdrop */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a0a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a0a_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_100%)]" />
            <div className="absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-emerald-100/60 to-transparent blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-[1240px] grid-cols-1 items-center gap-16 px-5 pb-24 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-12 lg:pb-32 lg:pt-24">
            <div className="text-center lg:text-left">
              <motion.a
                href="#solution"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
                className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 py-1 pl-1 pr-3 text-[13px] font-medium text-slate-700 shadow-xs backdrop-blur transition-colors hover:border-slate-300"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  <Sparkles className="h-3 w-3" /> New
                </span>
                The payment layer for the creative economy
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 transition-transform group-hover:translate-x-0.5" />
              </motion.a>

              <motion.h1
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
                className="mt-7 text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] text-slate-950 sm:text-[60px] lg:text-[72px]"
              >
                No more payment chase.{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                  Just money in.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
                className="mx-auto mt-6 max-w-[540px] text-[18px] leading-relaxed text-slate-600 lg:mx-0"
              >
                AgncyPay connects brands, agencies, and talent on a single payment rail. Invoices flow in, payments
                split automatically, and creators see every dollar — in real time.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.48, ease: EASE }}
                className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start"
              >
                <Link
                  href="/auth/register"
                  className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-7 text-[15px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.5)] transition-all hover:bg-slate-800 sm:w-auto"
                >
                  Start for free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/auth/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-[15px] font-medium text-slate-800 shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                >
                  Schedule a demo
                </Link>
              </motion.div>

              <motion.ul
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.65, ease: EASE }}
                className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[13px] font-medium text-slate-500 lg:justify-start"
              >
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> SOC 2 Type II
                </li>
                <li className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-slate-700" /> Bank-level security
                </li>
                <li className="flex items-center gap-1.5">
                  <Globe2 className="h-4 w-4 text-sky-600" /> Global infrastructure
                </li>
              </motion.ul>
            </div>

            <div className="px-2 sm:px-6 lg:px-0">
              <HeroMockup />
            </div>
          </div>
        </section>

        {/* ── INTEGRATIONS STRIP ── */}
        <section className="border-y border-slate-200/70 bg-slate-50/60">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center gap-6 px-5 py-10 sm:px-8 lg:flex-row lg:gap-12">
            <p className="shrink-0 text-center text-[13px] font-medium text-slate-500 lg:text-left">
              Syncs with the tools
              <br className="hidden lg:block" /> your finance team already uses
            </p>
            <div className="hidden h-10 w-px bg-slate-200 lg:block" />
            <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-10 gap-y-6 lg:justify-between">
              {INTEGRATIONS.map((i) => (
                <li key={i.label} className="flex items-center gap-2.5 opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0">
                  <img src={i.src} alt={i.label} className={i.wide ? "h-7 w-auto" : "h-8 w-8 object-contain"} />
                  {!i.wide && <span className="text-[15px] font-semibold text-slate-700">{i.label}</span>}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── PROBLEM → SOLUTION COMPARISON ── */}
        <section id="problem" className="scroll-mt-20 px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <SectionHeading
              eyebrow="Why AgncyPay"
              title={
                <>
                  The creative economy runs on <span className="text-slate-400">broken payment rails.</span>
                </>
              }
              desc="Brands pay agencies manually. Agencies split payments in spreadsheets. Talent waits weeks — sometimes months — to get paid. Everyone loses."
            />

            <Reveal className="mt-16" delay={0.1}>
              <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                <div className="hidden grid-cols-2 border-b border-slate-200/80 md:grid">
                  <div className="flex items-center gap-2 px-8 py-5 text-[13px] font-semibold text-slate-500">
                    <X className="h-4 w-4 text-rose-500" /> The old way
                  </div>
                  <div className="flex items-center gap-2 border-l border-slate-200/80 bg-emerald-50/40 px-8 py-5 text-[13px] font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> With AgncyPay
                  </div>
                </div>
                {COMPARISON.map((row, i) => {
                  const Icon = row.icon;
                  return (
                    <div
                      key={i}
                      className={`grid grid-cols-1 md:grid-cols-2 ${i < COMPARISON.length - 1 ? "border-b border-slate-200/80" : ""}`}
                    >
                      <div className="flex gap-4 px-6 py-6 sm:px-8">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <Icon className="h-4 w-4" />
                        </span>
                        <p className="text-[15px] leading-relaxed text-slate-500">{row.before}</p>
                      </div>
                      <div className="flex gap-4 border-t border-dashed border-slate-200 bg-emerald-50/40 px-6 py-6 sm:px-8 md:border-l md:border-t-0 md:border-solid md:border-slate-200/80">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-[#fff]">
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </span>
                        <p className="text-[15px] font-medium leading-relaxed text-slate-900">{row.after}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── SOLUTION: THREE EXPERIENCES ── */}
        <section id="solution" className="scroll-mt-20 bg-slate-50/70 px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <SectionHeading
              eyebrow="The platform"
              title="One platform. Three experiences."
              desc="AgncyPay gives every player in the creative economy exactly what they need — on the same rail."
            />

            <div className="mt-16 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {SOLUTIONS.map((item, i) => {
                const Icon = item.icon;
                const featured = i === 1;
                return (
                  <Reveal key={item.title} delay={i * 0.08}>
                    <article
                      className={`group relative flex h-full flex-col rounded-[24px] p-8 transition-all duration-300 hover:-translate-y-1 ${
                        featured
                          ? "bg-slate-950 text-white shadow-[0_30px_60px_-20px_rgba(15,23,42,0.45)]"
                          : "border border-slate-200/80 bg-white hover:shadow-[0_20px_50px_-20px_rgba(15,23,42,0.2)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                            featured ? "bg-white/10 text-emerald-300 ring-1 ring-white/10" : "bg-slate-950 text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-[12px] font-medium ${
                            featured ? "bg-emerald-400/15 text-emerald-300" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.tag}
                        </span>
                      </div>

                      <h3 className={`mt-8 text-[22px] font-semibold tracking-[-0.02em] ${featured ? "text-white" : "text-slate-950"}`}>
                        {item.title}
                      </h3>
                      <p className={`mt-3 text-[15px] leading-relaxed ${featured ? "text-slate-400" : "text-slate-600"}`}>
                        {item.desc}
                      </p>

                      <ul className={`mt-8 space-y-3 border-t pt-6 ${featured ? "border-white/10" : "border-slate-100"}`}>
                        {item.points.map((p) => (
                          <li
                            key={p}
                            className={`flex items-center gap-2.5 text-[14px] font-medium ${featured ? "text-slate-200" : "text-slate-700"}`}
                          >
                            <Check className={`h-4 w-4 ${featured ? "text-emerald-400" : "text-emerald-600"}`} strokeWidth={2.5} />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how" className="scroll-mt-20 px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <SectionHeading
              eyebrow="How it works"
              title="From invoice to payout in minutes."
              desc="Four steps, zero spreadsheets. Every party sees the same source of truth at every stage."
            />

            <div className="relative mt-20">
              {/* connector line (desktop) */}
              <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-7 hidden h-px bg-gradient-to-r from-slate-200 via-emerald-300 to-slate-200 lg:block" />

              <ol className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                {WORKFLOW.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <Reveal key={item.step} delay={i * 0.1}>
                      <li className="relative flex flex-col items-center text-center">
                        <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-[0_8px_20px_-8px_rgba(15,23,42,0.2)]">
                          <Icon className="h-5 w-5" />
                          <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[11px] font-semibold text-[#fff] ring-4 ring-white">
                            {i + 1}
                          </span>
                        </span>
                        <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.01em] text-slate-950">{item.title}</h3>
                        <p className="mt-2 max-w-[260px] text-[14.5px] leading-relaxed text-slate-600">{item.desc}</p>
                      </li>
                    </Reveal>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        {/* ── FEATURES BENTO ── */}
        <section id="features" className="scroll-mt-20 bg-slate-50/70 px-5 py-24 sm:px-8 lg:py-32">
          <div className="mx-auto max-w-[1240px]">
            <SectionHeading
              eyebrow="Capabilities"
              title="Built for financial operations at scale."
              desc="Every feature designed for operational excellence and financial control."
            />

            <div className="mt-16 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6">
              {/* Real-time settlements — large */}
              <Reveal className="lg:col-span-4">
                <BentoCard
                  icon={Zap}
                  title="Real-time settlements"
                  desc="Payments move the moment they're approved. Track every settlement from brand wallet to talent balance — live."
                >
                  <div className="mt-8 space-y-2.5">
                    {[
                      { who: "Brand wallet → Escrow", amt: "$48,000.00", status: "Settled" },
                      { who: "Escrow → Agency", amt: "$9,600.00", status: "Settled" },
                      { who: "Escrow → Talent balance", amt: "$38,400.00", status: "Live" },
                    ].map((r) => (
                      <div
                        key={r.who}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-[13.5px]"
                      >
                        <span className="font-medium text-slate-700">{r.who}</span>
                        <span className="flex items-center gap-4">
                          <span className="font-semibold text-slate-900 tabular-nums">{r.amt}</span>
                          <span
                            className={`hidden rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold sm:inline ${
                              r.status === "Live" ? "bg-emerald-500 text-[#fff]" : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {r.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </BentoCard>
              </Reveal>

              {/* Analytics */}
              <Reveal className="lg:col-span-2" delay={0.08}>
                <BentoCard
                  icon={BarChart3}
                  title="Financial analytics"
                  desc="Executive-grade dashboards with deep visibility into payment flows and commission breakdowns."
                >
                  <div className="mt-8 flex h-28 items-end gap-2">
                    {[38, 52, 44, 66, 58, 80, 92].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.06, ease: EASE }}
                        className={`flex-1 rounded-t-md ${i === 6 ? "bg-emerald-500" : "bg-slate-200"}`}
                      />
                    ))}
                  </div>
                </BentoCard>
              </Reveal>

              <Reveal className="lg:col-span-2">
                <BentoCard
                  icon={Users}
                  title="Multi-stakeholder management"
                  desc="Brands, agencies, and talent — every relationship, every payment, one source of truth."
                />
              </Reveal>
              <Reveal className="lg:col-span-2" delay={0.08}>
                <BentoCard
                  icon={Shield}
                  title="Compliance built in"
                  desc="KYB/KYC verification, automated audit trails, and compliance controls woven into every transaction."
                />
              </Reveal>
              <Reveal className="md:col-span-2 lg:col-span-2" delay={0.16}>
                <BentoCard
                  icon={Globe2}
                  title="CRM integration"
                  desc="Plug into QuickBooks, Mainboard, MediaSlide, and more. Invoice data flows in automatically — no double entry."
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── STATS + SECURITY (dark) ── */}
        <section id="security" className="relative scroll-mt-20 overflow-hidden bg-slate-950 px-5 py-24 text-white sm:px-8 lg:py-32">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 right-[-10%] h-[500px] w-[700px] rounded-full bg-emerald-500/15 blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] h-[400px] w-[600px] rounded-full bg-sky-500/10 blur-[120px]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_20%,transparent_100%)]" />
          </div>

          <div className="relative mx-auto max-w-[1240px]">
            {/* Stats */}
            <Reveal>
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] bg-white/10 lg:grid-cols-4">
                {[
                  { value: 3, suffix: "", label: "Stakeholders, one rail" },
                  { value: 90, suffix: "%", label: "Faster than wire transfers" },
                  { value: 100, suffix: "%", label: "Transparent splits" },
                  { value: 0, suffix: "", label: "Emails to get paid" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-950/90 px-6 py-8 sm:px-8 sm:py-10">
                    <p className="text-[40px] font-semibold tracking-[-0.04em] text-white sm:text-[52px]">
                      <AnimatedNumber target={s.value} suffix={s.suffix} />
                    </p>
                    <p className="mt-1 text-[14px] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Security */}
            <div className="mt-24 grid grid-cols-1 gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <SectionHeading
                  dark
                  align="left"
                  eyebrow="Security & compliance"
                  title="Enterprise-grade protection for every dollar."
                  desc="Built on bank-level infrastructure with comprehensive security controls, compliance certifications, and audit capabilities."
                />
                <Reveal delay={0.1}>
                  <Link
                    href="/auth/register"
                    className="group mt-8 inline-flex items-center gap-2 text-[15px] font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Open a secure account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Reveal>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SECURITY_ITEMS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <Reveal key={s.title} delay={(i % 2) * 0.06 + Math.floor(i / 2) * 0.06}>
                      <div className="flex h-full gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur transition-colors hover:border-white/20 hover:bg-white/[0.06]">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20">
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                        <div>
                          <p className="text-[15px] font-semibold text-white">{s.title}</p>
                          <p className="mt-1 text-[13.5px] leading-relaxed text-slate-400">{s.desc}</p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-5 py-24 sm:px-8 lg:py-32">
          <Reveal className="mx-auto max-w-[1240px]">
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-emerald-50 via-white to-sky-50 px-6 py-16 text-center sm:px-12 sm:py-20">
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0f172a08_1px,transparent_1px),linear-gradient(to_bottom,#0f172a08_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,#000_10%,transparent_100%)]" />
              <div className="relative mx-auto max-w-[720px]">
                <h2 className="text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-[48px] lg:text-[56px]">
                  Ready to fix how the creative economy gets paid?
                </h2>
                <p className="mx-auto mt-5 max-w-[540px] text-[17px] leading-relaxed text-slate-600">
                  Join forward-thinking brands and agencies leaving spreadsheets, wire transfers, and payment chaos
                  behind.
                </p>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    href="/auth/register"
                    className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-7 text-[15px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(15,23,42,0.5)] transition-colors hover:bg-slate-800 sm:w-auto"
                  >
                    Get started free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                  <Link
                    href="/auth/login"
                    className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-7 text-[15px] font-medium text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
                  >
                    Schedule a demo
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200/80 bg-white px-5 pb-10 pt-16 sm:px-8">
        <div className="mx-auto max-w-[1240px]">
          <div className="grid grid-cols-2 gap-10 border-b border-slate-200/80 pb-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="inline-flex items-center" aria-label="AgncyPay home">
                <img src="/logo-tiles/agncy-logo.png" alt="Agncy" className="h-7 w-auto object-contain object-left" />
              </Link>
              <p className="mt-5 max-w-[300px] text-[14px] leading-relaxed text-slate-500">
                The payment layer for the creative economy — connecting brands, agencies, and talent on a single rail.
              </p>
            </div>

            <FooterColumn
              title="Product"
              links={[
                { label: "Pay Widget", href: "#solution" },
                { label: "Agency Dashboard", href: "#solution" },
                { label: "Talent Balances", href: "#solution" },
                { label: "Integrations", href: "#features" },
              ]}
            />
            <FooterColumn
              title="Company"
              links={[
                { label: "About", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Contact", href: "#" },
                { label: "Legal", href: "#" },
              ]}
            />
            <FooterColumn
              title="Resources"
              links={[
                { label: "Documentation", href: "#" },
                { label: "API Reference", href: "#" },
                { label: "Support", href: "#" },
                { label: "Status", href: "#" },
              ]}
            />
          </div>

          <div className="flex flex-col justify-between gap-4 pt-8 text-[13px] text-slate-500 md:flex-row md:items-center">
            <p>© {new Date().getFullYear()} AgncyPay. All rights reserved.</p>
            <div className="flex gap-8">
              <Link href="#" className="transition-colors hover:text-slate-900">
                Privacy Policy
              </Link>
              <Link href="#" className="transition-colors hover:text-slate-900">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Bento Card ─── */

function BentoCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <article className="group flex h-full flex-col rounded-[24px] border border-slate-200/80 bg-white p-7 transition-all duration-300 hover:border-slate-300 hover:shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)] sm:p-8">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition-colors group-hover:bg-slate-950 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.015em] text-slate-950">{title}</h3>
      <p className="mt-2 max-w-[520px] text-[14.5px] leading-relaxed text-slate-600">{desc}</p>
      {children}
    </article>
  );
}

/* ─── Footer Column ─── */

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 text-[13px] font-semibold text-slate-900">{title}</h3>
      <ul className="space-y-3 text-[14px] text-slate-500">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition-colors hover:text-slate-950">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
