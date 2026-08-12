import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthenticationService } from './core/services/authentication.service';

/**
 * Attaches the demo-faithful JWT bearer to every outbound request that
 * targets one of our configured API roots. Mirrors demo's
 * `JwtInterceptor` which reads from `localStorage.currentUser.access_token`.
 *
 * Falls back to `AuthService` (sentinel) for the legacy sentinel API so the
 * two coexisting auth systems don't break each other.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthenticationService);
  const token = auth.getToken();

  // APIs where token must be added
  const shouldAttachToken =
    req.url.startsWith(environment.apiBaseUrl) ||
    req.url.startsWith(environment.sentinelUrl) ||
    req.url.startsWith(environment.bffUrl);

  if (shouldAttachToken && token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  // Default: no token added
  return next(req);
};

