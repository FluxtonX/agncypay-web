"use client";

import React, { useState } from "react";
import { BarChart3, CalendarDays, Download, FileText } from "lucide-react";

type ReportId =
  | "payment-summary"
  | "invoice-activity"
  | "agency-spend"
  | "settlement-status";

type ReportCard = {
  id: ReportId;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  rows: string[][];
  summary: { label: string; value: string }[];
};

const reports: ReportCard[] = [
  {
    id: "payment-summary",
    title: "Monthly Payment Summary",
    description:
      "Comprehensive breakdown of all payments by agency, campaign, and status",
    icon: BarChart3,
    rows: [
      ["Agency", "Payments", "Total", "Status"],
      ["Brand Studio", "1", "$15,800", "Completed"],
      ["Marketing Pro", "2", "$23,200", "Mixed"],
      ["Digital Agency", "1", "$32,100", "Processing"],
      ["Media Partners", "1", "$18,200", "Processing"],
    ],
    summary: [
      { label: "Total Volume", value: "$89,300" },
      { label: "Agencies", value: "4" },
      { label: "Completed", value: "2" },
    ],
  },
  {
    id: "invoice-activity",
    title: "Invoice Activity Report",
    description:
      "Detailed invoice lifecycle tracking with approval timelines and metrics",
    icon: FileText,
    rows: [
      ["Invoice", "Agency", "Status", "Due Date"],
      ["INV-2845", "Creative Co", "Pending", "22/05/2026"],
      ["INV-2844", "Media Partners", "Approved", "21/05/2026"],
      ["INV-2843", "Digital Agency", "Processing", "20/05/2026"],
      ["INV-2842", "Brand Studio", "Paid", "19/05/2026"],
    ],
    summary: [
      { label: "Invoices", value: "4" },
      { label: "Pending", value: "1" },
      { label: "Paid", value: "1" },
    ],
  },
  {
    id: "agency-spend",
    title: "Agency Spend Analysis",
    description:
      "Year-to-date spending analysis by agency with trend comparisons",
    icon: CalendarDays,
    rows: [
      ["Agency", "YTD Spend", "Invoices", "Trend"],
      ["Creative Co", "$245K", "28", "+12%"],
      ["Media Partners", "$198K", "22", "+8%"],
      ["Digital Agency", "$187K", "19", "+5%"],
      ["Brand Studio", "$156K", "16", "+3%"],
    ],
    summary: [
      { label: "YTD Spend", value: "$786K" },
      { label: "Invoices", value: "85" },
      { label: "Avg. Trend", value: "+7%" },
    ],
  },
  {
    id: "settlement-status",
    title: "Settlement Status Report",
    description:
      "Real-time settlement tracking with expected completion dates",
    icon: FileText,
    rows: [
      ["Payment", "Invoice", "Status", "Expected Completion"],
      ["PAY-9821", "INV-2842", "Completed", "19/05/2026"],
      ["PAY-9820", "INV-2841", "Completed", "18/05/2026"],
      ["PAY-9819", "INV-2843", "Processing", "22/05/2026"],
      ["PAY-9818", "INV-2844", "Processing", "23/05/2026"],
    ],
    summary: [
      { label: "Settlements", value: "4" },
      { label: "Completed", value: "2" },
      { label: "Processing", value: "2" },
    ],
  },
];

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pdfText(
  x: number,
  y: number,
  size: number,
  value: string,
  font = "F1",
  color = "1 1 1"
) {
  return `${color} rg BT /${font} ${size} Tf ${x} ${y} Td (${pdfEscape(value)}) Tj ET`;
}

function pdfLine(x1: number, y1: number, x2: number, y2: number, color = "0.72") {
  return `${color} G ${x1} ${y1} m ${x2} ${y2} l S`;
}

function pdfRect(
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke?: string
) {
  const commands = [`${fill} rg ${x} ${y} ${width} ${height} re f`];

  if (stroke) {
    commands.push(`${stroke} RG ${x} ${y} ${width} ${height} re S`);
  }

  return commands.join("\n");
}

function buildReportPdf(report: ReportCard) {
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
  const content: string[] = [
    "0.03 0.03 0.03 rg 0 0 612 792 re f",
    pdfRect(42, 704, 528, 48, "1 1 1"),
    pdfText(62, 726, 18, "AgncyPay", "F2", "0 0 0"),
    pdfText(470, 728, 10, "CONFIDENTIAL", "F2", "0 0 0"),
    "0.18 0.18 0.18 rg 463 722 88 18 re f",
    pdfText(478, 727, 8, "FINANCE REPORT", "F2"),
    pdfText(42, 662, 26, report.title, "F2"),
    pdfText(42, 639, 12, report.description, "F1", "0.72 0.72 0.72"),
    pdfText(42, 615, 10, `Generated ${generatedAt}`, "F1", "0.72 0.72 0.72"),
    pdfText(390, 615, 10, "Workspace: Acme Corp", "F1", "0.72 0.72 0.72"),
  ];

  const summaryWidth = 162;
  report.summary.forEach((item, index) => {
    const x = 42 + index * 183;
    content.push(pdfRect(x, 548, summaryWidth, 48, "0.08 0.08 0.08", "0.38 0.38 0.38"));
    content.push(pdfText(x + 16, 578, 9, item.label, "F1", "0.68 0.68 0.68"));
    content.push(pdfText(x + 16, 558, 18, item.value, "F2"));
  });

  const tableX = 42;
  const tableY = 486;
  const rowHeight = 34;
  const colWidths = [160, 120, 104, 132];
  const header = report.rows[0];
  const rows = report.rows.slice(1);

  content.push(pdfText(tableX, tableY + 38, 15, "Report Details", "F2"));
  content.push(pdfRect(tableX, tableY, 528, rowHeight, "0.16 0.16 0.16", "0.42 0.42 0.42"));

  let headerX = tableX + 12;
  header.forEach((cell, index) => {
    content.push(pdfText(headerX, tableY + 12, 10, cell, "F2"));
    headerX += colWidths[index] ?? 120;
  });

  rows.forEach((row, rowIndex) => {
    const y = tableY - rowHeight * (rowIndex + 1);
    content.push(pdfRect(tableX, y, 528, rowHeight, rowIndex % 2 === 0 ? "0.06 0.06 0.06" : "0.04 0.04 0.04"));
    content.push(pdfLine(tableX, y, tableX + 528, y, "0.19"));

    let rowX = tableX + 12;
    row.forEach((cell, index) => {
      const font = index === 0 || index === 2 ? "F2" : "F1";
      content.push(pdfText(rowX, y + 12, 10, cell, font));
      rowX += colWidths[index] ?? 120;
    });
  });

  const footerY = 88;
  content.push(pdfLine(42, footerY + 30, 570, footerY + 30, "0.28"));
  content.push(pdfText(42, footerY + 8, 9, "This report was generated from frontend demo data for review and export workflows.", "F1", "0.72 0.72 0.72"));
  content.push(pdfText(450, footerY + 8, 9, "Page 1 of 1", "F1", "0.72 0.72 0.72"));

  const stream = content.join("\n");
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj",
    `6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`,
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

export default function ReportsPage() {
  const [generatingId, setGeneratingId] = useState<ReportId | null>(null);
  const [lastGeneratedId, setLastGeneratedId] = useState<ReportId | null>(null);

  const generateReport = (report: ReportCard) => {
    setGeneratingId(report.id);

    window.setTimeout(() => {
      const pdf = buildReportPdf(report);
      const blob = new Blob([pdf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${report.id}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setGeneratingId(null);
      setLastGeneratedId(report.id);
    }, 550);
  };

  return (
    <div className="w-full max-w-[1048px]">
      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">
          Reports
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
          Generate financial reports and analytics exports
        </p>
      </div>

      <div className="mt-[34px] grid grid-cols-1 gap-[29px] xl:grid-cols-2">
        {reports.map((report) => {
          const Icon = report.icon;
          const isGenerating = generatingId === report.id;

          return (
            <section
              key={report.id}
              className="rounded-[13px] border border-[#676767] bg-black px-[29px] py-[29px]"
            >
              <div className="flex items-center gap-[15px]">
                <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[8px] bg-[#2c2c2c] text-[#d8d8d8]">
                  <Icon className="h-[23px] w-[23px]" />
                </div>
                <h2 className="text-[22px] font-semibold leading-6 text-white">
                  {report.title}
                </h2>
              </div>

              <p className="mt-[27px] min-h-[50px] text-[17px] leading-6 text-[#9b9b9b]">
                {report.description}
              </p>

              <button
                type="button"
                onClick={() => generateReport(report)}
                disabled={isGenerating}
                className="mt-[30px] inline-flex h-[42px] w-full items-center justify-center gap-[13px] rounded-[7px] border border-white bg-white text-[16px] font-semibold text-black transition-colors hover:bg-[#e8e8e8] disabled:cursor-wait disabled:opacity-70"
              >
                {isGenerating ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                ) : (
                  <Download className="h-[18px] w-[18px]" />
                )}
                {isGenerating ? "Generating..." : "Generate Report"}
              </button>

              {lastGeneratedId === report.id && !isGenerating && (
                <p className="mt-3 text-center text-[13px] font-semibold text-[#8d8d8d]">
                  Report generated successfully.
                </p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
