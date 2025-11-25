import { Routes } from '@angular/router';
import { OnboardingContainer } from './features/onboarding/onboarding-container/onboarding-container';
import { onboardingGuard } from './core/guards/onboarding-guard';
import { LoginComponent } from './features/auth/Pages/login/login';
import { authGuard } from './core/guards/auth-guard';
import { Home } from './shared/components/Home/home';

export const routes: Routes = [
    // Public Routes (No Authentication Required)
    {
        path: 'auth',
        children: [
            { path: 'login', component: LoginComponent },
            // Add other auth routes here (register, forgot-password, etc.)
            // { path: 'register', component: RegisterComponent },
        ],
    },

    // Onboarding Route (Requires Authentication Only)
    {
        path: 'onboarding',
        component: OnboardingContainer,
        canActivate: [authGuard],
    },

    // Main Application Routes (Requires Authentication + Completed Profile)
    {
        path: '', component: Home,
        // canActivate: [onboardingGuard],
        // children: [
        //   // Add your main app routes here
        //   { path: '', redirectTo: 'home', pathMatch: 'full' },
        //   // Example:
        //   // { path: 'home', component: HomeComponent },
        //   // { path: 'listings', component: ListingsComponent },
        //   // { path: 'profile', component: ProfileComponent },
        // ],
    },

    // Fallback Route
    { path: '**', redirectTo: '/' },
];