import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootResponse } from '../models/root-response.model';
import { IAppSettings } from '../models/appsettings.model';
import { BrandingService } from './branding.service';

@Injectable({ providedIn: 'root' })
export class VerificationService {
  private http = inject(HttpClient);
  private branding = inject(BrandingService);

  private get rootUrl(): string {
    return this.branding.rootUrl();
  }

  getAppSettingsByKey(key: string): Observable<IAppSettings> {
    const params = new HttpParams().set('Key', key);
    // App-settings lookup is a background UI call — must NOT show the global loader.
    return this.http.get<IAppSettings>(
      `${this.rootUrl}/api/AppConfigs/getAppSettingsbykey`,
      {
        params,
        headers: new HttpHeaders({ 'X-Skip-Loader': 'true' }),
      },
    );
  }

  verifyMobile(
    verificationCode: string,
    mobileNumber: string,
    branchID: string,
    accountNumber: string,
  ): Observable<RootResponse<any>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams()
      .set('verificationCode', verificationCode)
      .set('mobileNumber', mobileNumber)
      .set('branchID', branchID)
      .set('accountNumber', accountNumber);
    return this.http.post<RootResponse<any>>(
      `${this.rootUrl}/api/Verification/MobileVerification`,
      {},
      { headers, params },
    );
  }

  verifyEmail(
    verificationCode: string,
    emailAddress: string,
    branchID: string,
    accountNumber: string,
  ): Observable<RootResponse<any>> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const params = new HttpParams()
      .set('verificationCode', verificationCode)
      .set('emailAddress', emailAddress)
      .set('branchID', branchID)
      .set('accountNumber', accountNumber);
    return this.http.post<RootResponse<any>>(
      `${this.rootUrl}/api/Verification/EmailVerification`,
      {},
      { headers, params },
    );
  }
}
