import React from "react";
import { Badge } from "../ui/Badge";
import { Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface InvoiceStatusBadgeProps {
  status: "pending" | "paid" | "overdue" | "processing";
}

export function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const badgeProps = {
    pending: {
      variant: "warning" as const,
      label: "Pending",
      icon: <Clock className="h-3 w-3 shrink-0" />,
    },
    paid: {
      variant: "success" as const,
      label: "Paid",
      icon: <CheckCircle2 className="h-3 w-3 shrink-0" />,
    },
    overdue: {
      variant: "error" as const,
      label: "Overdue",
      icon: <AlertCircle className="h-3 w-3 shrink-0" />,
    },
    processing: {
      variant: "secondary" as const,
      label: "Processing",
      icon: <RefreshCw className="h-3 w-3 shrink-0 animate-spin" />,
    },
  }[status] || {
    variant: "neutral" as const,
    label: "Unknown",
    icon: null,
  };

  return (
    <Badge variant={badgeProps.variant} size="sm" className="gap-1">
      {badgeProps.icon}
      {badgeProps.label}
    </Badge>
  );
}
