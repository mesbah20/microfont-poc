import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RouteInfo } from '../model/router-info.model';
import { BaseApiService } from '../../../core/utils/service/base-api.service';
import { environment } from '../../../../environments/environment';
import { CommonResponseObject } from '../../../core/utils/model/common-response';



@Injectable({
  providedIn: 'root'
})

export class RouteInfoService extends BaseApiService<RouteInfo> {

  constructor(private http: HttpClient) {
      super(http, environment.vehicleEndPoint + 'route-info');
  }
    getVehiclesForRoute(): Observable<any> {
        return this.httpClient.get<CommonResponseObject<any>>(
            environment.vehicleEndPoint + 'vehicle-info/vehicles-for-route'
        );
    }
    // API to check vehicle availability
    checkVehicleAvailability(vehicleId: number, startTime: string, endTime: string): Observable<any> {
        return this.httpClient.get<CommonResponseObject<any>>(
            this._BASE_URL + '/check-availability', {
                params: {
                    vehicleId: vehicleId.toString(),
                    startTime,
                    endTime
                }
            }
        )
    };

    bulkSave(payload: any): Observable<CommonResponseObject<any>> {
        return this.httpClient.post<CommonResponseObject<any>>(this._BASE_URL + '/save', payload);
    }

    /** Get route names, optionally with searchTerm */
    getRouteNameList(searchTerm?: string): Observable<any> {
        let params = new HttpParams();
        if (searchTerm) {
            params = params.set('routeName', searchTerm);
        }

        return this.httpClient.get<CommonResponseObject<any>>(
            this._BASE_URL + '/routeName-list', { params }
        );
    }

    getRouteInfo(pageIndex: number, pageSize: number, routeName?: string): Observable<any> {
        let params = new HttpParams()
            .set('pageIndex', pageIndex)
            .set('pageSize', pageSize);
        if (routeName) params = params.set('routeName', routeName);

        return this.http.get<any>(`${this._BASE_URL}/route-list`, { params });
    }
    // Get route info by uuid
    getRouteInfoDetailsByUuid(uuid: string): Observable<any> {
        return this.http.get(`${this._BASE_URL}/getRouteInfoDetails/${uuid}`);
    }
    // route-info.service.ts
    checkAssigned(payload: any) {
        return this.httpClient.post<boolean>(this._BASE_URL + '/check-assigned', payload)
    }
    updateRouteInfo(payload: any) {
        return this.httpClient.put<CommonResponseObject<any>>(this._BASE_URL + '/update', payload);
    }

}
