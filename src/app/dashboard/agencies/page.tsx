"use client";

import React, { useMemo, useState } from "react";
import { Building2, Mail, Phone, Plus, X } from "lucide-react";
import { cn } from "../../../lib/utils";

type Agency = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Paused";
  totalSpend: number;
  invoices: number;
  monthlySpend: number;
};

const initialAgencies: Agency[] = [
  {
    id: "creative-co",
    name: "Creative Co",
    email: "billing@creativeco.com",
    phone: "+1 (555) 123-4567",
    status: "Active",
    totalSpend: 245000,
    invoices: 28,
    monthlySpend: 42000,
  },
  {
    id: "media-partners",
    name: "Media Partners",
    email: "contact@mediapartners.com",
    phone: "+1 (555) 234-5678",
    status: "Active",
    totalSpend: 198000,
    invoices: 22,
    monthlySpend: 38000,
  },
  {
    id: "digital-agency",
    name: "Digital Agency",
    email: "team@digitalagency.com",
    phone: "+1 (555) 345-6789",
    status: "Active",
    totalSpend: 187000,
    invoices: 19,
    monthlySpend: 33000,
  },
  {
    id: "brand-studio",
    name: "Brand Studio",
    email: "hello@brandstudio.com",
    phone: "+1 (555) 456-7890",
    status: "Active",
    totalSpend: 156000,
    invoices: 16,
    monthlySpend: 29000,
  },
  {
    id: "marketing-pro",
    name: "Marketing Pro",
    email: "info@marketingpro.com",
    phone: "+1 (555) 567-8901",
    status: "Active",
    totalSpend: 124000,
    invoices: 14,
    monthlySpend: 25000,
  },
];

function formatCompactMoney(value: number) {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <section className="flex h-[135px] flex-col justify-center rounded-[13px] border border-[#676767] bg-black px-[30px]">
      <p className="text-[17px] leading-5 text-[#777]">{title}</p>
      <p className="mt-[17px] text-[36px] font-semibold leading-none text-white">
        {value}
      </p>
    </section>
  );
}

function AgencyCard({
  agency,
  onViewDetails,
}: {
  agency: Agency;
  onViewDetails: (agency: Agency) => void;
}) {
  return (
    <section className="rounded-[13px] border border-[#676767] bg-black px-[29px] py-[29px]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-[15px]">
          <div className="flex h-[41px] w-[41px] shrink-0 items-center justify-center rounded-[8px] border border-[#505050] bg-[#121212] text-[#d8d8d8]">
            <Building2 className="h-[24px] w-[24px]" />
          </div>
          <h2 className="truncate text-[31px] font-semibold leading-none text-white">
            {agency.name}
          </h2>
        </div>
        <span
          className={cn(
            "inline-flex h-[28px] min-w-[102px] items-center justify-center rounded-[7px] border px-[15px] text-[15px] font-semibold leading-none",
            agency.status === "Active"
              ? "border-[#d7d7d7] bg-[#4a4a4a] text-white"
              : "border-[#383838] bg-[#161616] text-[#b8b8b8]"
          )}
        >
          {agency.status}
        </span>
      </div>

      <div className="mt-[34px] space-y-[14px]">
        <div className="flex items-center gap-[12px] text-[17px] leading-5 text-[#9b9b9b]">
          <Mail className="h-[19px] w-[19px] shrink-0" />
          <span className="truncate">{agency.email}</span>
        </div>
        <div className="flex items-center gap-[12px] text-[17px] leading-5 text-[#9b9b9b]">
          <Phone className="h-[19px] w-[19px] shrink-0" />
          <span>{agency.phone}</span>
        </div>
      </div>

      <div className="mt-[28px] grid grid-cols-2 border-t border-[#343434] pt-[12px]">
        <div>
          <p className="text-[15px] leading-5 text-[#777]">Total Spend</p>
          <p className="mt-[8px] text-[20px] font-semibold leading-6 text-white">
            {formatCompactMoney(agency.totalSpend)}
          </p>
        </div>
        <div>
          <p className="text-[15px] leading-5 text-[#777]">Invoices</p>
          <p className="mt-[8px] text-[20px] font-semibold leading-6 text-white">
            {agency.invoices}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewDetails(agency)}
        className="mt-[29px] h-[40px] w-full rounded-[7px] border border-[#686868] bg-[#0c0c0c] text-[17px] font-semibold text-white transition-colors hover:border-[#8a8a8a]"
      >
        View Details
      </button>
    </section>
  );
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>(initialAgencies);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeAgency, setActiveAgency] = useState<Agency | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    totalSpend: "",
    invoices: "",
  });

  const stats = useMemo(() => {
    const totalSpend = agencies.reduce((total, agency) => total + agency.totalSpend, 0);
    const activeInvoices = agencies.reduce((total, agency) => total + agency.invoices, 0);
    const monthlySpend = agencies.reduce(
      (total, agency) => total + agency.monthlySpend,
      0
    );

    return {
      totalAgencies: agencies.length,
      totalSpend,
      activeInvoices,
      monthlySpend,
    };
  }, [agencies]);

  const addAgency = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const totalSpend = Number(form.totalSpend) || 0;
    const invoices = Number(form.invoices) || 0;
    const nextAgency: Agency = {
      id: `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      status: "Active",
      totalSpend,
      invoices,
      monthlySpend: Math.round(totalSpend / 6),
    };

    setAgencies((currentAgencies) => [nextAgency, ...currentAgencies]);
    setForm({ name: "", email: "", phone: "", totalSpend: "", invoices: "" });
    setIsAddOpen(false);
  };

  return (
    <div className="w-full max-w-[1048px]">
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-none text-white">
            Agencies
          </h1>
          <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
            Manage your agency relationships and partnerships
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="inline-flex h-[41px] items-center justify-center gap-[13px] rounded-[7px] border border-white bg-white px-[33px] text-[17px] font-semibold text-black transition-colors hover:bg-[#e8e8e8] md:mt-[14px]"
        >
          <Plus className="h-[18px] w-[18px]" />
          Add Agency
        </button>
      </div>

      <div className="mt-[31px] grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[29px]">
        <StatCard title="Total Agencies" value={stats.totalAgencies.toString()} />
        <StatCard title="Total Spend (YTD)" value={formatCompactMoney(stats.totalSpend)} />
        <StatCard title="Active Invoices" value={stats.activeInvoices.toString()} />
        <StatCard title="Avg. Monthly Spend" value={formatCompactMoney(stats.monthlySpend)} />
      </div>

      <div className="mt-[29px] grid grid-cols-1 gap-[29px] xl:grid-cols-2">
        {agencies.map((agency) => (
          <AgencyCard
            key={agency.id}
            agency={agency}
            onViewDetails={setActiveAgency}
          />
        ))}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <form
            onSubmit={addAgency}
            className="w-full max-w-[520px] rounded-[13px] border border-[#676767] bg-black p-[29px] shadow-2xl"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[29px] font-semibold leading-none text-white">
                Add Agency
              </h2>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                aria-label="Close add agency"
                className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#444] text-[#b8b8b8] hover:border-[#777] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-[28px] grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["Agency Name", "name", "Creative Studio"],
                ["Email", "email", "billing@example.com"],
                ["Phone", "phone", "+1 (555) 000-0000"],
                ["Total Spend", "totalSpend", "125000"],
                ["Invoices", "invoices", "12"],
              ].map(([label, key, placeholder]) => (
                <label key={key} className="flex flex-col gap-2">
                  <span className="text-[14px] font-semibold text-[#8d8d8d]">
                    {label}
                  </span>
                  <input
                    required
                    value={form[key as keyof typeof form]}
                    onChange={(event) =>
                      setForm((currentForm) => ({
                        ...currentForm,
                        [key]: event.target.value,
                      }))
                    }
                    placeholder={placeholder}
                    className="h-[40px] rounded-[7px] border border-[#555] bg-[#0c0c0c] px-3 text-[15px] text-white outline-none placeholder:text-[#666] focus:border-[#8a8a8a]"
                  />
                </label>
              ))}
            </div>

            <button
              type="submit"
              className="mt-[28px] h-[42px] w-full rounded-[7px] border border-white bg-white text-[16px] font-semibold text-black transition-colors hover:bg-[#e8e8e8]"
            >
              Save Agency
            </button>
          </form>
        </div>
      )}

      {activeAgency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <section className="w-full max-w-[560px] rounded-[13px] border border-[#676767] bg-black p-[29px] shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-[15px]">
                <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-[8px] border border-[#505050] bg-[#121212]">
                  <Building2 className="h-[24px] w-[24px] text-[#d8d8d8]" />
                </div>
                <h2 className="truncate text-[29px] font-semibold leading-none text-white">
                  {activeAgency.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveAgency(null)}
                aria-label="Close agency details"
                className="flex h-9 w-9 items-center justify-center rounded-[7px] border border-[#444] text-[#b8b8b8] hover:border-[#777] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-[29px] space-y-[15px] border-b border-[#343434] pb-[24px]">
              <p className="flex items-center gap-[12px] text-[17px] text-[#b8b8b8]">
                <Mail className="h-[19px] w-[19px]" />
                {activeAgency.email}
              </p>
              <p className="flex items-center gap-[12px] text-[17px] text-[#b8b8b8]">
                <Phone className="h-[19px] w-[19px]" />
                {activeAgency.phone}
              </p>
            </div>

            <div className="mt-[24px] grid grid-cols-3 gap-4">
              <div>
                <p className="text-[14px] text-[#777]">Status</p>
                <p className="mt-2 text-[18px] font-semibold text-white">
                  {activeAgency.status}
                </p>
              </div>
              <div>
                <p className="text-[14px] text-[#777]">Total Spend</p>
                <p className="mt-2 text-[18px] font-semibold text-white">
                  {formatMoney(activeAgency.totalSpend)}
                </p>
              </div>
              <div>
                <p className="text-[14px] text-[#777]">Invoices</p>
                <p className="mt-2 text-[18px] font-semibold text-white">
                  {activeAgency.invoices}
                </p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
