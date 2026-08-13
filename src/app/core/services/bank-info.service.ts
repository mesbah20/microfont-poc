import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootResponse } from '../models/root-response.model';
import { IBankContact } from '../models/ibankcontact.model';
import { BrandingService } from './branding.service';

@Injectable({ providedIn: 'root' })
export class BankInfoService {
  private http = inject(HttpClient);
  private branding = inject(BrandingService);

  private get rootUrl(): string {
    return this.branding.rootUrl();
  }

  getbankContactInfo(): Observable<RootResponse<IBankContact[]>> {
    return this.http.get<RootResponse<IBankContact[]>>(
      `${this.rootUrl}/api/BankInfo/About`,
    );
  }

  getCreditCardOtherBankList(value: string): Observable<RootResponse<any[]>> {
    const params = new HttpParams().set('value', value);
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankInfo/CreditCardBankInfo`,
      { params },
    );
  }
}
