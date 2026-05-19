"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Zap,
  BarChart3,
  Users,
  Network
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      {/* Header */}
      <header className="h-20 border-b border-[#1F1F1F] px-6 md:px-12 flex items-center justify-between w-full">
        <Link href="/" className="flex items-center cursor-pointer">
          <img src="/agncypayLogo.png" alt="Agncy" className="h-16 md:h-20 w-auto object-contain mix-blend-lighten" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-[#A1A1AA] font-medium">
          <span className="hover:text-white transition-colors cursor-pointer">Product</span>
          <span className="hover:text-white transition-colors cursor-pointer">Security</span>
          <span className="hover:text-white transition-colors cursor-pointer">Pricing</span>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="text-sm font-medium text-[#A1A1AA] hover:text-white transition-colors">
            Log in
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-sm font-bold bg-white text-black rounded-md hover:bg-[#E5E7EB] transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="w-full px-6 md:px-12 pt-24 pb-32 flex flex-col items-center text-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-30">
           <div className="w-[800px] h-[500px] border border-[#333] rounded-3xl transform rotate-12 absolute blur-[2px]"></div>
           <div className="w-[800px] h-[500px] border border-[#444] rounded-3xl transform -rotate-6 absolute blur-[1px]"></div>
           <div className="w-[600px] h-[350px] bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 rounded-3xl transform rotate-3 absolute blur-xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#333] bg-[#111] text-[#A1A1AA] text-xs font-semibold tracking-wider">
            ENTERPRISE PAYMENTS FOR BRANDS
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white">
            Payment<br />Orchestration<br />Reimagined
          </h1>

          <p className="text-[#A1A1AA] text-lg leading-relaxed max-w-2xl mx-auto">
            Enterprise-grade payment infrastructure for brands managing agency workflows. Streamline invoice approval, track payments, and track settlements in real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold rounded-md hover:bg-[#E5E7EB] transition-colors"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-[#333] text-sm font-semibold rounded-md text-white hover:bg-[#1A1A1A] transition-colors"
            >
              Contact Sales
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 pt-12 text-sm text-[#A1A1AA]">
            {[
              { icon: ShieldCheck, text: "SOC 2 Compliant" },
              { icon: CheckCircle2, text: "Audit-ready" },
              { icon: Lock, text: "Bank-level security" }
            ].map((badge, i) => (
              <span key={i} className="flex items-center gap-2 font-medium">
                <badge.icon className="h-4 w-4 text-[#A1A1AA]" />
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Capabilities */}
      <section className="w-full px-6 md:px-12 py-24 bg-[#0D0D0D] border-t border-[#1F1F1F]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-xs font-semibold tracking-widest text-[#6B7280] uppercase">Platform Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Built for Finance Teams</h2>
            <p className="text-[#A1A1AA]">Every feature designed for operational excellence and financial control.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Instant Settlements", desc: "Real-time payment processing and management settlement tracking across your entire payment network." },
              { icon: BarChart3, title: "Operational Analytics", desc: "Executive-grade dashboards with deep visibility into payment flows, spend allocation, and metrics." },
              { icon: Users, title: "Multi-Agency Management", desc: "Centralized platform to manage relationships, invoices, and payments across all your agency partners." },
              { icon: ShieldCheck, title: "Compliance First", desc: "Built-in KYC/AML and FinCEN screening to ensure complete compliance for every transaction." },
              { icon: Lock, title: "Bank-Grade Security", desc: "End-to-end encryption, role-based access control, and SOC 2 Type II certified infrastructure." },
              { icon: Network, title: "CRM Integration", desc: "Seamless integration with your existing systems, trackers, and flows automatically into AgencyPay." },
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="rounded-xl border border-[#1F1F1F] bg-[#111] p-8 space-y-4 hover:border-[#333] transition-colors group">
                  <div className="h-10 w-10 rounded-lg border border-[#333] bg-[#1A1A1A] flex items-center justify-center group-hover:bg-[#222] transition-colors">
                    <Icon className="h-5 w-5 text-[#E5E7EB]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#E5E7EB]">{feat.title}</h3>
                  <p className="text-sm text-[#A1A1AA] leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="w-full px-6 md:px-12 py-24 bg-[#0A0A0A]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <p className="text-xs font-semibold tracking-widest text-[#6B7280] uppercase">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Streamlined Payment Operations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { num: "01", title: "CRM Integration", desc: "Invoice data flows automatically from your existing systems." },
              { num: "02", title: "Review & Approve", desc: "Finance teams review and approve invoices in one platform." },
              { num: "03", title: "Fund & Execute", desc: "Review, allocate funds and execute approved payments." },
              { num: "04", title: "Track & Audit", desc: "Monitor settlements with complete audit trails." },
            ].map((step, i) => (
              <div key={i} className="space-y-4">
                <div className="text-4xl font-light text-[#333]">{step.num}</div>
                <h4 className="text-lg font-bold text-[#E5E7EB]">{step.title}</h4>
                <p className="text-sm text-[#A1A1AA] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="w-full px-6 md:px-12 py-24 bg-[#0D0D0D] border-t border-[#1F1F1F]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold tracking-widest text-[#6B7280] uppercase">Built for Enterprise</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Enterprise-Grade Protection</h2>
              <p className="text-[#A1A1AA] leading-relaxed max-w-md">
                Built on bank-grade infrastructure with comprehensive security controls, compliance certifications, and audit capabilities.
              </p>
            </div>

            <div className="space-y-4 text-sm text-[#A1A1AA]">
              {[
                "SOC 2 Type II Certified",
                "End-to-end encryption (AES-256)",
                "Multi-factor authentication",
                "Role-based access control",
                "Complete audit trails",
                "PCI DSS compliant infrastructure"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-square md:aspect-video lg:aspect-square bg-[#111] rounded-2xl border border-[#1F1F1F] flex items-center justify-center">
            <Lock className="h-24 w-24 text-[#333]" strokeWidth={1} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full px-6 md:px-12 py-32 bg-[#0A0A0A] border-t border-[#1F1F1F]">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Ready to Transform<br />Your Payment Operations?
          </h2>
          <p className="text-[#A1A1AA] text-lg">
            Join enterprise brands using AgencyPay for payment orchestration.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/auth/register"
              className="flex items-center justify-center gap-2 px-8 py-3 bg-white text-black text-sm font-bold rounded-md hover:bg-[#E5E7EB] transition-colors"
            >
              Get Started Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center px-8 py-3 border border-[#333] text-sm font-semibold rounded-md text-white hover:bg-[#1A1A1A] transition-colors"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#000] border-t border-[#1F1F1F] pt-16 pb-8 px-6 md:px-12">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="space-y-4">
            <img src="/agncypayLogo.png" alt="Agncy" className="h-12 md:h-16 w-auto object-contain opacity-80 mix-blend-lighten" />
            <p className="text-[#6B7280] text-xs leading-relaxed max-w-xs">
              Enterprise payment infrastructure for the modern agency stack.
            </p>
          </div>
          
          <div>
            <h4 className="text-[#E5E7EB] text-xs font-bold tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-3 text-[#6B7280] text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#E5E7EB] text-xs font-bold tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-3 text-[#6B7280] text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Legal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#E5E7EB] text-xs font-bold tracking-wider uppercase mb-4">Resources</h4>
            <ul className="space-y-3 text-[#6B7280] text-sm">
              <li><Link href="#" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Status</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-[#1F1F1F] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#6B7280] text-xs">
            © {new Date().getFullYear()} AgencyPay. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-[#6B7280]">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
