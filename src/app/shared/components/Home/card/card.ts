import { ListingModel } from '../../../../core/models/listingModel';

import { Component, Input } from '@angular/core';
import { AdminRoutingModule } from "../../../../features/admin/admin-routing-module";

@Component({
  selector: 'app-card',
  imports: [AdminRoutingModule],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() listing!: ListingModel;
}
