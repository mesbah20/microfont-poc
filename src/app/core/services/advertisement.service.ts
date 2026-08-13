import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootResponse } from '../models/root-response.model';
import { BrandingService } from './branding.service';

/**
 * Demo-faithful AdvertisementService.
 * Mirrors demo's `services/advertisement.service.ts`:
 *   GET {rootUrl}/api/BankAccount/GetAdvertisementList?channelName=IBU
 * Returns RootResponse<string[]> where each string is a raw base64 image payload
 * (consumer should prefix with `data:image/jpg;base64,` before binding to <img src>).
 *
 * The carousel/marquee is a background UI call — it must NOT trigger the
 * global page loader, so we set `X-Skip-Loader: true` like other demo-style
 * dropdown services (address, branchInfo, app-settings) do.
 */
@Injectable({ providedIn: 'root' })
export class AdvertisementService {
  private http = inject(HttpClient);
  private branding = inject(BrandingService);

  private get rootUrl(): string {
    return this.branding.rootUrl();
  }

  getAdvertisementList(channelName: string = 'IBU'): Observable<RootResponse<string[]>> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Skip-Loader': 'true',
    });
    const params = new HttpParams().set('channelName', channelName);
    return this.http.get<RootResponse<string[]>>(
      `${this.rootUrl}/api/BankAccount/GetAdvertisementList`,
      { headers, params },
    );
  }
}