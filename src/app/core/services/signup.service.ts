import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootResponse } from '../models/root-response.model';
import { ISignup } from '../models/signup.model';
import { BrandingService } from './branding.service';

@Injectable({ providedIn: 'root' })
export class SignupService {
  private http = inject(HttpClient);
  private branding = inject(BrandingService);

  private get rootUrl(): string {
    return this.branding.rootUrl();
  }

  private jsonHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  }

  signupIndividual(payload: ISignup): Observable<RootResponse<any>> {
    return this.http.post<RootResponse<any>>(
      `${this.rootUrl}/api/SignupRequest/Signup`,
      payload,
      this.jsonHeaders(),
    );
  }

  signupProprietorship(payload: ISignup): Observable<RootResponse<any>> {
    return this.http.post<RootResponse<any>>(
      `${this.rootUrl}/api/SignupRequest/ProprietorshipSignupRequest`,
      payload,
      this.jsonHeaders(),
    );
  }
}
