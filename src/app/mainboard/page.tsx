"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  Search,
  ShieldCheck,
} from "lucide-react";
import { downloadTableReportPdf } from "../../lib/pdfExport";
import { cn } from "../../lib/utils";
import {
  formatMainboardMoney,
  mainboardInvoices,
  type MainboardInvoiceStatus,
} from "../../lib/mainboard";

const statusStyles: Record<MainboardInvoiceStatus, string> = {
  Ready: "border-white bg-white text-black",
  Pending: "border-[#3a3a3a] bg-[#111] text-[#d7d7d7]",
  "Needs approval": "border-[#3a3a3a] bg-[#111] text-[#d7d7d7]",
  Processing: "border-[#3a3a3a] bg-[#151515] text-white",
  Paid: "border-[#2a2a2a] bg-black text-[#a7a7a7]",
};

function StatusBadge({ status }: { status: MainboardInvoiceStatus }) {
  return (
    <span className={cn("inline-flex h-7 items-center rounded-[6px] border px-3 text-[12px] font-semibold", statusStyles[status])}>
      {status}
    </span>
  );
}

export default function MainboardPage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(mainboardInvoices[0].id);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const selectedInvoice = mainboardInvoices.find((invoice) => invoice.id === selectedInvoiceId) || mainboardInvoices[0];
  const selectedInvoices = mainboardInvoices.filter((invoice) => selectedIds.includes(invoice.id));
  const readyInvoices = mainboardInvoices.filter((invoice) => invoice.status === "Ready");
  const totalReady = readyInvoices.reduce((sum, invoice) => sum + invoice.amount + invoice.fee, 0);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return mainboardInvoices;
    return mainboardInvoices.filter((invoice) =>
      [invoice.id, invoice.invoiceNumber, invoice.recipient, invoice.email, invoice.status, invoice.jobType]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/request/${selectedInvoice.id}?mode=guest`);
  };

  const exportSelected = () => {
    const rows = (selectedInvoices.length ? selectedInvoices : [selectedInvoice]).map((invoice) => [
      invoice.invoiceNumber,
      invoice.recipient,
      invoice.jobType,
      invoice.due,
      formatMainboardMoney(invoice.amount + invoice.fee),
      invoice.status,
    ]);

    downloadTableReportPdf({
      title: "Mainboard Payables Export",
      subtitle: "AgncyPay-ready invoice queue export.",
      filename: "mainboard-payables.pdf",
      summary: [
        { label: "Workspace", value: "Mainboard LLC" },
        { label: "Invoices", value: rows.length.toString() },
        { label: "Ready total", value: formatMainboardMoney(totalReady) },
      ],
      columns: ["Invoice", "Payee", "Job", "Due", "Total", "Status"],
      rows,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-30 border-b border-[#151515] bg-black/95 backdrop-blur">
        <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#252525] bg-[#050505] px-3 text-[13px] font-semibold text-white hover:border-[#555]">
              <ArrowLeft className="h-4 w-4" />
              Home
            </Link>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#777]">Mainboard LLC</p>
              <h1 className="text-[20px] font-semibold text-white">Accounts Payable</h1>
            </div>
          </div>

          <div className="hidden w-full max-w-[520px] items-center gap-3 lg:flex">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search invoice, payee, job, or status"
                className="h-11 w-full rounded-[7px] border border-[#2b2b2b] bg-[#050505] pl-10 pr-4 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#666]"
              />
            </div>
          </div>

          <Link
            href={`/request/${selectedInvoice.id}?mode=guest`}
            className="inline-flex h-11 items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#ededed]"
          >
            Pay with AgncyPay
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            ["Ready to pay", readyInvoices.length.toString(), formatMainboardMoney(totalReady)],
            ["Needs approval", mainboardInvoices.filter((invoice) => invoice.status === "Needs approval").length.toString(), "Finance review"],
            ["Processing", mainboardInvoices.filter((invoice) => invoice.status === "Processing").length.toString(), "AgncyPay sync"],
            ["Paid this month", mainboardInvoices.filter((invoice) => invoice.status === "Paid").length.toString(), "Receipts available"],
          ].map(([label, value, detail]) => (
            <article key={label} className="rounded-[8px] border border-[#252525] bg-[#050505] p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#777]">{label}</p>
              <p className="mt-5 text-[30px] font-semibold leading-none text-white">{value}</p>
              <p className="mt-2 text-[13px] text-[#9a9a9a]">{detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
          <div className="space-y-5">
            <section className="rounded-[8px] border border-[#252525] bg-[#050505]">
              <div className="flex flex-col gap-3 border-b border-[#1f1f1f] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[18px] font-semibold text-white">Invoice queue</h2>
                  <p className="mt-1 text-[13px] text-[#8f8f8f]">Review approved vendor invoices and submit payment through AgncyPay.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={exportSelected}
                    className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-black px-3 text-[13px] font-semibold text-white hover:border-[#666]"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <Link
                    href={`/request/${selectedInvoice.id}?mode=guest`}
                    className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#ededed]"
                  >
                    Pay with AgncyPay
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[920px] table-fixed text-left">
                  <colgroup>
                    <col className="w-[48px]" />
                    <col className="w-[116px]" />
                    <col className="w-[210px]" />
                    <col className="w-[190px]" />
                    <col className="w-[120px]" />
                    <col className="w-[126px]" />
                    <col className="w-[118px]" />
                  </colgroup>
                  <thead>
                    <tr className="h-11 border-b border-[#202020] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#777]">
                      <th className="pl-4">
                        <input
                          type="checkbox"
                          aria-label="Select all visible invoices"
                          checked={filteredInvoices.length > 0 && selectedIds.length === filteredInvoices.length}
                          onChange={() =>
                            setSelectedIds((current) =>
                              current.length === filteredInvoices.length ? [] : filteredInvoices.map((invoice) => invoice.id)
                            )
                          }
                          className="h-4 w-4 accent-white"
                        />
                      </th>
                      <th>Invoice</th>
                      <th>Payee</th>
                      <th>Job</th>
                      <th>Due</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => {
                      const isActive = invoice.id === selectedInvoice.id;
                      const isSelected = selectedIds.includes(invoice.id);

                      return (
                        <tr
                          key={invoice.id}
                          onClick={() => setSelectedInvoiceId(invoice.id)}
                          className={cn("h-[68px] cursor-pointer border-b border-[#1d1d1d] hover:bg-white/[0.03]", isActive && "bg-white/[0.05]")}
                        >
                          <td className="pl-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(event) => {
                                event.stopPropagation();
                                setSelectedIds((current) =>
                                  current.includes(invoice.id) ? current.filter((id) => id !== invoice.id) : [...current, invoice.id]
                                );
                              }}
                              onClick={(event) => event.stopPropagation()}
                              className="h-4 w-4 accent-white"
                            />
                          </td>
                          <td className="font-mono text-[14px] font-semibold text-white">{invoice.invoiceNumber}</td>
                          <td>
                            <p className="truncate text-[14px] font-semibold text-white">{invoice.recipient}</p>
                            <p className="mt-1 truncate text-[12px] text-[#8f8f8f]">{invoice.email}</p>
                          </td>
                          <td>
                            <p className="truncate text-[14px] text-white">{invoice.jobType}</p>
                            <p className="mt-1 text-[12px] text-[#8f8f8f]">{invoice.poNumber}</p>
                          </td>
                          <td className="text-[13px] text-[#d7d7d7]">{invoice.due}</td>
                          <td className="text-[14px] font-semibold text-white">{formatMainboardMoney(invoice.amount + invoice.fee)}</td>
                          <td>
                            <StatusBadge status={invoice.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {selectedIds.length > 0 && (
              <section className="rounded-[8px] border border-[#252525] bg-[#050505] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[13px] font-semibold text-white">{selectedIds.length} invoice{selectedIds.length === 1 ? "" : "s"} selected</p>
                    <p className="mt-1 text-[13px] text-[#8f8f8f]">Batch export is ready. Payment sessions are created per invoice in this demo.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedIds([])}
                    className="h-10 rounded-[7px] border border-[#333] bg-black px-3 text-[13px] font-semibold text-white hover:border-[#666]"
                  >
                    Clear selection
                  </button>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-5">
            <section className="rounded-[8px] border border-[#252525] bg-[#050505] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#777]">Selected invoice</p>
                  <h2 className="mt-2 text-[24px] font-semibold text-white">{selectedInvoice.recipient}</h2>
                  <p className="mt-2 text-[13px] leading-5 text-[#8f8f8f]">{selectedInvoice.note}</p>
                </div>
                <StatusBadge status={selectedInvoice.status} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-[7px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#777]">Invoice</p>
                  <p className="mt-2 font-mono text-[15px] font-semibold text-white">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div className="rounded-[7px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#777]">Due</p>
                  <p className="mt-2 text-[15px] font-semibold text-white">{selectedInvoice.due}</p>
                </div>
                <div className="rounded-[7px] border border-[#222] bg-black p-3">
                  <p className="text-[12px] text-[#777]">Total</p>
                  <p className="mt-2 text-[15px] font-semibold text-white">{formatMainboardMoney(selectedInvoice.amount + selectedInvoice.fee)}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  href={`/request/${selectedInvoice.id}?mode=guest`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#ededed]"
                >
                  Pay with AgncyPay
                </Link>
                <button
                  type="button"
                  onClick={copyShareLink}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#333] bg-black px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  <Copy className="h-4 w-4" />
                  Copy session link
                </button>
              </div>
            </section>

            <section className="rounded-[8px] border border-[#252525] bg-[#050505] p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-white" />
                <p className="text-[14px] font-semibold text-white">AgncyPay session details</p>
              </div>
              <div className="mt-4 space-y-3 text-[13px]">
                {[
                  ["Payer", selectedInvoice.payer],
                  ["Payee", selectedInvoice.recipient],
                  ["Settlement ETA", selectedInvoice.settlementEta],
                  ["Auth mode", "Mainboard user, no AgncyPay account required"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-2">
                    <span className="text-[#8f8f8f]">{label}</span>
                    <span className="text-right text-white">{value}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-[12px] text-[#8f8f8f]">
                <Check className="h-4 w-4 text-white" />
                Payment status syncs back to Mainboard after submission.
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
