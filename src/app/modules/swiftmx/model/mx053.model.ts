import {MessageRecipientModel} from './message-recipient.model';

export interface Mx053Model{
  bizMsgIdr: string;              // BusinessMessageIdentifier max 35
  msgDefIdr: string;              // MessageDefinitionIdentifier e.g., camt.001.001.03
  bizSvc: string;                 // BusinessService, must be "swift.cbprplus.02"
  creDt: string;                  // Date string (ISO format preferred)
  cpyDplct: 'CODU' | 'COPY' | 'DUPL'; // Only allowed values
  psblDplct: 'YES' | 'NO';        // PossibleDuplicate
  priority: 'HIGH' | 'NORM';      // Header block priority

  //group header
  msgId: string;                  // MessageIdentification (validated externally)
  creDtTm: string;                // CreationDateTime as string (ISO)
  msgRcpt: MessageRecipientModel;
  orgnlBizQry: string;
  addtlInf: string;
}
