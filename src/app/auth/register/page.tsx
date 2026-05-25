"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  Check,
  CreditCard,
  Network,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { saveRegisteredUser } from "../../../lib/authStorage";
import { WorkspaceType } from "../../../types/workspace";
import { cn } from "../../../lib/utils";

const DEMO_EMAIL = "martin.safi@adidas.com";
const DEMO_PASSWORD = "password123";

type SignupRole = "brand" | "agency" | "talent" | "mother_agency";
type VerificationFlow = "manual" | "instant";

const roleCards: {
  id: SignupRole;
  title: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "brand",
    title: "Brand",
    description: "Fund invoices, approve payments, manage treasury visibility.",
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    id: "agency",
    title: "Agency",
    description: "Manage talent, issue invoices, coordinate payouts and splits.",
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: "talent",
    title: "Talent",
    description: "Receive payouts, manage payment settings, track your work.",
    icon: <UserRound className="h-5 w-5" />,
  },
  {
    id: "mother_agency",
    title: "Mother Agency",
    description: "Oversee child agencies, vendor networks, and treasury ops.",
    icon: <Network className="h-5 w-5" />,
  },
];

const roleCopy: Record<WorkspaceType, {
  title: string;
  subtitle: string;
  workspaceLabel: string;
  workspacePlaceholder: string;
  emailLabel: string;
  verificationLabel: string;
}> = {
  brand: {
    title: "Create Brand Workspace",
    subtitle: "Set up a brand workspace for invoice approvals and payment orchestration.",
    workspaceLabel: "Brand / Company Name",
    workspacePlaceholder: "Adidas",
    emailLabel: "Work Email",
    verificationLabel: "KYB track",
  },
  agency: {
    title: "Create Agency Workspace",
    subtitle: "Set up your agency to manage talent, invoices, splits, and payouts.",
    workspaceLabel: "Agency Name",
    workspacePlaceholder: "Northstar Talent Group",
    emailLabel: "Work Email",
    verificationLabel: "KYB track",
  },
  talent_independent: {
    title: "Create Talent Workspace",
    subtitle: "Set up your independent profile for payouts and optional invoice creation.",
    workspaceLabel: "Public / Professional Name",
    workspacePlaceholder: "Jordan Lee Studio",
    emailLabel: "Email Address",
    verificationLabel: "KYC track",
  },
  talent_agency: {
    title: "Join as Agency Talent",
    subtitle: "Create your identity, then connect to the agency that invited you.",
    workspaceLabel: "Talent Profile Name",
    workspacePlaceholder: "Jordan Lee",
    emailLabel: "Email Address",
    verificationLabel: "KYC track",
  },
  mother_agency: {
    title: "Create Mother Agency",
    subtitle: "Set up an enterprise workspace for child agencies and consolidated operations.",
    workspaceLabel: "Organization Name",
    workspacePlaceholder: "Apex Management Holdings",
    emailLabel: "Work Email",
    verificationLabel: "Enterprise KYB",
  },
};

function getWorkspaceType(role: SignupRole, talentMode: "independent" | "agency"): WorkspaceType {
  if (role === "talent") {
    return talentMode === "agency" ? "talent_agency" : "talent_independent";
  }

  return role;
}

export default function RegisterPage() {
  const router = useRouter();
  const { loginUser, updateBusinessSetup } = useApp();

  const [selectedRole, setSelectedRole] = useState<SignupRole>("brand");
  const [talentMode, setTalentMode] = useState<"independent" | "agency">("independent");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [agencyId, setAgencyId] = useState("");
  const [website, setWebsite] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [verificationFlow, setVerificationFlow] = useState<VerificationFlow>("instant");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoHelper, setShowDemoHelper] = useState(false);

  const workspaceType = getWorkspaceType(selectedRole, talentMode);
  const copy = roleCopy[workspaceType];
  const isTalent = workspaceType === "talent_independent" || workspaceType === "talent_agency";
  const needsWebsite = workspaceType === "brand" || workspaceType === "agency" || workspaceType === "mother_agency";

  const helperBullets = useMemo(() => {
    if (workspaceType === "brand") {
      return ["Company domain detection", "KYB and bank connection", "Invoice approvals and treasury controls"];
    }
    if (workspaceType === "agency") {
      return ["Agency KYB and payout bank", "Talent and split management", "Client invoice coordination"];
    }
    if (workspaceType === "mother_agency") {
      return ["Enterprise KYB", "Child agency hierarchy", "Consolidated treasury reporting"];
    }
    if (workspaceType === "talent_agency") {
      return ["Agency relationship confirmation", "KYC and payout setup", "Assigned invoice and payout visibility"];
    }

    return ["KYC and payout setup", "Independent invoice creation", "Payment history and payout settings"];
  }, [workspaceType]);

  const handlePrefillAdidas = () => {
    setSelectedRole("brand");
    setTalentMode("independent");
    setDisplayName("Martin Safi");
    setEmail(DEMO_EMAIL);
    setWorkspaceName("Adidas");
    setAgencyId("");
    setWebsite("https://www.adidas.com");
    setPassword(DEMO_PASSWORD);
    setVerificationFlow("instant");
    setAgree(true);
    setErrors({});
    setShowDemoHelper(false);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!displayName.trim()) newErrors.displayName = "Name is required";
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!workspaceName.trim()) newErrors.workspaceName = `${copy.workspaceLabel} is required`;
    if (workspaceType === "agency" && !agencyId.trim()) {
      newErrors.agencyId = "Agency ID is required";
    }
    if (needsWebsite && website && !/^https?:\/\/\S+\.\S+/.test(website)) {
      newErrors.website = "Use a full URL, for example https://company.com";
    }
    if (workspaceType === "talent_agency" && !inviteCode.trim()) {
      newErrors.inviteCode = "Invite code or agency email is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!agree) {
      newErrors.agree = "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = displayName.trim();
    const normalizedWorkspaceName = workspaceName.trim();

    setIsLoading(true);
    window.setTimeout(() => {
      saveRegisteredUser({
        email: normalizedEmail,
        password,
        fullName: normalizedName,
        accountType: workspaceType,
        workspaceType,
        workspaceName: normalizedWorkspaceName,
        agencyId: workspaceType === "agency" ? agencyId.trim().toUpperCase() : undefined,
        verificationFlow,
      });
      loginUser(normalizedEmail, normalizedName, workspaceType, {
        workspaceName: normalizedWorkspaceName,
        workspaceType,
        agencyId: workspaceType === "agency" ? agencyId.trim().toUpperCase() : undefined,
      });
      updateBusinessSetup({
        legalName: normalizedWorkspaceName,
        brandName: normalizedWorkspaceName,
        website: website.trim(),
        email: normalizedEmail,
        ...(workspaceType === "mother_agency" ? { businessType: "Enterprise Organization" } : {}),
        ...(isTalent ? { industry: "Creator / Talent Services" } : {}),
      });
      setIsLoading(false);
      router.push("/auth/verify-email");
    }, 900);
  };

  return (
    <div className="grid min-h-screen w-full grid-cols-1 bg-black font-sans text-white lg:grid-cols-[minmax(360px,0.95fr)_minmax(520px,1.05fr)]">
      <style dangerouslySetInnerHTML={{__html: `
        #displayName, #email, #workspaceName, #agencyId, #website, #inviteCode, #password {
          background-color: #0B0B0B !important;
          border-color: #262626 !important;
          color: #F8FAFC !important;
        }
        #displayName:focus, #email:focus, #workspaceName:focus, #agencyId:focus, #website:focus, #inviteCode:focus, #password:focus {
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px #0B0B0B inset !important;
          -webkit-text-fill-color: #F8FAFC !important;
          border-color: #262626 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}} />

      <div className="fixed right-4 top-4 z-50">
        <button
          type="button"
          onClick={() => setShowDemoHelper(!showDemoHelper)}
          className="rounded-md border border-[#2D2D2D] bg-[#1F1F1F] px-3 py-1.5 text-[11px] text-[#A1A1AA] shadow-lg transition-colors hover:bg-[#2D2D2D]"
        >
          {showDemoHelper ? "Hide Demo Helper" : "Show Demo Credentials"}
        </button>

        {showDemoHelper && (
          <div className="absolute right-0 z-50 mt-2 w-72 rounded-lg border border-[#2D2D2D] bg-[#121212] p-4 text-xs shadow-2xl">
            <h4 className="mb-2 font-semibold text-white">Demo Registration</h4>
            <p className="mb-1 text-[#8E8E93]">
              Prefills a Brand workspace with Adidas corporate details.
            </p>
            <button
              type="button"
              onClick={handlePrefillAdidas}
              className="mt-2 w-full rounded bg-white py-2 font-semibold text-black transition-colors hover:bg-neutral-200"
            >
              Prefill Demo Data
            </button>
          </div>
        )}
      </div>

      <aside className="hidden min-h-screen flex-col bg-black px-12 pb-12 pt-[78px] lg:flex xl:px-20">
        <div className="max-w-[650px]">
          <Link href="/" className="mb-5 ml-3 inline-block">
            <img
              src="/agncypayLogo.png"
              alt="AgncyPay"
              style={{ width: "520px", height: "122px", objectFit: "contain", objectPosition: "left" }}
            />
          </Link>

          <h1 className="text-[44px] font-semibold leading-[1.08] text-white">
            One identity for every payment relationship
          </h1>
          <p className="mt-5 max-w-[520px] text-[16px] leading-7 text-[#8E8E93]">
            Create a user identity, then connect it to the right workspace: brand, agency, talent, or mother agency.
          </p>

          <div className="mt-10 rounded-[8px] border border-[#272727] bg-[#070707] p-5">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-white" />
              <p className="text-[15px] font-semibold text-white">{copy.title}</p>
            </div>
            <ul className="mt-5 space-y-3 text-[14px] leading-5 text-[#8E8E93]">
              {helperBullets.map((bullet) => (
                <li key={bullet} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#8E8E93]" />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col bg-[#121212] px-5 py-8 sm:px-8 md:px-12 lg:px-14 xl:px-20">
        <div className="mb-8 lg:hidden">
          <Link href="/" className="inline-flex items-center">
            <img
              src="/agncypayLogo.png"
              alt="AgncyPay"
              style={{ width: "240px", height: "55px", objectFit: "contain", objectPosition: "left" }}
            />
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center">
          <div className="mb-7">
            <h2 className="text-[31px] font-medium leading-tight text-white">
              Create Account
            </h2>
            <p className="mt-2 text-sm leading-5 text-[#8E8E93]">
              Select your role first. Your verification, workspace, and dashboard will adapt from there.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <p className="mb-3 text-[13px] font-semibold text-[#E5E5EA]">
                What are you signing up as?
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {roleCards.map((role) => (
                  <RoleCard
                    key={role.id}
                    selected={selectedRole === role.id}
                    title={role.title}
                    description={role.description}
                    icon={role.icon}
                    onClick={() => {
                      setSelectedRole(role.id);
                      setErrors({});
                    }}
                  />
                ))}
              </div>
            </div>

            {selectedRole === "talent" && (
              <div className="grid grid-cols-1 gap-3 rounded-[8px] border border-[#262626] bg-[#0B0B0B] p-3 sm:grid-cols-2">
                <TalentModeButton
                  selected={talentMode === "independent"}
                  title="Independent Talent"
                  description="Create your own solo workspace."
                  onClick={() => setTalentMode("independent")}
                />
                <TalentModeButton
                  selected={talentMode === "agency"}
                  title="Agency Talent"
                  description="Join or request access to an agency."
                  onClick={() => setTalentMode("agency")}
                />
              </div>
            )}

            <div className="rounded-[10px] border border-[#262626] bg-black/30 p-4 sm:p-5">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-[20px] font-semibold leading-tight text-white">
                    {copy.title}
                  </h3>
                  <p className="mt-1 max-w-[520px] text-[13px] leading-5 text-[#8E8E93]">
                    {copy.subtitle}
                  </p>
                </div>
                <span className="inline-flex h-7 shrink-0 items-center rounded-[7px] border border-[#444] px-3 text-[12px] font-semibold text-[#d7d7d7]">
                  {copy.verificationLabel}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  id="displayName"
                  label="Enter your Name"
                  value={displayName}
                  onChange={(value) => {
                    setDisplayName(value);
                    if (errors.displayName) setErrors({});
                  }}
                  placeholder="Martin Safi"
                  error={errors.displayName}
                />
                <FormField
                  id="email"
                  type="email"
                  label={copy.emailLabel}
                  value={email}
                  onChange={(value) => {
                    setEmail(value);
                    if (errors.email) setErrors({});
                  }}
                  placeholder="you@company.com"
                  error={errors.email}
                />
                <FormField
                  id="workspaceName"
                  label={copy.workspaceLabel}
                  value={workspaceName}
                  onChange={(value) => {
                    setWorkspaceName(value);
                    if (errors.workspaceName) setErrors({});
                  }}
                  placeholder={copy.workspacePlaceholder}
                  error={errors.workspaceName}
                />
                {workspaceType === "agency" && (
                  <FormField
                    id="agencyId"
                    label="Agency ID"
                    value={agencyId}
                    onChange={(value) => {
                      setAgencyId(value.toUpperCase());
                      if (errors.agencyId) setErrors({});
                    }}
                    placeholder="AGY-1006"
                    error={errors.agencyId}
                  />
                )}
                {needsWebsite && (
                  <FormField
                    id="website"
                    label="Website"
                    value={website}
                    onChange={(value) => {
                      setWebsite(value);
                      if (errors.website) setErrors({});
                    }}
                    placeholder="https://company.com"
                    error={errors.website}
                  />
                )}
                {workspaceType === "talent_agency" && (
                  <FormField
                    id="inviteCode"
                    label="Invite Code or Agency Email"
                    value={inviteCode}
                    onChange={(value) => {
                      setInviteCode(value);
                      if (errors.inviteCode) setErrors({});
                    }}
                    placeholder="AGY-INVITE-1029"
                    error={errors.inviteCode}
                  />
                )}
                <FormField
                  id="password"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(value) => {
                    setPassword(value);
                    if (errors.password) setErrors({});
                  }}
                  placeholder="Minimum 8 characters"
                  error={errors.password}
                />
              </div>
            </div>

            {!isTalent && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <VerificationFlowOption
                  selected={verificationFlow === "instant"}
                  title="Instant"
                  description="Connect bank first, then accelerate KYB."
                  icon={<CreditCard className="h-4 w-4" strokeWidth={1.9} />}
                  onClick={() => setVerificationFlow("instant")}
                />
                <VerificationFlowOption
                  selected={verificationFlow === "manual"}
                  title="Manual"
                  description="Complete the full verification checklist."
                  icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.9} />}
                  onClick={() => setVerificationFlow("manual")}
                />
              </div>
            )}

            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={() => setAgree(!agree)}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-[#262626] bg-[#0B0B0B] accent-white"
              />
              <label
                htmlFor="agree"
                className="cursor-pointer select-none text-sm leading-tight text-[#8E8E93] hover:text-[#E5E5EA]"
              >
                I agree to the <span className="font-medium text-white">Terms of Service</span> and{" "}
                <span className="font-medium text-white">Privacy Policy</span>
              </label>
            </div>
            {errors.agree && <span className="block text-xs text-white">{errors.agree}</span>}

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-[46px] w-full items-center justify-center gap-2 rounded-lg bg-white text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[#8E8E93]">
            Already have an account?{" "}
            <Link href="/auth/login" className="ml-1 font-medium text-white hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function RoleCard({
  selected,
  title,
  description,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-[122px] rounded-[8px] border p-4 text-left transition-colors",
        selected
          ? "border-white bg-white/[0.07] text-white"
          : "border-[#262626] bg-[#0B0B0B] text-[#8E8E93] hover:border-white/30 hover:text-white"
      )}
    >
      <span className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-[7px] border",
            selected ? "border-white text-white" : "border-[#3A3A3A] text-[#8E8E93]"
          )}
        >
          {icon}
        </span>
        {selected && <Check className="h-4 w-4 shrink-0" strokeWidth={2.4} />}
      </span>
      <span className="mt-4 block text-[15px] font-semibold leading-tight text-white">
        {title}
      </span>
      <span className="mt-2 block text-[13px] leading-5 text-[#8E8E93]">
        {description}
      </span>
    </button>
  );
}

function TalentModeButton({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[7px] border px-4 py-3 text-left transition-colors",
        selected
          ? "border-white bg-white text-black"
          : "border-[#333] bg-black text-white hover:border-[#666]"
      )}
    >
      <span className="block text-[14px] font-semibold leading-tight">{title}</span>
      <span className={cn("mt-1 block text-[12px] leading-4", selected ? "text-[#333]" : "text-[#888]")}>
        {description}
      </span>
    </button>
  );
}

function FormField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  type?: string;
}) {
  return (
    <label className="flex w-full flex-col gap-2" htmlFor={id}>
      <span className="text-[13px] font-medium text-[#E5E5EA]">{label}</span>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "w-full rounded-lg border px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#5A5A62] transition-colors focus:border-white/30 focus:outline-none",
          error && "border-white/40"
        )}
        placeholder={placeholder}
      />
      {error && <span className="text-xs text-white">{error}</span>}
    </label>
  );
}

function VerificationFlowOption({
  selected,
  title,
  description,
  icon,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[82px] items-start gap-3 rounded-lg border p-3 text-left transition-colors",
        selected
          ? "border-white bg-white/[0.06] text-white"
          : "border-[#262626] bg-[#0B0B0B] text-[#8E8E93] hover:border-white/30 hover:text-white"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-white text-white" : "border-[#3A3A3A] text-[#8E8E93]"
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="text-[14px] font-semibold leading-tight text-white">
            {title}
          </span>
          {selected ? <Check className="h-4 w-4 shrink-0" strokeWidth={2.4} /> : null}
        </span>
        <span className="mt-1 block text-[12px] leading-snug text-[#8E8E93]">
          {description}
        </span>
      </span>
    </button>
  );
}
