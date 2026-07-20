import { NormalizedInvoice, NormalizedPayout, NormalizedVendor, ConnectionStatus } from "../../types";
import { XeroInvoice, XeroPayment, XeroContact, XeroStatus } from "./types";

export const mapXeroInvoice = (invoice: XeroInvoice): NormalizedInvoice => {
  return {
    id: invoice.InvoiceID,
    docNumber: invoice.InvoiceNumber,
    name: invoice.ContactName,
    detail: invoice.Reference,
    date: invoice.Date,
    amount: invoice.Total,
    status: (invoice.Status === "PAID" ? "Paid" : "Pending") as "Paid" | "Pending",
    daysText: invoice.DueDateText,
  };
};

export const mapXeroPayout = (payment: XeroPayment): NormalizedPayout => {
  return {
    id: payment.PaymentID,
    name: payment.AccountName,
    detail: payment.Description,
    date: payment.DateText,
    amount: payment.AmountText,
    fallback: payment.Initials,
    method: payment.PaymentMethod,
    status: (payment.Status === "PAID" ? "Paid" : payment.Status === "FAILED" ? "Failed" : "Pending") as "Paid" | "Failed" | "Pending",
  };
};

export const mapXeroContact = (contact: XeroContact): NormalizedVendor => {
  return {
    id: contact.ContactID,
    name: contact.Name,
    email: contact.EmailAddress,
    phone: contact.Phones,
  };
};

export const mapXeroStatus = (status: XeroStatus): ConnectionStatus => {
  return {
    connected: status.connected,
    tenantId: status.tenantId,
    environment: status.environment,
    connectedAt: status.connectedAt,
  };
};
