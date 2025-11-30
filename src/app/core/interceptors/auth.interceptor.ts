import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, filter, switchMap, take, finalize } from 'rxjs/operators';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private auth: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    let authReq = req;
    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // don't try to refresh when calling refresh endpoint (avoid loop)
          if (req.url.includes('/auth/refresh') || req.url.includes('/auth')) {
            // force logout
            this.auth.logout();
            this.router.navigate(['/auth/login']);
            return throwError(() => error);
          }

          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshSubject.next(null);

      return this.auth.refreshToken().pipe(
        switchMap((res: any) => {
          const newToken = this.auth.getToken();
          this.refreshSubject.next(newToken);
          return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }));
        }),
        catchError(err => {
          // refresh failed -> force logout
          this.auth.logout();
          this.router.navigate(['/auth/login']);
          return throwError(() => err);
        }),
        finalize(() => {
          this.isRefreshing = false;
        })
      );
    } else {
      // wait until refresh finished
      return this.refreshSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          return next.handle(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
        })
      );
    }
  }
}
