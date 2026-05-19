import { VerificationDocument } from "../types/document";

export const INITIAL_DOCUMENTS: VerificationDocument[] = [
  {
    id: "doc-01",
    title: "Business Registration Certificate",
    type: "Certificate of Incorporation / Commercial Register extract",
    status: "not_uploaded",
  },
  {
    id: "doc-02",
    title: "Tax Registration Certificate",
    type: "VAT Certificate / EIN Letter / Tax Identification document",
    status: "not_uploaded",
  },
  {
    id: "doc-03",
    title: "Proof of Business Address",
    type: "Utility bill or Bank statement showing legal operating address (within last 3 months)",
    status: "not_uploaded",
  },
  {
    id: "doc-04",
    title: "Articles of Association / Memorandum",
    type: "Official charter detailing company structure, shares, and directors",
    status: "not_uploaded",
  },
  {
    id: "doc-05",
    title: "Company Bank Statement",
    type: "Recent official statement verifying company ownership of the registered bank account",
    status: "not_uploaded",
  },
  {
    id: "doc-06",
    title: "Director / Authorized Signatory Proof",
    type: "Written confirmation or board resolution authorizing the representative to act",
    status: "not_uploaded",
  },
];
