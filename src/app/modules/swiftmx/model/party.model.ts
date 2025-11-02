import {AddressModel} from './address.model';

export  interface  PartyModel {
  nm: string;                          // Name, max 140, allowed chars defined externally
  address: AddressModel;                   // Address object
  ctryOfRes: string;                  // Country of Residence (2-letter ISO code)

  // Organisation Identification
  orgIdBic: string;                   // BIC (max 12)
  orgIdLEI: string;                   // LEI (Legal Entity Identifier, max 20)


  orgOtherList?:any;
  orgIdOthrId: string;                // Other ID (max 35)
  orgIdOthrScNmCd: string;           // Scheme Name Code (max 4)
  orgIdOthrScNmPrty: string;           // Scheme Name Prty (max 4)
  orgIdOthrIssr: string;             // Other Issuer (max 35)

  // Private Identification
  birthDt: string;                    // Birth Date (ISO format string)
  prvcOfBirth: string;                // Province of Birth (max 35)
  cityOfBirth: string;                // City of Birth (max 35)
  ctryOfBirth: string;                // Country of Birth (2-letter code)

  prvtOthId1: string;                 // Other Private ID 1 (max 35)
  prvtOthIdSchNmCd1: string;          // Scheme Name Code for ID 1
  prvtOthIdSchNmPrtry1: string;
  prvtOthIdIssr1: string;             // Issuer for ID 1 (max 35)

  prvtOthId2: string;                 // Other Private ID 2 (max 35)
  prvtOthIdSchNmCd2: string;          // Scheme Name Code for ID 2
  prvtOthIdIssr2: string;             // Issuer for ID 2 (max 35)

}
