import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { UserRole } from '../../layout/appbar/user-role.enum';

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
    if (!user || (user.role !== UserRole.Admin)) {
        router.navigate(['/forbidden']);
        return false;
    }

    return true;
};
