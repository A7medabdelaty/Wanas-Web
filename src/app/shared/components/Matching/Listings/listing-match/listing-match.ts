import { Component, OnInit } from '@angular/core';
import { MatchingResultInterface } from '../../models/matching-result-interface';
import { ListingService } from '../../Services/listing-service';
import { ActivatedRoute, Data } from '@angular/router';
import { ListingCard } from "./listingCard/listingCard";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-listing-match',
  imports: [ListingCard,CommonModule],
  templateUrl: './listing-match.html',
  styleUrl: './listing-match.css',
})
export class ListingMatch implements OnInit {
  listings!: MatchingResultInterface[];
  isLoading: boolean = true;
  hasError: boolean = false;

  constructor(private listingService: ListingService, private activatedRoute: ActivatedRoute) { }
  ngOnInit(): void {
    this.activatedRoute.data.subscribe((data: Data) => {
      if (data['listings']) {
        this.listings = data['listings'];
        this.isLoading = false;
      } else {
        this.loadListings();
      }
    });
  }


  loadListings() {
    this.hasError = true;
    // Temporary simulation for UI development:
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getScoreColor(score: number): string {
    if (score >= 90) return 'success'; // Green
    if (score >= 70) return 'warning'; // Yellow
    return 'danger'; // Red
  }

}
