export interface UserProfileModel {
  userId : string;
  userName : string;
  userDescription : string;
  homeOfficeId : number;
  mobileNumber : string;
  userEmailId : string;
  loginId : string;
  passwordString : string;
  lastPasswordChangedOn : Date | null;
  forcePasswordChangedFlag : boolean;
  smsAdminRoleFlag : boolean;
  sysAdminRoleFlag : boolean;
  builtInUserFlag : boolean;
  officeManagerFlag : boolean;
  employeeId : number;
  userStatusActiveFlag : number;
  userStatusChangedOn : Date | null;
  userStatusChangeReason : string;
  userProfileClosedFlag : number;
  userProfileClosedOn : Date | null;
  userProfileChangeReason : string;
  failedLoginAttemptsNos : number;
  activationLink : string;
  activationExpiredOn : Date | null;
  activationLinkStatus : string;
  logInAppTerminalIp : string;
  logInUserTerminalIp : string | null;
  appLogInTime : string;
  appLogOutTime : string;
  sessionExpTime : number | null;
  macAddress : string;
  approveFlag : boolean;
  userImg : string | null;
  bankStaffFlag : boolean;

  employeeCode : string;


  mregUserGrantPackageRequestList : UserGrantPackageModel[];

}
export interface UserGrantPackageModel {
  userId : string;
  packageId : number;
  fromDt : string | null;
  toDt : string | null;
}
