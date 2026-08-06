import { NormalizedInvoice, NormalizedPayout, NormalizedVendor, ConnectionStatus } from "../../types";
import { SageInvoice, SagePayout, SageVendor, SageStatus } from "./types";

export const mapSageInvoice = (invoice: SageInvoice): NormalizedInvoice => {
  return {
    id: invoice.id,
    docNumber: invoice.docNo,
    name: invoice.customerName,
    detail: invoice.memo,
    date: invoice.dateCreated,
    amount: invoice.totalAmt,
    status: (invoice.paymentStatus === "Paid" ? "Paid" : "Pending") as "Paid" | "Pending",
    daysText: invoice.daysText,
  };
};

export const mapSagePayout = (payout: SagePayout): NormalizedPayout => {
  return {
    id: payout.id,
    name: payout.vendorName,
    detail: payout.description,
    date: payout.dateCreated,
    amount: payout.amount,
    fallback: payout.fallback,
    method: payout.paymentMethod,
    status: (payout.status === "Paid" ? "Paid" : payout.status === "Failed" ? "Failed" : "Pending") as "Paid" | "Failed" | "Pending",
  };
};

export const mapSageVendor = (vendor: SageVendor): NormalizedVendor => {
  return {
    id: vendor.id,
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
  };
};

export const mapSageStatus = (status: SageStatus): ConnectionStatus => {
  return {
    connected: status.connected,
    realmId: status.companyId, // map Sage companyId to normalized realmId
    environment: status.environment,
    connectedAt: status.connectedAt,
  };
};
