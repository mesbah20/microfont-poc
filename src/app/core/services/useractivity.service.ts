import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootResponse } from '../models/root-response.model';
import { ITopActivityResponse } from '../models/user-activity.model';
import { BrandingService } from './branding.service';

/**
 * User-activity service — demo-faithful port of UBL's `UseractivityService`.
 *
 * Endpoints:
 *   GET /api/ActivityLog/GetTopActivityLog?count=N       → top-N shortcuts for dashboard
 *   GET /api/ActivityLog/GetRecentActivityLog?count=N    → most-recent activities
 *   POST /api/ActivityLog/AddNewActivity                 → log a new activity from anywhere
 */
@Injectable({ providedIn: 'root' })
export class UserActivityService {
  private http = inject(HttpClient);
  private branding = inject(BrandingService);

  private get rootUrl(): string {
    return this.branding.rootUrl();
  }

  getTopActivity(count: number): Observable<RootResponse<ITopActivityResponse[]>> {
    const params = new HttpParams().set('count', String(count));
    return this.http.get<RootResponse<ITopActivityResponse[]>>(
      `${this.rootUrl}/api/ActivityLog/GetTopActivityLog`,
      { params },
    );
  }

  getRecentActivityLog(count: number): Observable<RootResponse<any[]>> {
    const params = new HttpParams().set('count', String(count));
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/ActivityLog/GetRecentActivityLog`,
      { params },
    );
  }

  addNewActivity(payload: {
    title: string;
    transferType?: string;
    url?: string;
    shTitle?: string;
  }): Observable<RootResponse<any>> {
    return this.http.post<RootResponse<any>>(
      `${this.rootUrl}/api/ActivityLog/AddNewActivity`,
      payload,
      { headers: { 'Content-Type': 'application/json' } },
    );
  }
}