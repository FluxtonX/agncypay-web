"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CreditCard,
  DollarSign,
  FileText,
  Globe2,
  Layers,
  Lock,
  Mail,
  Percent,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

/* ─── Shared animation ease ─── */
const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Data ─── */

const PAIN_POINTS = [
  {
    icon: FileText,
    title: "Manual Invoicing",
    desc: "Agencies create invoices across QuickBooks, Mainboard, MediaSlide — then email them to brands one-by-one.",
  },
  {
    icon: Mail,
    title: "Email-Based Payments",
    desc: "Brands receive invoices via email, pay outside the CRM through wire transfers or checks — zero visibility.",
  },
  {
    icon: Percent,
    title: "Manual Revenue Splits",
    desc: "Agencies manually split payments — 10% commission here, 90% talent payout there — in spreadsheets.",
  },
  {
    icon: Wallet,
    title: "Talent Left in the Dark",
    desc: "Creators have no real-time visibility into what they've earned, what's pending, or when they'll get paid.",
  },
];

const SOLUTIONS = [
  {
    icon: CreditCard,
    title: "Pay Widget for Brands",
    desc: "A white-label payment widget brands embed in their workflows. Approve an invoice, fund it, done — no emails, no wires.",
    tag: "For Brands",
  },
  {
    icon: Layers,
    title: "Agency Command Center",
    desc: "One dashboard to manage talent rosters, create invoices, automate commission splits, and track every dollar in or out.",
    tag: "For Agencies",
  },
  {
    icon: DollarSign,
    title: "Talent Balance & Payouts",
    desc: "Real-time liquidity balance, crystallized earnings, and instant payout requests — finally, full financial clarity for creators.",
    tag: "For Talent",
  },
];

const CAPABILITIES = [
  {
    icon: Zap,
    title: "Real-Time Settlements",
    desc: "Payments move the moment they're approved. Track every settlement from brand wallet to talent balance — live.",
  },
  {
    icon: BarChart3,
    title: "Financial Analytics",
    desc: "Executive-grade dashboards with deep visibility into payment flows, revenue allocation, and commission breakdowns.",
  },
  {
    icon: Users,
    title: "Multi-Stakeholder Management",
    desc: "Brands, agencies, and talent — all managed through a single platform. Every relationship, every payment, one source of truth.",
  },
  {
    icon: Shield,
    title: "Compliance Built-In",
    desc: "KYB/KYC verification, automated audit trails, and compliance controls woven into every transaction.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Bank-Grade Security",
    desc: "End-to-end encryption, MFA, role-based access, and SOC 2 Type II certified infrastructure protects every dollar.",
  },
  {
    icon: Globe2,
    title: "CRM Integration",
    desc: "Plug into QuickBooks, Mainboard, MediaSlide, and more. Invoice data flows in automatically — no double entry.",
  },
];

const WORKFLOW = [
  {
    step: "01",
    title: "Invoice Created",
    desc: "Agency creates an invoice inside AgncyPay or syncs from their CRM — talent, amounts, and splits attached.",
  },
  {
    step: "02",
    title: "Brand Pays via Widget",
    desc: "Brand receives a pay link or embeds the AgncyPay widget. One click to review, approve, and fund.",
  },
  {
    step: "03",
    title: "Automatic Split",
    desc: "AgncyPay splits the payment: agency commission is deposited, talent earnings crystallize in real-time.",
  },
  {
    step: "04",
    title: "Talent Gets Paid",
    desc: "Creators see updated balances instantly — request payouts at any time, track every earning.",
  },
];

const TRUST_BADGES = [
  "SOC 2 Type II Certified",
  "End-to-end encryption (AES-256)",
  "Multi-factor authentication",
  "Role-based access control",
  "Complete audit trails",
  "PCI DSS compliant infrastructure",
];

const LOGOS_ROW = [
  "QuickBooks",
  "Mainboard",
  "MediaSlide",
  "Stripe",
  "Plaid",
];

/* ─── Reveal Component (scroll-triggered) ─── */

type RevealDirection = "up" | "down" | "left" | "right" | "zoom";

function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
}) {
  const offsets: Record<RevealDirection, { x: number; y: number; scale: number }> = {
    up: { x: 0, y: 56, scale: 0.98 },
    down: { x: 0, y: -46, scale: 0.98 },
    left: { x: -72, y: 18, scale: 0.97 },
    right: { x: 72, y: 18, scale: 0.97 },
    zoom: { x: 0, y: 30, scale: 0.9 },
  };
  const start = offsets[direction];

  return (
    <motion.div
      initial={{ opacity: 0, x: start.x, y: start.y, scale: start.scale }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.82, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Animated Counter ─── */

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    const duration = 1800;
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

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Floating Particles (hero backdrop) ─── */

function HeroParticles() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Large ambient glows */}
      <div className="absolute top-[-15%] left-[10%] w-[600px] h-[600px] rounded-full bg-white/[0.025] blur-[140px] animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full bg-white/[0.02] blur-[120px] animate-[pulse_10s_ease-in-out_infinite_2s]" />
      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000_40%,transparent_100%)]" />
      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)]" />
    </div>
  );
}

/* ─── Stat Card ─── */

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-5">
      <span className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
        <AnimatedNumber target={value} suffix={suffix} />
      </span>
      <span className="text-[13px] font-medium text-[#8E8E93] text-center">{label}</span>
    </div>
  );
}


/* ═══════════════════════════════════════════
   LANDING PAGE
   ═══════════════════════════════════════════ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── HEADER ── */}
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50 h-[72px] border-b border-white/[0.06] bg-black/80 backdrop-blur-2xl"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 lg:px-12">
          <Link href="/" className="flex items-center" aria-label="AgncyPay home">
            <img
              src="/agncypaybrand.png"
              alt="AgncyPay"
              className="h-[42px] w-auto object-contain object-left sm:h-[48px] scale-[1.4] origin-left"
            />
          </Link>

          <nav className="hidden items-center gap-10 text-[13px] font-semibold text-[#767676] md:flex">
            <a href="#problem" className="transition-colors hover:text-white">
              Problem
            </a>
            <a href="#solution" className="transition-colors hover:text-white">
              Solution
            </a>
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#security" className="transition-colors hover:text-white">
              Security
            </a>
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/auth/login"
              className="hidden text-[13px] font-bold text-[#A3A3A3] transition-colors hover:text-white sm:inline"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-[38px] items-center justify-center rounded-full bg-white px-6 text-[13px] font-bold text-black transition-all hover:bg-[#E9E9E9] hover:scale-105 active:scale-100 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="pt-[72px]">
        {/* ── HERO ── */}
        <section className="relative min-h-[90vh] overflow-hidden border-b border-white/[0.06] bg-black flex items-center">
          <HeroParticles />

          <div className="relative z-10 mx-auto flex w-full max-w-[1100px] flex-col items-center justify-center px-6 py-24 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.15, ease: EASE }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 py-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#9A9A9A] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              The Payment Layer for the Creative Economy
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 38 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.28, ease: EASE }}
              className="max-w-[900px] text-[48px] sm:text-[72px] lg:text-[88px] font-bold leading-[0.95] tracking-[-0.04em]"
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/50">
                Stop Chasing Payments.
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/80 to-white/30">
                Start Getting Paid.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
              className="mt-8 max-w-[640px] text-lg sm:text-xl font-normal leading-relaxed text-[#8E8E93]"
            >
              AgncyPay connects brands, agencies, and talent on a single payment rail.
              Invoices flow in, payments split automatically, and creators see
              every dollar — in real time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.58, ease: EASE }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link
                href="/auth/register"
                className="group inline-flex h-12 w-[220px] items-center justify-center gap-3 rounded-full bg-white text-sm font-bold text-black transition-all hover:bg-[#E9E9E9] hover:scale-105 active:scale-100 shadow-[0_0_30px_rgba(255,255,255,0.12)]"
              >
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-12 w-[220px] items-center justify-center rounded-full border border-white/[0.2] bg-white/[0.03] text-sm font-bold text-white transition-all hover:bg-white/[0.08] hover:border-white/[0.35] backdrop-blur-md"
              >
                Schedule a Demo
              </Link>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.72, ease: EASE }}
              className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-[12px] font-semibold text-[#5A5A5A]"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5" />
                SOC 2 Compliant
              </span>
              <span className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                Bank-Level Security
              </span>
              <span className="flex items-center gap-2">
                <Globe2 className="h-3.5 w-3.5" />
                Global Infrastructure
              </span>
            </motion.div>
          </div>
        </section>

        {/* ── STATS RIBBON ── */}
        <section className="border-b border-white/[0.06] bg-[#050505]">
          <div className="mx-auto max-w-[1100px] grid grid-cols-2 md:grid-cols-4 divide-x divide-white/[0.06]">
            <Reveal delay={0}><StatCard value={3} suffix="" label="Stakeholders, One Rail" /></Reveal>
            <Reveal delay={0.08}><StatCard value={90} suffix="%" label="Faster Than Wire Transfers" /></Reveal>
            <Reveal delay={0.16}><StatCard value={100} suffix="%" label="Transparent Splits" /></Reveal>
            <Reveal delay={0.24}><StatCard value={0} suffix=" Emails" label="To Get Paid" /></Reveal>
          </div>
        </section>

        {/* ── THE PROBLEM ── */}
        <section id="problem" className="relative overflow-hidden border-b border-white/[0.06] bg-black px-6 py-28">
          <div className="mx-auto max-w-[1200px]">
            <Reveal direction="zoom" className="mb-16 text-center">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#FF6B6B]">
                The Problem
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-tight tracking-tight text-white max-w-[800px] mx-auto">
                The Creative Economy Runs on Broken Payment Rails
              </h2>
              <p className="mt-6 text-lg text-[#8E8E93] max-w-[600px] mx-auto font-light">
                Brands pay agencies manually. Agencies split payments in spreadsheets.
                Talent waits weeks — sometimes months — to get paid. Everyone loses.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PAIN_POINTS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.06}>
                    <article className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.04]">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-[#FF6B6B]/80">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-[#8E8E93]">{item.desc}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── THE SOLUTION ── */}
        <section id="solution" className="relative overflow-hidden border-b border-white/[0.06] bg-[#050505] px-6 py-28">
          {/* Subtle backdrop element */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.015] blur-[160px]" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1200px]">
            <Reveal direction="zoom" className="mb-16 text-center">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-white/60">
                The Solution
              </p>
              <h2 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-tight tracking-tight text-white max-w-[800px] mx-auto">
                One Platform, Three Experiences
              </h2>
              <p className="mt-6 text-lg text-[#8E8E93] max-w-[600px] mx-auto font-light">
                AgncyPay gives every player in the creative economy exactly what they need.
              </p>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {SOLUTIONS.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} direction="up" delay={i * 0.1}>
                    <article className="group relative flex flex-col rounded-[20px] border border-white/[0.1] bg-white/[0.03] backdrop-blur-xl p-8 min-h-[320px] transition-all duration-500 hover:border-white/[0.2] hover:bg-white/[0.06] hover:-translate-y-1">
                      {/* Top glossy line */}
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                      <span className="self-start mb-6 inline-flex items-center rounded-full border border-white/[0.12] bg-white/[0.05] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70">
                        {item.tag}
                      </span>

                      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.1] bg-white/[0.06] text-white/90 transition-colors group-hover:bg-white/[0.1]">
                        <Icon className="h-6 w-6" />
                      </div>

                      <h3 className="mb-4 text-xl font-bold text-white">{item.title}</h3>
                      <p className="text-sm leading-relaxed text-[#8E8E93] flex-1">{item.desc}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="border-b border-white/[0.06] bg-black px-6 py-28">
          <div className="mx-auto max-w-[1200px]">
            <Reveal direction="up" className="mb-20 text-center">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5A5A5A]">
                How It Works
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
                From Invoice to Payout in Minutes
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {WORKFLOW.map((item, i) => (
                <Reveal key={item.step} direction="up" delay={i * 0.08}>
                  <article className="relative group">
                    {/* Connector line */}
                    {i < WORKFLOW.length - 1 && (
                      <div className="hidden lg:block absolute top-10 left-[calc(100%+8px)] w-[calc(100%-16px)] h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                    )}
                    <div className="mb-6 text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white/30 to-white/5">
                      {item.step}
                    </div>
                    <h3 className="mb-3 text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-[#8E8E93]">{item.desc}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── PLATFORM CAPABILITIES ── */}
        <section id="features" className="relative overflow-hidden border-b border-white/[0.06] bg-[#050505] px-6 py-28">
          {/* Backdrop */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_40%,transparent_100%)]" />
          </div>

          <div className="relative z-10 mx-auto max-w-[1200px]">
            <Reveal direction="zoom" className="mb-16 text-center">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5A5A5A]">
                Platform Capabilities
              </p>
              <h2 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
                Built for Financial Operations at Scale
              </h2>
              <p className="mt-6 text-lg text-[#8E8E93] max-w-[600px] mx-auto font-light">
                Every feature designed for operational excellence and financial control
              </p>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CAPABILITIES.map((card, i) => {
                const Icon = card.icon;
                const dirs: RevealDirection[] = ["left", "up", "right", "left", "up", "right"];
                return (
                  <Reveal key={card.title} direction={dirs[i]} delay={(i % 3) * 0.08}>
                    <article className="group relative min-h-[230px] rounded-2xl border border-white/[0.08] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05] hover:-translate-y-1">
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/80 group-hover:text-white transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mb-3 text-[17px] font-bold text-white">{card.title}</h3>
                      <p className="text-sm leading-relaxed text-[#8E8E93]">{card.desc}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── SECURITY ── */}
        <section id="security" className="border-b border-white/[0.06] bg-black px-6 py-28">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <Reveal direction="left">
              <div>
                <p className="mb-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5A5A5A]">
                  Security & Compliance
                </p>
                <h2 className="max-w-[500px] text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
                  Enterprise-Grade Protection
                </h2>
                <p className="mt-5 max-w-[480px] text-[17px] font-normal leading-relaxed text-[#8E8E93]">
                  Built on bank-level infrastructure with comprehensive security
                  controls, compliance certifications, and audit capabilities.
                </p>

                <div className="mt-8 space-y-4">
                  {TRUST_BADGES.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm font-medium text-[#A7A7A7]">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500/70 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal direction="right" delay={0.08}>
              <div className="relative flex aspect-square max-w-[520px] mx-auto items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                {/* Animated rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[85%] h-[85%] rounded-full border border-white/[0.05] animate-[spin_30s_linear_infinite]" />
                  <div className="absolute w-[60%] h-[60%] rounded-full border border-white/[0.08] animate-[spin_20s_linear_infinite_reverse]" />
                  <div className="absolute w-[35%] h-[35%] rounded-full border border-white/[0.12] animate-[spin_15s_linear_infinite]" />
                </div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.06] border border-white/[0.12] flex items-center justify-center">
                    <Lock className="h-10 w-10 text-white/60" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-semibold text-white/50 tracking-wide">Secured</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#050505] px-6 py-28 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.025] blur-[140px]" />
          </div>

          <Reveal direction="zoom" className="relative z-10 mx-auto max-w-[800px]">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-white">
              Ready to Fix How the Creative Economy Gets Paid?
            </h2>
            <p className="mt-6 text-lg text-[#8E8E93] font-light max-w-[540px] mx-auto">
              Join forward-thinking brands and agencies that are leaving spreadsheets, wire transfers, and payment chaos behind.
            </p>
            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/auth/register"
                className="group inline-flex h-12 w-[240px] items-center justify-center gap-3 rounded-full bg-white text-sm font-bold text-black transition-all hover:bg-[#E9E9E9] hover:scale-105 active:scale-100 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-12 w-[240px] items-center justify-center rounded-full border border-white/[0.2] bg-white/[0.03] text-sm font-bold text-white transition-all hover:bg-white/[0.08] hover:border-white/[0.35] backdrop-blur-md"
              >
                Schedule a Demo
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-black px-6 pb-8 pt-20 border-t border-white/[0.04]">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 gap-12 border-b border-white/[0.06] pb-14 md:grid-cols-[1.25fr_1fr_1fr_1fr]">
            <div>
              <Link href="/" className="inline-flex items-center" aria-label="AgncyPay home">
                <img
                  src="/agncypaybrand.png"
                  alt="AgncyPay"
                  className="h-[42px] w-auto object-contain object-left sm:h-[48px] scale-[1.4] origin-left"
                />
              </Link>
              <p className="mt-6 max-w-[260px] text-[13px] font-normal leading-relaxed text-[#6B6B6B]">
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

          <div className="flex flex-col justify-between gap-5 pt-8 text-[12px] font-medium text-[#5A5A5A] md:flex-row">
            <p>© 2026 AgncyPay. All rights reserved.</p>
            <div className="flex gap-10">
              <Link href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── Footer Column ─── */

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="mb-5 text-[12px] font-bold uppercase tracking-[0.08em] text-[#999]">
        {title}
      </h3>
      <ul className="space-y-3 text-[13px] font-medium text-[#6B6B6B]">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
