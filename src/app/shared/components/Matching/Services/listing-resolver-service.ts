import { Injectable, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, MaybeAsync, RedirectCommand, Resolve, RouterStateSnapshot } from '@angular/router';
import { MatchingResultInterface } from '../models/matching-result-interface';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/services/auth';
import { ListingService } from './listing-service';

@Injectable({
  providedIn: 'root',
})
export class ListingResolverService implements Resolve<MatchingResultInterface[]> {
  constructor(private authService: AuthService, private listingService: ListingService) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot)
    : MatchingResultInterface[] | Observable<MatchingResultInterface[]> | Promise<MatchingResultInterface[]> {
    const userId = this.authService.getUserInfo()?.id;
    return this.listingService.getListings(userId)
  }

}
