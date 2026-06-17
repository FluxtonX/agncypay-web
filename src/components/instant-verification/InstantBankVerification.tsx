"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CreditCard,
  Globe2,
  Loader2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { usePlaidLink } from "react-plaid-link";
import { useApp } from "../../context/AppContext";
import { cn } from "../../lib/utils";
import { InstantFlowSummary } from "./InstantFlowSummary";
import { InstantStepShell } from "./InstantStepShell";

type PlaidState = "idle" | "connecting" | "connected";
type ReviewState = "idle" | "running" | "complete";

const BANK_SIGNALS = [
  "Bank ownership verified",
  "Account status confirmed",
  "Account holder data matched",
  "Identity signals received",
];

const REVIEW_CHECKS = [
  {
    label: "Middesk KYB",
    detail: "Legal entity, registration, address, and officers",
    icon: Building2,
  },
  {
    label: "Sardine/Socure risk",
    detail: "Device, fraud, onboarding, and synthetic identity checks",
    icon: ShieldCheck,
  },
];

export function InstantBankVerification() {
  const router = useRouter();
  const {
    state,
    updateBankDetails,
    updateBusinessSetup,
    setVerificationStatusDirectly,
  } = useApp();
  const [plaidState, setPlaidState] = useState<PlaidState>("idle");
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isMockPlaid, setIsMockPlaid] = useState(false);
  const [plaidError, setPlaidError] = useState<string | null>(null);
  const [reviewState, setReviewState] = useState<ReviewState>("idle");
  const [formData, setFormData] = useState({
    website:
      state.businessSetup.website && state.businessSetup.website !== "https://www.adidas.com"
        ? state.businessSetup.website
        : "",
    country:
      state.businessSetup.country && state.businessSetup.country !== "Germany"
        ? state.businessSetup.country
        : "United States",
    businessState: state.businessSetup.businessState || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check active Plaid connection on load and fetch link_token
  useEffect(() => {
    fetch("/api/plaid/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.connected) {
          setPlaidState("connected");
          updateBankDetails({
            accountHolderName: state.businessSetup.legalName || "Business account",
            bankName: data.institutionName || "Plaid Connected Bank",
            routingNumber: "Verified via Plaid",
            accountNumber: "Verified via Plaid",
            statementUploaded: true,
            status: "approved",
          });
        }
      })
      .catch((err) => console.error("Error checking Plaid status:", err));

    fetch("/api/plaid/create-link-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then((errData) => {
            const errMsg = errData.details
              ? (typeof errData.details === "object" ? JSON.stringify(errData.details) : errData.details)
              : "Server response error";
            throw new Error(errMsg);
          });
        }
        return res.json();
      })
      .then((data) => {
        if (data.link_token) {
          setLinkToken(data.link_token);
          setIsMockPlaid(false);
          setPlaidError(null);
        } else if (data.isMock) {
          setIsMockPlaid(true);
          setPlaidError(null);
        } else {
          console.error("No link token returned:", data);
        }
      })
      .catch((err) => {
        console.error("Plaid Link initialization failed in console:", err.message || err);
        setPlaidError(err.message || "Failed to retrieve link token");
      });
  }, [state.businessSetup.legalName, updateBankDetails]);

  const triggerMockPlaidFlow = useCallback(async () => {
    setPlaidState("connecting");
    setTimeout(async () => {
      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: "mock-public-token-12345",
            institution: { name: "Chase Bank", institution_id: "ins_1" },
          }),
        });

        if (response.ok) {
          setPlaidState("connected");
          updateBankDetails({
            accountHolderName: state.businessSetup.legalName || "Business account",
            bankName: "Chase Bank (Simulated)",
            routingNumber: "Verified via Plaid",
            accountNumber: "Verified via Plaid",
            statementUploaded: true,
            status: "approved",
          });
        } else {
          setPlaidState("idle");
        }
      } catch (error) {
        setPlaidState("idle");
        console.error("Error exchanging mock public token:", error);
      }
    }, 1500);
  }, [state.businessSetup.legalName, updateBankDetails]);

  // Check if we are resuming from an OAuth redirect
  const [receivedRedirectUri, setReceivedRedirectUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = window.location.href;
      if (url.includes("oauth_state_id=") || url.includes("link_session_id=")) {
        setReceivedRedirectUri(url);
      }
    }
  }, []);

  const onSuccess = useCallback(
    async (public_token: string, metadata: any) => {
      setPlaidState("connecting");
      try {
        const response = await fetch("/api/plaid/exchange-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token,
            institution: metadata.institution,
          }),
        });

        if (response.ok) {
          setPlaidState("connected");
          updateBankDetails({
            accountHolderName: state.businessSetup.legalName || "Business account",
            bankName: metadata.institution?.name || "Plaid Connected Bank",
            routingNumber: "Verified via Plaid",
            accountNumber: "Verified via Plaid",
            statementUploaded: true,
            status: "approved",
          });
        } else {
          setPlaidState("idle");
          const errData = await response.json().catch(() => ({}));
          const errMsg = errData.details || errData.error || "Failed to exchange public token";
          console.error("Failed to exchange public token:", errMsg);
          setPlaidError(`Plaid Token Exchange Error: ${errMsg}`);
        }
      } catch (error: any) {
        setPlaidState("idle");
        console.error("Error exchanging public token:", error);
        setPlaidError(`Error exchanging token: ${error.message || error}`);
      }
    },
    [state.businessSetup.legalName, updateBankDetails]
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
    receivedRedirectUri,
    onExit: (error, metadata) => {
      if (error) {
        console.error("Plaid Link onExit Error:", error);
        setPlaidError(`Plaid Link Error: ${error.error_message} (${error.error_code})`);
      } else {
        console.log("Plaid Link exited. Metadata:", metadata);
      }
      if (plaidState !== "connected") {
        setPlaidState("idle");
      }
    },
    onEvent: (eventName, metadata) => {
      console.log(`Plaid Link Event: ${eventName}`, metadata);
      if (eventName === "ERROR" && metadata.error_code) {
        console.error("Plaid Link error event:", metadata);
        setPlaidError(`Plaid Link Error Event: ${metadata.error_message || metadata.error_code}`);
      }
    },
  });

  useEffect(() => {
    if (reviewState !== "running") return;

    const timer = window.setTimeout(() => {
      setReviewState("complete");
      setVerificationStatusDirectly("approved");
    }, 1300);

    return () => window.clearTimeout(timer);
  }, [reviewState, setVerificationStatusDirectly]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.website.trim()) nextErrors.website = "Website is required";
    if (!formData.country.trim()) nextErrors.country = "Country is required";
    if (!formData.businessState.trim()) nextErrors.businessState = "State is required";
    if (plaidState !== "connected") {
      nextErrors.bank = "Connect a bank account first";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const runChecks = () => {
    if (!validate()) return;

    updateBusinessSetup({
      website: formData.website.trim(),
      country: formData.country,
      businessState: formData.businessState,
    });
    setReviewState("running");
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <InstantStepShell
      eyebrow="Plaid plus KYB"
      title="Connect a bank account and run instant checks"
      description="Plaid verifies the business account, then KYB and risk signals run in the background for a faster decision."
      aside={<InstantFlowSummary activeStep="bank" />}
    >
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[8px] border border-[#565656] bg-black px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8 lg:px-10">
          {plaidState === "connecting" && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm transition-all duration-300">
              <Loader2 className="h-9 w-9 animate-spin text-white mb-3" strokeWidth={1.7} />
              <p className="text-[15px] font-bold text-white tracking-wide">Connecting secure bank portal...</p>
              <p className="text-[11px] text-[#A4A4A4] mt-1.5">Plaid is establishing an encrypted channel to your bank</p>
            </div>
          )}
          <div className="rounded-[8px] border border-[#747474] bg-[#0A0A0A] px-5 py-[28px] sm:px-[30px]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-[18px]">
                <CreditCard
                  className="mt-[2px] h-[32px] w-[32px] shrink-0 text-[#B8B8B8]"
                  strokeWidth={1.7}
                />
                <div>
                  <h2 className="text-[24px] font-bold leading-tight text-white sm:text-[30px]">
                    Secure bank connection
                  </h2>
                  <p className="mt-3 max-w-[560px] text-[15px] font-normal leading-[1.55] text-[#A4A4A4] sm:text-[17px]">
                    Connect the primary business account for ownership and account verification.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPlaidState("connecting");
                  if (isMockPlaid) {
                    triggerMockPlaidFlow();
                  } else {
                    open();
                  }
                }}
                disabled={(!ready && !isMockPlaid) || plaidState !== "idle"}
                className={cn(
                  "flex h-11 min-w-[160px] items-center justify-center gap-2 rounded-[7px] px-5 text-[15px] font-semibold transition-colors sm:text-[16px]",
                  plaidState === "connected"
                    ? "border border-[#5E5E5E] bg-black text-white"
                    : "bg-white text-black hover:bg-[#EDEDED] disabled:opacity-50",
                  plaidState === "connecting" && "cursor-wait opacity-85"
                )}
              >
                {plaidState === "connecting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
                    Connecting
                  </>
                ) : plaidState === "connected" ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={2.4} />
                    Connected
                  </>
                ) : (
                  "Connect Bank"
                )}
              </button>
            </div>
          </div>

          {errors.bank ? (
            <p className="mt-4 text-sm font-medium text-white">{errors.bank}</p>
          ) : null}

          {plaidError ? (
            <div className="mt-4 rounded-[6px] border border-red-500/20 bg-red-500/5 p-4 text-[13px] text-red-400 font-semibold leading-relaxed">
              <p className="font-bold mb-1">Plaid Integration Error:</p>
              <pre className="whitespace-pre-wrap font-mono text-[11px] select-text">{plaidError}</pre>
              <p className="mt-2 text-[11px] text-red-400/70 font-normal">Please check your server console or verify configuration keys in .env.local</p>
            </div>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {BANK_SIGNALS.map((signal) => {
              const isReady = plaidState === "connected";

              return (
                <div
                  key={signal}
                  className="flex h-[58px] items-center gap-3 rounded-[7px] border border-[#333333] bg-[#080808] px-4"
                >
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                      isReady
                        ? "border-[#737373] text-white"
                        : "border-[#333333] text-[#666666]"
                    )}
                  >
                    {isReady ? (
                      <Check className="h-4 w-4" strokeWidth={2.3} />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#555555]" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "text-[14px] font-semibold leading-tight",
                      isReady ? "text-white" : "text-[#777777]"
                    )}
                  >
                    {signal}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[8px] border border-[#565656] bg-black px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8 lg:px-10">
          <div className="mb-6">
            <h2 className="text-[22px] font-bold leading-tight text-white sm:text-[26px]">
              Business KYB details
            </h2>
            <p className="mt-2 text-[15px] leading-snug text-[#A0A0A0] sm:text-[17px]">
              Middesk uses these details to enrich registration and legal entity data.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <InstantField
                id="instant-website"
                name="website"
                label="Business Website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://company.com"
                error={errors.website}
                icon={<Globe2 className="h-4 w-4" strokeWidth={1.8} />}
              />
            </div>

            <InstantSelect
              id="instant-country"
              name="country"
              label="Country"
              value={formData.country}
              onChange={handleChange}
              error={errors.country}
              options={["United States", "Canada", "United Kingdom", "Germany"]}
            />

            <InstantField
              id="instant-state"
              name="businessState"
              label="State"
              value={formData.businessState}
              onChange={handleChange}
              placeholder="California"
              error={errors.businessState}
              icon={<MapPin className="h-4 w-4" strokeWidth={1.8} />}
            />
          </div>
        </section>

        <section className="rounded-[8px] border border-[#565656] bg-black px-5 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.28)] sm:px-8 sm:py-8 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2">
            {REVIEW_CHECKS.map((check) => {
              const Icon = check.icon;
              const isRunning = reviewState === "running";
              const isComplete = reviewState === "complete";

              return (
                <div
                  key={check.label}
                  className="rounded-[8px] border border-[#333333] bg-[#080808] p-5"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
                        isComplete
                          ? "border-[#737373] text-white"
                          : isRunning
                          ? "border-white text-white"
                          : "border-[#333333] text-[#777777]"
                      )}
                    >
                      {isRunning ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.2} />
                      ) : isComplete ? (
                        <Check className="h-4 w-4" strokeWidth={2.3} />
                      ) : (
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                      )}
                    </span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white">
                        {check.label}
                      </h3>
                      <p className="mt-1 text-[13px] leading-snug text-[#808080]">
                        {check.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => router.push("/verification/instant")}
            className="flex h-11 items-center justify-center gap-2 rounded-[7px] border border-[#5E5E5E] bg-black px-5 text-[15px] font-semibold text-[#8C8C8C] transition-colors hover:border-[#8A8A8A] hover:text-white sm:w-[120px] sm:text-[16px]"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2} />
            Back
          </button>

          {reviewState === "complete" ? (
            <button
              type="button"
              onClick={goToDashboard}
              className="flex h-11 items-center justify-center gap-3 rounded-[7px] bg-white px-5 text-[15px] font-semibold text-black transition-colors hover:bg-[#EDEDED] sm:w-[220px] sm:gap-[17px] sm:text-[16px]"
            >
              Go to Dashboard
              <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
            </button>
          ) : (
            <button
              type="button"
              onClick={runChecks}
              disabled={reviewState === "running"}
              className="flex h-11 items-center justify-center gap-3 rounded-[7px] bg-white px-5 text-[15px] font-semibold text-black transition-colors hover:bg-[#EDEDED] disabled:cursor-wait disabled:opacity-80 sm:w-[220px] sm:gap-[17px] sm:text-[16px]"
            >
              {reviewState === "running" ? "Running Checks" : "Run Checks"}
              {reviewState === "running" ? (
                <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.25} />
              ) : (
                <ArrowRight className="h-5 w-5" strokeWidth={2.25} />
              )}
            </button>
          )}
        </div>
      </div>
    </InstantStepShell>
  );
}

interface InstantFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon: React.ReactNode;
}

function InstantField({ label, error, icon, id, ...props }: InstantFieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-[14px] top-1/2 -translate-y-1/2 text-[#8C8C8C]">
          {icon}
        </span>
        <input
          id={id}
          className="h-11 w-full rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] pl-10 text-[16px] font-normal text-white outline-none transition-colors placeholder:text-[#A8A8A8] focus:border-white sm:text-[18px]"
          {...props}
        />
      </span>
      {error ? <span className="mt-2 block text-xs text-white">{error}</span> : null}
    </label>
  );
}

interface InstantSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: string[];
}

function InstantSelect({ label, error, options, id, ...props }: InstantSelectProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-[9px] block text-[16px] font-semibold leading-none tracking-normal text-[#F4F4F4]">
        {label}
      </span>
      <span className="relative block">
        <select
          id={id}
          className="h-11 w-full appearance-none rounded-[6px] border border-[#727272] bg-[#0A0A0A] px-[14px] pr-11 text-[16px] font-normal text-white outline-none transition-colors focus:border-white sm:text-[18px]"
          {...props}
        >
          {options.map((option) => (
            <option key={option} value={option} className="bg-black text-white">
              {option}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-[15px] top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A7A7A]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </span>
      {error ? <span className="mt-2 block text-xs text-white">{error}</span> : null}
    </label>
  );
}
