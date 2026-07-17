"use client";

import React from "react";
import Link from "next/link";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  FileText,
  Network,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { WorkspaceType } from "../../types/workspace";
import { cn } from "../../lib/utils";

type OverviewMetric = {
  title: string;
  value: string;
  detail: string;
};

type WorkItem = {
  title: string;
  detail: string;
  amount: string;
  status: string;
};

const overviewData: Record<Exclude<WorkspaceType, "brand">, {
  title: string;
  subtitle: string;
  metrics: OverviewMetric[];
  actions: { label: string; href: string; icon: React.ReactNode }[];
  work: WorkItem[];
  readiness: { label: string; done: boolean }[];
}> = {
  agency: {
    title: "Agency Dashboard",
    subtitle: "Manage talent payouts, client invoices, split rules, and settlement operations.",
    metrics: [
      { title: "Open Client Invoices", value: "$186K", detail: "14 invoices awaiting action" },
      { title: "Talent Payout Queue", value: "$74K", detail: "31 payouts scheduled" },
      { title: "Active Talent", value: "128", detail: "9 pending onboarding" },
      { title: "Split Accuracy", value: "99.1%", detail: "Auto-reconciled this month" },
    ],
    actions: [
      { label: "Add Talent", href: "/dashboard/talent", icon: <UsersRound className="h-4 w-4" /> },
      { label: "Configure Splits", href: "/dashboard/splits", icon: <Network className="h-4 w-4" /> },
      { label: "Review Payouts", href: "/dashboard/payouts", icon: <BadgeDollarSign className="h-4 w-4" /> },
    ],
    work: [
      { title: "Creative Co campaign invoice", detail: "Client invoice ready for review", amount: "$32,400", status: "Ready" },
      { title: "June creator payout batch", detail: "31 talent recipients", amount: "$74,120", status: "Scheduled" },
      { title: "Brand Studio split exception", detail: "Needs manager approval", amount: "$4,900", status: "Review" },
    ],
    readiness: [
      { label: "Agency KYB submitted", done: true },
      { label: "Payout bank connected", done: true },
      { label: "Talent roster imported", done: false },
      { label: "Split templates configured", done: false },
    ],
  },
  talent_independent: {
    title: "Talent Dashboard",
    subtitle: "Track invoices, payouts, tax profile readiness, and direct payment history.",
    metrics: [
      { title: "Available Payouts", value: "$12.8K", detail: "2 payouts ready" },
      { title: "Open Invoices", value: "$8.4K", detail: "3 client invoices" },
      { title: "YTD Earnings", value: "$96K", detail: "+18% vs last quarter" },
      { title: "Payout Method", value: "Active", detail: "ACH verified" },
    ],
    actions: [
      { label: "Create Invoice", href: "/dashboard/invoices", icon: <FileText className="h-4 w-4" /> },
      { label: "Payout Settings", href: "/dashboard/wallet", icon: <BadgeDollarSign className="h-4 w-4" /> },
      { label: "Profile", href: "/dashboard/profile", icon: <ShieldCheck className="h-4 w-4" /> },
    ],
    work: [
      { title: "Netflix content package", detail: "Invoice draft", amount: "$5,600", status: "Draft" },
      { title: "Sony social campaign", detail: "Payment expected May 28", amount: "$3,200", status: "Pending" },
      { title: "Brand Studio payout", detail: "ACH settlement complete", amount: "$4,000", status: "Paid" },
    ],
    readiness: [
      { label: "Identity verified", done: true },
      { label: "Payout bank connected", done: true },
      { label: "Tax profile completed", done: false },
      { label: "Invoice template configured", done: false },
    ],
  },
  talent_agency: {
    title: "Agency Talent Dashboard",
    subtitle: "View assigned invoices, payout status, and agency-linked payment settings.",
    metrics: [
      { title: "Assigned Payouts", value: "$9.2K", detail: "Agency-managed" },
      { title: "Upcoming Payments", value: "4", detail: "Next: May 28" },
      { title: "Completed Work", value: "18", detail: "This quarter" },
      { title: "Profile Status", value: "KYC", detail: "Tax profile pending" },
    ],
    actions: [
      { label: "View Payouts", href: "/dashboard/payouts", icon: <BadgeDollarSign className="h-4 w-4" /> },
      { label: "Assigned Invoices", href: "/dashboard/invoices", icon: <FileText className="h-4 w-4" /> },
      { label: "Payout Settings", href: "/dashboard/wallet", icon: <ShieldCheck className="h-4 w-4" /> },
    ],
    work: [
      { title: "Q2 launch content", detail: "Attached to agency invoice INV-2845", amount: "$3,400", status: "Approved" },
      { title: "Studio day rate", detail: "Waiting on brand approval", amount: "$1,800", status: "Pending" },
      { title: "Usage extension", detail: "Paid through agency", amount: "$4,000", status: "Paid" },
    ],
    readiness: [
      { label: "Agency relationship active", done: true },
      { label: "Identity verified", done: true },
      { label: "Payout method verified", done: false },
      { label: "Tax form submitted", done: false },
    ],
  },
  mother_agency: {
    title: "Mother Agency Dashboard",
    subtitle: "Oversee child agencies, vendors, treasury exposure, and consolidated payout operations.",
    metrics: [
      { title: "Network GMV", value: "$8.7M", detail: "Across 18 child agencies" },
      { title: "Treasury Exposure", value: "$1.2M", detail: "5 batches awaiting release" },
      { title: "Child Agencies", value: "18", detail: "3 onboarding" },
      { title: "Payout SLA", value: "97.8%", detail: "Within target window" },
    ],
    actions: [
      { label: "Child Agencies", href: "/dashboard/agencies", icon: <BriefcaseBusiness className="h-4 w-4" /> },
      { label: "Treasury", href: "/dashboard/treasury", icon: <BadgeDollarSign className="h-4 w-4" /> },
      { label: "Reports", href: "/dashboard/reports", icon: <FileText className="h-4 w-4" /> },
    ],
    work: [
      { title: "West Coast agency batch", detail: "Treasury release pending", amount: "$420K", status: "Approval" },
      { title: "Vendor onboarding review", detail: "12 vendors need documents", amount: "12", status: "Action" },
      { title: "Regional payout report", detail: "Ready for export", amount: "$2.4M", status: "Ready" },
    ],
    readiness: [
      { label: "Enterprise KYB approved", done: true },
      { label: "Treasury controls configured", done: true },
      { label: "Child agency hierarchy imported", done: false },
      { label: "Regional approval matrix complete", done: false },
    ],
  },
};

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[13px] border border-[#676767] bg-black", className)}>
      {children}
    </section>
  );
}

export function RoleDashboardOverview({ workspaceType }: { workspaceType: Exclude<WorkspaceType, "brand"> }) {
  const data = overviewData[workspaceType];

  return (
    <div className="w-full max-w-[1048px]">
      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">
          {data.title}
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#939393]">
          {data.subtitle}
        </p>
      </div>

      <div className="mt-[32px] grid grid-cols-1 gap-[20px] md:grid-cols-2 xl:grid-cols-4 xl:gap-[29px]">
        {data.metrics.map((metric) => (
          <Panel key={metric.title} className="flex min-h-[178px] flex-col justify-between px-4 py-[23px]">
            <div>
              <h2 className="text-[18px] font-normal leading-6 text-[#7d7d7d]">
                {metric.title}
              </h2>
              <p className="mt-[22px] break-words text-[33px] font-semibold leading-tight text-white">
                {metric.value}
              </p>
            </div>
            <p className="mt-5 text-[15px] leading-5 text-[#949494]">
              {metric.detail}
            </p>
          </Panel>
        ))}
      </div>

      <div className="mt-[29px] grid grid-cols-1 gap-[29px] xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Panel className="px-[25px] py-[29px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-[29px] font-semibold leading-none text-white">
                Priority Work
              </h2>
              <p className="mt-[14px] text-[17px] leading-6 text-[#777]">
                Operational items that need attention.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.actions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="inline-flex h-9 items-center gap-2 rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[14px] font-semibold text-white transition-colors hover:border-[#777]"
                >
                  {action.icon}
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-[28px] space-y-3">
            {data.work.map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-4 rounded-[8px] border border-[#303030] bg-[#050505] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-[18px] font-semibold leading-6 text-white">
                    {item.title}
                  </p>
                  <p className="mt-1 text-[14px] leading-5 text-[#858585]">
                    {item.detail}
                  </p>
                </div>
                <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                  <p className="text-[18px] font-semibold leading-none text-white">
                    {item.amount}
                  </p>
                  <span className="inline-flex h-7 items-center rounded-[7px] border border-[#444] bg-[#111] px-3 text-[13px] font-semibold text-[#d7d7d7]">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="px-[25px] py-[29px]">
          <h2 className="text-[29px] font-semibold leading-none text-white">
            Workspace Readiness
          </h2>
          <p className="mt-[14px] text-[17px] leading-6 text-[#777]">
            Verification and operating setup.
          </p>

          <div className="mt-[28px] space-y-4">
            {data.readiness.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                    item.done ? "border-white bg-white text-black" : "border-[#444] text-[#777]"
                  )}
                >
                  {item.done ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
                </span>
                <p className="text-[16px] font-semibold leading-5 text-white">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
