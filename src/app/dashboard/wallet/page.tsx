"use client";

import React, { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Download,
  Plus,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { downloadTableReportPdf } from "../../../lib/pdfExport";

type AccountType = "Primary" | "Backup";

type Account = {
  id: string;
  name: string;
  mask: string;
  type: AccountType;
  balance: number;
  verified: boolean;
};

type WalletTransaction = {
  id: string;
  accountId: string;
  title: string;
  date: string;
  amount: number;
  direction: "in" | "out";
};

const initialAccounts: Account[] = [
  {
    id: "chase-business-checking",
    name: "Chase Business Checking",
    mask: "1234",
    type: "Primary",
    balance: 125480,
    verified: true,
  },
  {
    id: "wells-fargo-business-savings",
    name: "Wells Fargo Business Savings",
    mask: "5678",
    type: "Backup",
    balance: 250000,
    verified: true,
  },
];

const transactions: WalletTransaction[] = [
  {
    id: "txn-001",
    accountId: "chase-business-checking",
    title: "Payment to Brand Studio",
    date: "19/05/2026",
    amount: -15800,
    direction: "out",
  },
  {
    id: "txn-002",
    accountId: "chase-business-checking",
    title: "Payment to Marketing Pro",
    date: "18/05/2026",
    amount: -8900,
    direction: "out",
  },
  {
    id: "txn-003",
    accountId: "wells-fargo-business-savings",
    title: "ACH Deposit",
    date: "17/05/2026",
    amount: 50000,
    direction: "in",
  },
  {
    id: "txn-004",
    accountId: "chase-business-checking",
    title: "Payment to Digital Agency",
    date: "16/05/2026",
    amount: -32100,
    direction: "out",
  },
  {
    id: "txn-005",
    accountId: "chase-business-checking",
    title: "Payment to Media Partners",
    date: "15/05/2026",
    amount: -18200,
    direction: "out",
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactMoney(value: number) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }

  return formatMoney(value);
}

function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon?: React.ReactNode;
}) {
  return (
    <section className="flex h-[194px] flex-col justify-between rounded-[13px] border border-[#676767] bg-black px-4 py-[25px] md:px-[17px]">
      <div>
        <h2 className="text-[20px] font-normal leading-6 text-[#777]">
          {title}
        </h2>
        <p className="mt-[26px] text-[36px] font-semibold leading-none text-white">
          {value}
        </p>
      </div>
      <p className="flex items-center gap-2 text-[17px] leading-5 text-[#949494]">
        {icon}
        {detail}
      </p>
    </section>
  );
}

function AccountCard({
  account,
  onViewTransactions,
  onSettings,
}: {
  account: Account;
  onViewTransactions: (accountId: string) => void;
  onSettings: (accountId: string) => void;
}) {
  return (
    <section className="rounded-[8px] border border-[#393939] bg-[#050505] px-[29px] py-[29px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-[20px]">
          <div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[8px] bg-[#2c2c2c] text-[#d8d8d8]">
            <Building2 className="h-[29px] w-[29px]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-[14px]">
              <h3 className="truncate text-[29px] font-semibold leading-none text-white">
                {account.name}
              </h3>
              <span className="inline-flex h-[28px] min-w-[100px] items-center justify-center rounded-[7px] border border-[#d7d7d7] bg-[#3e3e3e] px-[15px] text-[15px] font-semibold leading-none text-white">
                {account.type}
              </span>
            </div>
            <p className="mt-[15px] text-[17px] leading-5 text-[#9b9b9b]">
              Account •••• {account.mask}
            </p>
            <p className="mt-[11px] flex items-center gap-[6px] text-[15px] leading-4 text-[#9b9b9b]">
              <CheckCircle2 className="h-[17px] w-[17px]" />
              {account.verified ? "Verified" : "Pending verification"}
            </p>
          </div>
        </div>

        <div className="text-left md:text-right">
          <p className="text-[17px] leading-5 text-[#777]">Balance</p>
          <p className="mt-[13px] text-[25px] font-semibold leading-none text-white">
            {formatMoney(account.balance)}
          </p>
        </div>
      </div>

      <div className="mt-[24px] border-t border-[#454545] pt-[20px]">
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => onViewTransactions(account.id)}
            className="h-[39px] rounded-[7px] border border-[#686868] bg-[#0c0c0c] px-[25px] text-[17px] font-semibold text-white transition-colors hover:border-[#8a8a8a]"
          >
            View Transactions
          </button>
          <button
            type="button"
            onClick={() => onSettings(account.id)}
            className="h-[39px] rounded-[7px] border border-[#444] bg-[#0c0c0c] px-[25px] text-[17px] font-semibold text-[#9b9b9b] transition-colors hover:border-[#777] hover:text-white"
          >
            Settings
          </button>
        </div>
      </div>
    </section>
  );
}

function TransactionIcon({ direction }: { direction: WalletTransaction["direction"] }) {
  const Icon = direction === "in" ? TrendingUp : TrendingDown;

  return (
    <div className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[8px] bg-[#2c2c2c] text-[#d8d8d8]">
      <Icon className="h-[22px] w-[22px]" />
    </div>
  );
}

export default function WalletPage() {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    mask: "",
    balance: "",
  });

  const availableBalance =
    accounts.find((account) => account.type === "Primary")?.balance ?? 0;
  const pendingSettlements = 50300;
  const monthlyOutflow = 623000;

  const visibleTransactions = useMemo(
    () =>
      selectedAccountId
        ? transactions.filter((transaction) => transaction.accountId === selectedAccountId)
        : transactions,
    [selectedAccountId]
  );

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId);

  const addPaymentMethod = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextAccount: Account = {
      id: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: form.name.trim(),
      mask: form.mask.trim().slice(-4),
      type: accounts.some((account) => account.type === "Primary") ? "Backup" : "Primary",
      balance: Number(form.balance) || 0,
      verified: true,
    };

    setAccounts((currentAccounts) => [...currentAccounts, nextAccount]);
    setForm({ name: "", mask: "", balance: "" });
    setIsAddOpen(false);
  };

  const toggleAccountType = (accountId: string) => {
    setAccounts((currentAccounts) =>
      currentAccounts.map((account) => {
        if (account.id === accountId) {
          return { ...account, type: "Primary" };
        }

        return account.type === "Primary" ? { ...account, type: "Backup" } : account;
      })
    );
  };

  const exportTransactions = () => {
    downloadTableReportPdf({
      title: "Wallet Transactions",
      subtitle: "Recent wallet movement export with source account and transaction direction.",
      filename: "agncypay-wallet-transactions.pdf",
      summary: [
        { label: "Transactions", value: visibleTransactions.length.toString() },
        {
          label: "Deposits",
          value: formatMoney(visibleTransactions.filter((transaction) => transaction.amount > 0).reduce((total, transaction) => total + transaction.amount, 0)),
        },
        {
          label: "Outflow",
          value: formatMoney(Math.abs(visibleTransactions.filter((transaction) => transaction.amount < 0).reduce((total, transaction) => total + transaction.amount, 0))),
        },
      ],
      columns: ["Title", "Date", "Amount", "Direction", "Account"],
      rows: visibleTransactions.map((transaction) => {
        const account = accounts.find((item) => item.id === transaction.accountId);

        return [
          transaction.title,
          transaction.date,
          formatMoney(transaction.amount),
          transaction.direction === "in" ? "Deposit" : "Payment",
          account?.name ?? "Unknown",
        ];
      }),
    });
  };

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-none text-white">
            Wallet
          </h1>
          <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
            Manage funding sources and payment methods
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex h-[41px] items-center justify-center gap-[13px] rounded-[7px] border border-white bg-white px-[34px] text-[17px] font-semibold text-black transition-colors hover:bg-[#e8e8e8] md:mt-[14px]"
        >
          <Plus className="h-[18px] w-[18px]" />
          Add Payment Method
        </button>
      </div>

      <div className="mt-[31px] grid grid-cols-1 gap-[29px] md:grid-cols-3">
        <StatCard
          title="Available Balance"
          value={formatMoney(availableBalance)}
          detail="Last updated 2 hours ago"
        />
        <StatCard
          title="Pending Settlements"
          value={formatMoney(pendingSettlements)}
          detail="2 payments processing"
        />
        <StatCard
          title="Monthly Outflow"
          value={formatCompactMoney(monthlyOutflow)}
          detail="+12% vs last month"
          icon={<TrendingUp className="h-5 w-5 stroke-[1.8]" />}
        />
      </div>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <h2 className="text-[29px] font-semibold leading-none text-white">
          Connected Accounts
        </h2>
        <div className="mt-[36px] space-y-[20px]">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onViewTransactions={setSelectedAccountId}
              onSettings={toggleAccountType}
            />
          ))}
        </div>
      </section>

      <section className="mt-[29px] rounded-[13px] border border-[#676767] bg-black px-[29px] py-[31px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-[29px] font-semibold leading-none text-white">
              Recent Transactions
            </h2>
            {selectedAccount && (
              <button
                type="button"
                onClick={() => setSelectedAccountId(null)}
                className="mt-3 text-[14px] font-semibold text-[#9b9b9b] transition-colors hover:text-white"
              >
                Showing {selectedAccount.name}. Clear filter
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={exportTransactions}
            className="inline-flex h-[36px] items-center justify-center gap-[12px] rounded-[7px] px-[12px] text-[17px] font-semibold text-[#9b9b9b] transition-colors hover:text-white"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        <div className="mt-[31px] space-y-[15px]">
          {visibleTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 rounded-[8px] border border-[#303030] bg-black px-[20px] py-[20px]"
            >
              <div className="flex min-w-0 items-center gap-[15px]">
                <TransactionIcon direction={transaction.direction} />
                <div className="min-w-0">
                  <p className="truncate text-[17px] font-semibold leading-5 text-white">
                    {transaction.title}
                  </p>
                  <p className="mt-[5px] text-[15px] leading-4 text-[#777]">
                    {transaction.date}
                  </p>
                </div>
              </div>
              <p
                className={cn(
                  "shrink-0 text-[20px] font-semibold leading-6",
                  transaction.amount > 0 ? "text-white" : "text-[#d7d7d7]"
                )}
              >
                {transaction.amount > 0 ? "+" : "-"}
                {formatMoney(Math.abs(transaction.amount))}
              </p>
            </div>
          ))}
          {visibleTransactions.length === 0 && (
            <div className="rounded-[8px] border border-[#303030] px-5 py-12 text-center text-[17px] text-[#8f8f8f]">
              No transactions found.
            </div>
          )}
        </div>
      </section>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <form
            onSubmit={addPaymentMethod}
            className="w-full max-w-[520px] rounded-[13px] border border-[#676767] bg-black p-[29px] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[29px] font-semibold leading-none text-white">
                Add Payment Method
              </h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                aria-label="Close add payment method"
                className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#444] text-[#b8b8b8] hover:border-[#777] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-[28px] grid grid-cols-1 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-[#8d8d8d]">
                  Account Name
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Bank of America Operating"
                  className="h-[40px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-[#8d8d8d]">
                  Last 4 Digits
                </span>
                <input
                  required
                  value={form.mask}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      mask: event.target.value,
                    }))
                  }
                  placeholder="9012"
                  maxLength={4}
                  className="h-[40px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[14px] font-semibold text-[#8d8d8d]">
                  Balance
                </span>
                <input
                  required
                  value={form.balance}
                  onChange={(event) =>
                    setForm((currentForm) => ({
                      ...currentForm,
                      balance: event.target.value,
                    }))
                  }
                  placeholder="125000"
                  className="h-[40px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-[28px] h-[42px] w-full rounded-[7px] border border-white bg-white text-[16px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
            >
              Save Payment Method
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
