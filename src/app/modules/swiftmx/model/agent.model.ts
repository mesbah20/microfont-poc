import {AddressModel} from './address.model';


export interface AgentModel {
  bicfi: string;              // BICFI (max 12)
  clrSysIdCd: string;         // ClearingSystemIdentification Code (ExternalClearingSystemIdentification1Code)
  mmbId: string;              // MemberIdentification (max 28)
  lei: string;                // LEI (Legal Entity Identifier, max 20, regex: [A-Z0-9]{18}[0-9]{2})
  nm: string;                 // Name of the agent (max 140)
  adrLine1: string;           // AddressLine 1 (max 35)
  adrLine2: string;           // AddressLine 2 (max 35)
  adrLine3: string;           // AddressLine 3 (max 35)
  adr: AddressModel;               // Address object
}
