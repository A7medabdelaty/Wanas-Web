import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { UserRole } from '../../layout/appbar/user-role.enum';

// Allows anonymous and non-admin users to see Home.
// If a logged-in admin hits Home, redirect them to /adminDashboard.
export const homeRedirectAdminGuard = () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const isLoggedIn = auth.isLoggedIn();
    const user = auth.getUserInfo();

    if (isLoggedIn && user?.role === UserRole.Admin) {
        router.navigate(['/admin']);
        return false;
    }
    return true;
};
