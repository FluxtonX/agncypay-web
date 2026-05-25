"use client";

import React, { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Lock,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";
import { cn } from "../../../../lib/utils";
import { useApp } from "../../../../context/AppContext";
import {
  WorkspaceType,
  getDefaultPermissions,
  getDefaultWorkspaceRole,
  normalizeWorkspaceType,
} from "../../../../types/workspace";

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

type PaymentStage = "review" | "processing" | "success";
type PaymentFlow = {
  stage: PaymentStage;
  fundingMethod: "ach" | "card";
  activeStep: number;
  transactionId: string;
};

type ChangeFlow = {
  reason: string;
  submitted: boolean;
};
type SourceCopyValue = {
  label: string;
  detail: string;
  actionLabel: string;
  primaryLabel: string;
  secondaryLabel: string;
  amountLabel: string;
  feeLabel: string;
  permissionView: string;
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

const sourceCopy: Record<WorkspaceType, SourceCopyValue> = {
  brand: {
    label: "Mainboard Sync",
    detail: "Imported from Mainboard/ERP and waiting inside brand approval controls.",
    actionLabel: "Approve & Pay",
    primaryLabel: "Agency",
    secondaryLabel: "Campaign",
    amountLabel: "Invoice Amount",
    feeLabel: "AgencyPay Fee (1%)",
    permissionView: "Brand payment approval",
  },
  agency: {
    label: "Agency Issued",
    detail: "Created inside the agency workspace for a client payment workflow.",
    actionLabel: "Approve Invoice",
    primaryLabel: "Client / Brand",
    secondaryLabel: "Work / Campaign",
    amountLabel: "Client Invoice Total",
    feeLabel: "Platform Fee",
    permissionView: "Agency invoice management",
  },
  talent_independent: {
    label: "Talent Created",
    detail: "Owned by the independent talent workspace for direct collection tracking.",
    actionLabel: "Approve Invoice",
    primaryLabel: "Client",
    secondaryLabel: "Work",
    amountLabel: "Invoice Total",
    feeLabel: "Fee",
    permissionView: "Independent invoice tracking",
  },
  talent_agency: {
    label: "Agency Assigned",
    detail: "Visible because this invoice is tied to the talent payout relationship.",
    actionLabel: "Review Invoice",
    primaryLabel: "Agency",
    secondaryLabel: "Assignment / Work",
    amountLabel: "Gross Amount",
    feeLabel: "Split / Fee",
    permissionView: "Assigned invoice view",
  },
  mother_agency: {
    label: "Network Rollup",
    detail: "Part of consolidated oversight across child agencies and vendor relationships.",
    actionLabel: "Release Payment",
    primaryLabel: "Child Agency",
    secondaryLabel: "Client / Work",
    amountLabel: "Network Amount",
    feeLabel: "Override / Fee",
    permissionView: "Network treasury release",
  },
};

const paymentSteps = [
  "Validating invoice ID and approval authority",
  "Checking wallet funding source",
  "Submitting settlement instruction",
  "Reconciling paid invoice record",
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

function buildInvoicePdf(invoice: InvoiceDetail, labels: SourceCopyValue) {
  const lines = [
    `Invoice ${invoice.id}`,
    `${labels.primaryLabel}: ${invoice.agency}`,
    `${labels.secondaryLabel}: ${invoice.campaign}`,
    `${labels.amountLabel}: ${formatMoney(invoice.amount)}`,
    `${labels.feeLabel}: ${formatMoney(invoice.fee)}`,
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

function downloadPdf(invoice: InvoiceDetail, labels: SourceCopyValue) {
  const blob = new Blob([buildInvoicePdf(invoice, labels)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `${invoice.id}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const { invoiceId } = use(params);
  const { state } = useApp();
  const invoice = invoices.find((item) => item.id === invoiceId);
  const [status, setStatus] = useState(invoice?.status ?? "Pending");
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow | null>(null);
  const [changeFlow, setChangeFlow] = useState<ChangeFlow | null>(null);
  const paymentIntervalRef = useRef<number | null>(null);
  const paymentTimeoutRef = useRef<number | null>(null);
  const activeWorkspace = state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId);
  const activeMembership = state.memberships.find(
    (membership) => membership.workspaceId === state.activeWorkspaceId
  );
  const workspaceType = activeWorkspace?.type ?? (state.user ? normalizeWorkspaceType(state.user.accountType) : "brand");
  const permissions =
    activeMembership?.permissions && activeMembership.permissions.length > 0
      ? activeMembership.permissions
      : getDefaultPermissions(getDefaultWorkspaceRole(workspaceType));
  const canApproveInvoice = permissions.includes("approve_invoices") || workspaceType === "mother_agency";
  const canInitiatePayment = permissions.includes("initiate_payments");
  const canRequestChanges =
    canApproveInvoice || permissions.includes("create_invoices") || workspaceType === "agency";

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[InvoiceDetail] workspaceType:", workspaceType, "membershipRole:", activeMembership?.role ?? null, "permissions:", permissions, "canInitiatePayment:", canInitiatePayment);
  }
  const source = sourceCopy[workspaceType];
  const total = invoice ? invoice.amount + invoice.fee : 0;

  useEffect(() => {
    setStatus(invoice?.status ?? "Pending");
  }, [invoice?.id, invoice?.status]);

  useEffect(() => {
    return () => {
      if (paymentIntervalRef.current) window.clearInterval(paymentIntervalRef.current);
      if (paymentTimeoutRef.current) window.clearTimeout(paymentTimeoutRef.current);
    };
  }, []);

  if (!invoice) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-[#9b9b9b]" />
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

  const openPaymentFlow = () => {
    if (!canApproveInvoice && !canInitiatePayment) return;

    setPaymentFlow({
      stage: "review",
      fundingMethod: "ach",
      activeStep: 0,
      transactionId: "",
    });
  };

  const closePaymentFlow = () => {
    if (paymentFlow?.stage === "processing") return;
    setPaymentFlow(null);
  };

  const confirmPayment = () => {
    if (!paymentFlow) return;

    const transactionId = `TX-AP-${Math.floor(100000 + Math.random() * 900000)}`;

    setStatus("Processing");
    setPaymentFlow({
      ...paymentFlow,
      stage: "processing",
      activeStep: 0,
      transactionId,
    });

    if (paymentIntervalRef.current) window.clearInterval(paymentIntervalRef.current);
    if (paymentTimeoutRef.current) window.clearTimeout(paymentTimeoutRef.current);

    paymentIntervalRef.current = window.setInterval(() => {
      setPaymentFlow((flow) => {
        if (!flow || flow.stage !== "processing") return flow;

        return {
          ...flow,
          activeStep: Math.min(flow.activeStep + 1, paymentSteps.length - 1),
        };
      });
    }, 850);

    paymentTimeoutRef.current = window.setTimeout(() => {
      if (paymentIntervalRef.current) {
        window.clearInterval(paymentIntervalRef.current);
        paymentIntervalRef.current = null;
      }

      setStatus(canInitiatePayment ? "Paid" : "Approved");
      setPaymentFlow((flow) =>
        flow
          ? {
              ...flow,
              stage: "success",
              activeStep: paymentSteps.length - 1,
              transactionId,
            }
          : flow
      );
    }, 3600);
  };

  const submitChangeRequest = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Changes Requested");
    setChangeFlow((flow) => ({
      reason: flow?.reason.trim() || "Invoice requires updates before approval.",
      submitted: true,
    }));
  };

  const workflowSummary = canInitiatePayment
    ? "This action validates invoice approval, submits a settlement instruction, and marks the invoice Paid after reconciliation."
    : "This action records approval for the invoice. Payment release remains with a finance or treasury user.";

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
              <h1 className="text-[30px] font-semibold leading-tight text-white sm:text-[35px]">
                Invoice {invoice.id}
              </h1>
              <StatusBadge status={status} />
            </div>
            <p className="mt-[14px] text-[18px] leading-6 text-[#9b9b9b] sm:mt-[18px] sm:text-[20px]">
              {invoice.campaign}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:mt-[11px]">
          <button
            type="button"
            onClick={() => downloadPdf(invoice, source)}
            className="inline-flex h-[36px] items-center justify-center gap-[11px] rounded-[6px] border border-[#5a5a5a] bg-[#0c0c0c] px-[18px] text-[14px] font-semibold text-white transition-colors hover:border-[#777]"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          {(canApproveInvoice || canInitiatePayment) && (
            <button
              type="button"
              onClick={openPaymentFlow}
              className="h-[36px] rounded-[6px] border border-white bg-white px-[18px] text-[14px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
            >
              {source.actionLabel}
            </button>
          )}
        </div>
      </div>

      <section className="mt-[28px] rounded-[13px] border border-[#676767] bg-black px-5 py-5 sm:px-[29px]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#777]">
              {source.label}
            </p>
            <p className="mt-2 max-w-[700px] text-[16px] leading-6 text-[#a5a5a5]">
              {source.detail}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-[8px] border border-[#333] bg-[#050505] px-4 py-3">
              <p className="text-[12px] text-[#777]">Workspace</p>
              <p className="mt-2 truncate text-[14px] font-semibold text-white">
                {activeWorkspace?.name || "Current Workspace"}
              </p>
            </div>
            <div className="rounded-[8px] border border-[#333] bg-[#050505] px-4 py-3">
              <p className="text-[12px] text-[#777]">Agncy ID</p>
              <p className="mt-2 truncate text-[14px] font-semibold text-white">
                {activeWorkspace?.agncyId || "ORG-100245"}
              </p>
            </div>
            <div className="col-span-2 rounded-[8px] border border-[#333] bg-[#050505] px-4 py-3 sm:col-span-1">
              <p className="text-[12px] text-[#777]">Permission</p>
              <p className="mt-2 truncate text-[14px] font-semibold text-white">
                {canInitiatePayment ? source.permissionView : canApproveInvoice ? "Approval Only" : "View / Track"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-[29px] grid grid-cols-1 gap-[29px] xl:grid-cols-[minmax(0,690px)_330px]">
        <div className="space-y-[29px]">
          <section className="rounded-[13px] border border-[#676767] bg-black px-5 py-[30px] sm:px-[29px] sm:py-[37px]">
            <h2 className="text-[25px] font-semibold leading-none text-white sm:text-[29px]">
              Invoice Details
            </h2>
            <div className="mt-[30px] grid grid-cols-1 gap-[30px] md:grid-cols-2">
              <div className="flex items-start gap-[15px]">
                <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[8px] bg-[#292929] text-[#d8d8d8]">
                  <Building2 className="h-[23px] w-[23px]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[16px] leading-5 text-[#777]">{source.primaryLabel}</p>
                  <p className="mt-[9px] break-words text-[20px] font-semibold leading-6 text-white">
                    {invoice.agency}
                  </p>
                  <p className="mt-[5px] break-all text-[16px] leading-5 text-[#8b8b8b]">
                    {invoice.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-[15px]">
                <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[8px] bg-[#292929] text-[#d8d8d8]">
                  <CalendarDays className="h-[23px] w-[23px]" />
                </div>
                <div>
                  <p className="text-[16px] leading-5 text-[#777]">Due Date</p>
                  <p className="mt-[9px] text-[20px] font-semibold leading-6 text-white">
                    {formatLongDate(invoice.due)}
                  </p>
                  <p className="mt-[5px] text-[16px] leading-5 text-[#8b8b8b]">
                    Created {invoice.created}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[13px] border border-[#676767] bg-black px-5 py-[30px] sm:px-[29px] sm:py-[37px]">
            <h2 className="text-[25px] font-semibold leading-none text-white sm:text-[29px]">
              Line Items
            </h2>
            <div className="mt-[32px] overflow-x-auto">
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
              <div className="flex justify-between gap-4 text-[16px] leading-5">
                <span className="text-[#8d8d8d]">{source.amountLabel}</span>
                <span className="font-semibold text-white">{formatMoney(invoice.amount)}</span>
              </div>
              <div className="mt-[20px] flex justify-between gap-4 text-[16px] leading-5">
                <span className="text-[#8d8d8d]">{source.feeLabel}</span>
                <span className="font-semibold text-white">{formatMoney(invoice.fee)}</span>
              </div>
              <div className="mt-[19px] flex items-center justify-between gap-4 border-t border-[#343434] pt-[23px]">
                <span className="text-[19px] font-semibold leading-6 text-white">
                  Total Amount
                </span>
                <span className="break-words text-right text-[26px] font-semibold leading-none text-white sm:text-[32px]">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[13px] border border-[#676767] bg-black px-5 py-[30px] sm:px-[29px] sm:py-[31px]">
            <h2 className="text-[25px] font-semibold leading-none text-white sm:text-[29px]">
              Activity Timeline
            </h2>
            <div className="mt-[32px] space-y-[34px]">
              {[
                ["Invoice created", `${invoice.agency} - 2026-05-15 10:23 AM`],
                [source.label, `System - 2026-05-15 10:25 AM`],
                [status === "Changes Requested" ? "Changes requested" : "Awaiting approval", `AgncyPay - 2026-05-15 02:14 PM`],
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
          <section className="rounded-[13px] border border-[#676767] bg-black px-5 py-[30px] sm:px-[29px] sm:py-[37px]">
            <h2 className="text-[22px] font-semibold leading-none text-white">
              Payment Summary
            </h2>
            <div className="mt-[36px] space-y-[24px]">
              <div className="flex justify-between gap-6 text-[16px] leading-5">
                <span className="text-[#8d8d8d]">{source.amountLabel}</span>
                <span className="font-semibold text-white">{formatMoney(invoice.amount)}</span>
              </div>
              <div className="flex justify-between gap-6 text-[16px] leading-5">
                <span className="text-[#8d8d8d]">{source.feeLabel}</span>
                <span className="font-semibold text-white">{formatMoney(invoice.fee)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#343434] pt-[24px]">
                <span className="text-[18px] font-semibold leading-6 text-white">Total Due</span>
                <span className="break-words text-right text-[22px] font-semibold leading-none text-white">
                  {formatMoney(total)}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-[13px] border border-[#676767] bg-black px-5 py-[28px] sm:px-[29px] sm:py-[31px]">
            <div className="flex items-start gap-[14px]">
              <Clock3 className="mt-[1px] h-[22px] w-[22px] text-[#bdbdbd]" />
              <div>
                <h2 className="text-[18px] font-semibold leading-6 text-white">
                  {status === "Paid" ? "Payment Settled" : status}
                </h2>
                <p className="mt-[8px] text-[16px] leading-7 text-[#9b9b9b]">
                  {canApproveInvoice || canInitiatePayment
                    ? workflowSummary
                    : "You can view this invoice and track payout/payment status. Approval and treasury controls stay with authorized workspace users."}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[13px] border border-[#676767] bg-black px-5 py-[24px] sm:px-[31px]">
            {(canApproveInvoice || canInitiatePayment) && (
              <button
                type="button"
                onClick={openPaymentFlow}
                className="h-[44px] w-full rounded-[7px] border border-white bg-white text-[16px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
              >
                {source.actionLabel}
              </button>
            )}
            {canRequestChanges && (
              <button
                type="button"
                onClick={() => setChangeFlow({ reason: "", submitted: false })}
                className={cn(
                  "h-[44px] w-full rounded-[7px] border border-[#555] bg-black text-[16px] font-semibold text-white transition-colors hover:border-[#777]",
                  (canApproveInvoice || canInitiatePayment) && "mt-[18px]"
                )}
              >
                Request Changes
              </button>
            )}
            {!canRequestChanges && !canApproveInvoice && !canInitiatePayment && (
              <div className="flex items-start gap-3 rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3 text-[14px] leading-5 text-[#9b9b9b]">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#d7d7d7]" />
                Invoice controls are limited by your current workspace role.
              </div>
            )}
          </section>
        </aside>
      </div>

      {paymentFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-3 py-5 backdrop-blur-sm sm:px-4">
          <section className="flex max-h-[calc(100vh-40px)] w-full max-w-[620px] flex-col overflow-hidden rounded-[13px] border border-[#676767] bg-black shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#222] px-4 py-[16px] sm:px-[25px] sm:py-[18px]">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border border-[#3d3d3d] bg-[#101010] text-white">
                  {paymentFlow.stage === "success" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-[20px] font-semibold leading-tight text-white sm:text-[24px]">
                    {paymentFlow.stage === "review" && "Review Invoice Payment"}
                    {paymentFlow.stage === "processing" && "Processing Payment"}
                    {paymentFlow.stage === "success" && (canInitiatePayment ? "Payment Successful" : "Approval Recorded")}
                  </h2>
                  <p className="mt-2 text-[14px] leading-4 text-[#888]">
                    {invoice.id} - {source.label}
                  </p>
                </div>
              </div>

              {paymentFlow.stage !== "processing" && (
                <button
                  type="button"
                  onClick={closePaymentFlow}
                  aria-label="Close payment flow"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-[#444] text-[#b8b8b8] transition-colors hover:border-[#777] hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-[25px] sm:py-[24px]">
              {paymentFlow.stage === "review" && (
                <div className="space-y-[22px]">
                  <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-mono text-[15px] font-semibold leading-5 text-white">
                          {invoice.id}
                        </p>
                        <p className="mt-1 break-words text-[14px] leading-5 text-[#858585]">
                          {invoice.agency} - {invoice.campaign}
                        </p>
                      </div>
                      <p className="shrink-0 text-[19px] font-semibold leading-none text-white">
                        {formatMoney(total)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3">
                      <p className="text-[13px] leading-4 text-[#777]">{source.amountLabel}</p>
                      <p className="mt-2 break-words text-[17px] font-semibold leading-tight text-white">
                        {formatMoney(invoice.amount)}
                      </p>
                    </div>
                    <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3">
                      <p className="text-[13px] leading-4 text-[#777]">{source.feeLabel}</p>
                      <p className="mt-2 break-words text-[17px] font-semibold leading-tight text-white">
                        {formatMoney(invoice.fee)}
                      </p>
                    </div>
                    <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3">
                      <p className="text-[13px] leading-4 text-[#777]">Total</p>
                      <p className="mt-2 break-words text-[17px] font-semibold leading-tight text-white">
                        {formatMoney(total)}
                      </p>
                    </div>
                  </div>

                  {canInitiatePayment && (
                    <div>
                      <p className="text-[14px] font-semibold leading-4 text-[#8d8d8d]">
                        Funding Source
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {[
                          ["ach", "Primary ACH", "Chase Business Checking ...1234"],
                          ["card", "Corporate Card", "Visa Signature ...8930"],
                        ].map(([method, title, detail]) => {
                          const isSelected = paymentFlow.fundingMethod === method;

                          return (
                            <button
                              key={method}
                              type="button"
                              onClick={() =>
                                setPaymentFlow((flow) =>
                                  flow ? { ...flow, fundingMethod: method as PaymentFlow["fundingMethod"] } : flow
                                )
                              }
                              className={cn(
                                "rounded-[8px] border px-4 py-4 text-left transition-colors",
                                isSelected
                                  ? "border-white bg-white text-black"
                                  : "border-[#444] bg-[#050505] text-white hover:border-[#777]"
                              )}
                            >
                              <span className="flex items-center gap-2 text-[15px] font-semibold">
                                <CreditCard className="h-4 w-4" />
                                {title}
                              </span>
                              <span className={cn("mt-2 block text-[13px]", isSelected ? "text-[#333]" : "text-[#777]")}>
                                {detail}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 rounded-[8px] border border-[#333] bg-[#050505] px-4 py-3 text-[13px] leading-5 text-[#9b9b9b]">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#d7d7d7]" />
                    {workflowSummary}
                  </div>

                  <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closePaymentFlow}
                      className="h-[42px] rounded-[7px] border border-[#555] bg-[#151515] px-[22px] text-[15px] font-semibold text-white transition-colors hover:border-[#777]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmPayment}
                      className="h-[42px] rounded-[7px] border border-white bg-white px-[22px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                    >
                      {canInitiatePayment ? "Confirm Payment" : "Record Approval"}
                    </button>
                  </div>
                </div>
              )}

              {paymentFlow.stage === "processing" && (
                <div className="flex min-h-full flex-col items-center justify-center py-6 text-center">
                  <div className="relative flex h-[78px] w-[78px] items-center justify-center rounded-full border border-[#4d4d4d] bg-[#070707]">
                    <RefreshCw className="h-9 w-9 animate-spin text-white" />
                    <Lock className="absolute h-4 w-4 text-[#9b9b9b]" />
                  </div>

                  <h3 className="mt-5 text-[24px] font-semibold leading-none text-white">
                    {canInitiatePayment ? `Settling ${formatMoney(total)}` : "Recording Approval"}
                  </h3>
                  <p className="mt-3 text-[15px] leading-5 text-[#8f8f8f]">
                    Keep this window open while the workflow is reconciled.
                  </p>

                  <div className="mt-7 w-full space-y-3 rounded-[8px] border border-[#303030] bg-[#050505] p-4 text-left">
                    {paymentSteps.map((step, index) => {
                      const isDone = index < paymentFlow.activeStep;
                      const isActive = index === paymentFlow.activeStep;

                      return (
                        <div
                          key={step}
                          className={cn(
                            "flex items-center gap-3 text-[14px] transition-colors",
                            isDone || isActive ? "text-white" : "text-[#595959]"
                          )}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          ) : isActive ? (
                            <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
                          ) : (
                            <span className="h-4 w-4 shrink-0 rounded-full border border-[#444]" />
                          )}
                          <span>{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {paymentFlow.stage === "success" && (
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="flex h-[78px] w-[78px] items-center justify-center rounded-full border border-white bg-white text-black">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>

                  <h3 className="mt-5 text-[25px] font-semibold leading-none text-white">
                    {canInitiatePayment ? "Payment Settled Successfully" : "Invoice Approved"}
                  </h3>
                  <p className="mt-3 max-w-[420px] text-[15px] leading-5 text-[#8f8f8f]">
                    {canInitiatePayment
                      ? "The invoice is now marked Paid and the transaction reference is ready for records."
                      : "Approval has been recorded. A finance user can release payment from the authorized workspace."}
                  </p>

                  <div className="mt-7 w-full rounded-[8px] border border-[#303030] bg-[#050505] p-4 text-left">
                    <div className="flex flex-col gap-2 border-b border-[#222] pb-3 sm:flex-row sm:justify-between">
                      <span className="text-[14px] text-[#777]">Transaction ID</span>
                      <span className="break-all font-mono text-[14px] font-semibold text-white sm:text-right">
                        {paymentFlow.transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#222] py-3">
                      <span className="text-[14px] text-[#777]">Invoice</span>
                      <span className="text-[14px] font-semibold text-white">{invoice.id}</span>
                    </div>
                    <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:justify-between">
                      <span className="text-[14px] text-[#777]">Final Amount</span>
                      <span className="break-words text-[14px] font-semibold text-white sm:text-right">
                        {formatMoney(total)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closePaymentFlow}
                    className="mt-7 h-[42px] rounded-[7px] border border-white bg-white px-[26px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                  >
                    Back to Invoice
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {changeFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-3 py-5 backdrop-blur-sm sm:px-4">
          <section className="flex max-h-[calc(100vh-40px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[13px] border border-[#676767] bg-black shadow-2xl">
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#222] px-4 py-[16px] sm:px-[25px] sm:py-[18px]">
              <div>
                <h2 className="text-[20px] font-semibold leading-tight text-white sm:text-[24px]">
                  {changeFlow.submitted ? "Changes Requested" : "Request Invoice Changes"}
                </h2>
                <p className="mt-2 text-[14px] leading-4 text-[#888]">
                  {invoice.id} - {invoice.agency}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setChangeFlow(null)}
                aria-label="Close change request"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-[#444] text-[#b8b8b8] transition-colors hover:border-[#777] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-[25px] sm:py-[24px]">
              {changeFlow.submitted ? (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                    <div>
                      <p className="text-[16px] font-semibold text-white">
                        Request sent to invoice owner
                      </p>
                      <p className="mt-2 text-[14px] leading-5 text-[#8f8f8f]">
                        The invoice has been moved to Changes Requested until the owner updates it.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-4">
                    <p className="text-[13px] text-[#777]">Reason</p>
                    <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6 text-white">
                      {changeFlow.reason}
                    </p>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setChangeFlow(null)}
                      className="h-[42px] rounded-[7px] border border-white bg-white px-[22px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submitChangeRequest} className="space-y-5">
                  <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-4">
                    <p className="font-mono text-[15px] font-semibold text-white">{invoice.id}</p>
                    <p className="mt-1 text-[14px] leading-5 text-[#858585]">
                      {invoice.campaign} - {formatMoney(total)}
                    </p>
                  </div>
                  <label className="block">
                    <span className="text-[14px] font-semibold text-[#8d8d8d]">
                      Change request note
                    </span>
                    <textarea
                      required
                      value={changeFlow.reason}
                      onChange={(event) =>
                        setChangeFlow((flow) =>
                          flow ? { ...flow, reason: event.target.value } : flow
                        )
                      }
                      placeholder="Explain what needs to be corrected before approval."
                      className="mt-3 min-h-[140px] w-full resize-none rounded-[8px] border border-[#555] bg-[#0c0c0c] px-4 py-3 text-[15px] leading-6 text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                    />
                  </label>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setChangeFlow(null)}
                      className="h-[42px] rounded-[7px] border border-[#555] bg-[#151515] px-[22px] text-[15px] font-semibold text-white transition-colors hover:border-[#777]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="h-[42px] rounded-[7px] border border-white bg-white px-[22px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                    >
                      Send Request
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
