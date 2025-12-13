import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
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
  @Input() averageRating: number = 0;
  @Output() reportListing = new EventEmitter<void>();

  onReport() {
    this.reportListing.emit();
  }

  constructor(private router: Router) { }

  onTenantClick(tenantId: string) {
    this.router.navigate(['/profile', tenantId]);
  }
}
