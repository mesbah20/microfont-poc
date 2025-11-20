import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class KeyclockService {
  private _keycloak: Keycloak | undefined;
  private _authenticated = false;
  private http: HttpClient= inject(HttpClient);

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


    // 🔔 Listen for global logout

    this.keycloak.onAuthLogout = () => {
      console.log('Detected logout from another client');
      this.login();
    };


    return this._authenticated;
  }

  login(): void {
    this.keycloak.login({
      redirectUri: 'http://localhost:4901' + '/landing/home'
    });
  }


  logout(): void {
    this.keycloak.logout({
      redirectUri: 'http://localhost:4000'
    });
  }

  getToken(): string {
    return this.keycloak.token || '';
  }

  // getAccessibleResources(): Observable<any> {
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${this.getToken()}`, // pass Keycloak token
  //     'x-client-id': '2' // city bank client id
  //   });
  //
  //   return this.http.get('http://localhost:8086/test/accessible-resource', { headers });
  // }
}
