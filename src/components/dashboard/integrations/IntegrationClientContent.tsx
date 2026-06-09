"use client";

import React, { useState } from "react";
import { DataMappingForm } from "./DataMappingForm";
import { RealSyncLogs } from "./RealSyncLogs";

export function IntegrationClientContent({ 
  provider
}: { 
  provider: any 
}) {
  return (
    <div className="space-y-[24px]">
      <RealSyncLogs refreshKey={0} />
    </div>
  );
}
