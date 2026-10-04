import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RootResponse } from '../models/root-response.model';
import { User, IsValidUserID } from '../models/user.model';
import { Router } from '@angular/router';
import { BrandingService } from './branding.service';
import { CacheService } from './cache.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private branding = inject(BrandingService);
  private cache = inject(CacheService);

  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  private merchantUserSubject: BehaviorSubject<User | null>;
  public merchantUser: Observable<User | null>;

  constructor() {
    const stored = typeof localStorage !== 'undefined'
      ? JSON.parse(localStorage.getItem('currentUser') || 'null')
      : null;
    // If we have a cached user but the session token was cleared (e.g. tab
    // restart), drop the stale user so guards force a fresh login.
    if (stored && typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('access_token')) {
      localStorage.removeItem('currentUser');
      this.currentUserSubject = new BehaviorSubject<User | null>(null);
    } else {
      this.currentUserSubject = new BehaviorSubject<User | null>(stored);
    }
    this.currentUser = this.currentUserSubject.asObservable();
    this.merchantUserSubject = new BehaviorSubject<User | null>(null);
    this.merchantUser = this.merchantUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public get merchantUserValue(): User | null {
    return this.merchantUserSubject.value;
  }

  login(
    username: string,
    password: string,
    imeiOrIP: string,
    otp: string = '',
    tpin: string = '',
    isMerchant: boolean = false,
  ): Observable<RootResponse<User>> {
    return this.http
      .post<RootResponse<User>>(
        `${this.branding.rootUrl()}/api/Login/Login`,
        { username, password, imeiOrIP, otp, tpin },
        httpOptions,
      )
      .pipe(
        map((user) => {
          if (!isMerchant) {
            localStorage.setItem('currentUser', JSON.stringify(user.Result));
            // Persist the bearer token so HTTP interceptors can attach it to
            // every subsequent API call. Demo uses sessionStorage; we mirror
            // that so closing the tab forces re-login (matches the demo's
            // "Valid Token Required" semantics).
            if (user.Result?.access_token) {
              sessionStorage.setItem('access_token', user.Result.access_token);
            }
            this.currentUserSubject.next(user.Result);
          } else {
            this.merchantUserSubject.next(user.Result);
            if (user.Result?.access_token) {
              sessionStorage.setItem('merchant_access_token', user.Result.access_token);
            }
          }
          return user;
        }),
      );
  }

  isValidUserID(UserID: string): Observable<IsValidUserID> {
    const reqHeader = new HttpHeaders({ 'Content-Type': 'application/json' });
    const httpParams = new HttpParams().set('UserID', UserID);
    return this.http.get<IsValidUserID>(
      `${this.branding.rootUrl()}/api/Login/isValidUserID`,
      { headers: reqHeader, params: httpParams },
    );
  }

  logout(): void {
    this.http
      .get(`${this.branding.rootUrl()}/api/SignoutRequest/SignOut`, {})
      .subscribe({ error: () => undefined });
    localStorage.removeItem('currentUser');
    try {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('merchant_access_token');
      sessionStorage.clear();
      localStorage.clear();
    } catch {
      // ignore storage errors during SSR/test
    }
    // Drop every cached API response so the next session can't see stale data.
    this.cache.removeAll();
    this.router.navigate(['/login']);
    this.currentUserSubject.next(null);
    this.merchantUserSubject.next(null);
  }

  /**
   * Demo-faithful helper: returns the JWT bearer token for the active
   * session (or merchant session). HTTP interceptors call this to attach
   * `Authorization: Bearer …` to outbound requests.
   */
  public getToken(isMerchant: boolean = false): string | null {
    try {
      const key = isMerchant ? 'merchant_access_token' : 'access_token';
      const token = sessionStorage.getItem(key);
      if (token) return token;
      // Fallback: pull the token from the cached user if sessionStorage was
      // cleared mid-session (e.g. SSR rehydration edge cases).
      const cached = (isMerchant ? this.merchantUserValue : this.currentUserValue) as any;
      return cached?.access_token ?? null;
    } catch {
      return null;
    }
  }

  /** Demo-style convenience: was this user signed in at app boot? */
  public isLoggedIn(): boolean {
    return !!this.currentUserValue && !!this.getToken();
  }

  public persistSession(user: User | null | undefined): void {
    if (!user) return;
    localStorage.setItem('currentUser', JSON.stringify(user));
    if ((user as any)?.access_token) {
      sessionStorage.setItem('access_token', (user as any).access_token);
    }
    this.currentUserSubject.next(user);
  }
}
