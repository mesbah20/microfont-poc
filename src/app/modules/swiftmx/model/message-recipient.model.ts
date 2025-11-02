import {PostalAddressModel} from './postal-address.model';

export interface MessageRecipientModel {
  nm: string;
  pstlAdr: PostalAddressModel;
  id: string;
  ctryOfRes: string;
  ctctDtls: string;

}
