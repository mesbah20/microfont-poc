export interface Mx029Model {
    bizMsgIdr: string; //BusinessMessageIdentifier max 35
    msgDefIdr: string; //MessageDefinitionIdentifier example - camt.001.001.03
    bizSvc: string; //BusinessService The value "swift.cbprplus.02" must be used.
    creDt: string;
    cpyDplct: string;  // values can be only - CODU,COPY,DUPL
    psblDplct: string;  //PossibleDuplicate Values Can only  be - YES/NO
    priority: string; // Header block Priority values can only be - HIGH,NORM

    //Resolution Of Investigation V09
    //Assignment 
    assgnmtId: string; //AssignmentIdentification Max 16 pattern 0-9 a-z A-Z - ? : ( ) . , ' +
    assgnerBic: string; //AssignedByBIC max 12
    assgneeBic: string; //AssignedByBIC max 12
    assgnmtDtTm: string; //AssignmentDate

    //Status - Sts
    confSts: string; //ConfirmationStatus Values can be - Cancelled - CNCL, Pending - PDCR, Rejected - RJCR
    
    //Status block children (Or group - only one can be present)
    conf: string; //Confirmation - mandatory if chosen
    rjctdMod: string[]; //RejectedModification - mandatory one or more if chosen
    dplctOf: string; //DuplicateOf - mandatory if chosen
    assgnmtCxlConf: string; //AssignmentCancellationConfirmation - mandatory if chosen
    
    //CancellationDetails
    cxIdtls: CancellationDetails[];
    
    //TransactionInformationAndStatus
    txInfAndSts: TransactionInformationAndStatus[];
    
    //ModificationDetails
    modDtls: ModificationDetails;
}

//CancellationDetails interface
export interface CancellationDetails {
    orgnlGrpInfAndSts: string; //OriginalGroupInformationAndStatus - optional
    orgnlPmtInfAndSts: string[]; //OriginalPaymentInformationAndStatus - optional, zero or more
}

//TransactionInformationAndStatus interface
export interface TransactionInformationAndStatus {
    cxlStsId: string; //CancellationStatusIdentification - optional, max 16 chars, pattern 0-9 a-z A-Z / - ? : ( ) . , ' +
    rslvdCase: ResolvedCase; //ResolvedCase - optional
    orgnlGrpInf: OriginalGroupInformation; //OriginalGroupInformation - optional
    orgnlInstrId: string; //OriginalInstructionIdentification - optional, max 16 chars, pattern 0-9 a-z A-Z / - ? : ( ) . , ' +
    orgnlEndToEndId: string; //OriginalEndToEndIdentification - optional, max 35 chars
    orgnlTxId: string; //OriginalTransactionIdentification - optional, max 35 chars
    orgnlClrSysRef: string; //OriginalClearingSystemReference - optional, max 35 chars
    orgnlUETR: string; //OriginalUETR - mandatory, UUIDv4 format
    cxlStsRsnInf: CancellationStatusReasonInformation[]; //CancellationStatusReasonInformation - optional, zero or more
}

//ResolvedCase interface
export interface ResolvedCase {
    id: string; //Identification - mandatory
    cretr: string; //Creator - mandatory
    reopCaseIndctn: string; //ReopenCaseIndication - optional (marked as removed)
}

//OriginalGroupInformation interface
export interface OriginalGroupInformation {
    orgnlMsgId: string; //OriginalMessageIdentification - mandatory
    orgnlMsgNmId: string; //OriginalMessageNameIdentification - mandatory
    orgnlCreDtTm: string; //OriginalCreationDateTime - optional
}

//ModificationDetails interface
export interface ModificationDetails {
    modStsId: string; //ModificationStatusIdentification - optional
}

//CancellationStatusReasonInformation interface
export interface CancellationStatusReasonInformation {
    orgtr: Originator; //Originator - optional
    rsn: Reason; //Reason - optional
    addtlInf: string[]; //AdditionalInformation - optional, zero or more, max 105 chars
}

//Originator interface
export interface Originator {
    nm: string; //Name - optional
    pstlAdr: string; //PostalAddress - optional
    id: string; //Identification - optional
    ctryOfRes: string; //CountryOfResidence - optional
    //ContactDetails excluded as it's marked as removed
}

//Reason interface
export interface Reason {
    cd: string; //Code - mandatory if chosen
    //Proprietary excluded as it's marked as removed
}