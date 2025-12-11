import { Component, Input } from '@angular/core';
import { MatchingResultInterface } from '../../../models/matching-result-interface';
import { AdminRoutingModule } from "../../../../../../features/admin/admin-routing-module";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-listing-Card',
  imports: [AdminRoutingModule, RouterLink],
  templateUrl: './listingCard.html',
  styleUrl: './listingCard.css',
})
export class ListingCard {
  @Input() listing!: MatchingResultInterface;

  getImageUrl(url?: string | null): string {
    if (!url) {
      return 'images/listings/placeholder-house.webp';
    }
    // If already absolute, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Ensure leading slash
    const path = url.startsWith('/') ? url : `/${url}`;
    // Use backend base similar to other components
    const baseUrl = 'https://localhost:7279';
    return `${baseUrl}${path}`;
  }
}
