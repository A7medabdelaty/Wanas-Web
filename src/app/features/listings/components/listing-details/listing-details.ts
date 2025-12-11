import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RatingPipe } from '../../../../shared/pipes/rating-pipe';
import { ListingDetailsDto } from '../../models/listing';

@Component({
  selector: 'app-listing-details-card',
  standalone: true,
  imports: [CommonModule, DatePipe, RatingPipe],
  templateUrl: './listing-details.html',
  styleUrl: './listing-details.css',
})
export class ListingDetails {
  @Input() listing!: ListingDetailsDto;
}
