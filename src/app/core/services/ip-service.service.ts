import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BrandingService } from './branding.service';

@Injectable({ providedIn: 'root' })
export class IpServiceService {
  private http = inject(HttpClient);
  private branding = inject(BrandingService);

  getIPAddress(): Observable<any> {
    return this.http.get<any>(this.branding.userIpUrl());
  }
}
