import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class GlChartService {

  constructor(private http: HttpClient) {

  }

  getGLChartAccounts(request: any): Observable<any> {
    const url = `${environment.apiBaseUrl}/finbook/v1/GLChart/GetGLchartAccountList`;
    return this.http.post<any>(url, request);
  }

  createGLAccount(account: any): Observable<any> {
    const url = `${environment.apiBaseUrl}/finbook/v1/GLChart/CreateGLAccountChart`;
    return this.http.post(url, account);
  }

  updateGLAccount(account: any): Observable<any> {
    const url = `${environment.apiBaseUrl}/finbook/v1/GLChart/UpdateGLAccountChart`;
    return this.http.post(url, account);
  }

}
