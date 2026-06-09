"use client";
export const dynamic = "force-dynamic";

import React, { useState } from "react";
import {
  Bell,
  Building2,
  CreditCard,
  KeyRound,
  Plug,
  Save,
  Shield,
  User,
  X,
} from "lucide-react";
import { IntegrationsMarketplace } from "@/components/dashboard/integrations/IntegrationsMarketplace";

type UserRole = "Admin" | "Approver" | "Viewer";
type QuickAction = "payment" | "notifications" | "api" | null;

type TeamUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

const initialUsers: TeamUser[] = [
  { id: "john", name: "John Doe", email: "john@acme.com", role: "Admin" },
  { id: "sarah", name: "Sarah Smith", email: "sarah@acme.com", role: "Approver" },
];

function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-[13px] border border-[#676767] bg-black px-[29px] py-[29px] ${className}`}>
      {children}
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-[9px] ${className}`}>
      <span className="text-[16px] font-semibold leading-5 text-white">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[41px] rounded-[7px] border border-[#444] bg-[#0c0c0c] px-[15px] text-[16px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
      />
    </label>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <section className="w-full max-w-[520px] rounded-[13px] border border-[#676767] bg-black p-[29px] shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[29px] font-semibold leading-none text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#444] text-[#b8b8b8] hover:border-[#777] hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-[24px]">{children}</div>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  const [organization, setOrganization] = useState({
    companyName: "Acme Corporation Inc.",
    ein: "XX-XXXXXXX",
    address: "123 Main St, San Francisco, CA 94105",
  });
  const [users, setUsers] = useState<TeamUser[]>(initialUsers);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("30 min");
  const [saveMessage, setSaveMessage] = useState("");
  const [quickAction, setQuickAction] = useState<QuickAction>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const updateRole = (userId: string, role: UserRole) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === userId ? { ...user, role } : user))
    );
  };

  const saveOrganization = () => {
    setSaveMessage("Changes saved");
    window.setTimeout(() => setSaveMessage(""), 1600);
  };

  const inviteTeamMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailName = inviteEmail.split("@")[0] || "New User";
    const displayName = emailName
      .split(/[._-]/)
      .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
      .join(" ");

    setUsers((currentUsers) => [
      ...currentUsers,
      {
        id: `${emailName}-${Date.now()}`,
        name: displayName,
        email: inviteEmail,
        role: "Viewer",
      },
    ]);
    setInviteEmail("");
    setInviteOpen(false);
  };


  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">
          Settings
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
          Manage your account and preferences
        </p>
      </div>

      <div className="mt-[34px] grid grid-cols-1 gap-[29px] xl:grid-cols-[minmax(0,645px)_306px]">
        <div className="space-y-[29px]">
          <Section>
            <div className="flex items-center gap-[12px]">
              <Building2 className="h-[24px] w-[24px] text-[#d8d8d8]" />
              <h2 className="text-[29px] font-semibold leading-none text-white">
                Organization
              </h2>
            </div>
            <p className="mt-[15px] text-[17px] leading-6 text-[#9b9b9b]">
              Manage your company information and details
            </p>

            <div className="mt-[28px] grid grid-cols-1 gap-[22px] md:grid-cols-2">
              <TextInput
                label="Company Name"
                value={organization.companyName}
                onChange={(value) =>
                  setOrganization((current) => ({ ...current, companyName: value }))
                }
              />
              <TextInput
                label="EIN"
                value={organization.ein}
                onChange={(value) =>
                  setOrganization((current) => ({ ...current, ein: value }))
                }
              />
              <TextInput
                label="Business Address"
                value={organization.address}
                onChange={(value) =>
                  setOrganization((current) => ({ ...current, address: value }))
                }
                className="md:col-span-2"
              />
            </div>

            <div className="mt-[18px] flex items-center gap-4">
              <button
                type="button"
                onClick={saveOrganization}
                className="inline-flex h-[38px] items-center justify-center gap-[12px] rounded-[7px] border border-white bg-white px-[26px] text-[16px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              {saveMessage && (
                <span className="text-[14px] font-semibold text-[#9b9b9b]">
                  {saveMessage}
                </span>
              )}
            </div>
          </Section>

          <Section>
            <div className="flex items-center gap-[12px]">
              <User className="h-[24px] w-[24px] text-[#d8d8d8]" />
              <h2 className="text-[29px] font-semibold leading-none text-white">
                Users & Permissions
              </h2>
            </div>
            <p className="mt-[15px] text-[17px] leading-6 text-[#9b9b9b]">
              Manage team access and roles
            </p>

            <div className="mt-[29px] space-y-[18px]">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 rounded-[7px] border border-[#303030] px-[18px] py-[18px] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-[17px] font-semibold leading-5 text-white">
                      {user.name}
                    </p>
                    <p className="mt-[7px] text-[15px] leading-4 text-[#8d8d8d]">
                      {user.email}
                    </p>
                  </div>
                  <select
                    value={user.role}
                    onChange={(event) =>
                      updateRole(user.id, event.target.value as UserRole)
                    }
                    className="h-[42px] rounded-[7px] border border-[#303030] bg-[#0c0c0c] px-[15px] text-[16px] font-semibold text-white outline-none focus:border-[#777] sm:w-[150px]"
                  >
                    <option>Admin</option>
                    <option>Approver</option>
                    <option>Viewer</option>
                  </select>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="mt-[18px] h-[37px] w-full rounded-[7px] border border-[#444] bg-[#0c0c0c] text-[16px] font-semibold text-white transition-colors hover:border-[#777]"
            >
              Invite Team Member
            </button>
          </Section>

          <Section>
            <div className="flex items-center gap-[12px]">
              <Shield className="h-[24px] w-[24px] text-[#d8d8d8]" />
              <h2 className="text-[29px] font-semibold leading-none text-white">
                Security
              </h2>
            </div>
            <p className="mt-[15px] text-[17px] leading-6 text-[#9b9b9b]">
              Configure authentication and security settings
            </p>

            <div className="mt-[35px] flex items-center justify-between gap-5">
              <div>
                <p className="text-[17px] font-semibold leading-5 text-white">
                  Multi-factor Authentication
                </p>
                <p className="mt-[7px] text-[15px] leading-4 text-[#8d8d8d]">
                  Require MFA for all users
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMfaEnabled((enabled) => !enabled)}
                aria-pressed={mfaEnabled}
                className={`flex h-[22px] w-[38px] items-center rounded-full p-[2px] transition-colors ${
                  mfaEnabled ? "bg-white" : "bg-[#333]"
                }`}
              >
                <span
                  className={`h-[18px] w-[18px] rounded-full transition-transform ${
                    mfaEnabled ? "translate-x-[16px] bg-black" : "bg-white"
                  }`}
                />
              </button>
            </div>

            <div className="mt-[24px] flex flex-col gap-5 border-t border-[#343434] pt-[24px] sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[17px] font-semibold leading-5 text-white">
                  Session Timeout
                </p>
                <p className="mt-[7px] text-[15px] leading-4 text-[#8d8d8d]">
                  Automatically log out inactive users
                </p>
              </div>
              <select
                value={sessionTimeout}
                onChange={(event) => setSessionTimeout(event.target.value)}
                className="h-[42px] rounded-[7px] border border-[#303030] bg-[#0c0c0c] px-[15px] text-[16px] font-semibold text-white outline-none focus:border-[#777] sm:w-[150px]"
              >
                <option>15 min</option>
                <option>30 min</option>
                <option>60 min</option>
              </select>
            </div>
          </Section>

          <Section>
            <div className="flex items-center gap-[12px]">
              <Plug className="h-[24px] w-[24px] text-[#d8d8d8]" />
              <h2 className="text-[29px] font-semibold leading-none text-white">
                Integrations
              </h2>
            </div>
            <p className="mt-[15px] mb-[29px] text-[17px] leading-6 text-[#9b9b9b]">
              Connect external systems and services to sync your data automatically.
            </p>
            <IntegrationsMarketplace />
          </Section>
        </div>

        <aside className="space-y-[29px]">
          <Section className="px-[28px] py-[34px]">
            <h2 className="text-[20px] font-semibold leading-6 text-white">
              Quick Actions
            </h2>
            <div className="mt-[34px] space-y-[10px]">
              {[
                ["payment", CreditCard, "Payment Methods"],
                ["notifications", Bell, "Notifications"],
                ["api", KeyRound, "API Keys"],
              ].map(([action, Icon, label]) => {
                const ActionIcon = Icon as typeof CreditCard;

                return (
                  <button
                    key={action as string}
                    type="button"
                    onClick={() => setQuickAction(action as QuickAction)}
                    className="flex h-[36px] w-full items-center gap-[12px] rounded-[7px] border border-[#303030] bg-[#0c0c0c] px-[13px] text-[16px] font-semibold text-white transition-colors hover:border-[#777]"
                  >
                    <ActionIcon className="h-[18px] w-[18px]" />
                    {label as string}
                  </button>
                );
              })}
            </div>
          </Section>

          <Section className="px-[28px] py-[34px]">
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Need Help?
            </h2>
            <p className="mt-[21px] text-[16px] leading-6 text-[#9b9b9b]">
              Contact our support team for assistance with your account settings
            </p>
            <a
              href="mailto:support@agncypay.com?subject=Settings support"
              className="mt-[17px] flex h-[37px] items-center justify-center rounded-[7px] border border-[#303030] bg-[#0c0c0c] text-[16px] font-semibold text-white transition-colors hover:border-[#777]"
            >
              Contact Support
            </a>
          </Section>
        </aside>
      </div>

      {inviteOpen && (
        <Modal title="Invite Team Member" onClose={() => setInviteOpen(false)}>
          <form onSubmit={inviteTeamMember}>
            <TextInput
              label="Work Email"
              value={inviteEmail}
              onChange={setInviteEmail}
            />
            <button
              type="submit"
              className="mt-[24px] h-[42px] w-full rounded-[7px] border border-white bg-white text-[16px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
            >
              Send Invite
            </button>
          </form>
        </Modal>
      )}

      {quickAction && (
        <Modal
          title={
            quickAction === "payment"
              ? "Payment Methods"
              : quickAction === "notifications"
                ? "Notifications"
                : "API Keys"
          }
          onClose={() => setQuickAction(null)}
        >
          {quickAction === "payment" && (
            <div className="space-y-3 text-[16px] text-[#b8b8b8]">
              <p className="rounded-[7px] border border-[#303030] p-4">
                Primary method: Chase Business Checking ••••1234
              </p>
              <p className="rounded-[7px] border border-[#303030] p-4">
                Backup method: Wells Fargo Business Savings ••••5678
              </p>
            </div>
          )}
          {quickAction === "notifications" && (
            <div className="space-y-3">
              {["Payment approvals", "Failed settlements", "Weekly reports"].map((item) => (
                <label
                  key={item}
                  className="flex items-center justify-between rounded-[7px] border border-[#303030] p-4 text-[16px] text-white"
                >
                  {item}
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-white" />
                </label>
              ))}
            </div>
          )}
          {quickAction === "api" && (
            <div className="space-y-3 text-[16px] text-[#b8b8b8]">
              <p className="rounded-[7px] border border-[#303030] p-4 font-mono">
                pk_live_agncypay_••••••••4f8a
              </p>
              <button
                type="button"
                onClick={() => alert("New API key generated for this demo workspace.")}
                className="h-[40px] w-full rounded-[7px] border border-white bg-white text-[16px] font-semibold text-black"
              >
                Generate New Key
              </button>
            </div>
          )}
        </Modal>
      )}
    </main>
  );
}
