import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountInfoResponse, AccountSearchRequest } from '../models/GlTransactionModel';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GlMasterAccountService {
  constructor(private http: HttpClient) { }

  fetchAccounts(req: AccountSearchRequest): Observable<AccountInfoResponse[]> {
      return this.http.post<AccountInfoResponse[]>(`${environment.apiBaseUrl}/GLAccount/GetGLMasterAccountInfo`,
        req,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
          }
        });
    }
}
