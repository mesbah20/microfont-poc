export interface GLAccount {
  GL_ACC_SL: string;
  ACCOUNT_NO: string;
  ACCOUNT_TITLE: string;
  PRODUCT_TYPE: string;
  ACC_LEVEL: string;
  ACC_DR_CR: string;
  CURRENCY_ID: string;
  CURRENCY_SH_NM?: string | null;
  CURRENCY_FULL_NM?: string | null;
  TXN_FLAG: string;
  OFF_BS_FLAG: boolean;
  TOT_GL_ACC_SL: string;
  ENTITY_ID: string;
  CONTRA_CONTIGENT_FLAG: boolean;
  SWITCH_GL_FLAG: boolean;
  HO_ACCESS_FLAG: boolean;
}

export interface GLChartResponse {
  message: string;
  payload: GLAccount[];
  status: boolean;
}


export interface GLChartRequest {
  pproductType?: string;
  pcurrencyId?: string;
  ptxnFlag?: string;
  poffBsFlag?: string;
  pstartacc?: string;
  pendacc?: string | null;
  paccountTitle: string;   // required
  pentityId: string;       // required
}

export interface GLTreeNode {
  GL_ACC_SL: string;
  ACCOUNT_NO: string;         // unique ID
  ACCOUNT_TITLE: string;
  ACC_LEVEL: number;        // 0=root, 1=child of 0, etc.
  expanded?: boolean;      // for UI toggle
  children: GLTreeNode[];
  hasChildren?: boolean;   // true if node has children
  loading?: boolean;
  txnFlag: number;
  PRODUCT_TYPE: string;
  ACC_DR_CR: string;
  CURRENCY_ID: string;
  CURRENCY_SH_NM?: string | null;
  CURRENCY_FULL_NM?: string | null;
  TXN_FLAG: string;
  OFF_BS_FLAG: boolean;
  TOT_GL_ACC_SL: string;
  ENTITY_ID: string;
  CONTRA_CONTIGENT_FLAG: boolean;
  SWITCH_GL_FLAG: boolean;
  HO_ACCESS_FLAG: boolean;
}

export interface GLStatusRequest {
  paccountSl: String | null;
  pentityId: String | null;
  pproductType: String | null;
}
