"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  FileText,
  Landmark,
  MoreHorizontal,
  Search,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AgncyPayLogo } from "../../../components/payment/AgncyPayLogo";
import { cn } from "../../../lib/utils";

type FlowMode = "send" | "request";
type FlowStage = "select" | "details" | "review" | "success";

type Contact = {
  id: string;
  name: string;
  handle: string;
  email: string;
  initials: string;
  logo: string;
};

const contacts: Contact[] = [
  {
    id: "adidas",
    name: "Adidas",
    handle: "@adidas",
    email: "payables@adidas.com",
    initials: "AD",
    logo: "https://www.google.com/s2/favicons?domain=adidas.com&sz=128",
  },
  {
    id: "nike",
    name: "Nike, Inc.",
    handle: "@nike",
    email: "treasury@nike.com",
    initials: "NK",
    logo: "https://www.google.com/s2/favicons?domain=nike.com&sz=128",
  },
  {
    id: "airbnb",
    name: "Airbnb",
    handle: "@airbnb",
    email: "billing@airbnb.com",
    initials: "AB",
    logo: "https://www.google.com/s2/favicons?domain=airbnb.com&sz=128",
  },
  {
    id: "spotify",
    name: "Spotify",
    handle: "@spotify",
    email: "ap@spotify.com",
    initials: "SP",
    logo: "https://www.google.com/s2/favicons?domain=spotify.com&sz=128",
  },
  {
    id: "land-rover",
    name: "Land Rover",
    handle: "@landrover",
    email: "finance@landrover.com",
    initials: "LR",
    logo: "https://www.google.com/s2/favicons?domain=landrover.com&sz=128",
  },
  {
    id: "the-north-face",
    name: "The North Face",
    handle: "@thenorthface",
    email: "invoices@thenorthface.com",
    initials: "NF",
    logo: "https://www.google.com/s2/favicons?domain=thenorthface.com&sz=128",
  },
];

const quickTools = [
  { label: "Add card or bank", icon: CreditCard, href: "/dashboard/wallet/link" },
  { label: "Create an invoice", icon: FileText, href: "/dashboard/invoices" },
  { label: "Brand directory", icon: Users, href: "/dashboard/profile" },
  { label: "Wallet", icon: Landmark, href: "/dashboard/wallet" },
];

function ContactAvatar({ contact, size = "md" }: { contact: Contact; size?: "sm" | "md" | "lg" }) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#4a4a4a] bg-white text-center font-semibold text-black",
        size === "sm" && "h-9 w-9 p-1 text-[10px]",
        size === "md" && "h-12 w-12 p-1.5 text-[12px]",
        size === "lg" && "h-16 w-16 p-2 text-[14px]"
      )}
    >
      {failed ? (
        <span>{contact.initials}</span>
      ) : (
        <img
          src={contact.logo}
          alt={contact.name}
          className="h-full w-full object-contain"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function StepShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="w-full">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#777]">
          AgncyPay transfer
        </p>
        <h1 className="mt-2 text-[30px] font-semibold leading-none text-white">{title}</h1>
        <p className="mt-3 max-w-[660px] text-[14px] leading-6 text-[#8f8f8f]">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export default function SendRequestPage() {
  const [mode, setMode] = useState<FlowMode>("send");
  const [stage, setStage] = useState<FlowStage>("select");
  const [query, setQuery] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(contacts[0].id);
  const [amount, setAmount] = useState("400.00");
  const [currency, setCurrency] = useState("USD");
  const [note, setNote] = useState("");
  const [fundingMethod, setFundingMethod] = useState("AgncyPay balance");

  const selectedContact = contacts.find((contact) => contact.id === selectedContactId) ?? contacts[0];
  const filteredContacts = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) return contacts;

    return contacts.filter((contact) =>
      [contact.name, contact.handle, contact.email].join(" ").toLowerCase().includes(normalized)
    );
  }, [query]);

  const actionText = mode === "send" ? "Send payment" : "Request payment";
  const resultText =
    mode === "send"
      ? `${currency} ${amount || "0.00"} has been sent to ${selectedContact.name}.`
      : `A ${currency} ${amount || "0.00"} request has been sent to ${selectedContact.name}.`;

  const resetFlow = () => {
    setStage("select");
    setQuery("");
    setNote("");
  };

  return (
    <div className="w-full max-w-[1120px]">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#222] pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#050505] px-3 text-[13px] font-semibold text-white hover:border-[#666]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
          <AgncyPayLogo imageClassName="h-7 sm:h-8" />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            ["send", "Send"],
            ["request", "Request"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setMode(key as FlowMode);
                setStage("select");
              }}
              className={cn(
                  "h-10 rounded-full border px-5 text-[13px] font-semibold transition-colors",
                mode === key
                  ? "border-white bg-white text-black"
                  : "border-[#333] bg-[#0b0b0b] text-white hover:border-[#666]"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {stage === "select" && (
        <StepShell
          title={mode === "send" ? "Send payment to" : "Request payment from"}
          subtitle="Search by brand, wallet ID, email, or pick a recent brand from the AgncyPay network."
        >
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <section className="rounded-[13px] border border-[#3a3a3a] bg-[#050505] p-5">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Brand, wallet ID, email, mobile"
                  className="h-12 w-full rounded-full border border-[#444] bg-black pl-11 pr-4 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#777]"
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {filteredContacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => {
                      setSelectedContactId(contact.id);
                      setStage("details");
                    }}
                    className={cn(
                      "flex min-h-[116px] flex-col items-center justify-center rounded-[8px] border bg-black px-2 py-3 text-center transition-colors hover:border-[#777]",
                      selectedContact.id === contact.id ? "border-white" : "border-[#333]"
                    )}
                  >
                    <ContactAvatar contact={contact} />
                    <p className="mt-3 line-clamp-2 text-[12px] font-semibold leading-4 text-white">
                      {contact.name}
                    </p>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setStage("details")}
                className="mt-5 h-11 rounded-full border border-white bg-white px-8 text-[13px] font-semibold text-black hover:bg-[#e8e8e8] disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!selectedContact}
              >
                Next
              </button>
            </section>

            <aside className="space-y-4">
              <section className="rounded-[13px] border border-[#3a3a3a] bg-[#050505] p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-semibold text-white">More ways</h2>
                  <MoreHorizontal className="h-4 w-4 text-[#8f8f8f]" />
                </div>
                <div className="mt-4 space-y-3">
                  {quickTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <Link
                        key={tool.label}
                        href={tool.href}
                        className="flex items-center gap-3 rounded-[8px] border border-[#333] bg-black p-3 hover:border-[#666]"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#444] bg-[#0b0b0b]">
                          <Icon className="h-4 w-4 text-white" />
                        </span>
                        <span className="text-[13px] font-semibold text-white">{tool.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-[13px] border border-[#3a3a3a] bg-[#050505] p-5">
                <h2 className="text-[18px] font-semibold text-white">Recent brands</h2>
                <div className="mt-4 flex flex-wrap gap-3">
                  {contacts.slice(0, 4).map((contact) => (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => {
                        setSelectedContactId(contact.id);
                        setStage("details");
                      }}
                      className="flex flex-col items-center gap-2"
                    >
                      <ContactAvatar contact={contact} size="sm" />
                      <span className="max-w-[66px] truncate text-[11px] text-[#bdbdbd]">{contact.name}</span>
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </StepShell>
      )}

      {stage === "details" && (
        <StepShell
          title={mode === "send" ? "Enter payment amount" : "Enter request amount"}
          subtitle="Add the amount and an optional note before reviewing the transfer."
        >
          <section className="mx-auto max-w-[520px] rounded-[13px] border border-[#3a3a3a] bg-[#050505] p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <ContactAvatar contact={selectedContact} size="lg" />
              <div className="min-w-0">
                <h2 className="truncate text-[22px] font-semibold text-white">{selectedContact.name}</h2>
                <p className="mt-1 text-[13px] text-[#8f8f8f]">{selectedContact.handle}</p>
              </div>
            </div>

            <div className="mt-6 flex items-end gap-3 border-b border-[#333] pb-3">
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                inputMode="decimal"
                className="min-w-0 flex-1 bg-transparent text-[42px] font-semibold leading-none text-white outline-none placeholder:text-[#444]"
                placeholder="0.00"
              />
              <select
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className="h-10 rounded-full border border-[#444] bg-black px-3 text-[13px] font-semibold text-white outline-none"
              >
                <option>USD</option>
                <option>EUR</option>
                <option>GBP</option>
              </select>
            </div>

            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 280))}
              placeholder="Add a note"
              className="mt-5 min-h-[96px] w-full resize-none rounded-[8px] border border-[#333] bg-black p-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#666]"
            />
            <p className="mt-2 text-right text-[12px] text-[#777]">{note.length}/280</p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setStage("review")}
                className="h-11 rounded-full border border-white bg-white px-5 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
              >
                Next
              </button>
              <button
                type="button"
                onClick={() => setStage("select")}
                className="h-10 text-[13px] font-semibold text-[#bdbdbd] hover:text-white"
              >
                Cancel
              </button>
            </div>
          </section>
        </StepShell>
      )}

      {stage === "review" && (
        <StepShell
          title={mode === "send" ? "Review payment" : "Review request"}
          subtitle="Confirm the recipient, amount, and funding details before continuing."
        >
          <section className="mx-auto max-w-[640px] rounded-[13px] border border-[#3a3a3a] bg-[#050505] p-5 sm:p-6">
            <div className="flex items-center gap-4 border-b border-[#242424] pb-5">
              <ContactAvatar contact={selectedContact} />
              <div>
                <p className="text-[13px] text-[#8f8f8f]">{mode === "send" ? "Sending to brand" : "Requesting from brand"}</p>
                <h2 className="mt-1 text-[22px] font-semibold text-white">{selectedContact.name}</h2>
              </div>
            </div>

            <div className="mt-5 space-y-3 rounded-[8px] border border-[#242424] bg-black p-4">
              <div className="flex justify-between gap-4">
                <span className="text-[13px] text-[#8f8f8f]">Amount</span>
                <span className="text-[14px] font-semibold text-white">
                  {currency} {amount || "0.00"}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[13px] text-[#8f8f8f]">Method</span>
                <select
                  value={fundingMethod}
                  onChange={(event) => setFundingMethod(event.target.value)}
                  className="max-w-[220px] rounded-[7px] border border-[#333] bg-[#0b0b0b] px-2 py-1 text-[13px] text-white outline-none"
                >
                  <option>AgncyPay balance</option>
                  <option>Chase Business Debit</option>
                  <option>Mercury Mastercard</option>
                </select>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[13px] text-[#8f8f8f]">Note</span>
                <span className="max-w-[260px] text-right text-[13px] text-white">{note || "No note added"}</span>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-[8px] border border-[#333] bg-black p-4 text-[13px] leading-5 text-[#9b9b9b]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-white" />
              AgncyPay will create a transaction record and update wallet activity after confirmation.
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setStage("success")}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border border-white bg-white px-5 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
              >
                <Send className="h-4 w-4" />
                {actionText}
              </button>
              <button
                type="button"
                onClick={() => setStage("details")}
                className="h-11 rounded-full border border-[#333] bg-[#111] px-5 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                Back
              </button>
            </div>
          </section>
        </StepShell>
      )}

      {stage === "success" && (
        <StepShell
          title={mode === "send" ? "Payment sent" : "Request sent"}
          subtitle="The transfer is recorded in AgncyPay activity and ready for follow-up."
        >
          <section className="mx-auto max-w-[520px] rounded-[13px] border border-[#3a3a3a] bg-[#050505] p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#1f7a43] bg-[#0d140f]">
              <CheckCircle2 className="h-8 w-8 text-[#39d26d]" />
            </div>
            <h2 className="mt-5 text-[24px] font-semibold text-white">{mode === "send" ? "Payment sent" : "Request sent"}</h2>
            <p className="mt-2 text-[14px] leading-6 text-[#8f8f8f]">{resultText}</p>

            <div className="mt-6 rounded-[8px] border border-[#242424] bg-black p-4 text-left">
              <div className="flex justify-between gap-4 border-b border-[#1d1d1d] pb-3">
                <span className="text-[13px] text-[#777]">Brand</span>
                <span className="text-[13px] font-semibold text-white">{selectedContact.name}</span>
              </div>
              <div className="flex justify-between gap-4 pt-3">
                <span className="text-[13px] text-[#777]">Reference</span>
                <span className="font-mono text-[13px] text-white">AP-{Math.floor(100000 + selectedContact.id.length * 831)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-full border border-white bg-white px-5 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={resetFlow}
                className="h-11 rounded-full border border-[#333] bg-[#111] px-5 text-[13px] font-semibold text-white hover:border-[#666]"
              >
                Send another
              </button>
            </div>
          </section>
        </StepShell>
      )}
    </div>
  );
}
