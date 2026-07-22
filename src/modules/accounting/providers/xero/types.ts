export interface XeroInvoice {
  InvoiceID: string;
  InvoiceNumber: string;
  ContactName: string;
  Reference: string;
  Date: string;
  Total: number;
  Status: string;
  DueDateText: string;
}

export interface XeroPayment {
  PaymentID: string;
  AccountName: string;
  Description: string;
  DateText: string;
  AmountText: string;
  Initials: string;
  PaymentMethod: string;
  Status: string;
}

export interface XeroContact {
  ContactID: string;
  Name: string;
  EmailAddress?: string;
  Phones?: string;
}

export interface XeroStatus {
  connected: boolean;
  tenantId?: string;
  environment: string;
  connectedAt?: string;
}
