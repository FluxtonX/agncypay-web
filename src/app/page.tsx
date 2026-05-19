"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  FileText,
  Cpu,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { formatCurrency } from "../lib/formatCurrency";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Navbar */}
      <header className="h-24 border-b border-[#1F1F1F] px-6 md:px-12 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center cursor-pointer">
          <img src="/agncypayLogo.png" alt="AgncyPay" className="h-20 w-auto object-contain" />
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[#6B7280]">
          <span className="hover:text-white transition-colors cursor-pointer">Features</span>
          <span className="hover:text-white transition-colors cursor-pointer">Security</span>
          <span className="hover:text-white transition-colors cursor-pointer">Pricing</span>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm text-[#6B7280] hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-sm font-bold bg-white text-black rounded-lg hover:bg-[#E5E7EB] transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto w-full px-6 md:px-12 pt-20 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 text-[#22C55E] text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              Enterprise KYB Payments Platform
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.1] text-white">
              Secure Adidas invoice payments with AgncyPay
            </h1>

            <p className="text-[#6B7280] leading-relaxed max-w-lg">
              A verified brand payment platform for invoice management, business verification, and fast payment reconciliation — in compliance-audited rails.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link
                href="/auth/register"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold rounded-lg hover:bg-[#E5E7EB] transition-colors"
              >
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-[#1F1F1F] text-sm font-semibold rounded-lg text-[#9CA3AF] hover:bg-[#111] hover:text-white transition-colors"
              >
                View Demo
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 pt-4 text-xs text-[#4B5563]">
              {["256-bit AES encrypted", "KYB compliant", "SOC 2 ready"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right - Invoice preview card */}
          <div className="rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] overflow-hidden shadow-2xl">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F1F1F]">
              <div>
                <p className="text-sm font-bold">Recent Payouts</p>
                <p className="text-[11px] text-[#4B5563]">Your latest account activity.</p>
              </div>
              <button className="px-3 py-1.5 text-xs border border-[#1F1F1F] rounded-lg text-[#6B7280] bg-[#111] hover:bg-[#1A1A1A] transition-colors cursor-pointer">
                View All
              </button>
            </div>

            {/* Payout rows */}
            {[
              { brand: "Adidas AG", campaign: "Q2 Ecomm Campaign", date: "Today, 10:24 AM", amount: formatCurrency(2450) },
              { brand: "Adidas AG", campaign: "S/S Global Web", date: "Yesterday", amount: formatCurrency(1850) },
              { brand: "Adidas AG", campaign: "Ad Domestic Socials", date: "May 17", amount: formatCurrency(4720) },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-[#111] hover:bg-[#111] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-[#111] border border-[#1F1F1F] flex items-center justify-center text-[9px] font-bold shrink-0">
                    三
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{row.brand}</p>
                    <p className="text-[10px] text-[#4B5563]">{row.campaign}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{row.amount}</p>
                  <p className="text-[10px] text-[#4B5563]">{row.date}</p>
                </div>
              </div>
            ))}

            {/* Invoice table preview */}
            <div className="border-t border-[#1F1F1F]">
              <div className="px-5 py-3 flex justify-between items-center">
                <p className="text-xs text-[#4B5563] font-semibold uppercase tracking-wider">Invoices</p>
              </div>
              {[
                { id: "INV-AD-1001", status: "Done", amount: formatCurrency(2450), client: "Adidas AG" },
                { id: "INV-AD-1002", status: "Done", amount: formatCurrency(1850), client: "Adidas AG" },
                { id: "INV-AD-1003", status: "Pending", amount: formatCurrency(4720), client: "Adidas AG" },
              ].map((row, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-2.5 border-b border-[#111] text-xs hover:bg-[#111] transition-colors">
                  <span className="font-mono text-[#6B7280] text-[11px]">{row.id}</span>
                  <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${row.status === "Done" ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#F59E0B]/10 text-[#F59E0B]"}`}>
                    <span className={`h-1 w-1 rounded-full ${row.status === "Done" ? "bg-[#22C55E]" : "bg-[#F59E0B]"}`} />
                    {row.status}
                  </span>
                  <span className="font-bold">{row.amount}</span>
                  <span className="text-[#6B7280]">{row.client}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-[#1F1F1F] bg-[#0D0D0D] py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight">Enterprise Grade Brand Payments</h2>
            <p className="text-sm text-[#6B7280] mt-3 leading-relaxed">
              Specialized payment reconciliation pipelines combining compliance reviews with real-time settlement rails.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, color: "#10B981", title: "Verified Brand Accounts", desc: "Prevents identity spoofing by locking accounts to validated trademark registrants." },
              { icon: Cpu, color: "#10B981", title: "KYB/KYC Verification", desc: "Compliance validation of business registrations, VAT letters, and executive credentials." },
              { icon: Lock, color: "#10B981", title: "Secure Document Vault", desc: "AES-256 encrypted document custody vaults protecting treasury details." },
              { icon: FileText, color: "#10B981", title: "Invoice Management", desc: "Seamless ingestion of active corporate sportswear supplier invoices." },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 space-y-3 hover:border-[#2A2A2A] transition-colors">
                  <div className="h-9 w-9 rounded-lg border border-[#1F1F1F] flex items-center justify-center" style={{ background: `${feat.color}15` }}>
                    <Icon className="h-4.5 w-4.5" style={{ color: feat.color }} />
                  </div>
                  <h3 className="text-sm font-bold">{feat.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Seamless Onboarding Flow</h2>
          <p className="text-sm text-[#6B7280] mt-3">Five steps to unlock global corporate invoice settlements.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: "01", title: "Create Account", text: "Submit corporate email and verify credentials." },
            { step: "02", title: "KYB Document Upload", text: "Provide company registry certificates and representative IDs." },
            { step: "03", title: "Unlock Invoices", text: "Automatic sync of active Adidas supplier invoices." },
            { step: "04", title: "Pay with AgncyPay", text: "Settle invoices using secure ACH corporate lines." },
            { step: "05", title: "Bookkeeping Audit", text: "Generate receipts and sync transaction history." },
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-[#1F1F1F] bg-[#0D0D0D] p-5 space-y-3">
              <span className="text-2xl font-black text-[#2A2A2A]">{item.step}</span>
              <h4 className="font-bold text-sm">{item.title}</h4>
              <p className="text-xs text-[#6B7280] leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security stats */}
      <section className="border-y border-[#1F1F1F] bg-[#0D0D0D] py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1F1F1F] bg-[#111] text-[#6B7280] text-xs font-semibold">
              <Lock className="h-3 w-3" /> Military Grade Security
            </div>
            <h2 className="text-3xl font-black tracking-tight">Compliance-First Treasury Security</h2>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              We process secure corporate payments under KYC/KYB regulatory requirements. Your details are encrypted end-to-end and stored in offline vaults.
            </p>
            <div className="space-y-3 text-sm text-[#6B7280]">
              {[
                "256-bit AES database encryption at rest",
                "Official email domains validated via security codes",
                "Manual review steps for enterprise corporate registries",
                "Automated transaction receipts for auditing records",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Verified Accounts", value: "100%" },
              { label: "Encrypted Storage", value: "256-bit" },
              { label: "Manual Auditing", value: "100%" },
              { label: "ACH Matching", value: "Instant" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-[#1F1F1F] bg-[#0A0A0A] p-5 text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-[#4B5563] mt-1 font-semibold uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="rounded-2xl border border-[#1F1F1F] bg-[#0D0D0D] p-10 md:p-16 text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight">
            Start verifying your business with AgncyPay
          </h2>
          <p className="text-[#6B7280] max-w-md mx-auto leading-relaxed">
            Verify corporate identity and settle vendor invoices in compliance-backed rails.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold rounded-lg hover:bg-[#E5E7EB] transition-colors"
            >
              Register Account <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[#1F1F1F] text-sm font-semibold rounded-lg text-[#9CA3AF] hover:bg-[#111] hover:text-white transition-colors"
            >
              View Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1F1F1F] py-8 text-center text-xs text-[#4B5563]">
        © {new Date().getFullYear()} AgncyPay Solutions, Inc. All rights reserved. 256-bit AES compliance certified.
      </footer>
    </div>
  );
}
