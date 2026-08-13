/**
 * UBL demo-faithful last-number-of-transactions model.
 * Mirrors `ILastNumberofTransactionsResponse` from the UBL demo.
 */
export interface ILastNumberofTransactionsResponse {
  tranS_DATE?: string;
  tranS_MODE?: string;
  chQ_NO?: string;
  narration?: string;
  purposE_OF_TRANSACTION?: string;
  dR_AMOUNT?: string;
  cR_AMOUNT?: string;
  balance?: string;
  openinG_BALANCE?: string;
  currencY_NM?: string;
  traceR_NO?: string;
  trrn?: string;
}