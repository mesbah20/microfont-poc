import {AgentModel} from './agent.model';
export  interface  RelatedModel {
    charSet: string;                 // CharacterSet
    fr: AgentModel;                       // From Agent (OriginalEndToEndIdentification)
    to: AgentModel;                       // To Agent (OriginalEndToEndIdentification)
    bizMsgIdr: string;              // BusinessMessageIdentifier (max 35)
    msgDefIdr: string;              // MessageDefinitionIdentifier (e.g., PACS.009.01.08)
    bizSvc: string;                 // BusinessService (max 35)
    creDt: string;                  // CreationDate (ISO format recommended)
    cpyDplct: 'CODU' | 'COPY' | 'DUPL'; // CopyDuplicate values
    prty: 'HIGH' | 'NORM';          // Priority values (if known constraints apply)
  }
