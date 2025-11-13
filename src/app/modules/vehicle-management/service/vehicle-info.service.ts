import { Injectable } from '@angular/core';
// import { ApiResponse, Page, VehicleInfo } from '../model/vehicle-info.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleInfoService  {
 
  constructor(private http: HttpClient) {
   
  }

  // checkUnique(field: string, value: string): Observable<any> {
  //   return this.http.get(`${this._BASE_URL}/check-unique?field=${field}&value=${encodeURIComponent(value)}`);
  // }

  // updateDetails(payload: { id: number, details: any[] }): Observable<any> {
  //   return this.http.put(`${this._BASE_URL}/details`, payload);
  // }

  // getAvailableVehicle() {
  //   return this.httpClient.get<CommonResponseList<VehicleInfo>>(this._BASE_URL + '/availableVehicles');
  // }
  // getAvailableVehicleForUpdate(id: number) {
  //   return this.httpClient.get<CommonResponseList<VehicleInfo>>(`${this._BASE_URL}/availableVehiclesForUpdate/${id}`);
  // }

  // updateVehicleStatus(id: number, availability: string): Observable<any> {
  //   return this.http.put<any>(`${this._BASE_URL}/${id}/status`, { availability });
  // }

  // getUnassignedVehicles(): Observable<any> {
  //   return this.http.get<any>(`${this._BASE_URL}/unassigned`);
  // }

  // searchVehicles(formValue: any, pageIndex: number, pageSize: number): Observable<ApiResponse<Page<VehicleInfo>>> {

  //   let params: any = {
  //     pageIndex,
  //     pageSize
  //   };

  //   if (formValue.vehicleName) {
  //     params.vehicleName = formValue.vehicleName.trim();
  //   }
  //   if (formValue.registrationNumber) {
  //     params.registrationNumber = formValue.registrationNumber.trim();
  //   }
  //   if (formValue.noOfSeats) {
  //     params.noOfSeats = Number(formValue.noOfSeats);
  //   }

  //   const httpParams = new HttpParams({ fromObject: params });
  //   return this.http.get<ApiResponse<Page<VehicleInfo>>>(`${this._BASE_URL}/search`, { params: httpParams });
  // }

}

