export interface VerificationStep {
  id: number;
  label: string;
  description: string;
  path: string;
}

export const VERIFICATION_STEPS: VerificationStep[] = [
  {
    id: 1,
    label: "Business Information",
    description: "Legal company registration details",
    path: "/verification/business-info",
  },
  {
    id: 2,
    label: "Legal Representative",
    description: "Identity and details of account manager",
    path: "/verification/representative",
  },
  {
    id: 3,
    label: "Ownership & Authorization",
    description: "Ownership declarations or power of attorney",
    path: "/verification/authorization",
  },
  {
    id: 4,
    label: "Company Documents",
    description: "Official documents for verification",
    path: "/verification/documents",
  },
  {
    id: 5,
    label: "Brand Authorization",
    description: "Verify Adidas brand email and ownership",
    path: "/verification/brand",
  },
  {
    id: 6,
    label: "Bank Details",
    description: "Payout bank account registration",
    path: "/verification/bank-details",
  },
  {
    id: 7,
    label: "Review & Submit",
    description: "Final review and declaration checks",
    path: "/verification/review",
  },
  {
    id: 8,
    label: "Verification Status",
    description: "Real-time compliance status tracker",
    path: "/verification/status",
  },
];
