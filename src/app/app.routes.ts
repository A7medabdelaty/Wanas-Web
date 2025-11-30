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
import { UserProfileEdit } from './features/profile/user-profile-edit/user-profile-edit';
import { RommatesMatching } from './shared/components/Matching/Rommates/rommates-matching/rommates-matching';
import { ListingAddComponent } from './features/listings/pages/listing-add/listing-add.component';
import { ListingDetails } from './features/listings/pages/listing-details/listing-details';
import { SearchPageComponent } from './features/listings/pages/search-page/search-page.component';

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
  }, { path: '', component: Home },

  // Main Application Routes (Requires Authentication + Completed Profile)
  {
    path: '',
    canActivate: [onboardingGuard],
    children: [
      // Add your main app routes here
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'rommatesMatching', component: RommatesMatching },
      { path: 'home', component: Home },
      { path: 'profile', component: ProfileDetails },
      { path: 'profile/edit', component: UserProfileEdit },
      {
        path: 'messages',
        loadChildren: () => import('./features/chat/chat-module').then(m => m.ChatModule)
      },
      // Example:
      // { path: 'listings', component: ListingsComponent },
      { path: 'search', component: SearchPageComponent },
      { path: 'listings/add', component: ListingAddComponent },
      { path: 'listings/:id', component: ListingDetails },
      // Alternative route without ID (for static demo)
      { path: 'listing-details', component: ListingDetails },
    ],
  },

  // Fallback Route
  { path: '**', redirectTo: '/' },
];