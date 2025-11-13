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
      .set('Authorization', 'Bearer ' + 'eyJraWQiOiJjNDAzN2U4Yi04NjllLTRjMTItYWIyZi1lNDU5MzM2ZDgxZjciLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJTaWRkaWsiLCJicmFuY2hJZCI6MjEsImdyb3VwSWQiOjEsImlzcyI6Imh0dHA6Ly8xOTIuMTY4LjEwLjM2OjgwOTAiLCJmdWxsTmFtZSI6InNpZGRkaWsiLCJzZXNzaW9uSWQiOiJlMTc4NTQzNy1kMGNkLTQ4MjQtYTBhYS0wMGUxZDQ5MjI0ODYiLCJ1c2VyTmFtZSI6IlNpZGRpayIsInV1aWQiOiI4MzUyYjYyMi1lYWQ1LTQ0MjUtYWY0OS1lMjRlNWY3MWU0MTMiLCJvcmdJZCI6MSwiYXV0aG9yaXRpZXMiOltdLCJhdWQiOiJzYi1jbGllbnQiLCJuYmYiOjE3NjMwMDkwNTgsImlkIjoyLCJleHAiOjE3NjM4NzMwNTgsImlhdCI6MTc2MzAwOTA1OCwianRpIjoiYTMwYjRhMDMtY2ZkYi00MmQzLWI5ODMtMzIyNjgwZTMxNjI1In0.gsi8k8S8M6jKM3tIZZ84W9Cjcx7zAUGNfRoZurlUH63m1t9Uumjgwd_qiqKW9Qt5GmEK0XnOpxdBzRTEO0wbMZl1tQY_fIchbJGnTuylFvbDAHjRIVv9j-QIebmssH4sPLJJJ3ENKyIiUCKw38bkARH4PyjZCv31UJXnHFQodAg_x97WrnqSKC872i_KyEox5a7E6ECdHOv0LaC7-xuZ879tANaBWjuhmtlyNCqRLScu2kZ510PEPM5tCZ1wg6Ro6hLjc2ewM26X9LFXaGczkZy1eFT-M5kYV1ruL9cEp9zK1Lc6Rm6cfzl3TwzlppFHevyVFaw39dqD3ak4ELMMyQ')
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
