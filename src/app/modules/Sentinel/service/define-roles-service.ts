import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {AppFunctionsRequest, DefineUserRole, UserGrantRole, UserRoleFunctionModel, UserRolesModel} from '../model/UserRoles.model';


@Injectable({
  providedIn: 'root'
})
export class DefineRolesService {

  constructor(private http: HttpClient) { }
  getRoleInfoByRoleName(roleName: string): Observable<any> {
    const url = `${environment.apiBaseUrl}/sentinel/api/roles/roleByRoleName/${roleName}`;
    return this.http.get<any>(url);
  }
  getAllRoles(): Observable<any> {
    const url = `${environment.apiBaseUrl}/sentinel/api/roles/get-all`;
    return this.http.get<any>(url);
  }

  getFilteredFunction(request:AppFunctionsRequest): Observable<any> {
    const url = `${environment.apiBaseUrl}/sentinel/api/app-functions/getFilteredFunctions`;
    return this.http.post<any>(url, request, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*'
      }
    });
  }
  saveUserRoles(request: any): Observable<any> {
    return this.http.post<any>(
      `${environment.apiBaseUrl}/sentinel/api/roles/create`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*'
        }
      }
    );
  }

  removeRoleFunctions(request: UserRoleFunctionModel[]): Observable<UserRoleFunctionModel[]> {
    return this.http.post<UserRoleFunctionModel[]>(
      `${environment.apiBaseUrl}/sentinel/api/user-role-functions/remove`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*'
        }
      }
    );
  }

  getDept(): Observable<any> {
    const url = `${environment.apiBaseUrl}`;
    return this.http.get<any>(url);
  }

}
