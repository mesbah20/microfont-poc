import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../environments/environment';
import { AuthService } from './core/auth/auth.service';
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  // APIs where token must be added
  const shouldAttachToken =
    req.url.startsWith(environment.apiBaseUrl) ||
    req.url.startsWith(environment.sentinelUrl) ||
    req.url.startsWith(environment.bffUrl);

  if (shouldAttachToken && token) {
    // console.log('🔐 Attaching token to:', req.url);
    // console.log('🔐 token:', token);

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

