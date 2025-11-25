import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const onboardingGuard = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userInfo = authService.getUserInfo();

    // If user is not authenticated, redirect to login
    if (!authService.isLoggedIn() || !userInfo) {
        router.navigate(['/auth/login']);
        return false;
    }

    // If profile is not completed, redirect to onboarding
    if (!userInfo.isProfileCompleted) {
        router.navigate(['/onboarding']);
        return false;
    }

    // User is authenticated and profile is completed
    return true;
};
