import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../environments/environment';
import {AuthService} from './core/auth/auth.service';
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  console.log("token",token);
  if (req.url.startsWith(environment.keycloakApi) || req.url.startsWith(environment.centrinoBaseUrl)
    || req.url.startsWith(environment.sentinelUrl)|| req.url.startsWith(environment.centrinoXchangeUrl)) {
    if (token) {

      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  return next(req);
};

