import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SubsidiaryAccountRequest } from '../subsidiary-account-request-model';
import { GetGlSubsidiaryAccountListRequest, GLSubsidiaryModel } from './gl-subsidiary-model';


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
        `${environment.apiBaseUrl}/finbook/v1/GLSubsidiary/CreateGLAccountSubsidiary`,
        payload
      );
    }

  

    getGLSubsidiaryAccountInfo(req: SubsidiaryAccountRequest): Observable<any> {
      const url = `${environment.apiBaseUrl}/finbook/v1/GLSubsidiary/GetGLSubsidiaryAccountInfo`;
      return this.http.post(url, req);
    }


    getGLSubsidiaryAccountInfoList(req: GetGlSubsidiaryAccountListRequest): Observable<GLSubsidiaryModel[]> {
      const url = `${environment.apiBaseUrl}/finbook/v1/GLSubsidiary/GetGLSubsidiaryAccountList`;
      return this.http.post<GLSubsidiaryModel[]>(url, req);
    }
}