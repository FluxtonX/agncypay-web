"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, CreditCard, Landmark, ShieldCheck } from "lucide-react";
import { cn } from "../../../../lib/utils";

type LinkType = "card" | "bank";

export default function WalletLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") === "bank" ? "bank" : "card";

  const [linkType, setLinkType] = useState<LinkType>(initialType);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    holder: "",
    number: "",
    expiry: "",
    cvc: "",
    bankName: "",
    routing: "",
    account: "",
  });

  const title = useMemo(
    () => (linkType === "card" ? "Link a card" : "Link a bank"),
    [linkType]
  );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-[1080px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-[#050505] px-3 text-[13px] font-semibold text-white hover:border-[#666]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Link>
        </div>

        <section className="mt-5 rounded-[13px] border border-[#3a3a3a] bg-[#050505] p-5 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#777]">
                Wallet setup
              </p>
              <h1 className="mt-2 text-[30px] font-semibold leading-none text-white">{title}</h1>
              <p className="mt-3 max-w-[620px] text-[14px] leading-6 text-[#8f8f8f]">
                Add a new card or bank account for AgncyPay payouts and settlement flows.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[#333] bg-black px-3 py-2 text-[12px] text-[#d7d7d7]">
              <ShieldCheck className="h-4 w-4 text-white" />
              Secure linking
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLinkType("card")}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-[7px] border px-3 text-[13px] font-semibold transition-colors",
                linkType === "card" ? "border-white bg-white text-black" : "border-[#333] bg-[#111] text-white hover:border-[#666]"
              )}
            >
              <CreditCard className="h-4 w-4" />
              Card
            </button>
            <button
              type="button"
              onClick={() => setLinkType("bank")}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-[7px] border px-3 text-[13px] font-semibold transition-colors",
                linkType === "bank" ? "border-white bg-white text-black" : "border-[#333] bg-[#111] text-white hover:border-[#666]"
              )}
            >
              <Landmark className="h-4 w-4" />
              Bank
            </button>
          </div>

          {!submitted ? (
            <form onSubmit={submit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {linkType === "card" ? (
                <>
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#8f8f8f]">Cardholder name</span>
                    <input
                      required
                      value={form.holder}
                      onChange={(event) => setForm((current) => ({ ...current, holder: event.target.value }))}
                      placeholder="Leo Tolstoy"
                      className="h-11 rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#8f8f8f]">Card number</span>
                    <input
                      required
                      value={form.number}
                      onChange={(event) => setForm((current) => ({ ...current, number: event.target.value }))}
                      placeholder="4242 4242 4242 4242"
                      className="h-11 rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#8f8f8f]">Expiry</span>
                    <input
                      required
                      value={form.expiry}
                      onChange={(event) => setForm((current) => ({ ...current, expiry: event.target.value }))}
                      placeholder="05 / 28"
                      className="h-11 rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#8f8f8f]">CVC</span>
                    <input
                      required
                      value={form.cvc}
                      onChange={(event) => setForm((current) => ({ ...current, cvc: event.target.value }))}
                      placeholder="123"
                      className="h-11 rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                    />
                  </label>
                </>
              ) : (
                <>
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#8f8f8f]">Bank name</span>
                    <input
                      required
                      value={form.bankName}
                      onChange={(event) => setForm((current) => ({ ...current, bankName: event.target.value }))}
                      placeholder="Chase Bank"
                      className="h-11 rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#8f8f8f]">Routing number</span>
                    <input
                      required
                      value={form.routing}
                      onChange={(event) => setForm((current) => ({ ...current, routing: event.target.value }))}
                      placeholder="021000021"
                      className="h-11 rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                    />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[13px] font-semibold text-[#8f8f8f]">Account number</span>
                    <input
                      required
                      value={form.account}
                      onChange={(event) => setForm((current) => ({ ...current, account: event.target.value }))}
                      placeholder="123456789"
                      className="h-11 rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[14px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                    />
                  </label>
                </>
              )}

              <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/dashboard/wallet"
                  className="inline-flex h-11 items-center justify-center rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  Link now
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-5 rounded-[13px] border border-[#3a3a3a] bg-black p-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#1f7a43] bg-[#0d140f]">
                <CheckCircle2 className="h-7 w-7 text-[#39d26d]" />
              </div>
              <h2 className="mt-4 text-[24px] font-semibold text-white">Link successful</h2>
              <p className="mt-2 text-[14px] leading-6 text-[#8f8f8f]">
                Your {linkType} details are now available for payout and settlement use.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    router.refresh();
                  }}
                  className="inline-flex h-11 items-center justify-center rounded-[7px] border border-[#333] bg-[#111] px-4 text-[13px] font-semibold text-white hover:border-[#666]"
                >
                  Link another
                </button>
                <Link
                  href="/dashboard/wallet"
                  className="inline-flex h-11 items-center justify-center rounded-[7px] border border-white bg-white px-4 text-[13px] font-semibold text-black hover:bg-[#e8e8e8]"
                >
                  Back to Wallet
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
