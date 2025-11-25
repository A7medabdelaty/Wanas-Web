import { Routes } from '@angular/router';
import { OnboardingContainer } from './features/onboarding/onboarding-container/onboarding-container';
import { onboardingGuard } from './core/guards/onboarding-guard';

export const routes: Routes = [
    // Onboarding route - accessible without guard
    {
        path: 'onboarding',
        component: OnboardingContainer,
    },

    // Home route - protected by onboarding guard
    {
        path: '',
        canActivate: [onboardingGuard],
        children: [
            // Add your protected routes here
            // Example:
            // { path: '', component: HomeComponent },
        ],
    },
];
