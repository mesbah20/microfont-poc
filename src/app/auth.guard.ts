import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './core/services/authentication.service';

/**
 * Demo-faithful access guard:
 *
 * 1. If the user has no active session (no JWT in sessionStorage and no
 *    cached user in localStorage), bounce them to `/login` and remember the
 *    attempted URL so login can return them where they were.
 * 2. (Disabled — the demo does not enforce per-route role lists client
 *    side; that decision lives server-side. Kept here as commented-out
 *    scaffolding in case product wants to add it later.)
 */
@Injectable({ providedIn: 'root' })
export class AccessGuard implements CanActivate {
  private readonly auth = inject(AuthenticationService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    // Not signed in — record where they wanted to go and redirect.
    try {
      sessionStorage.setItem('returnUrl', state.url);
    } catch {
      // ignore storage errors
    }
    this.router.navigate(['/login']);
    return false;
  }
}