import {HttpClient, HttpParams} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {inject, Injectable} from '@angular/core';
import {AuthUtils} from './auth.utils';
import {User} from '../user/user.types';
import {UserService} from '../user/user.service';
import {environment} from '../../../environments/environment';

@Injectable({providedIn: 'root'})
export class AuthService {
  private _authenticated: boolean = false;
  private _user: User | null = null;
  private http: HttpClient = inject(HttpClient);
  private _userService = inject(UserService);
  private _token: string = '';

  get token(): string {
    return this._token;
  }

  get authenticated(): boolean {
    return this._authenticated;
  }

  get currentUserValue(): User | null {
    return this._user;
  }

  currentUser$ = new (class {
    private listeners: ((u: User | null) => void)[] = [];
    subscribe(fn: (u: User | null) => void) {
      this.listeners.push(fn);
      fn(this._value);
      return {
        unsubscribe: () => {
          this.listeners = this.listeners.filter((l) => l !== fn);
        },
      };
    }
    next(v: User | null) {
      this._value = v;
      this.listeners.forEach((l) => l(v));
    }
    private _value: User | null = null;
  })();

  async init(): Promise<boolean> {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      this._token = token;
      this._authenticated = true;
      this.decodeToken();
    }
    return this._authenticated;
  }

  login(): void {
    window.location.href = '/login';
  }

  loginWithCredentials(username: string, password: string): Promise<boolean> {
    const url = `${environment.sentinelUrl}/user-login/signIn`;
    const body = {userId: username, password};
    return new Promise((resolve) => {
      this.http.post<any>(url, body).subscribe({
        next: (res) => {
          if (res && res.token) {
            this._token = res.token;
            sessionStorage.setItem('access_token', res.token);
            this._authenticated = true;
            this.decodeToken();
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: () => resolve(false),
      });
    });
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
    this._authenticated = false;
    this._token = '';
    this._user = null;
    this.currentUser$.next(null);
    window.location.href = '/login';
  }

  decodeToken(): void {
    const token = this._token;
    sessionStorage.setItem('access_token', token);
    this.userInfo(token);
  }

  userInfo(token: string) {
    const decodeToken = AuthUtils._decodeToken(token);
    if (!decodeToken) return;
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
    this._user = user;
    this.currentUser$.next(user);
    this._userService.user = user;
    if (user.officeId) {
      this.getSessionData(user.officeId);
    }
  }

  getSessionData(officeId: string) {
    this.http.get(`${environment.centrinoUrl}/office-session/getOfficeSession/${officeId}`).subscribe({
      next: (officeData: any) => {
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
      },
      error: (err) => console.error('Error loading office session:', err),
    });
  }

  private getUserId(): string {
    const token = this._token;
    if (!token) return '';
    const decoded = AuthUtils._decodeToken(token);
    return decoded?.preferred_username || '';
  }

  getResources() {
    const userId = this.getUserId();
    const params = new HttpParams({fromObject: {userId, appId: environment.appId}});
    const url = environment.sentinelUrl + '/resource-access/retrieveList';
    return this.http.get<any>(url, {params}).pipe(
      map((res: any) => {
        const transformed = (res.resourceUserList || []).map((item: any) => ({
          attributes: {
            functionId: item.functionId,
            functionName: item.functionNm,
            moduleId: item.moduleId,
            moduleName: item.moduleNm,
            functionType: item.functionType,
            quickRoute: item.quickRouteNo,
          },
          uris: item.appRoute,
          routePath: item.routePath,
          createFlag: item.createFlag,
          updateFlag: item.updateFlag,
          deleteFlag: item.deleteFlag,
          readFlag: item.readFlag,
        }));
        return transformed;
      }),
    );
  }

  getUserWiseApplications() {
    const userId = this.getUserId();
    const params = new HttpParams({fromObject: {userId}});
    const url = environment.sentinelUrl + '/user-access/getAppsByUserId';
    return this.http.get<any>(url, {params}).pipe(
      map((res: any) => {
        return (res.apps || []).map((app: any) => ({
          appId: app.appId,
          appName: app.appName,
          appUri: app.appUri || '',
        }));
      }),
    );
  }

  getAllApplications() {
    const params = new HttpParams({fromObject: {appId: environment.appId}});
    const url = environment.bffUrl + '/applications-generic';
    return this.http.get<any>(url, {params});
  }
}
