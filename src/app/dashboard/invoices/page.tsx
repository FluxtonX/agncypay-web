"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileText,
  Filter,
  Lock,
  Mail,
  MoreHorizontal,
  Network,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  TrendingUp,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { downloadTableReportPdf } from "../../../lib/pdfExport";
import { useApp } from "../../../context/AppContext";
import {
  WorkspaceType,
  getDefaultPermissions,
  getDefaultWorkspaceRole,
  normalizeWorkspaceType,
} from "../../../types/workspace";

const initialInvoices = [
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
type InvoiceRow = (typeof initialInvoices)[number];
type MetricCard = {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
};
type CreateInvoiceForm = {
  agency: string;
  campaign: string;
  amount: string;
  fees: string;
  due: string;
};
type PaymentStage = "review" | "processing" | "success";
type PaymentFlow = {
  stage: PaymentStage;
  invoiceIds: string[];
  fundingMethod: "ach" | "card";
  activeStep: number;
  transactionId: string;
};
type InvoiceWorkspaceCopy = {
  title: string;
  description: string;
  source: string;
  primaryLabel: string;
  secondaryLabel: string;
  amountLabel: string;
  feeLabel: string;
  createTitle: string;
  createDescription: string;
  createPrimaryLabel: string;
  createPrimaryPlaceholder: string;
  createSecondaryLabel: string;
  createSecondaryPlaceholder: string;
  exportSubtitle: string;
};

const pageSize = 6;
const paymentSteps = [
  "Validating selected invoice IDs",
  "Checking wallet funding source",
  "Submitting settlement batch",
  "Reconciling paid invoice records",
];

const invoiceSourceCopy: Record<WorkspaceType, InvoiceWorkspaceCopy> = {
  brand: {
    title: "Mainboard-synced invoices",
    description: "Invoices are imported from Mainboard/ERP and routed through approval and payment controls.",
    source: "Mainboard Sync",
    primaryLabel: "Agency",
    secondaryLabel: "Campaign",
    amountLabel: "Amount",
    feeLabel: "Fee",
    createTitle: "Create Invoice",
    createDescription: "Brand invoices normally arrive from Mainboard/ERP. Manual creation is limited to authorized source systems.",
    createPrimaryLabel: "Agency",
    createPrimaryPlaceholder: "Creative Co",
    createSecondaryLabel: "Campaign",
    createSecondaryPlaceholder: "Q3 Launch Campaign",
    exportSubtitle: "Brand invoice register imported from Mainboard/ERP with approval and payment status.",
  },
  agency: {
    title: "Client invoice workspace",
    description: "Create client invoices, track approvals, and coordinate downstream payout splits.",
    source: "Agency Issued",
    primaryLabel: "Client / Brand",
    secondaryLabel: "Work / Campaign",
    amountLabel: "Invoice Total",
    feeLabel: "Platform Fee",
    createTitle: "Create Client Invoice",
    createDescription: "Issue a client invoice and route it into split and payout orchestration.",
    createPrimaryLabel: "Client / Brand",
    createPrimaryPlaceholder: "Nike Studios",
    createSecondaryLabel: "Work / Campaign",
    createSecondaryPlaceholder: "Q3 Launch Campaign",
    exportSubtitle: "Agency-issued client invoices with approval status and downstream payout readiness.",
  },
  talent_independent: {
    title: "Independent invoice workspace",
    description: "Create your own client invoices and track direct payment collection.",
    source: "Talent Created",
    primaryLabel: "Client",
    secondaryLabel: "Work",
    amountLabel: "Invoice Total",
    feeLabel: "Fee",
    createTitle: "Create Client Invoice",
    createDescription: "Create an independent client invoice for direct payment tracking.",
    createPrimaryLabel: "Client",
    createPrimaryPlaceholder: "Sony Music",
    createSecondaryLabel: "Work",
    createSecondaryPlaceholder: "Content package",
    exportSubtitle: "Independent talent invoices created for direct client collection and payout tracking.",
  },
  talent_agency: {
    title: "Assigned agency invoices",
    description: "View invoice items and payouts tied to your agency relationship. Global invoice controls stay with the agency.",
    source: "Agency Assigned",
    primaryLabel: "Agency",
    secondaryLabel: "Assignment / Work",
    amountLabel: "Gross Amount",
    feeLabel: "Split / Fee",
    createTitle: "Create Invoice",
    createDescription: "Agency talent can view assigned invoices and payout status. Invoice creation stays with the agency workspace.",
    createPrimaryLabel: "Agency",
    createPrimaryPlaceholder: "Creative Co",
    createSecondaryLabel: "Assignment / Work",
    createSecondaryPlaceholder: "Creator placement",
    exportSubtitle: "Assigned invoices tied to agency talent payout relationships.",
  },
  mother_agency: {
    title: "Network invoice oversight",
    description: "Monitor invoice exposure across child agencies and release approved payment batches.",
    source: "Network Rollup",
    primaryLabel: "Child Agency",
    secondaryLabel: "Client / Work",
    amountLabel: "Network Amount",
    feeLabel: "Override",
    createTitle: "Create Network Invoice",
    createDescription: "Mother agency workspaces oversee child agency invoices and release approved network payment batches.",
    createPrimaryLabel: "Child Agency",
    createPrimaryPlaceholder: "West Coast Talent Group",
    createSecondaryLabel: "Client / Work",
    createSecondaryPlaceholder: "Netflix Originals - creator launch",
    exportSubtitle: "Consolidated invoice exposure across child agencies, vendors, and network payouts.",
  },
};

const metricCardsByWorkspace: Record<WorkspaceType, MetricCard[]> = {
  brand: [
    { title: "Mainboard Volume", value: "$2.39M", detail: "+12.5% vs last month", icon: TrendingUp },
    { title: "Pending Approvals", value: "23", detail: "$487.2K total value", icon: Clock3 },
    { title: "Monthly Spend", value: "$623K", detail: "+20.3% from May", icon: ArrowUpRight },
    { title: "Settlement Status", value: "98.2%", detail: "156 of 159 settled", icon: ArrowUpRight },
  ],
  agency: [
    { title: "Client AR", value: "$623K", detail: "Issued by agency", icon: TrendingUp },
    { title: "Awaiting Client Approval", value: "18", detail: "$214K pending", icon: Clock3 },
    { title: "Talent Split Exposure", value: "$348K", detail: "Ready for payout orchestration", icon: Network },
    { title: "Collection Rate", value: "94.7%", detail: "Current month", icon: ArrowUpRight },
  ],
  talent_independent: [
    { title: "Client Billings", value: "$42K", detail: "Independent invoices", icon: TrendingUp },
    { title: "Awaiting Payment", value: "4", detail: "$12.8K outstanding", icon: Clock3 },
    { title: "Paid This Month", value: "$18K", detail: "Direct collections", icon: ArrowUpRight },
    { title: "Payout Readiness", value: "ACH", detail: "Primary payout connected", icon: CreditCard },
  ],
  talent_agency: [
    { title: "Assigned Gross", value: "$86K", detail: "Agency-managed invoices", icon: TrendingUp },
    { title: "Pending Payouts", value: "6", detail: "$9.4K estimated", icon: Clock3 },
    { title: "Approved Splits", value: "14", detail: "Matched to profile", icon: Network },
    { title: "Paid This Month", value: "$11K", detail: "Agency payouts", icon: ArrowUpRight },
  ],
  mother_agency: [
    { title: "Network Exposure", value: "$4.8M", detail: "Across child agencies", icon: TrendingUp },
    { title: "Release Queue", value: "31", detail: "$920K pending", icon: Clock3 },
    { title: "Child Agencies", value: "18", detail: "12 active invoice streams", icon: Network },
    { title: "Settlement Health", value: "97.4%", detail: "Consolidated status", icon: ArrowUpRight },
  ],
};

function dueDateToInputDate(due: string) {
  const [day, month, year] = due.split("/");
  return `${year}-${month}-${day}`;
}

function inputDateToDueDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function parseMoney(value: string) {
  return Number(value.replace(/[$,]/g, "")) || 0;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildInvoicePdf(invoice: InvoiceRow, labels: InvoiceWorkspaceCopy) {
  const lines = [
    `Invoice ${invoice.id}`,
    `${labels.primaryLabel}: ${invoice.agency}`,
    `${labels.secondaryLabel}: ${invoice.campaign}`,
    `${labels.amountLabel}: ${invoice.amount}`,
    `${labels.feeLabel}: ${invoice.fees}`,
    `Grand Total: ${formatMoney(parseMoney(invoice.amount) + parseMoney(invoice.fees))}`,
    `Status: ${invoice.status}`,
    `Due Date: ${invoice.due}`,
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
  const router = useRouter();
  const { state } = useApp();
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const activeMembership = state.memberships.find(
    (membership) => membership.workspaceId === state.activeWorkspaceId
  );
  const invoiceSource = invoiceSourceCopy[workspaceType];
  const metricCards = metricCardsByWorkspace[workspaceType];
  const effectivePermissions =
    activeMembership?.permissions && activeMembership.permissions.length > 0
      ? activeMembership.permissions
      : getDefaultPermissions(getDefaultWorkspaceRole(workspaceType));
  const canCreateInvoice = effectivePermissions.includes("create_invoices");
  const canProcessInvoices = effectivePermissions.includes("initiate_payments");
  const canEditInvoiceSource = canCreateInvoice;
  const canSelectInvoices = workspaceType !== "talent_agency";
  const selectedActionLabel = canProcessInvoices ? "Process Selected" : "Export Selected";
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRow[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InvoiceFilter>("All Invoices");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingDueId, setEditingDueId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateInvoiceForm>({
    agency: "",
    campaign: "",
    amount: "",
    fees: "",
    due: "",
  });
  const [paymentFlow, setPaymentFlow] = useState<PaymentFlow | null>(null);
  const paymentIntervalRef = useRef<number | null>(null);
  const paymentTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (paymentIntervalRef.current) {
        window.clearInterval(paymentIntervalRef.current);
      }

      if (paymentTimeoutRef.current) {
        window.clearTimeout(paymentTimeoutRef.current);
      }
    };
  }, []);

  const statusCards = useMemo(
    () => [
      {
        label: "Pending Approval",
        value: invoiceRows.filter((invoice) => invoice.status === "Pending").length.toString(),
      },
      {
        label: "Approved",
        value: invoiceRows.filter((invoice) => invoice.status === "Approved").length.toString(),
      },
      {
        label: "Processing",
        value: invoiceRows.filter((invoice) => invoice.status === "Processing").length.toString(),
      },
      {
        label: "Paid",
        value: invoiceRows.filter((invoice) => invoice.status === "Paid").length.toString(),
      },
      {
        label: "Failed",
        value: invoiceRows.filter((invoice) => invoice.status === "Failed").length.toString(),
      },
    ],
    [invoiceRows]
  );

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoiceRows.filter((invoice) => {
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
  }, [filter, invoiceRows, search]);

  const countForFilter = (option: InvoiceFilter) =>
    option === "All Invoices"
      ? invoiceRows.length
      : invoiceRows.filter((invoice) => invoice.status === option).length;

  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, pageCount);
  const pagedInvoices = filteredInvoices.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );
  const selectedInvoices = invoiceRows.filter((invoice) =>
    selectedIds.includes(invoice.id)
  );
  const selectedTotalAmount = selectedInvoices.reduce(
    (total, invoice) => total + parseMoney(invoice.amount),
    0
  );
  const selectedTotalTax = selectedInvoices.reduce(
    (total, invoice) => total + parseMoney(invoice.fees),
    0
  );
  const paymentInvoices = paymentFlow
    ? invoiceRows.filter((invoice) => paymentFlow.invoiceIds.includes(invoice.id))
    : [];
  const paymentTotalAmount = paymentInvoices.reduce(
    (total, invoice) => total + parseMoney(invoice.amount),
    0
  );
  const paymentTotalTax = paymentInvoices.reduce(
    (total, invoice) => total + parseMoney(invoice.fees),
    0
  );
  const allPagedSelected =
    pagedInvoices.length > 0 &&
    pagedInvoices.every((invoice) => selectedIds.includes(invoice.id));

  const updateDueDate = (invoiceId: string, value: string) => {
    if (!value) return;

    setInvoiceRows((rows) =>
      rows.map((invoice) =>
        invoice.id === invoiceId
          ? { ...invoice, due: inputDateToDueDate(value) }
          : invoice
      )
    );
  };

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedIds((ids) =>
      ids.includes(invoiceId)
        ? ids.filter((id) => id !== invoiceId)
        : [...ids, invoiceId]
    );
  };

  const toggleVisibleSelection = () => {
    setSelectedIds((ids) => {
      const visibleIds = pagedInvoices.map((invoice) => invoice.id);

      return allPagedSelected
        ? ids.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...ids, ...visibleIds]));
    });
  };

  const viewInvoiceDetail = (invoice: InvoiceRow) => {
    setOpenMenuId(null);
    router.push(`/dashboard/invoices/${invoice.id}`);
  };

  const downloadInvoicePdf = (invoice: InvoiceRow) => {
    const blob = new Blob([buildInvoicePdf(invoice, invoiceSource)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${invoice.id}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    setOpenMenuId(null);
  };

  const sendInvoiceEmail = (invoice: InvoiceRow) => {
    const subject = encodeURIComponent(`Invoice ${invoice.id}`);
    const body = encodeURIComponent(
      [
        `Invoice ${invoice.id}`,
        `${invoiceSource.primaryLabel}: ${invoice.agency}`,
        `${invoiceSource.secondaryLabel}: ${invoice.campaign}`,
        `${invoiceSource.amountLabel}: ${invoice.amount}`,
        `${invoiceSource.feeLabel}: ${invoice.fees}`,
        `Grand Total: ${formatMoney(parseMoney(invoice.amount) + parseMoney(invoice.fees))}`,
        `Due Date: ${invoice.due}`,
      ].join("\n")
    );

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpenMenuId(null);
  };

  const deleteInvoice = (invoiceId: string) => {
    setInvoiceRows((rows) => {
      return rows.filter((invoice) => invoice.id !== invoiceId);
    });
    setSelectedIds((ids) => ids.filter((id) => id !== invoiceId));
    setOpenMenuId(null);
  };

  const processSelectedInvoices = () => {
    if (!canProcessInvoices || selectedIds.length === 0) return;

    setPaymentFlow({
      stage: "review",
      invoiceIds: selectedIds,
      fundingMethod: "ach",
      activeStep: 0,
      transactionId: "",
    });
  };

  const exportSelectedInvoices = () => {
    if (selectedInvoices.length === 0) return;

    downloadTableReportPdf({
      title: "Selected Invoice Batch",
      subtitle: invoiceSource.exportSubtitle,
      filename: "agncypay-selected-invoices.pdf",
      summary: [
        { label: "Selected", value: selectedInvoices.length.toString() },
        {
          label: "Total Amount",
          value: formatMoney(selectedTotalAmount),
        },
        {
          label: "Total Fees",
          value: formatMoney(selectedTotalTax),
        },
      ],
      columns: [
        "Invoice",
        invoiceSource.primaryLabel,
        invoiceSource.secondaryLabel,
        invoiceSource.amountLabel,
        invoiceSource.feeLabel,
        "Status",
        "Due",
      ],
      rows: selectedInvoices.map((invoice) => [
        invoice.id,
        invoice.agency,
        invoice.campaign,
        invoice.amount,
        invoice.fees,
        invoice.status,
        invoice.due,
      ]),
    });
  };

  const handleSelectedAction = () => {
    if (canProcessInvoices) {
      processSelectedInvoices();
      return;
    }

    exportSelectedInvoices();
  };

  const createInvoice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const amount = Number(createForm.amount.replace(/[$,]/g, "")) || 0;
    const fees = Number(createForm.fees.replace(/[$,]/g, "")) || Math.round(amount * 0.01);
    const nextInvoice: InvoiceRow = {
      id: `INV-${Math.floor(3000 + Math.random() * 6000)}`,
      agency: createForm.agency.trim(),
      campaign: createForm.campaign.trim(),
      amount: formatMoney(amount),
      fees: formatMoney(fees),
      status: "Pending",
      due: inputDateToDueDate(createForm.due),
    };

    setInvoiceRows((rows) => [nextInvoice, ...rows]);
    setCreateForm({ agency: "", campaign: "", amount: "", fees: "", due: "" });
    setIsCreateOpen(false);
  };

  const updatePaymentFundingMethod = (fundingMethod: PaymentFlow["fundingMethod"]) => {
    setPaymentFlow((flow) => (flow ? { ...flow, fundingMethod } : flow));
  };

  const closePaymentFlow = () => {
    if (paymentFlow?.stage === "processing") return;

    setPaymentFlow(null);
  };

  const confirmSelectedPayment = () => {
    if (!paymentFlow) return;

    const invoiceIds = paymentFlow.invoiceIds;
    const transactionId = `TX-AP-${Math.floor(100000 + Math.random() * 900000)}`;

    setInvoiceRows((rows) =>
      rows.map((invoice) =>
        invoiceIds.includes(invoice.id)
          ? { ...invoice, status: "Processing" }
          : invoice
      )
    );
    setPaymentFlow((flow) =>
      flow
        ? {
            ...flow,
            stage: "processing",
            activeStep: 0,
            transactionId,
          }
        : flow
    );

    if (paymentIntervalRef.current) {
      window.clearInterval(paymentIntervalRef.current);
    }

    if (paymentTimeoutRef.current) {
      window.clearTimeout(paymentTimeoutRef.current);
    }

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

      setInvoiceRows((rows) =>
        rows.map((invoice) =>
          invoiceIds.includes(invoice.id)
            ? { ...invoice, status: "Paid" }
            : invoice
        )
      );
      setSelectedIds([]);
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
    }, 4100);
  };

  const exportInvoices = () => {
    const rows = filteredInvoices.map((invoice) => [
      invoice.id,
      invoice.agency,
      invoice.campaign,
      invoice.amount,
      invoice.fees,
      invoice.status,
      invoice.due,
    ]);

    downloadTableReportPdf({
      title: "Invoice Register",
      subtitle: invoiceSource.exportSubtitle,
      filename: "agncypay-invoices.pdf",
      summary: [
        { label: "Invoices", value: filteredInvoices.length.toString() },
        {
          label: "Total Amount",
          value: formatMoney(filteredInvoices.reduce((total, invoice) => total + parseMoney(invoice.amount), 0)),
        },
        {
          label: "Total Fees",
          value: formatMoney(filteredInvoices.reduce((total, invoice) => total + parseMoney(invoice.fees), 0)),
        },
      ],
      columns: [
        "Invoice",
        invoiceSource.primaryLabel,
        invoiceSource.secondaryLabel,
        invoiceSource.amountLabel,
        invoiceSource.feeLabel,
        "Status",
        "Due",
      ],
      rows,
    });
  };

  const resetFilters = () => {
    setSearch("");
    setFilter("All Invoices");
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-[1048px]">
      <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:gap-8">
        <div>
          <h1 className="text-[34px] font-semibold leading-none text-white">
            Invoices
          </h1>
          <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
            {invoiceSource.description}
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row md:mt-[21px] md:w-auto">
          <button
            type="button"
            onClick={exportInvoices}
            className="inline-flex h-[36px] items-center justify-center gap-[12px] rounded-[6px] border border-[#5a5a5a] bg-[#0c0c0c] px-5 text-[14px] font-semibold text-white transition-colors hover:border-[#777]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          {canCreateInvoice && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex h-[36px] items-center justify-center gap-[8px] rounded-[6px] border border-white bg-white px-3 sm:px-5 text-[12px] sm:text-[14px] font-semibold text-black transition-colors hover:bg-[#e8e8e8] whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              {invoiceSource.createTitle}
            </button>
          )}
        </div>
      </div>

      <section className="mt-[27px] rounded-[8px] border border-[#4f4f4f] bg-[#050505] px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[18px] font-semibold leading-6 text-white">
              {invoiceSource.title}
            </p>
            <p className="mt-1 text-[14px] leading-5 text-[#8f8f8f]">
              Source: {invoiceSource.source}
            </p>
          </div>
          <span className="inline-flex h-8 w-fit items-center rounded-[7px] border border-[#444] px-3 text-[13px] font-semibold text-[#d7d7d7]">
            {canProcessInvoices
              ? "Payment controls enabled"
              : canCreateInvoice
                ? "Invoice creation enabled"
                : "View-only access"}
          </span>
        </div>
      </section>

      <div className="mt-[31px] grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_270px_40px] md:gap-[30px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-[13px] top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-[#777]" />
          <input
            aria-label="Search invoices"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search invoices..."
            className="h-[36px] w-full border border-[#5a5a5a] bg-black pl-[39px] pr-4 text-[15px] text-white outline-none placeholder:text-[#7a7a7a] focus:border-[#7a7a7a]"
          />
        </label>

        <label className="relative block">
          <select
            aria-label="Filter invoices"
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value as InvoiceFilter);
              setCurrentPage(1);
            }}
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
          type="button"
          aria-label="Reset invoice filters"
          title="Reset filters"
          onClick={resetFilters}
          className="flex h-[36px] w-full items-center justify-center rounded-[6px] border border-[#5a5a5a] bg-black text-white transition-colors hover:border-[#777] md:w-10"
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
              <th className="pl-[10px] pr-4">
                <div className="flex items-center gap-[10px]">
                  {canSelectInvoices && (
                    <input
                      type="checkbox"
                      aria-label="Select visible invoices"
                      checked={allPagedSelected}
                      onChange={toggleVisibleSelection}
                      className="h-[16px] w-[16px] shrink-0 rounded-[4px] border border-[#777] bg-black accent-white"
                    />
                  )}
                  <span>Invoice ID</span>
                </div>
              </th>
              <th className="px-0">{invoiceSource.primaryLabel}</th>
              <th className="px-0">{invoiceSource.secondaryLabel}</th>
              <th className="px-0">{invoiceSource.amountLabel}</th>
              <th className="px-0">{invoiceSource.feeLabel}</th>
              <th className="px-0">Status</th>
              <th className="px-0">Due Date</th>
              <th className="px-0" />
            </tr>
          </thead>
          <tbody>
            {pagedInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="h-[64px] border-b border-[#505050] last:border-b-0"
              >
                <td className="pl-[11px] pr-4">
                  <div className="flex items-center gap-[9px]">
                    {canSelectInvoices && (
                      <input
                        type="checkbox"
                        aria-label={`Select ${invoice.id}`}
                        checked={selectedIds.includes(invoice.id)}
                        onChange={() => toggleInvoiceSelection(invoice.id)}
                        className="h-[16px] w-[16px] shrink-0 rounded-[4px] border border-[#777] bg-black accent-white"
                      />
                    )}
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
                  <div className="relative flex items-center gap-[12px] text-[17px] leading-none text-[#a8a8a8]">
                    <CalendarDays className="h-[18px] w-[18px] shrink-0 text-[#d1d1d1]" />
                    {canEditInvoiceSource ? (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingDueId((currentId) =>
                            currentId === invoice.id ? null : invoice.id
                          )
                        }
                        className="rounded-[5px] border border-transparent px-1 py-1 text-left transition-colors hover:border-[#4a4a4a] hover:text-white"
                        aria-label={`Edit due date for ${invoice.id}`}
                      >
                        {invoice.due}
                      </button>
                    ) : (
                      <span>{invoice.due}</span>
                    )}
                    {canEditInvoiceSource && editingDueId === invoice.id && (
                      <div className="absolute left-0 top-[32px] z-30 flex items-center gap-2 rounded-[7px] border border-[#555] bg-[#0b0b0b] p-2 shadow-xl">
                        <input
                          type="date"
                          value={dueDateToInputDate(invoice.due)}
                          onChange={(event) => updateDueDate(invoice.id, event.target.value)}
                          className="h-[30px] rounded-[5px] border border-[#444] bg-black px-2 text-[13px] text-white outline-none [color-scheme:dark]"
                        />
                        <button
                          type="button"
                          onClick={() => setEditingDueId(null)}
                          className="h-[30px] rounded-[5px] border border-[#444] px-2 text-[12px] font-semibold text-white hover:border-[#777]"
                        >
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="relative pr-[20px] text-right">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenuId((currentId) =>
                        currentId === invoice.id ? null : invoice.id
                      )
                    }
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-[6px] border border-transparent text-[#838383] transition-colors hover:border-[#4a4a4a] hover:text-white"
                    aria-label={`Open actions for ${invoice.id}`}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {openMenuId === invoice.id && (
                    <div className="absolute right-[20px] top-[48px] z-30 w-[188px] rounded-[7px] border border-[#555] bg-[#0b0b0b] p-2 text-left shadow-xl">
                      <button
                        type="button"
                        onClick={() => viewInvoiceDetail(invoice)}
                        className="flex w-full items-center gap-2 rounded-[5px] px-2 py-2 text-left text-[13px] text-[#d7d7d7] hover:bg-white/[0.06] hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                        View Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadInvoicePdf(invoice)}
                        className="flex w-full items-center gap-2 rounded-[5px] px-2 py-2 text-left text-[13px] text-[#d7d7d7] hover:bg-white/[0.06] hover:text-white"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => sendInvoiceEmail(invoice)}
                        className="flex w-full items-center gap-2 rounded-[5px] px-2 py-2 text-left text-[13px] text-[#d7d7d7] hover:bg-white/[0.06] hover:text-white"
                      >
                        <Mail className="h-4 w-4" />
                        Send Email
                      </button>
                      {canEditInvoiceSource && (
                        <button
                          type="button"
                          onClick={() => deleteInvoice(invoice.id)}
                          className="flex w-full items-center gap-2 rounded-[5px] px-2 py-2 text-left text-[13px] text-[#d7d7d7] hover:bg-white/[0.06] hover:text-white"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
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

      {canSelectInvoices && selectedInvoices.length > 0 && (
        <div className="mt-[29px] flex flex-col gap-5 rounded-[8px] border border-[#686868] bg-black px-5 py-[18px] md:flex-row md:items-center md:justify-between md:px-[30px]">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
            <div className="min-w-0">
              <p className="text-[14px] leading-4 text-[#777]">Selected Items</p>
              <p className="mt-[8px] break-words text-[20px] font-semibold leading-tight text-white lg:text-[22px]">
                {selectedInvoices.length}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] leading-4 text-[#777]">Total Amount</p>
              <p className="mt-[8px] break-words text-[20px] font-semibold leading-tight text-white lg:text-[22px]">
                {formatMoney(selectedTotalAmount)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] leading-4 text-[#777]">Total Tax</p>
              <p className="mt-[8px] break-words text-[20px] font-semibold leading-tight text-white lg:text-[22px]">
                {formatMoney(selectedTotalTax)}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[14px] leading-4 text-[#777]">Grand Total</p>
              <p className="mt-[8px] break-words text-[20px] font-semibold leading-tight text-white lg:text-[22px]">
                {formatMoney(selectedTotalAmount + selectedTotalTax)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="h-[42px] rounded-[7px] border border-[#555] bg-[#151515] px-[20px] text-[15px] font-semibold text-white transition-colors hover:border-[#777]"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={handleSelectedAction}
              className="h-[42px] rounded-[7px] border border-white bg-white px-[20px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
            >
              {selectedActionLabel}
            </button>
          </div>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={createInvoice}
            className="w-full max-w-[560px] rounded-[13px] border border-[#676767] bg-black p-[24px] shadow-2xl sm:p-[29px]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[27px] font-semibold leading-none text-white">
                  {invoiceSource.createTitle}
                </h2>
                <p className="mt-2 text-[14px] leading-5 text-[#8f8f8f]">
                  {invoiceSource.createDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                aria-label="Close create invoice"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-[#444] text-[#b8b8b8] hover:border-[#777] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-[25px] grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-[#8d8d8d]">
                  {invoiceSource.createPrimaryLabel}
                </span>
                <input
                  required
                  value={createForm.agency}
                  onChange={(event) =>
                    setCreateForm((form) => ({ ...form, agency: event.target.value }))
                  }
                  placeholder={invoiceSource.createPrimaryPlaceholder}
                  className="h-[42px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-[#8d8d8d]">
                  {invoiceSource.createSecondaryLabel}
                </span>
                <input
                  required
                  value={createForm.campaign}
                  onChange={(event) =>
                    setCreateForm((form) => ({ ...form, campaign: event.target.value }))
                  }
                  placeholder={invoiceSource.createSecondaryPlaceholder}
                  className="h-[42px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-[#8d8d8d]">
                  Amount
                </span>
                <input
                  required
                  inputMode="decimal"
                  value={createForm.amount}
                  onChange={(event) =>
                    setCreateForm((form) => ({ ...form, amount: event.target.value }))
                  }
                  placeholder="24500"
                  className="h-[42px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-[#8d8d8d]">
                  {invoiceSource.feeLabel}
                </span>
                <input
                  inputMode="decimal"
                  value={createForm.fees}
                  onChange={(event) =>
                    setCreateForm((form) => ({ ...form, fees: event.target.value }))
                  }
                  placeholder="Auto 1% if blank"
                  className="h-[42px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                />
              </label>
              <label className="flex flex-col gap-2 sm:col-span-2">
                <span className="text-[14px] font-semibold text-[#8d8d8d]">
                  Due Date
                </span>
                <input
                  required
                  type="date"
                  value={createForm.due}
                  onChange={(event) =>
                    setCreateForm((form) => ({ ...form, due: event.target.value }))
                  }
                  className="h-[42px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none [color-scheme:dark] focus:border-[#8a8a8a]"
                />
              </label>
            </div>

            <div className="mt-[28px] flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="h-[42px] rounded-[7px] border border-[#555] bg-[#151515] px-[20px] text-[15px] font-semibold text-white transition-colors hover:border-[#777]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[42px] rounded-[7px] border border-white bg-white px-[20px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
              >
                Save Invoice
              </button>
            </div>
          </form>
        </div>
      )}

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
                    {paymentFlow.stage === "review" && "Review Selected Payment"}
                    {paymentFlow.stage === "processing" && "Processing Payment"}
                    {paymentFlow.stage === "success" && "Payment Successful"}
                  </h2>
                  <p className="mt-2 text-[14px] leading-4 text-[#888]">
                    {paymentInvoices.length} invoice{paymentInvoices.length === 1 ? "" : "s"} selected
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
                  <div className="max-h-[160px] space-y-2 overflow-y-auto pr-1 sm:max-h-[184px]">
                    {paymentInvoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between gap-4 rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-mono text-[15px] font-semibold leading-5 text-white">
                            {invoice.id}
                          </p>
                          <p className="mt-1 truncate text-[14px] leading-4 text-[#858585]">
                            {invoice.agency} - {invoice.campaign}
                          </p>
                        </div>
                        <p className="shrink-0 text-[17px] font-semibold leading-none text-white">
                          {formatMoney(parseMoney(invoice.amount) + parseMoney(invoice.fees))}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3">
                      <p className="text-[13px] leading-4 text-[#777]">Subtotal</p>
                      <p className="mt-2 break-words text-[17px] font-semibold leading-tight text-white">
                        {formatMoney(paymentTotalAmount)}
                      </p>
                    </div>
                    <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3">
                      <p className="text-[13px] leading-4 text-[#777]">Fees</p>
                      <p className="mt-2 break-words text-[17px] font-semibold leading-tight text-white">
                        {formatMoney(paymentTotalTax)}
                      </p>
                    </div>
                    <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3">
                      <p className="text-[13px] leading-4 text-[#777]">Total</p>
                      <p className="mt-2 break-words text-[17px] font-semibold leading-tight text-white">
                        {formatMoney(paymentTotalAmount + paymentTotalTax)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[14px] font-semibold leading-4 text-[#8d8d8d]">
                      Funding Source
                    </p>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => updatePaymentFundingMethod("ach")}
                        className={cn(
                          "rounded-[8px] border px-4 py-4 text-left transition-colors",
                          paymentFlow.fundingMethod === "ach"
                            ? "border-white bg-white text-black"
                            : "border-[#444] bg-[#050505] text-white hover:border-[#777]"
                        )}
                      >
                        <span className="flex items-center gap-2 text-[15px] font-semibold">
                          <CreditCard className="h-4 w-4" />
                          Primary ACH
                        </span>
                        <span className={cn("mt-2 block text-[13px]", paymentFlow.fundingMethod === "ach" ? "text-[#333]" : "text-[#777]")}>
                          Chase Business Checking ...1234
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePaymentFundingMethod("card")}
                        className={cn(
                          "rounded-[8px] border px-4 py-4 text-left transition-colors",
                          paymentFlow.fundingMethod === "card"
                            ? "border-white bg-white text-black"
                            : "border-[#444] bg-[#050505] text-white hover:border-[#777]"
                        )}
                      >
                        <span className="flex items-center gap-2 text-[15px] font-semibold">
                          <CreditCard className="h-4 w-4" />
                          Corporate Card
                        </span>
                        <span className={cn("mt-2 block text-[13px]", paymentFlow.fundingMethod === "card" ? "text-[#333]" : "text-[#777]")}>
                          Visa Signature ...8930
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-[8px] border border-[#333] bg-[#050505] px-4 py-3 text-[13px] leading-5 text-[#9b9b9b]">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#d7d7d7]" />
                    Payment will move selected invoices to Processing, settle the batch, then mark every invoice as Paid after reconciliation.
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
                      onClick={confirmSelectedPayment}
                      className="h-[42px] rounded-[7px] border border-white bg-white px-[22px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                    >
                      Confirm Payment
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
                    Settling {formatMoney(paymentTotalAmount + paymentTotalTax)}
                  </h3>
                  <p className="mt-3 text-[15px] leading-5 text-[#8f8f8f]">
                    Keep this window open while the batch is reconciled.
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
                    Payment Settled Successfully
                  </h3>
                  <p className="mt-3 max-w-[420px] text-[15px] leading-5 text-[#8f8f8f]">
                    Selected invoices are now marked Paid and the transaction reference is ready for records.
                  </p>

                  <div className="mt-7 w-full rounded-[8px] border border-[#303030] bg-[#050505] p-4 text-left">
                    <div className="flex flex-col gap-2 border-b border-[#222] pb-3 sm:flex-row sm:justify-between">
                      <span className="text-[14px] text-[#777]">Transaction ID</span>
                      <span className="break-all font-mono text-[14px] font-semibold text-white sm:text-right">
                        {paymentFlow.transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#222] py-3">
                      <span className="text-[14px] text-[#777]">Invoices Paid</span>
                      <span className="text-[14px] font-semibold text-white">
                        {paymentInvoices.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 pt-3 sm:flex-row sm:justify-between">
                      <span className="text-[14px] text-[#777]">Final Amount</span>
                      <span className="break-words text-[14px] font-semibold text-white sm:text-right">
                        {formatMoney(paymentTotalAmount + paymentTotalTax)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closePaymentFlow}
                    className="mt-7 h-[42px] rounded-[7px] border border-white bg-white px-[26px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
                  >
                    Back to Invoices
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <div className="mt-[29px] flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-[17px] leading-none text-[#aaa]">
          {filteredInvoices.length === 0
            ? `Showing 0 of ${invoiceRows.length} invoices`
            : `Showing ${(safeCurrentPage - 1) * pageSize + 1}-${Math.min(
                safeCurrentPage * pageSize,
                filteredInvoices.length
              )} of ${invoiceRows.length} invoices`}
        </p>
        <div className="flex items-center gap-[9px]">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safeCurrentPage === 1}
            className="h-[40px] rounded-[6px] border border-[#272727] bg-[#070707] px-[16px] text-[17px] font-semibold text-white transition-colors hover:border-[#555] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Previous
          </button>
          <span className="min-w-[64px] text-center text-[15px] font-semibold text-[#aaa]">
            {safeCurrentPage}/{pageCount}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
            disabled={safeCurrentPage === pageCount}
            className="h-[40px] rounded-[6px] border border-[#272727] bg-[#070707] px-[16px] text-[17px] font-semibold text-white transition-colors hover:border-[#555] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
