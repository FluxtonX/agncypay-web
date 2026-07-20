import { NormalizedInvoice, NormalizedPayout, NormalizedVendor, ConnectionStatus } from "../../types";
import { QBInvoice, QBPayout, QBVendor, QBStatusResponse } from "./types";

export const mapQBInvoice = (invoice: QBInvoice): NormalizedInvoice => {
  return {
    id: invoice.id,
    docNumber: invoice.docNumber,
    name: invoice.name,
    detail: invoice.detail,
    date: invoice.date,
    amount: invoice.amount,
    status: (invoice.status === "Paid" ? "Paid" : "Pending") as "Paid" | "Pending",
    daysText: invoice.daysText,
  };
};

export const mapQBPayout = (payout: QBPayout): NormalizedPayout => {
  return {
    id: payout.id,
    name: payout.name,
    detail: payout.detail,
    date: payout.date,
    amount: payout.amount,
    fallback: payout.fallback || "NA",
    method: payout.method || "Bank Transfer",
    status: (payout.status === "Paid" ? "Paid" : payout.status === "Failed" ? "Failed" : "Pending") as "Paid" | "Failed" | "Pending",
  };
};

export const mapQBVendor = (vendor: QBVendor): NormalizedVendor => {
  return {
    id: vendor.id,
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
  };
};

export const mapQBStatus = (status: QBStatusResponse): ConnectionStatus => {
  return {
    connected: status.connected,
    realmId: status.realmId,
    environment: status.environment || "sandbox",
    connectedAt: status.connectedAt,
  };
};
