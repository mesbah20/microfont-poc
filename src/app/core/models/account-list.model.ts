/**
 * UBL demo-faithful account list model.
 * Mirrors `IAccountListResponse` from the UBL demo.
 */
export interface IAccountListResponse {
  appL_TYPE?: string;
  apP_SL_NO?: string;
  applicatioN_NAME?: string;
  outstandinG_BAL?: string;
  producT_ID?: string;
  producT_NM?: string;
  producT_TYPE?: string;
  brancH_ID?: string;
  brancH_NM?: string;
  accounT_NUMBER?: string;
  accounT_TITLE?: string;
  accounT_STATUS?: string;
  currencY_NM?: string;
  availablE_BALANCE?: string;
  outstandinG_BAL_LCY?: string;
  opeN_DT?: string;
  lasT_TRN_DT?: string | null;
}