import { Routes } from '@angular/router';
import { OnboardingContainer } from './features/onboarding/onboarding-container/onboarding-container';
import { onboardingGuard } from './core/guards/onboarding-guard';
import { LoginComponent } from './features/auth/Pages/login/login';
import { authGuard } from './core/guards/auth-guard';
import { Home } from './shared/components/Home/home';

import { ProfileDetails } from './features/profile/profile-details/profile-details';
import { RegisterComponent } from './features/auth/Pages/register/register';
import { EmailConfirmationComponent } from './features/auth/Pages/email-confirmation/email-confirmation';
import { ForgotPasswordComponent } from './features/auth/Pages/forgot-password/forgot-password';
import { ResetPasswordComponent } from './features/auth/Pages/reset-password/reset-password';

export const routes: Routes = [
  // Public Routes (No Authentication Required)
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'emailConfirmation', component: EmailConfirmationComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'forgetPassword', component: ResetPasswordComponent }
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
      { path: 'home', component: Home },
      { path: 'profile', component: ProfileDetails },
      // Example:
      // { path: 'home', component: HomeComponent },
      // { path: 'listings', component: ListingsComponent },
    ],
  },

  // Fallback Route
  { path: '**', redirectTo: '/' },
];