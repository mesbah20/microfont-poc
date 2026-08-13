import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { RootResponse } from '../models/root-response.model';
import { BrandingService } from './branding.service';

export interface Notification {
  notificationId: string;
  title: string;
  message: string;
  createdOn: string;
  isRead: boolean;
  redirect?: { url: string };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private branding = inject(BrandingService);

  $refreshNotifications: Subject<boolean> = new Subject<boolean>();

  private get rootUrl(): string {
    return this.branding.rootUrl();
  }

  getAllNotifications(): Observable<RootResponse<Notification[]>> {
    return this.http.get<RootResponse<Notification[]>>(
      `${this.rootUrl}/api/Notification/GetAllNotifications`,
    );
  }

  updateNotificationAsRead(notificationID: string): Observable<any> {
    const params = new HttpParams().set('notificationID', notificationID);
    return this.http.get<any>(
      `${this.rootUrl}/api/Notification/UpdateNotificationAsRead`,
      { params },
    );
  }

  refresh(): void {
    this.$refreshNotifications.next(true);
  }
}
