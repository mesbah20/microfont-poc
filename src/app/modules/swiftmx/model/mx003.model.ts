export interface Mx003 {
    // Business Application Header V02
    BizMsgIdr?: string; // BusinessMessageIdentifier max 35
    MsgDefIdr?: string; // MessageDefinitionIdentifier example - camt.001.001.03
    BizSvc?: string; // BusinessService The value "swift.cbprplus.02" must be used.
    CreDt?: string;
    ReqdColltnDt?: Date; // RequestedCollectionDate Mandatory

    // Header block
    cpyDplct?: string; // values can be only - CODU,COPY,DUPL
    PsblDplct?: string; // PossibleDuplicate Values Can only be - YES/NO
    Priority?: string; // Header block Priority values can only be - HIGH,NORM
    MsgId?: string; // MessageIdentification //0-9 a-z A-Z / - ? : ( ) . , ' +
    CreDtTm?: string; // CreationDateTime
    NbOfTxs?: string; // Number of transactions
    SttlmMtd?: string; // SettlementMethod value - COVE,INDA,INGA
    SttlmAcct?: Account; // SettlementMethod

    // PaymentIdentification Tag
    // Assigned by Instructing party to Instructed party to identify the msg uniquely
    // can never have starting or ending / and never have '//'
    InstrId?: string; // InstructionIdentification Max 16 pattern 0-9 a-z A-Z - ? : ( ) . , ' +
    EndToEndId?: string; // EndToEndIdentification max 35
    TxId?: string; // TransactionIdentification max 35 Mandatory
    // If the pacs.009 is used to settle a pacs.009 Advice, the UETR should transport
    // the UETR of the underlying pacs.009 Advice
    UETR?: string; // Mandatory
    ClrSysRef?: string; // ClearingSystemReference max 35 pattern [0-9a-zA-Z/\-\?:\(\)\.,'\+ ]+

    // PaymentTypeInformation
    InstrPrty?: string; // InstructionPriority value can be HIGH/NORM
    ClrChanl?: string; // ClearingChannel values can be BOOK/MPNS/RTGS/RTNS
    SvcLvlCD?: string[]; // Service Level Code array
    SvcLvlPrtry?: string[]; // Service Level Proprietary array
    LclInstrmCD?: string; // LocalInstrument
    LclInstrmPrtry?: string; // LocalInstrument Proprietary
    CtgyPurpCd?: string; // CategoryPurpose Code
    CtgyPurpPrtry?: string; // CategoryPurpose

    // Settlement Information
    IntrBkSttlmAmtCcy?: string; // InterbankSettlementAmount max 3 char
    IntrBkSttlmAmt?: number; // InterbankSettlementAmount size 14,5
    IntrBkSttlmDt?: string; // InterbankSettlementDate
    SttlmPrty?: string; // SettlementPriority values HIGH/NORM/URGT

    // Previous Instructing Agents
    PrvsInstgAgt1?: Agent; // PreviousInstructingAgent1
    PrvsInstgAgt1Acct?: Account; // PreviousInstructingAgent1Account
    PrvsInstgAgt2?: Agent; // PreviousInstructingAgent2
    PrvsInstgAgt2Acct?: Account; // PreviousInstructingAgent2Account
    PrvsInstgAgt3?: Agent; // PreviousInstructingAgent3
    PrvsInstgAgt3Acct?: Account; // PreviousInstructingAgent3Account

    // Agents
    InstgAgt?: Agent; // InstructingAgent
    InstdAgt?: Agent; // InstructedAgent

    // Intermediary Agents
    IntrmyAgt1?: Agent; // IntermediaryAgent1
    IntrmyAgt1Acct?: Account; // IntermediaryAgent1Account
    IntrmyAgt2?: Agent; // IntermediaryAgent2
    IntrmyAgt2Acct?: Account; // IntermediaryAgent2Account
    IntrmyAgt3?: Agent; // IntermediaryAgent3
    IntrmyAgt3Acct?: Account; // IntermediaryAgent3Account

    // Parties
    Dbtr?: Party; // Debtor
    DbtrAcct?: Account; // DebtorAccount
    DbtrAgt?: Agent; // DebtorAgent
    DbtrAgtAcct?: Account; // DebtorAgentAccount
    CdtrAgt?: Agent; // CreditorAgent
    CdtrAgtAcct?: Account; // CreditorAgentAccount
    Cdtr?: Party; // Creditor
    CdtrAcct?: Account; // CreditorAccount

    // Instructions
    InstrForCdtrAgtCD?: string; // InstructionForCreditorAgent 4//value TELB/PHOB PhoneBeneficiary
    InstrForCdtrAgtInf?: string; // InstructionForCreditorAgent 140
    InstrForNxtAgt1?: string; // InstructionForNextAgent Max35
    InstrForNxtAgt2?: string; // InstructionForNextAgent Max35
    InstrForNxtAgt3?: string; // InstructionForNextAgent Max35
    InstrForNxtAgt4?: string; // InstructionForNextAgent Max35
    InstrForNxtAgt5?: string; // InstructionForNextAgent Max35
    InstrForNxtAgt6?: string; // InstructionForNextAgent Max35

    // Purpose and Remittance
    PurpCD?: string; // Purpose ExternalPurpose1Code max 4
    PurpPrtry?: string; // Purpose ExternalPurpose1Code max 35
    RmtInf?: string; // RemittanceInformation Max140 [0-9a-zA-Z/\-\?:\(\)\.,'\+ !#$%&\*=^_`\{\|\}~";<>@\[\\\]]+

    // Authorization and Audit
    auth1stBy?: string;
    makeDt?: Date;
    auth1stDt?: Date;
    auth2ndBy?: string;
    auth2ndDt?: Date;
    lastAction?: string;
    branchId?: string;
    trnRefNo20?: string;
    relatedRef21?: string;

    // Related and Ultimate Parties
    Rltd?: Related; // Related
    UltmtCdtr?: Party; // UltimateCreditor
    UltmtDbtr?: Party; // UltimateDebtor
    InitgPty?: Party; // InitiatingParty

    // Charges
    ChrgBr?: string; // ChargeBearer Mandatory values CRED/DEBT/SHAR/SLEV
    ChrgsInfAgnt?: Agent[]; // Charges Information Agents
    ChgCcy?: string[]; // Charge Currency array
    ChgAmt?: number[]; // Charge Amount array
}

export interface Account {
    iban?: string; // MAX 30
    id?: string; // OTHER/ID MAX 34
    schmeNmCd?: string; // OTHER/SchemeName CODE MAX 4 ExternalAccountIdentification1Code
    schmeNmPrtry?: string; // OTHER/SchemeName PRIORITY
    issr?: string; // OTHER/Issuer MAX 35
    tpCd?: string; // Type/CD
    tpPrtry?: string; // TYPE/PRIORITY
    ccy?: string; // Currency MAX 3
    nm?: string; // Name 70 PTRN [0-9a-zA-Z/\-\?:\(\)\.,'\+ ]+
    prxyTpCd?: string; // Proxy
    prxyTpPrtry?: string; // Proxy
    prxyId?: string; // PROXY ID MAX 320
}

export interface Address {
    // [0-9a-zA-Z/\-\?:\(\)\.,'\+ !#$%&\*=^_`\{\|\}~";<>@\[\\\]]+
    dept?: string; // Department 70
    subDept?: string; // SubDepartment 70
    strtNm?: string; // StreetName 70
    bldgNb?: string; // BuildingNumber 16
    bldgNm?: string; // BuildingName 35
    flr?: string; // Floor
    pstBx?: string; // PostBox 16
    room?: string; // Room 70
    pstCd?: string; // PostCode 16
    twnNm?: string; // TownName 35
    twnLctnNm?: string; // TownLocationName35
    dstrctNm?: string; // DistrictName35
    ctrySubDvsn?: string; // CountrySubDivision35
    ctry?: string; // Country
    adrLine?: string[]; // Address line array of 3
}

export interface Agent {
    bIcfi?: string; // BICFI max 12
    clrSysIdCd?: string; // ClearingSystemIdentification Code ExternalClearingSystemIdentification1Code
    mmbId?: string; // MemberIdentification max 28 [0-9a-zA-Z/\-\?:\(\)\.,'\+ ]+
    lei?: string; // LEI Max 20 [A-Z0-9]{18,18}[0-9]{2,2}
    nm?: string; // Name of the agent max 140
    adrLine1?: string; // AddressLine max 35 [0-9a-zA-Z/\-\?:\(\)\.,'\+ !#$%&\*=^_`\{\|\}~";<>@\[\\\]]+
    adrLine2?: string; // AddressLine max 35 [0-9a-zA-Z/\-\?:\(\)\.,'\+ !#$%&\*=^_`\{\|\}~";<>@\[\\\]]+
    adrLine3?: string; // AddressLine max 35 [0-9a-zA-Z/\-\?:\(\)\.,'\+ !#$%&\*=^_`\{\|\}~";<>@\[\\\]]+
    adr?: Address; // Address object
}

export interface Party {
    Nm?: string; // Party or Customer Name Max 140 [0-9a-zA-Z/\-\?:\(\)\.,'\+ !#$%&\*=^_`\{\|\}~";<>@\[\\\]]+
    Address?: Address; // Address
    CtryOfRes?: string; // CountryOfResidence

    // Organisation Identification
    OrgIdBic?: string; // OrganisationIdentification Any Bic 12
    OrgIdLEI?: string; // OrganisationIdentification LEI 20
    OrgIdOthrID?: string; // OrganisationIdentification Other id 35
    OrgIdOthrScNmCD?: string; // OrganisationIdentification other scheme name code 4
    OrgIdOthrIssr?: string; // OrganisationIdentification other Issuer 35

    // Private Identification
    BirthDt?: string; // PrivateIdentification
    PrvcOfBirth?: string; // PrivateIdentification ProvinceOfBirth35
    CityOfBirth?: string; // PrivateIdentification CityOfBirth 35
    CtryOfBirth?: string; // PrivateIdentification CtryOfBirth 2

    // Private Other Identification 1
    PrvtOthId1?: string; // PrivateIdentification 35
    PrvtOthIdSchNmCD1?: string; // PrivateIdentification Scheme name code
    PrvtOthIdIssr1?: string; // PrivateIdentification issuer 35

    // Private Other Identification 2
    PrvtOthId2?: string; // PrivateIdentification 35
    PrvtOthIdSchNmCD2?: string; // PrivateIdentification Scheme name code
    PrvtOthIdIssr2?: string; // PrivateIdentification issuer 35
}

export interface Related {
    charSet?: string; // CharacterSet
    fr?: Agent; // From Agent
    to?: Agent; // To Agent
    bizMsgIdr?: string; // BusinessMessageIdentifier 35
    msgDefIdr?: string; // MessageDefinitionIdentifier EXAMPLE PACS.009.01.08
    bizSvc?: string; // BusinessService 35
    creDt?: string; // CreationDate
    cpyDplct?: string; // CopyDuplicate VALUES CODU/COPY/DUPL
    prty?: string; // Priority
}

export interface SingleFileContent {
    xmlContent?: string;
    fileName?: string;
    extension?: string;
}
