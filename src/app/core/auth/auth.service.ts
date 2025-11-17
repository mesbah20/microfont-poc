import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import {environment} from '../../../environments/environment';
import {AuthUtils} from './auth.utils';
import {User} from '../user/user.types';
import {UserService} from '../user/user.service';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private _authenticated: boolean = false;
  private _keycloak: Keycloak | undefined;
  private http: HttpClient= inject(HttpClient);
  private _userService = inject(UserService);
  private _token: string = '';
  user!: User;
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
      //redirectUri: 'http://localhost:4200/login',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
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
      redirectUri: 'http://localhost:4200' + '/landing/home'
    });
  }


  logout(): void {
    this.keycloak.logout({
      redirectUri: 'http://localhost:4000'
    });
  }

  decodeToken(): void {
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
    console.log("USER INFO", user);
    //console.log("this.keycloak.token", this.keycloak.token);
  }
}
