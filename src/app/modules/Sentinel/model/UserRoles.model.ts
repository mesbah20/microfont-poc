import {UserGrantPackageModel} from './UserProfile.model';

export interface UserRolesModel {
  roleName: string;
  roleDescrip:string|null;
  approveFlag:number|null;
}
export interface UserRoleFunctionModel {
  roleName: string;
  functionId: number;
  allowMaintAddFlag: number|null;
  allowMaintEditFlag: number|null;
  allowMaintDelFlag: number|null;
  allowMaintViewFlag: number|null;
  allowMaintAuthFlag: number|null;
  allowProcessFlag: number|null;
  allowReportViewFlag: number|null;
  allowReportPrintFlag: number|null;
  allowReportGenFlag: number|null;
  allowAnyOfficeOpsFlag: number|null;
  approveFlag: number|null;
  functionNm: string|null;
}
export interface DefineUserRole {
  userRoles: UserRolesModel;
  mregUserRoleFunction : UserRoleFunctionModel[];
}
export interface UserGrantRole {
  userId: string;
  roleName: string;
  approveFlag:number;
  fromDt:string|null;
  toDt:string|null;
}

export interface AppFunctionsRequest {
  appId: string;
  itemType: string;
  moduleId: number|null
}
export interface AppFunctionsResponse {
  functionId : number;
  functionNm :string;
  moduleId : number | null;
  hoFunctionFlag : number | null;
  rptViewFlag : number | null;
  rptPrintFlag : number | null;
  rptGenFlag : number | null;
  appRoute :string|null;
  itemType :string|null;
  enabledFlag : number | null;
  allowAnyOfficeOpsFlag : number | null;
  quickRouteNo :string|null;
  isFinancial : number | null;
  appId : number | null;
}

export interface UserRoleFunctionUI extends Omit<UserRoleFunctionModel,
  | 'allowMaintAddFlag'
  | 'allowMaintEditFlag'
  | 'allowMaintDelFlag'
  | 'allowMaintViewFlag'
  | 'allowMaintAuthFlag'
  | 'allowProcessFlag'
  | 'allowReportViewFlag'
  | 'allowReportPrintFlag'
  | 'allowReportGenFlag'
  | 'allowAnyOfficeOpsFlag'
  | 'approveFlag'> {
  allowMaintAddFlag: boolean;
  allowMaintEditFlag: boolean;
  allowMaintDelFlag: boolean;
  allowMaintViewFlag: boolean;
  allowMaintAuthFlag: boolean;
  allowProcessFlag: boolean;
  allowReportViewFlag: boolean;
  allowReportPrintFlag: boolean;
  allowReportGenFlag: boolean;
  allowAnyOfficeOpsFlag: boolean;
  approveFlag: boolean;
}

