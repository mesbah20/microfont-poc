export interface GetGLAccountChartInfoRequest {
    pnameValueList: string | null;
    pentityId: String | null;
    pglAccSl: string | null;
    paccountNo: string | null;
    pqueueId: string | null;
}
export interface GetGLAccountMatserInfoRequest {
    pproductType: string | null;
    pcurrencytype: string;
    pcurrencyId: string | null;
    ptxnFlag: string | null;
    poffBsFlag: string | null;
    pofficeId: string | null;
    pstartacc: string | null;
    pendacc: string | null;
    paccountTitle: string | null;
}


export class GlChartAccountInfoResponse {
    glAccSl: number;
    accountNo: string;
    accountTitle: string;
    productId: string;
    totGlAccSl: number;
    totallingAccNo: string;
    totallingAccNm: string;
    productType: string;
    accDrCr: string;
    accLevel: number;
    currencyId: number;
    currencyShNm: string;
    currencyFullNm: string;
    txnFlag: number;
    offBsFlag: number;
    officeAccesFlag: number;
    hoAccesFlag: number;
    contraContingentFlag: number;
    switchGlFlag: number;
    switchGlAccSl: number;
    switchAccountTitle: string;
    glAccSubFlag: number;       //gl_breakup_flag
    recordStatus: number;
    statementCycle: string;
    openingDt: string;
    approveFlag: number;
    recordUserId: string;
    recordDt: string;
    rowid: string;
    ioTxnFlag: number;
    entityId: string;
    entryDt : string;
}

export interface GLTxnRequest {
    officeId: number;
    glAccSl: number;
    accountNo: string;
    glAccSubSl: number;
    sunsusSlNol: string;
    journalNo: number;
    entryNo: number;
    functionId: string;
    productId: string;
    txnDate: string;
    valDate: string;
    txnMode: number;
    txnDrCr: string;
    currencyId: number;
    fxRateId: number;
    fxRateAmt: number;
    txnPurposeId: number;
    txnAmtTc: number;
    txnAmtLc: number;
    balanceTc: number;
    balanceLc: number;
    particulars: string;
    socId: number;
    socSrcOfficeId: string;
    socSrcClAccSl: string;
    recordUserId: string;
    adviceGenFlag : string;
    remoteTxnFlag : number;
    remoteOfficeId : string;
    remoteJournalNo: number;
    remoteTxnDate : string;
}

export interface GlResponse {
    journalNo: string;
    errorMsg: string;
}

export interface AccountSearchRequest {
    pproductType: string | null;
    pcurrencytype: string | null;
    pcurrencyId: string | null;
    ptxnFlag: string | null;
    poffBsFlag: string | null;
    pofficeId: string | null;
    pstartacc: string | null;
    pendacc: string | null;
    paccountTitle: string | null;

}

export class AccountInfoResponse {
    glAccSl: number;
    accountNo: string;
    accountTitle: string;
    productType: string;
    accLevel: number;
    accDrCr: string;
    currencyId: number;
    currencyShNm: string;
    currencyFullNm: string;
    txnFlag: number;
    officeId: number;
    openingDt: string;
    currencyName: string;
    totGlAccSl: number;
    totGlAccName: string;
    txnLastDt: string;
    officeAccesFlag: number;
    hoAccesFlag: number;
    switchGlFlag: number;
    contraContingentFlag: number;
    ioTxnFlag: number;
    sunsusFlag: number;
    switchGlAccSl: number;
    switchGlAccName: string;
    openingBalanceLc: number;
    openingBalanceTc: number;
    balanceLc: number;
    balanceTc: number;
    currentBalanceLc: number;
    currentBalanceTc: number;
    closingBalanceLc: number;
    closingBalanceTc: number;
    productId: string | null;
    glAcSubFlag: number;
    entryDt : string;
}

export interface GetGLMasterAccountListRequest {
    pnameValue: String | null;
    pglAccSl: String | null;
    pqueueId: String | null;
}

export interface GetGLMasterAccountListResponse {
   officeId: number;
  officeNm: string;
  glAccSl: number;
  accountNo: string;
  accountTitle: string;
  productId: string;
  totGlAccSl: number;
  productType: string;
  productTypeName: string;
  accDrCr: string;
  accDrCrNm: string;
  accLevel: number;
  currencyId: number;
  txnFlag: number;
  officeAccesFlag: number;
  hoAccesFlag: number;
  contraContingentFlag: number;
  switchGlFlag: number;
  switchGlAccSl: number;
  glAccSubFlag: number;
  openingDt: Date;
  txnLastDt: Date;
  openingBalanceLc: number;
  openingBalanceTc: number;
  closingBalanceLc: number;
  closingBalanceTc: number;
  currentBalanceLc: number;
  currentBalanceTc: number;
  balanceLc: number;
  balanceTc: number;
  totDrTxnAmtLc: number;
  totDrTxnAmtTc: number;
  totCrTxnAmtLc: number;
  totCrTxnAmtTc: number;
  ytdDrTxnAmtLc: number;
  ytdDrTxnAmtTc: number;
  ytdCrTxnAmtLc: number;
  ytdCrTxnAmtTc: number;
  sunsusFlag: number;
  ioTxnFlag: number;
  rtrnCalProductDr: number;
  rtrnCalProductCr: number;
  rtrnCalLastDt: Date;
  rtrnCaptLastDt: Date;
  rtrnCaptLastAmtCr: number;
  rtrnCaptLastAmtDr: number;
  rtrnCaptNextDt: Date;
  rtrnAcruAmtCrTc: number;
  rtrnAcruAmtDrTc: number;
  rtrnProvAmtCrTc: number;
  rtrnProvAmtDrTc: number;
  rtrnRateCrAmt: number;
  rtrnRateDrAmt: number;
  rtrnRcvdYtdTc: number;
  rtrnCaptYtdTc: number;
  fcRevalueFlag: number;
  revalFxRateId: number;
  recordUserId: string;
  recordDt: Date;
  approveFlag: number;
  currencyShNm: string;
  rowid: string;
}