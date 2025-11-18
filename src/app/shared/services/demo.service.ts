import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable()
export class DemoService {
  private baseUrl = environment.novu?.notificationApiBaseUrl ?? '';

  constructor(private http: HttpClient) {}

  saveData(payload: any): Observable<any> {
    if (!this.baseUrl) {
      throw new Error('DemoService base URL is not configured.');
    }
    return this.http.post(`${this.baseUrl}/save`, payload);
  }
}
