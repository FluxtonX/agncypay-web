import { VerificationStatus } from "./verification";

export interface BusinessProfile {
  id: string;
  legalName: string;
  brandName: string;
  businessType: string;
  country: string;
  registrationNumber: string;
  taxId?: string;
  website: string;
  email: string;
  phone?: string;
  verificationStatus: VerificationStatus;
}

export interface BrandVerification {
  id: string;
  brandName: string;
  officialWebsite: string;
  officialEmail: string;
  domainVerified: boolean;
  trademarkNumber?: string;
  status: VerificationStatus;
}
