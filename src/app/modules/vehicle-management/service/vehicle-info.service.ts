import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { BaseApiService } from '../../../core/utils/service/base-api.service';
import { CommonResponseList } from '../../../core/utils/model/common-response';
import { ApiResponse, Page, VehicleInfo as VehicleInfoModel } from '../model/vehicle-info.model';


@Injectable({
  providedIn: 'root'
})
export class VehicleInfoService extends BaseApiService<VehicleInfoModel> {

  constructor(private http: HttpClient) {
    super(http, environment.vehicleEndPoint + 'vehicle-info');
  }

  checkUnique(field: string, value: string): Observable<any> {
    return this.http.get(`${this._BASE_URL}/check-unique?field=${field}&value=${encodeURIComponent(value)}`);
  }

  updateDetails(payload: { id: number, details: any[] }): Observable<any> {
    return this.http.put(`${this._BASE_URL}/details`, payload);
  }

  getAvailableVehicle() {
    return this.httpClient.get<CommonResponseList<VehicleInfoModel>>(this._BASE_URL + '/availableVehicles');
  }
  getAvailableVehicleForUpdate(id: number) {
    return this.httpClient.get<CommonResponseList<VehicleInfoModel>>(`${this._BASE_URL}/availableVehiclesForUpdate/${id}`);
  }

  updateVehicleStatus(id: number, availability: string): Observable<any> {
    return this.http.put<any>(`${this._BASE_URL}/${id}/status`, { availability });
  }

  getUnassignedVehicles(): Observable<any> {
    return this.http.get<any>(`${this._BASE_URL}/unassigned`);
  }

  searchVehicles(formValue: any, pageIndex: number, pageSize: number): Observable<ApiResponse<Page<VehicleInfoModel>>> {

    let params: any = {
      pageIndex,
      pageSize
    };

    if (formValue.vehicleName) {
      params.vehicleName = formValue.vehicleName.trim();
    }
    if (formValue.registrationNumber) {
      params.registrationNumber = formValue.registrationNumber.trim();
    }
    if (formValue.noOfSeats) {
      params.noOfSeats = Number(formValue.noOfSeats);
    }

    const httpParams = new HttpParams({ fromObject: params });
    return this.http.get<ApiResponse<Page<VehicleInfoModel>>>(`${this._BASE_URL}/search`, { params: httpParams });
  }


}
