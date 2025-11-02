export interface AccountModel {
  id: string;           // Account identifier
  ccy: string;          // Currency
  tp: string;           // Account type
  nm: string;           // Account name
  schmeNm: string;      // Scheme name
  issr: string;         // Issuer
  schmeNmCd: string;//OTHER/SchemeName CODE MAX 4 ExternalAccountIdentification1Code
  schmeNmPrtry : string;//OTHER/SchemeName PRIORITY
  tpCd: string;//Type/CD
  tpPrtry: string;//TYPE/PRIORITY
  prxyTpCd: string;//Proxy
  prxyTpPrtry: string;//Proxy
  prxyId: string;//PROXY ID MAX 320
  prxyCd: string;         // Issuer
  prxyPrtry: string;         // Issuer

}
