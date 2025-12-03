import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { SearchPageComponent } from './pages/search-page/search-page.component';
import { ListingAddComponent } from './pages/listing-add/listing-add.component';
import { ListingDetails } from './pages/listing-details/listing-details';
import { ListingEdit } from './pages/listing-edit/listing-edit';
import { MyListingsComponent } from './pages/my-listings/my-listings.component';
import { authGuard } from '../../core/guards/auth-guard';

const routes: Routes = [
  { path: '', component: SearchPageComponent },
  { path: 'search', component: SearchPageComponent },
  { path: 'add', component: ListingAddComponent, canActivate: [authGuard] },
  { path: 'my-listings', component: MyListingsComponent, canActivate: [authGuard] },
  { path: 'edit/:id', component: ListingEdit, canActivate: [authGuard] },
  { path: ':id', component: ListingDetails }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ListingsRoutingModule { }
