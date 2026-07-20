"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { cn } from "../../lib/utils";

// Card constants matching agncypay
const BOFA_BUSINESS_DEBIT_VISA_IMAGE =
  "https://business.bankofamerica.com/content/dam/consumer/business/deposits/checking-accounts/debit-cards/bofa_busdbtcm_v.png";
const CHASE_INK_BUSINESS_UNLIMITED_IMAGE = "/chase-ink-business-unlimited.png";
const MERCURY_IO_CARD_IMAGE = "/mercurycard.png";

function RemoteBrandImage({
  src,
  alt,
  fallback,
  className,
  imageClassName,
}: {
  src: string;
  alt: string;
  fallback: string;
  className?: string;
  imageClassName?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden w-full h-full", className)}>
      {failed ? (
        <div className="flex h-full w-full items-center justify-center rounded-[inherit] border border-white/10 bg-black px-1 text-center text-[10px] font-bold text-neutral-400">
          <span className="block max-w-full truncate">{fallback}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-contain", imageClassName)}
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      )}
    </div>
  );
}

function BankCardFace({ card }: { card: any }) {
  return (
    <div className="relative h-16 w-[104px] shrink-0 overflow-hidden rounded-[8px] bg-black">
      <RemoteBrandImage
        src={card.cardImage}
        alt={card.name}
        fallback={card.fallback}
        className="h-full w-full rounded-[inherit] bg-black"
        imageClassName="h-full w-full object-cover"
      />
    </div>
  );
}

export function BanksAndCardsPanel() {
  const router = useRouter();
  const [linkedCards, setLinkedCards] = useState<any[]>([
    {
      name: "Chase Ink Business Unlimited Visa",
      detail: "Visa ****86",
      cardImage: CHASE_INK_BUSINESS_UNLIMITED_IMAGE,
      fallback: "Chase",
    },
    {
      name: "Mercury Business IO Mastercard",
      detail: "Mastercard ****57",
      cardImage: MERCURY_IO_CARD_IMAGE,
      fallback: "Mercury",
    },
  ]);

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkModalStep, setLinkModalStep] = useState<
    "select" | "plaid_intro" | "plaid_banks" | "plaid_login" | "plaid_verifying" | "plaid_success" | "card_form" | "card_verifying" | "card_success"
  >("select");
  const [selectedBank, setSelectedBank] = useState("");
  const [plaidUsername, setPlaidUsername] = useState("");
  const [plaidPassword, setPlaidPassword] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [plaidErrors, setPlaidErrors] = useState<Record<string, string>>({});
  const [modalLoadingText, setModalLoadingText] = useState("");

  const handleSelectBank = (bank: string) => {
    setSelectedBank(bank);
    setLinkModalStep("plaid_login");
  };

  const handlePlaidLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!plaidUsername.trim()) errors.username = "Username is required";
    if (!plaidPassword) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setPlaidErrors(errors);
      return;
    }

    setPlaidErrors({});
    setLinkModalStep("plaid_verifying");
    setModalLoadingText("Connecting to " + selectedBank + " credentials interface...");

    setTimeout(() => {
      setModalLoadingText("Initiating OAuth security token exchange...");
      setTimeout(() => {
        setModalLoadingText("Fetching account balances and transaction data...");
        setTimeout(() => {
          setLinkedCards((prev) => [
            ...prev,
            {
              name: `${selectedBank} Business Checking`,
              detail: `Checking ****02`,
              cardImage: MERCURY_IO_CARD_IMAGE,
              fallback: selectedBank,
            },
          ]);
          setLinkModalStep("plaid_success");
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const handleManualAddCard = (event: React.FormEvent) => {
    event.preventDefault();
    const errors: Record<string, string> = {};
    if (!cardHolder.trim()) errors.cardHolder = "Required";
    if (!cardNumber.trim()) errors.cardNumber = "Required";
    if (!cardExpiry.trim()) errors.cardExpiry = "Required";
    if (!cardCVC.trim()) errors.cardCVC = "Required";
    if (!cardZip.trim()) errors.cardZip = "Required";

    if (Object.keys(errors).length > 0) {
      setCardErrors(errors);
      return;
    }

    setCardErrors({});
    setLinkModalStep("card_verifying");
    setModalLoadingText("Authorizing sandbox debit card hold...");

    setTimeout(() => {
      setModalLoadingText("Validating card routing networks...");
      setTimeout(() => {
        const last4 = cardNumber.slice(-4) || "99";
        setLinkedCards((prev) => [
          ...prev,
          {
            name: `${cardHolder}'s Card`,
            detail: `Visa ****${last4}`,
            cardImage: BOFA_BUSINESS_DEBIT_VISA_IMAGE,
            fallback: "Visa",
          },
        ]);
        setLinkModalStep("card_success");
      }, 1500);
    }, 1500);
  };

  const openLinkModal = () => {
    setLinkModalStep("select");
    setSelectedBank("");
    setPlaidUsername("");
    setPlaidPassword("");
    setCardHolder("");
    setCardNumber("");
    setCardExpiry("");
    setCardCVC("");
    setCardZip("");
    setCardErrors({});
    setPlaidErrors({});
    setIsLinkModalOpen(true);
  };

  return (
    <>
      <div className="bg-[#0D0D0D] rounded-[13px] border border-[#3a3a3a] p-4 sm:p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_4px_24px_-4px_rgba(0,0,0,0.6)] space-y-4 text-left">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[12px] font-bold uppercase tracking-wider text-neutral-400">Connected Banking Feeds</h2>
          <button
            onClick={() => router.push("/dashboard/wallet")}
            className="h-6 px-2.5 rounded border border-[#3a3a3a] bg-white/[0.04] text-[10px] font-bold text-neutral-300 hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            Manage
          </button>
        </div>

        <div className="space-y-3">
          {linkedCards.map((card, i) => (
            <div key={i} className="flex items-center gap-3 rounded-[10px] border border-[#222] bg-[#0c0c0c] p-3">
              <BankCardFace card={card} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-bold text-white">{card.name}</p>
                <p className="mt-1 text-[10px] text-neutral-500 font-mono">{card.detail}</p>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center text-xs pt-2 border-t border-[#222] select-text">
            <span className="text-neutral-400">Plaid Available Float</span>
            <span className="font-mono font-bold text-white">$250,000.00</span>
          </div>

          <button
            onClick={openLinkModal}
            className="mt-2 w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-dashed border-[#3a3a3a] bg-black text-xs font-bold text-neutral-400 hover:border-white hover:text-white transition-colors cursor-pointer"
          >
            Link a card or bank
          </button>
        </div>
      </div>

      {/* Plaid / Bank Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-[420px] overflow-hidden rounded-[16px] border border-[#3a3a3a] bg-[#0c0c0c] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsLinkModalOpen(false)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {linkModalStep === "select" && (
              <div className="text-center pt-2">
                <h3 className="text-[16px] font-bold text-white mb-2">Link Bank or Debit Card</h3>
                <p className="text-[12px] text-[#8f8f8f] mb-6">Select a connection pathway to link fund sources.</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setLinkModalStep("plaid_intro")}
                    className="flex items-center justify-center h-10 w-full rounded-[8px] bg-[#0A5CFF] text-[13px] font-bold text-white hover:bg-[#004BE5] cursor-pointer transition-all"
                  >
                    Link via Plaid API
                  </button>
                  <button
                    onClick={() => setLinkModalStep("card_form")}
                    className="flex items-center justify-center h-10 w-full rounded-[8px] border border-[#3a3a3a] bg-transparent text-[13px] font-bold text-[#b8b8b8] hover:bg-[#1a1a1a] hover:text-white cursor-pointer transition-all"
                  >
                    Manual Card Binding
                  </button>
                </div>
              </div>
            )}

            {linkModalStep === "plaid_intro" && (
              <div className="text-center pt-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5ECF6] mx-auto mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/plaid-logo.svg" alt="Plaid" className="h-6 w-auto" />
                </div>
                <h3 className="text-[15px] font-bold text-white mb-2">Connect via Plaid</h3>
                <p className="text-[11px] leading-relaxed text-[#8f8f8f] mb-6">
                  Plaid lets you securely link bank feeds in seconds. Credentials are encrypted end-to-end and never stored by AgncyPay.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLinkModalStep("select")}
                    className="flex-1 h-9 rounded-[7px] border border-[#3a3a3a] text-[12px] font-bold text-[#b8b8b8] hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setLinkModalStep("plaid_banks")}
                    className="flex-1 h-9 rounded-[7px] bg-white text-[12px] font-bold text-black hover:bg-neutral-200 cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {linkModalStep === "plaid_banks" && (
              <div className="pt-2">
                <h3 className="text-[15px] font-bold text-white mb-4 text-center">Select your bank</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {["Chase", "Bank of America", "Mercury", "Wells Fargo", "Citi", "Capital One"].map((bank) => (
                    <button
                      key={bank}
                      onClick={() => handleSelectBank(bank)}
                      className="h-12 rounded-[8px] border border-[#3a3a3a] bg-black text-[12px] font-bold text-neutral-300 hover:border-white hover:text-white cursor-pointer transition-all"
                    >
                      {bank}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setLinkModalStep("plaid_intro")}
                  className="w-full h-9 rounded-[7px] border border-[#3a3a3a] text-[12px] font-bold text-[#b8b8b8] hover:text-white cursor-pointer"
                >
                  Back
                </button>
              </div>
            )}

            {linkModalStep === "plaid_login" && (
              <form onSubmit={handlePlaidLogin} className="pt-2 space-y-4 text-left">
                <h3 className="text-[15px] font-bold text-white mb-2 text-center">Log in to {selectedBank}</h3>
                <p className="text-[11px] text-[#8f8f8f] text-center mb-4">Enter sandbox bank account details to authorize link.</p>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">User ID</label>
                  <input
                    type="text"
                    value={plaidUsername}
                    onChange={(e) => setPlaidUsername(e.target.value)}
                    placeholder="Username"
                    className="h-9 w-full rounded-[6px] border border-[#3a3a3a] bg-[#111] px-3 text-[12px] text-white focus:border-neutral-500 outline-none"
                  />
                  {plaidErrors.username && <p className="text-[10px] text-red-400 mt-1 font-semibold">{plaidErrors.username}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={plaidPassword}
                    onChange={(e) => setPlaidPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 w-full rounded-[6px] border border-[#3a3a3a] bg-[#111] px-3 text-[12px] text-white focus:border-neutral-500 outline-none"
                  />
                  {plaidErrors.password && <p className="text-[10px] text-red-400 mt-1 font-semibold">{plaidErrors.password}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setLinkModalStep("plaid_banks")}
                    className="flex-1 h-9 rounded-[7px] border border-[#3a3a3a] text-[12px] font-bold text-[#b8b8b8] hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-[7px] bg-white text-[12px] font-bold text-black hover:bg-neutral-200 cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}

            {linkModalStep === "plaid_verifying" && (
              <div className="text-center py-6">
                <Loader2 className="h-10 w-10 text-white animate-spin mx-auto mb-4" />
                <h3 className="text-[15px] font-bold text-white mb-2">Verifying Plaid Link...</h3>
                <p className="text-[11px] text-[#8f8f8f] font-medium">{modalLoadingText}</p>
              </div>
            )}

            {linkModalStep === "plaid_success" && (
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-[15px] font-bold text-white mb-2">Bank Linked Successfully!</h3>
                <p className="text-[11px] text-[#8f8f8f] mb-6">Checking and transactions are synced in sandbox profile.</p>
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="h-9 w-full rounded-[7px] bg-white text-[12px] font-bold text-black hover:bg-neutral-200 cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}

            {linkModalStep === "card_form" && (
              <form onSubmit={handleManualAddCard} className="pt-2 space-y-4 text-left">
                <h3 className="text-[15px] font-bold text-white mb-4 text-center">Add Debit/Credit Card</h3>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="h-9 w-full rounded-[6px] border border-[#3a3a3a] bg-[#111] px-3 text-[12px] text-white focus:border-neutral-500 outline-none"
                  />
                  {cardErrors.cardHolder && <p className="text-[10px] text-red-400 mt-1 font-semibold">{cardErrors.cardHolder}</p>}
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 2222 3333 4444"
                    className="h-9 w-full rounded-[6px] border border-[#3a3a3a] bg-[#111] px-3 text-[12px] text-white focus:border-neutral-500 outline-none"
                  />
                  {cardErrors.cardNumber && <p className="text-[10px] text-red-400 mt-1 font-semibold">{cardErrors.cardNumber}</p>}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="h-9 w-full rounded-[6px] border border-[#3a3a3a] bg-[#111] px-3 text-[12px] text-white focus:border-neutral-500 outline-none text-center"
                    />
                    {cardErrors.cardExpiry && <p className="text-[10px] text-red-400 mt-1 font-semibold">{cardErrors.cardExpiry}</p>}
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">CVC</label>
                    <input
                      type="password"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className="h-9 w-full rounded-[6px] border border-[#3a3a3a] bg-[#111] px-3 text-[12px] text-white focus:border-neutral-500 outline-none text-center"
                    />
                    {cardErrors.cardCVC && <p className="text-[10px] text-red-400 mt-1 font-semibold">{cardErrors.cardCVC}</p>}
                  </div>
                  <div className="col-span-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Zip Code</label>
                    <input
                      type="text"
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value)}
                      placeholder="90210"
                      className="h-9 w-full rounded-[6px] border border-[#3a3a3a] bg-[#111] px-3 text-[12px] text-white focus:border-neutral-500 outline-none text-center"
                    />
                    {cardErrors.cardZip && <p className="text-[10px] text-red-400 mt-1 font-semibold">{cardErrors.cardZip}</p>}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setLinkModalStep("select")}
                    className="flex-1 h-9 rounded-[7px] border border-[#3a3a3a] text-[12px] font-bold text-[#b8b8b8] hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-9 rounded-[7px] bg-white text-[12px] font-bold text-black hover:bg-neutral-200 cursor-pointer"
                  >
                    Add Card
                  </button>
                </div>
              </form>
            )}

            {linkModalStep === "card_verifying" && (
              <div className="text-center py-6">
                <Loader2 className="h-10 w-10 text-white animate-spin mx-auto mb-4" />
                <h3 className="text-[15px] font-bold text-white mb-2">Adding Bank Card...</h3>
                <p className="text-[11px] text-[#8f8f8f] font-medium">{modalLoadingText}</p>
              </div>
            )}

            {linkModalStep === "card_success" && (
              <div className="text-center py-4">
                <div className="h-12 w-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-[15px] font-bold text-white mb-2">Card Added Successfully!</h3>
                <p className="text-[11px] text-[#8f8f8f] mb-6">Debit hold confirmed. Ready for wallet conversions.</p>
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="h-9 w-full rounded-[7px] bg-white text-[12px] font-bold text-black hover:bg-neutral-200 cursor-pointer"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
