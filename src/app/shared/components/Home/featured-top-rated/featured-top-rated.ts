import { ListingService } from '../../../../core/services/listingService';

import { Component, OnInit } from '@angular/core';
import { Card } from "../card/card";
import { ListingModel } from '../../../../core/models/listingModel';

@Component({
  selector: 'app-featured-top-rated',
  imports: [Card],
  templateUrl: './featured-top-rated.html',
  styleUrl: './featured-top-rated.css',
})
export class FeaturedTopRated implements OnInit {
  listings!: ListingModel[];
  constructor(private listingService: ListingService) {
  }
  ngOnInit(): void {
    this.listingService.getTopSixListings().subscribe({
      next: (listings: ListingModel[]) => { this.listings = listings; },
      error: (err) => { console.log(err) }
    });

  }

}
