import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, switchMap } from "rxjs";
import { CurrencyModel } from "../../shared/models/currency.model";
import {OfficeType} from '../model/OfficeType';
import {environment} from '../../../environments/environment';
@Injectable({
  providedIn: 'root'   // <-- makes the service available app-wide
})
export class CommonService {
  constructor(private http: HttpClient) { }


  getEntityTypeList(request: any): Observable<any> {
    const url = `http://192.168.20.93:8099/api/xchange-out/get-office-entity-type-list`;
    return this.http.post<any>(url, request);
  }
  getEntityInfo(pOfficeId: any): Observable<any> {
    console.log(pOfficeId);
    const body = { pOfficeId };
    const url = `${environment.apiBaseUrl}/centrino/xchange_out/get-office-entity`;
    return this.http.post(`${environment.apiBaseUrl}/centrino/xchange_out/get-office-entity`,
      { pOfficeId },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        },
        responseType: 'text' // <-- treat as plain text
      })
  }
  getExchangeRateList(entityType: any): Observable<any> {
    const body = {
      pNameValueList: 0,
      pExchgRateId: null,
      pEntityTypeId: entityType
    };

    const url = `${environment.apiBaseUrl}/centrino/xchange_out/fx-rate-amt-category-ga`;
    return this.http.post<any>(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    });
  }
  getOwnOfficeList(pCompanyId: string): Observable<any> {
    const body = { pCompanyId };
    const url = `${environment.apiBaseUrl}/centrino/xchange_out/get-comp-office-list-exc`;
    return this.http.post<any>(url, body);
  }


  getAllOfficeType(): Observable<OfficeType[]> {
    const body = {
      pProcessId: 0
    };

    const url = `${environment.apiBaseUrl}/centrino/xchange_out/get-all-office-type`;
    return this.http.post<any>(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    });
  }


}
