"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "../../../context/AppContext";

export interface PaymentDetail {
  id: string;
  invoiceId: string | null;
  externalId: string;
  source: string;
  amount: string;
  currency: string;
  status: string;
  settledAmount: string | null;
  settledAt: string | null;
  invoiceData: {
    clientName?: string;
    description?: string;
    items?: Array<{ title: string; qty: number; rate: number; feeType?: string }>;
    dueDate?: string;
    poNumber?: string;
  } | null;
  description: string | null;
  metadata: Record<string, unknown> | null;
  splits: Array<{
    id: string;
    walletId: string;
    ratio: string;
    amount: string;
    currency: string;
  }>;
  createdAt: string;
  updatedAt: string;
  walletId: string;
}

interface UsePaymentResult {
  payment: PaymentDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePayment(id: string): UsePaymentResult {
  const { state } = useApp();
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayment = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/payments/${id}`, {
        headers: { Authorization: "Bearer dummy-token" },
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to load payment details.");
      setPayment(body.data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPayment();
  }, [fetchPayment]);

  return { payment, loading, error, refetch: fetchPayment };
}
