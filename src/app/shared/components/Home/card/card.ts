import { ListingModel } from '../../../../core/models/listingModel';
import { Listing } from '../../../../features/listings/services/listing';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() listing!: ListingModel;
}
