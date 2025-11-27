import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // If we have a token, clone the request and add the Authorization header
    if (token) {
        console.log('Attaching token to request:', req.url);
        const clonedRequest = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(clonedRequest);
    } else {
        console.warn('No token found for request:', req.url);
    }

    // If no token, proceed with the original request
    return next(req);
};
