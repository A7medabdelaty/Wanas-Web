import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Must be logged in
    if (!authService.isLoggedIn()) {
        router.navigate(['/auth/login']);
        return false;
    }

    const user = authService.getUserInfo();
    // Require role === 'Admin'
    if (!user || (user.role?.toLowerCase() !== 'admin')) {
        router.navigate(['/forbidden']);
        return false;
    }

    return true;
};
