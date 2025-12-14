import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandlerFn,
    HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, throwError, finalize } from 'rxjs';
import { LoaderService } from '../../shared/services/loader.service';

export const authInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

    const loader = inject(LoaderService);

    // 👉 Show loader before request
    loader.show();

    const newReq = req.clone({
        headers: req.headers
            .set('Authorization', 'Bearer ' + sessionStorage.getItem('access_token'))
            .set('branchId', '1')
    });

    return next(newReq).pipe(
        catchError((error) => {
            return throwError(() => error);
        }),

        // 👉 Always hide loader (success or error)
        finalize(() => {
            loader.hide();
        })
    );
};
