export type DocumentStatus =
  | "not_uploaded"
  | "uploaded"
  | "processing"
  | "approved"
  | "rejected"
  | "needs_reupload";

export interface VerificationDocument {
  id: string;
  title: string;
  type: string;
  fileName?: string;
  uploadedAt?: string;
  status: DocumentStatus;
  rejectionReason?: string;
}

//helloo