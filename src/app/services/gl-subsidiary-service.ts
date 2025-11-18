import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { GetGlSubsidiaryAccountListRequest, GLSubAccountInfoRequest, GLSubsidiaryModel } from '../models/GLSubsidiary';
import { GLStatusRequest } from '../models/GLAccount';
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class GlSubsidiaryService {

  constructor(private http: HttpClient) { }


  createGlSubsidiary(
    payload: GLSubsidiaryModel
  ): Observable<any> {

    console.log("payload in service : ", payload);
    return this.http.post(
      `${environment.apiBaseUrl}/GLSubsidiary/CreateGLAccountSubsidiary`,
      payload
    );
  }

  validateGlAccount(request: GLStatusRequest): Observable<number> {
    return this.http.post<number>(`${environment.apiBaseUrl}/GLLedgerFetch/gl-status`, request);
  }

  getGLSubsidiaryAccountInfo(req: GLSubAccountInfoRequest): Observable<any> {
    const url = `${environment.apiBaseUrl}/GLSubsidiary/GetGLSubsidiaryAccountInfo`;
    return this.http.post(url, req);
  }


  getGLSubsidiaryAccountInfoList(req: GetGlSubsidiaryAccountListRequest): Observable<GLSubsidiaryModel[]> {
    const url = `${environment.apiBaseUrl}/GLSubsidiary/GetGLSubsidiaryAccountList`;
    return this.http.post<GLSubsidiaryModel[]>(url, req);
  }

}


