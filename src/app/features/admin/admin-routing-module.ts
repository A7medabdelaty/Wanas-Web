import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminPendingListingsComponent } from './listings/pages/pending-listings/admin-pending-listings.component';
import { AdminReviewListingComponent } from './listings/pages/review-listing/admin-review-listing.component';
import { authGuard } from '../../core/guards/auth-guard';

const routes: Routes = [
  { path: 'listings/pending', component: AdminPendingListingsComponent, canActivate: [authGuard] },
  { path: 'listings/review/:id', component: AdminReviewListingComponent, canActivate: [authGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
