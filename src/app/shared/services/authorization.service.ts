import { Injectable } from '@angular/core';
import { ApiService } from '../../core/service/api.service';
import { Observable } from 'rxjs';
import { AUTHORIZATION_LOG } from '../constant/api.constant';
import { GetUnauthorizedMessagesRequest, ProcessAuthorizationRequest } from '../models/swift-authorization-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService extends ApiService<any> {
  constructor() {
    super(AUTHORIZATION_LOG);
  }

  /**
   * Get unauthorized messages by message type
   * @param msgType - Message type (e.g., 'PACS009')
   * @returns Observable of unauthorized messages
   */
  getUnauthorizedMessages(request: GetUnauthorizedMessagesRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}get-unauthorized-msg`, request);
  }

  /**
   * @returns Observable of authorization result
   */
  processAuthorization(request: ProcessAuthorizationRequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}process-authorization`, request);
  }

} 