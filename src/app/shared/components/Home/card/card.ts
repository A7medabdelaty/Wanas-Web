import { ListingModel } from '../../../../core/models/listingModel';

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
