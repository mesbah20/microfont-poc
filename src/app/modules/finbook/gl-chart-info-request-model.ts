export class GetGLAccountChartInfoRequest {
    pnameValueList: string | null;
    pentityId: String | null;
    pglAccSl: string | null;
    paccountNo: string | null;
    pqueueId: string | null;
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

export interface GLStatusRequest {
  paccountSl: String | null;
  pentityId: String | null;
  pproductType: String | null;
}
