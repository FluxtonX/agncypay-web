"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Globe2,
  Lock,
  Shield,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

const capabilityCards = [
  {
    icon: Zap,
    title: "Instant Settlements",
    desc: "Real-time payment processing with transparent settlement tracking across your entire payment network.",
  },
  {
    icon: BarChart3,
    title: "Operational Analytics",
    desc: "Executive-grade dashboards with deep visibility into payment flows, spend allocation, and metrics.",
  },
  {
    icon: Users,
    title: "Multi-Agency Management",
    desc: "Centralized platform to manage relationships, invoices, and payments across all your agency partners.",
  },
  {
    icon: Shield,
    title: "Compliance First",
    desc: "Enterprise KYB/KYC verification, audit trails, and compliance controls built into every transaction.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Bank-Grade Security",
    desc: "End-to-end encryption, MFA, role-based access, and SOC 2 Type II certified infrastructure.",
  },
  {
    icon: Globe2,
    title: "CRM Integration",
    desc: "Seamless integration with your existing systems. Invoice data flows automatically into AgencyPay.",
  },
];

const workflow = [
  {
    number: "01",
    title: "CRM Integration",
    desc: "Invoice data flows automatically from your CRM systems",
  },
  {
    number: "02",
    title: "Review & Approve",
    desc: "Finance teams review and approve invoices in one platform",
  },
  {
    number: "03",
    title: "Fund & Execute",
    desc: "Connect bank accounts and execute approved payments",
  },
  {
    number: "04",
    title: "Track & Audit",
    desc: "Monitor settlements with complete audit trails",
  },
];

const securityItems = [
  "SOC 2 Type II Certified",
  "End-to-end encryption (AES-256)",
  "Multi-factor authentication",
  "Role-based access control",
  "Complete audit trails",
  "PCI DSS compliant infrastructure",
];

const cardDirections: RevealDirection[] = ["left", "up", "right", "left", "up", "right"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-x-0 top-0 z-50 h-[82px] border-b border-white/[0.08] bg-black/95 backdrop-blur"
      >
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-7 lg:px-12">
          <Link href="/" className="flex items-center" aria-label="AgncyPay home">
            <img
              src="/agncypayLogo.png"
              alt="AgncyPay"
              className="h-[58px] w-[230px] object-contain object-left sm:h-[66px] sm:w-[260px]"
            />
          </Link>

          <nav className="hidden items-center gap-[46px] text-[13px] font-semibold text-[#767676] md:flex">
            <a href="#features" className="transition-colors hover:text-white">
              Features
            </a>
            <a href="#security" className="transition-colors hover:text-white">
              Security
            </a>
            <a href="#pricing" className="transition-colors hover:text-white">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-6">
            <Link
              href="/auth/login"
              className="hidden text-[13px] font-bold text-[#A3A3A3] transition-colors hover:text-white sm:inline"
            >
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-[38px] items-center justify-center rounded-[5px] bg-white px-[22px] text-[13px] font-bold text-black transition-colors hover:bg-[#E9E9E9]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.header>

      <main className="pt-[82px]">
        <section className="relative min-h-[710px] overflow-hidden border-b border-white/[0.08] bg-black">
          <HeroVisual />
          <div className="relative z-10 mx-auto flex min-h-[710px] max-w-[1010px] flex-col items-center justify-center px-6 pb-[72px] pt-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mb-[53px] rounded-full border border-white/[0.16] bg-[#111111]/80 px-[19px] py-[8px] text-[11px] font-bold uppercase tracking-[0.13em] text-[#9A9A9A] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              Enterprise Payment Infrastructure
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 38, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.95, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[780px] text-[58px] font-bold leading-[0.98] tracking-[-0.055em] text-white sm:text-[82px] lg:text-[104px]"
            >
              Payment Orchestration Reimagined
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="mt-[52px] max-w-[720px] text-[18px] font-medium leading-[1.55] text-[#858585]"
            >
              Enterprise-grade payment infrastructure for brands managing agency
              workflows. Streamline invoice approval, fund payments, and track
              settlements in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, delay: 0.58, ease: [0.16, 1, 0.3, 1] }}
              className="mt-[35px] flex flex-col items-center gap-[15px] sm:flex-row"
            >
              <Link
                href="/auth/register"
                className="inline-flex h-[44px] w-[202px] items-center justify-center gap-[13px] rounded-[6px] bg-white text-[13px] font-bold text-black transition-colors hover:bg-[#E9E9E9]"
              >
                Start Now
                <ArrowRight className="h-[15px] w-[15px]" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-[44px] w-[202px] items-center justify-center rounded-[6px] border border-white/[0.32] bg-black/35 text-[13px] font-bold text-white transition-colors hover:bg-white/[0.06]"
              >
                Contact Sales
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.72, ease: [0.16, 1, 0.3, 1] }}
              className="mt-[40px] flex flex-wrap items-center justify-center gap-x-[45px] gap-y-4 text-[12px] font-semibold text-[#717171]"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-[14px] w-[14px]" />
                SOC 2 Compliant
              </span>
              <span className="flex items-center gap-2">
                <Lock className="h-[14px] w-[14px]" />
                Bank Level Security
              </span>
              <span className="flex items-center gap-2">
                <Globe2 className="h-[14px] w-[14px]" />
                Global Infrastructure
              </span>
            </motion.div>
          </div>
        </section>

        <section id="features" className="relative overflow-hidden border-b border-white/[0.08] bg-black px-6 py-[105px]">
          <CapabilityBackdrop />
          <div className="relative z-10 mx-auto max-w-[1380px]">
            <Reveal direction="zoom" className="mb-[64px] text-center">
              <p className="mb-[17px] text-[10px] font-bold uppercase tracking-[0.14em] text-[#575757]">
                Platform Capabilities
              </p>
              <h2 className="text-[39px] font-bold leading-tight tracking-[-0.045em] text-white sm:text-[52px]">
                Built for Finance Teams
              </h2>
              <p className="mt-[20px] text-[16px] font-medium text-[#747474] sm:text-[18px]">
                Every feature designed for operational excellence and financial control
              </p>
            </Reveal>

            <div className="grid grid-cols-1 gap-[38px] md:grid-cols-2 lg:grid-cols-3">
              {capabilityCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <Reveal
                    key={card.title}
                    direction={cardDirections[index]}
                    delay={(index % 3) * 0.08}
                  >
                  <article
                    className="min-h-[212px] rounded-[6px] border border-white/[0.26] bg-white/[0.12] p-[38px] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.05),0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-[22px] transition-colors hover:border-white/[0.45] hover:bg-white/[0.16]"
                  >
                    <div className="mb-[45px] flex h-[48px] w-[48px] items-center justify-center rounded-[5px] border border-white/[0.08] bg-white/[0.16] text-[#D2D2D2] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                      <Icon className="h-[22px] w-[22px]" />
                    </div>
                    <h3 className="mb-[17px] text-[17px] font-bold text-white">
                      {card.title}
                    </h3>
                    <p className="text-[14px] font-medium leading-[1.55] text-[#969696]">
                      {card.desc}
                    </p>
                  </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#111111] px-6 py-[118px]">
          <div className="mx-auto max-w-[1380px]">
            <Reveal direction="up" className="mb-[88px] text-center">
              <p className="mb-[20px] text-[10px] font-bold uppercase tracking-[0.14em] text-[#555555]">
                Workflow
              </p>
              <h2 className="text-[38px] font-bold leading-tight tracking-[-0.045em] text-white sm:text-[52px]">
                Streamlined Payment Operations
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-[72px]">
              {workflow.map((item, index) => (
                <Reveal key={item.number} direction={index % 2 === 0 ? "left" : "right"} delay={index * 0.07}>
                <article>
                  <div className="mb-[26px] text-[50px] font-bold leading-none tracking-[-0.035em] text-[#515151] sm:text-[68px]">
                    {item.number}
                  </div>
                  <h3 className="mb-[15px] text-[17px] font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="text-[14px] font-semibold leading-[1.55] text-[#7D7D7D]">
                    {item.desc}
                  </p>
                </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="security" className="border-b border-white/[0.08] bg-black px-6 py-[118px]">
          <div className="mx-auto grid max-w-[1380px] grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_650px]">
            <Reveal direction="left">
            <div>
              <p className="mb-[38px] text-[10px] font-bold uppercase tracking-[0.14em] text-[#626262]">
                Security & Compliance
              </p>
              <h2 className="max-w-[550px] text-[43px] font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-[58px]">
                Enterprise-Grade Protection
              </h2>
              <p className="mt-[22px] max-w-[580px] text-[17px] font-medium leading-[1.5] text-[#777777]">
                Built on bank-level infrastructure with comprehensive security
                controls, compliance certifications, and audit capabilities.
              </p>

              <div className="mt-[36px] space-y-[18px]">
                {securityItems.map((item) => (
                  <div key={item} className="flex items-center gap-[13px] text-[14px] font-semibold text-[#A7A7A7]">
                    <CheckCircle2 className="h-[17px] w-[17px] text-[#9D9D9D]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            </Reveal>

            <Reveal direction="right" delay={0.08}>
            <div className="flex aspect-[1.05] items-center justify-center rounded-[5px] border border-white/[0.18] bg-[#373737]">
              <Lock className="h-[142px] w-[142px] text-[#AFAFAF]" strokeWidth={1.55} />
            </div>
            </Reveal>
          </div>
        </section>

        <section id="pricing" className="border-b border-white/[0.08] bg-black px-6 py-[121px] text-center">
          <Reveal direction="zoom" className="mx-auto max-w-[850px]">
            <h2 className="text-[47px] font-bold leading-[1.04] tracking-[0.015em] text-white sm:text-[66px]">
              Ready to Transform Your Payment Operations?
            </h2>
            <p className="mt-[36px] text-[18px] font-medium text-[#777777]">
              Join enterprise brands using AgencyPay for payment orchestration
            </p>
            <div className="mt-[80px] flex flex-col justify-center gap-[17px] sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex h-[44px] w-[244px] items-center justify-center gap-[12px] rounded-[6px] bg-white text-[13px] font-bold text-black transition-colors hover:bg-[#E9E9E9]"
              >
                GET Start Now
                <ArrowRight className="h-[15px] w-[15px]" />
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex h-[44px] w-[244px] items-center justify-center rounded-[6px] border border-white/[0.35] text-[13px] font-bold text-white transition-colors hover:bg-white/[0.06]"
              >
                Schedule Demo
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function FullLogo() {
  return (
    <Link href="/" className="inline-flex items-center" aria-label="AgncyPay home">
      <img
        src="/agncypayLogo.png"
        alt="AgncyPay"
        className="h-[58px] w-[230px] object-contain object-left sm:h-[66px] sm:w-[260px]"
      />
    </Link>
  );
}

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
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.78, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HeroVisual() {
  return (
    <div aria-hidden className="absolute inset-0 z-0">
      <img
        src="/heroimage.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center opacity-100"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.04)_32%,rgba(0,0,0,0.06)_62%,rgba(0,0,0,0.48)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.34)_0%,rgba(0,0,0,0.08)_28%,rgba(0,0,0,0.04)_50%,rgba(0,0,0,0.1)_72%,rgba(0,0,0,0.34)_100%)]" />
    </div>
  );
}

function CapabilityBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-70">
      <div className="relative h-[760px] w-[760px] rotate-45 rounded-[42px] border border-white/[0.07] bg-[#101010]">
        <div className="absolute left-[160px] top-[160px] h-[440px] w-[440px] rounded-[34px] bg-[#A87019]/55 blur-[1px]" />
        <div className="absolute inset-[70px] rounded-[42px] border border-white/[0.09]" />
        <div className="absolute left-[-40px] top-[235px] h-[70px] w-[540px] rounded-full bg-white/[0.09]" />
        <div className="absolute bottom-[120px] right-[30px] h-[160px] w-[160px] rounded-[24px] border border-white/[0.08] bg-white/[0.03]" />
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="bg-black px-6 pb-[30px] pt-[78px]">
      <div className="mx-auto max-w-[1380px]">
        <div className="grid grid-cols-1 gap-12 border-b border-white/[0.08] pb-[62px] md:grid-cols-[1.15fr_1fr_1fr_1fr]">
          <div>
            <FullLogo />
            <p className="mt-[27px] max-w-[265px] text-[13px] font-medium leading-[1.55] text-[#797979]">
              Enterprise payment infrastructure for the agency ecosystem
            </p>
          </div>

          <FooterColumn
            title="Product"
            links={["Features", "Security", "Pricing", "Integrations"]}
          />
          <FooterColumn
            title="Company"
            links={["About", "Careers", "Contact", "Legal"]}
          />
          <FooterColumn
            title="Resources"
            links={["Documentation", "API Reference", "Support", "Status"]}
          />
        </div>

        <div className="flex flex-col justify-between gap-5 pt-[31px] text-[12px] font-medium text-[#696969] md:flex-row">
          <p>Copyright 2026 AgncyPay. All rights reserved.</p>
          <div className="flex gap-[45px]">
            <Link href="#" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h3 className="mb-[24px] text-[12px] font-bold uppercase tracking-[0.05em] text-[#B4B4B4]">
        {title}
      </h3>
      <ul className="space-y-[13px] text-[13px] font-medium text-[#777777]">
        {links.map((link) => (
          <li key={link}>
            <Link href="#" className="transition-colors hover:text-white">
              {link}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
