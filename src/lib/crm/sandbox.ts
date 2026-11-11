/**
 * AGNCY Sandbox CRM — a clearly labelled stand-in connector for beta testing.
 *
 * It produces the same normalised payload a real connector does, from a fixed set of fictional
 * bookings. Every brand, person and agency below is invented and every default address is on the
 * reserved example.com domain, so nothing here can reach a real inbox.
 */
import type { CrmAllocation, CrmContact, CrmInvoice, CrmSyncPayload, SandboxEdit } from "../types";

const DAY = 86_400_000;

export interface SandboxConfig {
  seededAt: number;
  brandEmail?: string;
  talentEmail?: string;
  partnerEmail?: string;
  edits?: Record<string, SandboxEdit>;
}

interface Party {
  id: string;
  name: string;
  email: string;
  kind: "talent" | "agency" | "brand";
}

const BRANDS: Party[] = [
  { id: "b-lumen", name: "Lumen & Lark Skincare", email: "billing@lumenlark.example.com", kind: "brand" },
  { id: "b-northpass", name: "Northpass Athletics", email: "ap@northpass.example.com", kind: "brand" },
  { id: "b-verde", name: "Maison Verde", email: "finance@maisonverde.example.com", kind: "brand" },
  { id: "b-kestrel", name: "Kestrel Audio", email: "accounts@kestrelaudio.example.com", kind: "brand" },
  { id: "b-juniper", name: "Juniper Hotels", email: "payables@juniperhotels.example.com", kind: "brand" },
];

const RECIPIENTS: Party[] = [
  { id: "t-amara", name: "Amara Okafor", email: "amara.okafor@talent.example.com", kind: "talent" },
  { id: "t-jonas", name: "Jonas Lindqvist", email: "jonas.lindqvist@talent.example.com", kind: "talent" },
  { id: "t-mei", name: "Mei Tanaka", email: "mei.tanaka@talent.example.com", kind: "talent" },
  { id: "t-rafael", name: "Rafael Duarte", email: "rafael.duarte@talent.example.com", kind: "talent" },
  { id: "t-sloane", name: "Sloane Avery", email: "sloane.avery@talent.example.com", kind: "talent" },
  { id: "a-parallel", name: "Parallel Talent Group", email: "payments@paralleltalent.example.com", kind: "agency" },
  { id: "a-fieldday", name: "Field Day Management", email: "finance@fielddaymgmt.example.com", kind: "agency" },
];

interface AllocSeed {
  to: string;
  what: string;
  gross: number;
  /** Agency commission as a percentage of gross. */
  pct: number;
  deductions?: number;
}

interface InvoiceSeed {
  id: string;
  number: string;
  brand: string;
  title: string;
  lines: [string, number][];
  issued: number;
  due: number;
  paid?: boolean;
  allocations: AllocSeed[];
}

/** Dollar amounts; `issued` and `due` are day offsets from the moment the sandbox was connected. */
const INVOICES: InvoiceSeed[] = [
  {
    id: "sbx-2039",
    number: "INV-2039",
    brand: "b-lumen",
    title: "Winter campaign — usage renewal",
    lines: [["12-month usage renewal, stills + paid social", 12000]],
    issued: -70,
    due: -40,
    paid: true,
    allocations: [{ to: "t-amara", what: "Usage renewal — winter campaign", gross: 9000, pct: 20 }],
  },
  {
    id: "sbx-2041",
    number: "INV-2041",
    brand: "b-lumen",
    title: "Spring campaign — stills and social",
    lines: [
      ["Talent fee — two shoot days", 30000],
      ["Usage — 12 months, digital and retail", 12000],
      ["Production coordination", 6000],
    ],
    issued: -20,
    due: 10,
    allocations: [
      { to: "t-amara", what: "Talent fee and usage — spring campaign", gross: 30000, pct: 20, deductions: 250 },
      { to: "a-parallel", what: "Co-booking commission — spring campaign", gross: 6000, pct: 0 },
    ],
  },
  {
    id: "sbx-2042",
    number: "INV-2042",
    brand: "b-northpass",
    title: "Runner launch film",
    lines: [
      ["Lead talent — launch film", 40000],
      ["Supporting talent — launch film", 15000],
      ["Agency production fee", 17500],
    ],
    issued: -40,
    due: -8,
    allocations: [
      { to: "t-jonas", what: "Lead talent — runner launch film", gross: 40000, pct: 20 },
      { to: "t-mei", what: "Supporting talent — runner launch film", gross: 15000, pct: 15, deductions: 150 },
    ],
  },
  {
    id: "sbx-2043",
    number: "INV-2043",
    brand: "b-verde",
    title: "Holiday lookbook",
    lines: [
      ["Talent fee — lookbook", 12000],
      ["Styling and coordination", 6200],
    ],
    issued: -5,
    due: 25,
    allocations: [{ to: "t-amara", what: "Talent fee — holiday lookbook", gross: 12000, pct: 20 }],
  },
  {
    id: "sbx-2044",
    number: "INV-2044",
    brand: "b-kestrel",
    title: "Podcast host — season two",
    lines: [
      ["Host fee — 8 episodes", 8000],
      ["Booking fee", 1600],
    ],
    issued: -12,
    due: 18,
    allocations: [{ to: "t-rafael", what: "Host fee — season two", gross: 8000, pct: 15 }],
  },
  {
    id: "sbx-2045",
    number: "INV-2045",
    brand: "b-juniper",
    title: "Destination series — three creators",
    lines: [
      ["Creator fees — three creators", 42000],
      ["Partner agency share", 4000],
      ["Campaign management", 8000],
    ],
    issued: -30,
    due: -2,
    allocations: [
      { to: "t-mei", what: "Creator fee — destination series", gross: 14000, pct: 20 },
      { to: "t-rafael", what: "Creator fee — destination series", gross: 14000, pct: 20 },
      { to: "t-sloane", what: "Creator fee — destination series", gross: 14000, pct: 20, deductions: 320 },
      { to: "a-fieldday", what: "Partner share — destination series", gross: 4000, pct: 0 },
    ],
  },
  {
    id: "sbx-2046",
    number: "INV-2046",
    brand: "b-northpass",
    title: "Athlete appearance — trade show",
    lines: [
      ["Appearance fee", 5000],
      ["Travel and booking", 1400],
    ],
    issued: -2,
    due: 28,
    allocations: [{ to: "t-jonas", what: "Appearance fee — trade show", gross: 5000, pct: 20 }],
  },
];

const cents = (dollars: number) => Math.round(dollars * 100);
const clean = (email: string | undefined) => (email || "").trim().toLowerCase();

export function sandboxParties(config: SandboxConfig): { brands: Party[]; recipients: Party[] } {
  const brandEmail = clean(config.brandEmail);
  const talentEmail = clean(config.talentEmail);
  const partnerEmail = clean(config.partnerEmail);
  return {
    // A tester's brand address stands in as the billing contact for every sandbox brand.
    brands: BRANDS.map((b) => (brandEmail ? { ...b, email: brandEmail } : b)),
    recipients: RECIPIENTS.map((r) => {
      if (r.id === "t-amara" && talentEmail) return { ...r, email: talentEmail };
      if (r.id === "a-parallel" && partnerEmail) return { ...r, email: partnerEmail };
      return r;
    }),
  };
}

export function generateSandbox(config: SandboxConfig): CrmSyncPayload {
  const { brands, recipients } = sandboxParties(config);
  const brandById = new Map(brands.map((b) => [b.id, b]));
  const recipientById = new Map(recipients.map((r) => [r.id, r]));
  const base = config.seededAt;

  const invoices: CrmInvoice[] = INVOICES.map((seed) => {
    const brand = brandById.get(seed.brand)!;
    const edit = config.edits?.[seed.id];
    const lines = seed.lines.map(([description, dollars]) => ({ description, amount: cents(dollars) }));
    const seededTotal = lines.reduce((s, l) => s + l.amount, 0);
    let amount = seededTotal;
    if (edit?.amount !== undefined && edit.amount > 0 && edit.amount !== seededTotal) {
      // A CRM edit to the total lands on the invoice as an adjustment line.
      lines.push({ description: "Adjustment", amount: edit.amount - seededTotal });
      amount = edit.amount;
    }
    const allocations: CrmAllocation[] = seed.allocations.map((a) => {
      const to = recipientById.get(a.to)!;
      const gross = cents(a.gross);
      const commission = Math.round((gross * a.pct) / 100);
      const deductions = cents(a.deductions ?? 0);
      return {
        key: a.to,
        recipientName: to.name,
        recipientEmail: to.email,
        recipientType: to.kind === "agency" ? "agency" : "talent",
        description: a.what,
        gross,
        commission,
        deductions,
        net: gross - commission - deductions,
      };
    });
    return {
      crmId: seed.id,
      number: seed.number,
      brandName: brand.name,
      brandEmail: brand.email,
      description: edit?.description?.trim() || seed.title,
      lines,
      amount,
      currency: "USD",
      issueDate: base + seed.issued * DAY,
      dueDate: edit?.dueDate ?? base + seed.due * DAY,
      status: seed.paid ? "paid" : "open",
      allocations,
    };
  });

  const contacts: CrmContact[] = [...brands, ...recipients].map((p) => ({
    crmId: p.id,
    name: p.name,
    email: p.email,
    phone: "",
    kind: p.kind,
  }));

  return { provider: "sandbox", company: null, invoices, contacts };
}
