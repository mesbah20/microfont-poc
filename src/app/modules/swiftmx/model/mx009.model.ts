import {AccountModel} from './account.model';
import { AgentModel } from './agent.model';
import { RelatedModel } from './related.model';

export interface Mx009Model {
  // timeIndi13C: string;
  // timeSign13C: string;
  // timeOffset13C: string;
  // valDate32A: Date;
  // valCurr32A: string;
  // valAmt32A: number;
  fromBicfi: string; //[A-Z0-9]{4,4}[A-Z]{2,2}[A-Z0-9]{2,2}([A-Z0-9]{3,3}){0,1}
  toBicfi: string; //[A-Z0-9]{4,4}[A-Z]{2,2}[A-Z0-9]{2,2}([A-Z0-9]{3,3}){0,1}
  bizMsgIdr: string; //BusinessMessageIdentifier max 35
  msgDefIdr: string; //MessageDefinitionIdentifier example - camt.001.001.03
  bizSvc: string; //BusinessService The value "swift.cbprplus.02" must be used.
  creDt: string;
  cpyDplct?: string;  // values can be only - CODU,COPY,DUPL
  pssblDplct?: string;  //PossibleDuplicate Values Can only  be - YES/NO
  priority?: string; // Header block Priority values can only be - HIGH,NORM
  msgId: string;  // MessageIdentification  //0-9 a-z A-Z / - ? : ( ) . , '
  creDtTm: string; //CreationDateTime
  nbOfTxs: string; // Number of transactions
  sttlmMtd: string; //SettlementMethod value - COVE,INDA,INGA
  sttlmAcct: AccountModel; //SettlementMethod
  //need more properties here for settlement method
  /// PaymentIdentification Tag
  /// Assigned by Instructing party to Instructed party to identify the msg uniquely
  /// can never have starting or ending / and never have '//'
  instrId: string; //InstructionIdentification Max 16 pattern 0-9 a-z A-Z - ? : ( ) . , ' +
  endToEndId: string; //EndToEndIdentification max 35
  txId: string; //TransactionIdentification max 35 Mandatory
  /// If the pacs.009 is used to settle a pacs.009 Advice, the UETR should transport
  /// the UETR of the underlying pacs.009 Advice
  uetr: string; //Mandatory
  clrSysRef: string;  //ClearingSystemReference max 35 pattern [0-9a-zA-Z/\-\?:\(\)\.,'\+ ]+
  //End PaymentIdentification tag
  instrPrty: string; //InstructionPriority value can be HIGH/NORM
  clrChanl?: string; //ClearingChannel values can be BOOK/MPNS/RTGS/RTNS
  svcLvlCD: string[]; //ServiceLevelCode Max 3
  svcLvlPrtry: string[]; //Proprietary Max 3
  lclInstrmCD: string; //LocalInstrument
  lclInstrmPrtry: string; //LocalInstrument Proprietary
  ctgyPurpCd: string; //CategoryPurpose Code
  ctgyPurpPrtry: string; //CategoryPurpose
  intrBkSttlmAmtCcy: string; //InterbankSettlementAmount max 3 char
  intrBkSttlmAmt: number; //InterbankSettlementAmount size 14,5
  intrBkSttlmDt: string; //InterbankSettlementDate
  sttlmPrty: string; //SettlementPriority valus HIGH/NORM/URGT
  prvsInstgAgt1: AgentModel; //PreviousInstructing <>: AgentModel
  prvsInstgAgt1Acct: AccountModel; //PreviousInstructing<>:: AgentModel AccountModel
  prvsInstgAgt3: AgentModel; //PreviousInstructing <>: AgentModel
  prvsInstgAgt2: AgentModel; //PreviousInstructing <>: AgentModel
  prvsInstgAgt2Acct: AccountModel; //PreviousInstructing<>:: AgentModel AccountModel
  prvsInstgAgt3Acct: AccountModel; //PreviousInstructing<>:: AgentModel AccountModel
  instgAgt: AgentModel; //Instructing<>: AgentModel
  instdAgt: AgentModel; //Instructed<>: AgentModel
  intrmyAgt1: AgentModel; //Intermediary <>: AgentModel
  intrmyAgt1Acct: AccountModel; //Intermediary<>:: AgentModel AccountModel
  intrmyAgt2: AgentModel; //Intermediary <>: AgentModel
  intrmyAgt2Acct: AccountModel; //Intermediary<>:: AgentModel AccountModel
  intrmyAgt3: AgentModel; //Intermediary <>: AgentModel
  intrmyAgt3Acct: AccountModel; //Intermediary<>:: AgentModel AccountModel
  dbtr: AgentModel; //Debtor <>
  dbtrAcct: AccountModel; //Debtor<>: AccountModel
  dbtrAgt: AgentModel; //Debtor<>: AgentModel
  dbtrAgtAcct: AccountModel; //Debtor>:: AgentModel AccountModel
  cdtrAgt: AgentModel; //Creditor<>: AgentModel
  cdtrAgtAcct: AccountModel; //Creditor>:: AgentModel AccountModel
  cdtr: AgentModel; //Creditor <>
  cdtrAcct: AccountModel; //CreditorAccount
  instrForCdtrAgtCD: string; //InstructionForCreditorAgent 4//value TELB/PHOB PhoneBeneficiary
  instrForCdtrAgtInf: string; //InstructionForCreditorAgent 140
  instrForNxtAgt1: string; //InstructionForNextAgent Max35
  instrForNxtAgt2: string; //InstructionForNextAgent Max35
  instrForNxtAgt3: string; //InstructionForNextAgent Max35
  instrForNxtAgt4: string; //InstructionForNextAgent Max35
  instrForNxtAgt5: string; //InstructionForNextAgent Max35
  instrForNxtAgt6: string; //InstructionForNextAgent Max35
  purpCD: string; //Purpose ExternalPurpose1Code max 4
  purpPrtry: string; //Purpose ExternalPurpose1Code max 35
  rmtInf: string; //RemittanceInformation Max140 [0-9a-zA-Z/\-\?:\(\)\.,'\+ !#$%&\*=^_`\{\|\}~";<>@\[\\\]]+
  auth1stBy: string;
  makeDt: Date;
  auth1stDt: Date;
  auth2ndBy: string;
  auth2ndDt: Date;
  lastAction: string;
  branchId: string;
  trnRefNo20: string;
  relatedRef21: string;
  rltd: RelatedModel; //InstructedAgent
}
