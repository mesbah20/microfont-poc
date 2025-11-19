export interface MetaAppListItem {
  appId: number;
  appName: string;
  appDesc?: string | null;
}

export interface MetaAppModuleItem {
  moduleId: string;
  moduleName: string;
  enabledFlag?: number | null;
  appId: number;
}

export interface MetaAppFunctionItem {
  functionId: number;
  functionName: string;
  moduleId: number;
  appId: number;
  appRoute?: string | null;
  enabledFlag?: number | null;
}

export interface ApprovalFunctionLevelModel {
  workflowId?: number | null;
  workflowName: string | null;
  appId?: number | null;
  // functionId: number;
  numberOfApprovalLevel: number;
}

export interface ApprovalFunctionLevelDetailModel {
  workflowDetailId?: number | null;
  workflowId: number;
  approvalLevel: number;
  approverNo?: number | null;
  approvalPolicy: number;
  organizationLevel?: number | null;
  policyDescription?: string;
  roleCount?: number;
}

export interface ApproveRoleMapModel {
  workflowRoleMapId?: number | null;
  workflowDetailId: number;
  roleName: string;
}

export interface ApprovalPolicyIndicatorModel {
  approvalPolicyId: number;
  description: string;
}

export interface ApprovalEligibleApproverUserModel {
  userId: string;
  userName?: string | null;
  homeOfficeId?: number | null;
  roleNames: string[];
}

export interface ApprovalEligibleApproverModel {
  approvalLevel: number;
  approvalPolicy: number;
  conditionPayload: string|null;
  approvers: ApprovalEligibleApproverUserModel[];
}

export interface ApprovalLevelViewModel extends ApprovalFunctionLevelDetailModel {
  policyDescription?: string;
  roles: string[];
  roleMappings?: ApproveRoleMapModel[];
  roleCount?: number;
}
