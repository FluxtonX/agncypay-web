"use client";

import React, { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  Download,
  AlertCircle,
} from "lucide-react";
import { cn } from "../../../../lib/utils";

interface PageProps {
  params: Promise<{ invoiceId: string }>;
}

type InvoiceDetail = {
  id: string;
  agency: string;
  email: string;
  campaign: string;
  amount: number;
  fee: number;
  status: string;
  due: string;
  created: string;
  lineItems: {
    description: string;
    quantity: number;
    rate: number;
  }[];
};

const invoices: InvoiceDetail[] = [
  {
    id: "INV-2845",
    agency: "Creative Co",
    email: "billing@creativeco.com",
    campaign: "Q2 Brand Campaign",
    amount: 24500,
    fee: 245,
    status: "Pending",
    due: "22/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Creative Strategy & Concept Development", quantity: 1, rate: 8000 },
      { description: "Brand Asset Creation (10 assets)", quantity: 10, rate: 800 },
      { description: "Performance Analytics & Reporting", quantity: 1, rate: 1500 },
      { description: "Campaign Management (2 months)", quantity: 2, rate: 3500 },
    ],
  },
  {
    id: "INV-2844",
    agency: "Media Partners",
    email: "billing@mediapartners.com",
    campaign: "Digital Ads May",
    amount: 18200,
    fee: 182,
    status: "Approved",
    due: "21/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Media Buying Strategy", quantity: 1, rate: 5200 },
      { description: "Paid Search Placement", quantity: 2, rate: 3500 },
      { description: "Audience Testing & Optimization", quantity: 4, rate: 900 },
      { description: "Monthly Reporting", quantity: 1, rate: 2400 },
    ],
  },
  {
    id: "INV-2843",
    agency: "Digital Agency",
    email: "billing@digitalagency.com",
    campaign: "Social Media Management",
    amount: 32100,
    fee: 321,
    status: "Processing",
    due: "20/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Social Content Calendar", quantity: 1, rate: 6500 },
      { description: "Community Management", quantity: 3, rate: 4200 },
      { description: "Influencer Coordination", quantity: 5, rate: 1800 },
      { description: "Performance Reporting", quantity: 2, rate: 2000 },
    ],
  },
  {
    id: "INV-2842",
    agency: "Brand Studio",
    email: "billing@brandstudio.com",
    campaign: "Creative Services",
    amount: 15800,
    fee: 158,
    status: "Paid",
    due: "19/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Creative Direction", quantity: 1, rate: 4800 },
      { description: "Design System Updates", quantity: 4, rate: 1600 },
      { description: "Presentation Assets", quantity: 2, rate: 2300 },
    ],
  },
  {
    id: "INV-2841",
    agency: "Marketing Pro",
    email: "billing@marketingpro.com",
    campaign: "Email Campaign",
    amount: 8900,
    fee: 89,
    status: "Paid",
    due: "18/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Email Strategy", quantity: 1, rate: 2500 },
      { description: "Template Design", quantity: 3, rate: 900 },
      { description: "Automation Setup", quantity: 1, rate: 3700 },
    ],
  },
  {
    id: "INV-2840",
    agency: "Creative Co",
    email: "billing@creativeco.com",
    campaign: "Video Production",
    amount: 45000,
    fee: 450,
    status: "Pending",
    due: "17/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Production Planning", quantity: 1, rate: 9000 },
      { description: "Shoot Day Crew", quantity: 3, rate: 6500 },
      { description: "Post Production", quantity: 2, rate: 7000 },
      { description: "Final Mastering", quantity: 1, rate: 2500 },
    ],
  },
  {
    id: "INV-2839",
    agency: "Digital Agency",
    email: "billing@digitalagency.com",
    campaign: "SEO Services",
    amount: 12400,
    fee: 124,
    status: "Approved",
    due: "16/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Technical SEO Audit", quantity: 1, rate: 4200 },
      { description: "Content Optimization", quantity: 4, rate: 1400 },
      { description: "Monthly Rank Reporting", quantity: 1, rate: 2600 },
    ],
  },
  {
    id: "INV-2838",
    agency: "Media Partners",
    email: "billing@mediapartners.com",
    campaign: "Influencer Campaign",
    amount: 28700,
    fee: 287,
    status: "Processing",
    due: "15/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Creator Shortlist & Outreach", quantity: 1, rate: 5200 },
      { description: "Influencer Placements", quantity: 6, rate: 3200 },
      { description: "Usage Rights Management", quantity: 1, rate: 4300 },
    ],
  },
  {
    id: "INV-2837",
    agency: "Brand Studio",
    email: "billing@brandstudio.com",
    campaign: "Print Advertising",
    amount: 19200,
    fee: 192,
    status: "Paid",
    due: "14/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Print Concept Development", quantity: 1, rate: 6200 },
      { description: "Layout Production", quantity: 4, rate: 1700 },
      { description: "Prepress Review", quantity: 2, rate: 3100 },
    ],
  },
  {
    id: "INV-2836",
    agency: "Marketing Pro",
    email: "billing@marketingpro.com",
    campaign: "Content Marketing",
    amount: 14300,
    fee: 143,
    status: "Failed",
    due: "13/05/2026",
    created: "15/05/2026",
    lineItems: [
      { description: "Editorial Strategy", quantity: 1, rate: 4300 },
      { description: "Article Production", quantity: 5, rate: 1400 },
      { description: "Distribution Reporting", quantity: 1, rate: 3000 },
    ],
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatLongDate(value: string) {
  const [day, month, year] = value.split("/");
  const monthName = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ][Number(month) - 1];

  return `${monthName} ${Number(day)}, ${year}`;
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildInvoicePdf(invoice: InvoiceDetail) {
  const lines = [
    `Invoice ${invoice.id}`,
    `Agency: ${invoice.agency}`,
    `Campaign: ${invoice.campaign}`,
    `Amount: ${formatMoney(invoice.amount)}`,
    `AgencyPay Fee: ${formatMoney(invoice.fee)}`,
    `Total Due: ${formatMoney(invoice.amount + invoice.fee)}`,
    `Due Date: ${formatLongDate(invoice.due)}`,
  ];
  const content = [
    "BT",
    "/F1 18 Tf",
    "72 760 Td",
    `(${pdfEscape(lines[0])}) Tj`,
    "/F1 11 Tf",
    ...lines.slice(1).map((line) => `0 -24 Td (${pdfEscape(line)}) Tj`),
    "ET",
  ].join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    `5 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object) => {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[30px] items-center rounded-[6px] border px-[17px] text-[14px] font-medium leading-none",
        status === "Paid" && "border-[#e4e4e4] bg-[#8b8b8b] text-black",
        status === "Approved" && "border-[#5b5b5b] bg-[#101010] text-white",
        status !== "Paid" &&
          status !== "Approved" &&
          "border-[#383838] bg-[#1f1f1f] text-[#c7c7c7]"
      )}
    >
      {status}
    </span>
  );
}

function downloadPdf(invoice: InvoiceDetail) {
  const blob = new Blob([buildInvoicePdf(invoice)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${invoice.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const { invoiceId } = use(params);
  const invoice = invoices.find((item) => item.id === invoiceId);

  if (!invoice) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-[#EF4444]" />
        <h1 className="text-[28px] font-semibold text-white">Invoice Not Found</h1>
        <p className="max-w-md text-[16px] text-[#9b9b9b]">
          This invoice is not available in the current frontend dataset.
        </p>
        <Link
          href="/dashboard/invoices"
          className="rounded-[7px] border border-[#555] px-5 py-2 text-[15px] font-semibold text-white hover:border-[#777]"
        >
          Back to Invoices
        </Link>
      </div>
    );
  }

  const total = invoice.amount + invoice.fee;

  return (
    <div className="w-full max-w-[1048px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-[18px]">
          <Link
            href="/dashboard/invoices"
            aria-label="Back to invoices"
            className="mt-[27px] text-[24px] leading-none text-[#b7b7b7] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-[16px]">
              <h1 className="text-[35px] font-semibold leading-none text-white">
                Invoice {invoice.id}
              </h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
              {invoice.campaign}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:mt-[11px]">
          <button
            type="button"
            onClick={() => downloadPdf(invoice)}
            className="inline-flex h-[36px] items-center justify-center gap-[11px] rounded-[6px] border border-[#5a5a5a] bg-[#0c0c0c] px-[18px] text-[14px] font-semibold text-white transition-colors hover:border-[#777]"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => alert(`Processing payment approval for ${invoice.id}.`)}
            className="h-[36px] rounded-[6px] border border-white bg-white px-[18px] text-[14px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
          >
            Approve & Pay
          </button>
        </div>
      </div>

      <div className="mt-[34px] grid grid-cols-1 gap-[29px] xl:grid-cols-[minmax(0,690px)_330px]">
        <div className="space-y-[29px]">
          <section className="rounded-[13px] border border-[#676767] bg-black px-[29px] py-[37px]">
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Invoice Details
            </h2>
            <div className="mt-[36px] grid grid-cols-1 gap-[34px] md:grid-cols-2">
              <div className="flex items-start gap-[15px]">
                <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[8px] bg-[#292929] text-[#d8d8d8]">
                  <Building2 className="h-[23px] w-[23px]" />
                </div>
                <div>
                  <p className="text-[17px] leading-5 text-[#777]">Agency</p>
                  <p className="mt-[9px] text-[21px] font-semibold leading-6 text-white">
                    {invoice.agency}
                  </p>
                  <p className="mt-[5px] text-[17px] leading-5 text-[#8b8b8b]">
                    {invoice.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-[15px]">
                <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[8px] bg-[#292929] text-[#d8d8d8]">
                  <CalendarDays className="h-[23px] w-[23px]" />
                </div>
                <div>
                  <p className="text-[17px] leading-5 text-[#777]">Due Date</p>
                  <p className="mt-[9px] text-[21px] font-semibold leading-6 text-white">
                    {formatLongDate(invoice.due)}
                  </p>
                  <p className="mt-[5px] text-[17px] leading-5 text-[#8b8b8b]">
                    Created {invoice.created}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[13px] border border-[#676767] bg-black px-[29px] py-[37px]">
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Line Items
            </h2>
            <div className="mt-[37px] overflow-x-auto">
              <table className="w-full min-w-[610px] table-fixed text-left">
                <colgroup>
                  <col className="w-[56%]" />
                  <col className="w-[14%]" />
                  <col className="w-[16%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className="h-[43px] border-b border-[#444] text-[17px] leading-none text-[#777]">
                    <th className="font-normal">Description</th>
                    <th className="text-right font-normal">Qty</th>
                    <th className="text-right font-normal">Rate</th>
                    <th className="text-right font-normal">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item) => (
                    <tr
                      key={item.description}
                      className="h-[74px] border-b border-[#343434] text-[17px] leading-6 text-[#c8c8c8]"
                    >
                      <td className="pr-5">{item.description}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right text-[#9b9b9b]">{formatMoney(item.rate)}</td>
                      <td className="text-right font-semibold text-white">
                        {formatMoney(item.quantity * item.rate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-[29px] border-t border-[#7a7a7a] pt-[28px]">
              <div className="flex justify-between text-[17px] leading-5">
                <span className="text-[#8d8d8d]">Subtotal</span>
                <span className="text-white">{formatMoney(invoice.amount)}</span>
              </div>
              <div className="mt-[20px] flex justify-between text-[17px] leading-5">
                <span className="text-[#8d8d8d]">AgencyPay Fee (1%)</span>
                <span className="text-white">{formatMoney(invoice.fee)}</span>
              </div>
              <div className="mt-[19px] flex items-center justify-between border-t border-[#343434] pt-[23px]">
                <span className="text-[20px] font-semibold leading-6 text-white">
                  Total Amount
                </span>
                <span className="text-[32px] font-semibold leading-none text-white">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Activity Timeline
            </h2>
            <div className="mt-[36px] space-y-[34px]">
              {[
                ["Invoice created", `${invoice.agency} • 2026-05-15 10:23 AM`],
                ["Synced from CRM", "System • 2026-05-15 10:25 AM"],
                ["Awaiting approval", "AgencyPay • 2026-05-15 02:14 PM"],
              ].map(([title, detail], index, items) => (
                <div key={title} className="relative flex gap-[20px]">
                  <div className="relative flex w-[10px] justify-center">
                    <span className="mt-[4px] h-[10px] w-[10px] rounded-full bg-[#777]" />
                    {index < items.length - 1 && (
                      <span className="absolute top-[18px] h-[52px] w-px bg-[#343434]" />
                    )}
                  </div>
                  <div>
                    <p className="text-[17px] font-semibold leading-5 text-white">{title}</p>
                    <p className="mt-[8px] text-[17px] leading-5 text-[#8b8b8b]">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-[29px]">
          <section className="rounded-[13px] border border-[#676767] bg-black px-[29px] py-[37px]">
            <h2 className="text-[22px] font-semibold leading-none text-white">
              Payment Summary
            </h2>
            <div className="mt-[44px] space-y-[28px]">
              <div className="flex justify-between gap-6 text-[17px] leading-5">
                <span className="text-[#8d8d8d]">Invoice Amount</span>
                <span className="font-semibold text-white">{formatMoney(invoice.amount)}</span>
              </div>
              <div className="flex justify-between gap-6 text-[17px] leading-5">
                <span className="text-[#8d8d8d]">Processing Fee</span>
                <span className="font-semibold text-white">{formatMoney(invoice.fee)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#343434] pt-[28px]">
                <span className="text-[20px] font-semibold leading-6 text-white">Total Due</span>
                <span className="text-[25px] font-semibold leading-none text-white">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
            <div className="flex items-start gap-[14px]">
              <Clock3 className="mt-[1px] h-[22px] w-[22px] text-[#bdbdbd]" />
              <div>
                <h2 className="text-[18px] font-semibold leading-6 text-white">
                  Pending Approval
                </h2>
                <p className="mt-[8px] text-[17px] leading-7 text-[#9b9b9b]">
                  This invoice is awaiting approval. Review the details and approve to proceed with payment.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[13px] border border-[#676767] bg-black px-[31px] py-[24px]">
            <button
              type="button"
              onClick={() => alert(`Processing payment approval for ${invoice.id}.`)}
              className="h-[44px] w-full rounded-[7px] border border-white bg-white text-[16px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
            >
              Approve & Pay
            </button>
            <button
              type="button"
              onClick={() => alert(`Change request started for ${invoice.id}.`)}
              className="mt-[24px] h-[44px] w-full rounded-[7px] border border-[#555] bg-black text-[16px] font-semibold text-white transition-colors hover:border-[#777]"
            >
              Request Changes
            </button>
          </section>
        </aside>
      </div>
    </div>
  );
}
