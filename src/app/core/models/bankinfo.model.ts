export interface IBankInfo {
  bankName: string;
  branchName: string;
  branchCode: string;
  routingNumber: string;
  address?: string;
}

/**
 * Demo-faithful home bank branch response.
 * Backend returns these fields with unusual mixed-case (brancH_ID / brancH_NM).
 */
export interface IHomeBranchInfoResponse {
  brancH_ID?: string;
  brancH_NM?: string;
  basE_CURRENCY_ID?: string;
  islamiC_FLAG?: string;
  offshorE_FLAG?: string;
  [key: string]: any;
}

/**
 * Demo-faithful advertisement payload.
 * Backend returns RootResponse<string[]> where strings are base64 image data URIs.
 */
export interface IAdvertisement {
  imageData?: string;
  title?: string;
  redirectUrl?: string;
  [key: string]: any;
}
