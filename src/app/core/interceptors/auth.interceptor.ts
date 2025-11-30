import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpEvent, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

// State for token refresh - shared across all invocations
let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Add auth token if available
  const token = authService.getToken();
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Don't try to refresh when calling auth endpoints (avoid loop)
        if (req.url.includes('/auth/refresh') || req.url.includes('/auth')) {
          // Force logout
          authService.logout();
          router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        return handle401Error(authReq, next, authService, router);
      }
      return throwError(() => error);
    })
  );
};

function handle401Error(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((res: any) => {
        const newToken = authService.getToken();
        refreshSubject.next(newToken);
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` }
        }));
      }),
      catchError(err => {
        // Refresh failed -> force logout
        authService.logout();
        router.navigate(['/auth/login']);
        return throwError(() => err);
      }),
      finalize(() => {
        isRefreshing = false;
      })
    );
  } else {
    // Wait until refresh finished
    return refreshSubject.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${token}` }
        }));
      })
    );
  }
}
