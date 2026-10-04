import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './core/services/authentication.service';

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