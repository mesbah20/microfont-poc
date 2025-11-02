import {PartyModel} from './party.model';
import {AgentModel} from './agent.model';
import {RelatedModel} from './related.model';

export interface Mx002Model {
  
  bizMsgIdr: string;              // BusinessMessageIdentifier max 35
  msgDefIdr: string;              // MessageDefinitionIdentifier e.g., camt.001.001.03
  bizSvc: string;                 // BusinessService, must be "swift.cbprplus.02"
  creDt: string;                  // Date string (ISO format preferred)
  cpyDplct: 'CODU' | 'COPY' | 'DUPL'; // Only allowed values
  psblDplct: 'YES' | 'NO';        // PossibleDuplicate
  priority: 'HIGH' | 'NORM';      // Header block priority
  msgId: string;                  // MessageIdentification (validated externally)
  creDtTm: string;                // CreationDateTime as string (ISO)
  orgnlMsgId: string;             // OriginalMessageIdentification max 35
  orgnlMsgNmId: string;           // e.g., pacs.003.001.01 or MT103
  orgnlCreDtTm: string;           // OriginalCreationDateTime (ISO date string)
  orgnlInstrId: string;           // OriginalInstructionIdentification (max 16)
  orgnlEndToEndId: string;        // OriginalEndToEndIdentification
  orgnlTxId: string;              // OriginalTransactionIdentification max 35
  orgnlUetr: string;              // UUID string max 35
  txSts: string;                  // ExternalPaymentTransactionStatus1Code (enum if known)

  // Status Reason Information block StsRsnInf
  orgtr: PartyModel;                   // Originator (custom type)
  rsnCd: string;                  // Reason CODE
  rsnPrtry: string;               // Reason Proprietary
  addtlInf1: string;              // AdditionalInformation max 105
  addtlInf2: string;              // AdditionalInformation max 105

  // END
  fctvIntrBkSttlmDt: string;      // EffectiveInterbankSettlementDate
  clrSysRef: string;              // ClearingSystemReference
  instgAgt: AgentModel;                // InstructingAgent (custom type)
  instdAgt: AgentModel;                // InstructedAgent (custom type)
  rltd: RelatedModel;                  // Related info
}
