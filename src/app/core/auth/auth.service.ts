import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import {environment} from '../../../environments/environment';
import {AuthUtils} from './auth.utils';
import {User} from '../user/user.types';
import {UserService} from '../user/user.service';
import {tap} from 'rxjs';
import {UserDataResponse} from '../../modules/model/UserDataResponse';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authenticated: boolean = false;
  private _keycloak: Keycloak | undefined;
  private http: HttpClient= inject(HttpClient);
  private _userService = inject(UserService);
  private _token: string = '';
  get token(): string {
    return this._token;
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  get keycloak(): Keycloak {
    if (!this._keycloak) {
      this._keycloak = new Keycloak({
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      });
    }
    return this._keycloak;
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  async init(): Promise<boolean> {
    this._authenticated = await this.keycloak.init({
      onLoad: 'check-sso',
      // onLoad: 'login-required',
      redirectUri: 'http://localhost:4901/landing/home',
      //silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      pkceMethod: 'S256',
      checkLoginIframe: true,
      checkLoginIframeInterval: 5
    });
    if (this._authenticated) {
      this._token = this.keycloak.token || '';
      this.decodeToken();
    }
    // 🔔 Listen for global logout
    this.keycloak.onAuthLogout = () => {
      console.log('Detected logout from another client');
      this.login();
    };
    // this.keycloak.onTokenExpired = () => {
    //   this.keycloak.updateToken(30).then(refreshed => {
    //     if (refreshed) {
    //       console.log("Token refreshed");
    //       this._token = this.keycloak.token || '';
    //     }
    //   });
    // };

    return this._authenticated;
  }

  login(): void {
    this.keycloak.login({
      redirectUri: 'http://localhost:4901' + '/landing/home'
    });
  }

  logout(): void {
    this.keycloak.logout({redirectUri: 'http://localhost:4000/login'});
    localStorage.clear();
    sessionStorage.clear();
  }

  decodeToken(): void {
    sessionStorage.setItem('access_token', this.keycloak.token || '')
    this.userInfo(this.keycloak.token || '');
  }

  userInfo(token: string){
    const decodeToken = AuthUtils._decodeToken(this.keycloak.token || '');
    if(!decodeToken)
      return;
    let user = {} as User;
    user.name = decodeToken.name;
    user.email = decodeToken.email;
    user.realmAccess = decodeToken.realm_access;
    user.resourceAccess = decodeToken.resource_access;
    user.officeId = decodeToken.officeId;
    user.orgId = decodeToken.orgId;
    user.employeeId = decodeToken.employeeId;
    user.username = decodeToken.preferred_username;
    user.clickStreamTrack = decodeToken.clickStreamTrack;
    user.userTerminalIP = decodeToken.userTerminalIP;
    this._userService.user = user;
    if(user.officeId){this.getSessionData(user.officeId);}
  }

  getSessionData(officeId:string){
    this.http.get(`${environment.sessionUrl}/${officeId}`).subscribe({
      next: (officeData: any) => {
        console.log("officeData...", officeData);
        // Store office data in sessionStorage
        sessionStorage.setItem('companyId', officeData.companyId);
        sessionStorage.setItem('companyName', officeData.companyName);
        sessionStorage.setItem('officeId', officeData.officeId);
        sessionStorage.setItem('officeCode', officeData.officeCode);
        sessionStorage.setItem('officeNm', officeData.officeNm);
        sessionStorage.setItem('entityTypeId', officeData.entityTypeId);
        sessionStorage.setItem('officeTypeId', officeData.officeTypeId);
        sessionStorage.setItem('officeControlId', officeData.officeControlId);
        sessionStorage.setItem('txnDt', officeData.txnDt);
        sessionStorage.setItem('operationMode', officeData.operationMode);
        sessionStorage.setItem('operationModeFunction', officeData.operationModeFunction);
        sessionStorage.setItem('instituteType', officeData.instituteType);
        sessionStorage.setItem('localCurrencyId', officeData.localCurrencyId);
        sessionStorage.setItem('custProdIdLen', officeData.custProdIdLen);
        sessionStorage.setItem('custAccountNoLen', officeData.custAccountNoLen);
        sessionStorage.setItem('accountNoPtrnFlag', officeData.accountNoPtrnFlag);
        sessionStorage.setItem('errorCode', officeData.errorCode);
        sessionStorage.setItem('errorMessage', officeData.errorMessage);
      },
      error: (err) => {
        console.error('Error loading office session:', err);
      }
    });
  }

  // loadUserDataResponse(): void {
  //   const sentinelSession = environment.sentinelSessionUrl;
  //   const centrinoSession = environment.centrinoSessionUrl;
  //   const params = {
  //     userId: localStorage.getItem('userId'),
  //     appId: 901
  //   };

  //   this.isLoading = true;

  //   this.http.get<UserDataResponse>(sentinelSession, { params: params as any }).subscribe({
  //     next: (response) => {
  //       // Store user profile
  //       if (response.userProfile) {
  //         localStorage.setItem('userProfile', JSON.stringify(response.userProfile));

  //         // Call officeSessionApiUrl API only if homeOfficeId exists
  //         const homeOfficeId = response.userProfile.homeOfficeId;
  //         if (homeOfficeId) {

  //           this.http.get(`${centrinoSession}/${homeOfficeId}`).subscribe({
  //             next: (officeData: any) => {
  //               console.log("officeData...", officeData);
  //               // Store office data in sessionStorage
  //               sessionStorage.setItem('companyId', officeData.companyId);
  //               sessionStorage.setItem('companyName', officeData.companyName);
  //               sessionStorage.setItem('officeId', officeData.officeId);
  //               sessionStorage.setItem('officeCode', officeData.officeCode);
  //               sessionStorage.setItem('officeNm', officeData.officeNm);
  //               sessionStorage.setItem('entityTypeId', officeData.entityTypeId);
  //               sessionStorage.setItem('officeTypeId', officeData.officeTypeId);
  //               sessionStorage.setItem('officeControlId', officeData.officeControlId);
  //               sessionStorage.setItem('txnDt', officeData.txnDt);
  //               sessionStorage.setItem('operationMode', officeData.operationMode);
  //               sessionStorage.setItem('operationModeFunction', officeData.operationModeFunction);
  //               sessionStorage.setItem('instituteType', officeData.instituteType);
  //               sessionStorage.setItem('localCurrencyId', officeData.localCurrencyId);
  //               sessionStorage.setItem('custProdIdLen', officeData.custProdIdLen);
  //               sessionStorage.setItem('custAccountNoLen', officeData.custAccountNoLen);
  //               sessionStorage.setItem('accountNoPtrnFlag', officeData.accountNoPtrnFlag);
  //               sessionStorage.setItem('errorCode', officeData.errorCode);
  //               sessionStorage.setItem('errorMessage', officeData.errorMessage);
  //             },
  //             error: (err) => {
  //               console.error('Error loading office session:', err);
  //             }
  //           });
  //         }
  //       }

  //       // Store user access list
  //       if (response.userAccessList) {
  //         this.userAccessList = response.userAccessList;
  //         localStorage.setItem('userAccessList', JSON.stringify(response.userAccessList));
  //       }

  //       // Store app access list if needed
  //       if (response.appAccessList) {
  //         localStorage.setItem('appAccessList', JSON.stringify(response.appAccessList));
  //       }

  //       console.log('User data loaded:', response);
  //       console.log("homeOfficeId...", response.userProfile.homeOfficeId);
  //       this.isLoading = false;
  //     },
  //     error: (err) => {
  //       console.error('Error loading user data:', err);
  //       this.error = 'Failed to load user data';
  //       this.isLoading = false;
  //     }
  //   });
  // }


  getResources(){
    const params = new HttpParams({
      fromObject: { appId: environment.appId }
    });
    let url = environment.bffUrl + 'resource-manager/api/v1/resource/accessible-resource/app'
    return this.http.get<any>(url, {params});
  }

  getUserWiseApplications(){
    let url = environment.bffUrl + 'resource-manager/api/v1/resource/applications'
    return this.http.get<any>(url);
  }

  getAllApplications(){
    const params = new HttpParams({
      fromObject: { appId: environment.appId }
    });
    let url = environment.bffUrl + 'resource-manager/api/v1/resource/applications-generic'
    return this.http.get<any>(url, {params});
  }

}
