export interface AddressDto {
  id?: string;
  areaName: string;
  thana: string;
  postOffice: string;
  district: string;
  postalCode?: string;
  fullAddress?: string;
}

export interface AddressSearchResponse {
  data: AddressDto[];
  total: number;
}
