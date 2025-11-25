import { Routes } from '@angular/router';
import { OnboardingContainer } from './features/onboarding/onboarding-container/onboarding-container';
import { onboardingGuard } from './core/guards/onboarding-guard';
import { LoginComponent } from './features/auth/Pages/login/login';
import { authGuard } from './core/guards/auth-guard';

import { ProfileDetails } from './features/profile/profile-details/profile-details';

export const routes: Routes = [
  // TEMPORARY: Public Test Route
  // { path: 'test-profile', component: ProfileDetails },

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
    path: '',
    canActivate: [onboardingGuard],
    children: [
      // Add your main app routes here
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'profile', component: ProfileDetails },
      // Example:
      // { path: 'home', component: HomeComponent },
      // { path: 'listings', component: ListingsComponent },
    ],
  },

  // Fallback Route
  { path: '**', redirectTo: '/' },
];