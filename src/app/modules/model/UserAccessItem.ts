export interface UserAccessItem {
  functionId: string;
  functionName: string;
  HOFunctionFlag: string;
  AllowMaintAddFlag: string;
  AllowMaintEditFlag: string;
  AllowMaintDelFlag: string;
  AllowMaintViewFlag: string;
  AllowMaintAuthFlag: string;
  AllowProcessFlag: string;
  AllowReportViewFlag: string;
  AllowReportPrintFlag: string;
  AllowReportGenFlag: string;
  AllowAnyOfficeOpsFlag: string;
  moduleId: string;
  moduleName: string;
  appRoute: string;
  itemType: string;
  quickRouteNo: string;
  IsFinancial: string;
}
export interface UserAppAccessList {
  id:number,
  uuid:string,
  appId:number,
  appName:string,
  appDesc:string
}
