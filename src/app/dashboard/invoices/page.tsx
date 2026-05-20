"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Download,
  FileText,
  Filter,
  MoreHorizontal,
  Search,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../../lib/utils";

const metricCards = [
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

const invoices = [
  {
    id: "INV-2845",
    agency: "Creative Co",
    campaign: "Q2 Brand Campaign",
    amount: "$24,500",
    fees: "$245",
    status: "Pending",
    due: "22/05/2026",
  },
  {
    id: "INV-2844",
    agency: "Media Partners",
    campaign: "Digital Ads May",
    amount: "$18,200",
    fees: "$182",
    status: "Approved",
    due: "21/05/2026",
  },
  {
    id: "INV-2843",
    agency: "Digital Agency",
    campaign: "Social Media Management",
    amount: "$32,100",
    fees: "$321",
    status: "Processing",
    due: "20/05/2026",
  },
  {
    id: "INV-2842",
    agency: "Brand Studio",
    campaign: "Creative Services",
    amount: "$15,800",
    fees: "$158",
    status: "Paid",
    due: "19/05/2026",
  },
  {
    id: "INV-2841",
    agency: "Marketing Pro",
    campaign: "Email Campaign",
    amount: "$8,900",
    fees: "$89",
    status: "Paid",
    due: "18/05/2026",
  },
  {
    id: "INV-2840",
    agency: "Creative Co",
    campaign: "Video Production",
    amount: "$45,000",
    fees: "$450",
    status: "Pending",
    due: "17/05/2026",
  },
  {
    id: "INV-2839",
    agency: "Digital Agency",
    campaign: "SEO Services",
    amount: "$12,400",
    fees: "$124",
    status: "Approved",
    due: "16/05/2026",
  },
  {
    id: "INV-2838",
    agency: "Media Partners",
    campaign: "Influencer Campaign",
    amount: "$28,700",
    fees: "$287",
    status: "Processing",
    due: "15/05/2026",
  },
  {
    id: "INV-2837",
    agency: "Brand Studio",
    campaign: "Print Advertising",
    amount: "$19,200",
    fees: "$192",
    status: "Paid",
    due: "14/05/2026",
  },
  {
    id: "INV-2836",
    agency: "Marketing Pro",
    campaign: "Content Marketing",
    amount: "$14,300",
    fees: "$143",
    status: "Failed",
    due: "13/05/2026",
  },
];

const filterOptions = ["All Invoices", "Pending", "Approved", "Processing", "Paid", "Failed"] as const;

type InvoiceFilter = (typeof filterOptions)[number];

function MetricPanel({
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

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[28px] items-center rounded-[7px] border px-[11px] text-[15px] font-medium leading-none",
        status === "Approved" && "border-[#5b5b5b] bg-[#101010] text-white",
        status === "Paid" && "border-[#e4e4e4] bg-[#8b8b8b] text-black",
        status !== "Approved" &&
          status !== "Paid" &&
          "border-[#323232] bg-[#1d1d1d] text-[#c7c7c7]"
      )}
    >
      {status}
    </span>
  );
}

export default function InvoicesPortalPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InvoiceFilter>("All Invoices");

  const statusCards = useMemo(
    () => [
      {
        label: "Pending Approval",
        value: invoices.filter((invoice) => invoice.status === "Pending").length.toString(),
      },
      {
        label: "Approved",
        value: invoices.filter((invoice) => invoice.status === "Approved").length.toString(),
      },
      {
        label: "Processing",
        value: invoices.filter((invoice) => invoice.status === "Processing").length.toString(),
      },
      {
        label: "Paid",
        value: invoices.filter((invoice) => invoice.status === "Paid").length.toString(),
      },
      {
        label: "Failed",
        value: invoices.filter((invoice) => invoice.status === "Failed").length.toString(),
      },
    ],
    []
  );

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesFilter = filter === "All Invoices" || invoice.status === filter;
      const matchesSearch =
        query.length === 0 ||
        [
          invoice.id,
          invoice.agency,
          invoice.campaign,
          invoice.amount,
          invoice.fees,
          invoice.status,
          invoice.due,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [filter, search]);

  const countForFilter = (option: InvoiceFilter) =>
    option === "All Invoices"
      ? invoices.length
      : invoices.filter((invoice) => invoice.status === option).length;

  return (
    <div className="w-full max-w-[1048px]">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:gap-8">
        <div>
          <h1 className="text-[34px] font-semibold leading-none text-white">
            Invoices
          </h1>
          <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
            Review and manage agency invoices
          </p>
        </div>

        <button className="inline-flex h-[36px] w-full items-center justify-center gap-[12px] rounded-[6px] border border-[#5a5a5a] bg-[#0c0c0c] text-[14px] font-semibold text-white transition-colors hover:border-[#777] md:mt-[21px] md:w-[211px]">
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="mt-[31px] grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_270px_40px] md:gap-[30px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-[13px] top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#777]" />
          <input
            aria-label="Search invoices"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoices..."
            className="h-[36px] w-full border border-[#5a5a5a] bg-black pl-[39px] pr-4 text-[15px] text-white outline-none placeholder:text-[#7a7a7a] focus:border-[#7a7a7a]"
          />
        </label>

        <label className="relative block">
          <select
            aria-label="Filter invoices"
            value={filter}
            onChange={(event) => setFilter(event.target.value as InvoiceFilter)}
            className="h-[36px] w-full appearance-none rounded-[6px] border border-[#5a5a5a] bg-black px-[13px] pr-9 text-[15px] font-medium text-white outline-none focus:border-[#7a7a7a]"
          >
            {filterOptions.map((option) => (
              <option key={option} value={option}>
                {option} ({countForFilter(option)})
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-[13px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
        </label>

        <button
          aria-label="Filter invoices"
          className="flex h-[36px] w-full items-center justify-center rounded-[6px] border border-[#5a5a5a] bg-black text-white md:w-10"
        >
          <Filter className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-[29px] grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-[29px]">
        {statusCards.map((card) => (
          <MetricPanel key={card.label} className="h-[91px] px-[16px] py-[18px]">
            <p className="text-[15px] leading-4 text-[#777]">{card.label}</p>
            <p className="mt-[11px] text-[24px] font-semibold leading-none text-white">
              {card.value}
            </p>
          </MetricPanel>
        ))}
      </div>

      <div className="mt-[29px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[29px]">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <MetricPanel key={card.title} className="flex h-[215px] flex-col justify-between px-4 py-[25px]">
              <div>
                <h2 className="text-[20px] font-normal leading-6 text-[#777]">
                  {card.title}
                </h2>
                <p className="mt-[26px] text-[36px] font-semibold leading-none text-white">
                  {card.value}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[17px] leading-5 text-[#949494]">
                <Icon className="h-5 w-5 stroke-[1.8]" />
                <span>{card.detail}</span>
              </div>
            </MetricPanel>
          );
        })}
      </div>

      <div className="mt-[29px] overflow-x-auto rounded-[8px] border border-[#686868] bg-black">
        <table className="min-w-[1048px] table-fixed text-left">
          <colgroup>
            <col className="w-[139px]" />
            <col className="w-[153px]" />
            <col className="w-[248px]" />
            <col className="w-[92px]" />
            <col className="w-[66px]" />
            <col className="w-[129px]" />
            <col className="w-[134px]" />
            <col className="w-[85px]" />
          </colgroup>
          <thead>
            <tr className="h-[49px] border-b border-[#686868] text-[17px] font-semibold leading-none text-[#a2a2a2]">
              <th className="pl-[10px] pr-4">Invoice ID</th>
              <th className="px-0">Agency</th>
              <th className="px-0">Campaign</th>
              <th className="px-0">Amount</th>
              <th className="px-0">Fees</th>
              <th className="px-0">Status</th>
              <th className="px-0">Due Date</th>
              <th className="px-0" />
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="h-[64px] border-b border-[#505050] last:border-b-0"
              >
                <td className="pl-[11px] pr-4">
                  <div className="flex items-center gap-[11px]">
                    <FileText className="h-[19px] w-[19px] shrink-0 text-[#9a9a9a]" />
                    <span className="font-mono text-[17px] leading-none text-white">
                      {invoice.id}
                    </span>
                  </div>
                </td>
                <td className="truncate pr-5 text-[17px] leading-none text-[#c8c8c8]">
                  {invoice.agency}
                </td>
                <td className="truncate pr-5 text-[17px] leading-none text-[#a8a8a8]">
                  {invoice.campaign}
                </td>
                <td className="text-[17px] font-semibold leading-none text-white">
                  {invoice.amount}
                </td>
                <td className="text-[17px] leading-none text-[#8f8f8f]">{invoice.fees}</td>
                <td>
                  <StatusBadge status={invoice.status} />
                </td>
                <td>
                  <div className="flex items-center gap-[12px] text-[17px] leading-none text-[#a8a8a8]">
                    <CalendarDays className="h-[18px] w-[18px] shrink-0 text-[#d1d1d1]" />
                    {invoice.due}
                  </div>
                </td>
                <td className="pr-[20px] text-right">
                  <MoreHorizontal className="ml-auto h-5 w-5 text-[#838383]" />
                </td>
              </tr>
            ))}
            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={8} className="h-[144px] text-center text-[17px] text-[#8f8f8f]">
                  No invoices found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-[29px] flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-[17px] leading-none text-[#aaa]">
          Showing {filteredInvoices.length} of {invoices.length} invoices
        </p>
        <div className="flex items-center gap-[9px]">
          <button className="h-[40px] rounded-[6px] border border-[#272727] bg-[#070707] px-[16px] text-[17px] font-semibold text-white">
            Previous
          </button>
          <button className="h-[40px] rounded-[6px] border border-[#272727] bg-[#070707] px-[16px] text-[17px] font-semibold text-white">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
