"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Download,
  FileText,
  Settings,
  Shield,
  UserPlus,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { downloadTableReportPdf } from "../../../lib/pdfExport";

type ActivityType = "payment" | "invoice" | "account" | "team" | "settings" | "compliance";

type ActivityItem = {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  type: ActivityType;
};

const activityItems: ActivityItem[] = [
  {
    id: "act-001",
    actor: "John Doe",
    action: "Approved payment",
    target: "INV-2844",
    time: "2 hours ago",
    type: "payment",
  },
  {
    id: "act-002",
    actor: "System",
    action: "Invoice synced from CRM",
    target: "INV-2845",
    time: "4 hours ago",
    type: "invoice",
  },
  {
    id: "act-003",
    actor: "Sarah Smith",
    action: "Updated bank account",
    target: "Chase ****1234",
    time: "6 hours ago",
    type: "account",
  },
  {
    id: "act-004",
    actor: "John Doe",
    action: "Approved payment",
    target: "INV-2843",
    time: "Yesterday",
    type: "payment",
  },
  {
    id: "act-005",
    actor: "Mike Johnson",
    action: "Added team member",
    target: "jane@acme.com",
    time: "Yesterday",
    type: "team",
  },
  {
    id: "act-006",
    actor: "John Doe",
    action: "Updated payment preferences",
    target: "Settings",
    time: "2 days ago",
    type: "settings",
  },
  {
    id: "act-007",
    actor: "System",
    action: "KYB verification completed",
    target: "Compliance",
    time: "2 days ago",
    type: "compliance",
  },
  {
    id: "act-008",
    actor: "Sarah Smith",
    action: "Approved payment",
    target: "INV-2842",
    time: "3 days ago",
    type: "payment",
  },
];

const activityIcons = {
  payment: CheckCircle2,
  invoice: FileText,
  account: CreditCard,
  team: UserPlus,
  settings: Settings,
  compliance: Shield,
};

export default function ActivityPage() {
  const [filter, setFilter] = useState<ActivityType | "all">("all");

  const filteredItems = useMemo(
    () =>
      filter === "all"
        ? activityItems
        : activityItems.filter((item) => item.type === filter),
    [filter]
  );

  const exportLogs = () => {
    downloadTableReportPdf({
      title: "Activity Audit Log",
      subtitle: "Account activity export for operational review, compliance traceability, and audit support.",
      filename: "agncypay-activity-logs.pdf",
      summary: [
        { label: "Events", value: filteredItems.length.toString() },
        { label: "Category", value: filter === "all" ? "All" : filter },
        { label: "Source", value: "Dashboard" },
      ],
      columns: ["Actor", "Action", "Target", "Time", "Type"],
      rows: filteredItems.map((item) => [
        item.actor,
        item.action,
        item.target,
        item.time,
        item.type,
      ]),
    });
  };

  return (
    <div className="w-full max-w-[1048px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-none text-white">
            Activity
          </h1>
          <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
            Audit logs and account activity history
          </p>
        </div>

        <button
          type="button"
          onClick={exportLogs}
          className="inline-flex h-[36px] items-center justify-center gap-[12px] rounded-[6px] border border-[#5a5a5a] bg-[#0c0c0c] px-[34px] text-[14px] font-semibold text-white transition-colors hover:border-[#777] md:mt-[14px]"
        >
          <Download className="h-4 w-4" />
          Export Logs
        </button>
      </div>

      <section className="mt-[34px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[29px] font-semibold leading-none text-white">
            Recent Activity
          </h2>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="text-left text-[14px] font-semibold text-[#9b9b9b] transition-colors hover:text-white"
            >
              Showing {filter}. Clear filter
            </button>
          )}
        </div>

        <div className="mt-[36px] space-y-[20px]">
          {filteredItems.map((item) => {
            const Icon = activityIcons[item.type];

            return (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-[8px] border border-[#303030] bg-black px-[20px] py-[20px] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-[20px]">
                  <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[8px] bg-[#2c2c2c] text-[#d8d8d8]">
                    <Icon className="h-[24px] w-[24px]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[20px] leading-6 text-[#9b9b9b]">
                      <span className="font-semibold text-white">{item.actor}</span>{" "}
                      {item.action}{" "}
                      <span className="font-semibold text-white">{item.target}</span>
                    </p>
                    <p className="mt-[8px] text-[17px] leading-5 text-[#777]">
                      {item.time}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFilter(item.type)}
                  className={cn(
                    "h-[30px] min-w-[126px] rounded-[7px] border px-[17px] text-[15px] font-semibold leading-none transition-colors",
                    filter === item.type
                      ? "border-white bg-white text-black"
                      : "border-[#303030] bg-[#111] text-white hover:border-[#555]"
                  )}
                >
                  {item.type}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
