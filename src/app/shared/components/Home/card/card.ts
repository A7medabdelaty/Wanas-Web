import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ListingModel } from '../../../../core/models/listingModel';
import { RatingPipe } from "../../../pipes/rating-pipe";

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [RouterModule, CommonModule, RatingPipe],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class Card {
  @Input() listing!: ListingModel;

  getSafeImageUrl(url: string | undefined | null): string {
    console.log(url);
    if (!url) {
      return '/assets/images/placeholder.jpg';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    const baseUrl = 'https://localhost:7279';
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${baseUrl}${path}`;
  }
}
