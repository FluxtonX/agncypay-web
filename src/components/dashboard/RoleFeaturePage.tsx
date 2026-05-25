"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Network,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useApp } from "../../context/AppContext";
import { Permission, WorkspaceType, normalizeWorkspaceType } from "../../types/workspace";

type FeatureKind =
  | "talent"
  | "splits"
  | "payouts"
  | "clients"
  | "vendors"
  | "reports"
  | "team"
  | "profile"
  | "treasury";

type FeatureRecord = {
  title: string;
  detail: string;
  value: string;
  status: string;
};

type FeatureConfig = {
  title: string;
  subtitle: string;
  cta: string;
  dialogTitle: string;
  dialogFields: { label: string; placeholder: string }[];
  metrics: { label: string; value: string; detail: string }[];
  records: FeatureRecord[];
};

const baseRecords: Record<FeatureKind, FeatureRecord[]> = {
  talent: [
    { title: "Jordan Lee", detail: "Creator - onboarding documents pending", value: "$12.4K", status: "KYC Pending" },
    { title: "Maya Chen", detail: "Fashion talent - payout verified", value: "$8.8K", status: "Active" },
    { title: "Noah Rivera", detail: "Agency talent - split template assigned", value: "$5.2K", status: "Active" },
  ],
  splits: [
    { title: "Creator Standard 80/20", detail: "Talent 80%, agency 20%, auto tax holdback", value: "128 talent", status: "Active" },
    { title: "Campaign Bonus Split", detail: "Tiered bonus after $50K gross campaign volume", value: "12 deals", status: "Review" },
    { title: "Mother Agency Override", detail: "2.5% enterprise oversight fee", value: "18 agencies", status: "Active" },
  ],
  payouts: [
    { title: "June Talent Batch", detail: "31 recipients via ACH", value: "$74,120", status: "Scheduled" },
    { title: "Brand Studio Settlement", detail: "Split reconciliation complete", value: "$18,400", status: "Ready" },
    { title: "Independent Talent Payout", detail: "Awaiting bank confirmation", value: "$3,200", status: "Processing" },
  ],
  clients: [
    { title: "Nike Studios", detail: "Brand client - Mainboard sync active", value: "$320K", status: "Active" },
    { title: "Netflix Originals", detail: "Content campaign invoices", value: "$148K", status: "Active" },
    { title: "Sony Music", detail: "Approval matrix pending", value: "$96K", status: "Setup" },
  ],
  vendors: [
    { title: "Production Vendor Group", detail: "W-9 and payout profile verified", value: "$84K", status: "Active" },
    { title: "Studio Rentals Co", detail: "KYB requires document refresh", value: "$42K", status: "Action" },
    { title: "Regional Fulfillment Ops", detail: "Parent agency approval required", value: "$118K", status: "Review" },
  ],
  reports: [
    { title: "Network Payout Exposure", detail: "Consolidated treasury report", value: "$1.2M", status: "Ready" },
    { title: "Agency Performance", detail: "GMV, SLA, dispute metrics", value: "18 agencies", status: "Ready" },
    { title: "Vendor Compliance", detail: "Missing docs and expiring KYB", value: "12 flags", status: "Action" },
  ],
  team: [
    { title: "Avery Brooks", detail: "Treasury admin", value: "Super Admin", status: "Active" },
    { title: "Sam Patel", detail: "Finance operations", value: "Finance Ops", status: "Active" },
    { title: "Riley Stone", detail: "Regional agency manager", value: "Manager", status: "Invited" },
  ],
  profile: [
    { title: "Agncy Identity", detail: "User identity and profile details", value: "Verified", status: "Active" },
    { title: "Payout Identity", detail: "Bank, tax, and payment recipient profile", value: "ACH", status: "Connected" },
    { title: "Workspace Membership", detail: "Permissions for active workspace", value: "Member", status: "Active" },
  ],
  treasury: [
    { title: "Operating Account", detail: "Primary treasury funding source", value: "$1.84M", status: "Verified" },
    { title: "Pending Release Queue", detail: "5 payout batches awaiting approval", value: "$420K", status: "Approval" },
    { title: "Risk Reserve", detail: "Configured settlement reserve", value: "$250K", status: "Active" },
  ],
};

function configFor(kind: FeatureKind, workspaceType: WorkspaceType): FeatureConfig {
  const isTalent = workspaceType === "talent_agency" || workspaceType === "talent_independent";
  const labels: Record<FeatureKind, Omit<FeatureConfig, "records">> = {
    talent: {
      title: workspaceType === "mother_agency" ? "Talent Network" : "Talent",
      subtitle: "Manage talent relationships, onboarding status, payout readiness, and profile controls.",
      cta: "Add Talent",
      dialogTitle: "Add Talent",
      dialogFields: [
        { label: "Talent Name", placeholder: "Jordan Lee" },
        { label: "Email", placeholder: "talent@example.com" },
        { label: "Category", placeholder: "Creator / Athlete / Artist" },
      ],
      metrics: [
        { label: "Active Talent", value: "128", detail: "9 onboarding" },
        { label: "KYC Complete", value: "91%", detail: "Network verified" },
        { label: "Payout Ready", value: "116", detail: "ACH connected" },
      ],
    },
    splits: {
      title: "Split Structures",
      subtitle: "Configure how invoice proceeds are distributed between talent, agencies, and overrides.",
      cta: "Create Split",
      dialogTitle: "Create Split Template",
      dialogFields: [
        { label: "Template Name", placeholder: "Creator Standard 80/20" },
        { label: "Talent Share", placeholder: "80%" },
        { label: "Agency Share", placeholder: "20%" },
      ],
      metrics: [
        { label: "Active Templates", value: "14", detail: "Across clients" },
        { label: "Auto Matched", value: "99.1%", detail: "This month" },
        { label: "Exceptions", value: "3", detail: "Need review" },
      ],
    },
    payouts: {
      title: "Payouts",
      subtitle: isTalent ? "Track your incoming payouts and payout account readiness." : "Review payout batches, settlement states, and approval readiness.",
      cta: isTalent ? "Update Payout Method" : "Create Payout Batch",
      dialogTitle: isTalent ? "Update Payout Method" : "Create Payout Batch",
      dialogFields: [
        { label: isTalent ? "Account Label" : "Batch Name", placeholder: isTalent ? "Primary ACH" : "June Talent Batch" },
        { label: "Amount", placeholder: "$12,000" },
        { label: "Notes", placeholder: "Settlement notes" },
      ],
      metrics: [
        { label: "Ready", value: "$74K", detail: "Scheduled payouts" },
        { label: "Processing", value: "$18K", detail: "ACH in flight" },
        { label: "Recipients", value: "31", detail: "Current batch" },
      ],
    },
    clients: {
      title: "Clients",
      subtitle: "Manage brand/client relationships, invoice sources, and Mainboard sync readiness.",
      cta: "Add Client",
      dialogTitle: "Add Client",
      dialogFields: [
        { label: "Client Name", placeholder: "Nike Studios" },
        { label: "Domain", placeholder: "https://client.com" },
        { label: "Contact Email", placeholder: "finance@client.com" },
      ],
      metrics: [
        { label: "Active Clients", value: "24", detail: "6 synced" },
        { label: "Open Invoices", value: "$186K", detail: "Client AR" },
        { label: "Approval SLA", value: "2.4d", detail: "Average" },
      ],
    },
    vendors: {
      title: "Vendors",
      subtitle: "Manage vendor identities, compliance status, and payment relationships.",
      cta: "Add Vendor",
      dialogTitle: "Add Vendor",
      dialogFields: [
        { label: "Vendor Name", placeholder: "Studio Rentals Co" },
        { label: "Email", placeholder: "billing@vendor.com" },
        { label: "Service Type", placeholder: "Production / Legal / Ops" },
      ],
      metrics: [
        { label: "Active Vendors", value: "64", detail: "12 require action" },
        { label: "Vendor Spend", value: "$1.1M", detail: "YTD" },
        { label: "KYB Complete", value: "82%", detail: "Vendor network" },
      ],
    },
    reports: {
      title: "Reports",
      subtitle: "Export consolidated network, payout, compliance, and treasury reports.",
      cta: "Generate Report",
      dialogTitle: "Generate Report",
      dialogFields: [
        { label: "Report Name", placeholder: "Network Payout Exposure" },
        { label: "Period", placeholder: "May 2026" },
        { label: "Audience", placeholder: "Treasury / Finance Ops" },
      ],
      metrics: [
        { label: "Ready Reports", value: "8", detail: "Available now" },
        { label: "Compliance Flags", value: "12", detail: "Open items" },
        { label: "Network GMV", value: "$8.7M", detail: "YTD" },
      ],
    },
    team: {
      title: "Team",
      subtitle: "Invite teammates, assign roles, and control permissioned workspace access.",
      cta: "Invite User",
      dialogTitle: "Invite Team Member",
      dialogFields: [
        { label: "Name", placeholder: "Avery Brooks" },
        { label: "Email", placeholder: "avery@company.com" },
        { label: "Role", placeholder: "Finance Ops" },
      ],
      metrics: [
        { label: "Active Users", value: "18", detail: "3 pending invites" },
        { label: "Admins", value: "4", detail: "Privileged access" },
        { label: "Approvers", value: "9", detail: "Invoice controls" },
      ],
    },
    profile: {
      title: "Profile",
      subtitle: "Manage user identity, workspace membership, payout identity, and verification readiness.",
      cta: "Update Profile",
      dialogTitle: "Update Profile",
      dialogFields: [
        { label: "Display Name", placeholder: "Jordan Lee" },
        { label: "Profile Email", placeholder: "you@example.com" },
        { label: "Professional Category", placeholder: "Creator" },
      ],
      metrics: [
        { label: "Identity", value: "Active", detail: "Agncy ID issued" },
        { label: "Verification", value: "KYC", detail: "Profile track" },
        { label: "Payouts", value: "ACH", detail: "Connected" },
      ],
    },
    treasury: {
      title: "Treasury",
      subtitle: "Monitor funding sources, payout reserves, approval queues, and release controls.",
      cta: "Add Treasury Rule",
      dialogTitle: "Add Treasury Rule",
      dialogFields: [
        { label: "Rule Name", placeholder: "Two approvers above $100K" },
        { label: "Threshold", placeholder: "$100,000" },
        { label: "Approver Group", placeholder: "Treasury" },
      ],
      metrics: [
        { label: "Available Funds", value: "$1.84M", detail: "Primary account" },
        { label: "Pending Release", value: "$420K", detail: "5 batches" },
        { label: "Reserve", value: "$250K", detail: "Configured" },
      ],
    },
  };

  return {
    ...labels[kind],
    records: baseRecords[kind],
  };
}

const iconByKind: Record<FeatureKind, React.ReactNode> = {
  talent: <UsersRound className="h-5 w-5" />,
  splits: <Network className="h-5 w-5" />,
  payouts: <BadgeDollarSign className="h-5 w-5" />,
  clients: <BriefcaseBusiness className="h-5 w-5" />,
  vendors: <BriefcaseBusiness className="h-5 w-5" />,
  reports: <FileText className="h-5 w-5" />,
  team: <UsersRound className="h-5 w-5" />,
  profile: <ShieldCheck className="h-5 w-5" />,
  treasury: <BadgeDollarSign className="h-5 w-5" />,
};

const permissionsByKind: Partial<Record<FeatureKind, Permission[]>> = {
  talent: ["manage_talent"],
  splits: ["view_splits"],
  payouts: ["approve_payouts", "manage_payout_settings"],
  clients: ["create_invoices"],
  vendors: ["manage_hierarchy"],
  reports: ["view_reports"],
  team: ["manage_team"],
  treasury: ["view_treasury"],
};

export function RoleFeaturePage({ kind }: { kind: FeatureKind }) {
  const { state } = useApp();
  const workspaceType = state.user ? normalizeWorkspaceType(state.user.accountType) : "brand";
  const activeMembership = state.memberships.find(
    (membership) => membership.workspaceId === state.activeWorkspaceId
  );
  const requiredPermissions = permissionsByKind[kind] ?? [];
  const hasAccess =
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) => activeMembership?.permissions.includes(permission));
  const config = useMemo(() => configFor(kind, workspaceType), [kind, workspaceType]);
  const [records, setRecords] = useState(config.records);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeatureRecord | null>(null);
  const [search, setSearch] = useState("");
  const [isActionRunning, setIsActionRunning] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    setRecords(config.records);
    setSearch("");
    setSelectedRecord(null);
  }, [config.records]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return records;

    return records.filter((record) =>
      [record.title, record.detail, record.value, record.status]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [records, search]);

  const submitDialog = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = config.dialogFields.map((field) => form[field.label] || field.placeholder);

    setRecords((currentRecords) => [
      {
        title: values[0],
        detail: values.slice(1).join(" - "),
        value: kind === "team" ? "Invited" : kind === "reports" ? "Queued" : "New",
        status: kind === "reports" ? "Generating" : "Draft",
      },
      ...currentRecords,
    ]);
    setForm({});
    setIsDialogOpen(false);
  };

  const runRecordAction = () => {
    if (!selectedRecord) return;

    setIsActionRunning(true);

    window.setTimeout(() => {
      const nextStatus =
        kind === "team"
          ? "Invited"
          : kind === "reports"
            ? "Ready"
            : kind === "payouts"
              ? "Scheduled"
              : kind === "treasury"
                ? "Active"
                : "Updated";

      setRecords((currentRecords) =>
        currentRecords.map((record) =>
          record.title === selectedRecord.title
            ? {
                ...record,
                status: nextStatus,
                value: kind === "reports" ? "Ready" : record.value,
              }
            : record
        )
      );
      setSelectedRecord({ ...selectedRecord, status: nextStatus });
      setIsActionRunning(false);
    }, 900);
  };

  const actionLabel =
    kind === "team"
      ? "Send Invite"
      : kind === "reports"
        ? "Generate Report"
        : kind === "payouts"
          ? "Schedule Payout"
          : kind === "treasury"
            ? "Activate Rule"
            : "Update Record";

  if (!hasAccess) {
    return (
      <div className="w-full max-w-[1048px]">
        <section className="rounded-[13px] border border-[#676767] bg-black px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#555] bg-[#111] text-white">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-[28px] font-semibold leading-tight text-white">
            Permission Required
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-[16px] leading-6 text-[#9b9b9b]">
            Your current workspace role does not include access to this area. Ask an admin to update your membership permissions.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1048px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-[#444] bg-[#101010] text-white">
              {iconByKind[kind]}
            </span>
            <h1 className="text-[34px] font-semibold leading-none text-white">
              {config.title}
            </h1>
          </div>
          <p className="mt-[18px] max-w-[760px] text-[20px] leading-6 text-[#9b9b9b]">
            {config.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row md:mt-[10px]">
          <button
            type="button"
            className="inline-flex h-[41px] items-center justify-center gap-[10px] rounded-[7px] border border-[#686868] bg-[#0c0c0c] px-[18px] text-[15px] font-semibold text-white transition-colors hover:border-[#8a8a8a]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            type="button"
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex h-[41px] items-center justify-center gap-[10px] rounded-[7px] border border-white bg-white px-[22px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
          >
            <Plus className="h-4 w-4" />
            {config.cta}
          </button>
        </div>
      </div>

      <div className="mt-[31px] grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-[29px]">
        {config.metrics.map((metric) => (
          <section key={metric.label} className="rounded-[13px] border border-[#676767] bg-black px-5 py-[24px]">
            <p className="text-[17px] leading-5 text-[#777]">{metric.label}</p>
            <p className="mt-[18px] break-words text-[31px] font-semibold leading-tight text-white">
              {metric.value}
            </p>
            <p className="mt-[12px] text-[15px] leading-5 text-[#949494]">
              {metric.detail}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[20px] py-[24px] sm:px-[29px] sm:py-[31px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[27px] font-semibold leading-none text-white">
            Current Records
          </h2>
          <label className="relative block w-full md:w-[320px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search records"
              className="h-[40px] w-full rounded-[7px] border border-[#333] bg-[#050505] pl-10 pr-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#777]"
            />
          </label>
        </div>
        <div className="mt-[26px] space-y-3">
          {filteredRecords.map((record, index) => (
            <div
              key={`${record.title}-${index}`}
              className="grid grid-cols-1 gap-4 rounded-[8px] border border-[#303030] bg-[#050505] px-5 py-4 md:grid-cols-[minmax(0,1fr)_120px_120px_96px] md:items-center"
            >
              <div className="min-w-0">
                <p className="truncate text-[18px] font-semibold leading-6 text-white">
                  {record.title}
                </p>
                <p className="mt-1 text-[14px] leading-5 text-[#858585]">
                  {record.detail}
                </p>
              </div>
              <p className="break-words text-[17px] font-semibold leading-tight text-white md:text-right">
                {record.value}
              </p>
              <span className="inline-flex h-8 w-fit items-center rounded-[7px] border border-[#444] bg-[#111] px-3 text-[13px] font-semibold text-[#d7d7d7] md:ml-auto">
                {record.status}
              </span>
              <button
                type="button"
                onClick={() => setSelectedRecord(record)}
                className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-[7px] border border-[#444] bg-[#101010] px-3 text-[13px] font-semibold text-white transition-colors hover:border-[#777] md:ml-auto"
              >
                <Eye className="h-4 w-4" />
                View
              </button>
            </div>
          ))}
          {filteredRecords.length === 0 && (
            <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-5 py-8 text-center text-[15px] text-[#8d8d8d]">
              No records match your search.
            </div>
          )}
        </div>
      </section>

      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm">
          <form
            onSubmit={submitDialog}
            className="flex max-h-[calc(100vh-40px)] w-full max-w-[520px] flex-col overflow-hidden rounded-[13px] border border-[#676767] bg-black shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#222] p-[24px] sm:p-[29px]">
              <h2 className="text-[27px] font-semibold leading-none text-white">
                {config.dialogTitle}
              </h2>
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                aria-label="Close dialog"
                className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#444] text-[#b8b8b8] hover:border-[#777] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-[24px] py-[25px] sm:px-[29px]">
              {config.dialogFields.map((field) => (
                <label key={field.label} className="flex flex-col gap-2">
                  <span className="text-[14px] font-semibold text-[#8d8d8d]">
                    {field.label}
                  </span>
                  <input
                    required
                    value={form[field.label] || ""}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        [field.label]: event.target.value,
                      }))
                    }
                    placeholder={field.placeholder}
                    className="h-[42px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                  />
                </label>
              ))}
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-[#222] p-[24px] sm:flex-row sm:justify-end sm:p-[29px]">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="h-[42px] rounded-[7px] border border-[#555] bg-[#151515] px-[20px] text-[15px] font-semibold text-white transition-colors hover:border-[#777]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-[42px] rounded-[7px] border border-white bg-white px-[20px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm">
          <section className="flex max-h-[calc(100vh-40px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[13px] border border-[#676767] bg-black shadow-2xl">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#222] px-5 py-5 sm:px-[29px]">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#777]">
                  {config.title}
                </p>
                <h2 className="mt-2 break-words text-[25px] font-semibold leading-tight text-white">
                  {selectedRecord.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close record detail"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border border-[#444] text-[#b8b8b8] hover:border-[#777] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-[29px]">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3">
                  <p className="text-[12px] text-[#777]">Status</p>
                  <p className="mt-2 text-[15px] font-semibold text-white">
                    {selectedRecord.status}
                  </p>
                </div>
                <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3">
                  <p className="text-[12px] text-[#777]">Value</p>
                  <p className="mt-2 break-words text-[15px] font-semibold text-white">
                    {selectedRecord.value}
                  </p>
                </div>
                <div className="rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-3">
                  <p className="text-[12px] text-[#777]">Workspace</p>
                  <p className="mt-2 truncate text-[15px] font-semibold text-white">
                    {workspaceType.replace("_", " ")}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-4">
                <p className="text-[13px] text-[#777]">Details</p>
                <p className="mt-2 text-[15px] leading-6 text-[#d7d7d7]">
                  {selectedRecord.detail}
                </p>
              </div>

              <div className="mt-4 flex items-start gap-3 rounded-[8px] border border-[#303030] bg-[#050505] px-4 py-4 text-[14px] leading-5 text-[#9b9b9b]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                Actions here update the frontend state for this workspace and keep the role permission boundary intact.
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 border-t border-[#222] px-5 py-5 sm:flex-row sm:justify-end sm:px-[29px]">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
                className="h-[42px] rounded-[7px] border border-[#555] bg-[#151515] px-[20px] text-[15px] font-semibold text-white transition-colors hover:border-[#777]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={runRecordAction}
                disabled={isActionRunning}
                className="inline-flex h-[42px] items-center justify-center gap-2 rounded-[7px] border border-white bg-white px-[20px] text-[15px] font-semibold text-black transition-colors hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isActionRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {actionLabel}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
