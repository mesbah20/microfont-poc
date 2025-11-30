
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { GLStatusRequestModel } from "./gl-status-request-model";
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { GetGLAccountChartInfoRequest, GlChartAccountInfoResponse } from "./gl-chart-info-request-model";

@Injectable({
  providedIn: 'root'
})
export class FinbookService {

    constructor(private http: HttpClient){}

    validateGlAccount(request: GLStatusRequestModel): Observable<number> {
        return this.http.post<number>(`${environment.apiBaseUrl}/finbook/v1/GLChart/gl-status`, request);
    }

    
  getGLAccountChartInfo(request: GetGLAccountChartInfoRequest): Observable<GlChartAccountInfoResponse[]> {
    return this.http.post<GlChartAccountInfoResponse[]>(
      `${environment.apiBaseUrl}/finbook/v1/GLLedgerFetch/GetGLAccountChartInfo`, request, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    });
  }
}