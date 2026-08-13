import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { SuccessOrErrorPopupService } from '../services/success-or-error-popup.service';
import { AuthenticationService } from '../services/authentication.service';
import { CacheService } from '../services/cache.service';

function extractMessage(err: HttpErrorResponse): string {
  if (typeof err?.error === 'string') return err.error;
  if (err?.error?.Message) return err.error.Message;
  if (err?.error?.message) return err.error.message;
  if (err?.message) return err.message;
  switch (err?.status) {
    case 0:
      return 'Network error. Please check your connection.';
    case 400:
      return 'Bad request. Please verify your input.';
    case 401:
      return 'Session expired. Please sign in again.';
    case 403:
      return 'You are not authorized to perform this action.';
    case 404:
      return 'Resource not found.';
    case 415:
      return 'Unsupported media type.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

/**
 * Demo-faithful HTTP error interceptor:
 * - Surfaces non-401 errors via SuccessOrErrorPopupService
 * - On 401, triggers logout + redirect to /login
 * - Handles body-level `Status === 'UNAUTH'` envelopes (demo pattern) —
 *   these come back as HTTP 200 with `Result: null` and indicate an invalid
 *   or expired token even when the transport succeeded
 * - Re-throws the error so callers can still handle it
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const popup = inject(SuccessOrErrorPopupService);
  const auth = inject(AuthenticationService);
  const cache = inject(CacheService);
  const router = inject(Router);

  return next(req).pipe(
    // Demo pattern: intercept UNAUTH envelopes BEFORE catchError so we can
    // log the user out cleanly when the API rejects our token.
    tap({
      next: (event: any) => {
        const body = event?.body ?? event;
        if (body && typeof body === 'object' && body.Status === 'UNAUTH') {
          cache.removeAll();
          auth.logout();
          router.navigate(['/login']);
        }
      },
    }),
    catchError((err: HttpErrorResponse) => {
      // First, check if a 401 actually wraps a UNAUTH envelope.
      const body = err?.error;
      if (body && typeof body === 'object' && body.Status === 'UNAUTH') {
        cache.removeAll();
        auth.logout();
        router.navigate(['/login']);
        return throwError(() => err);
      }
      if (err?.status === 401) {
        cache.removeAll();
        auth.logout();
        router.navigate(['/login']);
      } else if (err?.status !== 0) {
        // Skip noisy network errors when offline; let the caller decide
        const msg = extractMessage(err);
        if (msg) {
          popup.showSuccessOrErrorPopup('Error', msg, 'error');
        }
      }
      return throwError(() => err);
    }),
  );
};
