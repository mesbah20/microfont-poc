export class User {
  access_token?: string;
  token_type!: string;
  expires_in!: number;
  userName!: string;
  issued!: string;
  expires!: string;
  customerId!: string;
  branchId!: string;
  deviceIMEI!: string;
  fullName!: string;
  isFirstLogin!: boolean;
  isTPINMendatory!: boolean;
  auth2FAProvider!: string;
  isquesEnable!: boolean;
  customerTypeID!: string;
  customerTypeNM!: string;
}

export class IsValidUserID {
  Status!: string;
  Message!: null;
  Result!: boolean;
}