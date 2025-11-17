import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../environments/environment';
import {AuthService} from './core/auth/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  // Apply token to all API requests (except keycloak auth endpoints)
  const shouldAddToken = 
    req.url.startsWith(environment.reportManagementApiUrl) ||
    req.url.startsWith(environment.reportGenerationApiUrl) ||
    req.url.startsWith(environment.apiBaseUrl) ||
    req.url.startsWith(environment.centrinoBaseUrl) ||
    req.url.startsWith(environment.rbacEndPoint) ||
    req.url.startsWith(environment.configurationEndPoint) ||
    req.url.startsWith(environment.hrmEndPoint) ||
    req.url.startsWith(environment.portalEndPoint) ||
    req.url.startsWith(environment.vehicleEndPoint) ||
    req.url.startsWith(environment.leaveAttendanceEndPoint);

  if (shouldAddToken && token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
