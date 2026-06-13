import React from "react";
export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { erpProviders } from "@/data/mock-integrations";
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
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link 
            href="/dashboard/settings" 
            className="mb-4 inline-flex items-center gap-2 text-[14px] font-medium text-[#9b9b9b] transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
          <h1 className="text-[28px] font-semibold leading-none text-white">
            {provider.name} Integration
          </h1>
          <p className="mt-3 max-w-[720px] text-[15px] leading-6 text-[#9b9b9b]">
            Manage connection status, sync health, account mapping, and disconnect controls.
          </p>
        </div>
      </div>

      <div className="mt-[36px]">
        <IntegrationClientContent provider={provider} />
      </div>
    </main>
  );
}
