import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Token expired or invalid
                console.warn('Unauthorized request - redirecting to login');
                authService.logout(); // Clear local storage
                router.navigate(['/auth/login'], { queryParams: { returnUrl: router.url } });
            }
            return throwError(() => error);
        })
    );
};
