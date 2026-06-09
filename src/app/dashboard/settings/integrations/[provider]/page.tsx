import React from "react";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { erpProviders, mockChartOfAccounts, mockSyncLogs } from "@/data/mock-integrations";
import { IntegrationClientContent } from "@/components/dashboard/integrations/IntegrationClientContent";

export default async function IntegrationDetailsPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const { provider: providerId } = await params;
  
  const provider = erpProviders.find(p => p.id === providerId);
  
  if (!provider) {
    return (
      <div className="flex h-[400px] items-center justify-center text-white">
        Provider not found
      </div>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link 
            href="/dashboard/settings" 
            className="mb-4 inline-flex items-center gap-2 text-[14px] font-medium text-[#9b9b9b] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-[48px] w-[48px] items-center justify-center rounded-[10px] bg-white p-[8px]">
              <img src={provider.logoUrl} alt={provider.name} className="max-h-full max-w-full object-contain" />
            </div>
            <div>
              <h1 className="text-[28px] font-semibold leading-none text-white">
                {provider.name} Integration
              </h1>
              <div className="mt-[8px] flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-[14px] text-[#9b9b9b]">Connected & Active</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button className="inline-flex h-[38px] items-center justify-center gap-2 rounded-[7px] border border-[#303030] bg-[#0c0c0c] px-[16px] text-[15px] font-semibold text-white transition-colors hover:border-[#555]">
            <RefreshCw className="h-4 w-4 text-[#b8b8b8]" />
            Force Sync Now
          </button>
        </div>
      </div>

      <div className="mt-[36px] grid grid-cols-1 gap-[24px] lg:grid-cols-[1fr_400px]">
        
          <IntegrationClientContent 
            provider={provider} 
          />

        {/* Sidebar Settings */}
        <aside className="space-y-[24px]">
          <section className="rounded-[13px] border border-[#303030] bg-black p-[28px]">
            <h3 className="text-[17px] font-semibold text-white">Automation Rules</h3>
            <div className="mt-[20px] space-y-[16px]">
              <label className="flex cursor-pointer items-start gap-4">
                <input type="checkbox" defaultChecked className="mt-1 h-[18px] w-[18px] accent-white" />
                <div>
                  <div className="text-[15px] font-medium text-white">Auto-sync Payments</div>
                  <div className="mt-1 text-[13px] text-[#8d8d8d]">Push payment records to {provider.name} instantly when marked as paid.</div>
                </div>
              </label>
              <label className="flex cursor-pointer items-start gap-4">
                <input type="checkbox" defaultChecked className="mt-1 h-[18px] w-[18px] accent-white" />
                <div>
                  <div className="text-[15px] font-medium text-white">Auto-create Vendors</div>
                  <div className="mt-1 text-[13px] text-[#8d8d8d]">If a vendor doesn't exist in {provider.name}, create them automatically.</div>
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-[13px] border border-[#303030] bg-black p-[28px]">
            <h3 className="text-[17px] font-semibold text-white">Danger Zone</h3>
            <p className="mt-[12px] text-[14px] leading-relaxed text-[#9b9b9b]">
              Disconnecting will stop all automated syncing. Your existing records in {provider.name} will not be deleted.
            </p>
            <button className="mt-[16px] h-[38px] w-full rounded-[7px] border border-red-500/30 bg-red-500/10 text-[15px] font-semibold text-red-500 transition-colors hover:bg-red-500/20">
              Disconnect Integration
            </button>
          </section>
        </aside>

      </div>
    </main>
  );
}
