export interface AddressModel {
  dept: string;             // Department (max 70)
  subDept: string;          // SubDepartment (max 70)
  strtNm: string;           // StreetName (max 70)
  bldgNb: string;           // BuildingNumber (max 16)
  bldgNm: string;           // BuildingName (max 35)
  flr: string;              // Floor
  pstBx: string;            // PostBox (max 16)
  room: string;             // Room (max 70)
  pstCd: string;            // PostCode (max 16)
  twnNm: string;            // TownName (max 35)
  twnLctnNm: string;        // TownLocationName (max 35)
  dstrctNm: string;         // DistrictName (max 35)
  ctrySubDvsn: string;      // CountrySubDivision (max 35)
  ctry: string;             // Country (ISO code, e.g. "BD")
  adrLine: string[];        // Address lines (max 3 lines, each possibly 70 characters)

}
