export function money(cents: number, currency = "USD"): string {
  const value = (cents || 0) / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/** Always shows cents — for receipts, statements and anything that must add up. */
export function moneyExact(cents: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(
      (cents || 0) / 100
    );
  } catch {
    return `${currency} ${((cents || 0) / 100).toFixed(2)}`;
  }
}

export function parseMoney(input: string): number | null {
  const cleaned = input.replace(/[^0-9.]/g, "");
  if (!cleaned || cleaned.split(".").length > 2) return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value)) return null;
  return Math.round(value * 100);
}

export function dateShort(ms: number | undefined | null): string {
  if (!ms) return "—";
  const d = new Date(ms);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", ...(sameYear ? {} : { year: "numeric" }) });
}

export function dateLong(ms: number | undefined | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function dateTime(ms: number | undefined | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function relTime(ms: number | undefined | null, now = Date.now()): string {
  if (!ms) return "—";
  const diff = Math.max(0, now - ms);
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return dateShort(ms);
}

export function initials(name: string): string {
  const parts = (name || "?").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function plural(n: number, one: string, many = `${one}s`): string {
  return `${n} ${n === 1 ? one : many}`;
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const text = String(cell ?? "");
          // Neutralise spreadsheet formulas in exported text cells.
          const safe = typeof cell === "string" && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
          return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
        })
        .join(",")
    )
    .join("\n");
}

export function bankLabel(a: { institution: string; mask: string } | null | undefined): string {
  return a ? `${a.institution} ••${a.mask}` : "—";
}
