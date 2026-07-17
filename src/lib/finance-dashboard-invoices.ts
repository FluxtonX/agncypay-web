import { type MainboardInvoice, mainboardInvoices, findMainboardInvoice } from "./mainboard";

// Dynamic mappings — will be populated from real data, not hardcoded brands
export const dashboardPeopleByInvoiceId: Record<string, string> = {};

export const payeeLogoByInvoiceId: Record<
  string,
  {
    mark: string;
    label: string;
    detail?: string;
    src?: string;
    className: string;
    markClassName?: string;
  }
> = {};

export function getInvoiceClientName(invoice: MainboardInvoice) {
  return (
    dashboardPeopleByInvoiceId[invoice.id] ||
    invoice.talentRealName ||
    invoice.talentName ||
    invoice.recipient
  );
}

export function getInvoiceStatusLabel(status: string): "Request" | "Paid" | "Pay" {
  const normalized = status.toLowerCase();
  if (normalized === "paid") return "Paid";
  if (normalized === "ready" || normalized === "pending") return "Request";
  return "Pay";
}

export function getInvoicesForRecipient(recipientId: string, recipientName: string): MainboardInvoice[] {
  const normalized = recipientName.trim().toLowerCase();
  const matched = mainboardInvoices.filter((invoice) => {
    const client = getInvoiceClientName(invoice).toLowerCase();
    const talent = (invoice.talentRealName || invoice.talentName || "").toLowerCase();
    const recipient = invoice.recipient.toLowerCase();
    return (
      client === normalized ||
      client.includes(normalized) ||
      normalized.includes(client) ||
      talent.includes(normalized) ||
      recipient.includes(normalized)
    );
  });

  return matched;
}
