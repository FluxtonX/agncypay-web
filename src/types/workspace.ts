export type WorkspaceType =
  | "brand"
  | "agency"
  | "talent_independent"
  | "talent_agency"
  | "mother_agency";

export type LegacyAccountType = "individual" | "agency" | "brand";

export type AccountType = LegacyAccountType | WorkspaceType;

export type VerificationTrack = "kyb" | "kyc" | "enterprise_kyb";

export type WorkspaceRole =
  | "admin"
  | "finance"
  | "approver"
  | "viewer"
  | "agency_admin"
  | "finance_manager"
  | "talent_manager"
  | "talent"
  | "super_admin"
  | "treasury"
  | "finance_ops";

export type Permission =
  | "approve_invoices"
  | "initiate_payments"
  | "view_treasury"
  | "manage_team"
  | "create_invoices"
  | "manage_talent"
  | "approve_payouts"
  | "view_splits"
  | "manage_hierarchy"
  | "view_reports"
  | "manage_payout_settings";

export interface Workspace {
  id: string;
  type: WorkspaceType;
  name: string;
  agncyId: string;
  externalId?: string;
  verificationTrack: VerificationTrack;
  verificationStatus: "draft" | "submitted" | "in_review" | "approved" | "requires_action";
  parentWorkspaceId?: string;
}

export interface Membership {
  id: string;
  userEmail: string;
  workspaceId: string;
  role: WorkspaceRole;
  permissions: Permission[];
  status: "active" | "invited" | "requested";
}

export function normalizeWorkspaceType(accountType: AccountType): WorkspaceType {
  if (accountType === "individual") return "talent_independent";
  return accountType;
}

export function getDefaultWorkspaceRole(type: WorkspaceType): WorkspaceRole {
  if (type === "agency") return "agency_admin";
  if (type === "mother_agency") return "super_admin";
  if (type === "talent_agency" || type === "talent_independent") return "talent";
  return "admin";
}

export function getVerificationTrack(type: WorkspaceType): VerificationTrack {
  if (type === "talent_agency" || type === "talent_independent") return "kyc";
  if (type === "mother_agency") return "enterprise_kyb";
  return "kyb";
}

export function getDefaultPermissions(role: WorkspaceRole): Permission[] {
  const permissionsByRole: Record<WorkspaceRole, Permission[]> = {
    admin: ["approve_invoices", "initiate_payments", "view_treasury", "manage_team", "view_reports"],
    finance: ["initiate_payments", "view_treasury", "view_reports"],
    approver: ["approve_invoices", "view_reports"],
    viewer: ["view_reports"],
    agency_admin: [
      "create_invoices",
      "manage_talent",
      "approve_payouts",
      "view_splits",
      "manage_team",
      "view_reports",
    ],
    finance_manager: ["create_invoices", "approve_payouts", "view_splits", "view_reports"],
    talent_manager: ["manage_talent", "view_splits", "view_reports"],
    talent: ["create_invoices", "manage_payout_settings"],
    super_admin: [
      "manage_hierarchy",
      "view_treasury",
      "initiate_payments",
      "approve_payouts",
      "manage_team",
      "view_reports",
    ],
    treasury: ["view_treasury", "initiate_payments", "approve_payouts", "view_reports"],
    finance_ops: ["approve_payouts", "view_reports"],
  };

  return permissionsByRole[role];
}
