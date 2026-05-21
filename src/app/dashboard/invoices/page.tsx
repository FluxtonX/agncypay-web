"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { downloadTableReportPdf } from "../../../lib/pdfExport";

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

const pageSize = 6;

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

function buildInvoicePdf(invoice: InvoiceRow) {
  const lines = [
    `Invoice ${invoice.id}`,
    `Agency: ${invoice.agency}`,
    `Campaign: ${invoice.campaign}`,
    `Amount: ${invoice.amount}`,
    `Tax: ${invoice.fees}`,
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
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRow[]>(initialInvoices);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<InvoiceFilter>("All Invoices");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingDueId, setEditingDueId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
    const blob = new Blob([buildInvoicePdf(invoice)], { type: "application/pdf" });
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
        `Agency: ${invoice.agency}`,
        `Campaign: ${invoice.campaign}`,
        `Amount: ${invoice.amount}`,
        `Tax: ${invoice.fees}`,
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
    setInvoiceRows((rows) =>
      rows.map((invoice) =>
        selectedIds.includes(invoice.id)
          ? { ...invoice, status: "Processing" }
          : invoice
      )
    );
    setSelectedIds([]);
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
      subtitle: "Filtered agency invoice export with payment status and due date detail.",
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
      columns: ["Invoice", "Agency", "Campaign", "Amount", "Fees", "Status", "Due"],
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
            Review and manage agency invoices
          </p>
        </div>

        <button
          type="button"
          onClick={exportInvoices}
          className="inline-flex h-[36px] w-full items-center justify-center gap-[12px] rounded-[6px] border border-[#5a5a5a] bg-[#0c0c0c] text-[14px] font-semibold text-white transition-colors hover:border-[#777] md:mt-[21px] md:w-[211px]"
        >
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
                  <input
                    type="checkbox"
                    aria-label="Select visible invoices"
                    checked={allPagedSelected}
                    onChange={toggleVisibleSelection}
                    className="h-[16px] w-[16px] shrink-0 rounded-[4px] border border-[#777] bg-black accent-white"
                  />
                  <span>Invoice ID</span>
                </div>
              </th>
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
            {pagedInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                className="h-[64px] border-b border-[#505050] last:border-b-0"
              >
                <td className="pl-[11px] pr-4">
                  <div className="flex items-center gap-[9px]">
                    <input
                      type="checkbox"
                      aria-label={`Select ${invoice.id}`}
                      checked={selectedIds.includes(invoice.id)}
                      onChange={() => toggleInvoiceSelection(invoice.id)}
                      className="h-[16px] w-[16px] shrink-0 rounded-[4px] border border-[#777] bg-black accent-white"
                    />
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
                    {editingDueId === invoice.id && (
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
                      <button
                        type="button"
                        onClick={() => deleteInvoice(invoice.id)}
                        className="flex w-full items-center gap-2 rounded-[5px] px-2 py-2 text-left text-[13px] text-[#ff8a8a] hover:bg-[#ff4d4d]/10 hover:text-[#ffb3b3]"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
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

      {selectedInvoices.length > 0 && (
        <div className="mt-[29px] flex flex-col gap-4 rounded-[8px] border border-[#686868] bg-black px-[39px] py-[16px] md:flex-row md:items-center md:justify-between">
          <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-4 md:max-w-[620px]">
            <div>
              <p className="text-[14px] leading-4 text-[#777]">Selected Items</p>
              <p className="mt-[9px] text-[24px] leading-none text-white">
                {selectedInvoices.length}
              </p>
            </div>
            <div>
              <p className="text-[14px] leading-4 text-[#777]">Total Amount</p>
              <p className="mt-[9px] text-[24px] leading-none text-white">
                {formatMoney(selectedTotalAmount)}
              </p>
            </div>
            <div>
              <p className="text-[14px] leading-4 text-[#777]">Total Tax</p>
              <p className="mt-[9px] text-[24px] leading-none text-white">
                {formatMoney(selectedTotalTax)}
              </p>
            </div>
            <div>
              <p className="text-[14px] leading-4 text-[#777]">Grand Total</p>
              <p className="mt-[9px] text-[24px] leading-none text-white">
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
              onClick={processSelectedInvoices}
              className="h-[42px] rounded-[7px] border border-white bg-white px-[20px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
            >
              Process Selected
            </button>
          </div>
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
