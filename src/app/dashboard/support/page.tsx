"use client";

import React, { useMemo, useState } from "react";
import {
  BookOpen,
  FileText,
  HelpCircle,
  Mail,
  MessageCircle,
  Search,
  X,
} from "lucide-react";

type Article = {
  title: string;
  body: string;
};

const articles: Article[] = [
  {
    title: "How to approve and pay invoices",
    body: "Open Invoices, choose View Detail, review line items and totals, then select Approve & Pay. The invoice will move into the payment processing workflow.",
  },
  {
    title: "Setting up bank account connections",
    body: "Go to Wallet and add a payment method. Enter the bank label, last four digits, and opening balance. Verified accounts can be used for settlement workflows.",
  },
  {
    title: "Understanding payment fees and processing times",
    body: "AgencyPay fees are shown alongside each invoice. ACH payments usually settle within 1-3 business days while wire transfers are reflected faster.",
  },
  {
    title: "Managing team members and permissions",
    body: "Open Settings, invite a team member, and assign Admin, Approver, or Viewer roles. Role changes take effect immediately in this frontend workflow.",
  },
  {
    title: "Connecting your CRM system",
    body: "Use Settings > Integrations to connect Salesforce CRM, QuickBooks, or Slack. Connected systems can sync invoices, payment statuses, and activity events.",
  },
  {
    title: "Configuring payment approval workflows",
    body: "Use Settings to enable MFA, adjust session timeout, and manage approver roles. Approval rules help keep high-value settlements controlled.",
  },
];

function SupportCard({
  icon,
  title,
  description,
  buttonLabel,
  primary = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonLabel: string;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <section className="rounded-[13px] border border-[#676767] bg-black px-[28px] py-[29px]">
      <div className="flex h-[57px] w-[57px] items-center justify-center rounded-[8px] bg-[#2c2c2c] text-[#d8d8d8]">
        {icon}
      </div>
      <h2 className="mt-[29px] text-[22px] font-semibold leading-6 text-white">
        {title}
      </h2>
      <p className="mt-[35px] min-h-[48px] text-[17px] leading-6 text-[#9b9b9b]">
        {description}
      </p>
      <button
        type="button"
        onClick={onClick}
        className={`mt-[20px] h-[42px] w-full rounded-[7px] border text-[16px] font-semibold transition-colors ${
          primary
            ? "border-white bg-white text-black hover:bg-[#e8e8e8]"
            : "border-[#303030] bg-[#0c0c0c] text-white hover:border-[#777]"
        }`}
      >
        {buttonLabel}
      </button>
    </section>
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
      <section className="w-full max-w-[560px] rounded-[13px] border border-[#676767] bg-black p-[29px] shadow-2xl">
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

export default function SupportPage() {
  const [query, setQuery] = useState("");
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [modal, setModal] = useState<"docs" | "chat" | null>(null);
  const [chatMessages, setChatMessages] = useState([
    "Hi, this is AgencyPay Support. How can we help today?",
  ]);
  const [chatDraft, setChatDraft] = useState("");

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return articles;

    return articles.filter(
      (article) =>
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.body.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  const sendChat = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!chatDraft.trim()) return;

    setChatMessages((messages) => [
      ...messages,
      chatDraft.trim(),
      "Thanks. A support specialist will review this and follow up shortly.",
    ]);
    setChatDraft("");
  };

  return (
    <div className="w-full max-w-[1048px]">
      <div>
        <h1 className="text-[34px] font-semibold leading-none text-white">
          Help & Support
        </h1>
        <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
          Find answers and get assistance
        </p>
      </div>

      <section className="mt-[34px] rounded-[13px] border border-[#676767] bg-black px-[111px] py-[29px] max-lg:px-[29px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-[20px] top-1/2 h-[22px] w-[22px] -translate-y-1/2 text-[#9b9b9b]" />
          <input
            aria-label="Search help articles"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help articles..."
            className="h-[56px] w-full rounded-[7px] border border-[#444] bg-[#111] pl-[58px] pr-5 text-[17px] text-white outline-none placeholder:text-[#777] focus:border-[#8a8a8a]"
          />
        </label>
      </section>

      <div className="mt-[29px] grid grid-cols-1 gap-[29px] md:grid-cols-3">
        <SupportCard
          icon={<BookOpen className="h-[29px] w-[29px]" />}
          title="Documentation"
          description="Comprehensive guides and API references"
          buttonLabel="Browse Docs"
          onClick={() => setModal("docs")}
        />
        <SupportCard
          icon={<MessageCircle className="h-[29px] w-[29px]" />}
          title="Live Chat"
          description="Chat with our support team in real-time"
          buttonLabel="Start Chat"
          primary
          onClick={() => setModal("chat")}
        />
        <SupportCard
          icon={<Mail className="h-[29px] w-[29px]" />}
          title="Email Support"
          description="Send us a message and we'll respond within 24h"
          buttonLabel="Send Email"
          onClick={() => {
            window.location.href =
              "mailto:support@agncypay.com?subject=AgencyPay support request";
          }}
        />
      </div>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <h2 className="text-[29px] font-semibold leading-none text-white">
          Popular Help Articles
        </h2>

        <div className="mt-[36px] space-y-[14px]">
          {filteredArticles.map((article) => (
            <button
              key={article.title}
              type="button"
              onClick={() => setOpenArticle(article)}
              className="flex min-h-[64px] w-full items-center gap-[18px] rounded-[8px] border border-[#303030] bg-black px-[22px] py-[17px] text-left text-[17px] leading-5 text-white transition-colors hover:border-[#777]"
            >
              <FileText className="h-[22px] w-[22px] shrink-0 text-[#d8d8d8]" />
              {article.title}
            </button>
          ))}
          {filteredArticles.length === 0 && (
            <div className="rounded-[8px] border border-[#303030] px-5 py-10 text-center text-[17px] text-[#8f8f8f]">
              No help articles found.
            </div>
          )}
        </div>
      </section>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[8px] bg-[#2c2c2c] text-[#d8d8d8]">
            <HelpCircle className="h-[23px] w-[23px]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[29px] font-semibold leading-none text-white">
              System Status: All Systems Operational
            </h2>
            <p className="mt-[15px] text-[17px] leading-6 text-[#9b9b9b]">
              All AgencyPay services are running normally.{" "}
              <button
                type="button"
                onClick={() => alert("Status page: API, payments, CRM sync, and notifications are operational.")}
                className="font-semibold text-white underline decoration-[#777] underline-offset-4 hover:decoration-white"
              >
                View status page
              </button>
            </p>
          </div>
        </div>
      </section>

      {openArticle && (
        <Modal title={openArticle.title} onClose={() => setOpenArticle(null)}>
          <p className="text-[17px] leading-7 text-[#b8b8b8]">{openArticle.body}</p>
        </Modal>
      )}

      {modal === "docs" && (
        <Modal title="Documentation" onClose={() => setModal(null)}>
          <div className="space-y-3">
            {["Invoice workflows", "Payment methods", "Agency management", "API reference"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setOpenArticle(articles[0])}
                className="flex h-[48px] w-full items-center gap-3 rounded-[7px] border border-[#303030] px-4 text-left text-[16px] font-semibold text-white hover:border-[#777]"
              >
                <FileText className="h-5 w-5" />
                {item}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal === "chat" && (
        <Modal title="Live Chat" onClose={() => setModal(null)}>
          <div className="max-h-[260px] space-y-3 overflow-y-auto pr-2">
            {chatMessages.map((message, index) => (
              <div
                key={`${message}-${index}`}
                className={`rounded-[8px] border border-[#303030] px-4 py-3 text-[15px] leading-6 ${
                  index % 2 === 0
                    ? "bg-[#0c0c0c] text-[#b8b8b8]"
                    : "bg-white text-black"
                }`}
              >
                {message}
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="mt-4 flex gap-2">
            <input
              value={chatDraft}
              onChange={(event) => setChatDraft(event.target.value)}
              placeholder="Type your message..."
              className="h-[42px] min-w-0 flex-1 rounded-[7px] border border-[#444] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
            />
            <button
              type="submit"
              className="h-[42px] rounded-[7px] border border-white bg-white px-5 text-[15px] font-semibold text-black hover:bg-[#e8e8e8]"
            >
              Send
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
