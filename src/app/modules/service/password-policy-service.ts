import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {UserCredentialsPolicyModel} from '../model/UserCredentialsPolicy.model';
import {UserProfileModel} from '../model/UserProfile.model';

@Injectable({
  providedIn: 'root'
})
export class PasswordPolicyService {

  constructor(private http: HttpClient) { }

  getPasswordPolicy(): Observable<UserCredentialsPolicyModel[]> {
    return this.http.get<UserCredentialsPolicyModel[]>(`${environment.sentinelUrl}/credential-policy/getUserCredPolicy`);
  }
  updatePasswordPolicy(request: UserCredentialsPolicyModel): Observable<any> {
    return this.http.put<any>(
      `${environment.sentinelUrl}/credential-policy/updateUserCredPolicy`,
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
