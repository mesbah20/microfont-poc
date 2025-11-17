import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {UserProfileModel} from '../model/UserProfile.model';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private baseUrl = 'http://192.168.20.93:8084/api/user-profile';
  //private centrinoXchangeUrl = 'http://192.168.20.93:8097/api/xchange-out';

  constructor(private http: HttpClient) { }

  getUserProfileById(userId: string): Observable<any> {
    return this.http.get<any>(`${environment.sentinelUrl}/user-profile/getUserByUserId/${userId}`);
  }

  getAllOffice(request: any): Observable<any> {
    const url = `${environment.centrinoXchangeUrl}/get-all-office-info-exc`;
    return this.http.post<any>(url, request);
  }
  getAllUser(officeId: number): Observable<any> {
    const url = `${environment.sentinelUrl}/api/user-profile/get-all-user-profile/${officeId}`;
    return this.http.get<any>(url);
  }
  getAllPackage(): Observable<any> {
    const url = `${environment.sentinelUrl}/api/package/get-all`;
    return this.http.get<any>(url);
  }
  saveUserProfile(request: UserProfileModel): Observable<UserProfileModel> {
    return this.http.post<UserProfileModel>(
      `${environment.sentinelUrl}/api/user-profile/create`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*'
        }
      }
    );
  }
  getFunctionsByRoleName(roleName:any): Observable<any> {
    const url = `${environment.sentinelUrl}/api/roles/functionsByRoleName?roleName=${roleName}`;
    return this.http.get<any>(url);
  }
}
