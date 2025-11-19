import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  GetGLAccountChartInfoRequest, GlChartAccountInfoResponse, GLTxnRequest, GlResponse,
  AccountSearchRequest, AccountInfoResponse
} from '../models/GlTransactionModel';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlService {

  constructor(private http: HttpClient) { }

  getGLAccountChartInfo(request: GetGLAccountChartInfoRequest): Observable<GlChartAccountInfoResponse[]> {
    return this.http.post<GlChartAccountInfoResponse[]>(
      `${environment.apiBaseUrl}/GLLedgerFetch/GetGLAccountChartInfo`, request, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    });
  }

  createGlTransaction(requestList: GLTxnRequest[]): Observable<GlResponse> {
    console.log("Transaction Make request :", requestList)
    return this.http.post<GlResponse>(
      `${environment.apiBaseUrl}/Transaction/CreateGlTransaction`,
      requestList,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*'
        }
      }
    );
  }


}
