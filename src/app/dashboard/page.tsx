import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock3,
  FileText,
  Info,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../lib/utils";

const stats = [
  {
    title: "Total Payment Volume",
    value: "$2.39M",
    detail: "+12.5% vs last month",
    icon: TrendingUp,
  },
  {
    title: "Pending Approvals",
    value: "23",
    detail: "$487.2K total value",
    icon: Clock3,
  },
  {
    title: "Monthly Spend",
    value: "$623K",
    detail: "+20.3% from May",
    icon: ArrowUpRight,
  },
  {
    title: "Settlement Status",
    value: "98.2%",
    detail: "156 of 159 Settled",
    icon: ArrowUpRight,
  },
];

const agencies = [
  { initials: "CC", name: "Creative Co", invoices: "22 invoices", amount: "$125K", share: "20.1% of total" },
  { initials: "MP", name: "Marketing Pro", invoices: "9 invoices", amount: "$54K", share: "8.7% of total" },
  { initials: "DA", name: "Digital Agency", invoices: "20 invoices", amount: "$87K", share: "14.0% of total" },
  { initials: "BS", name: "Brand Studio", invoices: "9 invoices", amount: "$76K", share: "12.2% of total" },
  { initials: "MP", name: "Marketing Pro", invoices: "9 invoices", amount: "$54K", share: "8.7% of total" },
  { initials: "MP", name: "Media Partners", invoices: "16 invoices", amount: "$98K", share: "15.7% of total" },
  { initials: "MP", name: "Marketing Pro", invoices: "9 invoices", amount: "$54K", share: "8.7% of total" },
];

const recentInvoices = [
  { id: "INV-2845", agency: "Creative Co", due: "Due 22/05/2026", amount: "$24,500", status: "Pending" },
  { id: "INV-2844", agency: "Media Partners", due: "Due 21/05/2026", amount: "$18,200", status: "Approved" },
  { id: "INV-2843", agency: "Digital Agency", due: "Due 20/05/2026", amount: "$32,100", status: "Processing" },
  { id: "INV-2842", agency: "Brand Studio", due: "Due 19/05/2026", amount: "$15,800", status: "Paid" },
];

function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[13px] border border-[#676767] bg-black", className)}>
      {children}
    </section>
  );
}

function PaymentTrendChart() {
  return (
    <svg className="mt-[34px] h-[310px] w-full" viewBox="0 0 430 310" role="img" aria-label="Payment volume trend chart">
      <defs>
        <linearGradient id="volumeFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3, 4].map((line) => {
        const y = 18 + line * 72;
        return <line key={`h-${line}`} x1="92" x2="410" y1={y} y2={y} stroke="#151515" strokeDasharray="4 4" />;
      })}
      {[0, 1, 2, 3, 4, 5].map((line) => {
        const x = 92 + line * 63.6;
        return <line key={`v-${line}`} x1={x} x2={x} y1="18" y2="288" stroke="#151515" strokeDasharray="4 4" />;
      })}

      <line x1="92" x2="410" y1="18" y2="288" stroke="#5d5d5d" />
      <line x1="92" x2="410" y1="288" y2="288" stroke="#5d5d5d" />

      {[
        ["800000", 22],
        ["600000", 94],
        ["400000", 166],
        ["200000", 238],
        ["0", 292],
      ].map(([label, y]) => (
        <text key={label} x="84" y={Number(y)} fill="#555" fontSize="15" textAnchor="end">
          {label}
        </text>
      ))}

      {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, idx) => (
        <text key={month} x={92 + idx * 63.6} y="308" fill="#555" fontSize="15" textAnchor="middle">
          {month}
        </text>
      ))}

      <path
        d="M92 203 C113 191 130 181 156 178 C184 176 205 192 225 182 C247 171 257 148 284 132 C326 106 369 77 410 60 L410 288 L92 288 Z"
        fill="url(#volumeFill)"
      />
      <path
        d="M92 203 C113 191 130 181 156 178 C184 176 205 192 225 182 C247 171 257 148 284 132 C326 106 369 77 410 60"
        fill="none"
        stroke="#f5f5f5"
        strokeLinecap="round"
        strokeWidth="2.7"
      />
    </svg>
  );
}

function InvoiceStatusChart() {
  const bars = [
    { x: 34, h: 108 },
    { x: 84, h: 72 },
    { x: 134, h: 136 },
    { x: 184, h: 90 },
    { x: 234, h: 164 },
    { x: 284, h: 46 },
    { x: 334, h: 26 },
  ];

  return (
    <svg className="mt-[34px] h-[310px] w-full" viewBox="0 0 430 310" role="img" aria-label="Invoice status overview chart">
      {[0, 1, 2, 3, 4].map((line) => {
        const y = 18 + line * 72;
        return <line key={`h-${line}`} x1="78" x2="410" y1={y} y2={y} stroke="#151515" strokeDasharray="4 4" />;
      })}
      {[0, 1, 2, 3, 4, 5, 6].map((line) => {
        const x = 104 + line * 47.5;
        return <line key={`v-${line}`} x1={x} x2={x} y1="18" y2="288" stroke="#151515" strokeDasharray="4 4" />;
      })}

      <line x1="78" x2="410" y1="18" y2="288" stroke="#5d5d5d" />
      <line x1="78" x2="410" y1="288" y2="288" stroke="#5d5d5d" />

      {[
        ["32", 24],
        ["24", 96],
        ["16", 168],
        ["8", 240],
        ["0", 292],
      ].map(([label, y]) => (
        <text key={label} x="70" y={Number(y)} fill="#555" fontSize="15" textAnchor="end">
          {label}
        </text>
      ))}

      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
        <text key={day} x={104 + idx * 47.5} y="308" fill="#555" fontSize="15" textAnchor="middle">
          {day}
        </text>
      ))}

      {bars.map((bar) => (
        <rect
          key={bar.x}
          x={bar.x + 58}
          y={288 - bar.h}
          width="10"
          height={bar.h}
          rx="5"
          fill="#2b2b2b"
        />
      ))}
    </svg>
  );
}

export default function DashboardOverviewPage() {
  return (
    <div className="max-w-[1048px]">
      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">
          Dashboard
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#939393]">
          Monitor your payment operations and financial metrics
        </p>
      </div>

      <div className="mt-[32px] grid grid-cols-1 gap-[29px] md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Panel key={stat.title} className="flex h-[215px] flex-col justify-between px-4 py-[25px]">
              <div>
                <h2 className="text-[20px] font-normal leading-6 text-[#7d7d7d]">
                  {stat.title}
                </h2>
                <p className="mt-[26px] text-[36px] font-semibold leading-none text-white">
                  {stat.value}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[17px] leading-5 text-[#949494]">
                <Icon className="h-5 w-5 stroke-[1.8]" />
                <span>{stat.detail}</span>
              </div>
            </Panel>
          );
        })}
      </div>

      <div className="mt-[29px] grid grid-cols-1 gap-[29px] xl:grid-cols-2">
        <Panel className="h-[501px] px-5 py-[31px]">
          <h2 className="text-[29px] font-semibold leading-none text-white">
            Payment Volume Trend
          </h2>
          <p className="mt-[14px] text-[21px] leading-6 text-[#777]">
            6-month payment volume history
          </p>
          <PaymentTrendChart />
        </Panel>

        <Panel className="h-[501px] px-5 py-[31px]">
          <h2 className="text-[29px] font-semibold leading-none text-white">
            Invoice Status Overview
          </h2>
          <p className="mt-[14px] text-[21px] leading-6 text-[#777]">
            7-day invoice processing activity
          </p>
          <InvoiceStatusChart />
        </Panel>
      </div>

      <div className="mt-[29px] grid grid-cols-1 gap-[29px] xl:grid-cols-2">
        <Panel className="h-[735px] px-[29px] py-[31px]">
          <h2 className="text-[29px] font-semibold leading-none text-white">
            Top Agencies by Spend
          </h2>
          <p className="mt-[14px] text-[20px] leading-6 text-[#777]">
            Current month agency allocation
          </p>

          <div className="mt-[37px] space-y-[25px]">
            {agencies.map((agency, index) => (
              <div key={`${agency.name}-${index}`} className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-[49px] w-[49px] shrink-0 items-center justify-center rounded-[8px] border border-[#252525] bg-[#101010] text-[15px] font-semibold text-white">
                    {agency.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[21px] font-semibold leading-6 text-white">
                      {agency.name}
                    </p>
                    <p className="mt-[4px] text-[16px] leading-5 text-[#777]">
                      {agency.invoices}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[20px] font-semibold leading-6 text-white">
                    {agency.amount}
                  </p>
                  <p className="mt-[8px] text-[15px] leading-5 text-[#777]">
                    {agency.share}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="h-[735px] px-[29px] py-[31px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-[29px] font-semibold leading-none text-white">
                Recent Invoices
              </h2>
              <p className="mt-[14px] text-[20px] leading-6 text-[#777]">
                Latest invoice activity
              </p>
            </div>
            <Link
              href="/dashboard/invoices"
              className="mt-[5px] rounded-[8px] border border-[#3a3a3a] px-[13px] py-[8px] text-[16px] leading-none text-[#b8b8b8] transition-colors hover:border-[#666] hover:text-white"
            >
              View All
            </Link>
          </div>

          <div className="mt-[32px] space-y-[15px]">
            {recentInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="rounded-[7px] border border-[#666] px-[20px] pb-[19px] pt-[17px]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-[13px]">
                    <FileText className="h-[19px] w-[19px] text-[#8d8d8d]" />
                    <p className="font-mono text-[17px] leading-5 text-white">
                      {invoice.id}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "rounded-[5px] border border-[#555] bg-[#242424] px-[9px] py-[5px] text-[15px] font-semibold leading-none text-[#d7d7d7]",
                      invoice.status === "Paid" && "border-[#9b9b9b]"
                    )}
                  >
                    {invoice.status}
                  </span>
                </div>

                <div className="mt-[18px] flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[17px] leading-5 text-[#a0a0a0]">{invoice.agency}</p>
                    <p className="mt-[18px] text-[14px] leading-4 text-[#747474]">{invoice.due}</p>
                  </div>
                  <p className="text-[17px] font-semibold leading-5 text-white">{invoice.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-[29px] flex min-h-[135px] items-center px-[32px] py-[28px]">
        <div className="flex items-start gap-[14px]">
          <Info className="mt-[3px] h-[22px] w-[22px] text-[#aaa]" />
          <div>
            <h2 className="text-[31px] font-semibold leading-9 text-white">
              Action Required
            </h2>
            <p className="mt-[10px] text-[17px] leading-6 text-[#a1a1a1]">
              You have <span className="font-semibold text-white">23 pending invoices</span> requiring approval totaling{" "}
              <span className="font-semibold text-white">$487,200</span>. Review now
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}
