import { Component, Input } from '@angular/core';
import { MatchingResultInterface } from '../../../models/matching-result-interface';

@Component({
  selector: 'app-listing-Card',
  imports: [],
  templateUrl: './listingCard.html',
  styleUrl: './listingCard.css',
})
export class ListingCard {
  @Input() listing!: MatchingResultInterface;
}
