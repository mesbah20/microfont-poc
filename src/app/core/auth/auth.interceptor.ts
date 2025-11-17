import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { AUTH_SERVICE_REDIRECT_URI } from '../../../environments/environment';

/**
 * Intercept
 *
 * @param req
 * @param next
 */
export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
    // Clone the request object
    let newReq = req.clone();

    // Request
    //
    // If the access token didn't expire, add the Authorization header.
    // We won't add the Authorization header if the access token expired.
    // This will force the server to return a "401 Unauthorized" response
    // for the protected API routes which our response interceptor will
    // catch and delete the access token from the local storage while logging
    // the user out from the app.
  newReq = req.clone({
    headers: req.headers
      .set('Authorization', 'Bearer ' + sessionStorage.getItem('access_token'))
      .set('branchId',  '1')
  });

    // Response
    return next(newReq).pipe(
        catchError((error) => {
            // Catch "401 Unauthorized" responses
            // if (error instanceof HttpErrorResponse && error.status === 401) {
            //     // Sign out
            //     authService.signOut();
            //     setTimeout(() => {
            //         window.location.href = AUTH_SERVICE_REDIRECT_URI + 'sign-out';
            //     }, 600);
            //     // Reload the app
            //     // location.reload();
            // }

            return throwError(error);
        })
    );
};
