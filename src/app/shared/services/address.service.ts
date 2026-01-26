import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AddressDto, AddressSearchResponse } from '../models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl + '/address';

  // Mock demo data for testing
  private mockAddresses: AddressDto[] = [
    {
      id: 'addr_001',
      areaName: 'Mirpur',
      thana: 'Mirpur',
      postOffice: 'Mirpur',
      district: 'Dhaka',
      postalCode: '1216',
      fullAddress: 'Mirpur, Dhaka 1216'
    },
    {
      id: 'addr_002',
      areaName: 'Dhanmondi',
      thana: 'Dhanmondi',
      postOffice: 'Dhanmondi',
      district: 'Dhaka',
      postalCode: '1212',
      fullAddress: 'Dhanmondi, Dhaka 1212'
    },
    {
      id: 'addr_003',
      areaName: 'Gulshan',
      thana: 'Gulshan',
      postOffice: 'Gulshan',
      district: 'Dhaka',
      postalCode: '1212',
      fullAddress: 'Gulshan, Dhaka 1212'
    },
    {
      id: 'addr_004',
      areaName: 'Banani',
      thana: 'Banani',
      postOffice: 'Banani',
      district: 'Dhaka',
      postalCode: '1213',
      fullAddress: 'Banani, Dhaka 1213'
    },
    {
      id: 'addr_005',
      areaName: 'Cantonment',
      thana: 'Cantonment',
      postOffice: 'Cantonment',
      district: 'Dhaka',
      postalCode: '1213',
      fullAddress: 'Cantonment, Dhaka 1213'
    },
    {
      id: 'addr_006',
      areaName: 'Uttara',
      thana: 'Uttara',
      postOffice: 'Uttara',
      district: 'Dhaka',
      postalCode: '1230',
      fullAddress: 'Uttara, Dhaka 1230'
    },
    {
      id: 'addr_007',
      areaName: 'Motijheel',
      thana: 'Motijheel',
      postOffice: 'Motijheel',
      district: 'Dhaka',
      postalCode: '1213',
      fullAddress: 'Motijheel, Dhaka 1213'
    },
    {
      id: 'addr_008',
      areaName: 'Kawran Bazar',
      thana: 'Kawran Bazar',
      postOffice: 'Kawran Bazar',
      district: 'Dhaka',
      postalCode: '1215',
      fullAddress: 'Kawran Bazar, Dhaka 1215'
    },
    {
      id: 'addr_009',
      areaName: 'Farmgate',
      thana: 'Farmgate',
      postOffice: 'Farmgate',
      district: 'Dhaka',
      postalCode: '1215',
      fullAddress: 'Farmgate, Dhaka 1215'
    },
    {
      id: 'addr_010',
      areaName: 'Bashundhara',
      thana: 'Bashundhara',
      postOffice: 'Bashundhara',
      district: 'Dhaka',
      postalCode: '1229',
      fullAddress: 'Bashundhara, Dhaka 1229'
    },
    {
      id: 'addr_011',
      areaName: 'Mohakhali',
      thana: 'Mohakhali',
      postOffice: 'Mohakhali',
      district: 'Dhaka',
      postalCode: '1206',
      fullAddress: 'Mohakhali, Dhaka 1206'
    },
    {
      id: 'addr_012',
      areaName: 'Shantinagar',
      thana: 'Shantinagar',
      postOffice: 'Shantinagar',
      district: 'Dhaka',
      postalCode: '1217',
      fullAddress: 'Shantinagar, Dhaka 1217'
    }
  ];

  searchAddress(query: string): Observable<AddressSearchResponse> {
    // Demo mode: return mock data filtered by query
    const filtered = this.mockAddresses.filter(addr =>
      addr.areaName.toLowerCase().includes(query.toLowerCase()) ||
      addr.thana.toLowerCase().includes(query.toLowerCase()) ||
      addr.postOffice.toLowerCase().includes(query.toLowerCase()) ||
      addr.district.toLowerCase().includes(query.toLowerCase())
    );

    return of({
      data: filtered,
      total: filtered.length
    });

    /* For real API, uncomment this:
    const params = new HttpParams()
      .set('query', query)
      .set('limit', '10');

    return this.http.get<AddressSearchResponse>(`${this.baseUrl}/search`, { params });
    */
  }
}
