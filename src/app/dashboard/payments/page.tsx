"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Download, XCircle } from "lucide-react";
import { cn } from "../../../lib/utils";
import { downloadTableReportPdf } from "../../../lib/pdfExport";

type PaymentStatus = "Completed" | "Processing" | "Failed";
type PaymentFilter = "All" | PaymentStatus;

type Payment = {
  id: string;
  invoice: string;
  agency: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  date: string;
};

const payments: Payment[] = [
  {
    id: "PAY-9821",
    invoice: "INV-2842",
    agency: "Brand Studio",
    amount: 15800,
    method: "ACH Transfer",
    status: "Completed",
    date: "19/05/2026",
  },
  {
    id: "PAY-9820",
    invoice: "INV-2841",
    agency: "Marketing Pro",
    amount: 8900,
    method: "Wire Transfer",
    status: "Completed",
    date: "18/05/2026",
  },
  {
    id: "PAY-9819",
    invoice: "INV-2843",
    agency: "Digital Agency",
    amount: 32100,
    method: "ACH Transfer",
    status: "Processing",
    date: "20/05/2026",
  },
  {
    id: "PAY-9818",
    invoice: "INV-2844",
    agency: "Media Partners",
    amount: 18200,
    method: "ACH Transfer",
    status: "Processing",
    date: "21/05/2026",
  },
  {
    id: "PAY-9817",
    invoice: "INV-2836",
    agency: "Marketing Pro",
    amount: 14300,
    method: "ACH Transfer",
    status: "Failed",
    date: "13/05/2026",
  },
];

function formatMoney(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }

  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  const Icon =
    status === "Completed" ? CheckCircle2 : status === "Processing" ? Clock3 : XCircle;

  return (
    <span
      className={cn(
        "inline-flex h-[28px] items-center gap-[7px] rounded-[7px] border px-[11px] text-[15px] font-medium leading-none",
        status === "Completed" && "border-[#d7d7d7] bg-[#565656] text-white",
        status === "Processing" && "border-[#3f3f3f] bg-[#242424] text-[#d1d1d1]",
        status === "Failed" && "border-[#2f2f2f] bg-black text-[#b8b8b8]"
      )}
    >
      <Icon className="h-[14px] w-[14px]" />
      {status}
    </span>
  );
}

export default function PaymentsPage() {
  const [filter, setFilter] = useState<PaymentFilter>("All");

  const filteredPayments = useMemo(
    () =>
      filter === "All"
        ? payments
        : payments.filter((payment) => payment.status === filter),
    [filter]
  );

  const totalProcessed = 1890000;
  const processingTotal = payments
    .filter((payment) => payment.status === "Processing")
    .reduce((total, payment) => total + payment.amount, 0);
  const completedCount = 156;
  const failedCount = payments.filter((payment) => payment.status === "Failed").length;

  const metricCards: {
    title: string;
    value: string;
    detail: string;
    filter: PaymentFilter;
  }[] = [
    {
      title: "Total Processed",
      value: formatMoney(totalProcessed),
      detail: "This month",
      filter: "All",
    },
    {
      title: "Processing",
      value: formatMoney(processingTotal),
      detail: "2 payments",
      filter: "Processing",
    },
    {
      title: "Completed",
      value: completedCount.toString(),
      detail: "Last 30 days",
      filter: "Completed",
    },
    {
      title: "Failed",
      value: failedCount.toString(),
      detail: "Requires attention",
      filter: "Failed",
    },
  ];

  const exportPayments = () => {
    downloadTableReportPdf({
      title: "Payment History Export",
      subtitle: "Settlement history with invoice references, agencies, payment method, and current status.",
      filename: "agncypay-payments.pdf",
      summary: [
        { label: "Payments", value: filteredPayments.length.toString() },
        {
          label: "Volume",
          value: formatCurrency(filteredPayments.reduce((total, payment) => total + payment.amount, 0)),
        },
        { label: "Filter", value: filter },
      ],
      columns: ["Payment", "Invoice", "Agency", "Amount", "Method", "Status", "Date"],
      rows: filteredPayments.map((payment) => [
        payment.id,
        payment.invoice,
        payment.agency,
        formatCurrency(payment.amount),
        payment.method,
        payment.status,
        payment.date,
      ]),
    });
  };

  return (
    <div className="w-full max-w-[1048px]">
      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">
          Payments
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
          Track payment settlements and transaction history
        </p>
      </div>

      <div className="mt-[31px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[29px]">
        {metricCards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={() => setFilter(card.filter)}
            className={cn(
              "flex h-[215px] flex-col justify-between rounded-[13px] border border-[#676767] bg-black px-4 py-[25px] text-left transition-colors hover:border-[#8a8a8a]",
              filter === card.filter && "border-[#9a9a9a]"
            )}
          >
            <div>
              <h2 className="text-[20px] font-normal leading-6 text-[#777]">
                {card.title}
              </h2>
              <p className="mt-[26px] text-[36px] font-semibold leading-none text-white">
                {card.value}
              </p>
            </div>
            <p className="text-[17px] leading-5 text-[#949494]">{card.detail}</p>
          </button>
        ))}
      </div>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Payment History
            </h2>
            {filter !== "All" && (
              <button
                type="button"
                onClick={() => setFilter("All")}
                className="mt-3 text-[14px] font-semibold text-[#9b9b9b] transition-colors hover:text-white"
              >
                Showing {filter}. Clear filter
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={exportPayments}
            className="inline-flex h-[40px] items-center justify-center gap-[12px] rounded-[7px] border border-[#5a5a5a] bg-[#0c0c0c] px-[16px] text-[16px] font-semibold text-white transition-colors hover:border-[#777]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="mt-[32px] overflow-x-auto">
          <table className="min-w-[900px] table-fixed text-left">
            <colgroup>
              <col className="w-[136px]" />
              <col className="w-[115px]" />
              <col className="w-[170px]" />
              <col className="w-[102px]" />
              <col className="w-[154px]" />
              <col className="w-[174px]" />
              <col className="w-[126px]" />
            </colgroup>
            <thead>
              <tr className="h-[48px] border-b border-[#555] text-[17px] font-semibold leading-none text-[#8d8d8d]">
                <th className="pl-[10px] pr-4">Payment ID</th>
                <th>Invoice</th>
                <th>Agency</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr
                  key={payment.id}
                  className="h-[48px] border-b border-[#303030] last:border-b-0 text-[17px] leading-none"
                >
                  <td className="pl-[10px] pr-4 font-mono text-white">{payment.id}</td>
                  <td className="text-[#c8c8c8]">{payment.invoice}</td>
                  <td className="text-[#c8c8c8]">{payment.agency}</td>
                  <td className="font-semibold text-white">{formatCurrency(payment.amount)}</td>
                  <td className="text-[#9c9c9c]">{payment.method}</td>
                  <td>
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="text-[#b8b8b8]">{payment.date}</td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="h-[120px] text-center text-[17px] text-[#8f8f8f]">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
