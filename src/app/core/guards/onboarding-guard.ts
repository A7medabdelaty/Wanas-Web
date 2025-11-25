import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '../../features/onboarding/services/onboarding.service';

export const onboardingGuard = () => {
    const router = inject(Router);
    const onboardingService = inject(OnboardingService);

    // If profile is not completed, redirect to onboarding
    if (!onboardingService.isProfileCompleted()) {
        router.navigate(['/onboarding']);
        return false;
    }

    return true;
};
