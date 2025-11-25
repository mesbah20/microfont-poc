import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {UserProfileModel} from '../model/UserProfile.model';
import {UserGrantRole} from '../model/UserRoles.model';

@Injectable({
  providedIn: 'root'
})
export class AssignRolesToUserService {

  constructor(private http: HttpClient) { }

  getAssignedUserRoles(userId: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/sentinel/api/user-role/get-assigned-user-roles/${userId}`;
    return this.http.get<any>(url);
  }
  getUnassignedUserRoles(userId: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/sentinel/api/user-role/get-unassigned-user-roles/${userId}`;
    return this.http.get<any>(url);
  }
  assignRolesToUser(request: UserGrantRole[]): Observable<UserGrantRole[]> {
    return this.http.post<UserGrantRole[]>(
      `${environment.apiBaseUrl}/sentinel/api/user-role/create`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*'
        }
      }
    );
  }

  removeRolesFromUser(request: UserGrantRole[]): Observable<UserGrantRole[]> {
    return this.http.post<UserGrantRole[]>(
      `${environment.apiBaseUrl}/sentinel/api/user-role/remove`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*'
        }
      }
    );
  }

}
