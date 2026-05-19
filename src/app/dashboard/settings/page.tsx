"use client";

import React from "react";
import { User, Building, ShieldCheck, Mail, Phone, Globe } from "lucide-react";
import { useApp } from "../../../context/AppContext";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";

export default function SettingsPage() {
  const { state } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs text-[#94A3B8] mt-0.5">
          Manage corporate credentials and authorized treasury contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <Card className="border-white/[0.06] p-6 space-y-4 bg-[#070B14]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="h-4.5 w-4.5 text-[#8B5CF6]" /> Representative Identity
          </h3>

          <div className="space-y-3.5 text-xs text-[#94A3B8] pt-2">
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Full Legal Name</span>
              <span className="font-semibold text-white">{state.representative.fullName || "Martin Safi"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Job Title</span>
              <span className="font-semibold text-white">{state.representative.jobTitle || "Corporate Treasury Manager"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Work Email</span>
              <span className="font-semibold text-white">{state.representative.email || state.user?.email || "martin.safi@adidas-group.com"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Contact Number</span>
              <span className="font-semibold text-white">{state.representative.phone || "+49 176 1234567"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Residential Country</span>
              <span className="font-semibold text-white">{state.representative.nationality || "Germany"}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert("Simulation: Identity updates are gated by compliance re-approval verification.")}
            >
              Update Profile Details
            </Button>
          </div>
        </Card>

        {/* Corporate Workspace Details */}
        <Card className="border-white/[0.06] p-6 space-y-4 bg-[#070B14]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building className="h-4.5 w-4.5 text-[#06B6D4]" /> Corporate Profile
          </h3>

          <div className="space-y-3.5 text-xs text-[#94A3B8] pt-2">
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Legal Entity Name</span>
              <span className="font-semibold text-white">{state.businessSetup.legalName || "Adidas AG"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Trading Name</span>
              <span className="font-semibold text-white">{state.businessSetup.brandName || "Adidas"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Registration ID</span>
              <span className="font-semibold text-white">{state.businessSetup.registrationNumber || "HRB 3838"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Tax ID / VAT</span>
              <span className="font-semibold text-white">{state.businessSetup.taxId || "DE 132492835"}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-[#94A3B8]/60">Corporate Website</span>
              <span className="font-semibold text-[#06B6D4] underline">{state.businessSetup.website || "https://www.adidas.com"}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => alert("Simulation: Workspace profile changes require re-triggering corporate KYB reviews.")}
            >
              Request Corporate Profile Edit
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
