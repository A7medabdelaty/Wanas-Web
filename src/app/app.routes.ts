import { ReportDetails } from './shared/components/adminDashboard/manageReports/report-details/report-details';
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
import { ListingMatch } from './shared/components/Matching/Listings/listing-match/listing-match';
import { ListingResolverService } from './shared/components/Matching/Services/listing-resolver-service';
import { ManageReports } from './shared/components/adminDashboard/manageReports/manageReports';
import { AdminDashboard } from './shared/components/adminDashboard/admin-dashboard';
import { Forbidden403 } from './shared/components/errors/forbidden-403/forbidden-403';
import { adminGuard } from './core/guards/admin-guard';
import { homeRedirectAdminGuard } from './core/guards/home-redirect-admin-guard';
import { BookingSelectionComponent } from './features/listings/pages/booking-selection/booking-selection';
import { PaymentPage } from './features/payments/pages/payment-page/payment-page';
import { ListingEdit } from './features/listings/pages/listing-edit/listing-edit';
import { MyListingsComponent } from './features/listings/pages/my-listings/my-listings.component';
import { OwnerReservationsComponent } from './features/reservations/pages/owner-reservations/owner-reservations';
import { MyReservationsComponent } from './features/reservations/pages/my-reservations/my-reservations';
import { PropertiesComponent } from './features/properties/properties.component';
import { ChatLayout } from './features/chat/chat-layout/chat-layout';
import { AdminPendingListingsComponent } from './features/admin/listings/pages/pending-listings/admin-pending-listings.component';
import { AdminReviewListingComponent } from './features/admin/listings/pages/review-listing/admin-review-listing.component';
import { AdminAnalyticsComponent } from './features/admin/analytics/pages/admin-analytics.component';
import { VerificationStatusComponent } from './features/verification/verification-status/verification-status';
import { VerificationUploadComponent } from './features/verification/verification-upload/verification-upload';
import { PendingVerificationsComponent } from './features/verification/pending-verifications/pending-verifications';
import { ReviewVerificationComponent } from './features/verification/review-verification/review-verification';
import { AccountBannedComponent } from './features/account-status/account-banned/account-banned';
import { AccountSuspendedComponent } from './features/account-status/account-suspended/account-suspended';
import { AccountStatusGuard } from './core/guards/account-status.guard';
import { MyAppealsComponent } from './features/appeals/my-appeals/my-appeals';
import { SubmitAppealComponent } from './features/appeals/submit-appeal/submit-appeal';

export const routes: Routes = [
  // Public Routes (No Authentication Required)
  { path: 'forbidden', component: Forbidden403 },
  { path: '', component: Home, canActivate: [homeRedirectAdminGuard], pathMatch: 'full' },
  { path: 'home', component: Home, canActivate: [homeRedirectAdminGuard] },
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
  // Account status routes (update this section)
  {
    path: 'account/banned',
    component: AccountBannedComponent,
    canActivate: [authGuard]
  },
  {
    path: 'account/suspended',
    component: AccountSuspendedComponent,
    canActivate: [authGuard]
  },
  {
    path: 'account/appeal',
    component: SubmitAppealComponent,
    canActivate: [authGuard]
  },
  {
    path: 'account/appeals',
    component: MyAppealsComponent,
    canActivate: [authGuard]
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
    canActivate: [onboardingGuard, AccountStatusGuard],
    children: [
      { path: 'rommatesMatching', component: RommatesMatching },
      { path: 'listingMatch', component: ListingMatch, resolve: { listings: ListingResolverService } },
      { path: 'profile', component: ProfileDetails },
      { path: 'profile/edit', component: UserProfileEdit },
      { path: 'profile/:id', component: ProfileDetails },
      { path: 'chat', component: ChatLayout },
      { path: 'messages', redirectTo: 'chat', pathMatch: 'full' },
      { path: 'search', component: SearchPageComponent },
      { path: 'listings/add', component: ListingAddComponent },
      { path: 'listings/my-listings', component: MyListingsComponent },
      { path: 'listings/:id/book', component: BookingSelectionComponent },
      { path: 'listings/:id', component: ListingDetails },
      { path: 'payment', component: PaymentPage },
      { path: 'listings/:id/edit', component: ListingEdit },
      { path: 'owner/requests', component: OwnerReservationsComponent },
      { path: 'renter/requests', component: MyReservationsComponent },
      { path: 'properties', component: PropertiesComponent },
      { path: 'verification/upload', component: VerificationUploadComponent },
      { path: 'verification/status', component: VerificationStatusComponent }
    ],
  },
  {
    path: 'admin',
    component: AdminDashboard,
    canActivate: [adminGuard],
    children: [
      { path: 'reports', component: ManageReports },
      { path: 'reportDetails/:id', component: ReportDetails },
      { path: 'listings/pending', component: AdminPendingListingsComponent },
      { path: 'listings/review/:id', component: AdminReviewListingComponent },
      { path: 'analytics', component: AdminAnalyticsComponent },
      { path: 'verification/pending', component: PendingVerificationsComponent },
      { path: 'verification/review', component: ReviewVerificationComponent }
    ]
  },

  // Fallback Route
  { path: '**', redirectTo: '/' },
];