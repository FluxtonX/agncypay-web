import { type MainboardInvoice, mainboardInvoices, findMainboardInvoice } from "./mainboard";

export const dashboardPeopleByInvoiceId: Record<string, string> = {
  "MB-6984": "Nike",
  "MB-7012": "Zara",
  "MB-7044": "Adidas",
  "MB-6890": "Spotify",
  "MB-6815": "Netflix",
};

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
> = {
  "MB-6984": {
    mark: "Nike",
    label: "Nike",
    src: "https://cdn.simpleicons.org/nike/FFFFFF",
    className: "bg-black text-white",
  },
  "MB-7012": {
    mark: "Zara",
    label: "Zara",
    src: "https://cdn.simpleicons.org/zara/000000",
    className: "bg-white text-black",
  },
  "MB-7044": {
    mark: "Adidas",
    label: "Adidas",
    src: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    className: "bg-white",
  },
  "MB-6890": {
    mark: "Spotify",
    label: "Spotify",
    src: "https://cdn.simpleicons.org/spotify/1DB954",
    className: "bg-black text-white",
  },
  "MB-6815": {
    mark: "Netflix",
    label: "Netflix",
    src: "https://cdn.simpleicons.org/netflix/E50914",
    className: "bg-black text-white",
  },
};

const recipientInvoiceIds: Record<string, string[]> = {
  nike: ["MB-6984"],
  "john-adams": ["MB-6984", "MB-7012"],
  "amy-holland": ["MB-7012", "MB-7044"],
  "lucy-che": ["MB-7044", "MB-6890"],
  "jessica-bailey": ["MB-6890", "MB-6815"],
  "lola-durant": ["MB-6815", "MB-6984"],
  "bank-of-america": ["MB-7012"],
};

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
  const mappedIds = recipientInvoiceIds[recipientId];
  if (mappedIds?.length) {
    return mappedIds
      .map((id) => findMainboardInvoice(id))
      .filter((invoice): invoice is MainboardInvoice => invoice !== null);
  }

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

  return matched.length > 0 ? matched : mainboardInvoices.slice(0, 5);
}
