import { Avatar, RETAINED_COLOR, SPLIT_COLORS, SplitBar } from "@/components/ui";
import { StagePill } from "@/components/status";
import { money } from "@/lib/format";
import type { Allocation } from "@/lib/types";

/** How an invoice divides between recipients and what the agency retains. */
export function InvoiceSplit({ amount, currency, allocations, showStatus = true }: { amount: number; currency: string; allocations: Allocation[]; showStatus?: boolean }) {
  const sorted = [...allocations].sort((a, b) => b.net - a.net);
  const allocated = sorted.reduce((s, a) => s + a.net, 0);
  const retained = amount - allocated;
  const segments = [
    ...sorted.map((a, i) => ({ label: a.recipientName, value: a.net, color: SPLIT_COLORS[(i + 1) % SPLIT_COLORS.length] })),
    { label: "Retained by agency", value: Math.max(0, retained), color: RETAINED_COLOR },
  ];
  return (
    <div>
      <SplitBar segments={segments} />
      <ul className="mt-4 divide-y divide-line">
        {sorted.map((a, i) => (
          <li key={a.id} className="flex flex-wrap items-center gap-3 py-3">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: SPLIT_COLORS[(i + 1) % SPLIT_COLORS.length] }} />
            <Avatar name={a.recipientName} size={30} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">
                {a.recipientName}
                <span className="ml-2 text-xs font-normal capitalize text-muted">{a.recipientType}</span>
              </p>
              <p className="truncate text-xs text-muted">{a.description}</p>
            </div>
            <div className="text-right">
              <p className="tabular text-sm font-semibold text-ink">{money(a.net, currency)}</p>
              <p className="tabular text-[11px] text-muted">
                {money(a.gross, currency)} gross
                {a.commission > 0 && ` · −${money(a.commission, currency)} comm.`}
                {a.deductions > 0 && ` · −${money(a.deductions, currency)} ded.`}
              </p>
            </div>
            {showStatus && <StagePill allocation={a} />}
          </li>
        ))}
        <li className="flex items-center gap-3 py-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: RETAINED_COLOR }} />
          <p className="flex-1 text-sm text-muted">Retained by agency</p>
          <p className="tabular text-sm font-semibold text-ink">{money(retained, currency)}</p>
        </li>
      </ul>
    </div>
  );
}
