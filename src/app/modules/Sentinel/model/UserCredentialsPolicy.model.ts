export interface UserCredentialsPolicyModel {
  headOfficeCode: string | null;
  headOfficeName: string | null;
  passLengthMax : number;
  passLengthMin : number;
  passExpPeriodDays : number;
  passHistoryDays : number;
  passReuseMax : number;
  failedLoginAttempts : number;
  passExpForceChangeFlag : boolean;
  passExpAlertDays : number;
  nonAlphaNumCharMin : number;
  samePassRepeatAllow : number;
  passIsAlphanumeric : boolean;
  passSuccSameCharAllow : boolean;
  capitalCharMin : number;
  smallCharMin : number;
  numberMin : number;
  samePassConsequtive : number;
  recentMenuItem : number;
  favoriteMenuItem : number;
  samePassReuseAfter : number;
  userInactiveNoLoginDays : number;
  recordUserId : string;
  recordDate : Date | null;
  adminUserGrade : number;
}
