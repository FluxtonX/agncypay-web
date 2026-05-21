export type PdfTableReport = {
  title: string;
  subtitle: string;
  filename: string;
  summary?: { label: string; value: string }[];
  columns: string[];
  rows: string[][];
  footerNote?: string;
};

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

function pdfLine(x1: number, y1: number, x2: number, y2: number, color = "0.28") {
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

function splitText(value: string, maxLength: number) {
  if (value.length <= maxLength) return [value];

  const words = value.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;

    if (nextLine.length > maxLength) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.slice(0, 2);
}

function buildTableReportPdf(report: PdfTableReport) {
  const generatedAt = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
  const content: string[] = [
    "0.03 0.03 0.03 rg 0 0 612 792 re f",
    pdfRect(42, 704, 528, 48, "1 1 1"),
    pdfText(62, 726, 18, "AgncyPay", "F2", "0 0 0"),
    pdfText(454, 728, 10, "PROFESSIONAL EXPORT", "F2", "0 0 0"),
    "0.18 0.18 0.18 rg 448 722 106 18 re f",
    pdfText(460, 727, 8, "PDF REPORT", "F2"),
    pdfText(42, 662, 25, report.title, "F2"),
  ];

  splitText(report.subtitle, 74).forEach((line, index) => {
    content.push(pdfText(42, 638 - index * 15, 11, line, "F1", "0.72 0.72 0.72"));
  });

  content.push(pdfText(42, 604, 9, `Generated ${generatedAt}`, "F1", "0.72 0.72 0.72"));
  content.push(pdfText(412, 604, 9, "Workspace: Acme Corp", "F1", "0.72 0.72 0.72"));

  const summary = report.summary?.slice(0, 3) ?? [];
  if (summary.length > 0) {
    const summaryWidth = 162;
    summary.forEach((item, index) => {
      const x = 42 + index * 183;
      content.push(pdfRect(x, 536, summaryWidth, 48, "0.08 0.08 0.08", "0.38 0.38 0.38"));
      content.push(pdfText(x + 16, 566, 9, item.label, "F1", "0.68 0.68 0.68"));
      content.push(pdfText(x + 16, 546, 17, item.value, "F2"));
    });
  }

  const tableX = 42;
  let currentY = summary.length > 0 ? 472 : 536;
  const rowHeight = 32;
  const tableWidth = 528;
  const columnCount = report.columns.length;
  const columnWidth = tableWidth / columnCount;

  content.push(pdfText(tableX, currentY + 38, 15, "Table Details", "F2"));
  content.push(pdfRect(tableX, currentY, tableWidth, rowHeight, "0.16 0.16 0.16", "0.42 0.42 0.42"));
  report.columns.forEach((column, index) => {
    content.push(pdfText(tableX + 10 + index * columnWidth, currentY + 12, 9, column, "F2"));
  });

  currentY -= rowHeight;
  report.rows.slice(0, 12).forEach((row, rowIndex) => {
    content.push(pdfRect(tableX, currentY, tableWidth, rowHeight, rowIndex % 2 === 0 ? "0.06 0.06 0.06" : "0.04 0.04 0.04"));
    content.push(pdfLine(tableX, currentY, tableX + tableWidth, currentY, "0.19"));

    row.forEach((cell, index) => {
      const maxLength = Math.max(10, Math.floor(columnWidth / 6));
      const value = cell.length > maxLength ? `${cell.slice(0, maxLength - 1)}...` : cell;

      content.push(pdfText(tableX + 10 + index * columnWidth, currentY + 12, 9, value, index === 0 ? "F2" : "F1"));
    });

    currentY -= rowHeight;
  });

  const footerY = 84;
  content.push(pdfLine(42, footerY + 30, 570, footerY + 30, "0.28"));
  content.push(pdfText(42, footerY + 8, 9, report.footerNote ?? "Generated from AgncyPay dashboard data for review and reconciliation.", "F1", "0.72 0.72 0.72"));
  content.push(pdfText(452, footerY + 8, 9, "Page 1 of 1", "F1", "0.72 0.72 0.72"));

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

export function downloadTableReportPdf(report: PdfTableReport) {
  const pdf = buildTableReportPdf(report);
  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = report.filename.endsWith(".pdf")
    ? report.filename
    : `${report.filename}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
